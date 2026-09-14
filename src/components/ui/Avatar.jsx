// Reusable avatar — shows image if available, SVG placeholder if not
export default function Avatar({ src, alt = '', size = 40, className = '', style = {} }) {
  const s = typeof size === 'number' ? `${size}px` : size

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: s, height: s, objectFit: 'cover', borderRadius: '50%', flexShrink: 0, ...style }}
        onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'flex') }}
      />
    )
  }

  return <AvatarPlaceholder size={s} alt={alt} className={className} style={style} />
}

export function AvatarPlaceholder({ size = '40px', alt = '', className = '', style = {} }) {
  const s = typeof size === 'number' ? `${size}px` : size
  const initials = alt
    ? alt.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  return (
    <div
      className={className}
      aria-label={alt}
      style={{
        width: s, height: s, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(244,119,11,0.15), rgba(255,151,76,0.25))',
        border: '2px solid rgba(244,119,11,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary-orange)', fontWeight: 700,
        fontSize: `calc(${s} * 0.35)`,
        fontFamily: "'DM Sans', sans-serif",
        userSelect: 'none',
        ...style
      }}
    >
      {initials}
    </div>
  )
}
