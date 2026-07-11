import { useCallback, useEffect, useState } from 'react'
import {
  fetchRadarMaps,
  type RadarFrame,
} from '../lib/radar'

const REFRESH_MS = 5 * 60 * 1000
const FRAME_MS = 450

export function useRadar(enabled: boolean) {
  const [host, setHost] = useState<string | null>(null)
  const [frames, setFrames] = useState<RadarFrame[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRadarMaps()
      setHost(data.host)
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
