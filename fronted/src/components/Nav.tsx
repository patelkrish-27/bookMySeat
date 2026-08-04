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

  function handleNavClick(p: Page) {
    setPage(p)
    setMenuOpen(false)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <button onClick={() => setPage('home')} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glass-btn-gold">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h2v2H2V3zm3 0h2v2H5V3zm3 0h2v2H8V3zm3 0h2v2h-2V3zM2 11h2v2H2v-2zm9 0h2v2h-2v-2zM1 5h14v6H1V5z" fill="#07070f" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold tracking-wide" style={{ color: '#f0f0f8' }}>
              BookMy<span className="text-gold-gradient">Seat</span>
            </span>
          </button>

          {/* Center nav links — desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className={`nav-link text-sm font-medium px-3 py-1.5 rounded-lg transition-all ${page === item.page ? 'active' : ''}`}
                style={{
                  color: page === item.page ? '#d4a63a' : '#9999bb',
                  background: page === item.page ? 'rgba(212,166,58,0.08)' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              {showSearch && (
                <input
                  autoFocus
                  value={search}
                  onChange={e => { setSearch(e.target.value); onSearch(e.target.value) }}
                  onBlur={() => { if (!search) setShowSearch(false) }}
                  placeholder="Search movies..."
                  className="glass-input text-sm px-3 py-1.5 rounded-lg w-40 sm:w-52"
                />
              )}
              <button
                onClick={() => setShowSearch(v => !v)}
                className="ml-1 p-2 rounded-lg transition-all hover:bg-white/5"
                style={{ color: '#9999bb' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>

            {/* Auth controls — desktop */}
            <div className="hidden sm:flex items-center gap-2">
              {isLoggedIn && user ? (
                <>
                  <button
                    onClick={() => setPage('profile')}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all glass-btn-outline"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold glass-btn-gold"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#f0f0f8' }}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: '#9999bb' }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setPage('login')}
                    className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all hover:bg-white/5"
                    style={{ color: '#9999bb' }}
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setPage('signup')}
                    className="text-sm font-semibold px-4 py-1.5 rounded-lg glass-btn-gold"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: '#9999bb' }}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile drawer */}
      <div className={`mobile-menu-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="p-6 pt-20">
          {/* Nav links */}
          <div className="flex flex-col gap-1 mb-6">
            {navItems.map(item => (
              <button
                key={item.page}
                onClick={() => handleNavClick(item.page)}
                className="text-left text-base font-medium px-4 py-3 rounded-xl transition-all"
                style={{
                  color: page === item.page ? '#d4a63a' : '#9999bb',
                  background: page === item.page ? 'rgba(212,166,58,0.08)' : 'transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Auth — mobile */}
          {isLoggedIn && user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl glass-card">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold glass-btn-gold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#f0f0f8' }}>{user.name}</p>
                  <p className="text-xs" style={{ color: '#555570' }}>{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false) }}
                className="text-left text-sm font-medium px-4 py-3 rounded-xl transition-all hover:bg-white/5"
                style={{ color: '#ff8f97' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleNavClick('login')}
                className="w-full py-3 rounded-xl text-sm font-medium glass-btn-outline text-center"
              >
                Log in
              </button>
              <button
                onClick={() => handleNavClick('signup')}
                className="w-full py-3 rounded-xl text-sm font-semibold glass-btn-gold text-center"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}