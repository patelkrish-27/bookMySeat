import { useState, FormEvent, useRef, useEffect } from 'react'
import { Page } from '../types'
import { authApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'

// ─── VerifyEmailPage ──────────────────────────────────────────────────────────
export function VerifyEmailPage({
  setPage,
  pendingEmail,
}: {
  setPage: (p: Page) => void
  /** Email pre-filled from signup or login redirect */
  pendingEmail: string
}) {
  const { login } = useAuth()

  // 6 individual digit inputs for better UX
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const otp = digits.join('')

  function handleDigitChange(index: number, value: string) {
    // Accept only single digits
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length > 0) {
      e.preventDefault()
      const next = [...digits]
      for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? ''
      setDigits(next)
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (otp.length < 6) {
      setError('Please enter all 6 digits.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const authUser = await authApi.verifyOtp({ email: pendingEmail, otp })
      login(authUser)
      setPage('home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(null)
    setSuccessMsg(null)
    setResending(true)
    try {
      const res = await authApi.resendOtp({ email: pendingEmail })
      setSuccessMsg(res.message)
      setDigits(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: '#07070f' }}>
      {/* Decorative background orbs */}
      <div className="aurora-bg" />
      <div className="glass-orb glass-orb-gold" style={{ width: 350, height: 350, top: '20%', left: '-8%' }} />
      <div className="glass-orb glass-orb-blue" style={{ width: 250, height: 250, bottom: '20%', right: '-5%', animationDelay: '-8s' }} />

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-modal rounded-2xl p-6 sm:p-8 fade-up">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center glass-btn-gold">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3h2v2H2V3zm3 0h2v2H5V3zm3 0h2v2H8V3zm3 0h2v2h-2V3zM2 11h2v2H2v-2zm9 0h2v2h-2v-2zM1 5h14v6H1V5z" fill="#07070f" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold" style={{ color: '#f0f0f8' }}>
              BookMy<span className="text-gold-gradient">Seat</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl mb-1" style={{ color: '#f0f0f8' }}>
            Check your email
          </h1>
          <p className="text-sm mb-7" style={{ color: '#555570' }}>
            We sent a 6-digit code to{' '}
            <span style={{ color: '#9999bb' }}>{pendingEmail || 'your email'}</span>.
            It expires in 10 minutes.
          </p>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-5 glass-panel"
              style={{ background: 'rgba(230,57,70,0.08)', borderColor: 'rgba(230,57,70,0.25)', color: '#ff8f97' }}
            >
              {error}
            </div>
          )}
          {successMsg && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-5 glass-panel"
              style={{ background: 'rgba(50,200,100,0.06)', borderColor: 'rgba(50,200,100,0.2)', color: '#6ee7a0' }}
            >
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6-digit OTP inputs */}
            <div className="flex gap-2 sm:gap-3 justify-center mb-7" onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={d}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className="glass-input w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-mono-dm font-bold rounded-xl"
                  style={{
                    borderColor: d ? 'rgba(212,166,58,0.5)' : undefined,
                    boxShadow: d ? '0 0 15px rgba(212,166,58,0.08)' : undefined,
                  }}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl font-semibold text-sm glass-btn-gold"
              style={{
                opacity: loading || otp.length < 6 ? 0.5 : 1,
                cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="text-sm" style={{ color: '#555570' }}>
              Didn't receive it?
            </span>
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-sm font-semibold transition-colors hover:underline"
              style={{ color: '#d4a63a', opacity: resending ? 0.5 : 1 }}
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          </div>

          <p className="text-sm text-center mt-4" style={{ color: '#555570' }}>
            <button
              onClick={() => setPage('signup')}
              className="hover:underline transition-colors"
              style={{ color: '#9999bb' }}
            >
              ← Back to sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
