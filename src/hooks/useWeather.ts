import { useCallback, useEffect, useState } from 'react'
import type { Location, WeatherData } from '../types/weather'
import {
  detectLocation,
  fetchWeather,
  loadSavedLocation,
  saveLocation,
} from '../lib/weather'

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = useCallback(async (location: Location) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWeather(location)
      setWeather(data)
      saveLocation(location)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather')
    } finally {
      setLoading(false)
    }
  }, [])

  const setLocation = useCallback(
    async (location: Location) => {
      await loadWeather(location)
    },
    [loadWeather],
  )

  const detectMyLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const location = await detectLocation()
      await loadWeather(location)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not detect location — try searching for your city',
      )
      setLoading(false)
    }
  }, [loadWeather])

  useEffect(() => {
    async function init() {
      const saved = loadSavedLocation()
      if (saved) {
        await loadWeather(saved)
      }

      try {
        const location = await detectLocation()
        if (
          !saved ||
          saved.lat !== location.lat ||
          saved.lon !== location.lon
        ) {
          await loadWeather(location)
        }
      } catch {
        if (!saved) {
          setError('Allow location access or search for your city')
          setLoading(false)
        }
      }
    }
    init()
  }, [loadWeather])

  return { weather, loading, error, setLocation, detectMyLocation }
}
