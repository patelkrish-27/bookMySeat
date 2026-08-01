import { useState, useEffect } from 'react';
import { Page, Movie } from '../types';

export function DetailsPage({ movie, setPage, setSelectedShowId }: { movie: Movie; setPage: (p: Page) => void; setSelectedShowId?: (id: string) => void }) {
  const [selectedCinema, setSelectedCinema] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState('') // This will store the show ID
  const [selectedDate, setSelectedDate] = useState(0)

  const [shows, setShows] = useState<any[]>([])
  const [showsError, setShowsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false;
    fetch(`http://localhost:8080/api/v1/search/movies/${movie.id}/shows`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch shows')
        return res.json()
      })
      .then(data => {
        if (cancelled) return;
        setShows(Array.isArray(data) ? data : [])
        setShowsError(null)
      })
      .catch(err => {
        if (!cancelled) setShowsError(err.message)
      })
    return () => { cancelled = true }
  }, [movie.id])

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    // Adjust for local timezone to ensure YYYY-MM-DD matches local date
    const offset = d.getTimezoneOffset()
    const localD = new Date(d.getTime() - (offset*60*1000))
    return { 
      short: d.toLocaleDateString('en-US', { weekday: 'short' }), 
      day: d.getDate(), 
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      fullDateStr: localD.toISOString().split('T')[0]
    }
  })

  // Filter shows by selected date
  const selectedDateObj = dates[selectedDate];
  const showsOnDate = shows.filter(show => {
    if (!show.startTime) return false;
    const showDateStr = show.startTime.split('T')[0];
    return showDateStr === selectedDateObj.fullDateStr;
  });

  // Group by theater
  const theatersMap: Record<string, { id: string, cinema: string, shows: any[] }> = {};
  showsOnDate.forEach(show => {
    if (!theatersMap[show.theaterId]) {
      theatersMap[show.theaterId] = {
        id: show.theaterId,
        cinema: show.theaterName,
        shows: []
      }
    }
    theatersMap[show.theaterId].shows.push(show);
  });
  
  const theatersWithShows = Object.values(theatersMap);
  const selectedTheaterObj = theatersWithShows.find(t => t.id === selectedCinema);

  // If selected cinema is not in the list for the new date, reset it or pick first
  useEffect(() => {
    if (theatersWithShows.length > 0 && !theatersWithShows.find(t => t.id === selectedCinema)) {
      setSelectedCinema(theatersWithShows[0].id)
    } else if (theatersWithShows.length === 0) {
      setSelectedCinema('')
    }
  }, [selectedDate, showsOnDate.length])

  // Reset selected time when cinema changes or date changes
  useEffect(() => {
    setSelectedTime('')
  }, [selectedCinema, selectedDate])

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="page-fade min-h-screen pt-16" style={{ background: '#07070f' }}>
      {/* Backdrop */}
      <div className="relative h-80 overflow-hidden">
        <img src={movie.backdrop} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(7,7,15,0.3) 0%, #07070f 100%)' }} />
        <button onClick={() => setPage('listing')} className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ background: 'rgba(7,7,15,0.7)', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
          ← Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-32 relative">
        <div className="grid grid-cols-12 gap-8">
          {/* Poster */}
          <div className="col-span-3">
            <div className="sticky top-24">
              <img src={movie.poster} alt={movie.title} className="w-full rounded-2xl object-cover" style={{ aspectRatio: '2/3', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }} />
            </div>
          </div>

          {/* Details */}
          <div className="col-span-6 pt-24">
            <h1 className="font-display font-black mb-2 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', color: '#f0f0f8', letterSpacing: '-0.02em' }}>
              {movie.title}
            </h1>

            <div className="flex items-center gap-6 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#9999bb' }}>{movie.duration}</span>
              <span className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#9999bb' }}>{movie.releaseDate}</span>
              <span className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ color: '#9999bb' }}>{movie.language}</span>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-semibold font-mono-dm tracking-widest uppercase mb-3" style={{ color: '#555570' }}>Synopsis</h3>
              <p className="text-base leading-relaxed" style={{ color: '#9999bb' }}>{movie.synopsis || 'No description available.'}</p>
            </div>
          </div>

          {/* Booking Panel */}
          <div className="col-span-3 pt-24">
            <div className="sticky top-24 rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              
              {/* Date Selector */}
              <h4 className="text-xs font-mono-dm tracking-widest uppercase mb-3" style={{ color: '#555570' }}>Select Date</h4>
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                {dates.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDate(i)}
                    className="flex flex-col items-center px-3 py-2.5 rounded-xl transition-all flex-shrink-0"
                    style={{ background: selectedDate === i ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.05)', color: selectedDate === i ? '#07070f' : '#9999bb', border: selectedDate === i ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                    <span className="text-xs font-mono-dm">{d.short}</span>
                    <span className="font-bold text-lg font-mono-dm">{d.day}</span>
                    <span className="text-xs font-mono-dm">{d.month}</span>
                  </button>
                ))}
              </div>

              {showsError && (
                <p className="text-sm px-3 mb-4" style={{ color: '#ff8f97' }}>Failed to load shows: {showsError}</p>
              )}

              {theatersWithShows.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm font-semibold" style={{ color: '#9999bb' }}>No shows available for this date.</p>
                </div>
              ) : (
                <>
                  {/* Cinema */}
                  <h4 className="text-xs font-mono-dm tracking-widest uppercase mb-3" style={{ color: '#555570' }}>Cinema</h4>
                  <div className="flex flex-col gap-2 mb-5">
                    {theatersWithShows.map((s) => (
                      <button key={s.id} onClick={() => setSelectedCinema(s.id)}
                        className="text-left p-3 rounded-xl transition-all"
                        style={{ background: selectedCinema === s.id ? 'rgba(212,166,58,0.1)' : 'rgba(255,255,255,0.04)', border: selectedCinema === s.id ? '1px solid rgba(212,166,58,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: '#f0f0f8' }}>{s.cinema}</p>
                      </button>
                    ))}
                  </div>

                  {/* Showtimes */}
                  {selectedTheaterObj && (
                    <>
                      <h4 className="text-xs font-mono-dm tracking-widest uppercase mb-3" style={{ color: '#555570' }}>Showtime</h4>
                      <div className="grid grid-cols-2 gap-2 mb-5">
                        {selectedTheaterObj.shows.map(show => (
                          <button key={show.id} onClick={() => setSelectedTime(show.id)}
                            className="py-2 rounded-xl text-sm font-mono-dm font-medium transition-all"
                            style={{ background: selectedTime === show.id ? 'rgba(212,166,58,0.15)' : 'rgba(255,255,255,0.05)', color: selectedTime === show.id ? '#d4a63a' : '#9999bb', border: selectedTime === show.id ? '1px solid rgba(212,166,58,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
                            {formatTime(show.startTime)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => { 
                  if (selectedTime) {
                    if (setSelectedShowId) setSelectedShowId(selectedTime);
                    setPage('seats') 
                  }
                }}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 mt-4"
                style={{ background: selectedTime ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.08)', color: selectedTime ? '#07070f' : '#555570', cursor: selectedTime ? 'pointer' : 'default' }}
                disabled={!selectedTime}
              >
                {selectedTime ? 'Select Seats' : 'Choose a Showtime'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}