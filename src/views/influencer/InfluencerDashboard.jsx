'use client'
import { useState } from 'react'
import DashboardNav from '@/components/DashboardNav'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import { supabase } from '@/lib/supabase/client'

export default function InfluencerDashboard() {
  const { toast, showToast, hideToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [tab, setTab] = useState('all-jobs')
  const [search, setSearch] = useState('')
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [proposalForm, setProposalForm] = useState({ budget: '', delivery_days: '', cover_letter: '' })
  const [submitting, setSubmitting] = useState(false)

  // Fetch real public campaigns
  const { data: campaigns, loading, error } = useSupabaseData('/api/campaigns?type=public')

  const filtered = (campaigns || []).filter(c => {
    const matchFilter = filter === 'all' || c.category?.toLowerCase() === filter
    const matchSearch = !search || [c.title, c.description].some(t => t?.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const handleApply = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast('Not logged in', 'error'); setSubmitting(false); return }

    const res = await fetch('/api/auth/profile?email=' + encodeURIComponent(user.email))
    const { profile } = await res.json()
    if (!profile) { showToast('Profile not found', 'error'); setSubmitting(false); return }

    const proposalRes = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: selectedCampaign.id,
        influencer_id: profile.id,
        budget: parseFloat(proposalForm.budget),
        delivery_days: parseInt(proposalForm.delivery_days) || null,
        cover_letter: proposalForm.cover_letter
      })
    })
    const payload = await proposalRes.json()
    setSubmitting(false)

    if (!proposalRes.ok) {
      showToast(payload.error || 'Failed to submit proposal', 'error')
      return
    }
    showToast('Proposal submitted successfully!', 'success')
    setShowProposalModal(false)
    setProposalForm({ budget: '', delivery_days: '', cover_letter: '' })
  }

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
            {[['👁️','—','Profile Views'],['📨','—','Active Proposals'],['💰','—','This Month']].map(([icon,val,label]) => (
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
          {[['all-jobs','All Jobs'],['applied','Applied'],['saved','Saved']].map(([val,label]) => (
            <button key={val} className={`tab${tab===val?' active':''}`} onClick={() => setTab(val)}>{label}</button>
          ))}
        </div>

        {tab === 'all-jobs' && (
          <div className="jobs-grid">
            {loading && (
              <div className="empty-state">
                <div className="empty-icon">⏳</div>
                <h3>Loading campaigns...</h3>
              </div>
            )}
            {error && (
              <div className="empty-state">
                <div className="empty-icon">⚠️</div>
                <h3>Could not load campaigns</h3>
                <p>{error}</p>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📢</div>
                <h3>{search ? 'No campaigns found' : 'No campaigns yet'}</h3>
                <p>{search ? 'Try adjusting your search' : 'Campaigns posted by brands will appear here'}</p>
              </div>
            )}
            {!loading && filtered.map(c => (
              <div key={c.id} className="job-card glass" data-category={c.category}>
                <div className="job-header">
                  <div className="job-title-section">
                    <h3>{c.title}</h3>
                    <div className="job-badges">
                      <span className="badge-verified">✓ Verified</span>
                      {c.category && <span className="badge-category">{c.category}</span>}
                    </div>
                  </div>
                  <button className="save-btn" onClick={() => showToast('Saved!', 'success')}><span className="icon">🔖</span></button>
                </div>
                <div className="job-meta">
                  {c.budget && <span className="meta-item"><span className="icon">💰</span><strong>${c.budget}</strong></span>}
                  {c.location && <span className="meta-item"><span className="icon">📍</span>{c.location}</span>}
                  {c.min_followers && <span className="meta-item"><span className="icon">👥</span>{c.min_followers.toLocaleString()}+ followers</span>}
                  <span className="meta-item"><span className="icon">📅</span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="job-description">{c.description}</p>
                {c.clients && (
                  <div className="job-details-extra">
                    <div className="client-info">
                      <img src={c.clients.avatar_url || `https://i.pravatar.cc/48?u=${c.clients.id}`} alt={c.clients.name} className="client-avatar" />
                      <div className="client-details">
                        <span className="client-name">{c.clients.company_name || c.clients.name}</span>
                        <span className="client-stats">#{c.campaign_no}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="job-footer">
                  <div className="proposals-count"><span className="icon">📝</span><span>{c.campaign_no}</span></div>
                  <button className="btn-apply" onClick={() => { setSelectedCampaign(c); setShowProposalModal(true) }}>
                    Submit Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab !== 'all-jobs' && (
          <div className="empty-state">
            <div className="empty-icon">{tab === 'applied' ? '📝' : '🔖'}</div>
            <h3>Your {tab} jobs will appear here</h3>
            <p>{tab === 'applied' ? 'Submit proposals to campaigns' : 'Save interesting campaigns to review later'}</p>
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && selectedCampaign && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setShowProposalModal(false)}>
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Submit Your Proposal</h2>
              <button className="modal-close" onClick={() => setShowProposalModal(false)}>×</button>
            </div>
            <form onSubmit={handleApply}>
              <div className="modal-body">
                <p style={{ marginBottom: '1.5rem', opacity: 0.7 }}>
                  Applying to: <strong style={{ opacity: 1 }}>{selectedCampaign.title}</strong>
                </p>
                <div className="form-group">
                  <label>Your Rate (USD) *</label>
                  <div className="input-with-icon">
                    <span className="input-icon">$</span>
                    <input type="number" placeholder="2000" required style={{ paddingLeft: '2.5rem' }}
                      value={proposalForm.budget}
                      onChange={e => setProposalForm(f => ({ ...f, budget: e.target.value }))} />
                  </div>
                  <span className="help-text">Enter your proposed rate for this campaign</span>
                </div>
                <div className="form-group">
                  <label>Delivery Time (days) *</label>
                  <select required value={proposalForm.delivery_days}
                    onChange={e => setProposalForm(f => ({ ...f, delivery_days: e.target.value }))}>
                    <option value="">Select timeline</option>
                    <option value="3">1-3 days</option>
                    <option value="7">4-7 days</option>
                    <option value="14">1-2 weeks</option>
                    <option value="28">2-4 weeks</option>
                    <option value="45">1 month+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cover Letter *</label>
                  <textarea rows={8} required
                    placeholder="Introduce yourself, explain why you're a great fit, and describe your approach..."
                    value={proposalForm.cover_letter}
                    onChange={e => setProposalForm(f => ({ ...f, cover_letter: e.target.value }))} />
                  <span className="help-text">Make it personal and show how you can add value</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowProposalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
