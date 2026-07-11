import { memo, useEffect, useMemo, useRef } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet'
import type { EonetFeature } from '../types/eonet'
import type { Location } from '../types/weather'
import { getFeatureCoordinates } from '../lib/eonet'
import {
  getCategoryLabel,
  getEventColor,
  getCategoryColor,
} from '../lib/categoryColors'
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
    // Fix blank/half-rendered tiles after layout settles
    const t = window.setTimeout(() => map.invalidateSize(), 80)
    return () => window.clearTimeout(t)
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

const EventMarker = memo(function EventMarker({
  feature,
  selected,
  onSelect,
}: {
  feature: EonetFeature
  selected: boolean
  onSelect: (id: string) => void
}) {
  const props = feature.properties
  const color = getEventColor(props.categories, props.title)
  const categoryLabel = getCategoryLabel(props.categories, props.title)
  const coords = getFeatureCoordinates(feature.geometry)

  if (!coords) return null

  const [lat, lon] = coords
  const radius = selected ? 9 : 6
  const path = {
    color: selected ? '#ffffff' : color,
    fillColor: color,
    fillOpacity: selected ? 1 : 0.9,
    weight: selected ? 2.5 : 1.5,
    opacity: 1,
  }

  // Polygons / lines only when selected — keeps pan/zoom smooth at world scale
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
  const mapEvents = useMemo(
    () => features as EonetFeature[],
    [features],
  )

  const center = useMemo<[number, number]>(
    () =>
      userLocation ? [userLocation.lat, userLocation.lon] : [20, 0],
    [userLocation],
  )

  return (
    <div className="event-map">
      <MapContainer
        center={center}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        className="leaflet-map"
        zoomControl={false}
        preferCanvas
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

        <ZoomControl position="bottomright" />

        <MapController
          userLocation={userLocation}
          selectedId={selectedId}
          features={mapEvents}
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lon]}
            radius={7}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#ffffff',
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
            onSelect={onSelect}
          />
        ))}
      </MapContainer>

      <div className="map-vignette" aria-hidden="true" />

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
      </div>
    </div>
  )
}
