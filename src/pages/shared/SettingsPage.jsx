import { useState } from 'react'
import DashboardNav from '../../components/DashboardNav'
import Toast from '../../components/Toast'
import { useToast } from '../../hooks/useToast'


const sections = [
  { id:'personal', icon:'👤', label:'Personal Info' },
  { id:'company', icon:'🏢', label:'Company Settings' },
  { id:'billing', icon:'💳', label:'Billing & Payment' },
  { id:'account', icon:'🔐', label:'Account & Security' },
]

export default function SettingsPage({ role = 'client' }) {
  const { toast, showToast, hideToast } = useToast()
  const [activeSection, setActiveSection] = useState('personal')

  const user = role === 'client'
    ? { firstName:'Marcus', lastName:'Chen', email:'marcus.chen@techcorp.com', phone:'+1 (555) 123-4567', company:'TechCorp Industries', website:'https://techcorp.com', industry:'technology', description:'Leading technology company specializing in innovative software solutions for businesses worldwide.', avatar:'https://i.pravatar.cc/150?img=12', logoInitials:'TC' }
    : { firstName:'Sarah', lastName:'Mitchell', email:'sarah.mitchell@fashionista.com', phone:'+1 (555) 123-4567', company:'Fashion Influencer', website:'https://techcorp.com', industry:'technology', description:'Fashion and lifestyle content creator specializing in innovative software solutions for businesses worldwide.', avatar:'https://i.pravatar.cc/150?img=33', logoInitials:'TC' }

  const [form, setForm] = useState(user)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

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
                <button key={s.id} className={`settings-nav-item${activeSection===s.id?' active':''}`} onClick={() => setActiveSection(s.id)}>
                  <span className="icon">{s.icon}</span><span>{s.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="settings-content">

            {activeSection === 'personal' && (
              <section className="settings-section active">
                <div className="section-header-card glass"><h2>Personal Information</h2><p>Update your personal details and profile picture</p></div>
                <div className="settings-card glass">
                  <div className="profile-photo-section">
                    <div className="current-photo"><img src={form.avatar} alt="Profile" id="profilePreview" /></div>
                    <div className="photo-actions">
                      <button className="btn-primary" onClick={() => showToast('Photo updated!','success')}>Change Photo</button>
                      <button className="btn-secondary" onClick={() => showToast('Photo removed','info')}>Remove</button>
                    </div>
                  </div>
                  <form className="settings-form" onSubmit={e => { e.preventDefault(); showToast('Personal information updated!','success') }}>
                    <div className="form-row">
                      <div className="form-group"><label>First Name</label><input name="firstName" value={form.firstName} onChange={handle} required /></div>
                      <div className="form-group"><label>Last Name</label><input name="lastName" value={form.lastName} onChange={handle} required /></div>
                    </div>
                    <div className="form-group"><label>Email Address</label><input type="email" name="email" value={form.email} onChange={handle} required /></div>
                    <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" value={form.phone} onChange={handle} /></div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Save Changes</button>
                      <button type="button" className="btn-secondary" onClick={() => setForm(user)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {activeSection === 'company' && (
              <section className="settings-section active">
                <div className="section-header-card glass"><h2>Company Settings</h2><p>Manage your company profile and branding</p></div>
                <div className="settings-card glass">
                  <div className="company-logo-section">
                    <div className="current-logo"><div className="logo-placeholder">{form.logoInitials}</div></div>
                    <div className="logo-actions">
                      <button className="btn-primary" onClick={() => showToast('Logo uploaded!','success')}>Upload Logo</button>
                      <span className="help-text">Recommended: 256x256px, PNG or JPG</span>
                    </div>
                  </div>
                  <form className="settings-form" onSubmit={e => { e.preventDefault(); showToast('Company settings updated!','success') }}>
                    <div className="form-group"><label>Company Name</label><input name="company" value={form.company} onChange={handle} required /></div>
                    <div className="form-group"><label>Website</label><input type="url" name="website" value={form.website} onChange={handle} placeholder="https://example.com" /></div>
                    <div className="form-group">
                      <label>Industry</label>
                      <select name="industry" value={form.industry} onChange={handle}>
                        <option value="technology">Technology</option><option value="fashion">Fashion</option>
                        <option value="food">Food & Beverage</option><option value="health">Health & Wellness</option>
                        <option value="finance">Finance</option><option value="other">Other</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Company Description</label><textarea name="description" rows={4} placeholder="Tell influencers about your company..." defaultValue={form.description} /></div>
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Save Changes</button>
                      <button type="button" className="btn-secondary">Cancel</button>
                    </div>
                  </form>
                </div>
              </section>
            )}

            {activeSection === 'billing' && (
              <section className="settings-section active">
                <div className="section-header-card glass"><h2>Billing & Payment</h2><p>Manage your subscription and payment methods</p></div>
                <div className="settings-card glass">
                  <div className="current-plan">
                    <div className="plan-badge">Professional Plan</div>
                    <div className="plan-details">
                      <h3>$149/month</h3>
                      <p>Unlimited campaigns • Advanced analytics • Priority support</p>
                      <button className="btn-outline" onClick={() => showToast('Opening pricing plans...','info')}>Change Plan</button>
                    </div>
                  </div>
                </div>
                <div className="settings-card glass">
                  <h3 className="card-title">Payment Method</h3>
                  <div className="payment-method">
                    <div className="card-info"><span className="card-icon">💳</span><div className="card-details"><p className="card-type">Visa ending in 4242</p><p className="card-expiry">Expires 12/2025</p></div></div>
                    <button className="btn-secondary" onClick={() => showToast('Opening payment update...','info')}>Update</button>
                  </div>
                </div>
                <div className="settings-card glass">
                  <h3 className="card-title">Billing History</h3>
                  <div className="invoice-list">
                    {[['Jan 1, 2024','$149.00'],['Dec 1, 2023','$149.00'],['Nov 1, 2023','$149.00']].map(([date,amount]) => (
                      <div key={date} className="invoice-item">
                        <div className="invoice-info"><span className="invoice-date">{date}</span><span className="invoice-amount">{amount}</span></div>
                        <button className="btn-download" onClick={() => showToast(`Downloading invoice...`,'info')}>Download</button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'account' && (
              <section className="settings-section active">
                <div className="section-header-card glass"><h2>Account & Security</h2><p>Manage your password and account settings</p></div>
                <div className="settings-card glass">
                  <h3 className="card-title">Change Password</h3>
                  <form className="settings-form" onSubmit={e => { e.preventDefault(); showToast('Password updated!','success'); e.target.reset() }}>
                    <div className="form-group"><label>Current Password</label><input type="password" required /></div>
                    <div className="form-group"><label>New Password</label><input type="password" required /></div>
                    <div className="form-group"><label>Confirm New Password</label><input type="password" required /></div>
                    <div className="form-actions"><button type="submit" className="btn-primary">Update Password</button></div>
                  </form>
                </div>
                <div className="settings-card glass danger-zone">
                  <h3 className="card-title">Danger Zone</h3>
                  <div className="danger-actions">
                    <div className="danger-item">
                      <div><h4>Logout from all devices</h4><p>Sign out from all active sessions on other devices</p></div>
                      <button className="btn-danger-outline" onClick={() => showToast('Logged out from all devices','success')}>Logout All</button>
                    </div>
                    <div className="danger-item">
                      <div><h4>Delete Account</h4><p>Permanently delete your account and all data</p></div>
                      <button className="btn-danger" onClick={() => { if(window.confirm('Are you sure? This cannot be undone.')) showToast('Account deletion initiated','error') }}>Delete Account</button>
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
