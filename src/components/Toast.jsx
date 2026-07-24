import { useEffect, useState } from 'react'
import './Toast.css'

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = { success: '✓', error: '✕', info: 'ℹ' }

  return (
    <div className={`toast toast-${type} ${visible ? 'show' : ''}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
    </div>
  )
}
