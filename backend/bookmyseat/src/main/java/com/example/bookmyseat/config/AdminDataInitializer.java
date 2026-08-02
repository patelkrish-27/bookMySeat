package com.example.bookmyseat.config;

import com.example.bookmyseat.entity.User;
import com.example.bookmyseat.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Bootstraps a default ADMIN account on startup for development.
 * Credentials are configurable via "app.admin.*" properties.
 * Remove or disable in production — admin accounts should be provisioned
 * via a proper admin portal or DB migration.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name:Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        User admin = User.builder()
                .name(adminName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role("ADMIN")
                .emailVerified(true)
                .build();

        userRepository.save(admin);
        log.info("Created default ADMIN account: {} (password from app.admin.password)", adminEmail);
    }
}
