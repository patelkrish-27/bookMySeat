package com.example.bookmyseat.repository;

import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, UUID> {
    // Allows users to filter theaters by their city
    List<Theater> findByCity(String city);
}
