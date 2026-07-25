import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import CampaignModal from '../../components/CampaignModal'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'

const influencers = [
  { id:1, name:'Sarah Mitchell', niche:'Fashion & Lifestyle', platform:'instagram', platformLabel:'Instagram', platformIcon:'📷', followers:'125K followers', engagement:'4.8%', avatar:'https://i.pravatar.cc/150?img=33', rate:'$1.5K', campaigns:23, rating:'4.9', bio:'Sustainable fashion advocate sharing style tips and eco-friendly brands. Authentic engagement with millennial and Gen-Z audiences.', tags:['Fashion','Sustainable','Lifestyle'] },
  { id:2, name:'Tech with Jason', niche:'Technology & Reviews', platform:'youtube', platformLabel:'YouTube', platformIcon:'📹', followers:'450K subscribers', engagementLabel:'Avg. Views:', engagement:'85K', avatar:'https://i.pravatar.cc/150?img=14', rate:'$3.5K', campaigns:56, rating:'5.0', bio:'In-depth tech reviews and tutorials. Specializing in smart home devices, gadgets, and consumer electronics with honest opinions.', tags:['Tech','Reviews','Smart Home'] },
  { id:3, name:"Emma's Kitchen", niche:'Food & Cooking', platform:'tiktok', platformLabel:'TikTok', platformIcon:'🎵', followers:'280K followers', engagement:'8.2%', avatar:'https://i.pravatar.cc/150?img=45', rate:'$1.2K', campaigns:34, rating:'4.8', bio:'Quick recipes and food hacks that go viral. Known for creative presentations and trending audio usage. Perfect for food brands.', tags:['Food','Cooking','Recipes'] },
  { id:4, name:'Wellness with Maya', niche:'Health & Wellness', platform:'instagram', platformLabel:'Instagram', platformIcon:'📷', followers:'195K followers', engagement:'6.5%', avatar:'https://i.pravatar.cc/150?img=27', rate:'$2.1K', campaigns:41, rating:'4.9', bio:'Holistic wellness coach sharing yoga, meditation, and healthy living tips. Strong community engagement and authentic recommendations.', tags:['Wellness','Yoga','Lifestyle'] },
]

export default function ClientDashboard() {
  const { toast, showToast, hideToast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = influencers.filter(inf => {
    const matchFilter = filter === 'all' || inf.platform === filter
    const matchSearch = !search || [inf.name, inf.niche, inf.bio].some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const handleCampaignSubmit = (form) => {
    const msgs = { live: 'Campaign created and published!', private: 'Private campaign created.', draft: 'Campaign saved as draft.' }
    showToast(msgs[form.status] || 'Campaign created!', 'success')
    setShowModal(false)
  }

  return (
    <div className="dashboard-body">
      <DashboardNav role="client" />
      <div className="dashboard-container">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="header-content" style={{ marginBottom: 0 }}>
            <h1>Find Perfect Influencers</h1>
            <p>Search, connect, and collaborate with top content creators</p>
          </div>
          <button className="btn-create-campaign" onClick={() => setShowModal(true)}>
            <span className="icon">➕</span><span>Create New Campaign</span>
          </button>
        </div>

        <div className="quick-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[['👁️','3,582','Total Views'],['📨','28','Proposals Received'],['🤝','12','Active Connections'],['📊','5','Active Campaigns']].map(([icon,val,label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        <div className="search-section glass">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search influencers by name, niche, or platform..." />
          </div>
          <div className="filter-buttons">
            {[['all','All Influencers'],['instagram','Instagram'],['youtube','YouTube'],['tiktok','TikTok'],['twitter','Twitter']].map(([val,label]) => (
              <button key={val} className={`filter-btn${filter===val?' active':''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="influencers-grid">
          {filtered.map(inf => (
            <div key={inf.id} className="influencer-card glass" data-platform={inf.platform}>
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
                    <span className="rate-label">{inf.engagementLabel || 'Engagement:'}</span>
                    <span className="rate-value">{inf.engagement}</span>
                  </div>
                </div>
                <div className="bio">{inf.bio}</div>
                <div className="tags">
                  {inf.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
                <div className="card-stats">
                  <div className="stat-item"><span className="stat-number">{inf.campaigns}</span><span className="stat-text">Campaigns</span></div>
                  <div className="stat-item"><span className="stat-number">{inf.rate}</span><span className="stat-text">Avg. Rate</span></div>
                  <div className="stat-item"><span className="stat-number">{inf.rating}</span><span className="stat-text">Rating</span></div>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn-view-profile" onClick={() => showToast('Opening full profile...', 'info')}>View Profile</button>
                <button className="btn-contact" onClick={() => showToast('Opening message composer...', 'info')}>Contact</button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">🔍</div>
              <h3>No influencers found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {showModal && <CampaignModal onClose={() => setShowModal(false)} onSubmit={handleCampaignSubmit} />}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
