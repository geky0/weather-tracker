import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
  Polyline,
  ZoomControl,
  useMap,
  useMapEvents,
} from 'react-leaflet'
import type { EonetFeature } from '../types/eonet'
import type { Location } from '../types/weather'
import { getFeatureCoordinates } from '../lib/eonet'
import {
  getCategoryLabel,
  getEventColor,
  getCategoryColor,
} from '../lib/categoryColors'
import { formatRadarTime } from '../lib/radar'
import { useRadar } from '../hooks/useRadar'
import { detectBrowser } from '../lib/browser'
import { RadarOverlay } from './RadarOverlay'
import 'leaflet/dist/leaflet.css'

type EventMapProps = {
  features: GeoJSON.Feature[]
  userLocation: Location | null
  selectedId: string | null
  onSelect: (id: string | null) => void
}

const LEGEND_ITEMS = [
  { id: 'wildfires', label: 'Wildfires' },
  { id: 'severeStorms', label: 'Storms' },
  { id: 'volcanoes', label: 'Volcanoes' },
  { id: 'earthquakes', label: 'Quakes' },
  { id: 'floods', label: 'Floods' },
] as const

const MAX_LAT = 82

function markerRadius(zoom: number, selected: boolean): number {
  if (zoom <= 2) return selected ? 4 : 2.5
  if (zoom <= 3) return selected ? 4.5 : 3
  if (zoom <= 5) return selected ? 5.5 : 3.5
  if (zoom <= 7) return selected ? 7 : 4.5
  return selected ? 8 : 5.5
}

/** Keep the world wide enough that empty side bars never appear. */
function FitWorldWidth() {
  const map = useMap()

  const updateMinZoom = useCallback(() => {
    const size = map.getSize()
    if (size.x <= 0) return

    // At this zoom, one world (~256 * 2^z px) fills the container width
    const needed = Math.log2(size.x / 256)
    const minZoom = Math.max(1, Math.ceil(needed * 100) / 100)
    if (map.getMinZoom() !== minZoom) {
      map.setMinZoom(minZoom)
    }
    if (map.getZoom() < minZoom) {
      map.setZoom(minZoom)
    }
  }, [map])

  useEffect(() => {
    updateMinZoom()
    map.on('resize', updateMinZoom)
    return () => {
      map.off('resize', updateMinZoom)
    }
  }, [map, updateMinZoom])

  return null
}

/** Stop vertical pan past the poles without locking the sides. */
function ClampLatitude() {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter()
      if (center.lat > MAX_LAT) {
        map.setView([MAX_LAT, center.lng], map.getZoom(), { animate: false })
      } else if (center.lat < -MAX_LAT) {
        map.setView([-MAX_LAT, center.lng], map.getZoom(), { animate: false })
      }
    },
  })
  return null
}

function MapController({
  userLocation,
  selectedId,
  features,
}: {
  userLocation: Location | null
  selectedId: string | null
  features: EonetFeature[]
}) {
  const map = useMap()
  const lastLoc = useRef<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80)
    const t2 = window.setTimeout(() => map.invalidateSize(), 400)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
    }
  }, [map])

  useEffect(() => {
    if (!userLocation) return
    const prev = lastLoc.current
    if (
      prev &&
      Math.abs(prev.lat - userLocation.lat) < 0.0001 &&
      Math.abs(prev.lon - userLocation.lon) < 0.0001
    ) {
      return
    }
    lastLoc.current = { lat: userLocation.lat, lon: userLocation.lon }
    map.setView([userLocation.lat, userLocation.lon], Math.max(map.getZoom(), 4), {
      animate: true,
    })
  }, [map, userLocation])

  useEffect(() => {
    if (!selectedId) return
    const feature = features.find((f) => f.properties.id === selectedId)
    if (!feature?.geometry) return
    const coords = getFeatureCoordinates(feature.geometry)
    if (coords) map.flyTo(coords, Math.max(map.getZoom(), 5), { duration: 0.45 })
  }, [map, selectedId, features])

  return null
}

function ZoomTracker({ onZoom }: { onZoom: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  })

  useEffect(() => {
    onZoom(map.getZoom())
  }, [map, onZoom])

  return null
}

