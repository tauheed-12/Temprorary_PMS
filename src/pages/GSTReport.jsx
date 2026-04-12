import { useState, useEffect, useCallback } from 'react'
import { getGSTReport } from '../api/billing'

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => {
  const n = parseFloat(v || 0)
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const today = () => new Date().toISOString().slice(0, 10)
const firstOfMonth = () => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10)
}

// ── sub-components ────────────────────────────────────────────────────────────
const Card = ({ title, badge, children, accent = 'var(--accent-green)' }) => (
  <div style={{
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    borderRadius: '12px', overflow: 'hidden',
  }}>
    <div style={{
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      <div style={{ width: '3px', height: '18px', background: accent, borderRadius: '2px' }} />
      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>{title}</span>
      {badge != null && (
        <span style={{
          marginLeft: 'auto', background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)', fontSize: '11px',
          padding: '2px 8px', borderRadius: '20px',
        }}>{badge}</span>
      )}
    </div>
    <div style={{ padding: '16px 20px' }}>{children}</div>
  </div>
)

const TaxRow = ({ label, taxable, cgst, sgst, igst, total, bold }) => (
  <tr style={{ borderBottom: '1px solid var(--border)', fontSize: bold ? '13px' : '12px', fontWeight: bold ? 700 : 400 }}>
    <td style={{ padding: '8px 4px', color: bold ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{label}</td>
    {taxable !== undefined && <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--text-primary)' }}>{fmt(taxable)}</td>}
    {cgst    !== undefined && <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(cgst)}</td>}
    {sgst    !== undefined && <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(sgst)}</td>}
    {igst    !== undefined && <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-amber)' }}>{fmt(igst)}</td>}
    {total   !== undefined && <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(total)}</td>}
  </tr>
)

const TableHead = ({ cols }) => (
  <thead>
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      {cols.map(c => (
        <th key={c} style={{
          padding: '6px 4px', textAlign: c === 'Item' || c === 'Description' || c === 'Buyer' ? 'left' : 'right',
          fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
        }}>{c}</th>
      ))}
    </tr>
  </thead>
)

const MONTH_PRESETS = [
  { label: 'This Month', from: firstOfMonth, to: today },
  { label: 'Last Month', from: () => { const d=new Date(); d.setMonth(d.getMonth()-1); return new Date(d.getFullYear(),d.getMonth(),1).toISOString().slice(0,10) },
    to: () => { const d=new Date(); return new Date(d.getFullYear(),d.getMonth(),0).toISOString().slice(0,10) } },
  { label: 'Q1 (Apr–Jun)', from: () => `${new Date().getFullYear()}-04-01`, to: () => `${new Date().getFullYear()}-06-30` },
  { label: 'Q2 (Jul–Sep)', from: () => `${new Date().getFullYear()}-07-01`, to: () => `${new Date().getFullYear()}-09-30` },
  { label: 'Q3 (Oct–Dec)', from: () => `${new Date().getFullYear()}-10-01`, to: () => `${new Date().getFullYear()}-12-31` },
  { label: 'Q4 (Jan–Mar)', from: () => `${new Date().getFullYear()}-01-01`, to: () => `${new Date().getFullYear()}-03-31` },
]

