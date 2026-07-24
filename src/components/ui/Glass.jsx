import './Glass.css'

export default function Glass({ as: Component = 'div', className = '', children, ...props }) {
  const classes = ['glass', className].filter(Boolean).join(' ')
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  )
}
