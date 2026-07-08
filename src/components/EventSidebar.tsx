import type { EonetFeature } from '../types/eonet'
import { getCategoryColor, getPrimaryCategoryId } from '../lib/categoryColors'
import { GlassCard } from './GlassCard'

type EventSidebarProps = {
  features: GeoJSON.Feature[]
  loading: boolean
  error: string | null
  selectedId: string | null
  onSelect: (id: string | null) => void
  mobileSheet?: boolean
}

export function EventSidebar({
  features,
  loading,
  error,
  selectedId,
  onSelect,
  mobileSheet = false,
}: EventSidebarProps) {
  const typedFeatures = features as EonetFeature[]

  return (
    <div className={`event-sidebar ${mobileSheet ? 'event-sidebar-mobile' : ''}`}>
      <div className="event-sidebar-header">
        <h2>Natural Events</h2>
        <span className="event-count">
          {loading ? '...' : `${typedFeatures.length} events`}
        </span>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="event-list">
        {loading && typedFeatures.length === 0 && (
          <p className="muted-text">Loading events from NASA EONET...</p>
        )}

        {!loading && typedFeatures.length === 0 && (
          <p className="muted-text">No events match your filters.</p>
        )}

        {typedFeatures.map((feature, index) => {
          const props = feature.properties
          const categoryId = getPrimaryCategoryId(props.categories)
          const color = getCategoryColor(categoryId)
          const isOpen = !props.closed

          return (
            <GlassCard
              key={props.id + (props.date ?? '') + index}
              className="event-card"
              accent={color}
              active={selectedId === props.id}
              onClick={() =>
                onSelect(selectedId === props.id ? null : props.id)
              }
            >
              <div className="event-card-header">
                <span
                  className="event-dot"
                  style={{ backgroundColor: color }}
                />
                <h3 className="event-title">{props.title}</h3>
              </div>

              <div className="event-meta">
                <span className="event-category">
                  {props.categories?.[0]?.title ?? 'Event'}
                </span>
                <span
                  className={`event-status ${isOpen ? 'status-open' : 'status-closed'}`}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              {props.magnitudeValue != null && (
                <p className="event-magnitude">
                  {props.magnitudeValue}
                  {props.magnitudeUnit ? ` ${props.magnitudeUnit}` : ''}
                  {props.magnitudeDescription
                    ? ` — ${props.magnitudeDescription}`
                    : ''}
                </p>
              )}

              {props.description && (
                <p className="event-description">{props.description}</p>
              )}

              {props.link && (
                <a
                  href={props.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on EONET →
                </a>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
