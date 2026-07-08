export type Location = {
  lat: number
  lon: number
  name: string
}

export type CurrentWeather = {
  temperature: number
  weatherCode: number
  windSpeed: number
}

export type DailyForecast = {
  date: string
  maxTemp: number
  minTemp: number
  weatherCode: number
}

export type WeatherData = {
  location: Location
  current: CurrentWeather
  daily: DailyForecast[]
}
