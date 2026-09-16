'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'

export default function ClientConnections() {
  const { toast, showToast, hideToast } = useToast()
  const router = useRouter()
  const [connections, setConnections] = useState([])
  const [filter, setFilter]           = useState('all')
  const [search, setSearch]           = useState('')
  const [loading, setLoading]         = useState(true)
  const [acting, setActing]           = useState(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return

      const connRes = await fetch(`/api/connections?client_id=${profile.id}`)
      const payload = await connRes.json()
      setConnections(payload.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleBlock = async (connectionId) => {
    if (!confirm('Block this connection?')) return
    setActing(connectionId)
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'blocked' })
    })
    setActing(null)
    if (res.ok) {
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'blocked' } : c))
      showToast('Connection blocked.', 'info')
    }
  }

  const handleUnblock = async (connectionId) => {
    setActing(connectionId)
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' })
    })
    setActing(null)
    if (res.ok) {
      setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: 'active' } : c))
      showToast('Connection restored.', 'success')
    }
  }

  const goToMessages = (connectionId) => {
    router.push(`/client/messages?connection=${connectionId}`)
  }

  const filtered = connections.filter(c => {
    const inf = c.influencers
    const matchSearch = !search || [inf?.name, inf?.bio]
      .some(t => t?.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = filter === 'all' || c.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    active:  connections.filter(c => c.status === 'active').length,
    pending: connections.filter(c => c.status === 'pending').length,
    blocked: connections.filter(c => c.status === 'blocked').length,
  }

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
          {[
            ['🤝', connections.length,  'Total Connections'],
            ['✅', counts.active,       'Active'],
            ['⏳', counts.pending,      'Pending'],
            ['🚫', counts.blocked,      'Blocked'],
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
              placeholder="Search connections by name..."
            />
          </div>
          <div className="filter-buttons">
            {[['all','All'],['active','Active'],['pending','Pending'],['blocked','Blocked']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-btn${filter === val ? ' active' : ''}`}
                onClick={() => setFilter(val)}
              >{label}</button>
            ))}
          </div>
        </div>

        <div className="connections-grid">
          {loading && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">⏳</div><h3>Loading...</h3>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <div className="empty-icon">🤝</div>
              <h3>No connections yet</h3>
              <p>Go to the dashboard and click Connect on an influencer</p>
            </div>
          )}

          {!loading && filtered.map(c => {
            const inf = c.influencers
            const isActing = acting === c.id
            return (
              <div key={c.id} className={`connection-card glass conn-card--${c.status}`}>

                {c.status === 'pending' && (
                  <div className="conn-pending-banner">⏳ Awaiting influencer acceptance</div>
                )}

                <div className="connection-header">
                  <img
                    src={inf?.avatar_url || `https://i.pravatar.cc/100?u=${inf?.id}`}
                    alt={inf?.name}
                    className="connection-avatar"
                  />
                  <div className={`verification-badge ${c.status === 'active' ? 'active' : c.status === 'pending' ? 'pending' : 'neutral'}`}>
                    {c.status === 'active' ? '✓' : c.status === 'pending' ? '⏳' : '—'}
                  </div>
                </div>

                <div className="connection-body">
                  <h3>{inf?.name}</h3>
                  <p className="niche">{inf?.bio?.slice(0, 60) || 'Content Creator'}</p>
                  <div className="last-contacted" style={{ marginTop: '0.75rem' }}>
                    <span className="icon">🔗</span>
                    <span>Status: <strong style={{ textTransform: 'capitalize' }}>{c.status}</strong></span>
                  </div>
                  {inf?.bio && (
                    <div className="bio" style={{ marginTop: '0.75rem' }}>{inf.bio}</div>
                  )}
                </div>

                <div className="connection-footer" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  {c.status === 'active' && (
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                      <button
                        className="btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                        onClick={() => goToMessages(c.id)}
                      >
                        💬 Message
                      </button>
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => showToast('Campaign creation coming soon', 'info')}
                      >
                        ➕ Campaign
                      </button>
                    </div>
                  )}

                  {c.status === 'active' && (
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.85rem' }}
                      disabled={isActing}
                      onClick={() => handleBlock(c.id)}
                    >
                      {isActing ? '…' : '🚫 Block'}
                    </button>
                  )}

                  {c.status === 'pending' && (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', opacity: 0.6, padding: '0.5rem 0' }}>
                      Waiting for the influencer to accept your request
                    </p>
                  )}

                  {c.status === 'blocked' && (
                    <button
                      className="btn-secondary"
                      style={{ width: '100%' }}
                      disabled={isActing}
                      onClick={() => handleUnblock(c.id)}
                    >
                      {isActing ? '…' : '🔓 Unblock'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
