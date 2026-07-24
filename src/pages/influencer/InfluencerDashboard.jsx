import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const jobs = [
  { id:1, title:'Instagram Campaign for Sustainable Fashion Brand', category:'fashion', badges:['✓ Verified','Fashion'], budget:'$1,500 - $2,500', location:'Remote', followers:'50K+ followers', posted:'2 days ago', description:'Looking for fashion influencers to promote our new sustainable clothing line. Must have engaged audience interested in eco-friendly fashion. Deliverables include 3 Instagram posts and 5 stories over 2 weeks.', client:{name:'EcoThreads Co.',avatar:'https://i.pravatar.cc/150?img=1',spent:'$45K+',campaigns:23}, proposals:8 },
  { id:2, title:'YouTube Tech Review - Smart Home Devices', category:'tech', badges:['✓ Verified','Technology','🔥 Urgent'], budget:'$3,000 - $4,500', location:'USA', followers:'100K+ subscribers', posted:'5 hours ago', description:'Seeking tech reviewers with expertise in smart home devices. Create detailed review video (10-15 mins) covering features, setup, and honest opinions. Include unboxing and demonstration.', client:{name:'SmartLife Technologies',avatar:'https://i.pravatar.cc/150?img=52',spent:'$128K+',campaigns:56}, proposals:3, attachments:'2 attachments' },
  { id:3, title:'TikTok Campaign - New Coffee Product Launch', category:'food', badges:['✓ Verified','Food & Beverage'], budget:'$800 - $1,200', location:'Remote', followers:'30K+ followers', posted:'1 day ago', description:'Create engaging TikTok content showcasing our new cold brew coffee line. Looking for creative food/lifestyle creators. Deliverables: 5 TikTok videos with trending audio and our branded hashtag.', client:{name:'BrewMasters Coffee',avatar:'https://i.pravatar.cc/150?img=68',spent:'$18K+',campaigns:12}, proposals:15, savedDefault:true },
  { id:4, title:'Wellness Brand Ambassador - 3 Month Campaign', category:'lifestyle', badges:['✓ Verified','Lifestyle','⭐ Featured'], budget:'$5,000 - $8,000', location:'Remote', followers:'75K+ followers', posted:'3 days ago', description:'Seeking wellness influencers for long-term partnership. Promote our holistic wellness products across Instagram and YouTube. Monthly content package includes product reviews, tutorials, and lifestyle integration posts.', client:{name:'Harmony Wellness',avatar:'https://i.pravatar.cc/150?img=29',spent:'$92K+',campaigns:34}, proposals:21 },
  { id:5, title:'Instagram Reels - Mobile App Promotion', category:'tech', badges:['✓ Verified','Technology'], budget:'$1,200 - $1,800', location:'Remote', followers:'40K+ followers', posted:'4 days ago', description:"Create 4 Instagram Reels demonstrating our productivity app's key features. Target audience: young professionals and students. Show real use cases and emphasize time-saving benefits.", client:{name:'TaskFlow Inc.',avatar:'https://i.pravatar.cc/150?img=11',spent:'$31K+',campaigns:18}, proposals:11 },
]