// ── main page ─────────────────────────────────────────────────────────────────
export default function GSTReport() {
  const [dateFrom, setDateFrom] = useState(firstOfMonth())
  const [dateTo,   setDateTo]   = useState(today())
  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState('gstr3b')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const res = await getGSTReport(dateFrom, dateTo)
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load GST report')
    } finally { setLoading(false) }
  }, [dateFrom, dateTo])

  useEffect(() => { load() }, [load])

  const G3  = data?.gstr3b  || {}
  const G1  = data?.gstr1   || {}
  const SUM = data?.summary  || {}

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `GST_Report_${dateFrom}_to_${dateTo}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabStyle = (active) => ({
    padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 600,
    background: active ? 'var(--accent-green)' : 'transparent',
    color:      active ? '#000' : 'var(--text-secondary)',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
            GST Report
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            GSTR-1 &amp; GSTR-3B data for your selected period
          </p>
        </div>
        {data && (
          <button onClick={exportJSON} style={{
            padding: '8px 16px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px',
            cursor: 'pointer', fontWeight: 600,
          }}>⬇ Export JSON</button>
        )}
      </div>

      {/* ── Period Selector ── */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: '7px', padding: '7px 10px', color: 'var(--text-primary)', fontSize: '13px', cursor: 'pointer',
          }} />
        </div>
        <button onClick={load} disabled={loading} style={{
          padding: '8px 20px', background: 'var(--accent-green)', border: 'none',
          borderRadius: '7px', color: '#000', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
        }}>{loading ? '...' : 'Fetch'}</button>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginLeft: '8px' }}>
          {MONTH_PRESETS.map(p => (
            <button key={p.label} onClick={() => { setDateFrom(p.from()); setDateTo(p.to()) }} style={{
              padding: '5px 10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#2a1515', border: '1px solid #5c2020', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>{error}</div>}

      {loading && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '14px' }}>Loading GST data…</div>}

      {data && !loading && (
        <>
          {/* ── Summary Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { label: 'Total Bills', value: SUM.total_bills, mono: true },
              { label: 'Total Sales', value: fmt(SUM.total_sales_value), accent: true },
              { label: 'Total Returns', value: fmt(SUM.total_returns_value) },
              { label: 'Net Tax Payable', value: fmt(SUM.net_tax_payable), red: true },
            ].map(c => (
              <div key={c.label} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '16px 18px',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{c.label}</div>
                <div style={{
                  fontSize: '20px', fontWeight: 700,
                  color: c.red ? '#f87171' : c.accent ? 'var(--accent-green)' : 'var(--text-primary)',
                  fontFamily: c.mono ? 'var(--font-mono)' : 'inherit',
                }}>{c.value}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{data.period?.label}</div>
              </div>
            ))}
          </div>

          {/* ── Tab Nav ── */}
          <div style={{
            display: 'flex', gap: '6px', background: 'var(--bg-secondary)',
            border: '1px solid var(--border)', borderRadius: '10px', padding: '6px', width: 'fit-content',
          }}>
            <button style={tabStyle(tab === 'gstr3b')} onClick={() => setTab('gstr3b')}>GSTR-3B</button>
            <button style={tabStyle(tab === 'b2b')}    onClick={() => setTab('b2b')}>B2B Invoices</button>
            <button style={tabStyle(tab === 'b2c')}    onClick={() => setTab('b2c')}>B2C Summary</button>
            <button style={tabStyle(tab === 'hsn')}    onClick={() => setTab('hsn')}>HSN Summary</button>
            <button style={tabStyle(tab === 'returns')}onClick={() => setTab('returns')}>Returns</button>
          </div>

          {/* ── GSTR-3B Tab ── */}
          {tab === 'gstr3b' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Card title="Outward Taxable Supplies (Intra-State)" accent="var(--accent-green)">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['', 'Taxable', 'CGST', 'SGST']} />
                  <tbody>
                    <TaxRow label="Sales (CGST+SGST)" taxable={G3.outward_intra?.taxable} cgst={G3.outward_intra?.cgst} sgst={G3.outward_intra?.sgst} />
                  </tbody>
                </table>
              </Card>

              <Card title="Outward Taxable Supplies (Inter-State)" accent="var(--accent-amber)">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['', 'Taxable', 'IGST']} />
                  <tbody>
                    <TaxRow label="Sales (IGST)" taxable={G3.outward_inter?.taxable} igst={G3.outward_inter?.igst} />
                  </tbody>
                </table>
              </Card>

              <Card title="ITC Available — Table 4A" accent="var(--accent-blue)">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['Source', 'CGST', 'SGST', 'IGST']} />
                  <tbody>
                    <TaxRow label="All Other ITC (Purchases)" cgst={G3.itc_eligible?.cgst} sgst={G3.itc_eligible?.sgst} igst={G3.itc_eligible?.igst} />
                  </tbody>
                </table>
              </Card>

              <Card title="ITC Reversals — Table 4B" accent="#f87171">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['Reason', 'CGST', 'SGST', 'IGST']} />
                  <tbody>
                    <TaxRow label="4B(1) — Purchase returns (credit notes)" cgst={G3.itc_reversal_purchase_returns?.cgst} sgst={G3.itc_reversal_purchase_returns?.sgst} igst={G3.itc_reversal_purchase_returns?.igst} />
                    <TaxRow label="4B(2) — Stock write-offs Sec 17(5)(h)" cgst={G3.itc_reversal_write_offs?.cgst} sgst={G3.itc_reversal_write_offs?.sgst} igst={G3.itc_reversal_write_offs?.igst} />
                  </tbody>
                </table>
              </Card>

              <Card title="Net Tax Liability" accent="var(--accent-green)" badge="To Pay">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['Head', 'CGST', 'SGST', 'IGST']} />
                  <tbody>
                    <TaxRow label="Net Payable" bold cgst={G3.net_liability?.cgst} sgst={G3.net_liability?.sgst} igst={G3.net_liability?.igst} />
                  </tbody>
                </table>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '10px', lineHeight: 1.5 }}>
                  = Outward tax  −  Eligible ITC  +  ITC reversals.
                  File this in GSTR-3B Table 3.1 and Table 4.
                </p>
              </Card>
            </div>
          )}

          {/* ── B2B Invoices Tab ── */}
          {tab === 'b2b' && (
            <Card title="B2B Tax Invoices — GSTR-1 Table 4" badge={G1.b2b_invoices?.length} accent="var(--accent-blue)">
              {G1.b2b_invoices?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No B2B invoices in this period.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <TableHead cols={['Invoice No.', 'Date', 'Buyer', 'GSTIN', 'POS', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total']} />
                    <tbody>
                      {G1.b2b_invoices?.map((inv, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '11px' }}>{inv.invoice_number || '—'}</td>
                          <td style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>{inv.invoice_date}</td>
                          <td style={{ padding: '8px 4px', color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.buyer_name}</td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{inv.buyer_gstin}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>{inv.place_of_supply}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(inv.taxable_value)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(inv.cgst)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(inv.sgst)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-amber)' }}>{fmt(inv.igst)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-green)', fontWeight: 600 }}>{fmt(inv.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {/* ── B2C Summary Tab ── */}
          {tab === 'b2c' && (
            <Card title="B2C Consolidated — GSTR-1 Table 7" accent="var(--accent-green)">
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                B2C retail sales are reported as consolidated totals per GST rate. Net of returns.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <TableHead cols={['GST Rate', 'Taxable Value', 'CGST', 'SGST', 'IGST']} />
                <tbody>
                  {G1.b2c_summary?.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 4px', color: 'var(--text-primary)', fontWeight: 600 }}>{parseFloat(r.gst_rate)}%</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(r.taxable_value)}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(r.cgst)}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(r.sgst)}</td>
                      <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-amber)' }}>{fmt(r.igst)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '10px 14px' }}>
                ⚠️  B2C returns net: <strong>{fmt(G1.credit_notes_b2c_net?.refund_amount)}</strong> &nbsp;·&nbsp;
                CGST reduced: <strong>{fmt(G1.credit_notes_b2c_net?.cgst)}</strong> &nbsp;·&nbsp;
                SGST reduced: <strong>{fmt(G1.credit_notes_b2c_net?.sgst)}</strong>
              </div>
            </Card>
          )}

          {/* ── HSN Summary Tab ── */}
          {tab === 'hsn' && (
            <Card title="HSN Summary — GSTR-1 Table 12" badge={G1.hsn_summary?.length} accent="var(--accent-amber)">
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Mandatory for B2B supplies. 4-digit HSN required if turnover ≤ ₹5 Cr; 6-digit if above.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <TableHead cols={['HSN Code', 'Description', 'UQC', 'Qty', 'GST%', 'Taxable', 'CGST', 'SGST', 'IGST']} />
                  <tbody>
                    {G1.hsn_summary?.map((h, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontSize: '11px' }}>{h.hsn_code}</td>
                        <td style={{ padding: '8px 4px', color: 'var(--text-primary)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.description}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px' }}>{h.uqc}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{h.total_qty.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'center', color: 'var(--text-muted)' }}>{parseFloat(h.gst_rate)}%</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>{fmt(h.taxable_value)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(h.cgst)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(h.sgst)}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-amber)' }}>{fmt(h.igst)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ── Returns Tab ── */}
          {tab === 'returns' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card title="B2B Credit Notes — GSTR-1 Table 9B (Registered)" badge={G1.credit_notes_b2b?.length} accent="#f87171">
                {G1.credit_notes_b2b?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No B2B credit notes in this period.</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <TableHead cols={['Credit Note No.', 'Date', 'Orig. Invoice', 'Buyer GSTIN', 'Refund', 'CGST', 'SGST', 'IGST', 'Reason']} />
                    <tbody>
                      {G1.credit_notes_b2b?.map((cn, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#f87171' }}>{cn.credit_note_number || '(not set)'}</td>
                          <td style={{ padding: '8px 4px', color: 'var(--text-muted)' }}>{cn.credit_note_date}</td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-green)' }}>{cn.original_invoice_no || '—'}</td>
                          <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-secondary)' }}>{cn.buyer_gstin}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: '#f87171', fontWeight: 600 }}>{fmt(cn.refund_amount)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(cn.cgst)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-blue)' }}>{fmt(cn.sgst)}</td>
                          <td style={{ padding: '8px 4px', textAlign: 'right', color: 'var(--accent-amber)' }}>{fmt(cn.igst)}</td>
                          <td style={{ padding: '8px 4px', color: 'var(--text-muted)', fontSize: '11px' }}>{cn.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Card>

              <Card title="Purchase Returns to Supplier (Without Credit Note)" accent="var(--accent-amber)">
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Treated as fresh outward supply — must be declared in GSTR-1. Get credit notes from supplier to avoid double GST.
                </p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Total Value', val: G1.purchase_returns_fresh_supply?.total },
                    { label: 'CGST',        val: G1.purchase_returns_fresh_supply?.cgst, blue: true },
                    { label: 'SGST',        val: G1.purchase_returns_fresh_supply?.sgst, blue: true },
                    { label: 'IGST',        val: G1.purchase_returns_fresh_supply?.igst, amber: true },
                  ].map(c => (
                    <div key={c.label}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: c.blue ? 'var(--accent-blue)' : c.amber ? 'var(--accent-amber)' : 'var(--accent-green)' }}>{fmt(c.val)}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Stock Write-offs — GSTR-3B ITC Reversal Sec 17(5)(h)" accent="var(--accent-amber)">
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  ITC must be reversed for all lost, damaged, expired, or stolen stock. Report in GSTR-3B Table 4(B)(2).
                </p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Total Tax Value', val: G3.itc_reversal_write_offs?.total },
                    { label: 'CGST Reversal',   val: G3.itc_reversal_write_offs?.cgst, blue: true },
                    { label: 'SGST Reversal',   val: G3.itc_reversal_write_offs?.sgst, blue: true },
                    { label: 'IGST Reversal',   val: G3.itc_reversal_write_offs?.igst, amber: true },
                  ].map(c => (
                    <div key={c.label}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', textTransform: 'uppercase', fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: c.blue ? 'var(--accent-blue)' : c.amber ? 'var(--accent-amber)' : '#f87171' }}>{fmt(c.val)}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
