import { useState, useEffect, useRef } from "react";
import { searchMedicinesAll, reactivateMedicine } from "../../api/inventory";
import api from "../../api/config";
import ConfirmModal from "./ConfirmModal";

export default function MedicineSearchField({ value, onSelect }) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(!!value);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inactiveModal, setInactiveModal] = useState({
    open: false,
    med: null,
  });
  const [newMed, setNewMed] = useState({
    name: "",
    company: "",
    category: "Tablet",
    pack_qty: 10,
    default_gst_percentage: "12.00",
    hsn_code: "",
    packaging: "",
    salt_name: "",
    barcode: "",
    drug_schedule: "GENERAL",
  });
  const ref = useRef(null);

  useEffect(() => {
    if (query.length < 2 || selected) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await searchMedicinesAll(query);
        const sorted = (res.data.results || [])
          .slice()
          .sort((a, b) => b.is_active - a.is_active);
        setResults(sorted);
        setOpen(true);
      } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [query, selected]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    setQuery(e.target.value);
    setSelected(false);
    setOpen(true);
    setShowNew(false);
  };

  const handleSelect = (med) => {
    onSelect(med);
    setQuery(`${med.name} — ${med.company}`);
    setSelected(true);
    setOpen(false);
    setShowNew(false);
  };

  const handleCreateMedicine = async () => {
    if (!newMed.name || !newMed.company) return;
    setSaving(true);
    try {
      const res = await api.post("/api/inventory/medicines/", newMed);
      handleSelect(res.data);
      setNewMed({
        name: "",
        company: "",
        category: "Tablet",
        pack_qty: 10,
        default_gst_percentage: "12.00",
        hsn_code: "",
        packaging: "",
        salt_name: "",
        barcode: "",
        drug_schedule: "GENERAL",
      });
    } catch (err) {
      alert(err.response?.data?.name?.[0] || "Failed to create medicine.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        gridColumn: showNew ? "1 / -1" : undefined,
      }}
    >
      <label style={labelStyle}>MEDICINE *</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder="Type to search medicine..."
          value={query}
          onChange={handleChange}
          style={{
            ...inputStyle,
            borderColor: selected ? "var(--accent-green)" : "var(--border)",
            paddingRight: selected ? "28px" : "10px",
          }}
        />
        {selected && (
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "var(--accent-green)",
            }}
          >
            ✓
          </span>
        )}
      </div>

      {/* Inactive medicine reactivate modal */}
      {inactiveModal.open && (
        <ConfirmModal
          message={`"${inactiveModal.med?.name}" is inactive. Reactivate it to use in purchase bills?`}
          onConfirm={async () => {
            try {
              await reactivateMedicine(inactiveModal.med.id);
              const reactivated = { ...inactiveModal.med, is_active: true };
              handleSelect(reactivated);
            } catch {
              alert("Failed to reactivate medicine.");
            }
            setInactiveModal({ open: false, med: null });
          }}
          onCancel={() => setInactiveModal({ open: false, med: null })}
        />
      )}

      {/* Search dropdown */}
      {open && !showNew && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            zIndex: 100,
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {results.map((med) => (
            <div
              key={med.id}
              onClick={() => {
                if (med.is_active) {
                  handleSelect(med);
                } else {
                  setOpen(false);
                  setInactiveModal({ open: true, med });
                }
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: "1px solid var(--border)",
                fontSize: "12px",
                color: med.is_active
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
                opacity: med.is_active ? 1 : 0.6,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <span>{med.name}</span>
                {med.packaging && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                      background: "var(--bg-secondary)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {med.packaging}
                  </span>
                )}
                {!med.is_active && (
                  <span
                    style={{
                      fontSize: "9px",
                      color: "var(--accent-red)",
                      fontFamily: "var(--font-mono)",
                      background: "rgba(239,68,68,0.1)",
                      padding: "1px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    INACTIVE
                  </span>
                )}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-secondary)" }}>
                {med.company} · GST {med.default_gst_percentage}%
              </div>
            </div>
          ))}
          {/* Not found option */}
          <div
            onClick={() => {
              setOpen(false);
              setShowNew(true);
            }}
            style={{
              padding: "9px 12px",
              cursor: "pointer",
              fontSize: "11px",
              color: "var(--accent-blue)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
              borderTop: results.length ? "1px solid var(--border)" : undefined,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            + Not found? Add new medicine
          </div>
        </div>
      )}

      {/* Inline new medicine form */}
      {showNew && (
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent-blue)",
            borderRadius: "var(--radius-sm)",
            padding: "1rem",
            marginTop: "4px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "var(--accent-blue)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
              }}
            >
              NEW MEDICINE
            </span>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              ×
            </button>
          </div>
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
              <label style={labelStyle}>MEDICINE NAME *</label>
              <input
                value={newMed.name}
                onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                placeholder="e.g. Dolo 650"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>COMPANY *</label>
              <input
                value={newMed.company}
                onChange={(e) =>
                  setNewMed({ ...newMed, company: e.target.value })
                }
                placeholder="e.g. Micro Labs"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>CATEGORY</label>
              <select
                value={newMed.category}
                onChange={(e) =>
                  setNewMed({ ...newMed, category: e.target.value })
                }
                style={inputStyle}
              >
                {[
                  "Tablet",
                  "Capsule",
                  "Syrup",
                  "Injection",
                  "Cream",
                  "Drops",
                  "Other",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>PACK QTY (tabs/strip)</label>
              <input
                type="number"
                value={newMed.pack_qty}
                onChange={(e) =>
                  setNewMed({ ...newMed, pack_qty: e.target.value })
                }
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>DEFAULT GST %</label>
              <input
                value={newMed.default_gst_percentage}
                onChange={(e) =>
                  setNewMed({
                    ...newMed,
                    default_gst_percentage: e.target.value,
                  })
                }
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>PACKAGING (e.g. 1x10)</label>
              <input
                value={newMed.packaging}
                onChange={(e) =>
                  setNewMed({ ...newMed, packaging: e.target.value })
                }
                placeholder="1x10"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>HSN CODE</label>
              <input
                value={newMed.hsn_code}
                onChange={(e) =>
                  setNewMed({ ...newMed, hsn_code: e.target.value })
                }
                placeholder="30049099"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>SALT / GENERIC NAME</label>
              <input
                value={newMed.salt_name}
                onChange={(e) =>
                  setNewMed({ ...newMed, salt_name: e.target.value })
                }
                placeholder="e.g. Paracetamol 650mg"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>BARCODE (EAN-13)</label>
              <input
                value={newMed.barcode}
                onChange={(e) =>
                  setNewMed({ ...newMed, barcode: e.target.value })
                }
                placeholder="e.g. 8901234567890"
                style={inputStyle}
              />
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <label style={labelStyle}>DRUG SCHEDULE</label>
              <select
                value={newMed.drug_schedule}
                onChange={(e) =>
                  setNewMed({ ...newMed, drug_schedule: e.target.value })
                }
                style={inputStyle}
              >
                <option value="GENERAL">General</option>
                <option value="H">Schedule H</option>
                <option value="H1">Schedule H1</option>
                <option value="X">Schedule X</option>
                <option value="NARCOTIC">Narcotic</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateMedicine}
            disabled={saving || !newMed.name || !newMed.company}
            style={{
              ...submitBtn,
              fontSize: "11px",
              padding: "7px 16px",
              opacity: saving || !newMed.name || !newMed.company ? 0.6 : 1,
            }}
          >
            {saving ? "SAVING..." : "CREATE & SELECT MEDICINE"}
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
