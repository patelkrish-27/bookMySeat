package com.example.bookmyseat.auth;

import com.example.bookmyseat.auth.AuthDtos.MessageResponse;
import com.example.bookmyseat.exception.InvalidPaymentException;
import com.example.bookmyseat.exception.SeatAlreadyLockedException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(String timestamp, int status, String error, String message) {}

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<MessageResponse> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(MessageResponse.builder().message(ex.getMessage()).build());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<MessageResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(MessageResponse.builder().message("Invalid email or password").build());
    }

    /**
     * 403 Forbidden — authenticated user lacks the required role (e.g. non-admin
     * tries to access /api/v1/admin/**). Returns JSON instead of Spring's default
     * HTML error page so the frontend can surface a proper message.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(MessageResponse.builder()
                        .message("Access denied — you do not have permission to perform this action")
                        .build());
    }

    /**
     * 409 Conflict — one or more seats are already held by another user.
     * The frontend should refresh the seat layout and ask the user to re-select.
     */
    @ExceptionHandler(SeatAlreadyLockedException.class)
    public ResponseEntity<ErrorResponse> handleSeatAlreadyLocked(SeatAlreadyLockedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(
                        java.time.LocalDateTime.now().toString(),
                        HttpStatus.CONFLICT.value(),
                        HttpStatus.CONFLICT.getReasonPhrase(),
                        ex.getMessage()
                ));
    }

    /**
     * 400 Bad Request — payment attempted on a booking that is not PENDING,
     * or signature verification failed in a way that warrants a client error.
     */
    @ExceptionHandler(InvalidPaymentException.class)
    public ResponseEntity<ErrorResponse> handleInvalidPayment(InvalidPaymentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(
                        java.time.LocalDateTime.now().toString(),
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        ex.getMessage()
                ));
    }

    /**
     * 500 Internal Server Error — catch-all for unexpected exceptions.
     * Prevents stack traces leaking to the client.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponse> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponse.builder()
                        .message("An unexpected error occurred. Please try again.")
                        .build());
    }
}
