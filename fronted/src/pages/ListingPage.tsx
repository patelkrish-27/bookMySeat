import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function ListingPage({ movies, setPage, setSelected }: {
  movies: Movie[]
  setPage: (p: Page) => void
  setSelected: (m: Movie) => void
}) {
  const [sort, setSort] = useState('title')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filtered = [...movies].sort((a, b) =>
    sort === 'release' ? b.releaseDate.localeCompare(a.releaseDate) : a.title.localeCompare(b.title)
  )

  const handleMovie = (m: Movie) => { setSelected(m); setPage('details') }

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-display font-bold text-4xl mb-2" style={{ color: '#f0f0f8' }}>All Movies</h1>
            <p style={{ color: '#555570' }}>Discover and book tickets for the latest releases</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="text-sm px-3 py-2 rounded-lg outline-none cursor-pointer"
              style={{ background: '#13131f', color: '#9999bb', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="title">Sort: Title</option>
              <option value="release">Sort: Release Date</option>
            </select>
            <button onClick={() => setView('grid')} className="p-2 rounded-lg transition-colors" style={{ background: view === 'grid' ? 'rgba(212,166,58,0.15)' : '#13131f', color: view === 'grid' ? '#d4a63a' : '#555570', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" /></svg>
            </button>
            <button onClick={() => setView('list')} className="p-2 rounded-lg transition-colors" style={{ background: view === 'list' ? 'rgba(212,166,58,0.15)' : '#13131f', color: view === 'list' ? '#d4a63a' : '#555570', border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map(m => <MovieCard key={m.id} movie={m} onClick={() => handleMovie(m)} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(m => (
              <div key={m.id} onClick={() => handleMovie(m)}
                className="flex gap-5 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:border-yellow-400/20 group"
                style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={m.poster} alt={m.title} className="w-20 h-28 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-xl" style={{ color: '#f0f0f8' }}>{m.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm" style={{ color: '#555570' }}>{m.duration} · {m.language} · {m.releaseDate}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#9999bb' }}>
                    {m.synopsis ? `${m.synopsis.slice(0, 140)}...` : 'No description available.'}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <span className="font-mono-dm font-bold text-lg" style={{ color: '#d4a63a' }}>₹{m.price}</span>
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}