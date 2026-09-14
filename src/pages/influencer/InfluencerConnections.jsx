'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'

export default function InfluencerConnections() {
  const { toast, showToast, hideToast } = useToast()
  const router = useRouter()
  const [connections, setConnections] = useState([])
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [loading, setLoading]         = useState(true)
  const [acting, setActing]           = useState(null) // connection id being acted on

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return

      const connRes = await fetch(`/api/connections?influencer_id=${profile.id}`)
      const payload = await connRes.json()
      setConnections(payload.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const handleStatusChange = async (connectionId, newStatus) => {
    setActing(connectionId)
    const res = await fetch(`/api/connections/${connectionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    const payload = await res.json()
    setActing(null)

    if (!res.ok) { showToast(payload.error || 'Failed', 'error'); return }

    setConnections(prev => prev.map(c => c.id === connectionId ? { ...c, status: newStatus } : c))
    const msgs = { active: 'Connection accepted!', blocked: 'Connection blocked.' }
    showToast(msgs[newStatus] || 'Updated', newStatus === 'active' ? 'success' : 'info')
  }

  const goToMessages = (connectionId) => {
    router.push(`/influencer/messages?connection=${connectionId}`)
  }

  const filtered = connections.filter(c => {
    const client = c.clients
    const matchSearch = !search || [client?.name, client?.company_name]
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
      <DashboardNav role="influencer" />
      <div className="dashboard-container">

        <div className="dashboard-header">
          <div className="header-content">
            <h1>My Connections</h1>
            <p>Clients who want to work with you</p>
          </div>
        </div>

        <div className="connection-stats">
          {[
            ['🤝', counts.active,           'Active Clients'],
            ['⏳', counts.pending,          'Pending Requests'],
            ['✅', connections.length,      'Total'],
            ['🚫', counts.blocked,          'Blocked'],
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
              placeholder="Search clients by name or company..."
            />
          </div>
          <div className="filter-buttons">
            {[['all','All'],['pending','Pending'],['active','Active'],['blocked','Blocked']].map(([val, label]) => (
              <button
                key={val}
                className={`filter-btn${filter === val ? ' active' : ''}`}
                onClick={() => setFilter(val)}
              >
                {label}
                {val === 'pending' && counts.pending > 0 && (
                  <span className="filter-badge">{counts.pending}</span>
                )}
              </button>
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
              <h3>{filter === 'pending' ? 'No pending requests' : 'No connections yet'}</h3>
              <p>
                {filter === 'pending'
                  ? 'You\'ll be notified when a client sends you a connection request'
                  : 'Apply to campaigns and accept connection requests to see clients here'}
              </p>
            </div>
          )}

          {!loading && filtered.map(c => {
            const client  = c.clients
            const isActing = acting === c.id
            return (
              <div key={c.id} className={`client-card glass conn-card--${c.status}`}>

                {/* Pending banner */}
                {c.status === 'pending' && (
                  <div className="conn-pending-banner">
                    ⏳ Connection request from this client
                  </div>
                )}

                <div className="client-header">
                  <img
                    src={client?.avatar_url || `https://i.pravatar.cc/100?u=${client?.id}`}
                    alt={client?.name}
                    className="client-avatar"
                  />
                  <div className={`verified-badge ${c.status === 'active' ? 'active' : c.status === 'pending' ? 'pending' : 'neutral'}`}>
                    {c.status === 'active' ? '✓' : c.status === 'pending' ? '⏳' : '—'}
                  </div>
                </div>

                <div className="client-body">
                  <h3>{client?.name}</h3>
                  <p className="company">{client?.company_name}</p>
                  {client?.industry && <p className="industry">🏢 {client.industry}</p>}
                  {client?.description && (
                    <p className="description" style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.75 }}>
                      {client.description}
                    </p>
                  )}
                  <div className="last-worked" style={{ marginTop: '0.75rem' }}>
                    <span className="icon">🔗</span>
                    <span>Status: <strong style={{ textTransform: 'capitalize' }}>{c.status}</strong></span>
                  </div>
                </div>

                <div className="client-footer" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Accept / Decline for pending */}
                  {c.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                      <button
                        className="btn-secondary"
                        style={{ flex: 1 }}
                        disabled={isActing}
                        onClick={() => handleStatusChange(c.id, 'blocked')}
                      >
                        {isActing ? '…' : '✕ Decline'}
                      </button>
                      <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        disabled={isActing}
                        onClick={() => handleStatusChange(c.id, 'active')}
                      >
                        {isActing ? '…' : '✓ Accept'}
                      </button>
                    </div>
                  )}

                  {/* Message (only for active) */}
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
                        onClick={() => showToast('Profile view coming soon', 'info')}
                      >
                        👁️ View Profile
                      </button>
                    </div>
                  )}

                  {/* Unblock for blocked */}
                  {c.status === 'blocked' && (
                    <button
                      className="btn-secondary"
                      style={{ width: '100%' }}
                      disabled={isActing}
                      onClick={() => handleStatusChange(c.id, 'active')}
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
