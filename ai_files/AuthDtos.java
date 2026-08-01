package com.bookmyseat.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class AuthDtos {

    @Getter
    @Setter
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        // role is intentionally NOT accepted from the client for normal signup;
        // default to a fixed role (e.g. "USER") in the service layer to prevent privilege escalation.
    }

    @Getter
    @Setter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Getter
    @Setter
    public static class ResendOtpRequest {
        private String email;
    }

    @Getter
    @Builder
    public static class MessageResponse {
        private String message;
    }

    @Getter
    @Builder
    public static class AuthResponse {
        private String token;
        private String tokenType; // "Bearer"
        private String name;
        private String email;
        private String role;
    }
}
