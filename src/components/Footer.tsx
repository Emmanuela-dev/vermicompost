import { Link } from 'react-router-dom'

const footerLinks = [
  ['/dashboard', 'Dashboard'],
  ['/monitoring', 'Monitoring'],
  ['/ai-insights', 'AI Insights'],
  ['/lifecycle', 'Lifecycle'],
  ['/', 'Home'],
  ['/contact', 'Contact'],
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,12,20,0.9)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg,#059669,#10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              🪱
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#e8edf5' }}>VermiCompost</span>
          </div>

          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {footerLinks.map(([path, label]) => (
              <Link
                key={path}
                to={path}
                style={{
                  padding: '5px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#546a92',
                  textDecoration: 'none',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLAnchorElement).style.color = '#34d399' }}
                onMouseLeave={(e) => { (e.target as HTMLAnchorElement).style.color = '#546a92' }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#3d5278' }}>
          © {new Date().getFullYear()} VermiCompost IoT Dashboard — Built with care for the earth 🌍
        </p>
      </div>
    </footer>
  )
}
