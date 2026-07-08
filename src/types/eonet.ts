export type EonetCategory = {
  id: string
  title: string
  description?: string
  link?: string
}

export type EonetSource = {
  id: string
  title: string
  source?: string
  link?: string
}

export type EonetGeometry = {
  magnitudeValue?: number | null
  magnitudeUnit?: string | null
  magnitudeDescription?: string | null
  date: string
  type: 'Point' | 'Polygon' | 'MultiPolygon' | 'LineString'
  coordinates: number[] | number[][] | number[][][]
}

export type EonetEvent = {
  id: string
  title: string
  description?: string | null
  link?: string
  closed?: string | null
  categories: EonetCategory[]
  sources?: EonetSource[]
  geometry: EonetGeometry[]
}

export type EonetEventsResponse = {
  title: string
  events: EonetEvent[]
}

export type EonetCategoriesResponse = {
  title: string
  categories: EonetCategory[]
}

export type EonetFeatureProperties = {
  id: string
  title: string
  description?: string | null
  link?: string
  closed?: string | null
  date?: string
  magnitudeValue?: number | null
  magnitudeUnit?: string | null
  magnitudeDescription?: string | null
  categories: EonetCategory[]
  sources?: EonetSource[]
}

export type EonetFeature = GeoJSON.Feature<
  GeoJSON.Point | GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString,
  EonetFeatureProperties
>

export type EonetFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point | GeoJSON.Polygon | GeoJSON.MultiPolygon | GeoJSON.LineString,
  EonetFeatureProperties
>

export type EventStatus = 'open' | 'closed' | 'all'

export type EventFilters = {
  status: EventStatus
  category: string | null
  days: number
  limit: number
}
