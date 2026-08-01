import { useState, useEffect } from 'react';
import { Page, Movie, SeatItem } from '../types';
import { generateSeats } from '../data/mockData';

export function SeatsPage({ movie, setPage, showId }: { movie: Movie; setPage: (p: Page) => void; showId?: string }) {
  const [seats, setSeats] = useState<SeatItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!showId) {
      setSeats(generateSeats())
      setLoading(false)
      return
    }

    let cancelled = false;
    setLoading(true);
    fetch(`http://localhost:8080/api/v1/search/shows/${showId}/seats`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch seats')
        return res.json()
      })
      .then(data => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          const mappedSeats: SeatItem[] = data.map((s: any) => ({
            id: s.showSeatId,
            row: s.seatRow,
            num: s.seatNumber,
            type: s.seatType?.toLowerCase() === 'premium' ? 'premium' 
                : s.seatType?.toLowerCase() === 'recliner' ? 'recliner' 
                : 'standard',
            status: s.status?.toLowerCase() === 'available' ? 'available' : 'taken',
            price: s.price
          }))
          setSeats(mappedSeats)
          setError(null)
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [showId])

  const toggleSeat = (id: string) => {
    const seat = seats.find(s => s.id === id)
    if (!seat || seat.status === 'taken') return
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(s => s !== id))
      setSeats(prev => prev.map(s => s.id === id ? { ...s, status: 'available' } : s))
    } else {
      if (selected.length >= 6) return
      setSelected(prev => [...prev, id])
      setSeats(prev => prev.map(s => s.id === id ? { ...s, status: 'selected' } : s))
    }
  }

  // Dynamically compute rows from the fetched seats, fallback to standard rows if empty
  const dynamicRows = Array.from(new Set(seats.map(s => s.row))).sort();
  const rows = dynamicRows.length > 0 ? dynamicRows : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  
  const typePrice: Record<string, number> = { recliner: 5, premium: 3, standard: 0 } // Fallback if backend doesn't provide price

  // Sum up prices of selected seats. Use backend price if available, else fallback logic
  const totalPrice = selected.reduce((acc, id) => {
    const seat = seats.find(s => s.id === id)
    if (!seat) return acc;
    if (seat.price != null) {
      return acc + seat.price;
    }
    // fallback
    return acc + movie.price + typePrice[seat.type];
  }, 0)

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => setPage('details')} className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70" style={{ color: '#9999bb' }}>← Back to Details</button>

        <div className="grid grid-cols-12 gap-8">
          {/* Seat Map */}
          <div className="col-span-8">
            <h1 className="font-display font-bold text-3xl mb-1" style={{ color: '#f0f0f8' }}>Select Your Seats</h1>
            <p className="text-sm mb-8" style={{ color: '#555570' }}>{movie.title}</p>

            {/* Screen */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-3/4 h-2 rounded-full mb-2" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,166,58,0.6), transparent)' }} />
              <span className="text-xs font-mono-dm tracking-widest uppercase" style={{ color: '#555570' }}>Screen</span>
            </div>

            {loading ? (
              <div className="text-center py-20" style={{ color: '#9999bb' }}>Loading seats...</div>
            ) : error ? (
              <div className="text-center py-20" style={{ color: '#ff8f97' }}>Error: {error}</div>
            ) : (
              /* Seats */
              <div className="space-y-3">
                {rows.map(row => {
                  const rowSeats = seats.filter(s => s.row === row).sort((a, b) => a.num - b.num)
                  if (rowSeats.length === 0) return null;
                  const type = rowSeats[0]?.type
                  return (
                    <div key={row} className="flex items-center gap-3">
                      <span className="w-5 text-center text-xs font-mono-dm font-bold" style={{ color: '#555570' }}>{row}</span>
                      <div className="flex gap-2 flex-1 justify-center">
                        {rowSeats.map((seat) => {
                          const color = seat.status === 'taken'
                            ? '#1e1e2e'
                            : seat.status === 'selected'
                              ? '#d4a63a'
                              : seat.type === 'recliner'
                                ? '#1a2a3a'
                                : seat.type === 'premium'
                                  ? '#1a1a35'
                                  : '#1a1a25'
                          const border = seat.status === 'taken'
                            ? '1px solid #2a2a3a'
                            : seat.status === 'selected'
                              ? '1px solid #f0c060'
                              : seat.type === 'recliner'
                                ? '1px solid rgba(100,180,255,0.25)'
                                : seat.type === 'premium'
                                  ? '1px solid rgba(150,100,255,0.25)'
                                  : '1px solid rgba(255,255,255,0.08)'
                          return (
                            <button
                              key={seat.id}
                              onClick={() => toggleSeat(seat.id)}
                              disabled={seat.status === 'taken'}
                              className="seat-btn w-8 h-7 rounded-t-xl text-xs font-mono-dm font-bold transition-all"
                              style={{ background: color, border, color: seat.status === 'selected' ? '#07070f' : seat.status === 'taken' ? '#333350' : '#9999bb', cursor: seat.status === 'taken' ? 'not-allowed' : 'pointer' }}
                              title={`Row ${seat.row} Seat ${seat.num} · ${seat.type} ${seat.price ? '· $' + seat.price : ''}`}
                            >
                              {seat.num}
                            </button>
                          )
                        })}
                      </div>
                      <span className="w-16 text-right text-xs font-mono-dm" style={{ color: type === 'recliner' ? 'rgba(100,180,255,0.7)' : type === 'premium' ? 'rgba(150,100,255,0.7)' : '#555570' }}>
                        {type}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 mt-10 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { label: 'Available', color: '#1a1a25', border: 'rgba(255,255,255,0.1)' },
                { label: 'Selected', color: '#d4a63a', border: '#f0c060' },
                { label: 'Taken', color: '#1e1e2e', border: '#2a2a3a' },
                { label: 'Premium', color: '#1a1a35', border: 'rgba(150,100,255,0.3)' },
                { label: 'Recliner', color: '#1a2a3a', border: 'rgba(100,180,255,0.3)' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className="w-6 h-5 rounded-t-lg" style={{ background: l.color, border: `1px solid ${l.border}` }} />
                  <span className="text-xs" style={{ color: '#555570' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="col-span-4">
            <div className="sticky top-24 rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-xl mb-5" style={{ color: '#f0f0f8' }}>Order Summary</h3>

              <div className="flex gap-3 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-display font-bold text-sm" style={{ color: '#f0f0f8' }}>{movie.title}</p>
                </div>
              </div>

              {selected.length > 0 ? (
                <div className="space-y-2 mb-5">
                  {selected.map(id => {
                    const seat = seats.find(s => s.id === id)!
                    const price = seat.price != null ? seat.price : (movie.price + typePrice[seat.type]);
                    return (
                      <div key={id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(212,166,58,0.08)', border: '1px solid rgba(212,166,58,0.15)' }}>
                        <div>
                          <span className="text-sm font-semibold font-mono-dm" style={{ color: '#d4a63a' }}>{seat.row}{seat.num}</span>
                          <span className="text-xs ml-2 capitalize" style={{ color: '#555570' }}>{seat.type}</span>
                        </div>
                        <span className="text-sm font-mono-dm" style={{ color: '#f0f0f8' }}>${price.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-center py-6" style={{ color: '#555570' }}>No seats selected yet</p>
              )}

              <div className="space-y-2 pt-4 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#9999bb' }}>Tickets ({selected.length}x)</span>
                  <span style={{ color: '#f0f0f8' }}>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#9999bb' }}>Booking fee</span>
                  <span style={{ color: '#f0f0f8' }}>${selected.length > 0 ? '1.50' : '0.00'}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ color: '#f0f0f8' }}>Total</span>
                  <span style={{ color: '#d4a63a' }}>${selected.length > 0 ? (totalPrice + 1.5).toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <button
                onClick={() => { if (selected.length > 0) setPage('food') }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: selected.length > 0 ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.08)', color: selected.length > 0 ? '#07070f' : '#555570', cursor: selected.length > 0 ? 'pointer' : 'default' }}
              >
                {selected.length > 0 ? `Continue with ${selected.length} seat${selected.length > 1 ? 's' : ''}` : 'Select seats to continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}