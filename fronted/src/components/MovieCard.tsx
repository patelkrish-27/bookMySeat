import { Movie } from '../types';

export function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <div
      className="movie-card-hover glass-card rounded-2xl overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.4) 40%, transparent 100%)',
          }}
        />
        {/* Glass info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3
            className="font-display font-bold text-base leading-tight mb-1.5"
            style={{ color: '#f0f0f8' }}
          >
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs glass-pill px-2 py-0.5 rounded-full" style={{ color: '#9999bb' }}>
              {movie.duration}
            </span>
            {movie.language && (
              <span className="text-xs glass-pill px-2 py-0.5 rounded-full" style={{ color: '#9999bb' }}>
                {movie.language}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}