export type Page =
  | 'home'
  | 'listing'
  | 'details'
  | 'seats'
  | 'food'
  | 'checkout'
  | 'confirmation'
  | 'profile'
  | 'history'
  | 'admin'
  | 'login'
  | 'signup'
  | 'verify-email'

/** Shape returned by /api/v1/auth/login and /api/v1/auth/verify-otp */
export interface AuthUser {
  token: string
  tokenType: string
  name: string
  email: string
  role: string
}

export interface Movie {
  id: string | number
  title: string
  synopsis: string        // from backend `description`
  duration: string        // formatted from backend `durationMins`
  language: string        // from backend `language`
  releaseDate: string     // from backend `releaseDate`
  poster: string          // placeholder image until backend serves posters
  backdrop: string        // placeholder image until backend serves backdrops
  price: number
  featured?: boolean
}

export interface SeatItem {
  id: string
  row: string
  num: number
  type: 'REGULAR' | 'PREMIUM' | 'RECLINER'
  status: 'available' | 'taken' | 'selected'
  price?: number
}

export interface FoodItem {
  id: number
  name: string
  desc: string
  price: number
  category: string
  image: string
}

// ── Booking types (from /api/v1/bookings) ─────────────────────────────────────

/** Response from POST /api/v1/bookings/tentative */
export interface TentativeBookingResponse {
  bookingId: string
  totalAmount: number
  /** ISO-8601 string: now + 8 minutes */
  expiresAt: string
}

/** Individual seat in a booking detail */
export interface BookingSeatDetail {
  showSeatId: string
  seatRow: string
  seatNumber: number
  seatType: 'REGULAR' | 'PREMIUM' | 'RECLINER'
  price: number
}

/** Response from GET /api/v1/bookings/{bookingId} */
export interface BookingDetail {
  bookingId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  totalAmount: number
  createdAt: string

  movieTitle: string
  posterUrl: string | null

  showStartTime: string
  showEndTime: string

  theaterName: string
  theaterCity: string
  theaterAddress: string
  screenName: string

  seats: BookingSeatDetail[]
}

/** Single booking in GET /api/v1/bookings/my-bookings */
export interface BookingSummary {
  bookingId: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  totalAmount: number
  createdAt: string

  movieTitle: string
  posterUrl: string | null

  showStartTime: string

  theaterName: string
  theaterCity: string
  screenName: string

  /** Compact labels like ["A1","A2"] */
  seatLabels: string[]
}

/** Response from GET /api/v1/bookings/my-bookings */
export interface MyBookingsResponse {
  upcoming: BookingSummary[]
  past: BookingSummary[]
}

// ── Payment types (from /api/v1/payments) ─────────────────────────────────────

/** Response from POST /api/v1/payments/create-order */
export interface CreateOrderResponse {
  razorpayOrderId: string
  razorpayKeyId: string
  amountInPaise: number
  currency: string
  bookingId: string
}

/** Response from POST /api/v1/payments/confirm */
export interface PaymentConfirmationResponse {
  bookingId: string
  /** "CONFIRMED" | "FAILED" */
  status: string
  message: string
}

// ── Admin types (from /api/v1/admin) ───────────────────────────────────────────

export interface MovieAdmin {
  id: string
  title: string
  description: string
  durationMins: number
  language: string
  releaseDate: string
  posterUrl: string | null
  backdropUrl: string | null
}

export interface TheaterAdmin {
  id: string
  name: string
  city: string
  address: string
  totalScreens: number
}

export interface SeatMapEntry {
  seatRow: string
  seatNumber: number
  seatType: 'REGULAR' | 'PREMIUM' | 'RECLINER'
}

export interface ScreenAdmin {
  id: string
  theaterId: string
  theaterName: string
  name: string
  totalSeats: number
  seats: SeatMapEntry[]
}

export interface ShowAdmin {
  id: string
  movieId: string
  movieTitle: string
  screenId: string
  screenName: string
  theaterId: string
  theaterName: string
  startTime: string
  endTime: string
}

export interface ShowSeatAdmin {
  showSeatId: string
  seatId: string
  seatRow: string
  seatNumber: number
  seatType: 'REGULAR' | 'PREMIUM' | 'RECLINER'
  price: number
  status: string
}
