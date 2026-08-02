import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function HomePage({ movies, loading, setPage, setSelected }: {
  movies: Movie[]
  loading?: boolean
  setPage: (p: Page) => void
  setSelected: (m: Movie) => void
}) {
  const hero = movies[0]
  const filtered = movies

  const handleMovie = (m: Movie) => { setSelected(m); setPage('details') }

  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: '#555570' }}>
        {loading ? 'Loading movies…' : 'No movies available yet.'}
      </div>
    )
  }

  return (
    <div className="page-fade">
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero.backdrop} alt={hero.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #07070f 40%, rgba(7,7,15,0.75) 65%, rgba(7,7,15,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #07070f 0%, transparent 50%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid grid-cols-2 gap-12 items-center w-full">
          {/* Text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full font-mono-dm tracking-widest uppercase" style={{ background: 'rgba(230,57,70,0.2)', color: '#e63946', border: '1px solid rgba(230,57,70,0.3)' }}>Now Showing</span>
            </div>
            <h1 className="font-display font-black leading-none mb-4" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', color: '#f0f0f8', letterSpacing: '-0.02em' }}>
              {hero.title}
            </h1>
            <p className="text-base mb-6 leading-relaxed max-w-lg" style={{ color: '#9999bb' }}>
              {hero.synopsis ? `${hero.synopsis.slice(0, 180)}...` : 'No description available.'}
            </p>
            <div className="flex items-center gap-6 mb-8">
              <span className="text-sm" style={{ color: '#9999bb' }}>{hero.duration}</span>
              <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <span className="text-sm" style={{ color: '#9999bb' }}>{hero.language}</span>
              <span className="w-px h-4" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <span className="text-sm" style={{ color: '#9999bb' }}>{hero.releaseDate}</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleMovie(hero)}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                Book Now
              </button>
              <button
                onClick={() => handleMovie(hero)}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                View Details
              </button>
            </div>
          </div>
          {/* Poster */}
          <div className="flex justify-end">
            <div className="relative w-72">
              <div className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(212,166,58,0.3), rgba(230,57,70,0.2))', filter: 'blur(40px)', transform: 'scale(0.9) translateY(20px)' }} />
              <img src={hero.poster} alt={hero.title} className="relative w-full rounded-2xl object-cover" style={{ aspectRatio: '2/3', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }} />
              <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: '#d4a63a' }}>Next Showtime</span>
                  <span className="text-xs font-mono-dm" style={{ color: '#9999bb' }}>IMAX</span>
                </div>
                <div className="flex gap-2">
                  {['3:45 PM', '7:00 PM', '10:15 PM'].map(t => (
                    <button key={t} className="text-xs px-2 py-1 rounded-lg font-mono-dm transition-colors hover:bg-yellow-400/10"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl" style={{ color: '#f0f0f8' }}>Now Showing</h2>
            <p className="text-sm mt-1" style={{ color: '#555570' }}>{filtered.length} movies available</p>
          </div>
          <button onClick={() => setPage('listing')} className="text-sm font-medium transition-colors hover:opacity-80" style={{ color: '#d4a63a' }}>
            View all →
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-16">
          {filtered.map(m => (
            <MovieCard key={m.id} movie={m} onClick={() => handleMovie(m)} />
          ))}
        </div>
      </div>
    </div>
  )
}