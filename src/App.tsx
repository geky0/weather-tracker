import { useState } from 'react'
import type { EventFilters, EventStatus } from './types/eonet'
import { useEonetEvents } from './hooks/useEonetEvents'
import { useWeather } from './hooks/useWeather'
import { WeatherPanel } from './components/WeatherPanel'
import { EventMap } from './components/EventMap'
import { EventSidebar } from './components/EventSidebar'
import { CategoryFilter } from './components/CategoryFilter'
import { LocationSearch } from './components/LocationSearch'

export default function App() {
  const [filters, setFilters] = useState<EventFilters>({
    status: 'open',
    category: null,
    days: 30,
    limit: 100,
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    setLocation,
    detectMyLocation,
  } = useWeather()
  const { categories, features, loading: eventsLoading, error: eventsError } =
    useEonetEvents(filters)

  function handleStatusChange(status: EventStatus) {
    setFilters((f) => ({ ...f, status }))
    setSelectedId(null)
  }

  function handleCategoryChange(category: string | null) {
    setFilters((f) => ({ ...f, category }))
    setSelectedId(null)
  }

  return (
    <div className="app">
      <div className="bg-mesh" aria-hidden="true" />
      <div className="bg-noise" aria-hidden="true" />

      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Weather Tracker</h1>
            <p className="brand-subtitle">NASA EONET + Open-Meteo</p>
          </div>
        </div>
        <LocationSearch
          onSelect={setLocation}
          onDetect={detectMyLocation}
          detecting={weatherLoading}
        />
      </header>

      <main className="app-main">
        <aside className="sidebar">
          <WeatherPanel
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={filters.category}
            status={filters.status}
            onCategoryChange={handleCategoryChange}
            onStatusChange={handleStatusChange}
          />

          <EventSidebar
            features={features}
            loading={eventsLoading}
            error={eventsError}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </aside>

        <section className="map-section">
          <EventMap
            features={features}
            userLocation={weather?.location ?? null}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>

        <div className="mobile-bottom">
          <EventSidebar
            features={features}
            loading={eventsLoading}
            error={eventsError}
            selectedId={selectedId}
            onSelect={setSelectedId}
            mobileSheet
          />
        </div>
      </main>

      <footer className="app-footer">
        <span>
          Data from{' '}
          <a
            href="https://eonet.gsfc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NASA EONET
          </a>{' '}
          &amp;{' '}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open-Meteo
          </a>
        </span>
      </footer>
    </div>
  )
}
