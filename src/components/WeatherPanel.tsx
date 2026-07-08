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
        <div className="weather-skeleton">Loading weather...</div>
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

  return (
    <GlassCard className="weather-panel">
      <div className="weather-header">
        <div>
          <p className="weather-location">{weather.location.name}</p>
          <p className="weather-condition">
            {icon} {label}
          </p>
        </div>
        <div className="weather-temp">
          {Math.round(weather.current.temperature)}°
        </div>
      </div>

      <p className="weather-wind">
        Wind {Math.round(weather.current.windSpeed)} km/h
      </p>

      <div className="forecast-strip">
        {weather.daily.map((day) => {
          const info = getWeatherInfo(day.weatherCode)
          return (
            <div key={day.date} className="forecast-day">
              <span className="forecast-day-name">{formatDay(day.date)}</span>
              <span className="forecast-icon">{info.icon}</span>
              <span className="forecast-temps">
                {Math.round(day.maxTemp)}° / {Math.round(day.minTemp)}°
              </span>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
