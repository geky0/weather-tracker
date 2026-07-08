import type { WeatherData } from '../types/weather'
import { getWeatherInfo, formatDay } from '../lib/weatherCodes'
import { GlassCard } from './GlassCard'

type WeatherPanelProps = {
  weather: WeatherData | null
  loading: boolean
  error: string | null
}

export function WeatherPanel({ weather, loading, error }: WeatherPanelProps) {
  if (loading && !weather) {
    return (
      <GlassCard className="weather-panel">
        <div className="weather-skeleton">
          <span className="skeleton-pulse" />
          Calibrating atmosphere...
        </div>
      </GlassCard>
    )
  }

  if (error && !weather) {
    return (
      <GlassCard className="weather-panel">
        <p className="error-text">{error}</p>
      </GlassCard>
    )
  }

  if (!weather) return null

  const { label, icon } = getWeatherInfo(weather.current.weatherCode)
  const temp = Math.round(weather.current.temperature)

  return (
    <GlassCard className="weather-panel weather-panel-hero">
      <div className="lens-flare" aria-hidden="true" />

      <div className="weather-panel-top">
        <div className="live-indicator">
          <span className="live-dot" />
          <span>LIVE</span>
        </div>
        <p className="weather-location">{weather.location.name}</p>
      </div>

      <div className="weather-hero">
        <div className="weather-temp chrome-text" data-unit="°">
          {temp}
        </div>
        <p className="weather-condition">
          <span className="weather-icon">{icon}</span>
          {label}
        </p>
      </div>

      <div className="weather-meta">
        <span>Wind {Math.round(weather.current.windSpeed)} km/h</span>
        <span className="meta-divider">◆</span>
        <span>5-day outlook</span>
      </div>

      <div className="forecast-strip">
        {weather.daily.map((day, i) => {
          const info = getWeatherInfo(day.weatherCode)
          return (
            <div
              key={day.date}
              className="forecast-day"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="forecast-day-name">{formatDay(day.date)}</span>
              <span className="forecast-icon">{info.icon}</span>
              <span className="forecast-temps">
                <strong>{Math.round(day.maxTemp)}°</strong>
                <span>{Math.round(day.minTemp)}°</span>
              </span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
