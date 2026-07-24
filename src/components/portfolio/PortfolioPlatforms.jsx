import Glass from '../ui/Glass'
import './PortfolioPlatforms.css'

export function PortfolioHeader({ onAddPlatform }) {
  return (
    <div className="portfolio-header">
      <div className="header-content">
        <h1>My Portfolio</h1>
        <p>Showcase your work across different platforms</p>
      </div>
      <button type="button" className="btn-create-portfolio" onClick={onAddPlatform}>
        <span className="icon">➕</span>
        <span>Add Platform</span>
      </button>
    </div>
  )
}

export default function PortfolioPlatforms({ platforms, onEdit, onViewFull }) {
  return (
    <div className="platforms-grid">
      {platforms.map(p => (
        <Glass key={p.id} className="platform-card">
          <div className="platform-header">
            <div className={`platform-icon-badge ${p.iconClass}`}>{p.icon}</div>
            <h3>{p.name}</h3>
            <button type="button" className="btn-edit" onClick={() => onEdit(p.name)}>
              ✏️
            </button>
          </div>
          <div className="platform-stats-grid">
            {p.stats.map(([label, value]) => (
              <div key={label} className="stat-row-item">
                <span className="label">{label}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
          <div className="platform-content">
            <h4>{p.tweets ? 'Recent Highlights' : 'Recent Work'}</h4>
            {p.gallery && (
              <div className="work-gallery">
                {p.gallery.map((bg, i) => (
                  <div key={i} className="work-item" style={{ background: bg }} />
                ))}
              </div>
            )}
            {p.tweets && (
              <div className="tweet-list">
                {p.tweets.map((t, i) => (
                  <div key={i} className="tweet-item">
                    <p>{t.text}</p>
                    <span className="tweet-stats">{t.stats}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn-view-full" onClick={() => onViewFull(p.name)}>
            View Full Portfolio
          </button>
        </Glass>
      ))}
    </div>
  )
}
