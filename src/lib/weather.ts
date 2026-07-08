import type { Location, WeatherData } from '../types/weather'

const GEOCODING = 'https://geocoding-api.open-meteo.com/v1'
const FORECAST = 'https://api.open-meteo.com/v1/forecast'
const STORAGE_KEY = 'weather-tracker-location'

export function loadSavedLocation(): Location | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Location
  } catch {
    return null
  }
}

export function saveLocation(location: Location): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(location))
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `${GEOCODING}/reverse?latitude=${lat}&longitude=${lon}&count=1`
  const res = await fetch(url)
  if (!res.ok) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  const data = await res.json()
  const place = data.results?.[0]
  if (!place) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  return [place.name, place.admin1, place.country].filter(Boolean).join(', ')
}

export async function searchLocation(query: string): Promise<Location | null> {
  const url = `${GEOCODING}/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  const place = data.results?.[0]
  if (!place) return null
  return {
    lat: place.latitude,
    lon: place.longitude,
    name: [place.name, place.admin1, place.country].filter(Boolean).join(', '),
  }
}

export async function fetchWeather(location: Location): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    forecast_days: '5',
    timezone: 'auto',
  })

  const res = await fetch(`${FORECAST}?${params}`)
  if (!res.ok) throw new Error('Failed to fetch weather')

  const data = await res.json()
  const daily = data.daily.time.map((date: string, i: number) => ({
    date,
    maxTemp: data.daily.temperature_2m_max[i],
    minTemp: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weather_code[i],
  }))

  return {
    location,
    current: {
      temperature: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      windSpeed: data.current.wind_speed_10m,
    },
    daily,
  }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    })
  })
}

export async function fetchLocationFromIP(): Promise<Location | null> {
  try {
    const res = await fetch('https://ipapi.co/json/')
    if (!res.ok) return null
    const data = await res.json()
    if (data.error || data.latitude == null || data.longitude == null) return null
    const name = [data.city, data.region, data.country_name]
      .filter(Boolean)
      .join(', ')
    return {
      lat: data.latitude,
      lon: data.longitude,
      name: name || `${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)}`,
    }
  } catch {
    return null
  }
}

/** Try GPS, then IP geolocation, then last saved location. */
export async function detectLocation(): Promise<Location> {
  try {
    const pos = await getCurrentPosition()
    const location = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      name: await reverseGeocode(pos.coords.latitude, pos.coords.longitude),
    }
    saveLocation(location)
    return location
  } catch {
    // GPS denied or unavailable — fall through
  }

  const ipLocation = await fetchLocationFromIP()
  if (ipLocation) {
    saveLocation(ipLocation)
    return ipLocation
  }

  const saved = loadSavedLocation()
  if (saved) return saved

  throw new Error('Could not detect your location')
}
