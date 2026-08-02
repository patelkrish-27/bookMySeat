/**
 * Thin fetch wrapper for BookMySeat API calls.
 *
 * - Automatically attaches Content-Type: application/json.
 * - Reads the JWT from sessionStorage and attaches Authorization: Bearer <token>
 *   on every call — no manual header management needed.
 * - Throws an Error whose `.message` is the `message` field from the backend
 *   error response, so callers can surface it directly in the UI.
 */

import type {
  TentativeBookingResponse,
  BookingDetail,
  MyBookingsResponse,
  CreateOrderResponse,
  PaymentConfirmationResponse,
  MovieAdmin,
  TheaterAdmin,
  ScreenAdmin,
  ShowAdmin,
  ShowSeatAdmin,
  SeatMapEntry,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'
const STORAGE_KEY = 'bms_auth'

function getToken(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { token?: string }
    return parsed.token ?? null
  } catch {
    return null
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Parse response body once — even error responses from our GlobalExceptionHandler
  // return JSON with a `message` field.
  let body: unknown
  const contentType = response.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    body = await response.json()
  } else {
    body = await response.text()
  }

  if (!response.ok) {
    const err = new Error(
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
        ? (body as { message: string }).message
        : `Request failed with status ${response.status}`
    ) as Error & { status?: number }
    err.status = response.status
    throw err
  }

  return body as T
}

// ── Auth-specific helpers ─────────────────────────────────────────────────────

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface ResendOtpRequest {
  email: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface MessageResponse {
  message: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  name: string
  email: string
  role: string
}

export const authApi = {
  register: (body: RegisterRequest) =>
    apiFetch<MessageResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyOtp: (body: VerifyOtpRequest) =>
    apiFetch<AuthResponse>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resendOtp: (body: ResendOtpRequest) =>
    apiFetch<MessageResponse>('/api/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: LoginRequest) =>
    apiFetch<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

// ── Booking API helpers ───────────────────────────────────────────────────────

export const bookingApi = {
  /** POST /api/v1/bookings/tentative */
  createTentative: (showId: string, showSeatIds: string[]) =>
    apiFetch<TentativeBookingResponse>('/api/v1/bookings/tentative', {
      method: 'POST',
      body: JSON.stringify({ showId, showSeatIds }),
    }),

  /** GET /api/v1/bookings/{bookingId} */
  getBooking: (bookingId: string) =>
    apiFetch<BookingDetail>(`/api/v1/bookings/${bookingId}`),

  /** GET /api/v1/bookings/my-bookings */
  getMyBookings: () =>
    apiFetch<MyBookingsResponse>('/api/v1/bookings/my-bookings'),
}

// ── Payment API helpers ───────────────────────────────────────────────────────

export const paymentApi = {
  /** POST /api/v1/payments/create-order */
  createOrder: (bookingId: string) =>
    apiFetch<CreateOrderResponse>('/api/v1/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),

  /** POST /api/v1/payments/confirm */
  confirmPayment: (
    payload: {
      bookingId: string
      razorpayOrderId: string
      razorpayPaymentId: string
      razorpaySignature: string
    },
    idempotencyKey: string
  ) =>
    apiFetch<PaymentConfirmationResponse>('/api/v1/payments/confirm', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
       body: JSON.stringify(payload),
     }),
}

// ── Admin API helpers ───────────────────────────────────────────────────────────

export const adminApi = {
  // ── Movies ──
  getAllMovies: () =>
    apiFetch<MovieAdmin[]>('/api/v1/admin/movies'),

  getMovie: (id: string) =>
    apiFetch<MovieAdmin>(`/api/v1/admin/movies/${id}`),

  createMovie: (body: Partial<MovieAdmin>) =>
    apiFetch<MovieAdmin>('/api/v1/admin/movies', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateMovie: (id: string, body: Partial<MovieAdmin>) =>
    apiFetch<MovieAdmin>(`/api/v1/admin/movies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteMovie: (id: string) =>
    apiFetch<void>(`/api/v1/admin/movies/${id}`, {
      method: 'DELETE',
    }),

  // ── Theaters ──
  getAllTheaters: () =>
    apiFetch<TheaterAdmin[]>('/api/v1/admin/theaters'),

  getTheater: (id: string) =>
    apiFetch<TheaterAdmin>(`/api/v1/admin/theaters/${id}`),

  createTheater: (body: Partial<TheaterAdmin>) =>
    apiFetch<TheaterAdmin>('/api/v1/admin/theaters', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateTheater: (id: string, body: Partial<TheaterAdmin>) =>
    apiFetch<TheaterAdmin>(`/api/v1/admin/theaters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteTheater: (id: string) =>
    apiFetch<void>(`/api/v1/admin/theaters/${id}`, {
      method: 'DELETE',
    }),

  // ── Screens ──
  getAllScreens: () =>
    apiFetch<ScreenAdmin[]>('/api/v1/admin/screens'),

  getScreensForTheater: (theaterId: string) =>
    apiFetch<ScreenAdmin[]>(`/api/v1/admin/theaters/${theaterId}/screens`),

  getScreen: (id: string) =>
    apiFetch<ScreenAdmin>(`/api/v1/admin/screens/${id}`),

  createScreen: (body: { theaterId: string; name: string; seats: SeatMapEntry[] }) =>
    apiFetch<ScreenAdmin>('/api/v1/admin/screens', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateScreen: (id: string, body: { name: string }) =>
    apiFetch<ScreenAdmin>(`/api/v1/admin/screens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteScreen: (id: string) =>
    apiFetch<void>(`/api/v1/admin/screens/${id}`, {
      method: 'DELETE',
    }),

  // ── Shows ──
  getAllShows: () =>
    apiFetch<ShowAdmin[]>('/api/v1/admin/shows'),

  getShow: (id: string) =>
    apiFetch<ShowAdmin>(`/api/v1/admin/shows/${id}`),

  getShowSeats: (id: string) =>
    apiFetch<ShowSeatAdmin[]>(`/api/v1/admin/shows/${id}/seats`),

  createShow: (body: { movieId: string; screenId: string; startTime: string }) =>
    apiFetch<ShowAdmin>('/api/v1/admin/shows', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateShow: (id: string, body: { movieId: string; screenId: string; startTime: string }) =>
    apiFetch<ShowAdmin>(`/api/v1/admin/shows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  deleteShow: (id: string) =>
    apiFetch<void>(`/api/v1/admin/shows/${id}`, {
      method: 'DELETE',
    }),
}
