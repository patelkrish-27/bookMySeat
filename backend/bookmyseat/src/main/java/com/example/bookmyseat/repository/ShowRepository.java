package com.example.bookmyseat.repository;

import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ShowRepository extends JpaRepository<Show, UUID> {
    // Fetch all shows for a specific movie (e.g., user clicks on "Inception")
    List<Show> findByMovieId(UUID movieId);
    
    List<Show> findByScreenId(UUID screenId);
    
    // Fetch shows in a specific screen for a given time range
    List<Show> findByScreenIdAndStartTimeBetween(UUID screenId, LocalDateTime start, LocalDateTime end);
}
