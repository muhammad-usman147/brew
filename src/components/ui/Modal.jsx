import Glass from './Glass'
import './Modal.css'

export default function Modal({ title, onClose, children, footer, maxWidth }) {
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}>
      <Glass className="modal-content" style={maxWidth ? { maxWidth } : undefined}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </Glass>
    </div>
  )
}

export function ModalBody({ children, className = '' }) {
  return <div className={['modal-body', className].filter(Boolean).join(' ')}>{children}</div>
}
