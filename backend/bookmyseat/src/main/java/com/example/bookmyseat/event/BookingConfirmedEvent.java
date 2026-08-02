package com.example.bookmyseat.event;

import java.util.UUID;

/** Event published when a booking payment succeeds. */
public record BookingConfirmedEvent(UUID bookingId) {
}