export default function InfluencerDashboard() {
  const { toast, showToast, hideToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('all-jobs')
  const [search, setSearch] = useState('')
  const [showProposalModal, setShowProposalModal] = useState(false)

  const filtered = jobs.filter(j => {
    const matchFilter = filter === 'all' || j.category === filter
    const matchSearch = !search || [j.title, j.description].some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const handleApply = () => { showToast('Proposal submitted!', 'success'); setShowProposalModal(false) }

  return (
    <div className="dashboard-body">
      <DashboardNav role="influencer" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Find Your Next Campaign</h1>
            <p>Discover opportunities that match your expertise</p>
          </div>
          <div className="quick-stats">
            {[['👁️','1,247','Profile Views'],['📨','12','Active Proposals'],['💰','$8,450','This Month']].map(([icon,val,label]) => (
              <div key={label} className="stat-card glass">
                <div className="stat-icon">{icon}</div>
                <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="search-section glass">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns by title, brand, or category..." />
          </div>
          <div className="filter-buttons">
            {[['all','All Jobs'],['fashion','Fashion'],['tech','Tech'],['food','Food & Beverage'],['lifestyle','Lifestyle']].map(([val,label]) => (
              <button key={val} className={`filter-btn${filter===val?' active':''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="tabs-container">
          {[['all-jobs','All Jobs'],['applied','Applied (12)'],['saved','Saved (5)']].map(([val,label]) => (
            <button key={val} className={`tab${tab===val?' active':''}`} onClick={() => setTab(val)}>{label}</button>
          ))}
        </div>

        {tab === 'all-jobs' && (
          <div className="jobs-grid">
            {filtered.map(j => (
              <div key={j.id} className="job-card glass" data-category={j.category}>
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{j.title}</h3>
                    <div className="job-badges">
                      {j.badges.map((b,i) => (
                        <span key={i} className={i===0 ? 'badge-verified' : b.includes('🔥') ? 'badge-urgent' : b.includes('⭐') ? 'badge-featured' : 'badge-category'}>{b}</span>
                      ))}
                    </div>
                  </div>
                  <button className={`save-btn${j.savedDefault?' saved':''}`} onClick={() => showToast('Job saved!', 'success')}><span className="icon">🔖</span></button>
                </div>
                <div className="job-meta">
                  <span className="meta-item"><span className="icon">💰</span><strong>{j.budget}</strong></span>
                  <span className="meta-item"><span className="icon">📍</span>{j.location}</span>
                  <span className="meta-item"><span className="icon">👥</span>{j.followers}</span>
                  <span className="meta-item"><span className="icon">📅</span>Posted {j.posted}</span>
                </div>
                <p className="job-description">{j.description}</p>
                <div className="job-details-extra">
                  <div className="client-info">
                    <img src={j.client.avatar} alt={j.client.name} className="client-avatar" />
                    <div className="client-details">
                      <span className="client-name">{j.client.name}</span>
                      <span className="client-stats">{j.client.spent} spent • {j.client.campaigns} campaigns</span>
                    </div>
                  </div>
                  {j.attachments && <div className="attachments"><span className="attachment-icon">📎</span><span>{j.attachments}</span></div>}
                </div>
                <div className="job-footer">
                  <div className="proposals-count"><span className="icon">📝</span><span>{j.proposals} proposals</span></div>
                  <button className="btn-apply" onClick={() => setShowProposalModal(true)}>Submit Proposal</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab !== 'all-jobs' && (
          <div className="empty-state">
            <div className="empty-icon">{tab==='applied'?'📝':'🔖'}</div>
            <h3>Your {tab} jobs will appear here</h3>
            <p>{tab==='applied'?'Submit proposals to campaigns':'Save interesting campaigns to review later'}</p>
          </div>
        )}
      </div>

      {showProposalModal && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setShowProposalModal(false)}>
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Submit Your Proposal</h2>
              <button className="modal-close" onClick={() => setShowProposalModal(false)}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); handleApply() }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Your Rate *</label>
                  <div className="input-with-icon"><span className="input-icon">$</span><input type="number" placeholder="2000" required style={{paddingLeft:'2.5rem'}} /></div>
                  <span className="help-text">Enter your proposed rate for this campaign</span>
                </div>
                <div className="form-group">
                  <label>Delivery Time *</label>
                  <select required>
                    <option value="">Select timeline</option>
                    <option value="1-3">1-3 days</option>
                    <option value="4-7">4-7 days</option>
                    <option value="1-2">1-2 weeks</option>
                    <option value="2-4">2-4 weeks</option>
                    <option value="1m+">1 month+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cover Letter *</label>
                  <textarea rows={8} placeholder="Introduce yourself, explain why you're a great fit, and describe your approach to this campaign..." required />
                  <span className="help-text">Make it personal and show how you can add value</span>
                </div>
                <div className="form-group">
                  <label>Relevant Portfolio Items (Optional)</label>
                  <div className="portfolio-items">
                    <div className="portfolio-item"><input type="checkbox" id="port1" /><label htmlFor="port1">Instagram Fashion Campaign 2024</label></div>
                    <div className="portfolio-item"><input type="checkbox" id="port2" /><label htmlFor="port2">Brand Collaboration Showcase</label></div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowProposalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
