/** Distinct color per NASA EONET category */
const CATEGORY_COLORS: Record<string, string> = {
  wildfires: '#f97316',       // orange — fire
  severeStorms: '#3b82f6',    // blue — storms/hurricanes
  volcanoes: '#dc2626',       // deep red — volcanoes
  earthquakes: '#a855f7',     // purple
  floods: '#06b6d4',          // cyan — water
  landslides: '#a16207',      // earth brown
  drought: '#ca8a04',         // amber
  dustHaze: '#d97706',        // dusty orange
  snow: '#e2e8f0',            // white
  seaLakeIce: '#67e8f9',      // ice blue
  tempExtremes: '#f43f5e',    // hot pink
  waterColor: '#14b8a6',      // teal — algae/bloom
  manmade: '#94a3b8',         // slate gray
}

const TITLE_KEYWORDS: [RegExp, string][] = [
  [/wildfire|forest fire|brush fire/i, 'wildfires'],
  [/tropical storm|hurricane|typhoon|cyclone|tornado|thunderstorm/i, 'severeStorms'],
  [/volcano|eruption|lava/i, 'volcanoes'],
  [/earthquake|seismic/i, 'earthquakes'],
  [/flood|inundat/i, 'floods'],
  [/landslide|mudslide|avalanche/i, 'landslides'],
  [/drought/i, 'drought'],
  [/dust|haze|smog/i, 'dustHaze'],
  [/snow|blizzard/i, 'snow'],
  [/iceberg|sea ice|lake ice/i, 'seaLakeIce'],
  [/heat wave|cold snap|temperature/i, 'tempExtremes'],
  [/algae|red tide|phytoplankton/i, 'waterColor'],
]

export function getCategoryColor(categoryId: string): string {
  return CATEGORY_COLORS[categoryId] ?? '#cbd5e1'
}

export function getPrimaryCategoryId(
  categories: { id: string }[] | undefined,
): string {
  return categories?.[0]?.id ?? 'default'
}

function inferCategoryFromTitle(title: string): string | null {
  for (const [pattern, id] of TITLE_KEYWORDS) {
    if (pattern.test(title)) return id
  }
  return null
}

/** Resolve the best category color for a map marker or card accent */
export function getEventColor(
  categories: { id: string }[] | undefined,
  title?: string,
): string {
  const categoryId = getPrimaryCategoryId(categories)
  if (categoryId !== 'default') return getCategoryColor(categoryId)
  if (title) {
    const inferred = inferCategoryFromTitle(title)
    if (inferred) return getCategoryColor(inferred)
  }
  return '#cbd5e1'
}

export function getCategoryLabel(
  categories: { id: string; title?: string }[] | undefined,
  title?: string,
): string {
  if (categories?.[0]?.title) return categories[0].title
  if (title) {
    const inferred = inferCategoryFromTitle(title)
    if (inferred) return inferred.replace(/([A-Z])/g, ' $1').trim()
  }
  return 'Event'
}
