import { Movie, FoodItem, SeatItem } from '../types';

// TEMPORARY placeholders only. Used as stand-ins for the booking-history /
// profile mock-ups below, since there's no bookings API yet. These are NOT
// used to seed the movie listing anymore — that comes from the backend.
export const DEMO_MOVIES: Movie[] = [
  {
    id: 'demo-1', title: 'Sample Movie One',
    synopsis: '', duration: '150 min', language: 'English', releaseDate: '2025-01-01',
    poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400&h=600&fit=crop&auto=format',
    backdrop: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400&h=700&fit=crop&auto=format',
    price: 14.99,
  },
  {
    id: 'demo-2', title: 'Sample Movie Two',
    synopsis: '', duration: '160 min', language: 'English', releaseDate: '2025-01-01',
    poster: 'https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400&h=600&fit=crop&auto=format',
    backdrop: 'https://images.unsplash.com/photo-1493217465235-252dd9c0d632?w=1400&h=700&fit=crop&auto=format',
    price: 15.99,
  },
  {
    id: 'demo-3', title: 'Sample Movie Three',
    synopsis: '', duration: '140 min', language: 'English', releaseDate: '2025-01-01',
    poster: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=600&fit=crop&auto=format',
    backdrop: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=1400&h=700&fit=crop&auto=format',
    price: 13.99,
  },
  {
    id: 'demo-4', title: 'Sample Movie Four',
    synopsis: '', duration: '205 min', language: 'English', releaseDate: '2025-01-01',
    poster: 'https://images.unsplash.com/photo-1598387180429-c5e1b3da3c76?w=400&h=600&fit=crop&auto=format',
    backdrop: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&h=700&fit=crop&auto=format',
    price: 14.99,
  },
]

// Generic fallback images used only until the backend serves real poster/backdrop URLs.
export const PLACEHOLDER_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop&auto=format'
export const PLACEHOLDER_BACKDROP = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&h=700&fit=crop&auto=format'

export const FOOD_ITEMS: FoodItem[] = [
  { id: 1, name: 'Classic Popcorn', desc: 'Buttery salted popcorn, large bucket', price: 7.99, category: 'Popcorn', image: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format' },
  { id: 2, name: 'Caramel Popcorn', desc: 'Sweet caramel drizzle on fresh popcorn', price: 8.99, category: 'Popcorn', image: 'https://images.unsplash.com/photo-1585119795860-fb1fde1ec0e8?w=200&h=200&fit=crop&auto=format' },
  { id: 3, name: 'Nachos Supreme', desc: 'Crispy nachos with cheese & jalapeños', price: 9.49, category: 'Snacks', image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=200&h=200&fit=crop&auto=format' },
  { id: 4, name: 'Hot Dog', desc: 'Classic beef hot dog with mustard', price: 6.99, category: 'Snacks', image: 'https://images.unsplash.com/photo-1612392062631-94e8bf38b8e3?w=200&h=200&fit=crop&auto=format' },
  { id: 5, name: 'Coca-Cola Large', desc: 'Ice-cold Coca-Cola, 32oz', price: 5.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop&auto=format' },
  { id: 6, name: 'Sprite Large', desc: 'Refreshing Sprite, 32oz', price: 5.49, category: 'Drinks', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200&h=200&fit=crop&auto=format' },
  { id: 7, name: 'Movie Combo 1', desc: 'Large popcorn + 2 drinks', price: 16.99, category: 'Combos', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=200&fit=crop&auto=format' },
  { id: 8, name: 'Premium Bundle', desc: 'Nachos + 2 drinks + popcorn', price: 24.99, category: 'Combos', image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=200&h=200&fit=crop&auto=format' },
]

export const SHOWTIMES = [
  { id: 1, cinema: 'IMAX Downtown', address: '123 Main St', times: ['10:30 AM', '1:45 PM', '5:00 PM', '8:15 PM'] },
  { id: 2, cinema: 'Cine Grand Deluxe', address: '456 Park Ave', times: ['11:00 AM', '2:30 PM', '6:00 PM', '9:30 PM'] },
  { id: 3, cinema: 'Premiere Screens', address: '789 Oak Blvd', times: ['12:00 PM', '3:15 PM', '7:30 PM'] },
]

export function generateSeats(): SeatItem[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const seats: SeatItem[] = []
  const takenSeats = new Set(['A3', 'A4', 'B5', 'B6', 'C2', 'D7', 'D8', 'E1', 'E9', 'F4', 'F5', 'G6', 'H3'])
  rows.forEach((row, ri) => {
    const count = 10
    for (let n = 1; n <= count; n++) {
      const sid = `${row}${n}`
      let type: SeatItem['type'] = 'standard'
      if (ri <= 1) type = 'recliner'
      else if (ri <= 3) type = 'premium'
      seats.push({ id: sid, row, num: n, type, status: takenSeats.has(sid) ? 'taken' : 'available' })
    }
  })
  return seats
}