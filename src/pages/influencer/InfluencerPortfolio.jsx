'use client'
import { useState, useEffect } from 'react'
import DashboardNav from '@/components/DashboardNav'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'
import './InfluencerPortfolio.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_META = {
  instagram: { icon: '📷', class: 'instagram', label: 'Instagram',  followerLabel: 'Followers' },
  tiktok:    { icon: '🎵', class: 'tiktok',    label: 'TikTok',     followerLabel: 'Followers' },
  youtube:   { icon: '📹', class: 'youtube',   label: 'YouTube',    followerLabel: 'Subscribers' },
  twitter:   { icon: '🐦', class: 'twitter',   label: 'Twitter/X',  followerLabel: 'Followers' },
}

const PLATFORM_HINTS = {
  instagram: 'Find in Instagram app → Professional Dashboard → Insights',
  tiktok:    'Find in TikTok → Creator tools → Analytics',
  youtube:   'Find in YouTube Studio → Analytics → Overview',
  twitter:   'Find in X Analytics → Summary',
}

const EMPTY_FORM = {
  sm_type:           'instagram',
  handle:            '',
  profile_url:       '',
  // Core stats
  follower_count:    '',
  followers_30d_ago: '',
  avg_likes:         '',
  avg_comments:      '',
  avg_reach:         '',
  avg_impressions:   '',
  // Audience demographics
  demo_age_13_17:    '',
  demo_age_18_24:    '',
  demo_age_25_34:    '',
  demo_age_35_44:    '',
  demo_age_45_plus:  '',
  demo_gender_male:  '',
  demo_gender_female:'',
  demo_top_country:  '',
  demo_top_city:     '',
  // Top posts
  top_post_1_url:    '',
  top_post_1_likes:  '',
  top_post_1_comments:'',
  top_post_1_views:  '',
  top_post_2_url:    '',
  top_post_2_likes:  '',
  top_post_2_comments:'',
  top_post_2_views:  '',
  top_post_3_url:    '',
  top_post_3_likes:  '',
  top_post_3_comments:'',
  top_post_3_views:  '',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcEngagementRate(followers, avgLikes, avgComments) {
  const f = parseFloat(followers)
  const l = parseFloat(avgLikes) || 0
  const c = parseFloat(avgComments) || 0
  if (!f || f === 0) return null
  return ((l + c) / f * 100).toFixed(2)
}

function calcGrowthRate(current, prev) {
  const c = parseFloat(current)
  const p = parseFloat(prev)
  if (!c || !p || p === 0) return null
  return (((c - p) / p) * 100).toFixed(1)
}

function fmt(n) {
  if (n == null || n === '') return '—'
  const num = parseFloat(n)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

function buildFields(form) {
  const engRate = calcEngagementRate(form.follower_count, form.avg_likes, form.avg_comments)
  const growthRate = calcGrowthRate(form.follower_count, form.followers_30d_ago)

  const topPosts = [1, 2, 3].reduce((arr, i) => {
    const url = form[`top_post_${i}_url`]
    if (!url) return arr
    return [...arr, {
      url,
      likes:    parseInt(form[`top_post_${i}_likes`])    || 0,
      comments: parseInt(form[`top_post_${i}_comments`]) || 0,
      views:    parseInt(form[`top_post_${i}_views`])    || 0,
    }]
  }, [])

  const demographics = {}
  if (form.demo_age_13_17)    demographics.age_13_17    = parseFloat(form.demo_age_13_17)
  if (form.demo_age_18_24)    demographics.age_18_24    = parseFloat(form.demo_age_18_24)
  if (form.demo_age_25_34)    demographics.age_25_34    = parseFloat(form.demo_age_25_34)
  if (form.demo_age_35_44)    demographics.age_35_44    = parseFloat(form.demo_age_35_44)
  if (form.demo_age_45_plus)  demographics.age_45_plus  = parseFloat(form.demo_age_45_plus)
  if (form.demo_gender_male)  demographics.gender_male  = parseFloat(form.demo_gender_male)
  if (form.demo_gender_female)demographics.gender_female= parseFloat(form.demo_gender_female)
  if (form.demo_top_country)  demographics.top_country  = form.demo_top_country
  if (form.demo_top_city)     demographics.top_city     = form.demo_top_city

  return {
    follower_count:    parseInt(form.follower_count)    || 0,
    followers_30d_ago: parseInt(form.followers_30d_ago) || null,
    avg_likes:         parseInt(form.avg_likes)         || null,
    avg_comments:      parseInt(form.avg_comments)      || null,
    avg_reach:         parseInt(form.avg_reach)         || null,
    avg_impressions:   parseInt(form.avg_impressions)   || null,
    engagement_rate:   engRate   ? parseFloat(engRate)   : null,
    growth_rate_30d:   growthRate ? parseFloat(growthRate): null,
    demographics:      Object.keys(demographics).length ? demographics : null,
    top_posts:         topPosts.length ? topPosts : null,
    last_updated:      new Date().toISOString(),
  }
}

function formFromPortfolio(p) {
  const f = p.fields || {}
  const d = f.demographics || {}
  const posts = f.top_posts || []
  const get = (i, key) => posts[i]?.[key] ?? ''
  return {
    sm_type:            p.sm_type,
    handle:             p.handle || '',
    profile_url:        p.profile_url || '',
    follower_count:     f.follower_count    || '',
    followers_30d_ago:  f.followers_30d_ago || '',
    avg_likes:          f.avg_likes         || '',
    avg_comments:       f.avg_comments      || '',
    avg_reach:          f.avg_reach         || '',
    avg_impressions:    f.avg_impressions   || '',
    demo_age_13_17:     d.age_13_17    || '',
    demo_age_18_24:     d.age_18_24    || '',
    demo_age_25_34:     d.age_25_34    || '',
    demo_age_35_44:     d.age_35_44    || '',
    demo_age_45_plus:   d.age_45_plus  || '',
    demo_gender_male:   d.gender_male  || '',
    demo_gender_female: d.gender_female|| '',
    demo_top_country:   d.top_country  || '',
    demo_top_city:      d.top_city     || '',
    top_post_1_url:      get(0,'url'),
    top_post_1_likes:    get(0,'likes'),
    top_post_1_comments: get(0,'comments'),
    top_post_1_views:    get(0,'views'),
    top_post_2_url:      get(1,'url'),
    top_post_2_likes:    get(1,'likes'),
    top_post_2_comments: get(1,'comments'),
    top_post_2_views:    get(1,'views'),
    top_post_3_url:      get(2,'url'),
    top_post_3_likes:    get(2,'likes'),
    top_post_3_comments: get(2,'comments'),
    top_post_3_views:    get(2,'views'),
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DemoBar({ label, value, color = 'var(--primary-orange)' }) {
  if (!value) return null
  return (
    <div className="demo-bar-row">
      <span className="demo-bar-label">{label}</span>
      <div className="demo-bar-track">
        <div className="demo-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: color }} />
      </div>
      <span className="demo-bar-pct">{value}%</span>
    </div>
  )
}

function TopPostRow({ post, platform }) {
  const engRate = post.likes != null && post.comments != null
    ? ((post.likes + post.comments) / 1).toFixed(0)
    : null
  return (
    <a href={post.url} target="_blank" rel="noreferrer" className="top-post-row">
      <span className="top-post-icon">{PLATFORM_META[platform]?.icon || '🔗'}</span>
      <div className="top-post-stats">
        {post.likes    != null && <span>❤️ {fmt(post.likes)}</span>}
        {post.comments != null && <span>💬 {fmt(post.comments)}</span>}
        {post.views    != null && post.views > 0 && <span>👁️ {fmt(post.views)}</span>}
      </div>
      <span className="top-post-link">↗</span>
    </a>
  )
}

function GrowthBadge({ rate }) {
  if (rate == null) return null
  const positive = parseFloat(rate) >= 0
  return (
    <span className={`growth-badge ${positive ? 'positive' : 'negative'}`}>
      {positive ? '↑' : '↓'} {Math.abs(rate)}% / 30d
    </span>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────────────

function PlatformModal({ form, setForm, onSave, onClose, saving }) {
  const meta       = PLATFORM_META[form.sm_type] || {}
  const hint       = PLATFORM_HINTS[form.sm_type] || ''
  const engPreview = calcEngagementRate(form.follower_count, form.avg_likes, form.avg_comments)
  const growPreview= calcGrowthRate(form.follower_count, form.followers_30d_ago)

  const totalAgePct = ['13_17','18_24','25_34','35_44','45_plus']
    .reduce((s, k) => s + (parseFloat(form[`demo_age_${k}`]) || 0), 0)
  const ageWarning = totalAgePct > 0 && Math.abs(totalAgePct - 100) > 1

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className="modal pf-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass pf-modal-content">
        <div className="modal-header">
          <h2>{form.handle ? `Edit ${meta.label}` : `Add Platform`}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSave} className="pf-form">
          {/* ── Section 1: Platform basics ── */}
          <div className="pf-section-title">🌐 Platform</div>
          <div className="pf-row-2">
            <div className="form-group">
              <label>Platform *</label>
              <select value={form.sm_type} onChange={e => set('sm_type', e.target.value)} required>
                {Object.entries(PLATFORM_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.icon} {v.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Handle (username)</label>
              <input placeholder="@yourusername" value={form.handle}
                onChange={e => set('handle', e.target.value.replace(/^@/, ''))} />
            </div>
          </div>
          <div className="form-group">
            <label>Profile URL</label>
            <input type="url" placeholder={`https://${form.sm_type}.com/yourprofile`}
              value={form.profile_url} onChange={e => set('profile_url', e.target.value)} />
          </div>

          {hint && <div className="pf-hint">💡 Where to find your stats: <em>{hint}</em></div>}

          {/* ── Section 2: Core Stats ── */}
          <div className="pf-section-title">📊 Core Stats <span className="pf-section-sub">(self-reported)</span></div>
          <div className="pf-row-2">
            <div className="form-group">
              <label>{meta.followerLabel} *</label>
              <input type="number" placeholder="125000" required min="0"
                value={form.follower_count} onChange={e => set('follower_count', e.target.value)} />
            </div>
            <div className="form-group">
              <label>{meta.followerLabel} — 30 days ago</label>
              <input type="number" placeholder="118000" min="0"
                value={form.followers_30d_ago} onChange={e => set('followers_30d_ago', e.target.value)} />
            </div>
          </div>
          {growPreview && (
            <div className={`pf-calc-preview ${parseFloat(growPreview) >= 0 ? 'positive' : 'negative'}`}>
              📈 Calculated growth rate: <strong>{growPreview >= 0 ? '+' : ''}{growPreview}%</strong> over 30 days
            </div>
          )}

          <div className="pf-row-2">
            <div className="form-group">
              <label>Avg. Likes per post</label>
              <input type="number" placeholder="4500" min="0"
                value={form.avg_likes} onChange={e => set('avg_likes', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Avg. Comments per post</label>
              <input type="number" placeholder="320" min="0"
                value={form.avg_comments} onChange={e => set('avg_comments', e.target.value)} />
            </div>
          </div>
          {engPreview && (
            <div className="pf-calc-preview positive">
              🔥 Calculated engagement rate: <strong>{engPreview}%</strong>
              <span className="pf-calc-formula"> = (avg likes + avg comments) ÷ followers × 100</span>
            </div>
          )}

          <div className="pf-row-2">
            <div className="form-group">
              <label>Avg. Reach per post</label>
              <input type="number" placeholder="35000" min="0"
                value={form.avg_reach} onChange={e => set('avg_reach', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Avg. Impressions per post</label>
              <input type="number" placeholder="52000" min="0"
                value={form.avg_impressions} onChange={e => set('avg_impressions', e.target.value)} />
            </div>
          </div>

          {/* ── Section 3: Audience Demographics ── */}
          <div className="pf-section-title">👥 Audience Demographics <span className="pf-section-sub">(optional)</span></div>
          <div className="pf-demo-note">Enter percentages from your platform's Insights / Analytics tab.</div>

          <div className="pf-subsection-label">Age breakdown <span>(should total 100%)</span></div>
          <div className="pf-row-3">
            {[['13_17','13–17'],['18_24','18–24'],['25_34','25–34'],['35_44','35–44'],['45_plus','45+']].map(([k, lbl]) => (
              <div className="form-group" key={k}>
                <label>{lbl} %</label>
                <input type="number" step="0.1" min="0" max="100" placeholder="0"
                  value={form[`demo_age_${k}`]} onChange={e => set(`demo_age_${k}`, e.target.value)} />
              </div>
            ))}
          </div>
          {ageWarning && (
            <div className="pf-warning">⚠️ Age percentages total {totalAgePct.toFixed(1)}% — should add up to 100%</div>
          )}

          <div className="pf-subsection-label">Gender split</div>
          <div className="pf-row-2">
            <div className="form-group">
              <label>Male %</label>
              <input type="number" step="0.1" min="0" max="100" placeholder="45"
                value={form.demo_gender_male} onChange={e => set('demo_gender_male', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Female %</label>
              <input type="number" step="0.1" min="0" max="100" placeholder="55"
                value={form.demo_gender_female} onChange={e => set('demo_gender_female', e.target.value)} />
            </div>
          </div>

          <div className="pf-subsection-label">Top location</div>
          <div className="pf-row-2">
            <div className="form-group">
              <label>Top Country</label>
              <input placeholder="India" value={form.demo_top_country}
                onChange={e => set('demo_top_country', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Top City</label>
              <input placeholder="Mumbai" value={form.demo_top_city}
                onChange={e => set('demo_top_city', e.target.value)} />
            </div>
          </div>

          {/* ── Section 4: Top Posts ── */}
          <div className="pf-section-title">🏆 Top Performing Posts <span className="pf-section-sub">(up to 3)</span></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="pf-top-post-block">
              <div className="pf-subsection-label">Post {i}</div>
              <div className="form-group">
                <label>Post URL</label>
                <input type="url" placeholder={`https://${form.sm_type}.com/p/...`}
                  value={form[`top_post_${i}_url`]} onChange={e => set(`top_post_${i}_url`, e.target.value)} />
              </div>
              <div className="pf-row-3">
                <div className="form-group">
                  <label>Likes</label>
                  <input type="number" min="0" placeholder="8200"
                    value={form[`top_post_${i}_likes`]} onChange={e => set(`top_post_${i}_likes`, e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <input type="number" min="0" placeholder="340"
                    value={form[`top_post_${i}_comments`]} onChange={e => set(`top_post_${i}_comments`, e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Views (video)</label>
                  <input type="number" min="0" placeholder="120000"
                    value={form[`top_post_${i}_views`]} onChange={e => set(`top_post_${i}_views`, e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <div className="modal-footer pf-modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Platform'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Platform Card ─────────────────────────────────────────────────────────────

function PlatformCard({ p, onEdit, onDelete }) {
  const meta = PLATFORM_META[p.sm_type] || { icon: '🌐', class: '', label: p.sm_type }
  const f    = p.fields || {}
  const d    = f.demographics || {}
  const posts= f.top_posts || []
  const hasDemo = Object.keys(d).length > 0

  return (
    <div className="platform-card glass">
      {/* Header */}
      <div className="platform-header">
        <div className={`platform-icon-badge ${meta.class}`}>{meta.icon}</div>
        <div className="platform-header-text">
          <h3>{meta.label}</h3>
          {p.handle && <span className="platform-handle">@{p.handle}</span>}
        </div>
        <button className="btn-edit" onClick={() => onEdit(p)} title="Edit">✏️</button>
      </div>

      {/* Core stats grid */}
      <div className="platform-stats-grid">
        <div className="stat-cell">
          <span className="stat-cell-label">{meta.followerLabel}</span>
          <span className="stat-cell-value">{fmt(f.follower_count)}</span>
          {f.growth_rate_30d != null && <GrowthBadge rate={f.growth_rate_30d} />}
        </div>

        {f.engagement_rate != null && (
          <div className="stat-cell">
            <span className="stat-cell-label">Engagement</span>
            <span className="stat-cell-value">{f.engagement_rate}%</span>
            <span className="stat-cell-sub">calculated</span>
          </div>
        )}

        {f.avg_reach != null && (
          <div className="stat-cell">
            <span className="stat-cell-label">Avg. Reach</span>
            <span className="stat-cell-value">{fmt(f.avg_reach)}</span>
          </div>
        )}

        {f.avg_impressions != null && (
          <div className="stat-cell">
            <span className="stat-cell-label">Impressions</span>
            <span className="stat-cell-value">{fmt(f.avg_impressions)}</span>
          </div>
        )}
      </div>

      {/* Demographics */}
      {hasDemo && (
        <div className="pf-demo-section">
          <div className="pf-demo-heading">👥 Audience Demographics</div>

          {(d.gender_male != null || d.gender_female != null) && (
            <div className="pf-demo-gender">
              <span>♂ {d.gender_male ?? '—'}% Male</span>
              <div className="gender-bar">
                <div className="gender-bar-male"   style={{ width: `${d.gender_male ?? 50}%` }} />
                <div className="gender-bar-female" style={{ width: `${d.gender_female ?? 50}%` }} />
              </div>
              <span>{d.gender_female ?? '—'}% Female ♀</span>
            </div>
          )}

          <div className="pf-demo-ages">
            {[['age_13_17','13-17'],['age_18_24','18-24'],['age_25_34','25-34'],['age_35_44','35-44'],['age_45_plus','45+']].map(
              ([k, lbl]) => d[k] != null && (
                <DemoBar key={k} label={lbl} value={d[k]} />
              )
            )}
          </div>

          {(d.top_country || d.top_city) && (
            <div className="pf-demo-location">
              📍 {[d.top_city, d.top_country].filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Top Posts */}
      {posts.length > 0 && (
        <div className="pf-top-posts-section">
          <div className="pf-demo-heading">🏆 Top Posts</div>
          {posts.map((post, i) => (
            <TopPostRow key={i} post={post} platform={p.sm_type} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="platform-card-actions">
        {p.profile_url && (
          <a href={p.profile_url} target="_blank" rel="noreferrer" className="btn-view-full">
            View Profile ↗
          </a>
        )}
        <button onClick={() => onDelete(p.id, meta.label)}
          className="btn-delete-platform" title="Remove platform">🗑️</button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InfluencerPortfolio() {
  const { toast, showToast, hideToast } = useToast()
  const [portfolios,    setPortfolios]  = useState([])
  const [loading,       setLoading]     = useState(true)
  const [myProfile,     setMyProfile]   = useState(null)
  const [showModal,     setShowModal]   = useState(false)
  const [form,          setForm]        = useState({ ...EMPTY_FORM })
  const [saving,        setSaving]      = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const { profile } = await res.json()
      if (!profile) return
      setMyProfile(profile)

      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('influencer_id', profile.id)
        .order('created_at', { ascending: true })

      if (!error) setPortfolios(data || [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Aggregate header stats ──────────────────────────────────
  const totalFollowers = portfolios.reduce((s, p) => s + (p.fields?.follower_count || 0), 0)
  const withEngagement = portfolios.filter(p => p.fields?.engagement_rate != null)
  const avgEngagement  = withEngagement.length
    ? (withEngagement.reduce((s, p) => s + p.fields.engagement_rate, 0) / withEngagement.length).toFixed(1)
    : null
  const totalReach = portfolios.reduce((s, p) => s + (p.fields?.avg_reach || 0), 0)

  const openAdd = () => {
    setForm({ ...EMPTY_FORM })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setForm(formFromPortfolio(p))
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!myProfile) return
    setSaving(true)

    const fields = buildFields(form)

    const { data, error } = await supabase
      .from('portfolios')
      .upsert({
        influencer_id: myProfile.id,
        sm_type:       form.sm_type,
        handle:        form.handle,
        profile_url:   form.profile_url,
        fields,
      }, { onConflict: 'influencer_id,sm_type' })
      .select()
      .single()

    setSaving(false)
    if (error) { showToast(error.message, 'error'); return }

    setPortfolios(prev => {
      const exists = prev.find(p => p.sm_type === data.sm_type)
      return exists ? prev.map(p => p.sm_type === data.sm_type ? data : p) : [...prev, data]
    })
    showToast(`${PLATFORM_META[form.sm_type]?.label || form.sm_type} portfolio saved!`, 'success')
    setShowModal(false)
  }

  const handleDelete = async (id, label) => {
    if (!confirm(`Remove ${label} from your portfolio?`)) return
    const { error } = await supabase.from('portfolios').delete().eq('id', id)
    if (!error) {
      setPortfolios(prev => prev.filter(p => p.id !== id))
      showToast('Platform removed', 'info')
    }
  }

  return (
    <div className="dashboard-body">
      <DashboardNav role="influencer" />
      <div className="dashboard-container">

        {/* Header */}
        <div className="portfolio-header">
          <div className="header-content">
            <h1>My Portfolio</h1>
            <p>Showcase your reach and influence to brands</p>
          </div>
          <button className="btn-create-portfolio" onClick={openAdd}>
            <span>➕</span><span>Add Platform</span>
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="portfolio-stats">
          {[
            ['📊', totalFollowers > 0 ? fmt(totalFollowers) : '—', 'Total Reach'],
            ['🔥', avgEngagement   ? `${avgEngagement}%`   : '—', 'Avg. Engagement'],
            ['👁️', totalReach > 0  ? fmt(totalReach)       : '—', 'Avg. Reach / Post'],
            ['🎯', portfolios.length, 'Active Platforms'],
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

        {/* Platform Cards */}
        {loading && (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <h3>Loading portfolio…</h3>
          </div>
        )}

        {!loading && portfolios.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No platforms added yet</h3>
            <p>Add your social media platforms to showcase your reach to brands</p>
            <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={openAdd}>
              Add Your First Platform
            </button>
          </div>
        )}

        {!loading && portfolios.length > 0 && (
          <div className="platforms-grid">
            {portfolios.map(p => (
              <PlatformCard key={p.id} p={p} onEdit={openEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <PlatformModal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
          saving={saving}
        />
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
