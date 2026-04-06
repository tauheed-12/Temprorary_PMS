import { useState } from "react";
import api from "../../api/config";

export default function SupplierField({ suppliers, value, onSelect }) {
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    gstin: "",
    address: "",
  });

  const handleCreate = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const res = await api.post("/api/inventory/suppliers/", form);
      onSelect(res.data.id, res.data);
      setForm({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        gstin: "",
        address: "",
      });
      setShowNew(false);
    } catch (err) {
      alert(err.response?.data?.name?.[0] || "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        gridColumn: showNew ? "1 / -1" : undefined,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <label style={labelStyle}>SUPPLIER *</label>
        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          style={{
            fontSize: "10px",
            color: showNew ? "var(--text-muted)" : "var(--accent-blue)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.06em",
          }}
        >
          {showNew ? "✕ CANCEL" : "+ NEW SUPPLIER"}
        </button>
      </div>

      {!showNew ? (
        <select
          value={value}
          onChange={(e) => onSelect(e.target.value, null)}
          style={inputStyle}
          required
        >
          <option value="">Select supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      ) : (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent-blue)",
            borderRadius: "var(--radius-sm)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>SUPPLIER NAME *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sun Pharma Dist."
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>CONTACT PERSON</label>
              <input
                value={form.contact_person}
                onChange={(e) =>
                  setForm({ ...form, contact_person: e.target.value })
                }
                placeholder="Rep name"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>PHONE</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>EMAIL</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="orders@supplier.com"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>GSTIN</label>
              <input
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                placeholder="27AABCU9603R1ZX"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>ADDRESS</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="City, State"
                style={inputStyle}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !form.name}
            style={{
              ...submitBtn,
              fontSize: "11px",
              padding: "7px 16px",
              opacity: saving || !form.name ? 0.6 : 1,
            }}
          >
            {saving ? "SAVING..." : "CREATE & SELECT SUPPLIER"}
          </button>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  fontSize: "9px",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
};

const inputStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};
