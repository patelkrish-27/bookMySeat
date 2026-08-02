package com.example.bookmyseat.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTOs for the /api/v1/bookings endpoints.
 * All inner classes are static to avoid requiring an outer-class instance.
 */
public class BookingDtos {

    // ── POST /tentative — request ─────────────────────────────────────────────

    @Getter
    @Setter
    public static class TentativeBookingRequest {
        /** The show the user is booking tickets for. */
        private UUID showId;

        /**
         * The show_seat IDs (not raw seat IDs) the user selected.
         * These come directly from the seat-layout API response.
         */
        private List<UUID> showSeatIds;
    }

    // ── POST /tentative — response ────────────────────────────────────────────

    @Getter
    @Builder
    public static class TentativeBookingResponse {
        private UUID bookingId;
        private BigDecimal totalAmount;
        /**
         * ISO-8601 timestamp: now + 8 minutes.
         * The frontend countdown timer counts down to this.
         * If the booking isn't paid by this time the Redis locks expire and
         * the seats return to AVAILABLE automatically.
         */
        private LocalDateTime expiresAt;
    }

    // ── GET /{bookingId} — full booking detail ────────────────────────────────

    @Getter
    @Builder
    public static class BookingDetailResponse {
        private UUID bookingId;
        private String status;          // PENDING / CONFIRMED / CANCELLED
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;

        // Movie info
        private String movieTitle;
        private String posterUrl;

        // Show info
        private LocalDateTime showStartTime;
        private LocalDateTime showEndTime;

        // Theater / screen info
        private String theaterName;
        private String theaterCity;
        private String theaterAddress;
        private String screenName;

        // Seats
        private List<SeatDetail> seats;
    }

    @Getter
    @Builder
    public static class SeatDetail {
        private UUID showSeatId;
        private String seatRow;
        private int seatNumber;
        private String seatType;    // REGULAR / PREMIUM / RECLINER
        private BigDecimal price;
    }

    // ── GET /my-bookings — response ───────────────────────────────────────────

    @Getter
    @Builder
    public static class MyBookingsResponse {
        private List<BookingSummary> upcoming;
        private List<BookingSummary> past;
    }

    @Getter
    @Builder
    public static class BookingSummary {
        private UUID bookingId;
        private String status;
        private BigDecimal totalAmount;
        private LocalDateTime createdAt;

        private String movieTitle;
        private String posterUrl;

        private LocalDateTime showStartTime;

        private String theaterName;
        private String theaterCity;
        private String screenName;

        /** Compact seat list like ["A1", "A2"] for display. */
        private List<String> seatLabels;
    }
}
