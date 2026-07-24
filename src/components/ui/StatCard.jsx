import Glass from './Glass'
import './StatCard.css'

export function StatCard({ icon, value, label }) {
  return (
    <Glass className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </Glass>
  )
}

export function StatsGrid({ columns = 4, className = '', children }) {
  return (
    <div
      className={['stats-grid', className].filter(Boolean).join(' ')}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {children}
    </div>
  )
}
