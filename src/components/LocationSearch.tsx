import { useState, type FormEvent } from 'react'
import { searchLocation } from '../lib/weather'
import type { Location } from '../types/weather'

type LocationSearchProps = {
  onSelect: (location: Location) => void
  onDetect: () => void
  detecting?: boolean
}

export function LocationSearch({
  onSelect,
  onDetect,
  detecting = false,
}: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    try {
      const location = await searchLocation(query.trim())
      if (location) {
        onSelect(location)
        setQuery('')
      }
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="location-search-row">
      <button
        type="button"
        className="location-detect-btn"
        onClick={onDetect}
        disabled={detecting}
        aria-label="Use my location"
        title="Use my location"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </button>

      <form onSubmit={handleSubmit} className="location-search">
        <svg
          className="location-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          className="location-search-input"
          aria-label="Search location"
        />
        <button
          type="submit"
          disabled={searching || !query.trim()}
          className="location-search-btn"
        >
          {searching ? '...' : 'Go'}
        </button>
      </form>
    </div>
  )
}
