import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function CheckoutPage({ movie, setPage }: { movie: Movie; setPage: (p: Page) => void }) {
  const [payMethod, setPayMethod] = useState<'card' | 'wallet' | 'upi'>('card')
  const [cardNum, setCardNum] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d }

  const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f8', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', width: '100%' }

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={() => setPage('food')} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70 transition-colors" style={{ color: '#9999bb' }}>← Back</button>
        <h1 className="font-display font-bold text-3xl mb-8" style={{ color: '#f0f0f8' }}>Checkout</h1>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7">
            {/* Contact */}
            <div className="rounded-2xl p-6 mb-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#f0f0f8' }}>Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>First Name</label>
                  <input style={inputStyle} placeholder="Alex" />
                </div>
                <div>
                  <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Last Name</label>
                  <input style={inputStyle} placeholder="Morgan" />
                </div>
                <div>
                  <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Email</label>
                  <input style={inputStyle} placeholder="alex@email.com" type="email" />
                </div>
                <div>
                  <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Phone</label>
                  <input style={inputStyle} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-lg mb-5" style={{ color: '#f0f0f8' }}>Payment Method</h3>
              <div className="flex gap-3 mb-6">
                {([['card', 'Credit Card'], ['wallet', 'Digital Wallet'], ['upi', 'UPI / Bank']] as const).map(([k, label]) => (
                  <button key={k} onClick={() => setPayMethod(k)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: payMethod === k ? 'rgba(212,166,58,0.15)' : 'rgba(255,255,255,0.05)', color: payMethod === k ? '#d4a63a' : '#9999bb', border: payMethod === k ? '1px solid rgba(212,166,58,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>
                    {label}
                  </button>
                ))}
              </div>

              {payMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Card Number</label>
                    <input style={inputStyle} value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Cardholder Name</label>
                    <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>Expiry</label>
                      <input style={inputStyle} value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>CVV</label>
                      <input style={inputStyle} value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} placeholder="•••" type="password" />
                    </div>
                  </div>
                </div>
              )}
              {payMethod === 'wallet' && (
                <div className="grid grid-cols-3 gap-3">
                  {['Apple Pay', 'Google Pay', 'PayPal'].map(w => (
                    <button key={w} className="py-4 rounded-xl text-sm font-semibold transition-all hover:border-yellow-400/30"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#f0f0f8', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {w}
                    </button>
                  ))}
                </div>
              )}
              {payMethod === 'upi' && (
                <div>
                  <label className="text-xs font-mono-dm mb-2 block" style={{ color: '#555570' }}>UPI ID / Account Number</label>
                  <input style={inputStyle} placeholder="yourname@bank" />
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="col-span-5">
            <div className="sticky top-24 rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-xl mb-5" style={{ color: '#f0f0f8' }}>Order Summary</h3>

              <div className="flex gap-3 mb-5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={movie.poster} alt={movie.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                <div>
                  <p className="font-display font-bold text-sm" style={{ color: '#f0f0f8' }}>{movie.title}</p>
                  <p className="text-xs mt-1" style={{ color: '#555570' }}>IMAX Downtown</p>
                  <p className="text-xs" style={{ color: '#555570' }}>Sat, Aug 2 · 7:00 PM</p>
                  <p className="text-xs mt-1" style={{ color: '#9999bb' }}>Seats: E5, E6</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  ['2x Tickets (IMAX)', '$29.98'],
                  ['Seat upgrade', '$6.00'],
                  ['Classic Popcorn', '$7.99'],
                  ['Coca-Cola Large', '$5.49'],
                  ['Booking fee', '$1.50'],
                ].map(([label, price]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: '#9999bb' }}>{label}</span>
                    <span style={{ color: '#f0f0f8' }}>{price}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold text-xl pt-4 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#f0f0f8' }}>Total</span>
                <span style={{ color: '#d4a63a' }}>$50.96</span>
              </div>

              <div className="flex items-center gap-2 mb-5 p-3 rounded-xl" style={{ background: 'rgba(100,200,100,0.06)', border: '1px solid rgba(100,200,100,0.1)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                <span className="text-xs" style={{ color: '#4ade80' }}>Secured by 256-bit SSL encryption</span>
              </div>

              <button onClick={() => setPage('confirmation')}
                className="w-full py-4 rounded-xl font-bold text-base transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                Pay $50.96
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}