'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import DashboardNav from '@/components/DashboardNav'
import Toast from '@/components/Toast'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase/client'
import { AvatarPlaceholder } from '@/components/ui/Avatar'
import { useRouter } from 'next/navigation'

const NAV_SECTIONS = [
  { id: 'personal', icon: '👤', label: 'Personal Info' },
  { id: 'company', icon: '🏢', label: role => role === 'client' ? 'Company Settings' : 'Creator Profile' },
  { id: 'billing', icon: '💳', label: 'Billing & Payment' },
  { id: 'account', icon: '🔐', label: 'Account & Security' },
]

export default function SettingsPage({ role = 'client' }) {
  const { toast, showToast, hideToast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [activeSection, setActiveSection] = useState('personal')
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email)}`)
      const payload = await res.json()
      if (!payload.profile) return
      setProfile({ ...payload.profile, auth_user_id: user.id })
      setForm({
        name: payload.profile.name || '',
        email: payload.profile.email || '',
        phone: payload.profile.phone || '',
        company_name: payload.profile.company_name || '',
        website: payload.profile.website || '',
        industry: payload.profile.industry || '',
        description: payload.profile.description || '',
        bio: payload.profile.bio || '',
        avatar_url: payload.profile.avatar_url || '',
      })
      setAvatarPreview(payload.profile.avatar_url || null)
    }
    load()
  }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // ── Avatar Upload ──────────────────────────────────────────────────────────
  const uploadAvatar = useCallback(async (file) => {
    if (!file || !profile) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      showToast('Invalid file type. Use JPG, PNG, WEBP or GIF.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max size is 5 MB.', 'error')
      return
    }

    // Optimistic local preview
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)
    setUploading(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('userId', profile.auth_user_id || String(profile.id))
      fd.append('role', role)

      const res = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const payload = await res.json()

      if (!res.ok) {
        showToast(payload.error || 'Upload failed', 'error')
        setAvatarPreview(form.avatar_url || null)
        return
      }

      const publicUrl = payload.url

      // Persist avatar_url in DB
      const endpoint = role === 'client'
        ? `/api/clients/${profile.id}`
        : `/api/influencers/${profile.id}`

      const saveRes = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      if (!saveRes.ok) {
        const p = await saveRes.json()
        showToast(p.error || 'Saved to storage but failed to update profile', 'error')
        return
      }

      setForm(f => ({ ...f, avatar_url: publicUrl }))
      setAvatarPreview(publicUrl)
      // Instantly update the navbar without a re-fetch
      window.dispatchEvent(new CustomEvent('brew:profile-updated', {
        detail: { avatar_url: publicUrl },
      }))
      showToast('Profile picture updated! 🎉', 'success')
    } catch (err) {
      console.error(err)
      showToast('Upload failed. Please try again.', 'error')
      setAvatarPreview(form.avatar_url || null)
    } finally {
      setUploading(false)
    }
  }, [profile, role, form.avatar_url, showToast])

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (file) uploadAvatar(file)
    // Reset input so re-selecting the same file triggers onChange
    e.target.value = ''
  }

  const handleDragOver = e => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = e => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadAvatar(file)
  }

  // ── Save handlers ──────────────────────────────────────────────────────────
  const savePersonal = async (e) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const endpoint = role === 'client' ? `/api/clients/${profile.id}` : `/api/influencers/${profile.id}`
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: form.name, phone: form.phone }),
    })
    setSaving(false)
    if (res.ok) {
      showToast('Personal information updated!', 'success')
      // Instantly update the navbar name + avatar
      window.dispatchEvent(new CustomEvent('brew:profile-updated', {
        detail: { name: form.name, avatar_url: form.avatar_url },
      }))
    } else { const p = await res.json(); showToast(p.error || 'Failed', 'error') }
  }

  const saveCompany = async (e) => {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    const endpoint = role === 'client' ? `/api/clients/${profile.id}` : `/api/influencers/${profile.id}`
    const body = role === 'client'
      ? { company_name: form.company_name, website: form.website, industry: form.industry, description: form.description }
      : { bio: form.bio }
    const res = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) showToast('Profile updated!', 'success')
    else { const p = await res.json(); showToast(p.error || 'Failed', 'error') }
  }

  const updatePassword = async (e) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) { showToast('Passwords do not match!', 'error'); return }
    if (passwords.new.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    const { error } = await supabase.auth.updateUser({ password: passwords.new })
    if (error) showToast(error.message, 'error')
    else { showToast('Password updated successfully!', 'success'); setPasswords({ current: '', new: '', confirm: '' }) }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleDeleteAccount = async () => {
    const confirm1 = prompt('Type DELETE to confirm permanent account deletion:')
    if (confirm1 !== 'DELETE') { showToast('Deletion cancelled', 'info'); return }
    showToast('Account deletion initiated. Contact support to complete.', 'error')
  }

  const sections = NAV_SECTIONS.map(s => ({
    ...s,
    label: typeof s.label === 'function' ? s.label(role) : s.label,
  }))

  const displayAvatar = avatarPreview || null

  return (
    <div className="dashboard-body">
      <DashboardNav role={role} />
      <div className="dashboard-container">
        <div className="settings-layout">

          {/* Sidebar */}
          <div className="settings-sidebar glass">
            <h2>Settings</h2>
            <nav className="settings-nav">
              {sections.map(s => (
                <button
                  key={s.id}
                  className={`settings-nav-item${activeSection === s.id ? ' active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <span className="icon">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="settings-content">

            {/* ── Personal Info ── */}
            {activeSection === 'personal' && (
              <section className="settings-section active">
                <div className="section-header-card glass">
                  <h2>Personal Information</h2>
                  <p>Update your personal details and profile picture</p>
                </div>
                <div className="settings-card glass">

                  {/* Avatar Upload Zone */}
                  <div className="profile-photo-section">
                    <div
                      className={`avatar-upload-zone${isDragging ? ' dragging' : ''}`}
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      title="Click or drag & drop to upload a photo"
                    >
                      {displayAvatar
                        ? <img
                            src={displayAvatar}
                            alt="Profile"
                            className="avatar-upload-img"
                            style={{ width: 70, height: 70, maxWidth: 70, maxHeight: 70, objectFit: 'cover', borderRadius: "50%", objectPosition: 'top', display: 'block', flexShrink: 0 }}
                          />
                        : <AvatarPlaceholder alt={form.name || 'User'} size={70} style={{ flexShrink: 0 }} />
                      }

                      {/* Spinner overlay while uploading */}
                      {uploading && (
                        <div className="avatar-upload-overlay">
                          <div className="avatar-spinner" />
                        </div>
                      )}

                      {/* Hover overlay */}
                      {!uploading && (
                        <div className="avatar-hover-overlay">
                          <span className="avatar-camera-icon">📷</span>
                          <span className="avatar-upload-label">Change Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="photo-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading…' : 'Upload Photo'}
                      </button>
                      <span className="help-text">
                        JPG, PNG, WEBP or GIF · Max 5 MB<br />
                        Click the circle or drag &amp; drop to upload
                      </span>
                    </div>

                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>

                  <form className="settings-form" onSubmit={savePersonal}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input name="name" value={form.name || ''} onChange={handle} required />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" value={form.email || ''} disabled style={{ opacity: 0.5 }} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" name="phone" value={form.phone || ''} onChange={handle} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={saving || uploading}>
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => profile && setForm(f => ({ ...f, name: profile.name, phone: profile.phone || '' }))}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* ── Company / Creator ── */}
            {activeSection === 'company' && (
              <section className="settings-section active">
                <div className="section-header-card glass">
                  <h2>{role === 'client' ? 'Company Settings' : 'Creator Profile'}</h2>
                  <p>{role === 'client' ? 'Manage your company profile and branding' : 'Update your creator bio and details'}</p>
                </div>
                <div className="settings-card glass">
                  <form className="settings-form" onSubmit={saveCompany}>
                    {role === 'client' ? (
                      <>
                        <div className="form-group">
                          <label>Company Name *</label>
                          <input name="company_name" value={form.company_name || ''} onChange={handle} required />
                        </div>
                        <div className="form-group">
                          <label>Website</label>
                          <input type="url" name="website" value={form.website || ''} onChange={handle} placeholder="https://yourcompany.com" />
                        </div>
                        <div className="form-group">
                          <label>Industry</label>
                          <select name="industry" value={form.industry || ''} onChange={handle}>
                            <option value="">Select industry</option>
                            <option value="technology">Technology</option>
                            <option value="fashion">Fashion</option>
                            <option value="food">Food & Beverage</option>
                            <option value="health">Health & Wellness</option>
                            <option value="finance">Finance</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Company Description</label>
                          <textarea name="description" rows={4} value={form.description || ''} onChange={handle} placeholder="Tell influencers about your company..." />
                        </div>
                      </>
                    ) : (
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea name="bio" rows={6} value={form.bio || ''} onChange={handle} placeholder="Describe your niche, audience, and what makes you unique..." />
                      </div>
                    )}
                    <div className="form-actions">
                      <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                      <button type="button" className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {/* ── Billing ── */}
            {activeSection === 'billing' && (
              <section className="settings-section active">
                <div className="section-header-card glass">
                  <h2>Billing & Payment</h2>
                  <p>Manage your subscription and payment methods</p>
                </div>
                <div className="settings-card glass">
                  <div className="current-plan">
                    <div className="plan-badge">Professional Plan</div>
                    <div className="plan-details">
                      <h3>$149/month</h3>
                      <p>Unlimited campaigns • Advanced analytics • Priority support</p>
                      <button className="btn-outline" onClick={() => showToast('Plan management coming soon', 'info')}>Change Plan</button>
                    </div>
                  </div>
                </div>
                <div className="settings-card glass">
                  <h3 className="card-title">Payment Method</h3>
                  <div className="payment-method">
                    <div className="card-info">
                      <span className="card-icon">💳</span>
                      <div className="card-details">
                        <p className="card-type">No payment method added</p>
                        <p className="card-expiry">Add one to activate your plan</p>
                      </div>
                    </div>
                    <button className="btn-secondary" onClick={() => showToast('Payment setup coming soon', 'info')}>Add Card</button>
                  </div>
                </div>
                <div className="settings-card glass">
                  <h3 className="card-title">Billing History</h3>
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div className="empty-icon" style={{ fontSize: '2rem' }}>🧾</div>
                    <p style={{ opacity: 0.6, marginTop: '0.5rem' }}>No invoices yet</p>
                  </div>
                </div>
              </section>
            )}

            {/* ── Account & Security ── */}
            {activeSection === 'account' && (
              <section className="settings-section active">
                <div className="section-header-card glass">
                  <h2>Account & Security</h2>
                  <p>Manage your password and account settings</p>
                </div>
                <div className="settings-card glass">
                  <h3 className="card-title">Change Password</h3>
                  <form className="settings-form" onSubmit={updatePassword}>
                    <div className="form-group">
                      <label>New Password</label>
                      <input type="password" minLength={8} required value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input type="password" minLength={8} required value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Update Password</button>
                    </div>
                  </form>
                </div>
                <div className="settings-card glass danger-zone">
                  <h3 className="card-title">Danger Zone</h3>
                  <div className="danger-actions">
                    <div className="danger-item">
                      <div>
                        <h4>Logout from all devices</h4>
                        <p>Sign out from all active sessions on other devices</p>
                      </div>
                      <button className="btn-danger-outline" onClick={handleLogout}>Logout All</button>
                    </div>
                    <div className="danger-item">
                      <div>
                        <h4>Delete Account</h4>
                        <p>Permanently delete your account and all data</p>
                      </div>
                      <button className="btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
                    </div>
                  </div>
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  )
}
