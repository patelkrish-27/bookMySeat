import { useState } from 'react';
import { Page } from '../types';
import { useMyBookings } from '../hooks/useMyBookings';
import { PLACEHOLDER_POSTER } from '../data/mockData';

export function HistoryPage({ setPage }: { setPage: (p: Page) => void }) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const { upcoming, past, loading, error } = useMyBookings()

  const allBookings = [
    ...upcoming.map(b => ({ ...b, section: 'upcoming' as const })),
    ...past.map(b => ({ ...b, section: 'past' as const })),
  ]

  const shown = filter === 'all'
    ? allBookings
    : filter === 'upcoming'
      ? allBookings.filter(b => b.section === 'upcoming')
      : allBookings.filter(b => b.section === 'past')

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl" style={{ color: '#f0f0f8' }}>Booking History</h1>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'past'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize"
                style={{
                  background: filter === f ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.05)',
                  color: filter === f ? '#07070f' : '#9999bb',
                  border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20 text-sm" style={{ color: '#555570' }}>
            Loading your bookings…
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-sm" style={{ color: '#ff8f97' }}>
            Could not load bookings: {error}
          </div>
        )}

        {!loading && !error && shown.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#555570" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="text-sm mb-4" style={{ color: '#555570' }}>
              {filter === 'upcoming' ? 'No upcoming bookings.' : filter === 'past' ? 'No past bookings yet.' : 'You haven\'t booked any tickets yet.'}
            </p>
            <button onClick={() => setPage('home')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
              Browse Movies
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {shown.map(b => {
            const showDate = new Date(b.showStartTime).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            const showTime = new Date(b.showStartTime).toLocaleTimeString('en-IN', {
              hour: '2-digit', minute: '2-digit',
            })
            const isUpcoming = b.section === 'upcoming'
            const shortId = b.bookingId.slice(-8).toUpperCase()

            return (
              <div key={b.bookingId}
                className="rounded-2xl p-5 flex items-center gap-5 transition-all hover:border-white/10"
                style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img
                  src={b.posterUrl || PLACEHOLDER_POSTER}
                  alt={b.movieTitle}
                  className="w-16 object-cover rounded-xl flex-shrink-0"
                  style={{ height: 88 }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-lg" style={{ color: '#f0f0f8' }}>{b.movieTitle}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full font-mono-dm ml-2 flex-shrink-0"
                      style={{
                        background: isUpcoming ? 'rgba(100,180,255,0.1)' : 'rgba(100,200,100,0.1)',
                        color: isUpcoming ? '#64b4ff' : '#4ade80',
                        border: `1px solid ${isUpcoming ? 'rgba(100,180,255,0.2)' : 'rgba(100,200,100,0.2)'}`,
                      }}>
                      {isUpcoming ? 'upcoming' : 'completed'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2">
                    <span className="text-sm" style={{ color: '#9999bb' }}>{b.theaterName}, {b.theaterCity}</span>
                    <span className="w-px h-3 hidden sm:block" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <span className="text-sm" style={{ color: '#9999bb' }}>{showDate} · {showTime}</span>
                    <span className="w-px h-3 hidden sm:block" style={{ background: 'rgba(255,255,255,0.15)' }} />
                    <span className="text-sm" style={{ color: '#9999bb' }}>
                      {b.seatLabels.length > 0 ? `Seats: ${b.seatLabels.join(', ')}` : b.screenName}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono-dm" style={{ color: '#555570' }}>#BMS-{shortId}</span>
                    <span className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>
                      ₹{Number(b.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                    style={{ color: '#9999bb', border: '1px solid rgba(255,255,255,0.08)' }}>
                    Details
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
