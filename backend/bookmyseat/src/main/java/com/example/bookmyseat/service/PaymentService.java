package com.example.bookmyseat.service;

import com.example.bookmyseat.dto.PaymentDtos.*;
import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.BookingStatus;
import com.example.bookmyseat.enums.PaymentStatus;
import com.example.bookmyseat.enums.SeatStatus;
import com.example.bookmyseat.event.BookingConfirmedEvent;
import com.example.bookmyseat.exception.InvalidPaymentException;
import com.example.bookmyseat.repository.BookingRepository;
import com.example.bookmyseat.repository.PaymentRepository;
import com.example.bookmyseat.repository.ShowSeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Handles Razorpay order creation and payment confirmation.
 *
 * INTERVIEW TALKING POINT — two layers of concurrency protection:
 *  1. Redis lock (createTentativeBooking) — fast, TTL-based, stops double-selection.
 *  2. DB pessimistic write lock (confirmPayment) — absolute ACID guarantee at
 *     commit time, handles edge cases like a lock expiring just as payment fires.
 *
 * A confirmed payment publishes an event that triggers notification work after
 * commit, so the API response is never held up by SMTP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ShowSeatRepository showSeatRepository;
    private final RazorpayService razorpayService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ApplicationEventPublisher eventPublisher;

    private static final String CURRENCY = "INR";

    // ── createOrder ───────────────────────────────────────────────────────────

    @Transactional
    public CreateOrderResponse createOrder(CreateOrderRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidPaymentException(
                    "Booking is not in a payable state (status: " + booking.getStatus() + ")");
        }

        long amountInPaise = booking.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValueExact();

        String razorpayOrderId = razorpayService.createOrder(
                amountInPaise, CURRENCY, booking.getId().toString());

        return CreateOrderResponse.builder()
                .razorpayOrderId(razorpayOrderId)
                .razorpayKeyId(razorpayService.getPublicKeyId())
                .amountInPaise(amountInPaise)
                .currency(CURRENCY)
                .bookingId(booking.getId())
                .build();
    }

    // ── confirmPayment ────────────────────────────────────────────────────────

    /**
     * Verifies the Razorpay signature server-side and either confirms or cancels
     * the booking. Fully idempotent — replays with the same Idempotency-Key return
     * the stored result without re-processing.
     *
     * All DB mutations run inside this @Transactional block.
     * The confirmation event is handled after commit on an async executor, so
     * SMTP latency never affects the API response time.
     */
    @Transactional
    public PaymentConfirmationResponse confirmPayment(
            ConfirmPaymentRequest request, UUID idempotencyKey) {

        // ── 1. Idempotency: return stored result if this key was already processed ──
        var existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            Payment existingPayment = existing.get();
            return PaymentConfirmationResponse.builder()
                    .bookingId(existingPayment.getBooking().getId())
                    .status(existingPayment.getPaymentStatus().name())
                    .message("Already processed (idempotent replay)")
                    .build();
        }

        // ── 2. Verify booking state ───────────────────────────────────────────
        Booking booking = bookingRepository.findByIdWithDetails(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidPaymentException(
                    "Booking is not in a payable state (status: " + booking.getStatus() + ")");
        }

        // ── 3. DB-level pessimistic write lock on the seats ───────────────────
        List<UUID> showSeatIds = booking.getSeats().stream()
                .map(ShowSeat::getId)
                .toList();
        List<ShowSeat> showSeats = showSeatRepository.findByIdsWithPessimisticLock(showSeatIds);

        // ── 4. Signature verification ─────────────────────────────────────────
        boolean isValid = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .paymentMethod("RAZORPAY")
                .transactionId(request.getRazorpayPaymentId())
                .idempotencyKey(idempotencyKey)
                .build();

        if (!isValid) {
            // ── Failure path ──────────────────────────────────────────────────
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);

            releaseSeatsAndLocks(showSeats);

            return PaymentConfirmationResponse.builder()
                    .bookingId(booking.getId())
                    .status("FAILED")
                    .message("Payment signature verification failed. Seats have been released.")
                    .build();
        }

        // ── Success path ──────────────────────────────────────────────────────
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        showSeats.forEach(seat -> seat.setStatus(SeatStatus.BOOKED));
        showSeatRepository.saveAll(showSeats);

        // Release Redis locks immediately — don't wait for TTL expiry
        showSeats.forEach(seat ->
                redisTemplate.delete("seat:lock:" + seat.getId()));

        // ── Send confirmation email (async — does not block this response) ────
        eventPublisher.publishEvent(new BookingConfirmedEvent(booking.getId()));

        return PaymentConfirmationResponse.builder()
                .bookingId(booking.getId())
                .status("CONFIRMED")
                .message("Payment successful. Enjoy the show!")
                .build();
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private void releaseSeatsAndLocks(List<ShowSeat> showSeats) {
        showSeats.forEach(seat -> seat.setStatus(SeatStatus.AVAILABLE));
        showSeatRepository.saveAll(showSeats);
        showSeats.forEach(seat ->
                redisTemplate.delete("seat:lock:" + seat.getId()));
    }

    /**
     * Builds the parameters for the booking-confirmation email and hands off to
     * {@link EmailService#sendBookingConfirmation} which is {@code @Async}.
     * All entity data must be read here (inside the transaction) before the
     * method returns — the async task cannot safely touch lazy proxies after
     * the transaction has committed.
     */
}
