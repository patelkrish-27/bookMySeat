import { useState, useEffect } from 'react';
import { Page, Movie } from './types';
import { DEMO_MOVIES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP } from './data/mockData';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { AdminDashboard } from './pages/AdminDashboard';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';

// ─── Root App ─────────────────────────────────────────────────────────────────
const MOVIES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/search/movies`

// Auth pages render full-screen without the main Nav
const AUTH_PAGES: Page[] = ['login', 'signup', 'verify-email']

function AppInner() {
  const [page, setPage] = useState<Page>('home')
  const [moviesList, setMoviesList] = useState<Movie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [moviesError, setMoviesError] = useState<string | null>(null)
  const [moviesLoading, setMoviesLoading] = useState(true)
  // Email shared between SignupPage/LoginPage → VerifyEmailPage
  const [pendingEmail, setPendingEmail] = useState('')

  // ── Booking state threaded through seats → checkout → confirmation ──────────
  // bookingId: the PENDING booking created by POST /tentative
  // expiresAt: ISO-8601 string (now + 8 min) driving the checkout countdown timer
  // confirmedBookingId: the CONFIRMED bookingId passed to ConfirmationPage
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)

  const { isLoggedIn } = useAuth()

  const PROTECTED_PAGES: Page[] = ['seats', 'food', 'checkout', 'confirmation', 'profile', 'history', 'admin']

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
        const rows: any[] = Array.isArray(data) ? data : (data?.movies ?? data?.content ?? [])
        if (!Array.isArray(rows) || rows.length === 0) {
          setMoviesError('The movies API returned no data.')
          return
        }
        const backendMovies: Movie[] = rows.map((d) => ({
          id: d.id,
          title: d.title,
          synopsis: d.description ?? '',
          duration: d.durationMins != null ? `${d.durationMins} min` : '',
          language: d.language ?? '',
          releaseDate: d.releaseDate ?? '',
          poster: d.posterUrl || PLACEHOLDER_POSTER,
          backdrop: d.backdropUrl || PLACEHOLDER_BACKDROP,
          price: d.price ?? 0,
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
    if (PROTECTED_PAGES.includes(p) && !isLoggedIn) {
      setPage('login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const selectAndGo = (m: Movie) => {
    setSelectedMovie(m)
    navigate('details')
  }

  // Called by SeatsPage when /tentative succeeds
  const onTentativeBooked = (bId: string, expAt: string) => {
    setBookingId(bId)
    setExpiresAt(expAt)
    navigate('checkout')
  }

  // Called by CheckoutPage when payment is CONFIRMED
  const onPaymentConfirmed = (bId: string) => {
    setConfirmedBookingId(bId)
    navigate('confirmation')
  }

  // ── Auth pages: full-screen, no Nav ──────────────────────────────────────────
  if (page === 'login') {
    return <LoginPage setPage={navigate} onPendingEmail={setPendingEmail} />
  }
  if (page === 'signup') {
    return <SignupPage setPage={navigate} onPendingEmail={setPendingEmail} />
  }
  if (page === 'verify-email') {
    return <VerifyEmailPage setPage={navigate} pendingEmail={pendingEmail} />
  }

  // ── Protected pages guard: redirect to login if logged out ─────────────────
  if (PROTECTED_PAGES.includes(page) && !isLoggedIn) {
    return <LoginPage setPage={navigate} onPendingEmail={setPendingEmail} />
  }

  // ── Main app (with Nav) ───────────────────────────────────────────────────────
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
        <SeatsPage
          movie={selectedMovie}
          setPage={navigate}
          showId={selectedShowId}
          onTentativeBooked={onTentativeBooked}
        />
      )}
      {page === 'food' && selectedMovie && (
        <FoodPage movie={selectedMovie} setPage={navigate} />
      )}
      {page === 'checkout' && selectedMovie && bookingId && expiresAt && (
        <CheckoutPage
          movie={selectedMovie}
          setPage={navigate}
          bookingId={bookingId}
          expiresAt={expiresAt}
          onPaymentConfirmed={onPaymentConfirmed}
        />
      )}
      {page === 'confirmation' && confirmedBookingId && (
        <ConfirmationPage
          bookingId={confirmedBookingId}
          setPage={navigate}
        />
      )}
      {page === 'profile' && (
        <ProfilePage setPage={navigate} />
      )}
      {page === 'history' && (
        <HistoryPage setPage={navigate} />
      )}
      {page === 'admin' && (
        <AdminDashboard setPage={navigate} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
