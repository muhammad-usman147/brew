'use client'
import { useState, useEffect } from 'react'
import DashboardNav from '@/components/DashboardNav'
import CampaignModal from '@/components/CampaignModal'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'

export default function ClientDashboard() {
  const { toast, showToast, hideToast } = useToast()
  const [showModal, setShowModal]       = useState(false)
  const [filter, setFilter]             = useState('all')
  const [search, setSearch]             = useState('')
  const [influencers, setInfluencers]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [myProfile, setMyProfile]       = useState(null)
  // map of influencer_id → connection record (id, status)
  const [connMap, setConnMap]           = useState({})
  // set of influencer_ids currently being requested
  const [requesting, setRequesting]     = useState(new Set())

  useEffect(() => {
    async function load() {
      // 1. Get logged-in client profile
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return
      setMyProfile(profile)

      // 2. Load influencers
      const infRes = await fetch('/api/influencers')
      const infPayload = await infRes.json()
      setInfluencers(infPayload.data || [])

      // 3. Load existing connections for this client so buttons reflect real state
      const connRes = await fetch(`/api/connections?client_id=${profile.id}`)
      const connPayload = await connRes.json()
      const map = {}
      for (const c of connPayload.data || []) {
        map[c.influencer_id] = { id: c.id, status: c.status }
      }
      setConnMap(map)
      setLoading(false)
    }
    load()
  }, [])

  const handleConnect = async (influencer) => {
    if (!myProfile) return
    const existing = connMap[influencer.id]

    // Already connected or pending — do nothing (button is disabled)
    if (existing) return

    setRequesting(prev => new Set(prev).add(influencer.id))
    const res = await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencer_id: influencer.id, client_id: myProfile.id })
    })
    const payload = await res.json()
    setRequesting(prev => { const s = new Set(prev); s.delete(influencer.id); return s })

    if (!res.ok) {
      showToast(payload.error || 'Failed to send request', 'error')
      return
    }
    // Update map so button flips immediately
    setConnMap(prev => ({
      ...prev,
      [influencer.id]: { id: payload.data.id, status: 'pending' }
    }))
    showToast(`Connection request sent to ${influencer.name}!`, 'success')
  }

  // Derive button label + style per influencer
  const getConnButton = (inf) => {
    if (requesting.has(inf.id)) return { label: 'Sending…', disabled: true, style: 'pending' }
    const conn = connMap[inf.id]
    if (!conn) return { label: '🤝 Connect', disabled: false, style: 'default' }
    if (conn.status === 'pending')  return { label: '⏳ Pending', disabled: true, style: 'pending' }
    if (conn.status === 'active')   return { label: '✅ Connected', disabled: true, style: 'active' }
    if (conn.status === 'blocked')  return { label: '🚫 Blocked', disabled: true, style: 'blocked' }
    return { label: '🤝 Connect', disabled: false, style: 'default' }
  }

  const filtered = influencers.filter(inf => {
    const matchSearch = !search || [inf.name, inf.bio].some(t =>
      t?.toLowerCase().includes(search.toLowerCase())
    )
    return matchSearch
  })

  const handleCampaignSubmit = async (form) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { showToast('Not logged in', 'error'); return }
    const res = await fetch('/api/auth/profile?email=' + encodeURIComponent(user.email))
    const { profile } = await res.json()
    if (!profile) { showToast('Profile not found', 'error'); return }

    const campaignRes = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, client_id: profile.id })
    })
    const payload = await campaignRes.json()
    if (!campaignRes.ok) { showToast(payload.error || 'Failed to create campaign', 'error'); return }

    const msgs = { public: 'Campaign published!', private: 'Private campaign created.', draft: 'Campaign saved as draft.' }
    showToast(msgs[form.type] || 'Campaign created!', 'success')
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
          {[
            ['👥', influencers.length, 'Total Influencers'],
            ['🤝', Object.values(connMap).filter(c => c.status === 'active').length,  'Active Connections'],
            ['⏳', Object.values(connMap).filter(c => c.status === 'pending').length, 'Pending Requests'],
            ['📊', '—', 'Active Campaigns'],
          ].map(([icon, val, label]) => (
            <div key={label} className="stat-card glass">
              <div className="stat-icon">{icon}</div>
              <div className="stat-info">
                <span className="stat-value">{val}</span>
                <span className="stat-label">{label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="search-section glass">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search influencers by name or bio..."
            />
          </div>
          <div className="filter-buttons">
            {[['all','All Influencers'],['connected','Connected'],['pending','Pending']].map(([val,label]) => (
              <button
                key={val}
                className={`filter-btn${filter === val ? ' active' : ''}`}
                onClick={() => setFilter(val)}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="influencers-grid">
          {loading && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">⏳</div>
              <h3>Loading influencers...</h3>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">👥</div>
              <h3>{search ? 'No influencers found' : 'No influencers yet'}</h3>
              <p>{search ? 'Try adjusting your search' : 'Influencers will appear here once they sign up'}</p>
            </div>
          )}

          {!loading && filtered
            .filter(inf => {
              if (filter === 'connected') return connMap[inf.id]?.status === 'active'
              if (filter === 'pending')   return connMap[inf.id]?.status === 'pending'
              return true
            })
            .map(inf => {
              const btn = getConnButton(inf)
              return (
                <div key={inf.id} className="influencer-card glass">
                  <div className="card-header">
                    <img
                      src={inf.avatar_url || `https://i.pravatar.cc/150?u=${inf.id}`}
                      alt={inf.name}
                      className="influencer-avatar"
                    />
                    {connMap[inf.id]?.status === 'active' && (
                      <div className="verification-badge" title="Connected">✓</div>
                    )}
                    {connMap[inf.id]?.status === 'pending' && (
                      <div className="verification-badge pending-badge" title="Pending">⏳</div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3>{inf.name}</h3>
                    <p className="niche">{inf.bio || 'Content Creator'}</p>
                    <div className="bio" style={{ marginTop: '0.75rem' }}>{inf.bio || ''}</div>
                  </div>
                  <div className="card-footer">
                    <button
                      className={`btn-contact connect-btn connect-btn--${btn.style}`}
                      onClick={() => handleConnect(inf)}
                      disabled={btn.disabled}
                    >
                      {btn.label}
                    </button>
                    <button
                      className="btn-view-profile"
                      onClick={() => showToast('Full profile view coming soon', 'info')}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {showModal && <CampaignModal onClose={() => setShowModal(false)} onSubmit={handleCampaignSubmit} />}
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
