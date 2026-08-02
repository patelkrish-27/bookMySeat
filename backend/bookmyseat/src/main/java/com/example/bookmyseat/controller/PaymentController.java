package com.example.bookmyseat.controller;

import com.example.bookmyseat.dto.PaymentDtos.*;
import com.example.bookmyseat.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST endpoints for payments.
 *
 * All endpoints require a valid JWT (enforced by SecurityConfig).
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/v1/payments/create-order
     *
     * Creates a Razorpay order for a PENDING booking.
     * Returns razorpayOrderId, razorpayKeyId, amountInPaise, and currency so the
     * frontend can open the Razorpay Checkout popup.
     */
    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @RequestBody CreateOrderRequest request
    ) {
        return ResponseEntity.ok(paymentService.createOrder(request));
    }

    /**
     * POST /api/v1/payments/confirm
     *
     * Confirms payment after Razorpay's checkout callback fires.
     * The frontend sends the three Razorpay response tokens; the backend verifies
     * the HMAC-SHA256 signature server-side before marking the booking CONFIRMED.
     *
     * Idempotency-Key header prevents double-charging on network retries.
     * Generate ONE UUID per payment attempt on the frontend and reuse it on retries.
     */
    @PostMapping("/confirm")
    public ResponseEntity<PaymentConfirmationResponse> confirmPayment(
            @RequestBody ConfirmPaymentRequest request,
            @RequestHeader("Idempotency-Key") UUID idempotencyKey
    ) {
        return ResponseEntity.ok(paymentService.confirmPayment(request, idempotencyKey));
    }
}
