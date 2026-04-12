import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logout as logoutApi } from '../api/auth'
import useWindowSize from '../hooks/useWindowSize'

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',  icon: '▣', ownerOnly: true },
  { path: '/billing',    label: 'Billing',    icon: '⊞', ownerOnly: false },
  { path: '/inventory',  label: 'Inventory',  icon: '⊟', ownerOnly: true },
  { path: '/warehouse',  label: 'Warehouse',  icon: '▦', ownerOnly: true },
  { path: '/suppliers',  label: 'Suppliers',  icon: '⊕', ownerOnly: true },
  { path: '/ledger',     label: 'Ledger',     icon: '₹', ownerOnly: true },
  { path: '/history',    label: 'History',    icon: '≡', ownerOnly: false },
  { path: '/gst-report', label: 'GST Report', icon: '§', ownerOnly: true },
  { path: '/staff',      label: 'Staff',      icon: '⊗', ownerOnly: true },
]

export default function Layout() {
  const { user, logout, isOwner } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { isMobile, isTablet, isDesktop } = useWindowSize()

  const handleLogout = async () => {
    const refresh = sessionStorage.getItem('refresh_token')
    try { await logoutApi(refresh) } catch {}
    logout()
    navigate('/login')
  }

  const visibleItems = NAV_ITEMS.filter(item => !item.ownerOnly || isOwner())

  const showLabels = isDesktop || (isTablet && sidebarExpanded)

  const sidebarWidth = isDesktop
    ? '220px'
    : isTablet
      ? (sidebarExpanded ? '220px' : '64px')
      : '0px'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg-primary)' }}>

      {/* ── Sidebar (desktop + tablet) ── */}
      {!isMobile && (
        <aside style={{
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 0',
          overflow: 'hidden',
          transition: 'width 0.25s ease',
        }}>

          {/* Brand */}
          <div style={{ padding: '0 1.25rem', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: showLabels ? 'flex-start' : 'center' }}>
            {showLabels ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: '700', letterSpacing: '0.1em' }}>
                <span style={{ color: 'var(--text-primary)' }}>RX</span>
                <span style={{ color: 'var(--accent-green)' }}>MGMT</span>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '700', color: 'var(--accent-green)' }}>
                RX
              </div>
            )}
          </div>

          {/* Pharmacy name — desktop + expanded tablet only */}
          {showLabels && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0 1.25rem', marginBottom: '1.5rem', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.pharmacy?.name || 'Pharmacy'}
            </div>
          )}

          {/* Tablet toggle button */}
          {isTablet && (
            <div style={{ display: 'flex', justifyContent: showLabels ? 'flex-end' : 'center', padding: '0 0.75rem', marginBottom: '1rem' }}>
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                title={sidebarExpanded ? 'Collapse' : 'Expand menu'}
                style={{
                  fontSize: '13px',
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {sidebarExpanded ? '◀' : '▶'}
              </button>
            </div>
          )}

          {/* Nav items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, padding: '0 0.5rem' }}>
            {visibleItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                title={!showLabels ? item.label : undefined}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: showLabels ? 'flex-start' : 'center',
                  gap: '10px',
                  padding: showLabels ? '9px 12px' : '12px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  borderLeft: isActive && showLabels ? '2px solid var(--accent-green)' : '2px solid transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                })}
              >
                <span style={{ fontSize: '16px', width: '18px', textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                {showLabels && <span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          {showLabels ? (
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || user?.phone_number}
                </div>
                <div style={{ fontSize: '9px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  {user?.privilege_level === 5 ? 'ADMIN' :
                   user?.privilege_level === 4 ? 'CHAIN OWNER' :
                   user?.privilege_level === 3 ? 'SUPPORT' :
                   user?.privilege_level === 2 ? 'OWNER' : 'CLERK'}
                </div>
              </div>
              <button onClick={handleLogout} style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer' }}>
                EXIT
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border)' }}>
              <button onClick={handleLogout} title="Logout" style={{ fontSize: '18px', background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}>
                ⏻
              </button>
            </div>
          )}
        </aside>
      )}

      {/* ── Main content area ── */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile topbar */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: '700' }}>
              <span style={{ color: 'var(--text-primary)' }}>RX</span>
              <span style={{ color: 'var(--accent-green)' }}>MGMT</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: 'var(--text-secondary)', fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        )}

        {/* Mobile dropdown menu */}
        {isMobile && mobileMenuOpen && (
          <div style={{ position: 'absolute', top: 'var(--topbar-height)', left: 0, right: 0, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '0.5rem' }}>
            {visibleItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  padding: '12px 16px',
                  color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-hover)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                })}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
            <button onClick={handleLogout} style={{ margin: '8px 16px', padding: '10px', color: 'var(--accent-red)', fontFamily: 'var(--font-mono)', fontSize: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>
              EXIT
            </button>
          </div>
        )}

        {/* Page content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: isMobile ? '1rem' : isTablet ? '1.25rem' : '1.5rem',
          paddingBottom: isMobile ? '80px' : undefined,
        }}>
          <Outlet />
        </div>
      </main>

      {/* ── Bottom nav (mobile only) ── */}
      {isMobile && (
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', zIndex: 50, display: 'flex' }}>
          {visibleItems.slice(0, 5).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                padding: '8px 4px',
                color: isActive ? 'var(--accent-green)' : 'var(--text-muted)',
                textDecoration: 'none',
                gap: '2px',
              })}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      )}

    </div>
  )
}