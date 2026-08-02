package com.example.bookmyseat.service;

import com.example.bookmyseat.dto.BookingDtos.*;
import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.BookingStatus;
import com.example.bookmyseat.enums.SeatStatus;
import com.example.bookmyseat.exception.SeatAlreadyLockedException;
import com.example.bookmyseat.repository.BookingRepository;
import com.example.bookmyseat.repository.ShowRepository;
import com.example.bookmyseat.repository.ShowSeatRepository;
import com.example.bookmyseat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ShowSeatRepository showSeatRepository;
    private final ShowRepository showRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;

    private static final Duration LOCK_TTL = Duration.ofMinutes(8);

    // ── Seat-lock key helper ──────────────────────────────────────────────────

    private static String lockKey(UUID showSeatId) {
        return "seat:lock:" + showSeatId;
    }

    // ── createTentativeBooking ────────────────────────────────────────────────

    /**
     * Atomically locks all requested seats in Redis, marks them LOCKED in the DB,
     * and creates a PENDING Booking. All-or-nothing: if any seat is already locked
     * by another user, every lock acquired so far is released and
     * SeatAlreadyLockedException is thrown.
     */
    @Transactional
    public TentativeBookingResponse createTentativeBooking(UUID userId, UUID showId, List<UUID> showSeatIds) {

        // 1. Attempt Redis locks one-by-one; track which ones WE acquired so we
        //    can roll them back if a later seat fails.
        List<UUID> acquiredLocks = new ArrayList<>();
        for (UUID showSeatId : showSeatIds) {
            Boolean locked = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey(showSeatId), "LOCKED", LOCK_TTL);

            if (Boolean.TRUE.equals(locked)) {
                acquiredLocks.add(showSeatId);
            } else {
                // This seat is held by someone else — release every lock we just acquired
                acquiredLocks.forEach(id -> redisTemplate.delete(lockKey(id)));
                throw new SeatAlreadyLockedException(
                        "One or more seats are already held by another user. Please refresh and reselect.");
            }
        }

        // 2. Fetch the ShowSeat entities and mark them LOCKED in the DB.
        List<ShowSeat> showSeats = showSeatRepository.findAllById(showSeatIds);
        showSeats.forEach(ss -> ss.setStatus(SeatStatus.LOCKED));
        showSeatRepository.saveAll(showSeats);

        // 3. Calculate total from actual seat prices.
        BigDecimal total = showSeats.stream()
                .map(ShowSeat::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 4. Fetch user and show references.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Show show = showRepository.findById(showId)
                .orElseThrow(() -> new IllegalArgumentException("Show not found"));

        // 5. Create the Booking with the PENDING status and the seat join-table entries.
        Booking booking = Booking.builder()
                .user(user)
                .show(show)
                .totalAmount(total)
                .status(BookingStatus.PENDING)
                .seats(showSeats)
                .build();
        booking = bookingRepository.save(booking);

        LocalDateTime expiresAt = LocalDateTime.now().plus(LOCK_TTL);

        return TentativeBookingResponse.builder()
                .bookingId(booking.getId())
                .totalAmount(total)
                .expiresAt(expiresAt)
                .build();
    }

    // ── getBookingDetail ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BookingDetailResponse getBookingDetail(UUID bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        Show show = booking.getShow();
        Screen screen = show.getScreen();
        Theater theater = screen.getTheater();
        Movie movie = show.getMovie();

        List<SeatDetail> seatDetails = booking.getSeats().stream()
                .map(ss -> SeatDetail.builder()
                        .showSeatId(ss.getId())
                        .seatRow(ss.getSeat().getSeatRow())
                        .seatNumber(ss.getSeat().getSeatNumber())
                        .seatType(ss.getSeat().getSeatType().name())
                        .price(ss.getPrice())
                        .build())
                .toList();

        return BookingDetailResponse.builder()
                .bookingId(booking.getId())
                .status(booking.getStatus().name())
                .totalAmount(booking.getTotalAmount())
                .createdAt(booking.getCreatedAt())
                .movieTitle(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .showStartTime(show.getStartTime())
                .showEndTime(show.getEndTime())
                .theaterName(theater.getName())
                .theaterCity(theater.getCity())
                .theaterAddress(theater.getAddress())
                .screenName(screen.getName())
                .seats(seatDetails)
                .build();
    }

    // ── getMyBookings ─────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MyBookingsResponse getMyBookings(UUID userId) {
        List<Booking> all = bookingRepository.findByUserWithShow(userId);
        LocalDateTime now = LocalDateTime.now();

        List<BookingSummary> upcoming = new ArrayList<>();
        List<BookingSummary> past = new ArrayList<>();

        for (Booking b : all) {
            // Skip cancelled bookings from the listing unless you want to show them
            if (b.getStatus() == BookingStatus.CANCELLED) continue;

            Show show = b.getShow();
            Screen screen = show.getScreen();
            Theater theater = screen.getTheater();
            Movie movie = show.getMovie();

            // Seat labels need the seat entity — may not be eagerly loaded in this query
            // so we just load them lazily here; for a list of many bookings you'd want
            // to batch this, but it's acceptable for a typical user history page.
            List<String> labels = b.getSeats().stream()
                    .map(ss -> ss.getSeat().getSeatRow() + ss.getSeat().getSeatNumber())
                    .toList();

            BookingSummary summary = BookingSummary.builder()
                    .bookingId(b.getId())
                    .status(b.getStatus().name())
                    .totalAmount(b.getTotalAmount())
                    .createdAt(b.getCreatedAt())
                    .movieTitle(movie.getTitle())
                    .posterUrl(movie.getPosterUrl())
                    .showStartTime(show.getStartTime())
                    .theaterName(theater.getName())
                    .theaterCity(theater.getCity())
                    .screenName(screen.getName())
                    .seatLabels(labels)
                    .build();

            if (show.getStartTime().isAfter(now)) {
                upcoming.add(summary);
            } else {
                past.add(summary);
            }
        }

        return MyBookingsResponse.builder()
                .upcoming(upcoming)
                .past(past)
                .build();
    }

    // ── Scheduled cleanup ───────────────────────────────────────────────────────
    //
    // When a user abandons the checkout page (card declined, browser closed,
    // network dropped, etc.) the Redis lock expires but the DB never gets updated
    // — the ShowSeat rows stay LOCKED forever and the seat appears "sold" to
    // everyone. This job runs every minute, finds PENDING bookings whose 8-minute
    // window has elapsed, and releases every seat back to AVAILABLE.
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void releaseExpiredSeatLocks() {
        LocalDateTime cutoff = LocalDateTime.now().minus(LOCK_TTL);

        List<Booking> expired = bookingRepository
                .findExpiredByStatusAndCreatedAtBefore(BookingStatus.PENDING, cutoff);

        if (expired.isEmpty()) {
            return;
        }

        int releasedSeats = 0;
        for (Booking booking : expired) {
            List<ShowSeat> seats = booking.getSeats();

            seats.forEach(seat -> seat.setStatus(SeatStatus.AVAILABLE));
            showSeatRepository.saveAll(seats);
            releasedSeats += seats.size();

            booking.setStatus(BookingStatus.CANCELLED);

            // Best-effort: delete Redis keys that already expired via TTL.
            seats.forEach(seat -> redisTemplate.delete(lockKey(seat.getId())));
        }
        bookingRepository.saveAll(expired);

        log.info("Seat-lock cleanup: released {} seats across {} expired PENDING bookings",
                releasedSeats, expired.size());
    }
}
