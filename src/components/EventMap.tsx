import { useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polygon,
  useMap,
} from 'react-leaflet'
import type { EonetFeature } from '../types/eonet'
import type { Location } from '../types/weather'
import { getFeatureCoordinates } from '../lib/eonet'
import {
  getCategoryLabel,
  getEventColor,
} from '../lib/categoryColors'
import 'leaflet/dist/leaflet.css'

type EventMapProps = {
  features: GeoJSON.Feature[]
  userLocation: Location | null
  selectedId: string | null
  onSelect: (id: string | null) => void
}

function markerStyle(color: string, selected: boolean) {
  return {
    color,
    fillColor: color,
    fillOpacity: selected ? 1 : 0.88,
    weight: selected ? 3 : 2,
    opacity: 1,
  }
}

function MapController({
  userLocation,
  selectedId,
  features,
}: {
  userLocation: Location | null
  selectedId: string | null
  features: GeoJSON.Feature[]
}) {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lon], map.getZoom())
    }
  }, [map, userLocation])

  useEffect(() => {
    if (!selectedId) return
    const feature = features.find(
      (f) => (f.properties as { id?: string })?.id === selectedId,
    )
    if (!feature?.geometry) return
    const coords = getFeatureCoordinates(feature.geometry)
    if (coords) map.flyTo(coords, 6, { duration: 1 })
  }, [map, selectedId, features])

  return null
}

function EventMarker({
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
  const path = markerStyle(color, selected)

  if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
    const positions =
      feature.geometry.type === 'Polygon'
        ? (feature.geometry.coordinates as [number, number][][]).map((ring) =>
            ring.map(([lng, lat]) => [lat, lng] as [number, number]),
          )
        : (feature.geometry.coordinates as [number, number][][][]).flatMap((poly) =>
            poly.map((ring) =>
              ring.map(([lng, lat]) => [lat, lng] as [number, number]),
            ),
          )

    return (
      <>
        {positions.map((ring, i) => (
          <Polygon
            key={`${props.id}-poly-${i}`}
            positions={ring}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: selected ? 0.45 : 0.22,
              weight: selected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(props.id) }}
          />
        ))}
        <CircleMarker
          center={[lat, lon]}
          radius={selected ? 10 : 7}
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
  }

  return (
    <CircleMarker
      center={[lat, lon]}
      radius={selected ? 10 : 7}
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
  )
}

export function EventMap({
  features,
  userLocation,
  selectedId,
  onSelect,
}: EventMapProps) {
  const center = useMemo<[number, number]>(
    () =>
      userLocation
        ? [userLocation.lat, userLocation.lon]
        : [20, 0],
    [userLocation],
  )

  const typedFeatures = features as EonetFeature[]

  return (
    <div className="event-map">
      <MapContainer
        center={center}
        zoom={3}
        className="leaflet-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController
          userLocation={userLocation}
          selectedId={selectedId}
          features={features}
        />

        {userLocation && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lon]}
            radius={8}
            pathOptions={{
              color: '#ffffff',
              fillColor: '#ffffff',
              fillOpacity: 1,
              weight: 3,
              opacity: 1,
            }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}

        {typedFeatures.map((feature) => (
          <EventMarker
            key={feature.properties.id + (feature.properties.date ?? '')}
            feature={feature}
            selected={selectedId === feature.properties.id}
            onSelect={onSelect}
          />
        ))}
      </MapContainer>
    </div>
  )
}
