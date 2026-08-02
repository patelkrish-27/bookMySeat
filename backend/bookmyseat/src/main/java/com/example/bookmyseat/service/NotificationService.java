package com.example.bookmyseat.service;

import com.example.bookmyseat.auth.EmailService;
import com.example.bookmyseat.auth.EmailService.SeatEmailEntry;
import com.example.bookmyseat.entity.Booking;
import com.example.bookmyseat.entity.Screen;
import com.example.bookmyseat.entity.Show;
import com.example.bookmyseat.entity.Theater;
import com.example.bookmyseat.event.BookingConfirmedEvent;
import com.example.bookmyseat.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Handles non-critical booking notifications outside the payment request. */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEE, d MMM yyyy", Locale.ENGLISH);
    private static final DateTimeFormatter TIME_FMT =
            DateTimeFormatter.ofPattern("hh:mm a", Locale.ENGLISH);

    private final BookingRepository bookingRepository;
    private final EmailService emailService;

    /**
     * Runs only after the payment transaction commits and on an executor thread,
     * so a slow SMTP server cannot delay the successful payment response.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendBookingConfirmation(BookingConfirmedEvent event) {
        try {
            Booking booking = bookingRepository.findByIdWithDetails(event.bookingId())
                    .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + event.bookingId()));
            Show show = booking.getShow();
            Screen screen = show.getScreen();
            Theater theater = screen.getTheater();
            var seats = booking.getSeats().stream()
                    .map(ss -> new SeatEmailEntry(
                            ss.getSeat().getSeatRow() + ss.getSeat().getSeatNumber(),
                            ss.getSeat().getSeatType().name()))
                    .toList();

            emailService.sendBookingConfirmation(
                    booking.getUser().getEmail(), booking.getUser().getName(), booking.getId().toString(),
                    show.getMovie().getTitle(), show.getMovie().getPosterUrl(), theater.getName(),
                    theater.getCity(), theater.getAddress(), screen.getName(),
                    show.getStartTime().format(DATE_FMT), show.getStartTime().format(TIME_FMT),
                    seats, booking.getTotalAmount());
        } catch (Exception ex) {
            // A notification must never affect an already-confirmed payment.
            log.error("Could not send confirmation notification for booking {}", event.bookingId(), ex);
        }
    }
}
