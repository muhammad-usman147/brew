import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const connections = [
  { id:1, name:'Sarah Mitchell', niche:'Fashion & Lifestyle', platform:'instagram', platformLabel:'Instagram • 125K followers', platformIcon:'📷', avatar:'https://i.pravatar.cc/150?img=33', projects:5, spent:'$8.5K', rating:'⭐ 4.9', lastContact:'3 days ago', collaborations:[{name:'Summer Fashion Launch',date:'Jan 2024'},{name:'Holiday Collection',date:'Dec 2023'},{name:'Spring Campaign',date:'Mar 2023'}] },
  { id:2, name:'Tech with Jason', niche:'Technology & Reviews', platform:'youtube', platformLabel:'YouTube • 450K subscribers', platformIcon:'📹', avatar:'https://i.pravatar.cc/150?img=14', projects:8, spent:'$24K', rating:'⭐ 5.0', lastContact:'1 week ago', collaborations:[{name:'Smart Watch Review',date:'Jan 2024'},{name:'Laptop Comparison',date:'Nov 2023'},{name:'Phone Launch',date:'Sep 2023'}] },
  { id:3, name:"Emma's Kitchen", niche:'Food & Cooking', platform:'tiktok', platformLabel:'TikTok • 280K followers', platformIcon:'🎵', avatar:'https://i.pravatar.cc/150?img=45', projects:4, spent:'$4.8K', rating:'⭐ 4.8', lastContact:'2 weeks ago', collaborations:[{name:'Coffee Launch',date:'Dec 2023'},{name:'Recipe Series',date:'Oct 2023'}] },
  { id:4, name:'Wellness with Maya', niche:'Health & Wellness', platform:'instagram', platformLabel:'Instagram • 195K followers', platformIcon:'📷', avatar:'https://i.pravatar.cc/150?img=27', projects:3, spent:'$6.3K', rating:'⭐ 4.9', lastContact:'5 days ago', collaborations:[{name:'Winter Wellness',date:'Dec 2023'},{name:'Yoga Challenge',date:'Aug 2023'}] },
]

export default function ClientConnections() {
  const { toast, showToast, hideToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = connections.filter(c => {
    const matchFilter = filter === 'all' || c.platform === filter
    const matchSearch = !search || [c.name, c.niche].some(t => t.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  return (
    <div className="dashboard-body">
      <DashboardNav role="client" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>My Connections</h1>
            <p>Manage your network of trusted influencers</p>
          </div>
        </div>

        <div className="connection-stats">
          {[['🤝','12','Total Connections'],['✅','28','Completed Projects'],['💰','$45.2K','Total Spent'],['⭐','4.8','Avg. Rating']].map(([icon,val,label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        <div className="search-section glass">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search connections by name or niche..." />
          </div>
          <div className="filter-buttons">
            {[['all','All (12)'],['instagram','Instagram (5)'],['youtube','YouTube (4)'],['tiktok','TikTok (3)']].map(([val,label]) => (
              <button key={val} className={`filter-btn${filter===val?' active':''}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="connections-grid">
          {filtered.map(c => (
            <div key={c.id} className="connection-card glass" data-platform={c.platform}>
              <div className="connection-header">
                <img src={c.avatar} alt={c.name} className="connection-avatar" />
                <div className="verification-badge">✓</div>
              </div>
              <div className="connection-body">
                <h3>{c.name}</h3>
                <p className="niche">{c.niche}</p>
                <div className="platform-info"><span className="platform-icon">{c.platformIcon}</span><span>{c.platformLabel}</span></div>
                <div className="connection-stats-row">
                  <div className="stat-item"><span className="stat-value">{c.projects}</span><span className="stat-label">Projects</span></div>
                  <div className="stat-item"><span className="stat-value">{c.spent}</span><span className="stat-label">Total Spent</span></div>
                  <div className="stat-item"><span className="stat-value">{c.rating}</span><span className="stat-label">Rating</span></div>
                </div>
                <div className="last-contacted"><span className="icon">📅</span><span>Last contacted: {c.lastContact}</span></div>
                <div className="collaboration-history">
                  <h4>Past Collaborations</h4>
                  <div className="project-list">
                    {c.collaborations.map((proj,i) => (
                      <div key={i} className="project-item">
                        <span className="project-name">{proj.name}</span>
                        <span className="project-date">{proj.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="connection-footer">
                <button className="btn-secondary" onClick={() => showToast('Opening messages...', 'info')}><span className="icon">💬</span><span>Message</span></button>
                <button className="btn-primary" onClick={() => showToast('Creating campaign...', 'info')}><span className="icon">➕</span><span>New Campaign</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
