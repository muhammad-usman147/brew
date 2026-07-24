import './Tabs.css'

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tabs-container">
      {tabs.map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={`tab${activeTab === value ? ' active' : ''}`}
          onClick={() => onTabChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
