import Glass from './Glass'
import './SearchFilters.css'

export default function SearchFilters({ search, onSearchChange, placeholder, filters, activeFilter, onFilterChange }) {
  return (
    <Glass className="search-section">
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {filters?.length > 0 && (
        <div className="filter-buttons">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`filter-btn${activeFilter === value ? ' active' : ''}`}
              onClick={() => onFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </Glass>
  )
}
