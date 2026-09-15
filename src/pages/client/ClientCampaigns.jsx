'use client'
import { useState, useEffect } from 'react'
import DashboardNav from '@/components/DashboardNav'
import CampaignModal from '@/components/CampaignModal'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'

export default function ClientCampaigns() {
  const { toast, showToast, hideToast } = useToast()
  const [activeTab, setActiveTab] = useState('active')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProposalsModal, setShowProposalsModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [clientProfile, setClientProfile] = useState(null)

  // Load client profile + their campaigns
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return
      setClientProfile(profile)

      const camRes = await fetch(`/api/campaigns?client_id=${profile.id}&type=all`)
      // fallback: fetch all and filter client-side
      const allRes = await fetch('/api/campaigns?type=all')
      const allPayload = await allRes.json()
      const clientCampaigns = (allPayload.data || []).filter(c => c.client_id === profile.id)
      setCampaigns(clientCampaigns)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = campaigns.filter(c => {
    if (activeTab === 'active') return c.type === 'public'
    if (activeTab === 'draft') return c.type === 'draft'
    if (activeTab === 'private') return c.type === 'private'
    return true
  })

  const openProposals = async (campaign) => {
    setSelectedCampaign(campaign)
    const res = await fetch(`/api/proposals?campaign_id=${campaign.id}`)
    const payload = await res.json()
    setProposals(payload.data || [])
    setShowProposalsModal(true)
  }

  const handleProposalAction = async (proposalId, status) => {
    const res = await fetch(`/api/proposals/${proposalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      showToast(status === 'accepted' ? 'Proposal accepted!' : 'Proposal declined.', status === 'accepted' ? 'success' : 'info')
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, status } : p))
    }
  }

  const handleCampaignSubmit = async (form) => {
    if (!clientProfile) return
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, client_id: clientProfile.id })
    })
    const payload = await res.json()
    if (!res.ok) { showToast(payload.error || 'Failed', 'error'); return }
    setCampaigns(prev => [payload.data, ...prev])
    showToast('Campaign created!', 'success')
    setShowCreateModal(false)
  }

  const handleDelete = async (campaignId) => {
    if (!confirm('Delete this campaign?')) return
    const res = await fetch(`/api/campaigns/${campaignId}`, { method: 'DELETE' })
    if (res.ok) {
      setCampaigns(prev => prev.filter(c => c.id !== campaignId))
      showToast('Campaign deleted.', 'info')
    }
  }

  const handlePublish = async (campaign) => {
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'public' })
    })
    if (res.ok) {
      setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, type: 'public' } : c))
      showToast('Campaign published!', 'success')
    }
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

        {/* Stats */}
        <div className="campaign-stats-overview">
          {[
            ['📊', campaigns.filter(c => c.type === 'public').length, 'Active Campaigns'],
            ['✅', campaigns.filter(c => c.type === 'private').length, 'Private'],
            ['📝', campaigns.filter(c => c.type === 'draft').length, 'Drafts'],
            ['📋', campaigns.length, 'Total'],
          ].map(([icon, val, label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info"><span className="stat-value">{val}</span><span className="stat-label">{label}</span></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          {[['active', `Active (${campaigns.filter(c => c.type === 'public').length})`],
            ['draft', `Drafts (${campaigns.filter(c => c.type === 'draft').length})`],
            ['private', `Private (${campaigns.filter(c => c.type === 'private').length})`]
          ].map(([val, label]) => (
            <button key={val} className={`tab${activeTab === val ? ' active' : ''}`} onClick={() => setActiveTab(val)}>{label}</button>
          ))}
        </div>

        <div className="campaigns-content">
          {loading && <div className="empty-state"><div className="empty-icon">⏳</div><h3>Loading campaigns...</h3></div>}

          {!loading && filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📢</div>
              <h3>No {activeTab} campaigns</h3>
              <p>Create a campaign to get started</p>
            </div>
          )}

          {!loading && filtered.map(c => (
            <div key={c.id} className={`campaign-card glass${c.type === 'draft' ? ' draft-card' : ''}`}>
              <div className="campaign-header">
                <div className="campaign-title-section">
                  <h3>{c.title}</h3>
                  <span className={`campaign-status ${c.type === 'public' ? 'active' : c.type}`}>
                    {c.type === 'public' ? '🟢 Active' : c.type === 'draft' ? '📝 Draft' : '🔒 Private'}
                  </span>
                </div>
                <div className="campaign-actions">
                  <button className="action-btn" title="Edit" onClick={() => showToast('Edit coming soon', 'info')}>✏️</button>
                  {c.type === 'draft' && (
                    <button className="action-btn primary" onClick={() => handlePublish(c)}>Publish Campaign</button>
                  )}
                  <button className="action-btn" title="Delete" onClick={() => handleDelete(c.id)}>🗑️</button>
                  <button className="action-btn primary" onClick={() => openProposals(c)}>
                    View Proposals
                  </button>
                </div>
              </div>

              <div className="campaign-meta">
                <span className="meta-item"><span className="icon">📅</span>Created: {new Date(c.created_at).toLocaleDateString()}</span>
                {c.budget && <span className="meta-item"><span className="icon">💰</span>Budget: ${c.budget}</span>}
                {c.category && <span className="meta-item"><span className="icon">🏷️</span>{c.category}</span>}
                {c.location && <span className="meta-item"><span className="icon">📍</span>{c.location}</span>}
              </div>

              <p className="campaign-description">{c.description}</p>

              <div className="campaign-footer">
                <button className="btn-secondary" onClick={() => showToast('Analytics coming soon', 'info')}>📊 Analytics</button>
                <button className="btn-primary" onClick={() => openProposals(c)}>Manage Proposals</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CampaignModal onClose={() => setShowCreateModal(false)} onSubmit={handleCampaignSubmit} />
      )}

      {/* Proposals Modal */}
      {showProposalsModal && (
        <div className="modal" onClick={e => e.target === e.currentTarget && setShowProposalsModal(false)}>
          <div className="modal-content glass">
            <div className="modal-header">
              <h2>Campaign Proposals</h2>
              <button className="modal-close" onClick={() => setShowProposalsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {proposals.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No proposals yet</h3>
                  <p>Proposals will appear here when influencers apply</p>
                </div>
              ) : (
                <div className="proposals-list">
                  {proposals.map(p => (
                    <div key={p.id} className="proposal-item">
                      <div className="proposal-header">
                        <div className="influencer-info">
                          <img
                            src={p.influencers?.avatar_url || `https://i.pravatar.cc/60?u=${p.influencer_id}`}
                            alt={p.influencers?.name}
                            className="proposal-avatar"
                          />
                          <div className="influencer-details">
                            <h4>{p.influencers?.name}</h4>
                            <p>{p.influencers?.bio?.slice(0, 60) || 'Influencer'}</p>
                          </div>
                        </div>
                        <div className="proposal-rate">
                          <span className="rate-label">Proposed Rate:</span>
                          <span className="rate-amount">${p.budget}</span>
                        </div>
                      </div>
                      <div className="proposal-body">
                        {p.delivery_days && <p><strong>Delivery:</strong> {p.delivery_days} days</p>}
                        <p className="proposal-text">{p.cover_letter}</p>
                        {p.status !== 'pending' && (
                          <p style={{ marginTop: '0.5rem', fontWeight: 700, color: p.status === 'accepted' ? '#10b981' : '#ef4444' }}>
                            Status: {p.status.toUpperCase()}
                          </p>
                        )}
                      </div>
                      {p.status === 'pending' && (
                        <div className="proposal-footer">
                          <button className="btn-secondary" onClick={() => handleProposalAction(p.id, 'declined')}>Decline</button>
                          <button className="btn-primary" onClick={() => handleProposalAction(p.id, 'accepted')}>Accept & Hire</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
