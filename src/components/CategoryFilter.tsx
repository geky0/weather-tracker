import type { EonetCategory, EventStatus } from '../types/eonet'
import { getCategoryColor } from '../lib/categoryColors'

type CategoryFilterProps = {
  categories: EonetCategory[]
  selectedCategory: string | null
  status: EventStatus
  onCategoryChange: (category: string | null) => void
  onStatusChange: (status: EventStatus) => void
}

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
]

export function CategoryFilter({
  categories,
  selectedCategory,
  status,
  onCategoryChange,
  onStatusChange,
}: CategoryFilterProps) {
  return (
    <div className="category-filter">
      <div className="status-toggle" role="group" aria-label="Event status">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`status-btn ${status === opt.value ? 'status-btn-active' : ''}`}
            onClick={() => onStatusChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="category-chips" role="group" aria-label="Event categories">
        <button
          type="button"
          className={`category-chip ${selectedCategory === null ? 'category-chip-active' : ''}`}
          onClick={() => onCategoryChange(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`category-chip ${selectedCategory === cat.id ? 'category-chip-active' : ''}`}
            style={{ '--chip-color': getCategoryColor(cat.id) } as React.CSSProperties}
            onClick={() =>
              onCategoryChange(selectedCategory === cat.id ? null : cat.id)
            }
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  )
}
