import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register as registerApi } from '../api/auth'

export default function Register() {
  const [isChain, setIsChain] = useState(false)
  const [form, setForm] = useState({
    pharmacy_name: '',
    owner_name: '',
    phone_number: '',
    password: '',
    gstin: '',
    drug_license_no: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, is_chain: isChain }
      const res = await registerApi(payload)
      const { access, refresh } = res.data
      
      const meRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/accounts/me/`,
        { headers: { Authorization: `Bearer ${access}` } }
      )
      if (!meRes.ok) throw new Error('Failed to fetch user details.')
      const user = await meRes.json()
      
      login(user, access, refresh)
      navigate(user.privilege_level >= 2 ? '/dashboard' : '/billing')
    } catch (err) {
      if (err.response?.data?.phone_number) {
        setError(err.response.data.phone_number[0])
      } else {
        setError('Failed to register. Please check your details.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <span style={styles.brandRx}>RX</span>
          <span style={styles.brandMgmt}>MGMT</span>
        </div>
        <p style={styles.subtitle}>Create your Pharmacy Account</p>

        {/* Toggle Switch */}
        <div style={styles.toggleContainer}>
          <button
            type="button"
            onClick={() => setIsChain(false)}
            style={{ ...styles.toggleBtn, ...( !isChain ? styles.toggleActive : styles.toggleInactive ) }}
          >
            STANDALONE PHARMACY
          </button>
          <button
            type="button"
            onClick={() => setIsChain(true)}
            style={{ ...styles.toggleBtn, ...( isChain ? styles.toggleActive : styles.toggleInactive ) }}
          >
            PHARMACY CHAIN
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <label style={styles.label}>{isChain ? 'CHAIN / ORG NAME *' : 'PHARMACY NAME *'}</label>
              <input style={styles.input} type="text" name="pharmacy_name" placeholder={isChain ? "e.g. Apollo Group" : "e.g. City Pharma"} value={form.pharmacy_name} onChange={handleChange} required autoFocus />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>OWNER NAME *</label>
              <input style={styles.input} type="text" name="owner_name" placeholder="e.g. Ramesh Kumar" value={form.owner_name} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <label style={styles.label}>PHONE NUMBER *</label>
              <input style={styles.input} type="tel" name="phone_number" placeholder="Enter phone number" value={form.phone_number} onChange={handleChange} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD *</label>
              <input style={styles.input} type="password" name="password" placeholder="Min 8 characters" minLength={8} value={form.password} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <label style={styles.label}>GSTIN (Optional)</label>
              <input style={styles.input} type="text" name="gstin" placeholder="e.g. 27AABCU9603R1ZX" value={form.gstin} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>DRUG LICENSE NO (Optional)</label>
              <input style={styles.input} type="text" name="drug_license_no" placeholder="e.g. DL-MH-12345" value={form.drug_license_no} onChange={handleChange} />
            </div>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={{ ...styles.button, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'CREATING ACCOUNT...' : 'REGISTER'}
          </button>
        </form>

        <div style={styles.footerLink}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        </div>

        <p style={styles.footer}>
          <span style={{ color: 'var(--accent-green)' }}>●</span>&nbsp;SECURE CONNECTION
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem 1rem' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow)' },
  brand: { fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '4px', textAlign: 'center' },
  brandRx: { color: 'var(--text-primary)' },
  brandMgmt: { color: 'var(--accent-green)' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '12px', letterSpacing: '0.08em', marginBottom: '2rem', textAlign: 'center' },
  toggleContainer: { display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '4px', marginBottom: '1.5rem' },
  toggleBtn: { flex: 1, padding: '10px', fontSize: '10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', fontWeight: '700', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' },
  toggleActive: { background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
  toggleInactive: { background: 'transparent', color: 'var(--text-muted)' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  fieldGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '10px', letterSpacing: '0.12em', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' },
  input: { background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' },
  error: { color: 'var(--accent-red)', fontSize: '12px', fontFamily: 'var(--font-mono)', textAlign: 'center' },
  button: { background: 'var(--accent-green)', color: '#000', fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '13px', letterSpacing: '0.1em', padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', transition: 'opacity 0.2s', marginTop: '0.5rem' },
  footerLink: { marginTop: '1.5rem', fontSize: '12px', textAlign: 'center' },
  footer: { marginTop: '2rem', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center' },
}
