package com.example.bookmyseat.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * DTOs for the /api/v1/payments endpoints.
 */
public class PaymentDtos {

    // ── POST /create-order ────────────────────────────────────────────────────

    @Getter
    @Setter
    public static class CreateOrderRequest {
        /** The PENDING booking for which to create a Razorpay order. */
        private UUID bookingId;
    }

    @Getter
    @Builder
    public static class CreateOrderResponse {
        private String razorpayOrderId;
        /** Public key ID — safe to expose to the frontend to open Checkout. */
        private String razorpayKeyId;
        /** Amount in paise (smallest INR unit) as required by Razorpay Checkout. */
        private long amountInPaise;
        private String currency;
        private UUID bookingId;
    }

    // ── POST /confirm ─────────────────────────────────────────────────────────

    @Getter
    @Setter
    public static class ConfirmPaymentRequest {
        private UUID bookingId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
        // idempotencyKey arrives as a request header, not in this body — see controller
    }

    @Getter
    @Builder
    public static class PaymentConfirmationResponse {
        private UUID bookingId;
        /** "CONFIRMED" or "FAILED" */
        private String status;
        private String message;
    }
}
