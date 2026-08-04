import { Page, Movie } from '../types';
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
        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-t-transparent spin-slow" style={{ borderColor: 'rgba(212,166,58,0.3)', borderTopColor: 'transparent' }} />
            <span className="text-sm">Loading movies…</span>
          </div>
        ) : 'No movies available yet.'}
      </div>
    )
  }

  return (
    <div className="page-fade">
      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={hero.backdrop} alt={hero.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #07070f 35%, rgba(7,7,15,0.75) 60%, rgba(7,7,15,0.3) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #07070f 0%, transparent 50%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text */}
            <div className="fade-up">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full font-mono-dm tracking-widest uppercase glass-pill"
                  style={{ color: '#e63946', borderColor: 'rgba(230,57,70,0.3)', background: 'rgba(230,57,70,0.12)' }}
                >
                  Now Showing
                </span>
              </div>
              <h1
                className="font-display font-black leading-none mb-4"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: '#f0f0f8', letterSpacing: '-0.02em' }}
              >
                {hero.title}
              </h1>
              <p className="text-sm sm:text-base mb-6 leading-relaxed max-w-lg" style={{ color: '#9999bb' }}>
                {hero.synopsis ? `${hero.synopsis.slice(0, 180)}...` : 'No description available.'}
              </p>
              <div className="flex items-center gap-4 sm:gap-6 mb-8 flex-wrap">
                <span className="text-sm glass-pill px-3 py-1 rounded-full" style={{ color: '#9999bb' }}>{hero.duration}</span>
                <span className="text-sm glass-pill px-3 py-1 rounded-full" style={{ color: '#9999bb' }}>{hero.language}</span>
                <span className="text-sm glass-pill px-3 py-1 rounded-full" style={{ color: '#9999bb' }}>{hero.releaseDate}</span>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <button
                  onClick={() => handleMovie(hero)}
                  className="flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm glass-btn-gold"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                  Book Now
                </button>
                <button
                  onClick={() => handleMovie(hero)}
                  className="flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-semibold text-sm glass-btn-outline"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Poster */}
            <div className="flex justify-center lg:justify-end fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative w-56 sm:w-64 lg:w-72">
                {/* Glow behind poster */}
                <div
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(212,166,58,0.25), rgba(230,57,70,0.15))', filter: 'blur(50px)', transform: 'scale(0.85) translateY(20px)' }}
                />
                <img
                  src={hero.poster}
                  alt={hero.title}
                  className="relative w-full rounded-2xl object-cover animate-float"
                  style={{ aspectRatio: '2/3', boxShadow: '0 40px 80px rgba(0,0,0,0.8)' }}
                />
                {/* Glass showtime overlay */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 glass-panel rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: '#d4a63a' }}>Next Showtime</span>
                    <span className="text-xs font-mono-dm glass-pill px-2 py-0.5 rounded-full" style={{ color: '#9999bb' }}>IMAX</span>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2">
                    {['3:45 PM', '7:00 PM', '10:15 PM'].map(t => (
                      <button
                        key={t}
                        className="text-xs px-2 py-1 rounded-lg font-mono-dm transition-all glass-btn-outline hover:border-yellow-400/20"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="fade-up">
            <h2 className="font-display font-bold text-xl sm:text-2xl" style={{ color: '#f0f0f8' }}>Now Showing</h2>
            <p className="text-sm mt-1" style={{ color: '#555570' }}>{filtered.length} movies available</p>
          </div>
          <button
            onClick={() => setPage('listing')}
            className="text-sm font-medium transition-all glass-btn-outline px-4 py-2 rounded-lg"
            style={{ color: '#d4a63a' }}
          >
            View all →
          </button>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 pb-16">
          {filtered.map((m, i) => (
            <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <MovieCard movie={m} onClick={() => handleMovie(m)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}