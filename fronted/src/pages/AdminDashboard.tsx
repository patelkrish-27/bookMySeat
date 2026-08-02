import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type {
  MovieAdmin,
  TheaterAdmin,
  ScreenAdmin,
  ShowAdmin,
  ShowSeatAdmin,
  SeatMapEntry,
  Page,
} from '../types'

type AdminTab = 'movies' | 'theaters' | 'screens' | 'shows'

// ── Shared helpers ──────────────────────────────────────────────────────────────

const SEAT_TYPE_CYCLE: SeatMapEntry['seatType'][] = ['REGULAR', 'PREMIUM', 'RECLINER']

function formatDate(dt: string): string {
  return new Date(dt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

/**
 * Converts a datetime-local value ("2024-01-01T14:00") to a full
 * ISO-8601 string ("2024-01-01T14:00:00") that Jackson can parse
 * as LocalDateTime without throwing.
 */
function toIsoDateTime(value: string): string {
  if (!value) return value
  // datetime-local gives "YYYY-MM-DDTHH:mm" — append seconds if missing
  return value.length === 16 ? `${value}:00` : value
}

// ── Toast / error notification ─────────────────────────────────────────────────

interface Toast {
  id: number
  type: 'error' | 'success'
  message: string
}

let toastCounter = 0

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'error') => {
    const id = ++toastCounter
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  return { toasts, show }
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" style={{ maxWidth: 360 }}>
      {toasts.map(t => (
        <div
          key={t.id}
          className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg"
          style={{
            background: t.type === 'error' ? 'rgba(230,57,70,0.92)' : 'rgba(34,197,94,0.92)',
            color: '#fff',
            border: `1px solid ${t.type === 'error' ? 'rgba(230,57,70,0.5)' : 'rgba(34,197,94,0.5)'}`,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

// ── Movies ─────────────────────────────────────────────────────────────────────

function MoviesTab() {
  const [movies, setMovies] = useState<MovieAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<MovieAdmin | null>(null)
  const [creating, setCreating] = useState(false)
  const { toasts, show: toast } = useToast()

  const load = () => {
    setLoading(true)
    adminApi.getAllMovies()
      .then(setMovies)
      .catch(() => setMovies([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleSubmit = async (body: Partial<MovieAdmin>) => {
    try {
      if (editing) {
        await adminApi.updateMovie(editing.id, body)
        toast('Movie updated successfully', 'success')
      } else {
        await adminApi.createMovie(body)
        toast('Movie created successfully', 'success')
      }
      setEditing(null)
      setCreating(false)
      load()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to save movie')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this movie? This cannot be undone if it has no shows.')) return
    try {
      await adminApi.deleteMovie(id)
      toast('Movie deleted', 'success')
      load()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to delete movie')
    }
  }

  const MovieForm = ({ initial, onCancel }: { initial?: MovieAdmin; onCancel: () => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        handleSubmit({
          title: data.get('title') as string,
          description: data.get('description') as string,
          durationMins: Number(data.get('durationMins')),
          language: data.get('language') as string,
          releaseDate: data.get('releaseDate') as string,
          posterUrl: data.get('posterUrl') as string,
          backdropUrl: data.get('backdropUrl') as string,
        })
      }}
      className="grid grid-cols-2 gap-4"
    >
      {(['title', 'description', 'durationMins', 'language', 'releaseDate', 'posterUrl', 'backdropUrl'] as const).map((f) => (
        <div key={f} className={`flex flex-col ${f === 'description' ? 'col-span-2' : ''}`}>
          <label className="text-xs text-[#555570] mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
          <input
            name={f}
            type={f === 'durationMins' ? 'number' : f === 'releaseDate' ? 'date' : 'text'}
            defaultValue={initial?.[f as keyof MovieAdmin] as string}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}
            required={f === 'title' || f === 'durationMins'}
          />
        </div>
      ))}
      <div className="col-span-2 flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
        >
          {initial ? 'Update' : 'Create'} Movie
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#9999bb' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold" style={{ color: '#f0f0f8' }}>Movies</h2>
        <button
          onClick={() => { setCreating(true); setEditing(null) }}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
        >
          + New Movie
        </button>
      </div>

      {(creating || editing) && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0f8' }}>{editing ? 'Edit Movie' : 'New Movie'}</h3>
          <MovieForm initial={editing ?? undefined} onCancel={() => { setCreating(false); setEditing(null) }} />
        </div>
      )}

      {loading ? <div style={{ color: '#9999bb' }}>Loading…</div> : (
        <div className="space-y-3">
          {movies.length === 0 && (
            <div className="text-center py-12" style={{ color: '#555570' }}>No movies yet. Add one above.</div>
          )}
          {movies.map((m) => (
            <div key={m.id} className="rounded-xl p-4 flex justify-between items-center"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span className="font-semibold" style={{ color: '#f0f0f8' }}>{m.title}</span>
                <span className="text-xs mx-2" style={{ color: '#555570' }}>{m.language} · {m.durationMins} min</span>
                <span className="text-xs" style={{ color: '#555570' }}>{m.releaseDate}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(m); setCreating(false) }}
                  className="text-sm px-3 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#d4a63a' }}>Edit</button>
                <button onClick={() => handleDelete(m.id)}
                  className="text-sm px-3 py-1 rounded"
                  style={{ background: 'rgba(230,57,70,0.12)', color: '#ff8f97', border: '1px solid rgba(230,57,70,0.3)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Theaters ───────────────────────────────────────────────────────────────────

function TheatersTab() {
  const [theaters, setTheaters] = useState<TheaterAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<TheaterAdmin | null>(null)
  const [creating, setCreating] = useState(false)
  const { toasts, show: toast } = useToast()

  const load = () => {
    setLoading(true)
    adminApi.getAllTheaters()
      .then(setTheaters)
      .catch(() => setTheaters([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  const handleSubmit = async (body: Partial<TheaterAdmin>) => {
    try {
      if (editing) {
        await adminApi.updateTheater(editing.id, body)
        toast('Theater updated', 'success')
      } else {
        await adminApi.createTheater(body)
        toast('Theater created', 'success')
      }
      setEditing(null)
      setCreating(false)
      load()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to save theater')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this theater? All screens must be removed first.')) return
    try {
      await adminApi.deleteTheater(id)
      toast('Theater deleted', 'success')
      load()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to delete theater')
    }
  }

  const TheaterForm = ({ initial, onCancel }: { initial?: TheaterAdmin; onCancel: () => void }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        handleSubmit({
          name: data.get('name') as string,
          city: data.get('city') as string,
          address: data.get('address') as string,
        })
      }}
      className="grid grid-cols-2 gap-4"
    >
      {(['name', 'city', 'address'] as const).map((f) => (
        <div key={f} className={`flex flex-col ${f === 'address' ? 'col-span-2' : ''}`}>
          <label className="text-xs text-[#555570] mb-1 capitalize">{f}</label>
          <input
            name={f}
            type="text"
            defaultValue={initial?.[f as keyof TheaterAdmin] as string}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}
            required={f === 'name' || f === 'city'}
            placeholder={f === 'address' ? 'Full address' : ''}
          />
        </div>
      ))}
      <div className="col-span-2 flex gap-3">
        <button type="submit" className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
          {initial ? 'Update' : 'Create'} Theater
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#9999bb' }}>Cancel</button>
      </div>
    </form>
  )

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold" style={{ color: '#f0f0f8' }}>Theaters</h2>
        <button onClick={() => { setCreating(true); setEditing(null) }}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
          + New Theater
        </button>
      </div>

      {(creating || editing) && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0f8' }}>{editing ? 'Edit Theater' : 'New Theater'}</h3>
          <TheaterForm initial={editing ?? undefined} onCancel={() => { setCreating(false); setEditing(null) }} />
        </div>
      )}

      {loading ? <div style={{ color: '#9999bb' }}>Loading…</div> : (
        <div className="space-y-3">
          {theaters.length === 0 && (
            <div className="text-center py-12" style={{ color: '#555570' }}>No theaters yet. Add one above.</div>
          )}
          {theaters.map((t) => (
            <div key={t.id} className="rounded-xl p-4 flex justify-between items-center"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <span className="font-semibold" style={{ color: '#f0f0f8' }}>{t.name}</span>
                <span className="text-xs mx-2" style={{ color: '#555570' }}>{t.city}</span>
                <span className="text-xs" style={{ color: '#555570' }}>· {t.totalScreens} screen{t.totalScreens !== 1 ? 's' : ''}</span>
                <div className="text-xs mt-0.5" style={{ color: '#555570' }}>{t.address}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t); setCreating(false) }}
                  className="text-sm px-3 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#d4a63a' }}>Edit</button>
                <button onClick={() => handleDelete(t.id)}
                  className="text-sm px-3 py-1 rounded"
                  style={{ background: 'rgba(230,57,70,0.12)', color: '#ff8f97', border: '1px solid rgba(230,57,70,0.3)' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Screens ────────────────────────────────────────────────────────────────────

function ScreensTab() {
  const [theaters, setTheaters] = useState<TheaterAdmin[]>([])
  const [screens, setScreens] = useState<ScreenAdmin[]>([])
  const [selectedTheater, setSelectedTheater] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { toasts, show: toast } = useToast()

  // ── Seat map builder state ──
  const [seatMap, setSeatMap] = useState<SeatMapEntry[]>([])
  const [rows, setRows] = useState(10)
  const [seatsPerRow, setSeatsPerRow] = useState(10)

  const loadTheaters = () => {
    adminApi.getAllTheaters()
      .then(setTheaters)
      .catch(() => setTheaters([]))
  }

  const loadScreens = (theaterId?: string) => {
    setLoading(true)
    const req = theaterId
      ? adminApi.getScreensForTheater(theaterId)
      : adminApi.getAllScreens()
    req
      .then(setScreens)
      .catch(() => setScreens([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadTheaters(); loadScreens() }, [])

  const handleTheaterChange = (id: string) => {
    setSelectedTheater(id)
    loadScreens(id || undefined)
  }

  /**
   * Generate seat grid using explicit row/col params to avoid closure over
   * stale state when called from the "Regenerate" button or startCreate.
   */
  const buildSeatMap = (numRows: number, numSeatsPerRow: number): SeatMapEntry[] => {
    const map: SeatMapEntry[] = []
    for (let r = 0; r < numRows; r++) {
      const row = String.fromCharCode(65 + r)
      for (let s = 1; s <= numSeatsPerRow; s++) {
        map.push({ seatRow: row, seatNumber: s, seatType: 'REGULAR' })
      }
    }
    return map
  }

  const toggleSeatType = (index: number) => {
    setSeatMap(prev => prev.map((seat, i) => {
      if (i !== index) return seat
      const currentIndex = SEAT_TYPE_CYCLE.indexOf(seat.seatType)
      const nextType = SEAT_TYPE_CYCLE[(currentIndex + 1) % SEAT_TYPE_CYCLE.length]
      return { ...seat, seatType: nextType }
    }))
  }

  const handleCreateScreen = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    if (seatMap.length === 0) {
      toast('Please generate a seat map before creating the screen')
      return
    }
    try {
      await adminApi.createScreen({
        theaterId: data.get('theaterId') as string,
        name: data.get('name') as string,
        seats: seatMap,
      })
      toast('Screen created successfully', 'success')
      setCreating(false)
      setSeatMap([])
      loadScreens(selectedTheater || undefined)
      loadTheaters() // refresh screen counts
    } catch (e: any) {
      toast(e?.message ?? 'Failed to create screen')
    }
  }

  const startCreate = () => {
    const map = buildSeatMap(rows, seatsPerRow)
    setSeatMap(map)
    setCreating(true)
  }

  const seatColors: Record<string, string> = {
    REGULAR: '#1a1a25',
    PREMIUM: '#1a1a35',
    RECLINER: '#1a2a3a',
  }
  const seatBorderColors: Record<string, string> = {
    REGULAR: 'rgba(255,255,255,0.1)',
    PREMIUM: 'rgba(150,100,255,0.35)',
    RECLINER: 'rgba(100,180,255,0.35)',
  }
  const seatTextColors: Record<string, string> = {
    REGULAR: '#555570',
    PREMIUM: '#938ffc',
    RECLINER: '#64b8ff',
  }

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold" style={{ color: '#f0f0f8' }}>Screens</h2>
        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
          disabled={theaters.length === 0}
          title={theaters.length === 0 ? 'Add a theater first' : ''}
        >
          + New Screen
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedTheater}
          onChange={(e) => handleTheaterChange(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}
        >
          <option value="">All Theaters</option>
          {theaters.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
        </select>
      </div>

      {creating && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0f8' }}>New Screen</h3>
          <form onSubmit={handleCreateScreen}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-[#555570] mb-1 block">Theater</label>
                <select name="theaterId" className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }} required>
                  {theaters.map(t => <option key={t.id} value={t.id}>{t.name} ({t.city})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#555570] mb-1 block">Screen name</label>
                <input name="name" type="text" placeholder="e.g. Screen 1"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }} required />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-[#555570] mb-1 block">Rows (A–{String.fromCharCode(64 + rows)})</label>
                  <input
                    type="number" min={1} max={26} value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[#555570] mb-1 block">Seats/row</label>
                  <input
                    type="number" min={1} max={30} value={seatsPerRow}
                    onChange={(e) => setSeatsPerRow(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSeatMap(buildSeatMap(rows, seatsPerRow))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold mb-4"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#d4a63a' }}
            >
              ↺ Regenerate Grid ({rows} × {seatsPerRow} = {rows * seatsPerRow} seats)
            </button>

            {/* Seat map legend */}
            <div className="flex gap-4 mb-3">
              {(['REGULAR', 'PREMIUM', 'RECLINER'] as const).map(type => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-sm"
                    style={{ background: seatColors[type], border: `1px solid ${seatBorderColors[type]}` }} />
                  <span className="text-xs" style={{ color: seatTextColors[type] }}>{type}</span>
                </div>
              ))}
              <span className="text-xs ml-2" style={{ color: '#555570' }}>Click a seat to cycle its type</span>
            </div>

            {/* Seat grid */}
            <div className="mb-4 overflow-x-auto">
              <div className="inline-grid gap-1"
                style={{ gridTemplateColumns: `repeat(${seatsPerRow}, 1.75rem)` }}>
                {seatMap.map((seat, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleSeatType(i)}
                    className="w-7 h-7 rounded-t-xl text-xs font-bold"
                    style={{
                      background: seatColors[seat.seatType],
                      border: `1px solid ${seatBorderColors[seat.seatType]}`,
                      color: seatTextColors[seat.seatType],
                      cursor: 'pointer',
                    }}
                    title={`${seat.seatRow}${seat.seatNumber} — ${seat.seatType}`}
                  >
                    {seat.seatNumber}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit"
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                Create Screen
              </button>
              <button type="button"
                onClick={() => { setCreating(false); setSeatMap([]) }}
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#9999bb' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ color: '#9999bb' }}>Loading…</div> : (
        <div className="space-y-3">
          {screens.length === 0 && (
            <div className="text-center py-12" style={{ color: '#555570' }}>No screens found.</div>
          )}
          {screens.map((s) => (
            <div key={s.id} className="rounded-xl p-4"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold" style={{ color: '#f0f0f8' }}>{s.name}</span>
                  <span className="text-xs mx-2" style={{ color: '#555570' }}>{s.theaterName} · {s.totalSeats} seats</span>
                  {s.seats && s.seats.length > 0 && (
                    <div className="mt-1 flex gap-3 text-xs" style={{ color: '#555570' }}>
                      {(['REGULAR', 'PREMIUM', 'RECLINER'] as const).map(type => {
                        const count = s.seats.filter(seat => seat.seatType === type).length
                        return count > 0 ? (
                          <span key={type} style={{ color: seatTextColors[type] }}>
                            {count} {type}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (!window.confirm('Delete this screen? This cannot be undone.')) return
                    try {
                      await adminApi.deleteScreen(s.id)
                      toast('Screen deleted', 'success')
                      loadScreens(selectedTheater || undefined)
                      loadTheaters()
                    } catch (e: any) {
                      toast(e?.message ?? 'Failed to delete screen')
                    }
                  }}
                  className="text-sm px-3 py-1 rounded"
                  style={{ background: 'rgba(230,57,70,0.12)', color: '#ff8f97', border: '1px solid rgba(230,57,70,0.3)' }}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


// ── Shows ──────────────────────────────────────────────────────────────────────

function ShowsTab() {
  const [movies, setMovies] = useState<MovieAdmin[]>([])
  const [screens, setScreens] = useState<ScreenAdmin[]>([])
  const [shows, setShows] = useState<ShowAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  // editingShow: the show currently open in the Edit form
  const [editingShow, setEditingShow] = useState<ShowAdmin | null>(null)
  // viewingSeatsFor: show whose seat breakdown is displayed (separate from editing)
  const [viewingSeatsFor, setViewingSeatsFor] = useState<ShowAdmin | null>(null)
  const [showSeats, setShowSeats] = useState<ShowSeatAdmin[]>([])
  const { toasts, show: toast } = useToast()

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      adminApi.getAllMovies(),
      adminApi.getAllScreens(),
      adminApi.getAllShows(),
    ]).then(([m, s, sh]) => {
      setMovies(m)
      setScreens(s)
      setShows(sh)
    }).catch(() => {
      setMovies([])
      setScreens([])
      setShows([])
    }).finally(() => setLoading(false))
  }

  useEffect(() => loadAll(), [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, editId?: string) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const body = {
      movieId: data.get('movieId') as string,
      screenId: data.get('screenId') as string,
      // Fix: datetime-local gives "YYYY-MM-DDTHH:mm" — append seconds so
      // Jackson can parse it as LocalDateTime without throwing.
      startTime: toIsoDateTime(data.get('startTime') as string),
    }
    try {
      if (editId) {
        await adminApi.updateShow(editId, body)
        toast('Show updated', 'success')
      } else {
        await adminApi.createShow(body)
        toast('Show created — seats generated automatically', 'success')
      }
      setCreating(false)
      setEditingShow(null)
      loadAll()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to save show')
    }
  }

  const handleDelete = async (id: string, movieTitle: string) => {
    if (!window.confirm(`Delete the show "${movieTitle}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteShow(id)
      toast('Show deleted', 'success')
      loadAll()
    } catch (e: any) {
      toast(e?.message ?? 'Failed to delete show')
    }
  }

  const handleViewSeats = async (show: ShowAdmin) => {
    // Close edit form if open, then open seat view
    setEditingShow(null)
    setCreating(false)
    if (viewingSeatsFor?.id === show.id) {
      // Toggle off if already viewing this show's seats
      setViewingSeatsFor(null)
      setShowSeats([])
      return
    }
    try {
      const seats = await adminApi.getShowSeats(show.id)
      setShowSeats(seats)
      setViewingSeatsFor(show)
    } catch (e: any) {
      toast(e?.message ?? 'Failed to load seat layout')
    }
  }

  const openEdit = (show: ShowAdmin) => {
    // Close seat view if open, then open edit form
    setViewingSeatsFor(null)
    setShowSeats([])
    setCreating(false)
    setEditingShow(show)
  }

  const openCreate = () => {
    setViewingSeatsFor(null)
    setShowSeats([])
    setEditingShow(null)
    setCreating(true)
  }

  /** Returns the default value for the datetime-local input (strips seconds). */
  const toInputValue = (isoStr?: string): string => {
    if (!isoStr) return ''
    return isoStr.slice(0, 16)
  }

  const ShowForm = ({ initial, onCancel }: { initial?: ShowAdmin; onCancel: () => void }) => (
    <form onSubmit={(e) => handleSubmit(e, initial?.id)} className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-xs text-[#555570] mb-1 block">Movie</label>
        <select name="movieId" required defaultValue={initial?.movieId ?? ''}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}>
          <option value="" disabled>Select a movie</option>
          {movies.map(m => <option key={m.id} value={m.id}>{m.title} ({m.durationMins} min)</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-[#555570] mb-1 block">Screen</label>
        <select name="screenId" required defaultValue={initial?.screenId ?? ''}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }}>
          <option value="" disabled>Select a screen</option>
          {screens.map(s => <option key={s.id} value={s.id}>{s.theaterName} — {s.name} ({s.totalSeats} seats)</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <label className="text-xs text-[#555570] mb-1 block">Start time</label>
        <input name="startTime" type="datetime-local" required
          defaultValue={toInputValue(initial?.startTime)}
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{ background: '#07070f', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8' }} />
        <p className="text-xs mt-1" style={{ color: '#555570' }}>
          End time is calculated automatically from movie duration.
        </p>
      </div>
      <div className="col-span-2 flex gap-3">
        <button type="submit" className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
          {initial ? 'Update' : 'Create'} Show
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#9999bb' }}>
          Cancel
        </button>
      </div>
    </form>
  )

  const seatTypeColor: Record<string, string> = {
    REGULAR: '#9999bb',
    PREMIUM: '#938ffc',
    RECLINER: '#64b8ff',
  }

  return (
    <div>
      <ToastContainer toasts={toasts} />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-display font-bold" style={{ color: '#f0f0f8' }}>Shows</h2>
        <button onClick={openCreate}
          className="px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
          + New Show
        </button>
      </div>

      {/* Create / Edit form */}
      {(creating || editingShow) && (
        <div className="rounded-xl p-6 mb-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#f0f0f8' }}>
            {editingShow ? `Edit Show — ${editingShow.movieTitle}` : 'New Show'}
          </h3>
          <ShowForm
            initial={editingShow ?? undefined}
            onCancel={() => { setCreating(false); setEditingShow(null) }}
          />
        </div>
      )}

      {/* Seat breakdown panel */}
      {viewingSeatsFor && showSeats.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-semibold" style={{ color: '#f0f0f8' }}>
                Seat Layout — {viewingSeatsFor.movieTitle}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: '#555570' }}>
                {viewingSeatsFor.theaterName} · {viewingSeatsFor.screenName} · {formatDate(viewingSeatsFor.startTime)}
              </p>
            </div>
            <button
              onClick={() => { setViewingSeatsFor(null); setShowSeats([]) }}
              className="text-xs px-3 py-1 rounded"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#9999bb' }}>
              Close
            </button>
          </div>
          {/* Seat grid */}
          <div className="grid gap-1.5 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))' }}>
            {showSeats.map((ss) => (
              <div key={ss.showSeatId}
                className="px-2 py-1 rounded-lg text-xs flex flex-col"
                style={{
                  background: ss.status === 'AVAILABLE' ? 'rgba(255,255,255,0.04)' : 'rgba(230,57,70,0.1)',
                  border: `1px solid ${ss.status === 'AVAILABLE' ? 'rgba(255,255,255,0.08)' : 'rgba(230,57,70,0.2)'}`,
                }}>
                <span className="font-semibold" style={{ color: seatTypeColor[ss.seatType] ?? '#f0f0f8' }}>
                  {ss.seatRow}{ss.seatNumber}
                </span>
                <span style={{ color: '#555570' }}>₹{ss.price.toFixed(0)}</span>
                <span style={{ color: ss.status === 'AVAILABLE' ? '#4ade80' : '#ff8f97', fontSize: 10 }}>
                  {ss.status}
                </span>
              </div>
            ))}
          </div>
          {/* Seat counts summary */}
          <div className="flex gap-4 text-xs border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {(['REGULAR', 'PREMIUM', 'RECLINER'] as const).map(type => {
              const all = showSeats.filter(s => s.seatType === type)
              const available = all.filter(s => s.status === 'AVAILABLE').length
              return all.length > 0 ? (
                <span key={type} style={{ color: seatTypeColor[type] }}>
                  {type}: {available}/{all.length} available
                </span>
              ) : null
            })}
            <span style={{ color: '#555570', marginLeft: 'auto' }}>
              Total: {showSeats.filter(s => s.status === 'AVAILABLE').length}/{showSeats.length} available
            </span>
          </div>
        </div>
      )}

      {loading ? <div style={{ color: '#9999bb' }}>Loading…</div> : (
        <>
          {shows.length === 0 && (
            <div className="text-center py-12" style={{ color: '#555570' }}>No shows yet. Add one above.</div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left py-2 pr-4" style={{ color: '#555570' }}>Movie</th>
                  <th className="text-left py-2 pr-4" style={{ color: '#555570' }}>Screen / Theater</th>
                  <th className="text-left py-2 pr-4" style={{ color: '#555570' }}>Start</th>
                  <th className="text-left py-2 pr-4" style={{ color: '#555570' }}>End</th>
                  <th className="text-right py-2" style={{ color: '#555570' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s.id}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: viewingSeatsFor?.id === s.id ? 'rgba(212,166,58,0.04)' : 'transparent',
                    }}>
                    <td className="py-2 pr-4" style={{ color: '#f0f0f8' }}>{s.movieTitle}</td>
                    <td className="py-2 pr-4" style={{ color: '#9999bb' }}>{s.theaterName} — {s.screenName}</td>
                    <td className="py-2 pr-4" style={{ color: '#9999bb' }}>{formatDate(s.startTime)}</td>
                    <td className="py-2 pr-4" style={{ color: '#555570' }}>{formatDate(s.endTime)}</td>
                    <td className="py-2 text-right">
                      <button onClick={() => handleViewSeats(s)}
                        className="text-xs px-2 py-1 rounded mr-1"
                        style={{
                          background: viewingSeatsFor?.id === s.id ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
                          color: '#4ade80',
                          border: viewingSeatsFor?.id === s.id ? '1px solid rgba(74,222,128,0.3)' : 'none',
                        }}>
                        Seats
                      </button>
                      <button onClick={() => openEdit(s)}
                        className="text-xs px-2 py-1 rounded mr-1"
                        style={{ background: 'rgba(255,255,255,0.08)', color: '#d4a63a' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s.id, s.movieTitle)}
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: 'rgba(230,57,70,0.12)', color: '#ff8f97', border: '1px solid rgba(230,57,70,0.3)' }}>
                        Del
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

// ── Admin Dashboard shell ──────────────────────────────────────────────────────

interface AdminDashboardProps {
  setPage: (p: Page) => void
}

export function AdminDashboard({ setPage }: AdminDashboardProps) {
  const { isAdmin } = useAuth()
  const [tab, setTab] = useState<AdminTab>('movies')

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: '#07070f' }}>
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl mb-3" style={{ color: '#f0f0f8' }}>Access Denied</h2>
          <p className="mb-6" style={{ color: '#9999bb' }}>This page is only available to admin users.</p>
          <button
            onClick={() => setPage('home')}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'movies',   label: '🎬 Movies'   },
    { key: 'theaters', label: '🏛 Theaters'  },
    { key: 'screens',  label: '📺 Screens'   },
    { key: 'shows',    label: '🎟 Shows'     },
  ]

  return (
    <div className="min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <button
            onClick={() => setPage('home')}
            className="text-sm mb-4 inline-block"
            style={{ color: '#555570' }}
          >
            ← Back to Home
          </button>
          <h1 className="font-display font-bold text-3xl" style={{ color: '#f0f0f8' }}>Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#555570' }}>
            Manage movies → add theaters → add screens with seat maps → schedule shows
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderBottom: t.key === tab ? '2px solid #d4a63a' : '2px solid transparent',
                color: t.key === tab ? '#d4a63a' : '#9999bb',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'movies'   && <MoviesTab />}
        {tab === 'theaters' && <TheatersTab />}
        {tab === 'screens'  && <ScreensTab />}
        {tab === 'shows'    && <ShowsTab />}
      </div>
    </div>
  )
}
