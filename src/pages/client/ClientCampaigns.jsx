import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import CampaignModal from '../../components/CampaignModal'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const campaigns = [
  {
    id: 1, title: 'Summer Fashion Collection Launch', status: 'active', category: 'Fashion', budget: '$2,000 - $3,000', location: 'Remote',
    startDate: 'Jan 15, 2024', endDate: 'Feb 15, 2024', description: 'Looking for fashion influencers to promote our new summer collection. Need Instagram posts and stories showcasing our sustainable clothing line with authentic engagement.',
    analytics: { views: '1,247', proposals: '8', responseRate: '6.4%', rating: '4.8' },
    chartData: [45, 65, 80, 70, 90],
    proposals: 8, influencers: 2
  },
  {
    id: 2, title: 'Tech Product Review - Smart Watch', status: 'active', category: 'Technology', budget: '$3,500 - $5,000', location: 'USA',
    startDate: 'Jan 20, 2024', endDate: 'Feb 20, 2024', description: 'Seeking tech reviewers to create unboxing and review videos for our new smart watch. Need detailed coverage of features, battery life, and fitness tracking capabilities.',
    analytics: { views: '892', proposals: '5', responseRate: '5.6%', rating: '4.9' },
    chartData: [60, 75, 85, 70, 55],
    proposals: 5, influencers: 1
  },
  {
    id: 3, title: 'Holiday Season Food Campaign', status: 'draft', category: 'Food & Beverage', budget: '$1,000 - $1,500', location: '',
    startDate: 'Jan 22, 2024', endDate: 'TBD', description: 'Draft campaign for holiday season promotions featuring our seasonal menu items...',
    analytics: null, chartData: null, proposals: 0, influencers: 0
  },
  {
    id: 4, title: 'Winter Wellness Challenge', status: 'completed', category: 'Health & Wellness', budget: '$2,800', location: '',
    startDate: 'Dec 28, 2023', endDate: 'Dec 28, 2023', description: 'Successfully completed wellness campaign featuring yoga and meditation content with three top wellness influencers.',
    results: { reach: '458K', engagement: '7.2%', roi: '3.5x', rating: '⭐ 4.9' },
    chartData: null, proposals: 20, influencers: 3
  },
]

