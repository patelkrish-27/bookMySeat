package com.example.bookmyseat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores the OTP issued for email verification.
 * One active row per user; regenerated on resend (old one is deleted first).
 */
@Entity
@Table(name = "email_verification_tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private Instant expiresAt;

    @Column(nullable = false)
    private int attemptCount; // rate-limits wrong OTP guesses
}
