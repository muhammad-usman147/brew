import DashboardNav from '../../components/DashboardNav'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const platforms = [
  { id:'instagram', name:'Instagram', iconClass:'instagram', icon:'📷', stats:[['Followers:','125K'],['Engagement:','4.8%'],['Avg. Reach:','42K'],['Posts:','487']], gallery:['linear-gradient(135deg,#667eea,#764ba2)','linear-gradient(135deg,#f093fb,#f5576c)','linear-gradient(135deg,#4facfe,#00f2fe)','linear-gradient(135deg,#43e97b,#38f9d7)'] },
  { id:'tiktok', name:'TikTok', iconClass:'tiktok', icon:'🎵', stats:[['Followers:','89K'],['Engagement:','8.2%'],['Avg. Views:','156K'],['Videos:','234']], gallery:['linear-gradient(135deg,#fa709a,#fee140)','linear-gradient(135deg,#30cfd0,#330867)','linear-gradient(135deg,#a8edea,#fed6e3)','linear-gradient(135deg,#ff9a9e,#fecfef)'] },
  { id:'youtube', name:'YouTube', iconClass:'youtube', icon:'📹', stats:[['Subscribers:','67K'],['Engagement:','5.4%'],['Avg. Views:','28K'],['Videos:','126']], gallery:['linear-gradient(135deg,#ff6b6b,#ee5a6f)','linear-gradient(135deg,#2193b0,#6dd5ed)','linear-gradient(135deg,#cc2b5e,#753a88)','linear-gradient(135deg,#00c6ff,#0072ff)'] },
  { id:'twitter', name:'Twitter', iconClass:'twitter', icon:'🐦', stats:[['Followers:','44K'],['Engagement:','3.6%'],['Avg. Impressions:','18K'],['Tweets:','3.2K']], tweets:[{text:'Just launched a new sustainable fashion series! 🌿 Check out my latest post...',stats:'1.2K likes • 234 retweets'},{text:'Collaboration with @EcoThreads was amazing! Full video coming soon 📸',stats:'890 likes • 156 retweets'}] },
]

export default function InfluencerPortfolio() {
  const { toast, showToast, hideToast } = useToast()

  return (
    <div className="dashboard-body">
      <DashboardNav role="influencer" />
      <div className="dashboard-container">
        <div className="portfolio-header">
          <div className="header-content">
            <h1>My Portfolio</h1>
            <p>Showcase your work across different platforms</p>
          </div>
          <button className="btn-create-portfolio" onClick={() => showToast('Opening platform form...', 'info')}>
            <span className="icon">➕</span><span>Add Platform</span>
          </button>
        </div>

        <div className="portfolio-stats">
          {[['📊','325K','Total Reach'],['💬','6.2%','Avg. Engagement'],['🎯','4','Active Platforms']].map(([icon,val,label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        <div className="platforms-grid">
          {platforms.map(p => (
            <div key={p.id} className="platform-card glass">
              <div className="platform-header">
                <div className={`platform-icon-badge ${p.iconClass}`}>{p.icon}</div>
                <h3>{p.name}</h3>
                <button className="btn-edit" onClick={() => showToast(`Editing ${p.name} portfolio...`, 'info')}>✏️</button>
              </div>

              <div className="platform-stats-grid">
                {p.stats.map(([label,value]) => (
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
                    {p.tweets.map((t,i) => (
                      <div key={i} className="tweet-item">
                        <p>{t.text}</p>
                        <span className="tweet-stats">{t.stats}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-view-full" onClick={() => showToast(`Opening full ${p.name} portfolio...`, 'info')}>
                View Full Portfolio
              </button>
            </div>
          ))}
        </div>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
