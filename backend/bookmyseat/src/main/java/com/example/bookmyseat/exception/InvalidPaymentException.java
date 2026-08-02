package com.example.bookmyseat.exception;

/**
 * Thrown when a payment confirmation arrives for a booking that is not in a
 * payable state (already confirmed, cancelled, or simply not found).
 * Maps to HTTP 400 Bad Request.
 */
public class InvalidPaymentException extends RuntimeException {

    public InvalidPaymentException(String message) {
        super(message);
    }
}
