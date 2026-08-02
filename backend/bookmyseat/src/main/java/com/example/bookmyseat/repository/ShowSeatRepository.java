package com.example.bookmyseat.repository;

import com.example.bookmyseat.dto.ShowSeatDto;
import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShowSeatRepository extends JpaRepository<ShowSeat, UUID> {
    // Fetch all seats for a specific showtime to render the UI seating chart
    List<ShowSeat> findByShowId(UUID showId);

    // Fetch only available seats for a show
    List<ShowSeat> findByShowIdAndStatus(UUID showId, SeatStatus status);

    // Fetch specific seats a user is trying to book
    List<ShowSeat> findByShowIdAndSeatIdIn(UUID showId, List<UUID> seatIds);

    // INTERVIEW TALKING POINT: Pessimistic Locking
    // Even though we use Redis for tentative holds, using a DB-level Pessimistic
    // Write Lock
    // during the final payment confirmation ensures absolute ACID integrity.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ss FROM ShowSeat ss WHERE ss.id IN :ids")
    List<ShowSeat> findByIdsWithPessimisticLock(@Param("ids") List<UUID> ids);

    @Query("""
            SELECT new com.example.bookmyseat.dto.ShowSeatDto(
                ss.id,
                s.seatRow,
                s.seatNumber,
                s.seatType,
                ss.price,
                ss.status
            )
            FROM ShowSeat ss
            JOIN ss.seat s
            WHERE ss.show.id = :showId
            """)
    List<ShowSeatDto> getSeatLayout(UUID showId);

    // ── Admin: delete all ShowSeats for a show (when deleting/modifying a show) ──
    @Modifying
    @Query("DELETE FROM ShowSeat ss WHERE ss.show.id = :showId")
    void deleteAllByShow_Id(@Param("showId") UUID showId);
}
