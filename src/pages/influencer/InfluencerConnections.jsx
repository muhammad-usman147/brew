import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const clients = [
  { id:1, name:'Marcus Chen', company:'TechCorp Industries', industry:'🏢 Technology', desc:'Leading technology company specializing in innovative software solutions.', avatar:'https://i.pravatar.cc/150?img=12', projects:5, earned:'$12.5K', rating:'⭐ 5.0', lastWorked:'1 week ago', history:[{name:'Smart Watch Campaign',date:'Jan 2024',amount:'$3,500'},{name:'Holiday Tech Review',date:'Dec 2023',amount:'$4,200'},{name:'Product Launch Series',date:'Oct 2023',amount:'$4,800'}] },
  { id:2, name:'Emily Johnson', company:'EcoThreads Co.', industry:'👗 Fashion', desc:'Sustainable fashion brand promoting eco-friendly clothing.', avatar:'https://i.pravatar.cc/150?img=1', projects:8, earned:'$18.2K', rating:'⭐ 4.9', lastWorked:'3 days ago', history:[{name:'Summer Collection Launch',date:'Jan 2024',amount:'$2,500'},{name:'Sustainable Fashion Week',date:'Dec 2023',amount:'$3,200'},{name:'Fall Lookbook',date:'Sep 2023',amount:'$2,800'}] },
  { id:3, name:'David Martinez', company:'BrewMasters Coffee', industry:'☕ Food & Beverage', desc:'Artisan coffee roasters with a passion for quality beans.', avatar:'https://i.pravatar.cc/150?img=68', projects:3, earned:'$3.6K', rating:'⭐ 4.8', lastWorked:'2 weeks ago', history:[{name:'Cold Brew Launch',date:'Jan 2024',amount:'$1,200'},{name:'Holiday Blend Promo',date:'Dec 2023',amount:'$1,400'}] },
  { id:4, name:'Lisa Anderson', company:'Harmony Wellness', industry:'🧘 Health & Wellness', desc:'Holistic wellness products for mind, body, and soul.', avatar:'https://i.pravatar.cc/150?img=29', projects:4, earned:'$4.2K', rating:'⭐ 5.0', lastWorked:'5 days ago', history:[{name:'Wellness Ambassador',date:'Ongoing',amount:'$1,500/mo'},{name:'Product Line Review',date:'Dec 2023',amount:'$2,200'}] },
]

export default function InfluencerConnections() {
  const { toast, showToast, hideToast } = useToast()
  const [search, setSearch] = useState('')

  const filtered = clients.filter(c =>
    !search || [c.name, c.company, c.industry].some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="dashboard-body">
      <DashboardNav role="influencer" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <h1>My Connections</h1>
            <p>Clients you've worked with and built relationships</p>
          </div>
        </div>

        <div className="connection-stats">
          {[['🤝','8','Active Clients'],['✅','23','Completed Projects'],['💰','$38.5K','Total Earned'],['⭐','4.9','Avg. Rating']].map(([icon,val,label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        <div className="search-section glass">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients by name or company..." />
          </div>
        </div>

        <div className="connections-grid">
          {filtered.map(c => (
            <div key={c.id} className="client-card glass">
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
                  <div className="stat-item"><span className="stat-value">{c.projects}</span><span className="stat-label">Projects</span></div>
                  <div className="stat-item"><span className="stat-value">{c.earned}</span><span className="stat-label">Earned</span></div>
                  <div className="stat-item"><span className="stat-value">{c.rating}</span><span className="stat-label">Rating</span></div>
                </div>
                <div className="last-worked"><span className="icon">📅</span><span>Last project: {c.lastWorked}</span></div>
                <div className="project-history">
                  <h4>Collaboration History</h4>
                  <div className="project-list">
                    {c.history.map((h,i) => (
                      <div key={i} className="project-item">
                        <div className="project-info"><span className="project-name">{h.name}</span><span className="project-date">{h.date}</span></div>
                        <span className="project-amount">{h.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="client-footer">
                <button className="btn-secondary" onClick={() => showToast('Opening messages...','info')}><span className="icon">💬</span><span>Message</span></button>
                <button className="btn-primary" onClick={() => showToast('Opening profile...','info')}><span className="icon">👁️</span><span>View Profile</span></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
