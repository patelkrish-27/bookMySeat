import { useState } from 'react';
import { Page, Movie } from '../types';
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
    <div className="page-fade min-h-screen pt-20" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="fade-up">
            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-2" style={{ color: '#f0f0f8' }}>All Movies</h1>
            <p style={{ color: '#555570' }}>Discover and book tickets for the latest releases</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 fade-up" style={{ animationDelay: '0.1s' }}>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="glass-input text-sm px-3 py-2 rounded-lg cursor-pointer"
            >
              <option value="title">Sort: Title</option>
              <option value="release">Sort: Release Date</option>
            </select>
            <button
              onClick={() => setView('grid')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: view === 'grid' ? 'rgba(212,166,58,0.12)' : 'rgba(255,255,255,0.04)',
                color: view === 'grid' ? '#d4a63a' : '#555570',
                border: `1px solid ${view === 'grid' ? 'rgba(212,166,58,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" /></svg>
            </button>
            <button
              onClick={() => setView('list')}
              className="p-2 rounded-lg transition-all"
              style={{
                background: view === 'list' ? 'rgba(212,166,58,0.12)' : 'rgba(255,255,255,0.04)',
                color: view === 'list' ? '#d4a63a' : '#555570',
                border: `1px solid ${view === 'list' ? 'rgba(212,166,58,0.2)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
            </button>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((m, i) => (
              <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <MovieCard movie={m} onClick={() => handleMovie(m)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:gap-4">
            {filtered.map((m, i) => (
              <div
                key={m.id}
                onClick={() => handleMovie(m)}
                className="glass-card flex flex-col sm:flex-row gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl cursor-pointer group fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <img src={m.poster} alt={m.title} className="w-full sm:w-20 h-40 sm:h-28 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-lg sm:text-xl" style={{ color: '#f0f0f8' }}>{m.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                    <span className="text-xs sm:text-sm glass-pill px-2 py-0.5 rounded-full" style={{ color: '#555570' }}>{m.duration}</span>
                    <span className="text-xs sm:text-sm glass-pill px-2 py-0.5 rounded-full" style={{ color: '#555570' }}>{m.language}</span>
                    <span className="text-xs sm:text-sm glass-pill px-2 py-0.5 rounded-full" style={{ color: '#555570' }}>{m.releaseDate}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#9999bb' }}>
                    {m.synopsis ? `${m.synopsis.slice(0, 140)}...` : 'No description available.'}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-between flex-shrink-0">
                  <span className="font-mono-dm font-bold text-lg" style={{ color: '#d4a63a' }}>₹{m.price}</span>
                  <button className="px-4 py-2 rounded-lg text-sm font-semibold glass-btn-gold">
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