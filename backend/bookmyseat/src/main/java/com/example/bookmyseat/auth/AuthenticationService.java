package com.example.bookmyseat.auth;

import com.example.bookmyseat.auth.AuthDtos.*;
import com.example.bookmyseat.entity.EmailVerificationToken;
import com.example.bookmyseat.entity.User;
import com.example.bookmyseat.repository.UserRepository;
import com.example.bookmyseat.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private static final int OTP_VALID_MINUTES = 10;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("USER") // never trust a client-supplied role on public signup
                .emailVerified(false)
                .build();

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Handles race condition where two requests register the same email concurrently
            throw new IllegalArgumentException("Email already registered");
        }

        issueAndSendOtp(user);

        return MessageResponse.builder()
                .message("Registered. Check your email for the verification code.")
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account with this email"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email already verified. Please log in.");
        }

        EmailVerificationToken token = tokenRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("No verification code found. Please request a new one."));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Code expired. Please request a new one.");
        }

        if (token.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            throw new IllegalArgumentException("Too many incorrect attempts. Please request a new code.");
        }

        if (!token.getOtp().equals(request.getOtp())) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            tokenRepository.save(token);
            throw new IllegalArgumentException("Incorrect code");
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId());

        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public MessageResponse resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account with this email"));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("Email already verified. Please log in.");
        }

        issueAndSendOtp(user);
        return MessageResponse.builder().message("A new code has been sent to your email.").build();
    }

    public AuthResponse login(LoginRequest request) {
        // Delegates credential checking to Spring Security's AuthenticationManager,
        // which internally uses SecurityConfig's UserDetailsService + PasswordEncoder.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email before logging in");
        }

        String jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .tokenType("Bearer")
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    private void issueAndSendOtp(User user) {
        String otp = generateSixDigitOtp();

        // One active token per user: replace whatever existed before
        tokenRepository.deleteByUserId(user.getId());
        EmailVerificationToken token = EmailVerificationToken.builder()
                .userId(user.getId())
                .otp(otp)
                .expiresAt(Instant.now().plusSeconds(OTP_VALID_MINUTES * 60L))
                .attemptCount(0)
                .build();
        tokenRepository.save(token);

        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    private String generateSixDigitOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // always 6 digits, no leading-zero ambiguity
        return String.valueOf(otp);
    }
}
