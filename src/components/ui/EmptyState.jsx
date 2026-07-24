import './EmptyState.css'

export default function EmptyState({ icon, title, description, className = '' }) {
  return (
    <div className={['empty-state', className].filter(Boolean).join(' ')}>
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  )
}
