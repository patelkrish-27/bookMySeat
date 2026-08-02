package com.example.bookmyseat.auth;

import com.example.bookmyseat.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