export default function ClientCampaigns() {
  const { toast, showToast, hideToast } = useToast()
  const [activeTab, setActiveTab] = useState('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProposalsModal, setShowProposalsModal] = useState(false)

  const filtered = campaigns.filter(c => {
    if (activeTab === 'active') return c.status === 'active'
    if (activeTab === 'draft') return c.status === 'draft'
    if (activeTab === 'completed') return c.status === 'completed'
    return true
  })

  const handleAction = (action, id) => {
    const msgs = {
      edit: 'Opening campaign editor...',
      duplicate: 'Campaign duplicated!',
      delete: 'Campaign deleted.',
      publish: 'Campaign published!',
      accept: 'Proposal accepted!',
      decline: 'Proposal declined.',
    }
    showToast(msgs[action] || 'Done', action === 'delete' || action === 'decline' ? 'error' : 'success')
  }

  return (
    <div className="dashboard-body">
      <DashboardNav role="client" />
      <div className="dashboard-container">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div className="header-content" style={{ marginBottom: 0 }}>
            <h1>My Campaigns</h1>
            <p>Manage and track all your influencer campaigns</p>
          </div>
          <button className="btn-create-campaign" onClick={() => setShowCreateModal(true)}>
            <span className="icon">➕</span><span>Create New Campaign</span>
          </button>
        </div>

        <div className="campaign-stats-overview">
          {[['📊','5','Active Campaigns'],['✅','12','Completed'],['📝','3','Drafts'],['💰','$45.2K','Total Spent']].map(([icon,val,label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        <div className="tabs-container">
          {[['active','Active (5)'],['draft','Drafts (3)'],['completed','Completed (12)']].map(([val, label]) => (
            <button key={val} className={`tab${activeTab === val ? ' active' : ''}`} onClick={() => setActiveTab(val)}>{label}</button>
          ))}
        </div>

        <div className="campaigns-content">
          {filtered.map(c => (
            <div key={c.id} className={`campaign-card glass${c.status === 'draft' ? ' draft-card' : c.status === 'completed' ? ' completed-card' : ''}`}>
              <div className="campaign-header">
                <div className="campaign-title-section">
                  <h3>{c.title}</h3>
                  <span className={`campaign-status ${c.status}`}>
                    {c.status === 'active' ? '🟢 Active' : c.status === 'draft' ? '📝 Draft' : '✅ Completed'}
                  </span>
                </div>
                <div className="campaign-actions">
                  <button className="action-btn" title="Edit" onClick={() => handleAction('edit', c.id)}>✏️</button>
                  <button className="action-btn" title="Duplicate" onClick={() => handleAction('duplicate', c.id)}>📋</button>
                  {c.status === 'draft' && <button className="action-btn primary" onClick={() => handleAction('publish', c.id)}>Publish Campaign</button>}
                  {c.status !== 'completed' && <button className="action-btn" title="Delete" onClick={() => handleAction('delete', c.id)}>🗑️</button>}
                  {c.status === 'active' && <button className="action-btn primary" onClick={() => setShowProposalsModal(true)}>View Proposals ({c.proposals})</button>}
                  {c.status === 'completed' && <button className="action-btn" onClick={() => showToast('Opening results...', 'info')}>View Results</button>}
                </div>
              </div>

              <div className="campaign-meta">
                {c.status === 'completed' ? <>
                  <span className="meta-item"><span className="icon">📅</span>Completed: {c.startDate}</span>
                  <span className="meta-item"><span className="icon">💰</span>Spent: {c.budget}</span>
                  <span className="meta-item"><span className="icon">🏷️</span>{c.category}</span>
                  <span className="meta-item"><span className="icon">👥</span>{c.influencers} Influencers</span>
                </> : <>
                  <span className="meta-item"><span className="icon">📅</span>Created: {c.startDate}</span>
                  <span className="meta-item"><span className="icon">💰</span>Budget: {c.budget}</span>
                  <span className="meta-item"><span className="icon">🏷️</span>{c.category}</span>
                  {c.location && <span className="meta-item"><span className="icon">📍</span>{c.location}</span>}
                </>}
              </div>

              <p className="campaign-description">{c.description}</p>

              {c.analytics && (
                <div className="campaign-analytics">
                  <div className="analytics-grid">
                    {[['👁️','views','Views'],['📨','proposals','Proposals'],['📊','responseRate','Response Rate'],['⭐','rating','Avg. Rating']].map(([icon, key, label]) => (
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
                    <div className="chart-header"><span className="chart-title">Views & Proposals Trend</span></div>
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
                  {[['Total Reach:', c.results.reach],['Engagement:', c.results.engagement],['ROI:', c.results.roi],['Rating:', c.results.rating]].map(([label, val]) => (
                    <div key={label} className="result-item">
                      <span className="result-label">{label}</span>
                      <span className="result-value">{val}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="campaign-footer">
                {c.status === 'active' && <button className="btn-secondary" onClick={() => showToast('Marking as complete...', 'info')}>Mark as Complete</button>}
                {c.status === 'active' && <button className="btn-primary" onClick={() => setShowProposalsModal(true)}>Manage Proposals</button>}
                {c.status === 'draft' && <button className="btn-secondary" onClick={() => showToast('Opening editor...', 'info')}>Continue Editing</button>}
                {c.status === 'draft' && <button className="btn-primary" onClick={() => handleAction('publish', c.id)}>Publish Now</button>}
                {c.status === 'completed' && <button className="btn-secondary" onClick={() => handleAction('duplicate', c.id)}>Create Similar</button>}
                {c.status === 'completed' && <button className="btn-primary" onClick={() => showToast('Opening full report...', 'info')}>View Full Report</button>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <h3>No campaigns here</h3>
              <p>Create your first campaign to get started</p>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && <CampaignModal onClose={() => setShowCreateModal(false)} onSubmit={(f) => { showToast('Campaign created!', 'success'); setShowCreateModal(false) }} />}

      {showProposalsModal && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setShowProposalsModal(false)}>
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Campaign Proposals</h2>
              <button className="modal-close" onClick={() => setShowProposalsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="proposals-list">
                {[
                  {name:'Sarah Mitchell',niche:'Fashion & Lifestyle • 125K followers',avatar:'https://i.pravatar.cc/150?img=33',rate:'$2,200',time:'1-2 weeks',text:"I'm excited about your sustainable fashion campaign! I've been an advocate for eco-friendly fashion for 3 years and have strong engagement with exactly your target audience..."},
                  {name:'Emma Rodriguez',niche:'Fashion Blogger • 89K followers',avatar:'https://i.pravatar.cc/150?img=45',rate:'$1,800',time:'4-7 days',text:'Your summer collection aligns perfectly with my content style. I can create 3 Instagram posts and 5 stories highlighting the sustainable aspects...'}
                ].map((p,i) => (
                  <div key={i} className="proposal-item">
                    <div className="proposal-header">
                      <div className="influencer-info">
                        <img src={p.avatar} alt={p.name} className="proposal-avatar" />
                        <div className="influencer-details"><h4>{p.name}</h4><p>{p.niche}</p></div>
                      </div>
                      <div className="proposal-rate"><span className="rate-label">Proposed Rate:</span><span className="rate-amount">{p.rate}</span></div>
                    </div>
                    <div className="proposal-body">
                      <p><strong>Delivery Time:</strong> {p.time}</p>
                      <p className="proposal-text">{p.text}</p>
                    </div>
                    <div className="proposal-footer">
                      <button className="btn-secondary" onClick={() => { handleAction('decline'); setShowProposalsModal(false) }}>Decline</button>
                      <button className="btn-primary" onClick={() => { handleAction('accept'); setShowProposalsModal(false) }}>Accept & Hire</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
