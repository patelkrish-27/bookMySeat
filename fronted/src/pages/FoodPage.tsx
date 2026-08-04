import { useState } from 'react';
import { Page, Movie, FoodItem } from '../types';
import { FOOD_ITEMS } from '../data/mockData';

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
    <div className="page-fade min-h-screen pt-20" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button onClick={() => setPage('seats')} className="flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70" style={{ color: '#9999bb' }}>← Back to Seats</button>
        <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1" style={{ color: '#f0f0f8' }}>Food & Beverages</h1>
        <p className="text-sm mb-6 sm:mb-8" style={{ color: '#555570' }}>Enhance your movie experience with delicious snacks</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-8">
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === c ? 'glass-btn-gold' : 'glass-btn-outline'}`}>
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {filtered.map((item, i) => (
                <div key={item.id} className="glass-card rounded-2xl p-4 flex gap-4 fade-up"
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <img src={item.image} alt={item.name} className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-0.5 text-sm" style={{ color: '#f0f0f8' }}>{item.name}</h3>
                    <p className="text-xs mb-3 leading-relaxed" style={{ color: '#555570' }}>{item.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold font-mono-dm" style={{ color: '#d4a63a' }}>₹{item.price}</span>
                      {cart[item.id] ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button onClick={() => update(item.id, -1)} className="w-7 h-7 rounded-lg font-bold text-lg transition-all flex items-center justify-center glass-btn-outline"
                            style={{ color: '#d4a63a', borderColor: 'rgba(212,166,58,0.2)' }}>−</button>
                          <span className="w-5 text-center font-mono-dm font-bold" style={{ color: '#f0f0f8' }}>{cart[item.id]}</span>
                          <button onClick={() => update(item.id, 1)} className="w-7 h-7 rounded-lg font-bold text-lg transition-all flex items-center justify-center glass-btn-outline"
                            style={{ color: '#d4a63a', background: 'rgba(212,166,58,0.1)', borderColor: 'rgba(212,166,58,0.25)' }}>+</button>
                        </div>
                      ) : (
                        <button onClick={() => update(item.id, 1)} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all glass-btn-outline"
                          style={{ color: '#d4a63a', borderColor: 'rgba(212,166,58,0.2)' }}>
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
          <div className="lg:col-span-4">
            <div className="sticky top-24 glass-panel rounded-2xl p-5">
              <h3 className="font-display font-bold text-xl mb-5" style={{ color: '#f0f0f8' }}>Your Order</h3>
              {Object.keys(cart).length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: '#555570' }}>Your cart is empty</p>
              ) : (
                <div className="space-y-3 mb-5">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = FOOD_ITEMS.find(f => f.id === Number(id))!
                    return (
                      <div key={id} className="flex items-center justify-between py-2 px-3 rounded-lg glass-card" style={{ boxShadow: 'none' }}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-mono-dm font-bold" style={{ background: 'rgba(212,166,58,0.12)', color: '#d4a63a' }}>{qty}</span>
                          <span className="text-sm" style={{ color: '#f0f0f8' }}>{item.name}</span>
                        </div>
                        <span className="text-sm font-mono-dm" style={{ color: '#d4a63a' }}>₹{(item.price * qty).toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-4 mb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: '#f0f0f8' }}>Food Total</span>
                <span style={{ color: '#d4a63a' }}>₹{total.toFixed(2)}</span>
              </div>
              <button onClick={() => setPage('checkout')}
                className="w-full py-3.5 rounded-xl font-semibold text-sm glass-btn-gold mb-3">
                Continue to Checkout
              </button>
              <button onClick={() => setPage('checkout')}
                className="w-full py-3 rounded-xl font-semibold text-sm glass-btn-outline">
                Skip & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}