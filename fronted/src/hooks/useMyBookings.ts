import { useState, useEffect } from 'react'
import { bookingApi } from '../lib/api'
import type { MyBookingsResponse, BookingSummary } from '../types'

interface UseMyBookingsResult {
  upcoming: BookingSummary[]
  past: BookingSummary[]
  loading: boolean
  error: string | null
  /** Call to manually re-fetch (e.g. after a new booking is confirmed). */
  refetch: () => void
}

/**
 * Shared hook used by HistoryPage and ProfilePage.
 * Fetches /api/v1/bookings/my-bookings and splits the result into
 * upcoming and past lists.
 */
export function useMyBookings(): UseMyBookingsResult {
  const [data, setData] = useState<MyBookingsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    bookingApi.getMyBookings()
      .then((res) => {
        if (!cancelled) {
          setData(res)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [tick])

  return {
    upcoming: data?.upcoming ?? [],
    past: data?.past ?? [],
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  }
}
