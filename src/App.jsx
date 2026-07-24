import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'

// Client pages
import ClientDashboard from './pages/client/ClientDashboard'
import ClientCampaigns from './pages/client/ClientCampaigns'
import ClientConnections from './pages/client/ClientConnections'

// Influencer pages
import InfluencerDashboard from './pages/influencer/InfluencerDashboard'
import InfluencerConnections from './pages/influencer/InfluencerConnections'
import InfluencerPortfolio from './pages/influencer/InfluencerPortfolio'

// Shared pages (same layout, different role prop)
import MessagesPage from './pages/shared/MessagesPage'
import SettingsPage from './pages/shared/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* ── Client Routes ── */}
        <Route path="/client/dashboard"   element={<ClientDashboard />} />
        <Route path="/client/campaigns"   element={<ClientCampaigns />} />
        <Route path="/client/connections" element={<ClientConnections />} />
        <Route path="/client/messages"    element={<MessagesPage role="client" />} />
        <Route path="/client/settings"    element={<SettingsPage role="client" />} />

        {/* ── Influencer Routes ── */}
        <Route path="/influencer/dashboard"   element={<InfluencerDashboard />} />
        <Route path="/influencer/connections" element={<InfluencerConnections />} />
        <Route path="/influencer/portfolio"   element={<InfluencerPortfolio />} />
        <Route path="/influencer/messages"    element={<MessagesPage role="influencer" />} />
        <Route path="/influencer/settings"    element={<SettingsPage role="influencer" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
