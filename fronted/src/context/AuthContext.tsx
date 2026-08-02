import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AuthUser } from '../types'

// ─── Storage key ──────────────────────────────────────────────────────────────
// We store the auth payload in sessionStorage so it clears on tab close.
// Swap to localStorage if you want "remember me" across sessions.
const STORAGE_KEY = 'bms_auth'

function loadFromStorage(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

// ─── Context shape ────────────────────────────────────────────────────────────
interface AuthContextValue {
  user: AuthUser | null
  isLoggedIn: boolean
  isAdmin: boolean
  token: string | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadFromStorage)

  const login = useCallback((authUser: AuthUser) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    setUser(authUser)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        isAdmin: user?.role === 'ADMIN',
        token: user?.token ?? null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
