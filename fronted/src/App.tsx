import { useState, useEffect } from 'react';
import { Page, Movie } from './types';
import { DEMO_MOVIES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP } from './data/mockData';
import { Nav } from './components/Nav';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { DetailsPage } from './pages/DetailsPage';
import { SeatsPage } from './pages/SeatsPage';
import { FoodPage } from './pages/FoodPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';

// ─── Root App ─────────────────────────────────────────────────────────────────
const MOVIES_API_URL = 'http://localhost:8080/api/v1/search/movies'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [moviesList, setMoviesList] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [moviesError, setMoviesError] = useState<string | null>(null)
  const [moviesLoading, setMoviesLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    setMoviesLoading(true)
    fetch(MOVIES_API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        return res.json()
      })
      .then((data: any) => {
        if (cancelled) return
        // Some APIs wrap the array, e.g. { movies: [...] } or { content: [...] } —
        // handle a plain array first, then fall back to common wrapper shapes.
        const rows: any[] = Array.isArray(data) ? data : (data?.movies ?? data?.content ?? [])
        if (!Array.isArray(rows) || rows.length === 0) {
          setMoviesError('The movies API returned no data.')
          return
        }
        // Only map fields that actually exist on the `movies` table/response.
        // Everything else (poster/backdrop) falls back to a generic placeholder
        // until the backend serves real images.
        const backendMovies: Movie[] = rows.map((d) => ({
          id: d.id,
          title: d.title,
          synopsis: d.description ?? '',
          duration: d.durationMins != null ? `${d.durationMins} min` : '',
          language: d.language ?? '',
          releaseDate: d.releaseDate ?? '',
          poster: d.posterUrl || PLACEHOLDER_POSTER,
          backdrop: d.backdropUrl || PLACEHOLDER_BACKDROP,
          price: d.price ?? 0, // placeholder until show pricing exists
          featured: false,
        }))
        setMoviesList(backendMovies)
        setSelectedMovie(backendMovies[0])
        setMoviesError(null)
      })
      .catch(err => {
        if (cancelled) return
        console.error('Failed to fetch movies:', err)
        setMoviesError(
          err instanceof TypeError
            ? `Could not reach ${MOVIES_API_URL}. Is the backend running and CORS enabled?`
            : err.message
        )
      })
      .finally(() => { if (!cancelled) setMoviesLoading(false) })

    return () => { cancelled = true }
  }, [])

  const visibleMovies = searchQuery
    ? moviesList.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : moviesList

  const navigate = (p: Page) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectAndGo = (m: Movie) => {
    setSelectedMovie(m)
    navigate('details')
  }

  return (
    <div style={{ background: '#07070f', minHeight: '100vh' }}>
      <Nav page={page} setPage={navigate} onSearch={setSearchQuery} />

      {moviesError && (
        <div className="fixed top-16 left-0 right-0 z-40 px-6 py-2 text-center text-sm"
          style={{ background: 'rgba(230,57,70,0.15)', color: '#ff8f97', borderBottom: '1px solid rgba(230,57,70,0.3)' }}>
          Couldn't load movies: {moviesError}
        </div>
      )}

      {page === 'home' && (
        <HomePage movies={visibleMovies} loading={moviesLoading} setPage={navigate} setSelected={selectAndGo} />
      )}
      {page === 'listing' && (
        <ListingPage movies={visibleMovies} setPage={navigate} setSelected={selectAndGo} />
      )}
      {page === 'details' && selectedMovie && (
        <DetailsPage movie={selectedMovie} setPage={navigate} setSelectedShowId={setSelectedShowId} />
      )}
      {page === 'seats' && selectedMovie && selectedShowId && (
        <SeatsPage movie={selectedMovie} setPage={navigate} showId={selectedShowId} />
      )}
      {page === 'food' && selectedMovie && (
        <FoodPage movie={selectedMovie} setPage={navigate} />
      )}
      {page === 'checkout' && selectedMovie && (
        <CheckoutPage movie={selectedMovie} setPage={navigate} />
      )}
      {page === 'confirmation' && selectedMovie && (
        <ConfirmationPage movie={selectedMovie} setPage={navigate} />
      )}
      {page === 'profile' && (
        <ProfilePage setPage={navigate} />
      )}
      {page === 'history' && (
        <HistoryPage setPage={navigate} />
      )}
    </div>
  )
}
