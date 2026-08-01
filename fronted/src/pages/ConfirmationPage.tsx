import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function ConfirmationPage({ movie, setPage }: { movie: Movie; setPage: (p: Page) => void }) {
  return (
    <div className="page-fade min-h-screen pt-20 flex items-center justify-center" style={{ background: '#07070f' }}>
      <div className="max-w-md w-full mx-6">
        {/* Success */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(212,166,58,0.2), rgba(240,192,96,0.1))', border: '2px solid rgba(212,166,58,0.4)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#d4a63a" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display font-black text-3xl mb-2" style={{ color: '#f0f0f8' }}>Booking Confirmed!</h1>
          <p style={{ color: '#9999bb' }}>Your tickets have been booked successfully. Enjoy the show!</p>
        </div>

        {/* Ticket */}
        <div className="rounded-2xl overflow-hidden" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Top */}
          <div className="p-6 relative" style={{ background: 'linear-gradient(135deg, #1a1a2e, #13131f)' }}>
            <div className="absolute top-4 right-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(212,166,58,0.2)' }}>
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="mb-1">
              <span className="text-xs font-mono-dm tracking-widest" style={{ color: '#d4a63a' }}>BOOKING ID</span>
              <p className="font-mono-dm font-bold text-lg" style={{ color: '#f0f0f8' }}>#CNE-284719</p>
            </div>
            <h2 className="font-display font-bold text-xl mb-4 pr-20" style={{ color: '#f0f0f8' }}>{movie.title}</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Cinema', 'IMAX Downtown'],
                ['Date', 'Sat, Aug 2, 2025'],
                ['Time', '7:00 PM'],
                ['Seats', 'E5, E6'],
                ['Format', 'IMAX'],
                ['Screen', 'Hall 3'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs font-mono-dm" style={{ color: '#555570' }}>{label}</p>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center px-4">
            <div className="w-5 h-5 rounded-full -ml-6" style={{ background: '#07070f', flexShrink: 0 }} />
            <div className="flex-1 border-t-2 border-dashed mx-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <div className="w-5 h-5 rounded-full -mr-6" style={{ background: '#07070f', flexShrink: 0 }} />
          </div>

          {/* Bottom */}
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono-dm mb-1" style={{ color: '#555570' }}>Amount Paid</p>
              <p className="font-mono-dm font-bold text-2xl" style={{ color: '#d4a63a' }}>$50.96</p>
            </div>
            {/* QR Code placeholder */}
            <div className="w-20 h-20 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="grid grid-cols-4 gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ background: Math.random() > 0.4 ? '#f0f0f8' : 'transparent' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(212,166,58,0.1)', color: '#d4a63a', border: '1px solid rgba(212,166,58,0.25)' }}>
            Download Ticket
          </button>
          <button onClick={() => setPage('home')}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}