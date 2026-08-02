package com.example.bookmyseat.controller;

import com.example.bookmyseat.dto.BookingDtos.*;
import com.example.bookmyseat.entity.User;
import com.example.bookmyseat.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST endpoints for bookings.
 *
 * All endpoints require a valid JWT (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * POST /api/v1/bookings/tentative
     *
     * Creates a PENDING booking with Redis seat-locks.
     * Returns bookingId, totalAmount, and expiresAt (now + 8 min) so the
     * frontend countdown timer doesn't need to guess.
     *
     * 409 if any seat is already locked by another session.
     */
    @PostMapping("/tentative")
    public ResponseEntity<TentativeBookingResponse> createTentative(
            @RequestBody TentativeBookingRequest request,
            @AuthenticationPrincipal User principal
    ) {
        TentativeBookingResponse response = bookingService.createTentativeBooking(
                principal.getId(),
                request.getShowId(),
                request.getShowSeatIds()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/bookings/{bookingId}
     *
     * Returns full booking detail including seats, show, theater, and movie info.
     * Used by the ConfirmationPage after successful payment.
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingDetailResponse> getBooking(
            @PathVariable UUID bookingId
    ) {
        return ResponseEntity.ok(bookingService.getBookingDetail(bookingId));
    }

    /**
     * GET /api/v1/bookings/my-bookings
     *
     * Returns all bookings for the authenticated user, split into upcoming and past
     * by show start_time. Used by HistoryPage and ProfilePage.
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<MyBookingsResponse> getMyBookings(
            @AuthenticationPrincipal User principal
    ) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getId()));
    }
}
