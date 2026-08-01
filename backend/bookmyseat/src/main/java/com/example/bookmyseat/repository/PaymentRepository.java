package com.example.bookmyseat.repository;

import com.example.bookmyseat.entity.*;
import com.example.bookmyseat.enums.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    // INTERVIEW WOW FACTOR: Idempotency
    // This allows the Payment Service to check if a request with the same unique key
    // has already been processed, preventing double-charging on network retries.
    Optional<Payment> findByIdempotencyKey(UUID idempotencyKey);
}
