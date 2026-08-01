import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';

export function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
  return (
    <div className="movie-card-hover rounded-2xl overflow-hidden cursor-pointer group" onClick={onClick}
      style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.4) 50%, transparent 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-base leading-tight mb-1" style={{ color: '#f0f0f8' }}>{movie.title}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: '#555570' }}>{movie.duration}</span>
            {movie.language && (
              <>
                <span className="w-1 h-1 rounded-full" style={{ background: '#555570' }} />
                <span className="text-xs" style={{ color: '#555570' }}>{movie.language}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}