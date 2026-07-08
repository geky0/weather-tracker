const CATEGORY_COLORS: Record<string, string> = {
  severeStorms: '#3b82f6',
  wildfires: '#f97316',
  volcanoes: '#ef4444',
  earthquakes: '#a855f7',
  landslides: '#84cc16',
  floods: '#06b6d4',
  seaLakeIce: '#38bdf8',
  snow: '#e2e8f0',
  tempExtremes: '#f43f5e',
  dustHaze: '#d97706',
  waterColor: '#14b8a6',
  manmade: '#94a3b8',
}

export function getCategoryColor(categoryId: string): string {
  return CATEGORY_COLORS[categoryId] ?? '#cbd5e1'
}

export function getPrimaryCategoryId(
  categories: { id: string }[] | undefined,
): string {
  return categories?.[0]?.id ?? 'default'
}
