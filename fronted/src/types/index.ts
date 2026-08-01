export type Page = 'home' | 'listing' | 'details' | 'seats' | 'food' | 'checkout' | 'confirmation' | 'profile' | 'history'

export interface Movie {
  id: string | number
  title: string
  synopsis: string        // from backend `description`
  duration: string        // formatted from backend `durationMins`
  language: string        // from backend `language`
  releaseDate: string     // from backend `releaseDate`
  poster: string          // placeholder image until backend serves posters
  backdrop: string        // placeholder image until backend serves backdrops
  // NOTE: price is not part of the movies API (it lives on show_seats,
  // which isn't built yet). Kept here as a temporary placeholder so the
  // seats/food/checkout flow keeps working; wire this up to the real
  // show/show-seat pricing once that API exists.
  price: number
  featured?: boolean
}

export interface SeatItem {
  id: string
  row: string
  num: number
  type: 'standard' | 'premium' | 'recliner'
  status: 'available' | 'taken' | 'selected'
  price?: number
}

export interface FoodItem {
  id: number
  name: string
  desc: string
  price: number
  category: string
  image: string
}