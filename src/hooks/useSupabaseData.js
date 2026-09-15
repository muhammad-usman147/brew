'use client'
import { useState, useEffect, useCallback } from 'react'

/**
 * Generic hook to fetch data from a Next.js API route
 * Usage: const { data, loading, error, refetch } = useSupabaseData('/api/campaigns?type=public')
 */
export function useSupabaseData(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      const payload = await res.json()
      if (!res.ok) throw new Error(payload?.error || 'Failed to fetch')
      setData(payload.data ?? payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
