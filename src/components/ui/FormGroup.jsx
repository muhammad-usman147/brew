import './FormGroup.css'

export function FormGroup({ label, children, helpText, required }) {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      {children}
      {helpText && <span className="help-text">{helpText}</span>}
    </div>
  )
}

export function InputWithIcon({ icon, children }) {
  return (
    <div className="input-with-icon">
      <span className="input-icon">{icon}</span>
      {children}
    </div>
  )
}

export function FormRow({ children }) {
  return <div className="form-row">{children}</div>
}
