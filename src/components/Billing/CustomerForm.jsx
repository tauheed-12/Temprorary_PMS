import { useState, useEffect, useRef } from "react";
import { searchCustomers, searchB2BCustomers, createCustomer } from "../../api/billing";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fWrap = { display: "flex", flexDirection: "column", gap: "5px" };
const row2  = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" };
const lStyle = {
  fontSize: "9px",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
};
const iStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};
const iRequired = {
  ...iStyle,
  borderColor: "rgba(239,68,68,0.5)",
};

function Label({ children, required }) {
  return (
    <label style={{ ...lStyle, color: required ? "#ef4444" : undefined }}>
      {children}{required ? " *" : ""}
    </label>
  );
}

// ── New Customer Modal ────────────────────────────────────────────────────────
function NewCustomerModal({ mode, onClose, onCreated }) {
  const isB2B = mode === "B2B";
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "",
    gstin: "", drug_license_no: "", credit_limit: "",
    customer_type: mode,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name.trim()) { setErr("Name is required."); return; }
    if (!form.phone.trim()) { setErr("Phone is required."); return; }
    if (isB2B && !form.gstin.trim()) { setErr("GSTIN is required for B2B customers."); return; }
    if (isB2B && !form.drug_license_no.trim()) { setErr("Drug License No. is required for B2B customers."); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        gstin: isB2B ? (form.gstin.trim() || undefined) : undefined,
        drug_license_no: isB2B ? (form.drug_license_no.trim() || undefined) : undefined,
        credit_limit: form.credit_limit ? parseFloat(form.credit_limit).toFixed(2) : "0.00",
        customer_type: mode,
      };
      const res = await createCustomer(payload);
      onCreated(res.data);
    } catch (err) {
      const d = err.response?.data;
      if (d?.phone) setErr(`Phone: ${d.phone[0]}`);
      else if (typeof d === "object") setErr(Object.values(d).flat().join(" | "));
      else setErr("Failed to create customer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", padding: "24px", width: "100%",
        maxWidth: "440px", display: "flex", flexDirection: "column", gap: "14px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em" }}>
            {isB2B ? "🏢 NEW B2B CUSTOMER" : "👤 REGISTER PATIENT"}
          </span>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "18px", cursor: "pointer" }}>×</button>
        </div>

        {err && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "var(--radius-sm)", padding: "8px 12px", fontSize: "11px", color: "#ef4444", fontFamily: "var(--font-mono)" }}>
            {err}
          </div>
        )}

        <div style={row2}>
          <div style={fWrap}>
            <Label required>{isB2B ? "BUSINESS NAME" : "FULL NAME"}</Label>
            <input value={form.name} onChange={set("name")} placeholder={isB2B ? "Sunrise Pharma" : "Patient name"} style={iStyle} />
          </div>
          <div style={fWrap}>
            <Label required>PHONE</Label>
            <input value={form.phone} onChange={set("phone")} placeholder="10-digit mobile" type="tel" style={iStyle} />
          </div>
        </div>

        <div style={fWrap}>
          <Label>EMAIL</Label>
          <input value={form.email} onChange={set("email")} placeholder="Optional" type="email" style={iStyle} />
        </div>

        <div style={fWrap}>
          <Label required={!isB2B}>{isB2B ? "REGISTERED ADDRESS" : "RESIDENTIAL ADDRESS"}</Label>
          <input value={form.address} onChange={set("address")} placeholder="Full address" style={iStyle} />
        </div>

        {isB2B && (
          <>
            <div style={row2}>
              <div style={fWrap}>
                <Label required>GSTIN</Label>
                <input value={form.gstin} onChange={set("gstin")} placeholder="27AABCU1234A1Z5" style={iStyle} />
              </div>
              <div style={fWrap}>
                <Label required>DRUG LICENSE NO.</Label>
                <input value={form.drug_license_no} onChange={set("drug_license_no")} placeholder="MH-MUM-123456" style={iStyle} />
              </div>
            </div>
            <div style={fWrap}>
              <Label>CREDIT LIMIT (₹)</Label>
              <input value={form.credit_limit} onChange={set("credit_limit")} placeholder="0.00" type="number" step="0.01" min="0" style={iStyle} />
            </div>
          </>
        )}

        {!isB2B && (
          <div style={fWrap}>
            <Label>CREDIT LIMIT (₹)</Label>
            <input value={form.credit_limit} onChange={set("credit_limit")} placeholder="0.00" type="number" step="0.01" min="0" style={iStyle} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "4px" }}>
          <button type="button" onClick={onClose}
            style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-secondary)", padding: "8px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
            CANCEL
          </button>
          <button type="submit" disabled={saving}
            style={{ background: "var(--accent-green)", color: "#000", border: "none", padding: "8px 20px", borderRadius: "var(--radius-sm)", cursor: saving ? "not-allowed" : "pointer", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
            {saving ? "SAVING..." : "REGISTER"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── B2B Customer Search Panel ─────────────────────────────────────────────────
function B2BPanel({
  customerId, setCustomerId,
  customerPhone, setCustomerPhone,
  customerName, setCustomerName,
  selectedCustomer, setSelectedCustomer,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (selectedCustomer) return;
    if (query.trim().length < 2) { setResults([]); setShowDrop(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchB2BCustomers(query.trim());
        setResults(res.data?.results || res.data || []);
        setShowDrop(true);
      } catch { setResults([]); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedCustomer]);

  const handleSelect = (cust) => {
    setSelectedCustomer(cust);
    setCustomerId(cust.id);
    setCustomerPhone(cust.phone);
    setCustomerName(cust.name);
    setQuery("");
    setShowDrop(false);
    setResults([]);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setCustomerId(null);
    setCustomerPhone("");
    setCustomerName("");
  };

  const handleCreated = (cust) => {
    setShowModal(false);
    handleSelect(cust);
  };

  const outstanding = parseFloat(selectedCustomer?.outstanding_balance || 0);

  return (
    <>
      {showModal && (
        <NewCustomerModal mode="B2B" onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {selectedCustomer ? (
        <div style={{
          background: "var(--bg-secondary)", border: "1px solid var(--accent-green)",
          borderRadius: "var(--radius-md)", padding: "12px 14px",
          position: "relative",
        }}>
          <button onClick={handleClear} title="Clear" style={{
            position: "absolute", top: "8px", right: "10px", background: "none",
            border: "none", color: "var(--text-muted)", fontSize: "14px", cursor: "pointer",
          }}>×</button>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
              {selectedCustomer.name}
            </span>
            <span style={{
              fontSize: "9px", fontFamily: "var(--font-mono)", letterSpacing: "0.08em",
              background: "rgba(59,130,246,0.15)", color: "var(--accent-blue)",
              border: "1px solid rgba(59,130,246,0.3)", borderRadius: "3px", padding: "1px 5px",
            }}>B2B</span>
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "3px" }}>
            <span>📞 {selectedCustomer.phone}</span>
            {selectedCustomer.gstin && <span>GST: {selectedCustomer.gstin}</span>}
            {selectedCustomer.drug_license_no && (
              <span style={{ color: "var(--accent-amber)", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                DL: {selectedCustomer.drug_license_no}
              </span>
            )}
            {selectedCustomer.address && <span>📍 {selectedCustomer.address}</span>}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--border)" }}>
            <div>
              <div style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>CREDIT LIMIT</div>
              <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                ₹{parseFloat(selectedCustomer.credit_limit || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", letterSpacing: "0.08em" }}>OUTSTANDING</div>
              <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: outstanding > 0 ? "var(--accent-red)" : "var(--accent-green)", fontWeight: 700 }}>
                ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                {outstanding > 0 && " ⚠"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              onBlur={() => setTimeout(() => setShowDrop(false), 200)}
              onFocus={() => results.length > 0 && setShowDrop(true)}
              placeholder="Search by name or phone..."
              style={{ ...iStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => setShowModal(true)}
              title="Register new B2B customer"
              style={{
                background: "var(--accent-green)", color: "#000", border: "none",
                borderRadius: "var(--radius-sm)", padding: "0 12px",
                fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 700,
                cursor: "pointer", flexShrink: 0,
              }}
            >+</button>
          </div>
          {showDrop && results.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", zIndex: 50, marginTop: "4px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)", maxHeight: "200px", overflowY: "auto",
            }}>
              {results.map((cust) => (
                <div key={cust.id} onMouseDown={() => handleSelect(cust)} style={{
                  padding: "10px 12px", borderBottom: "1px solid var(--border)",
                  cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>{cust.name}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                      {cust.phone}{cust.gstin ? ` · ${cust.gstin}` : ""}
                    </div>
                  </div>
                  {parseFloat(cust.outstanding_balance) > 0 && (
                    <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-red)" }}>
                      ₹{parseFloat(cust.outstanding_balance).toFixed(0)} ⚠
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
          {showDrop && results.length === 0 && query.trim().length >= 2 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0,
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)", zIndex: 50, marginTop: "4px", padding: "10px 12px",
            }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                No B2B customers found. <button type="button" onMouseDown={() => setShowModal(true)}
                  style={{ background: "none", border: "none", color: "var(--accent-green)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700 }}>
                  Register new?
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ── B2C Panel ─────────────────────────────────────────────────────────────────
function B2CPanel({
  customerId, setCustomerId,
  customerPhone, setCustomerPhone,
  customerName, setCustomerName,
  buyerAddress, setBuyerAddress,
  prescriberName, setPrescriberName,
  prescriberRegNo, setPrescriberRegNo,
  needsPrescriber, needsFullLegal,
  patientHistory, historyOpen, setHistoryOpen,
  repeatLoading, handleRepeat,
  customerPhoneRef,
  paymentMode,
}) {
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const debounceRef = useRef(null);

  // Autocomplete for existing B2C customer lookup
  useEffect(() => {
    if (customerId) return;
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 3) { setSearchResults([]); setShowDropdown(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchCustomers(digits);
        const list = res.data?.results || res.data || [];
        setSearchResults(list);
        setShowDropdown(list.length > 0);
      } catch { setSearchResults([]); }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [customerPhone, customerId]);

  const handleSelectCustomer = (cust) => {
    setCustomerId(cust.id);
    setCustomerPhone(cust.phone || "");
    setCustomerName(cust.name || "");
    setShowDropdown(false);
  };

  const handleCreated = (cust) => {
    setShowModal(false);
    handleSelectCustomer(cust);
  };

  const needsCredit = paymentMode === "CREDIT" && !customerId;

  return (
    <>
      {showModal && (
        <NewCustomerModal mode="B2C" onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {/* Phone */}
      <div style={{ ...fWrap, position: "relative" }}>
        <Label required>PATIENT PHONE</Label>
        <input
          ref={customerPhoneRef}
          value={customerPhone}
          onChange={(e) => { setCustomerPhone(e.target.value); if (customerId) setCustomerId(null); }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          placeholder="10-digit mobile"
          type="tel"
          style={{ ...iStyle, borderColor: customerId ? "var(--accent-green)" : "rgba(239,68,68,0.4)" }}
        />
        {showDropdown && searchResults.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", zIndex: 50, marginTop: "4px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.4)", maxHeight: "150px", overflowY: "auto",
          }}>
            {searchResults.map((cust) => (
              <div key={cust.id} onMouseDown={() => handleSelectCustomer(cust)} style={{
                padding: "8px 10px", borderBottom: "1px solid var(--border)",
                cursor: "pointer", fontSize: "11px", display: "flex", justifyContent: "space-between",
              }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>{cust.phone}</span>
                <span style={{ color: "var(--text-muted)" }}>{cust.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div style={fWrap}>
        <Label required>PATIENT NAME</Label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Full name"
          style={{ ...iStyle, borderColor: !customerName.trim() ? "rgba(239,68,68,0.4)" : "var(--border)" }}
        />
      </div>

      {/* History repeat panel (unchanged) */}
      {patientHistory !== null && (
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
          <button onClick={() => setHistoryOpen((o) => !o)} style={{
            width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "var(--bg-secondary)", border: "none", padding: "7px 10px", cursor: "pointer",
            fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--text-secondary)", letterSpacing: "0.08em",
          }}>
            <span>LAST VISITS {patientHistory.length > 0 ? `(${patientHistory.length})` : ""}</span>
            <span>{historyOpen ? "▾" : "▸"}</span>
          </button>
          {historyOpen && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {patientHistory.length === 0 ? (
                <div style={{ padding: "10px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
                  No previous visits
                </div>
              ) : (
                patientHistory.map((bill) => {
                  const names = (bill.items_snapshot || []).filter(i => !i._bill_meta).map((i) => i.medicine_name).join(", ");
                  const date = new Date(bill.bill_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" });
                  return (
                    <div key={bill.id} style={{ padding: "8px 10px", borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                            {date} · <span style={{ color: "var(--accent-green)" }}>₹{parseFloat(bill.grand_total).toFixed(2)}</span>
                          </div>
                          <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {names}
                          </div>
                        </div>
                        <button onClick={() => handleRepeat(bill)} disabled={repeatLoading} style={{
                          flexShrink: 0, background: "transparent", border: "1px solid var(--accent-blue)",
                          color: "var(--accent-blue)", borderRadius: "var(--radius-sm)", padding: "4px 8px",
                          fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: "700", letterSpacing: "0.06em",
                          cursor: repeatLoading ? "not-allowed" : "pointer", opacity: repeatLoading ? 0.5 : 1,
                        }}>
                          {repeatLoading ? "..." : "REPEAT"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Schedule-based legal fields */}
      {needsPrescriber && (
        <>
          <div style={{
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: "var(--radius-sm)", padding: "7px 12px",
            fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--accent-amber)", letterSpacing: "0.04em",
          }}>
            {needsFullLegal
              ? "SCHEDULE H1/X/NARCOTIC — Prescriber name, address & reg. no. required by law"
              : "SCHEDULE H — Prescribing doctor's name required by law"}
          </div>

          <div style={fWrap}>
            <Label required>PRESCRIBING DOCTOR</Label>
            <input
              value={prescriberName}
              onChange={(e) => setPrescriberName(e.target.value)}
              placeholder="Dr. Full Name"
              style={{ ...iStyle, borderColor: !prescriberName.trim() ? "rgba(239,68,68,0.5)" : "var(--border)" }}
            />
          </div>

          {needsFullLegal && (
            <>
              <div style={fWrap}>
                <Label required>PATIENT ADDRESS</Label>
                <input
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  placeholder="Residential address"
                  style={{ ...iStyle, borderColor: !buyerAddress.trim() ? "rgba(239,68,68,0.5)" : "var(--border)" }}
                />
              </div>
              <div style={fWrap}>
                <Label required>DOCTOR / CLINIC REG. NO.</Label>
                <input
                  value={prescriberRegNo}
                  onChange={(e) => setPrescriberRegNo(e.target.value)}
                  placeholder="MCI/State Medical Council reg. no."
                  style={{ ...iStyle, borderColor: !prescriberRegNo.trim() ? "rgba(239,68,68,0.5)" : "var(--border)" }}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Credit mode: patient registration prompt */}
      {needsCredit && (
        <div style={{
          background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)",
          borderRadius: "var(--radius-sm)", padding: "10px 12px",
          display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
        }}>
          <span style={{ fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", letterSpacing: "0.04em" }}>
            CREDIT sale requires a registered patient profile for ledger tracking
          </span>
          <button type="button" onClick={() => setShowModal(true)} style={{
            background: "var(--accent-blue)", color: "#fff", border: "none",
            borderRadius: "var(--radius-sm)", padding: "5px 10px",
            fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700,
            letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
          }}>
            REGISTER +
          </button>
        </div>
      )}
    </>
  );
}

// ── Main CustomerForm ─────────────────────────────────────────────────────────
export default function CustomerForm({
  saleMode, setSaleMode,
  customerId, setCustomerId,
  customerPhone, setCustomerPhone,
  customerName, setCustomerName,
  buyerAddress, setBuyerAddress,
  prescriberName, setPrescriberName,
  prescriberRegNo, setPrescriberRegNo,
  needsPrescriber, needsFullLegal,
  paymentMode,
  patientHistory, historyOpen, setHistoryOpen,
  repeatLoading, handleRepeat,
  customerPhoneRef,
  // B2B
  selectedCustomer, setSelectedCustomer,
}) {
  const isB2B = saleMode === "B2B";

  const handleModeSwitch = (newMode) => {
    if (newMode === saleMode) return;
    setSaleMode(newMode);
    // Reset all customer fields on mode switch
    setCustomerId(null);
    setCustomerPhone("");
    setCustomerName("");
    setBuyerAddress("");
    setPrescriberName("");
    setPrescriberRegNo("");
    if (setSelectedCustomer) setSelectedCustomer(null);
  };

  return (
    <div style={{
      background: "var(--bg-card)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-md)", padding: "1.25rem",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      {/* ── Mode Toggle ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}>
          CUSTOMER DETAILS
        </span>
        <div style={{
          display: "flex", background: "var(--bg-secondary)",
          border: "1px solid var(--border)", borderRadius: "20px", padding: "2px",
        }}>
          {["B2C", "B2B"].map((m) => (
            <button
              key={m} type="button"
              onClick={() => handleModeSwitch(m)}
              style={{
                padding: "4px 14px", borderRadius: "16px", border: "none",
                fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.08em", cursor: "pointer", transition: "all 0.15s",
                background: saleMode === m ? (m === "B2B" ? "var(--accent-blue)" : "var(--accent-green)") : "transparent",
                color: saleMode === m ? (m === "B2B" ? "#fff" : "#000") : "var(--text-muted)",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mode-specific panel ── */}
      {isB2B ? (
        <>
          <div style={{ fontSize: "9px", fontFamily: "var(--font-mono)", color: "var(--accent-blue)", letterSpacing: "0.06em" }}>
            🏢 B2B WHOLESALE — Customer registration mandatory
          </div>
          <B2BPanel
            customerId={customerId} setCustomerId={setCustomerId}
            customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
            customerName={customerName} setCustomerName={setCustomerName}
            selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer}
          />
        </>
      ) : (
        <B2CPanel
          customerId={customerId} setCustomerId={setCustomerId}
          customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
          customerName={customerName} setCustomerName={setCustomerName}
          buyerAddress={buyerAddress} setBuyerAddress={setBuyerAddress}
          prescriberName={prescriberName} setPrescriberName={setPrescriberName}
          prescriberRegNo={prescriberRegNo} setPrescriberRegNo={setPrescriberRegNo}
          needsPrescriber={needsPrescriber} needsFullLegal={needsFullLegal}
          patientHistory={patientHistory} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen}
          repeatLoading={repeatLoading} handleRepeat={handleRepeat}
          customerPhoneRef={customerPhoneRef}
          paymentMode={paymentMode}
        />
      )}
    </div>
  );
}
