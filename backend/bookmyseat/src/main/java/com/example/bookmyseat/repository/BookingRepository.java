package com.example.bookmyseat.repository;

import com.example.bookmyseat.entity.Booking;
import com.example.bookmyseat.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    // ── History page: all bookings for a user, newest first ──────────────────
    // Eager-fetches show → screen → theater → movie in one JPQL query to avoid
    // N+1 when building the response DTO.
    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.show s
            JOIN FETCH s.screen sc
            JOIN FETCH sc.theater t
            JOIN FETCH s.movie m
            WHERE b.user.id = :userId
            ORDER BY b.createdAt DESC
            """)
    List<Booking> findByUserWithShow(@Param("userId") UUID userId);

    // ── Simple lookup (kept for places that don't need the full graph) ────────
    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // ── Full detail fetch for /bookings/{id} — eager-load everything ─────────
    @Query("""
            SELECT DISTINCT b FROM Booking b
            JOIN FETCH b.user u
            JOIN FETCH b.show s
            JOIN FETCH s.screen sc
            JOIN FETCH sc.theater t
            JOIN FETCH s.movie m
            JOIN FETCH b.seats ss
            JOIN FETCH ss.seat seat
            WHERE b.id = :id
            """)
    Optional<Booking> findByIdWithDetails(@Param("id") UUID id);

    // ── Expired locks: find PENDING bookings whose lock window has elapsed,
    //    with seats eager-fetched so the scheduler can bulk-release them. ──
    @Query("""
            SELECT b FROM Booking b
            JOIN FETCH b.seats
            WHERE b.status = :status
            AND b.createdAt < :cutoff
            """)
    List<Booking> findExpiredByStatusAndCreatedAtBefore(
            @Param("status") BookingStatus status,
            @Param("cutoff") LocalDateTime cutoff);

    // ── Admin: find bookings for a specific show (to check if show can be modified/deleted) ──
    List<Booking> findByShowId(UUID showId);
}
