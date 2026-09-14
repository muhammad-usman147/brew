export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 140, 66, 0.2)',
          borderTop: '3px solid #ff8c42',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 500 }}>
        Loading...
      </span>
    </div>
  )
}
