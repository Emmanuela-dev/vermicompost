import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { path: '/monitoring', label: 'Monitoring', icon: '📈' },
  { path: '/ai-insights', label: 'AI Insights', icon: '🤖' },
  { path: '/lifecycle', label: 'Lifecycle', icon: '🔄' },
  { path: '/', label: 'Home', icon: '🏠' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: 'rgba(8, 12, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: '1280px',
          display: 'flex',
          height: '64px',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
            }}
          >
            🪱
          </div>
          <div>
            <div
              style={{
                fontSize: '17px',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#e8edf5',
              }}
            >
              VermiCompost
            </div>
            <div style={{ fontSize: '10px', color: '#546a92', letterSpacing: '0.08em', fontWeight: 500 }}>
              IoT DASHBOARD
            </div>
          </div>
        </Link>

        {/* Live indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div
            className="animate-pulse-dot"
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600, letterSpacing: '0.06em' }}>
            LIVE
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {navLinks.map(({ path, label }) => {
            const isActive = location.pathname === path || (path === '/dashboard' && location.pathname === '/')
            return (
              <Link
                key={path}
                to={path}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#34d399' : '#9aaec8',
                  background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  border: isActive ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
