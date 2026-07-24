import Glass from '../ui/Glass'
import './JobCard.css'

function badgeClass(badge, index) {
  if (index === 0) return 'badge-verified'
  if (badge.includes('🔥')) return 'badge-urgent'
  if (badge.includes('⭐')) return 'badge-featured'
  return 'badge-category'
}

export default function JobCard({ job, onSave, onApply }) {
  const j = job
  return (
    <Glass className="job-card" data-category={j.category}>
      <div className="job-header">
        <div className="job-title-section">
          <h3>{j.title}</h3>
          <div className="job-badges">
            {j.badges.map((b, i) => (
              <span key={i} className={badgeClass(b, i)}>
                {b}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={`save-btn${j.savedDefault ? ' saved' : ''}`}
          onClick={onSave}
        >
          <span className="icon">🔖</span>
        </button>
      </div>
      <div className="job-meta">
        <span className="meta-item">
          <span className="icon">💰</span>
          <strong>{j.budget}</strong>
        </span>
        <span className="meta-item">
          <span className="icon">📍</span>
          {j.location}
        </span>
        <span className="meta-item">
          <span className="icon">👥</span>
          {j.followers}
        </span>
        <span className="meta-item">
          <span className="icon">📅</span>
          Posted {j.posted}
        </span>
      </div>
      <p className="job-description">{j.description}</p>
      <div className="job-details-extra">
        <div className="client-info">
          <img src={j.client.avatar} alt={j.client.name} className="client-avatar" />
          <div className="client-details">
            <span className="client-name">{j.client.name}</span>
            <span className="client-stats">
              {j.client.spent} spent • {j.client.campaigns} campaigns
            </span>
          </div>
        </div>
        {j.attachments && (
          <div className="attachments">
            <span className="attachment-icon">📎</span>
            <span>{j.attachments}</span>
          </div>
        )}
      </div>
      <div className="job-footer">
        <div className="proposals-count">
          <span className="icon">📝</span>
          <span>{j.proposals} proposals</span>
        </div>
        <button type="button" className="btn-apply" onClick={onApply}>
          Submit Proposal
        </button>
      </div>
    </Glass>
  )
}

export function JobsGrid({ children }) {
  return <div className="jobs-grid">{children}</div>
}
