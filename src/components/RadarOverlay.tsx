import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { radarTileUrl, type RadarFrame } from '../lib/radar'

const RADAR_OPACITY = 0.72

type RadarOverlayProps = {
  host: string
  frame: RadarFrame
}

/**
 * Keeps radar tiles on the map without remounting.
 * Remounting TileLayer every frame caused the flash/blank flicker.
 */
export function RadarOverlay({ host, frame }: RadarOverlayProps) {
  const map = useMap()
  const layerRef = useRef<L.TileLayer | null>(null)
  const urlRef = useRef<string>('')

  useEffect(() => {
    const url = radarTileUrl(host, frame.path)

    if (!layerRef.current) {
      const layer = L.tileLayer(url, {
        opacity: 0,
        maxNativeZoom: 7,
        maxZoom: 12,
        tileSize: 256,
        zIndex: 350,
        className: 'radar-tiles',
        // Keep old tiles visible while new ones load — stops the flash
        updateWhenIdle: false,
        updateWhenZooming: false,
        keepBuffer: 4,
      })

      layer.on('load', () => {
        layer.setOpacity(RADAR_OPACITY)
      })

      layer.addTo(map)
      layerRef.current = layer
      urlRef.current = url

      // If tiles were cached, load may have already fired
      window.setTimeout(() => {
        if (layerRef.current === layer) layer.setOpacity(RADAR_OPACITY)
      }, 300)

      return
    }

    if (urlRef.current === url) return
    urlRef.current = url

    const layer = layerRef.current
    // setUrl keeps the layer mounted; old tiles stay until new ones arrive
    layer.setOpacity(RADAR_OPACITY)
    layer.setUrl(url)
  }, [map, host, frame.path])

  useEffect(() => {
    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map])

  return null
}
