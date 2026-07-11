import { useCallback, useEffect, useState } from 'react'
import type { EonetCategory, EventFilters } from '../types/eonet'
import {
  dedupeFeaturesByEventId,
  fetchCategories,
  fetchEventsGeoJSON,
} from '../lib/eonet'

const REFETCH_MS = 10 * 60 * 1000

const DEFAULT_FILTERS: EventFilters = {
  status: 'open',
  category: null,
  days: 30,
  limit: 100,
}

export function useEonetEvents(filters: EventFilters = DEFAULT_FILTERS) {
  const [categories, setCategories] = useState<EonetCategory[]>([])
  const [features, setFeatures] = useState<GeoJSON.Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories()
      setCategories(data.categories)
    } catch {
      // categories are optional for core functionality
    }
  }, [])

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchEventsGeoJSON({
        status: filters.status,
        category: filters.category,
        days: filters.days,
        limit: filters.limit,
      })
      setFeatures(dedupeFeaturesByEventId(data.features ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.category, filters.days, filters.limit])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadEvents()
    const interval = setInterval(loadEvents, REFETCH_MS)
    return () => clearInterval(interval)
  }, [loadEvents])

  return { categories, features, loading, error, refetch: loadEvents }
}
