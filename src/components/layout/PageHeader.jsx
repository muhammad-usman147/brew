import './PageHeader.css'

export default function PageHeader({ title, description, action, inline = false, children }) {
  return (
    <div className={`page-header${inline ? ' page-header--inline' : ''}`}>
      <div className="page-header__content">
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
      {action}
    </div>
  )
}
