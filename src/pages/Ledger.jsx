import { useState, useEffect, useCallback } from "react";
import {
  getLedgerCustomers, submitPayment, getCustomerLedger, getCashBook, getSalesHistory,
} from "../api/billing";
import {
  getSuppliersWithBalance, submitSupplierPayment, getSupplierLedger,
} from "../api/inventory";

// ── shared styles ────────────────────────────────────────────────────────────
const mono = { fontFamily: "var(--font-mono)" };
const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
};
const pill = (active) => ({
  ...mono,
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.06em",
  padding: "7px 18px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid",
  cursor: "pointer",
  background: active ? "var(--accent-green)" : "transparent",
  borderColor: active ? "var(--accent-green)" : "var(--border)",
  color: active ? "#000" : "var(--text-muted)",
  transition: "all 0.15s",
});
const th = {
  padding: "10px 14px",
  fontWeight: "normal",
  fontSize: "10px",
  color: "var(--text-secondary)",
  background: "var(--bg-secondary)",
  borderBottom: "1px solid var(--border)",
  ...mono,
};
const td = (right) => ({
  padding: "11px 14px",
  fontSize: "13px",
  color: "var(--text-primary)",
  borderBottom: "1px solid var(--border)",
  textAlign: right ? "right" : "left",
});
const inputStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  padding: "9px 10px",
  borderRadius: "4px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const labelStyle = {
  fontSize: "10px",
  color: "var(--text-secondary)",
  letterSpacing: "0.06em",
  ...mono,
};

