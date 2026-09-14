'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BrewLogo from './BrewLogo'
import { supabase } from '@/lib/supabase/client'
import { AvatarPlaceholder } from '@/components/ui/Avatar'

export default function DashboardNav({ role = 'client' }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)

  // Initial fetch on mount
  useEffect(() => {
    async function fetchProfile() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return
      setUser(authUser)
      const res     = await fetch(`/api/auth/profile?email=${encodeURIComponent(authUser.email)}`)
      const payload = await res.json().catch(() => ({}))
      if (payload?.profile) setProfile(payload.profile)
    }
    fetchProfile()
  }, [])

  // Listen for profile updates broadcast from SettingsPage — instant, no re-fetch
  useEffect(() => {
    const handler = (e) => {
      setProfile(prev => prev ? { ...prev, ...e.detail } : e.detail)
    }
    window.addEventListener('brew:profile-updated', handler)
    return () => window.removeEventListener('brew:profile-updated', handler)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const clientLinks = [
    { to: '/client/dashboard',   icon: '🏠', label: 'Dashboard' },
    { to: '/client/campaigns',   icon: '📢', label: 'My Campaigns' },
    { to: '/client/connections', icon: '🤝', label: 'Connections' },
    { to: '/client/messages',    icon: '💬', label: 'Messages', badge: 5 },
    { to: '/client/settings',    icon: '⚙️', label: 'Settings' },
  ]

  const influencerLinks = [
    { to: '/influencer/dashboard',   icon: '🏠', label: 'Dashboard' },
    { to: '/influencer/connections', icon: '🤝', label: 'Connections' },
    { to: '/influencer/portfolio',   icon: '📂', label: 'Portfolio' },
    { to: '/influencer/messages',    icon: '💬', label: 'Messages', badge: 3 },
    { to: '/influencer/settings',    icon: '⚙️', label: 'Settings' },
  ]

  const links = role === 'client' ? clientLinks : influencerLinks
  const settingsHref = role === 'client' ? '/client/settings' : '/influencer/settings'
  const displayName  = profile?.name ?? user?.user_metadata?.full_name ?? '...'

  return (
    <nav className="dashboard-nav glass">
      <div className="nav-left">
        <Link href="/" className="logo">
          <BrewLogo />
          <span>Brew</span>
        </Link>
      </div>

      <div className="nav-center">
        {links.map(link => (
          <Link key={link.to} href={link.to} className={`nav-item${pathname === link.to ? ' active' : ''}`}>
            <span className="icon">{link.icon}</span>
            <span>{link.label}</span>
            {link.badge && <span className="badge">{link.badge}</span>}
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <div className="user-menu">
          <Link href={settingsHref} className="nav-avatar-link" title="Settings">
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={displayName} className="user-avatar" />
              : <AvatarPlaceholder alt={displayName} size={40} className="user-avatar" style={{ border: '2px solid var(--primary-orange)' }} />
            }
          </Link>
          <span className="user-name">{displayName}</span>
          <button onClick={handleLogout} title="Logout" style={{ background:'none', border:'2px solid rgba(255,140,66,0.3)', borderRadius:'8px', cursor:'pointer', padding:'0.3rem 0.6rem', fontSize:'0.75rem', fontWeight:700, color:'var(--text-dark)', transition:'var(--transition)', marginLeft:'0.5rem' }}
            onMouseEnter={e => e.target.style.borderColor='var(--primary-orange)'}
            onMouseLeave={e => e.target.style.borderColor='rgba(255,140,66,0.3)'}
          >Logout</button>
        </div>
      </div>
    </nav>
  )
}