import type {
  EonetCategoriesResponse,
  EonetFeatureCollection,
  EventStatus,
} from '../types/eonet'

const BASE = 'https://eonet.gsfc.nasa.gov/api/v3'

export type FetchEventsParams = {
  status?: EventStatus
  category?: string | null
  days?: number
  limit?: number
  bbox?: string
}

export async function fetchCategories(): Promise<EonetCategoriesResponse> {
  const res = await fetch(`${BASE}/categories`)
  if (!res.ok) throw new Error('Failed to fetch EONET categories')
  return res.json()
}

export async function fetchEventsGeoJSON(
  params: FetchEventsParams = {},
): Promise<EonetFeatureCollection> {
  const search = new URLSearchParams()

  if (params.status && params.status !== 'open') {
    search.set('status', params.status)
  }
  if (params.category) search.set('category', params.category)
  if (params.days) search.set('days', String(params.days))
  if (params.limit) search.set('limit', String(params.limit))
  if (params.bbox) search.set('bbox', params.bbox)

  const qs = search.toString()
  const url = `${BASE}/events/geojson${qs ? `?${qs}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch EONET events')
  return res.json()
}

/** EONET GeoJSON often emits multiple features per event (one per date). Keep the latest. */
export function dedupeFeaturesByEventId(
  features: GeoJSON.Feature[],
): GeoJSON.Feature[] {
  const byId = new Map<string, GeoJSON.Feature>()

  for (const feature of features) {
    const props = feature.properties as { id?: string; date?: string } | null
    const id = props?.id
    if (!id) continue

    const existing = byId.get(id)
    if (!existing) {
      byId.set(id, feature)
      continue
    }

    const nextDate = props?.date ?? ''
    const prevDate =
      (existing.properties as { date?: string } | null)?.date ?? ''
    if (nextDate >= prevDate) byId.set(id, feature)
  }

  return Array.from(byId.values())
}

export function getFeatureCoordinates(
  geometry: GeoJSON.Geometry,
): [number, number] | null {
  if (geometry.type === 'Point') {
    const [lon, lat] = geometry.coordinates as [number, number]
    return [lat, lon]
  }

  if (geometry.type === 'Polygon') {
    const ring = geometry.coordinates[0] as [number, number][]
    return polygonCentroid(ring)
  }

  if (geometry.type === 'MultiPolygon') {
    const ring = geometry.coordinates[0]?.[0] as [number, number][] | undefined
    return ring ? polygonCentroid(ring) : null
  }

  if (geometry.type === 'LineString') {
    const coords = geometry.coordinates as [number, number][]
    const mid = coords[Math.floor(coords.length / 2)]
    if (!mid) return null
    return [mid[1], mid[0]]
  }

  return null
}

function polygonCentroid(ring: [number, number][]): [number, number] {
  let latSum = 0
  let lonSum = 0
  const count = ring.length || 1
  for (const [lon, lat] of ring) {
    lonSum += lon
    latSum += lat
  }
  return [latSum / count, lonSum / count]
}