// ── PaymentModal (shared for customer & supplier) ────────────────────────────
function PaymentModal({ title, outstanding, bills, onSubmit, onClose, submitting, modes }) {
  const [amount, setAmount]       = useState(outstanding.toFixed(2));
  const [mode, setMode]           = useState(modes[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes]         = useState("");
  const [billId, setBillId]       = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ amount: parseFloat(amount).toFixed(2), mode, reference: reference || undefined, notes: notes || undefined, billId: billId || undefined });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ ...card, padding: "24px", width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <h2 style={{ ...mono, fontSize: "15px", fontWeight: 600, margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
          <span style={{ ...labelStyle }}>TOTAL OUTSTANDING</span>
          <span style={{ ...mono, fontSize: "18px", color: "var(--accent-red)", fontWeight: 700 }}>₹{outstanding.toFixed(2)}</span>
        </div>

        {/* Invoice picker — only shown when bills are provided */}
        {bills && bills.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>APPLY TO INVOICE (leave blank for FIFO)</label>
            <select value={billId} onChange={(e) => {
              setBillId(e.target.value);
              if (e.target.value) {
                const b = bills.find(b => b.id === e.target.value);
                if (b) setAmount((b.grand_total - b.amount_paid).toFixed(2));
              } else {
                setAmount(outstanding.toFixed(2));
              }
            }} style={inputStyle}>
              <option value="">— Auto FIFO (oldest first) —</option>
              {bills.map(b => (
                <option key={b.id} value={b.id}>
                  {b.invoice_number} · ₹{(b.grand_total - b.amount_paid).toFixed(2)} due
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>AMOUNT (₹) *</label>
          <input
            type="number" step="0.01" min="0.01"
            max={billId ? undefined : outstanding.toFixed(2)}
            required value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>MODE *</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)} style={inputStyle}>
              {modes.map(m => <option key={m} value={m}>{m.replace("_", " ")}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={labelStyle}>REFERENCE #</label>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UTR / Cheque no." style={inputStyle} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={labelStyle}>NOTES</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" style={inputStyle} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
          <button type="button" onClick={onClose} style={{ ...mono, background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>CANCEL</button>
          <button type="submit" disabled={submitting} style={{ ...mono, background: "var(--accent-green)", color: "#000", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 700 }}>
            {submitting ? "PROCESSING..." : "PROCESS PAYMENT"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── LedgerDrawer — full statement for one customer/supplier ──────────────────
function LedgerDrawer({ title, entries, loading, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ width: "min(600px, 100vw)", height: "100vh", background: "var(--bg-card)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ ...mono, fontWeight: 600, fontSize: "14px" }}>{title} — STATEMENT</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "20px", lineHeight: 1 }}>×</button>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>LOADING...</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>No entries found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
              <thead>
                <tr>
                  <th style={th}>DATE</th>
                  <th style={th}>TYPE</th>
                  <th style={th}>NARRATION</th>
                  <th style={{ ...th, textAlign: "right" }}>DEBIT</th>
                  <th style={{ ...th, textAlign: "right" }}>CREDIT</th>
                  <th style={{ ...th, textAlign: "right" }}>BALANCE</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id}>
                    <td style={td()}>{e.entry_date}</td>
                    <td style={td()}>
                      <span style={{ ...mono, fontSize: "10px", padding: "2px 6px", borderRadius: "3px", background: "var(--bg-secondary)", color: "var(--text-secondary)" }}>
                        {e.entry_type}
                      </span>
                    </td>
                    <td style={{ ...td(), color: "var(--text-secondary)", fontSize: "11px", maxWidth: "180px" }}>{e.narration || e.reference_number}</td>
                    <td style={{ ...td(true), color: parseFloat(e.debit) > 0 ? "var(--accent-red)" : "var(--text-muted)", ...mono }}>
                      {parseFloat(e.debit) > 0 ? `₹${parseFloat(e.debit).toFixed(2)}` : "—"}
                    </td>
                    <td style={{ ...td(true), color: parseFloat(e.credit) > 0 ? "var(--accent-green)" : "var(--text-muted)", ...mono }}>
                      {parseFloat(e.credit) > 0 ? `₹${parseFloat(e.credit).toFixed(2)}` : "—"}
                    </td>
                    <td style={{ ...td(true), ...mono, fontWeight: 600, color: parseFloat(e.balance_after) > 0 ? "var(--accent-amber)" : "var(--text-primary)" }}>
                      ₹{parseFloat(e.balance_after).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── CustomerTab (shared for B2C and B2B) ─────────────────────────────────────
function CustomerTab({ type }) {
  const [customers, setCustomers]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [modal, setModal]               = useState(null);   // { customer, bills }
  const [drawer, setDrawer]             = useState(null);   // { customer, entries }
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getLedgerCustomers(type);
      setCustomers(res.data.results || res.data || []);
    } catch {
      setError("Failed to load.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { fetch(); }, [fetch]);

  const openModal = async (cust) => {
    // Fetch unpaid bills for this customer so owner can target a specific one
    let bills = [];
    try {
      const res = await getSalesHistory({ customer_phone: cust.phone });
      const all = res.data.results || res.data || [];
      bills = all.filter(b => b.payment_status !== "PAID");
    } catch { /* non-critical — FIFO still works without it */ }
    setModal({ customer: cust, bills });
  };

  const openDrawer = async (cust) => {
    setDrawer({ customer: cust, entries: [] });
    setDrawerLoading(true);
    try {
      const res = await getCustomerLedger(cust.id);
      setDrawer({ customer: cust, entries: res.data.results || res.data || [] });
    } catch {
      setDrawer({ customer: cust, entries: [] });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handlePayment = async ({ amount, mode, reference, notes, billId }) => {
    setSubmitting(true);
    try {
      await submitPayment({
        customer: modal.customer.id,
        amount,
        payment_mode: mode,
        reference_number: reference,
        notes,
        ...(billId ? { bill_id: billId } : {}),
      });
      setModal(null);
      fetch();
    } catch (err) {
      const msg = err.response?.data;
      alert(typeof msg === "object" ? JSON.stringify(msg) : "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const label = type === "B2B" ? "Wholesale / Clinic" : "Retail / Walk-in";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: "11px", color: "var(--text-muted)" }}>{label} — customers with outstanding balance</span>
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>LOADING...</div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--accent-red)", ...mono }}>{error}</div>
        ) : customers.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>No outstanding balances.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>NAME</th>
                <th style={th}>PHONE</th>
                {type === "B2B" && <th style={th}>GSTIN</th>}
                <th style={{ ...th, textAlign: "right" }}>OUTSTANDING (₹)</th>
                <th style={{ ...th, textAlign: "right" }}>CREDIT LIMIT (₹)</th>
                <th style={{ ...th, textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={td()}>{c.name}</td>
                  <td style={{ ...td(), color: "var(--text-secondary)" }}>{c.phone}</td>
                  {type === "B2B" && <td style={{ ...td(), ...mono, fontSize: "11px", color: "var(--text-muted)" }}>{c.gstin || "—"}</td>}
                  <td style={{ ...td(true), ...mono, fontWeight: 700, color: "var(--accent-red)" }}>
                    ₹{parseFloat(c.outstanding_balance).toFixed(2)}
                  </td>
                  <td style={{ ...td(true), ...mono, color: "var(--text-secondary)" }}>
                    ₹{parseFloat(c.credit_limit).toFixed(2)}
                  </td>
                  <td style={{ ...td(), textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => openDrawer(c)} style={{ ...mono, background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                        STATEMENT
                      </button>
                      <button onClick={() => openModal(c)} style={{ ...mono, background: "none", border: "1px solid var(--accent-blue)", color: "var(--accent-blue)", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                        LOG PAYMENT
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <PaymentModal
          title={`RECEIPT — ${modal.customer.name}`}
          outstanding={parseFloat(modal.customer.outstanding_balance)}
          bills={modal.bills}
          onSubmit={handlePayment}
          onClose={() => setModal(null)}
          submitting={submitting}
          modes={["UPI", "CASH", "CHEQUE", "BANK_TRANSFER"]}
        />
      )}

      {drawer && (
        <LedgerDrawer
          title={drawer.customer.name}
          entries={drawer.entries}
          loading={drawerLoading}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}

// ── SupplierTab ───────────────────────────────────────────────────────────────
function SupplierTab() {
  const [suppliers, setSuppliers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [modal, setModal]                 = useState(null);
  const [drawer, setDrawer]               = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [submitting, setSubmitting]       = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSuppliersWithBalance();
      const all = res.data.results || res.data || [];
      // show only those with outstanding balance > 0
      setSuppliers(all.filter(s => parseFloat(s.outstanding_balance) > 0));
    } catch {
      setError("Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openDrawer = async (s) => {
    setDrawer({ supplier: s, entries: [] });
    setDrawerLoading(true);
    try {
      const res = await getSupplierLedger(s.id);
      setDrawer({ supplier: s, entries: res.data.results || res.data || [] });
    } catch {
      setDrawer({ supplier: s, entries: [] });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handlePayment = async ({ amount, mode, reference, notes }) => {
    setSubmitting(true);
    try {
      await submitSupplierPayment(modal.supplier.id, {
        supplier: modal.supplier.id,
        amount,
        payment_mode: mode,
        reference_number: reference,
        notes,
      });
      setModal(null);
      fetch();
    } catch (err) {
      const msg = err.response?.data;
      alert(typeof msg === "object" ? JSON.stringify(msg) : "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
        <span style={{ ...mono, fontSize: "11px", color: "var(--text-muted)" }}>Suppliers with outstanding payable balance</span>
      </div>

      <div style={card}>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>LOADING...</div>
        ) : error ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--accent-red)", ...mono }}>{error}</div>
        ) : suppliers.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>No outstanding payables.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>SUPPLIER</th>
                <th style={th}>PHONE</th>
                <th style={th}>GSTIN</th>
                <th style={th}>STATE</th>
                <th style={{ ...th, textAlign: "right" }}>PAYABLE (₹)</th>
                <th style={{ ...th, textAlign: "center" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td style={td()}>{s.name}</td>
                  <td style={{ ...td(), color: "var(--text-secondary)" }}>{s.phone || "—"}</td>
                  <td style={{ ...td(), ...mono, fontSize: "11px", color: "var(--text-muted)" }}>{s.gstin || "—"}</td>
                  <td style={{ ...td(), color: "var(--text-secondary)" }}>{s.state || "—"}</td>
                  <td style={{ ...td(true), ...mono, fontWeight: 700, color: "var(--accent-amber)" }}>
                    ₹{parseFloat(s.outstanding_balance).toFixed(2)}
                  </td>
                  <td style={{ ...td(), textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button onClick={() => openDrawer(s)} style={{ ...mono, background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                        STATEMENT
                      </button>
                      <button onClick={() => setModal({ supplier: s })} style={{ ...mono, background: "none", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "4px 10px", borderRadius: "3px", cursor: "pointer", fontSize: "10px", fontWeight: 600 }}>
                        PAY SUPPLIER
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <PaymentModal
          title={`PAY — ${modal.supplier.name}`}
          outstanding={parseFloat(modal.supplier.outstanding_balance)}
          bills={null}
          onSubmit={handlePayment}
          onClose={() => setModal(null)}
          submitting={submitting}
          modes={["BANK_TRANSFER", "CHEQUE", "UPI", "CASH"]}
        />
      )}

      {drawer && (
        <LedgerDrawer
          title={drawer.supplier.name}
          entries={drawer.entries}
          loading={drawerLoading}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}

// ── SummaryTab ────────────────────────────────────────────────────────────────
function SummaryTab() {
  const [cashBook, setCashBook]   = useState(null);
  const [b2cCusts, setB2cCusts]  = useState([]);
  const [b2bCusts, setB2bCusts]  = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]     = useState(true);

  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([
      getCashBook({ from_date: firstOfMonth, to_date: todayStr }),
      getLedgerCustomers("B2C"),
      getLedgerCustomers("B2B"),
      getSuppliersWithBalance(),
    ]).then(([cb, b2c, b2b, sup]) => {
      setCashBook(cb.data);
      setB2cCusts(b2c.data.results || b2c.data || []);
      setB2bCusts(b2b.data.results || b2b.data || []);
      const all = sup.data.results || sup.data || [];
      setSuppliers(all.filter(s => parseFloat(s.outstanding_balance) > 0));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalReceivable = [...b2cCusts, ...b2bCusts].reduce(
    (s, c) => s + parseFloat(c.outstanding_balance), 0
  );
  const totalPayable = suppliers.reduce(
    (s, sup) => s + parseFloat(sup.outstanding_balance), 0
  );
  const netPosition = totalReceivable - totalPayable;

  const Metric = ({ label, value, color }) => (
    <div style={{ ...card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
      <span style={{ ...mono, fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>{label}</span>
      <span style={{ ...mono, fontSize: "22px", fontWeight: 700, color: color || "var(--text-primary)" }}>
        ₹{value.toFixed(2)}
      </span>
    </div>
  );

  if (loading) return <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", ...mono }}>LOADING...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Net position metrics */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Metric label="TOTAL RECEIVABLE (customers owe you)" value={totalReceivable} color="var(--accent-green)" />
        <Metric label="TOTAL PAYABLE (you owe suppliers)" value={totalPayable} color="var(--accent-red)" />
        <Metric label={`NET POSITION ${netPosition >= 0 ? "(you are owed)" : "(you owe)"}`} value={Math.abs(netPosition)} color={netPosition >= 0 ? "var(--accent-green)" : "var(--accent-amber)"} />
      </div>

      {/* Cash book — this month */}
      {cashBook && (
        <div style={card}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", ...mono, fontSize: "11px", color: "var(--text-secondary)", letterSpacing: "0.06em" }}>
            CASH BOOK — {cashBook.period?.label}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>MODE</th>
                <th style={{ ...th, textAlign: "right" }}>COLLECTED (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(cashBook.by_mode || []).map(row => (
                <tr key={row.mode}>
                  <td style={{ ...td(), ...mono, fontSize: "12px" }}>{row.mode.replace("_", " ")}</td>
                  <td style={{ ...td(true), ...mono, fontWeight: 600, color: "var(--accent-green)" }}>₹{parseFloat(row.total).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ background: "var(--bg-secondary)" }}>
                <td style={{ ...td(), ...mono, fontWeight: 700, fontSize: "12px" }}>TOTAL</td>
                <td style={{ ...td(true), ...mono, fontWeight: 700, fontSize: "14px", color: "var(--accent-green)" }}>
                  ₹{parseFloat(cashBook.grand_total || 0).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Top outstanding customers */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {[
          { title: "TOP B2C OUTSTANDING", list: [...b2cCusts].sort((a, b) => b.outstanding_balance - a.outstanding_balance).slice(0, 5) },
          { title: "TOP B2B OUTSTANDING", list: [...b2bCusts].sort((a, b) => b.outstanding_balance - a.outstanding_balance).slice(0, 5) },
          { title: "TOP SUPPLIER PAYABLES", list: [...suppliers].sort((a, b) => b.outstanding_balance - a.outstanding_balance).slice(0, 5) },
        ].map(({ title, list }) => (
          <div key={title} style={{ ...card, flex: 1, minWidth: "200px" }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", ...mono, fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>{title}</div>
            {list.length === 0 ? (
              <div style={{ padding: "14px", color: "var(--text-muted)", fontSize: "12px", textAlign: "center" }}>None</div>
            ) : list.map(item => (
              <div key={item.id} style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{item.name}</span>
                <span style={{ ...mono, fontSize: "12px", fontWeight: 600, color: title.includes("SUPPLIER") ? "var(--accent-amber)" : "var(--accent-red)" }}>
                  ₹{parseFloat(item.outstanding_balance).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Ledger Page ──────────────────────────────────────────────────────────
const TABS = [
  { key: "b2c",      label: "B2C CUSTOMERS" },
  { key: "b2b",      label: "B2B CUSTOMERS" },
  { key: "supplier", label: "SUPPLIERS" },
  { key: "summary",  label: "SUMMARY" },
];

export default function Ledger() {
  const [activeTab, setActiveTab] = useState("b2c");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h1 style={{ ...mono, fontSize: "20px", fontWeight: 600, color: "var(--text-primary)" }}>LEDGER</h1>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={pill(activeTab === t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "b2c"      && <CustomerTab type="B2C" />}
      {activeTab === "b2b"      && <CustomerTab type="B2B" />}
      {activeTab === "supplier" && <SupplierTab />}
      {activeTab === "summary"  && <SummaryTab />}
    </div>
  );
}
