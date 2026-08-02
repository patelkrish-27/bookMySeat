import { useState } from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';

export function Nav({ page, setPage, onSearch }: {
  page: Page
  setPage: (p: Page) => void
  onSearch: (q: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const { isLoggedIn, user, logout, isAdmin } = useAuth()

  const navItems: { label: string; page: Page }[] = [
    { label: 'Movies', page: 'listing' },
    ...(isAdmin ? [{ label: 'Admin', page: 'admin' as Page }] : []),
    { label: 'Profile', page: 'profile' },
    { label: 'History', page: 'history' },
  ]

  function handleLogout() {
    logout()
    setPage('home')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'rgba(7,7,15,0.92)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h2v2H2V3zm3 0h2v2H5V3zm3 0h2v2H8V3zm3 0h2v2h-2V3zM2 11h2v2H2v-2zm9 0h2v2h-2v-2zM1 5h14v6H1V5z" fill="#07070f" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold tracking-wide" style={{ color: '#f0f0f8' }}>
            BookMy<span style={{ color: '#d4a63a' }}>Seat</span>
          </span>
        </button>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => setPage(item.page)}
              className={`nav-link text-sm font-medium transition-colors ${page === item.page ? 'active' : ''}`}
              style={{ color: page === item.page ? '#d4a63a' : '#9999bb' }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex items-center">
            {showSearch && (
              <input
                autoFocus
                value={search}
                onChange={e => { setSearch(e.target.value); onSearch(e.target.value) }}
                onBlur={() => { if (!search) setShowSearch(false) }}
                placeholder="Search movies..."
                className="text-sm px-3 py-1.5 rounded-lg outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#f0f0f8', width: 200 }}
              />
            )}
            <button
              onClick={() => setShowSearch(v => !v)}
              className="ml-2 p-2 rounded-lg transition-colors"
              style={{ color: '#9999bb' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          {/* Auth controls */}
          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              {/* Username pill */}
              <button
                onClick={() => setPage('profile')}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium" style={{ color: '#f0f0f8' }}>
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {/* Logout */}
              <button
                onClick={handleLogout}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#9999bb' }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage('login')}
                className="text-sm font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: '#9999bb' }}
              >
                Log in
              </button>
              <button
                onClick={() => setPage('signup')}
                className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}