import { useState, useEffect, useRef } from 'react';
import { Page, Movie, BookingDetail } from '../types';
import { bookingApi } from '../lib/api';
import { payForBooking } from '../lib/payment';
import { useAuth } from '../context/AuthContext';

interface CheckoutPageProps {
  movie: Movie
  setPage: (p: Page) => void
  bookingId: string
  /** ISO-8601 string: the moment the seat locks expire (now + 8 min) */
  expiresAt: string
  onPaymentConfirmed: (bookingId: string) => void
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function CheckoutPage({
  movie,
  setPage,
  bookingId,
  expiresAt,
  onPaymentConfirmed,
}: CheckoutPageProps) {
  const { user } = useAuth()
  const [bookingDetail, setBookingDetail] = useState<BookingDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [expired, setExpired] = useState(false)

  // Countdown — initialise from expiresAt so page refreshes don't reset the timer
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  // ONE idempotency key per checkout page mount — reused on every Pay Now retry
  const idempotencyKey = useRef<string>(crypto.randomUUID())

  // Fetch booking detail (real seats, theater, show time, prices)
  useEffect(() => {
    let cancelled = false
    setDetailLoading(true)
    bookingApi.getBooking(bookingId)
      .then((d) => { if (!cancelled) setBookingDetail(d) })
      .catch((err: Error) => { if (!cancelled) setDetailError(err.message) })
      .finally(() => { if (!cancelled) setDetailLoading(false) })
    return () => { cancelled = true }
  }, [bookingId])

  // Countdown ticker
  useEffect(() => {
    if (secondsLeft <= 0) { setExpired(true); return }
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        const next = prev - 1
        if (next <= 0) { setExpired(true); clearInterval(id); return 0 }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const handlePay = () => {
    if (!user || paying || expired) return
    setPaying(true)
    setPayError(null)
    payForBooking(
      bookingId,
      idempotencyKey.current,
      user.email,
      user.name,
      (confirmedBookingId) => {
        setPaying(false)
        onPaymentConfirmed(confirmedBookingId)
      },
      (errMsg) => {
        setPaying(false)
        // Dismissing the Razorpay modal is not an error — just ignore
        if (errMsg === 'Payment was cancelled.') return
        setPayError(errMsg)
      }
    )
  }

  // ── Expired screen ────────────────────────────────────────────────────────
  if (expired) {
    return (
      <div className="page-fade min-h-screen pt-20 flex items-center justify-center" style={{ background: '#07070f' }}>
        <div className="max-w-md w-full mx-6 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'rgba(230,57,70,0.12)', border: '2px solid rgba(230,57,70,0.4)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff8f97" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#f0f0f8' }}>Seat hold expired</h2>
          <p className="mb-6" style={{ color: '#9999bb' }}>
            The 8-minute reservation window has closed and your seats have been released. Please go back and reselect.
          </p>
          <button onClick={() => setPage('seats')}
            className="px-8 py-3 rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
            Reselect Seats
          </button>
        </div>
      </div>
    )
  }

  const isUrgent = secondsLeft < 120

  const seatLabels = bookingDetail?.seats.map(s => `${s.seatRow}${s.seatNumber}`).join(', ') ?? '—'

  const showDate = bookingDetail
    ? new Date(bookingDetail.showStartTime).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : '—'
  const showTime = bookingDetail
    ? new Date(bookingDetail.showStartTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => setPage('seats')} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-colors" style={{ color: '#9999bb' }}>← Back</button>

        {/* Countdown banner */}
        <div className="flex items-center justify-between mb-6 px-5 py-3 rounded-xl"
          style={{ background: isUrgent ? 'rgba(230,57,70,0.12)' : 'rgba(212,166,58,0.08)', border: `1px solid ${isUrgent ? 'rgba(230,57,70,0.3)' : 'rgba(212,166,58,0.2)'}` }}>
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isUrgent ? '#ff8f97' : '#d4a63a'} strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span className="text-sm font-medium" style={{ color: isUrgent ? '#ff8f97' : '#d4a63a' }}>
              Complete payment within
            </span>
          </div>
          <span className="font-mono-dm font-bold text-xl" style={{ color: isUrgent ? '#ff8f97' : '#d4a63a' }}>
            {formatCountdown(secondsLeft)}
          </span>
        </div>

        {/* Payment error */}
        {payError && (
          <div className="mb-5 px-5 py-4 rounded-xl flex items-start gap-3"
            style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', color: '#ff8f97' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-sm">{payError}</p>
              {(payError.toLowerCase().includes('released') || payError.toLowerCase().includes('failed')) && (
                <button onClick={() => setPage('seats')} className="mt-2 text-sm underline" style={{ color: '#d4a63a' }}>
                  Go back to seat selection →
                </button>
              )}
            </div>
          </div>
        )}

        <h1 className="font-display font-bold text-3xl mb-8" style={{ color: '#f0f0f8' }}>Checkout</h1>

        <div className="grid grid-cols-12 gap-8">
          {/* Left: contact + payment info */}
          <div className="col-span-7">
            {/* Contact */}
            <div className="rounded-2xl p-6 mb-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#f0f0f8' }}>Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs mb-1.5 block font-mono-dm" style={{ color: '#555570' }}>NAME</label>
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8' }}>
                    {user?.name ?? '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-1.5 block font-mono-dm" style={{ color: '#555570' }}>EMAIL</label>
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8' }}>
                    {user?.email ?? '—'}
                  </div>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: '#555570' }}>
                Booking confirmation is tied to your logged-in account.
              </p>
            </div>

            {/* Payment method info */}
            <div className="rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-4" style={{ color: '#f0f0f8' }}>Payment</h3>
              <div className="flex items-center gap-3 p-4 rounded-xl mb-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d4a63a" strokeWidth="1.5">
                  <rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>Powered by Razorpay</p>
                  <p className="text-xs" style={{ color: '#555570' }}>Card · UPI · Netbanking · Wallet</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(100,200,100,0.06)', border: '1px solid rgba(100,200,100,0.1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-xs" style={{ color: '#4ade80' }}>Secured by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>

          {/* Right: booking summary + pay button */}
          <div className="col-span-5">
            <div className="sticky top-24 rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#f0f0f8' }}>Booking Summary</h3>

              {detailLoading ? (
                <div className="text-center py-8 text-sm" style={{ color: '#555570' }}>Loading…</div>
              ) : detailError ? (
                <div className="text-sm py-4" style={{ color: '#ff8f97' }}>{detailError}</div>
              ) : bookingDetail ? (
                <>
                  <div className="flex gap-4 pb-5 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <img
                      src={bookingDetail.posterUrl || movie.poster}
                      alt={bookingDetail.movieTitle}
                      className="w-14 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div>
                      <p className="font-display font-bold text-sm mb-1" style={{ color: '#f0f0f8' }}>{bookingDetail.movieTitle}</p>
                      <p className="text-xs" style={{ color: '#555570' }}>{bookingDetail.theaterName}</p>
                      <p className="text-xs" style={{ color: '#555570' }}>{bookingDetail.theaterCity}</p>
                      <p className="text-xs mt-1" style={{ color: '#555570' }}>{showDate} · {showTime}</p>
                      <p className="text-xs mt-1" style={{ color: '#9999bb' }}>Screen: {bookingDetail.screenName}</p>
                      <p className="text-xs" style={{ color: '#9999bb' }}>Seats: {seatLabels}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {bookingDetail.seats.map((s) => (
                      <div key={s.showSeatId} className="flex justify-between text-sm">
                        <span style={{ color: '#9999bb' }}>
                          {s.seatRow}{s.seatNumber} <span className="capitalize">({s.seatType.toLowerCase()})</span>
                        </span>
                        <span style={{ color: '#f0f0f8' }}>₹{Number(s.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold text-xl pt-4 mb-6"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#f0f0f8' }}>Total</span>
                    <span style={{ color: '#d4a63a' }}>₹{Number(bookingDetail.totalAmount).toFixed(2)}</span>
                  </div>
                </>
              ) : null}

              <button
                onClick={handlePay}
                disabled={paying || expired || detailLoading}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{
                  background: (paying || expired || detailLoading)
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg, #d4a63a, #f0c060)',
                  color: (paying || expired || detailLoading) ? '#555570' : '#07070f',
                  cursor: (paying || expired || detailLoading) ? 'default' : 'pointer',
                }}
              >
                {paying
                  ? 'Opening payment…'
                  : expired
                    ? 'Session expired'
                    : bookingDetail
                      ? `Pay ₹${Number(bookingDetail.totalAmount).toFixed(2)}`
                      : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
