import { useCallback, useEffect, useState } from 'react'
import {
  fetchRadarMaps,
  type RadarFrame,
} from '../lib/radar'

const REFRESH_MS = 5 * 60 * 1000
/** ~2.5s per frame so the loop is easy to follow */
const FRAME_MS = 2500

export function useRadar(enabled: boolean) {
  const [host, setHost] = useState<string | null>(null)
  const [frames, setFrames] = useState<RadarFrame[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  // Start paused so the latest frame stays on screen instead of flashing
  const [playing, setPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRadarMaps()
      setHost(data.host)
      // Past frames only — clearer composite reflectivity
      setFrames(data.frames)
      setFrameIndex(Math.max(0, data.frames.length - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Radar unavailable')
      setHost(null)
      setFrames([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return
    load()
    const interval = setInterval(load, REFRESH_MS)
    return () => clearInterval(interval)
  }, [enabled, load])

  useEffect(() => {
    if (!enabled || !playing || frames.length < 2) return
    const timer = setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length)
    }, FRAME_MS)
    return () => clearInterval(timer)
  }, [enabled, playing, frames.length])

  const frame = frames[frameIndex] ?? null

  return {
    host,
    frames,
    frame,
    frameIndex,
    playing,
    setPlaying,
    setFrameIndex,
    loading,
    error,
    reload: load,
  }
}
