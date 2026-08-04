import { useState, useEffect } from 'react';
import { Page, BookingDetail } from '../types';
import { bookingApi } from '../lib/api';
// Run `pnpm add qrcode.react` then change this import to:
//   import { QRCodeSVG } from 'qrcode.react'
// Until then the QR cell shows the short booking ID as a placeholder.

interface ConfirmationPageProps {
  bookingId: string
  setPage: (p: Page) => void
}

// ── Tiny inline QR placeholder (no dependency) ────────────────────────────────
// Replace with <QRCodeSVG value={bookingId} size={64} level="M" /> once
// qrcode.react is installed.
function QrPlaceholder({ id }: { id: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center rounded"
      style={{ background: '#f5f5f5' }}>
      <span style={{ fontSize: 7, color: '#333', fontFamily: 'monospace', textAlign: 'center', padding: '2px', wordBreak: 'break-all', lineHeight: 1.3 }}>
        {id.slice(-12)}
      </span>
    </div>
  )
}

export function ConfirmationPage({ bookingId, setPage }: ConfirmationPageProps) {
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    bookingApi.getBooking(bookingId)
      .then((d) => { if (!cancelled) setBooking(d) })
      .catch((err: Error) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [bookingId])

  if (loading) {
    return (
      <div className="page-fade min-h-screen pt-20 flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent spin-slow" style={{ borderColor: 'rgba(212,166,58,0.3)', borderTopColor: 'transparent' }} />
          <span style={{ color: '#9999bb' }}>Loading your booking…</span>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="page-fade min-h-screen pt-20 flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center max-w-sm mx-4">
          <p className="mb-4" style={{ color: '#ff8f97' }}>{error ?? 'Booking not found.'}</p>
          <button onClick={() => setPage('home')} className="px-6 py-3 rounded-xl font-semibold glass-btn-gold">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  const showDate = new Date(booking.showStartTime).toLocaleDateString('en-IN', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
  const showTime = new Date(booking.showStartTime).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
  const seatLabels = booking.seats.map(s => `${s.seatRow}${s.seatNumber}`).join(', ')
  const shortId = bookingId.slice(-8).toUpperCase()

  return (
    <div className="page-fade min-h-screen pt-20 flex items-center justify-center" style={{ background: 'transparent' }}>
      <div className="max-w-md w-full mx-4 sm:mx-6">
        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center scale-in glass-panel glow-pulse"
            style={{ background: 'rgba(212,166,58,0.08)', borderColor: 'rgba(212,166,58,0.3)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4a63a" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl mb-2" style={{ color: '#f0f0f8' }}>Booking Confirmed!</h1>
          <p style={{ color: '#9999bb' }}>Your tickets have been booked. Enjoy the show!</p>
        </div>

        {/* Ticket */}
        <div className="glass-panel rounded-2xl overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,166,58,0.06)' }}>
          {/* Top */}
          <div className="p-5 sm:p-6 relative" style={{ background: 'linear-gradient(135deg, rgba(26,26,46,0.8), rgba(19,19,31,0.8))' }}>
            {booking.posterUrl && (
              <div className="absolute top-4 right-4">
                <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(212,166,58,0.2)' }}>
                  <img src={booking.posterUrl} alt={booking.movieTitle} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            <div className="mb-1">
              <span className="text-xs font-mono-dm tracking-widest" style={{ color: '#d4a63a' }}>BOOKING ID</span>
              <p className="font-mono-dm font-bold text-lg" style={{ color: '#f0f0f8' }}>#BMS-{shortId}</p>
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl mb-4 pr-16 sm:pr-20" style={{ color: '#f0f0f8' }}>{booking.movieTitle}</h2>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Cinema', booking.theaterName],
                ['City', booking.theaterCity],
                ['Date', showDate],
                ['Time', showTime],
                ['Screen', booking.screenName],
                ['Seats', seatLabels],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-mono-dm" style={{ color: '#555570' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tear line */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full -ml-6 flex-shrink-0" style={{ background: '#07070f' }} />
            <div className="flex-1 border-t-2 border-dashed mx-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
            <div className="w-5 h-5 rounded-full -mr-6 flex-shrink-0" style={{ background: '#07070f' }} />
          </div>

          {/* Bottom: amount + QR */}
          <div className="p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono-dm mb-1" style={{ color: '#555570' }}>Amount Paid</p>
              <p className="font-mono-dm font-bold text-2xl" style={{ color: '#d4a63a' }}>
                ₹{Number(booking.totalAmount).toFixed(2)}
              </p>
              <p className="text-xs mt-1 font-mono-dm glass-pill px-2 py-0.5 rounded-full inline-block" style={{ color: '#4ade80', borderColor: 'rgba(100,200,100,0.2)' }}>{booking.status}</p>
            </div>
            {/* QR placeholder — replace inner content with <QRCodeSVG> once package is installed */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: 'white', padding: 4 }}>
              <QrPlaceholder id={bookingId} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={() => setPage('history')}
            className="flex-1 py-3 rounded-xl text-sm font-semibold glass-btn-outline"
            style={{ color: '#d4a63a', borderColor: 'rgba(212,166,58,0.2)' }}>
            View in History
          </button>
          <button onClick={() => setPage('home')}
            className="flex-1 py-3 rounded-xl text-sm font-semibold glass-btn-gold">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
