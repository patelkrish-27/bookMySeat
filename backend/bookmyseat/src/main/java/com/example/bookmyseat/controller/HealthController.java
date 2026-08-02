package com.example.bookmyseat.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * Simple health-check endpoint for monitoring and container orchestration.
 * No authentication required — safe to hit from load balancers / uptime monitors.
 */
@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<HealthResponse> check() {
        return ResponseEntity.ok(new HealthResponse(
                "UP",
                LocalDateTime.now()
        ));
    }

    @Getter
    @Setter
    public static class HealthResponse {
        private String status;
        private LocalDateTime timestamp;

        public HealthResponse() {}

        public HealthResponse(String status, LocalDateTime timestamp) {
            this.status = status;
            this.timestamp = timestamp;
        }
    }
}
