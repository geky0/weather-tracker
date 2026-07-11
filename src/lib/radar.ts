export type RadarFrame = {
  time: number
  path: string
}

export type RadarMapsData = {
  host: string
  frames: RadarFrame[]
}

type RainViewerResponse = {
  host: string
  radar?: {
    past?: RadarFrame[]
    nowcast?: RadarFrame[]
  }
}

const API_URL = 'https://api.rainviewer.com/public/weather-maps.json'

export async function fetchRadarMaps(): Promise<RadarMapsData> {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error('Failed to load weather radar')
  const data = (await res.json()) as RainViewerResponse

  const past = data.radar?.past ?? []
  const nowcast = data.radar?.nowcast ?? []
  const frames = [...past, ...nowcast]

  if (!data.host || frames.length === 0) {
    throw new Error('No radar frames available')
  }

  return { host: data.host, frames }
}

/** Color scheme 2 = Universal Blue, options 1_1 = smooth + snow */
export function radarTileUrl(host: string, framePath: string): string {
  return `${host}${framePath}/256/{z}/{x}/{y}/2/1_1.png`
}

export function formatRadarTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}