const EventMarker = memo(function EventMarker({
  feature,
  selected,
  zoom,
  onSelect,
}: {
  feature: EonetFeature
  selected: boolean
  zoom: number
  onSelect: (id: string) => void
}) {
  const props = feature.properties
  const color = getEventColor(props.categories, props.title)
  const categoryLabel = getCategoryLabel(props.categories, props.title)
  const coords = getFeatureCoordinates(feature.geometry)

  if (!coords) return null

  const [lat, lon] = coords
  const radius = markerRadius(zoom, selected)
  const path = {
    color: '#ffffff',
    fillColor: color,
    fillOpacity: selected ? 1 : 0.92,
    weight: selected ? 2 : 1.25,
    opacity: 1,
  }

  const showDetail =
    selected &&
    (feature.geometry.type === 'Polygon' ||
      feature.geometry.type === 'MultiPolygon' ||
      feature.geometry.type === 'LineString')

  return (
    <>
      {showDetail && feature.geometry.type === 'LineString' && (
        <Polyline
          positions={(feature.geometry.coordinates as [number, number][]).map(
            ([lng, lat]) => [lat, lng] as [number, number],
          )}
          pathOptions={{
            color,
            weight: 3,
            opacity: 0.75,
          }}
        />
      )}

      {showDetail &&
        (feature.geometry.type === 'Polygon' ||
          feature.geometry.type === 'MultiPolygon') &&
        (feature.geometry.type === 'Polygon'
          ? (feature.geometry.coordinates as [number, number][][]).map((ring) =>
              ring.map(([lng, lat]) => [lat, lng] as [number, number]),
            )
          : (feature.geometry.coordinates as [number, number][][][]).flatMap(
              (poly) =>
                poly.map((ring) =>
                  ring.map(([lng, lat]) => [lat, lng] as [number, number]),
                ),
            )
        ).map((ring, i) => (
          <Polygon
            key={`${props.id}-poly-${i}`}
            positions={ring}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: 0.28,
              weight: 2,
            }}
          />
        ))}

      <CircleMarker
        center={[lat, lon]}
        radius={radius}
        pathOptions={path}
        eventHandlers={{ click: () => onSelect(props.id) }}
      >
        <Popup className="glass-popup">
          <strong>{props.title}</strong>
          <p className="popup-category" style={{ color }}>
            {categoryLabel}
          </p>
        </Popup>
      </CircleMarker>
    </>
  )
})

export function EventMap({
  features,
  userLocation,
  selectedId,
  onSelect,
}: EventMapProps) {
  const [zoom, setZoom] = useState(3)
  const [radarOn, setRadarOn] = useState(true)
  const preferCanvas = useMemo(() => detectBrowser().engine !== 'webkit', [])
  const mapEvents = useMemo(() => features as EonetFeature[], [features])
  const {
    host,
    frame,
    frames,
    frameIndex,
    playing,
    setPlaying,
    setFrameIndex,
    loading: radarLoading,
    error: radarError,
  } = useRadar(radarOn)

  const center = useMemo<[number, number]>(
    () => (userLocation ? [userLocation.lat, userLocation.lon] : [20, 0]),
    [userLocation],
  )

  return (
    <div className="event-map">
      <MapContainer
        center={center}
        zoom={3}
        minZoom={1}
        maxZoom={12}
        className="leaflet-map"
        zoomControl={false}
        preferCanvas={preferCanvas}
        worldCopyJump
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={12}
          updateWhenIdle
          keepBuffer={2}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={12}
          updateWhenIdle
          opacity={0.85}
          pane="overlayPane"
        />

        {radarOn && host && frame && (
          <RadarOverlay host={host} frame={frame} />
        )}

        <ZoomControl position="bottomright" />
        <FitWorldWidth />
        <ClampLatitude />
        <ZoomTracker onZoom={setZoom} />

        <MapController
          userLocation={userLocation}
          selectedId={selectedId}
          features={mapEvents}
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lon]}
            radius={markerRadius(zoom, true)}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#ff3b5c',
              fillOpacity: 0.95,
              weight: 2,
              opacity: 1,
            }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}

        {mapEvents.map((feature) => (
          <EventMarker
            key={feature.properties.id}
            feature={feature}
            selected={selectedId === feature.properties.id}
            zoom={zoom}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>

      <div className="map-vignette" aria-hidden="true" />

      <div className="radar-controls">
        <button
          type="button"
          className={`radar-toggle ${radarOn ? 'radar-toggle-on' : ''}`}
          onClick={() => setRadarOn((v) => !v)}
          aria-pressed={radarOn}
        >
          <span className="radar-toggle-dot" />
          Radar
        </button>

        {radarOn && (
          <>
            <button
              type="button"
              className="radar-play"
              onClick={() => setPlaying((p) => !p)}
              disabled={frames.length < 2}
              aria-label={playing ? 'Pause animation' : 'Play animation'}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <input
              type="range"
              className="radar-scrub"
              min={0}
              max={Math.max(0, frames.length - 1)}
              value={frameIndex}
              onChange={(e) => {
                setPlaying(false)
                setFrameIndex(Number(e.target.value))
              }}
              aria-label="Radar time"
              disabled={frames.length < 2}
            />
            <span className="radar-time">
              {radarLoading
                ? 'Loading…'
                : radarError
                  ? 'Offline'
                  : frame
                    ? formatRadarTime(frame.time)
                    : '—'}
            </span>
          </>
        )}
      </div>

      <div className="map-legend" aria-label="Event color legend">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.id} className="map-legend-item">
            <span
              className="map-legend-dot"
              style={{ backgroundColor: getCategoryColor(item.id) }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="map-attrib">
        © OSM · CARTO
        {radarOn ? (
          <>
            {' '}
            ·{' '}
            <a
              href="https://www.rainviewer.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              RainViewer
            </a>
          </>
        ) : null}
      </div>
    </div>
  )
}
