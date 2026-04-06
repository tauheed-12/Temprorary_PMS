import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi, getMe } from '../api/auth'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await loginApi(phone, password)
      const { access, refresh } = res.data
      // Store tokens first so the axios interceptor can attach them to /me/
      sessionStorage.setItem('access_token', access)
      sessionStorage.setItem('refresh_token', refresh)
      const meRes = await getMe()
      login(meRes.data, access, refresh)
      navigate(meRes.data.privilege_level >= 2 ? '/dashboard' : '/billing')
    } catch (err) {
      sessionStorage.clear()
      const detail = err.response?.data?.detail
      setError(detail || 'Invalid phone number or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandRx}>RX</span>
          <span style={styles.brandMgmt}>MGMT</span>
        </div>
        <p style={styles.subtitle}>Pharmacy Management System</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>PHONE NUMBER</label>
            <input
              style={styles.input}
              type="tel"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '12px', textAlign: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
        </div>

        <p style={styles.footer}>
          <span style={{ color: 'var(--accent-green)' }}>●</span>
          &nbsp;SECURE CONNECTION
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-primary)',
    padding: '1rem',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: 'var(--shadow)',
  },
  brand: {
    fontFamily: 'var(--font-mono)',
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '0.1em',
    marginBottom: '4px',
  },
  brandRx: { color: 'var(--text-primary)' },
  brandMgmt: { color: 'var(--accent-green)' },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '12px',
    letterSpacing: '0.08em',
    marginBottom: '2rem',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: {
    fontSize: '10px',
    letterSpacing: '0.12em',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  input: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  error: { color: 'var(--accent-red)', fontSize: '12px', fontFamily: 'var(--font-mono)' },
  button: {
    background: 'var(--accent-green)',
    color: '#000',
    fontFamily: 'var(--font-mono)',
    fontWeight: '700',
    fontSize: '13px',
    letterSpacing: '0.1em',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    marginTop: '0.5rem',
  },
  footer: {
    marginTop: '2rem',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    textAlign: 'center',
  },
}