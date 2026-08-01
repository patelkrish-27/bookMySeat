import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function ProfilePage({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-12 gap-8">
          {/* Profile Card */}
          <div className="col-span-4">
            <div className="rounded-2xl p-6 text-center mb-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-2" style={{ borderColor: 'rgba(212,166,58,0.5)' }}>
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&auto=format" alt="User" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-display font-bold text-xl mb-1" style={{ color: '#f0f0f8' }}>Alex Morgan</h2>
              <p className="text-sm mb-4" style={{ color: '#555570' }}>alex.morgan@email.com</p>
              <div className="flex justify-around py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {[['24', 'Movies'], ['3', 'Reviews'], ['Gold', 'Tier']].map(([val, label]) => (
                  <div key={label} className="text-center">
                    <p className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>{val}</p>
                    <p className="text-xs" style={{ color: '#555570' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-semibold text-sm mb-4" style={{ color: '#9999bb' }}>Quick Links</h3>
              {[['Booking History', 'history'], ['Preferences', 'profile'], ['Payment Methods', 'profile'], ['Notifications', 'profile']].map(([label, page]) => (
                <button key={label} onClick={() => setPage(page as Page)}
                  className="w-full text-left py-3 px-3 rounded-xl text-sm transition-all hover:bg-white/5 flex items-center justify-between group"
                  style={{ color: '#9999bb' }}>
                  <span>{label}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#d4a63a' }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Profile Content */}
          <div className="col-span-8">
            <h1 className="font-display font-bold text-3xl mb-6" style={{ color: '#f0f0f8' }}>My Account</h1>

            {/* Loyalty */}
            <div className="rounded-2xl p-6 mb-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e, #1a2030)', border: '1px solid rgba(212,166,58,0.15)' }}>
              <div className="absolute right-0 top-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(212,166,58,0.1) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-mono-dm tracking-widest uppercase mb-1 block" style={{ color: '#d4a63a' }}>Loyalty Program</span>
                  <h3 className="font-display font-bold text-2xl" style={{ color: '#f0f0f8' }}>Gold Member</h3>
                </div>
                <div className="text-right">
                  <p className="font-mono-dm font-bold text-3xl" style={{ color: '#d4a63a' }}>2,450</p>
                  <p className="text-xs" style={{ color: '#555570' }}>CinéPoints</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#9999bb' }}>Gold → Platinum</span>
                  <span style={{ color: '#d4a63a' }}>2,450 / 5,000</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: '49%', background: 'linear-gradient(90deg, #d4a63a, #f0c060)' }} />
                </div>
              </div>
              <p className="text-xs" style={{ color: '#555570' }}>Earn 2,550 more points to reach Platinum status</p>
            </div>

            {/* Recent Bookings Preview */}
            <div className="rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-xl" style={{ color: '#f0f0f8' }}>Recent Bookings</h3>
                <button onClick={() => setPage('history')} className="text-sm transition-colors hover:opacity-70" style={{ color: '#d4a63a' }}>View all →</button>
              </div>
              {[
                { movie: DEMO_MOVIES[0], date: 'Jul 28, 2025', seats: 'D5, D6', status: 'completed' },
                { movie: DEMO_MOVIES[1], date: 'Jul 15, 2025', seats: 'F8', status: 'completed' },
                { movie: DEMO_MOVIES[2], date: 'Aug 10, 2025', seats: 'B3, B4', status: 'upcoming' },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-4 py-4" style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <img src={b.movie.poster} alt={b.movie.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#f0f0f8' }}>{b.movie.title}</p>
                    <p className="text-xs" style={{ color: '#555570' }}>{b.date} · Seats {b.seats}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-mono-dm"
                    style={{ background: b.status === 'upcoming' ? 'rgba(100,180,255,0.1)' : 'rgba(100,200,100,0.1)', color: b.status === 'upcoming' ? '#64b4ff' : '#4ade80', border: `1px solid ${b.status === 'upcoming' ? 'rgba(100,180,255,0.2)' : 'rgba(100,200,100,0.2)'}` }}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}