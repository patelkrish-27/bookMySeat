import { useState, useEffect, useRef } from 'react';
import { Page, Movie, SeatItem, FoodItem } from '../types';
import { DEMO_MOVIES, FOOD_ITEMS, SHOWTIMES, PLACEHOLDER_POSTER, PLACEHOLDER_BACKDROP, generateSeats } from '../data/mockData';
import { Nav } from '../components/Nav';
import { MovieCard } from '../components/MovieCard';

export function FoodPage({ movie, setPage }: { movie: Movie; setPage: (p: Page) => void }) {
  const [cart, setCart] = useState<Record<number, number>>({})
  const [activeCategory, setActiveCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(FOOD_ITEMS.map(f => f.category)))]

  const filtered = activeCategory === 'All' ? FOOD_ITEMS : FOOD_ITEMS.filter(f => f.category === activeCategory)
  const total = Object.entries(cart).reduce((acc, [id, qty]) => {
    const item = FOOD_ITEMS.find(f => f.id === Number(id))
    return acc + (item ? item.price * qty : 0)
  }, 0)

  const update = (id: number, delta: number) => {
    setCart(prev => {
      const qty = Math.max(0, (prev[id] ?? 0) + delta)
      if (qty === 0) { const { [id]: _, ...rest } = prev; return rest }
      return { ...prev, [id]: qty }
    })
  }

  return (
    <div className="page-fade min-h-screen pt-20" style={{ background: '#07070f' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button onClick={() => setPage('seats')} className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70" style={{ color: '#9999bb' }}>← Back to Seats</button>
        <h1 className="font-display font-bold text-3xl mb-1" style={{ color: '#f0f0f8' }}>Food & Beverages</h1>
        <p className="text-sm mb-8" style={{ color: '#555570' }}>Enhance your movie experience with delicious snacks</p>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8">
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{ background: activeCategory === c ? 'linear-gradient(135deg, #d4a63a, #f0c060)' : 'rgba(255,255,255,0.05)', color: activeCategory === c ? '#07070f' : '#9999bb', border: activeCategory === c ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {filtered.map(item => (
                <div key={item.id} className="rounded-2xl p-4 flex gap-4 transition-all duration-200 hover:border-white/10"
                  style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-0.5 text-sm" style={{ color: '#f0f0f8' }}>{item.name}</h3>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: '#555570' }}>{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>${item.price}</span>
                      {cart[item.id] ? (
                        <div className="flex items-center gap-3">
                          <button onClick={() => update(item.id, -1)} className="w-7 h-7 rounded-lg font-bold text-lg transition-colors hover:bg-yellow-400/10 flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.06)', color: '#d4a63a', border: '1px solid rgba(212,166,58,0.2)' }}>−</button>
                          <span className="w-5 text-center font-mono-dm font-bold" style={{ color: '#f0f0f8' }}>{cart[item.id]}</span>
                          <button onClick={() => update(item.id, 1)} className="w-7 h-7 rounded-lg font-bold text-lg transition-colors hover:bg-yellow-400/10 flex items-center justify-center"
                            style={{ background: 'rgba(212,166,58,0.15)', color: '#d4a63a', border: '1px solid rgba(212,166,58,0.25)' }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => update(item.id, 1)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-90"
                          style={{ background: 'rgba(212,166,58,0.15)', color: '#d4a63a', border: '1px solid rgba(212,166,58,0.25)' }}>
                          Add +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart summary */}
          <div className="col-span-4">
            <div className="sticky top-24 rounded-2xl p-5" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="font-display font-bold text-xl mb-5" style={{ color: '#f0f0f8' }}>Your Order</h3>
              {Object.keys(cart).length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#555570' }}>Your cart is empty</p>
              ) : (
                <div className="space-y-3 mb-5">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = FOOD_ITEMS.find(f => f.id === Number(id))!
                    return (
                      <div key={id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono-dm font-bold" style={{ background: 'rgba(212,166,58,0.15)', color: '#d4a63a' }}>{qty}</span>
                          <span className="text-sm" style={{ color: '#f0f0f8' }}>{item.name}</span>
                        </div>
                        <span className="text-sm font-mono-dm" style={{ color: '#d4a63a' }}>${(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-4 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#f0f0f8' }}>Food Total</span>
                <span style={{ color: '#d4a63a' }}>${total.toFixed(2)}</span>
              </div>
              <button onClick={() => setPage('checkout')}
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 mb-3"
                style={{ background: 'linear-gradient(135deg, #d4a63a, #f0c060)', color: '#07070f' }}>
                Continue to Checkout
              </button>
              <button onClick={() => setPage('checkout')}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-white/5"
                style={{ color: '#9999bb', border: '1px solid rgba(255,255,255,0.08)' }}>
                Skip & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}