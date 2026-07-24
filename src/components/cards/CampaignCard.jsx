import Glass from '../ui/Glass'
import Button from '../ui/Button'
import './CampaignCard.css'

const STATUS_LABEL = {
  active: '🟢 Active',
  draft: '📝 Draft',
  completed: '✅ Completed',
}

export default function CampaignCard({
  campaign,
  onAction,
  onManageProposals,
  onMarkComplete,
  onViewReport,
  onContinueEditing,
}) {
  const c = campaign
  const cardClass = [
    'campaign-card',
    c.status === 'draft' ? 'draft-card' : '',
    c.status === 'completed' ? 'completed-card' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Glass className={cardClass}>
      <div className="campaign-header">
        <div className="campaign-title-section">
          <h3>{c.title}</h3>
          <span className={`campaign-status ${c.status}`}>{STATUS_LABEL[c.status]}</span>
        </div>
        <div className="campaign-actions">
          <button type="button" className="action-btn" title="Edit" onClick={() => onAction('edit', c.id)}>
            ✏️
          </button>
          <button type="button" className="action-btn" title="Duplicate" onClick={() => onAction('duplicate', c.id)}>
            📋
          </button>
          {c.status === 'draft' && (
            <button type="button" className="action-btn primary" onClick={() => onAction('publish', c.id)}>
              🚀 Publish
            </button>
          )}
          {c.status !== 'completed' && (
            <button type="button" className="action-btn" title="Delete" onClick={() => onAction('delete', c.id)}>
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="campaign-meta">
        {[
          ['📁', c.category],
          ['💰', c.budget],
          ['📅', `${c.startDate} – ${c.endDate}`],
          ['👥', `${c.influencers} influencers`],
          ['📨', `${c.proposals} proposals`],
        ].map(([icon, val]) => (
          <span key={val} className="meta-item">
            <span className="icon">{icon}</span>
            {val}
          </span>
        ))}
      </div>

      <p className="campaign-description">{c.description}</p>

      {c.analytics && (
        <div className="campaign-analytics">
          <div className="analytics-grid">
            {[
              ['👁️', 'views', 'Views'],
              ['📨', 'proposals', 'Proposals'],
              ['📊', 'responseRate', 'Response Rate'],
              ['⭐', 'rating', 'Avg. Rating'],
            ].map(([icon, key, label]) => (
              <div key={key} className="analytics-item">
                <span className="analytics-icon">{icon}</span>
                <div className="analytics-data">
                  <span className="analytics-value">{c.analytics[key]}</span>
                  <span className="analytics-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mini-chart">
            <div className="chart-header">
              <span className="chart-title">Views & Proposals Trend</span>
            </div>
            <div className="chart-bars">
              {c.chartData.map((h, i) => (
                <div key={i} className="chart-bar" style={{ height: `${h}%` }}>
                  <span className="bar-value">{h}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {c.results && (
        <div className="campaign-results">
          {[
            ['Total Reach:', c.results.reach],
            ['Engagement:', c.results.engagement],
            ['ROI:', c.results.roi],
            ['Rating:', c.results.rating],
          ].map(([label, val]) => (
            <div key={label} className="result-item">
              <span className="result-label">{label}</span>
              <span className="result-value">{val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="campaign-footer">
        {c.status === 'active' && (
          <Button variant="secondary" onClick={onMarkComplete}>
            Mark as Complete
          </Button>
        )}
        {c.status === 'active' && (
          <Button variant="primary" onClick={onManageProposals}>
            Manage Proposals
          </Button>
        )}
        {c.status === 'draft' && (
          <Button variant="secondary" onClick={onContinueEditing}>
            Continue Editing
          </Button>
        )}
        {c.status === 'draft' && (
          <Button variant="primary" onClick={() => onAction('publish', c.id)}>
            Publish Now
          </Button>
        )}
        {c.status === 'completed' && (
          <Button variant="secondary" onClick={() => onAction('duplicate', c.id)}>
            Create Similar
          </Button>
        )}
        {c.status === 'completed' && (
          <Button variant="primary" onClick={onViewReport}>
            View Full Report
          </Button>
        )}
      </div>
    </Glass>
  )
}

export function CampaignsList({ children }) {
  return <div className="campaigns-content">{children}</div>
}
