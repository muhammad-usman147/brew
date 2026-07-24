import Glass from '../ui/Glass'
import './InfluencerCard.css'

export default function InfluencerCard({ influencer, onViewProfile, onContact }) {
  const inf = influencer
  return (
    <Glass className="influencer-card" data-platform={inf.platform}>
      <div className="card-header">
        <img src={inf.avatar} alt={inf.name} className="influencer-avatar" />
        <div className="verification-badge">✓</div>
      </div>
      <div className="card-body">
        <h3>{inf.name}</h3>
        <p className="niche">{inf.niche}</p>
        <div className="platform-stats">
          <div className="platform-item">
            <span className="platform-icon">{inf.platformIcon}</span>
            <div className="platform-info">
              <span className="platform-name">{inf.platformLabel}</span>
              <span className="followers">{inf.followers}</span>
            </div>
          </div>
          <div className="engagement-rate">
            <span className="rate-label">Engagement:</span>
            <span className="rate-value">{inf.engagement}</span>
          </div>
        </div>
        <div className="bio">{inf.bio}</div>
        <div className="tags">
          {inf.tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="card-stats">
          <div className="stat-item">
            <span className="stat-number">{inf.campaigns}</span>
            <span className="stat-text">Campaigns</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{inf.rate}</span>
            <span className="stat-text">Avg. Rate</span>
          </div>
        </div>
      </div>
      <div className="card-footer">
        <button type="button" className="btn-view-profile" onClick={onViewProfile}>
          View Profile
        </button>
        <button type="button" className="btn-contact" onClick={onContact}>
          Contact
        </button>
      </div>
    </Glass>
  )
}
