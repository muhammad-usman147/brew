import Glass from '../ui/Glass'
import Button from '../ui/Button'
import './ConnectionCard.css'

export default function ConnectionCard({ connection, onMessage, onNewCampaign }) {
  const c = connection
  return (
    <Glass className="connection-card" data-platform={c.platform}>
      <div className="connection-header">
        <img src={c.avatar} alt={c.name} className="connection-avatar" />
        <div className="verification-badge">✓</div>
      </div>
      <div className="connection-body">
        <h3>{c.name}</h3>
        <p className="niche">{c.niche}</p>
        <div className="platform-info">
          <span className="platform-icon">{c.platformIcon}</span>
          <span>{c.platformLabel}</span>
        </div>
        <div className="connection-stats-row">
          <div className="stat-item">
            <span className="stat-value">{c.projects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{c.spent}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{c.rating}</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
        <div className="last-contacted">
          <span className="icon">📅</span>
          <span>Last contacted: {c.lastContact}</span>
        </div>
        <div className="collaboration-history">
          <h4>Past Collaborations</h4>
          <div className="project-list">
            {c.collaborations.map((proj, i) => (
              <div key={i} className="project-item">
                <span className="project-name">{proj.name}</span>
                <span className="project-date">{proj.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="connection-footer">
        <Button variant="secondary" onClick={onMessage}>
          <span className="icon">💬</span>
          <span>Message</span>
        </Button>
        <Button variant="primary" onClick={onNewCampaign}>
          <span className="icon">➕</span>
          <span>New Campaign</span>
        </Button>
      </div>
    </Glass>
  )
}

export function ConnectionsGrid({ children }) {
  return <div className="connections-grid">{children}</div>
}
