import { useState, FormEvent } from 'react'
import { Page } from '../types'
import { authApi } from '../lib/api'

// ─── Reusable field component ─────────────────────────────────────────────────
function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#9999bb' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0f0f8',
        }}
        onFocus={e => {
          e.currentTarget.style.border = '1px solid rgba(212,166,58,0.6)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        }}
        onBlur={e => {
          e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }}
      />
    </div>
  )
}

// ─── SignupPage ───────────────────────────────────────────────────────────────
export function SignupPage({
  setPage,
  onPendingEmail,
}: {
  setPage: (p: Page) => void
  /** Called after successful register so VerifyEmailPage pre-fills the email */
  onPendingEmail: (email: string) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await authApi.register({ name, email, password })
      onPendingEmail(email)
      setPage('verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#07070f' }}>
      <div
        className="w-full max-w-md rounded-2xl p-8"
        style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h2v2H2V3zm3 0h2v2H5V3zm3 0h2v2H8V3zm3 0h2v2h-2V3zM2 11h2v2H2v-2zm9 0h2v2h-2v-2zM1 5h14v6H1V5z" fill="#07070f" />
            </svg>
          </div>
          <span className="font-display text-lg font-bold" style={{ color: '#f0f0f8' }}>
            BookMy<span style={{ color: '#d4a63a' }}>Seat</span>
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#f0f0f8' }}>
          Create account
        </h1>
        <p className="text-sm mb-7" style={{ color: '#555570' }}>
          We'll email you a code to verify your address.
        </p>

        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-5"
            style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', color: '#ff8f97' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Full name" type="text" value={name} onChange={setName} placeholder="Alex Morgan" autoComplete="name" />
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 py-3 rounded-xl font-semibold text-sm transition-opacity"
            style={{
              background: 'linear-gradient(135deg, #d4a63a, #f0c060)',
              color: '#07070f',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: '#555570' }}>
          Already have an account?{' '}
          <button
            onClick={() => setPage('login')}
            className="font-semibold transition-colors hover:underline"
            style={{ color: '#d4a63a' }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  )
}
