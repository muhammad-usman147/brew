import './CreateCampaignButton.css'

export default function CreateCampaignButton({ onClick, label = 'Create New Campaign', className = '' }) {
  return (
    <button type="button" className={['btn-create-campaign', className].filter(Boolean).join(' ')} onClick={onClick}>
      <span className="icon">➕</span>
      <span>{label}</span>
    </button>
  )
}
