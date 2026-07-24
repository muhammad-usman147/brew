import Glass from '../ui/Glass'
import Button from '../ui/Button'
import './InfluencerClientCard.css'

export default function InfluencerClientCard({ client, onMessage, onViewProfile }) {
  const c = client
  return (
    <Glass className="client-card">
      <div className="client-header">
        <img src={c.avatar} alt={c.name} className="client-avatar" />
        <div className="verified-badge">✓</div>
      </div>
      <div className="client-body">
        <h3>{c.name}</h3>
        <p className="company">{c.company}</p>
        <div className="company-details">
          <p className="industry">{c.industry}</p>
          <p className="description">{c.desc}</p>
        </div>
        <div className="client-stats-row">
          <div className="stat-item">
            <span className="stat-value">{c.projects}</span>
            <span className="stat-label">Projects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{c.earned}</span>
            <span className="stat-label">Earned</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{c.rating}</span>
            <span className="stat-label">Rating</span>
          </div>
        </div>
        <div className="last-worked">
          <span className="icon">📅</span>
          <span>Last project: {c.lastWorked}</span>
        </div>
        <div className="project-history">
          <h4>Collaboration History</h4>
          <div className="project-list">
            {c.history.map((h, i) => (
              <div key={i} className="project-item">
                <div className="project-info">
                  <span className="project-name">{h.name}</span>
                  <span className="project-date">{h.date}</span>
                </div>
                <span className="project-amount">{h.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="client-footer">
        <Button variant="secondary" onClick={onMessage}>
          <span className="icon">💬</span>
          <span>Message</span>
        </Button>
        <Button variant="primary" onClick={onViewProfile}>
          <span className="icon">👁️</span>
          <span>View Profile</span>
        </Button>
      </div>
    </Glass>
  )
}
