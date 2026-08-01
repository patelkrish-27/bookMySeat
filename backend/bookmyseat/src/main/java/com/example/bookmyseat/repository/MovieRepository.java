package com.example.bookmyseat.repository;

import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {
    // Useful for the Search Service to show movies currently playing or upcoming
    List<Movie> findByReleaseDateGreaterThanEqual(LocalDate date);
}
