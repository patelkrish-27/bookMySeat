import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function HistoryPage({ setPage }: { setPage: (p: Page) => void }) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const bookings = [
    { id: '#CNE-284719', movie: DEMO_MOVIES[0], date: 'Aug 2, 2025', time: '7:00 PM', cinema: 'IMAX Downtown', seats: ['E5', 'E6'], total: 50.96, status: 'upcoming' },
    { id: '#CNE-271830', movie: DEMO_MOVIES[2], date: 'Aug 10, 2025', time: '2:30 PM', cinema: 'Cine Grand Deluxe', seats: ['B3', 'B4'], total: 37.49, status: 'upcoming' },
    { id: '#CNE-249101', movie: DEMO_MOVIES[1], date: 'Jul 15, 2025', time: '8:15 PM', cinema: 'IMAX Downtown', seats: ['F8'], total: 21.99, status: 'completed' },
    { id: '#CNE-238452', movie: DEMO_MOVIES[0], date: 'Jul 28, 2025', time: '5:00 PM', cinema: 'Premiere Screens', seats: ['D5', 'D6'], total: 42.97, status: 'completed' },
    { id: '#CNE-215823', movie: DEMO_MOVIES[3], date: 'Jun 20, 2025', time: '7:30 PM', cinema: 'IMAX Downtown', seats: ['A1', 'A2'], total: 58.99, status: 'completed' },
  ]
  const shown = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl" style={{ color: '#f0f0f8' }}>Booking History</h1>
          <div className="flex gap-2">
            {(['all', 'upcoming', 'completed'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize"
                style={{ background: filter === f ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#07070f' : '#9999bb', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {shown.map(b => (
            <div key={b.id} className="rounded-2xl p-5 flex items-center gap-5 transition-all hover:border-white/10"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.06)' }}>
              <img src={b.movie.poster} alt={b.movie.title} className="w-16 h-22 object-cover rounded-xl flex-shrink-0" style={{ height: 88 }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-bold text-lg" style={{ color: '#f0f0f8' }}>{b.movie.title}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono-dm`}
                    style={{ background: b.status === 'upcoming' ? 'rgba(100,180,255,0.1)' : 'rgba(100,200,100,0.1)', color: b.status === 'upcoming' ? '#64b4ff' : '#4ade80', border: `1px solid ${b.status === 'upcoming' ? 'rgba(100,180,255,0.2)' : 'rgba(100,200,100,0.2)'}` }}>
                    {b.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-sm" style={{ color: '#9999bb' }}>{b.cinema}</span>
                  <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <span className="text-sm" style={{ color: '#9999bb' }}>{b.date} · {b.time}</span>
                  <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
                  <span className="text-sm" style={{ color: '#9999bb' }}>Seats: {b.seats.join(', ')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono-dm" style={{ color: '#555570' }}>{b.id}</span>
                  <span className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>${b.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                {b.status === 'upcoming' && (
                  <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                    View Ticket
                  </button>
                )}
                <button className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
                  style={{ color: '#9999bb', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}