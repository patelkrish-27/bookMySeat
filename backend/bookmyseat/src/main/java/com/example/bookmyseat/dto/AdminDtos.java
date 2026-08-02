package com.example.bookmyseat.dto;

import com.example.bookmyseat.enums.SeatType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class AdminDtos {

    // ── SEAT PRICING DEFAULTS ──────────────────────────────────────────────────

    public static class SeatPricing {
        public static final BigDecimal REGULAR_PRICE = new BigDecimal("150.00");
        public static final BigDecimal PREMIUM_PRICE = new BigDecimal("250.00");
        public static final BigDecimal RECLINER_PRICE = new BigDecimal("400.00");

        public static BigDecimal priceFor(SeatType type) {
            return switch (type) {
                case PREMIUM -> PREMIUM_PRICE;
                case RECLINER -> RECLINER_PRICE;
                default -> REGULAR_PRICE;
            };
        }
    }

    // ── MOVIE ────────────────────────────────────────────────────────────────────

    @Getter @Setter
    public static class MovieCreateRequest {
        private String title;
        private String description;
        private Integer durationMins;
        private String language;
        private LocalDate releaseDate;
        private String posterUrl;
        private String backdropUrl;
    }

    @Getter @Setter
    public static class MovieUpdateRequest {
        private String title;
        private String description;
        private Integer durationMins;
        private String language;
        private LocalDate releaseDate;
        private String posterUrl;
        private String backdropUrl;
    }

    @Getter @Builder
    public static class MovieResponse {
        private UUID id;
        private String title;
        private String description;
        private Integer durationMins;
        private String language;
        private LocalDate releaseDate;
        private String posterUrl;
        private String backdropUrl;
    }

    // ── THEATER ─────────────────────────────────────────────────────────────────

    @Getter @Setter
    public static class TheaterCreateRequest {
        private String name;
        private String city;
        private String address;
        private Integer totalScreens;
    }

    @Getter @Setter
    public static class TheaterUpdateRequest {
        private String name;
        private String city;
        private String address;
        private Integer totalScreens;
    }

    @Getter @Builder
    public static class TheaterResponse {
        private UUID id;
        private String name;
        private String city;
        private String address;
        private Integer totalScreens;
    }

    // ── SCREEN + SEAT MAP ───────────────────────────────────────────────────────

    /** A single seat definition inside a seat-map row set. */
    @Getter @Setter
    public static class SeatMapEntry {
        private String seatRow;
        private Integer seatNumber;
        private SeatType seatType;
    }

    @Getter @Setter
    public static class ScreenCreateRequest {
        private UUID theaterId;
        private String name;
        private List<SeatMapEntry> seats;
    }

    @Getter @Setter
    public static class ScreenUpdateRequest {
        private String name;
    }

    @Getter @Builder
    public static class ScreenResponse {
        private UUID id;
        private UUID theaterId;
        private String theaterName;
        private String name;
        private Integer totalSeats;
        private List<SeatMapEntry> seats;
    }

    // ── SHOW ───────────────────────────────────────────────────────────────────

    @Getter @Setter
    public static class ShowCreateRequest {
        private UUID movieId;
        private UUID screenId;
        private LocalDateTime startTime;
    }

    @Getter @Setter
    public static class ShowUpdateRequest {
        private UUID movieId;
        private UUID screenId;
        private LocalDateTime startTime;
    }

    @Getter @Builder
    public static class ShowResponse {
        private UUID id;
        private UUID movieId;
        private String movieTitle;
        private UUID screenId;
        private String screenName;
        private UUID theaterId;
        private String theaterName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
    }

    @Getter @Builder
    public static class ShowSeatAdminResponse {
        private UUID showSeatId;
        private UUID seatId;
        private String seatRow;
        private Integer seatNumber;
        private SeatType seatType;
        private BigDecimal price;
        private String status;
    }

    // ── GENERIC ────────────────────────────────────────────────────────────────

    @Getter @Builder
    public static class MessageResponse {
        private String message;
    }
}
