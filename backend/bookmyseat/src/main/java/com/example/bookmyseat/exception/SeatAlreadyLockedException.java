package com.example.bookmyseat.exception;

/**
 * Thrown when a user tries to tentatively lock one or more seats that are
 * already locked by another user's ongoing session.
 * Maps to HTTP 409 Conflict.
 */
public class SeatAlreadyLockedException extends RuntimeException {

    public SeatAlreadyLockedException(String message) {
        super(message);
    }
}
