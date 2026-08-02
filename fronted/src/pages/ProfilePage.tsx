import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import { useMyBookings } from '../hooks/useMyBookings';
import { PLACEHOLDER_POSTER } from '../data/mockData';

export function ProfilePage({ setPage }: { setPage: (p: Page) => void }) {
  const { user, logout } = useAuth()
  const { upcoming, past, loading } = useMyBookings()

  // Show the 3 most recent bookings across both lists
  const recentBookings = [
    ...upcoming.map(b => ({ ...b, section: 'upcoming' as const })),
    ...past.map(b => ({ ...b, section: 'past' as const })),
  ].slice(0, 3)

  const totalBookings = upcoming.length + past.length

  const handleLogout = () => {
    logout()
    setPage('home')
  }

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8">

          {/* ── Left: profile card ─────────────────────────────────────────── */}
          <div className="col-span-4">
            <div className="rounded-2xl p-6 text-center mb-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* Avatar — initials-based, no fake photo */}
              <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center border-2"
                style={{ borderColor: 'rgba(212,166,58,0.5)', background: 'linear-gradient(135deg, #1a1a2e, #2a2a4e)' }}>
                <span className="font-display font-bold text-3xl" style={{ color: '#d4a63a' }}>
                  {user?.name?.charAt(0).toUpperCase() ?? '?'}
                </span>
              </div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#f0f0f8' }}>
                {user?.name ?? '—'}
              </h2>
              <p className="text-sm mb-4" style={{ color: '#555570' }}>
                {user?.email ?? '—'}
              </p>

              <div className="flex justify-around py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-center">
                  <p className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>
                    {loading ? '…' : String(totalBookings)}
                  </p>
                  <p className="text-xs" style={{ color: '#555570' }}>Bookings</p>
                </div>
                <div className="text-center">
                  <p className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>
                    {loading ? '…' : String(upcoming.length)}
                  </p>
                  <p className="text-xs" style={{ color: '#555570' }}>Upcoming</p>
                </div>
                <div className="text-center">
                  <p className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>
                    {user?.role ?? 'USER'}
                  </p>
                  <p className="text-xs" style={{ color: '#555570' }}>Role</p>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: '#9999bb' }}>Quick Links</h3>
              {[
                ['Booking History', 'history'],
              ].map(([label, dest]) => (
                <button key={label} onClick={() => setPage(dest as Page)}
                  className="w-full text-left py-3 px-3 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center justify-between group"
                  style={{ color: '#9999bb' }}>
                  <span>{label}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#d4a63a' }}>→</span>
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full text-left py-3 px-3 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center justify-between group mt-1"
                style={{ color: '#ff8f97' }}>
                <span>Sign Out</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </button>
            </div>
          </div>

          {/* ── Right: main content ────────────────────────────────────────── */}
          <div className="col-span-8">
            <h1 className="font-display font-bold text-3xl mb-6" style={{ color: '#f0f0f8' }}>My Account</h1>

            {/* Account details */}
            <div className="rounded-2xl p-6 mb-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#f0f0f8' }}>Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono-dm mb-1.5 block" style={{ color: '#555570' }}>NAME</label>
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f8' }}>
                    {user?.name ?? '—'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-mono-dm mb-1.5 block" style={{ color: '#555570' }}>EMAIL</label>
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f0f8' }}>
                    {user?.email ?? '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent bookings */}
            <div className="rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl" style={{ color: '#f0f0f8' }}>Recent Bookings</h3>
                <button onClick={() => setPage('history')} className="text-sm transition-colors hover:opacity-70" style={{ color: '#d4a63a' }}>
                  View all →
                </button>
              </div>

              {loading && (
                <p className="text-sm text-center py-6" style={{ color: '#555570' }}>Loading bookings…</p>
              )}

              {!loading && recentBookings.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm mb-3" style={{ color: '#555570' }}>No bookings yet.</p>
                  <button onClick={() => setPage('home')}
                    className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                    Browse Movies
                  </button>
                </div>
              )}

              {recentBookings.map((b, i) => {
                const showDate = new Date(b.showStartTime).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })
                const isUpcoming = b.section === 'upcoming'
                return (
                  <div key={b.bookingId} className="flex items-center gap-4 py-4"
                    style={{ borderBottom: i < recentBookings.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <img
                      src={b.posterUrl || PLACEHOLDER_POSTER}
                      alt={b.movieTitle}
                      className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: '#f0f0f8' }}>{b.movieTitle}</p>
                      <p className="text-xs" style={{ color: '#555570' }}>
                        {showDate} · {b.seatLabels.length > 0 ? `Seats: ${b.seatLabels.join(', ')}` : b.theaterName}
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full font-mono-dm flex-shrink-0"
                      style={{
                        background: isUpcoming ? 'rgba(100,180,255,0.1)' : 'rgba(100,200,100,0.1)',
                        color: isUpcoming ? '#64b4ff' : '#4ade80',
                        border: `1px solid ${isUpcoming ? 'rgba(100,180,255,0.2)' : 'rgba(100,200,100,0.2)'}`,
                      }}>
                      {isUpcoming ? 'upcoming' : 'completed'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
