import { NavLink, useNavigate } from 'react-router-dom'
import BrewLogo from './BrewLogo'
import Glass from './ui/Glass'
import './DashboardNav.css'

export default function DashboardNav({ role = 'client' }) {
  const navigate = useNavigate()

  const clientLinks = [
    { to: '/client/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/client/campaigns', icon: '📢', label: 'My Campaigns' },
    { to: '/client/connections', icon: '🤝', label: 'Connections' },
    { to: '/client/messages', icon: '💬', label: 'Messages', badge: 5 },
    { to: '/client/settings', icon: '⚙️', label: 'Settings' },
  ]

  const influencerLinks = [
    { to: '/influencer/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/influencer/connections', icon: '🤝', label: 'Connections' },
    { to: '/influencer/portfolio', icon: '📂', label: 'Portfolio' },
    { to: '/influencer/messages', icon: '💬', label: 'Messages', badge: 3 },
    { to: '/influencer/settings', icon: '⚙️', label: 'Settings' },
  ]

  const links = role === 'client' ? clientLinks : influencerLinks
  const user =
    role === 'client'
      ? { name: 'Marcus Chen', avatar: 'https://i.pravatar.cc/150?img=12' }
      : { name: 'Sarah Mitchell', avatar: 'https://i.pravatar.cc/150?img=33' }

  return (
    <Glass className="dashboard-nav">
      <div className="nav-left">
        <div className="logo" onClick={() => navigate('/')}>
          <BrewLogo />
          <span>Brew</span>
        </div>
      </div>

      <div className="nav-center">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            <span>{link.label}</span>
            {link.badge && <span className="badge">{link.badge}</span>}
          </NavLink>
        ))}
      </div>

      <div className="nav-right">
        <div className="user-menu">
          <img src={user.avatar} alt="Profile" className="user-avatar" />
          <span className="user-name">{user.name}</span>
        </div>
      </div>
    </Glass>
  )
}
