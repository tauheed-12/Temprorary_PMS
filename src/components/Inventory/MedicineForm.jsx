import { useState } from "react";
import api from "../../api/config";
import Field from "./Field";

export default function MedicineForm({ onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/api/inventory/medicines/", form);
      onSuccess(res.data);
      setForm({
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
      setError(err.response?.data?.name?.[0] || "Failed to add medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
          marginBottom: "1rem",
        }}
      >
        NEW MEDICINE
      </div>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "12px",
          }}
        >
          <Field
            label="MEDICINE NAME *"
            value={form.name}
            onChange={(v) => updateForm("name", v)}
            required
          />
          <Field
            label="COMPANY *"
            value={form.company}
            onChange={(v) => updateForm("company", v)}
            required
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label style={labelStyle}>CATEGORY</label>
            <select
              value={form.category}
              onChange={(e) => updateForm("category", e.target.value)}
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
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="PACK QTY (tablets/strip)"
            value={form.pack_qty}
            onChange={(v) => updateForm("pack_qty", v)}
            type="number"
          />
          <Field
            label="DEFAULT GST %"
            value={form.default_gst_percentage}
            onChange={(v) => updateForm("default_gst_percentage", v)}
          />
          <Field
            label="HSN CODE"
            value={form.hsn_code}
            onChange={(v) => updateForm("hsn_code", v)}
          />
          <Field
            label="PACKAGING (e.g. 1x10)"
            value={form.packaging}
            onChange={(v) => updateForm("packaging", v)}
          />
          <Field
            label="SALT / GENERIC NAME"
            value={form.salt_name}
            onChange={(v) => updateForm("salt_name", v)}
            placeholder="e.g. Paracetamol 650mg"
          />
          <Field
            label="BARCODE (EAN-13)"
            value={form.barcode}
            onChange={(v) => updateForm("barcode", v)}
            placeholder="e.g. 8901234567890"
          />
          <div>
            <label style={labelStyle}>DRUG SCHEDULE</label>
            <select
              value={form.drug_schedule}
              onChange={(e) => updateForm("drug_schedule", e.target.value)}
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
        {error && (
          <p
            style={{
              color: "var(--accent-red)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              marginBottom: "12px",
            }}
          >
            {error}
          </p>
        )}
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={submitting} style={submitBtn}>
            {submitting ? "SAVING..." : "SAVE MEDICINE"}
          </button>
          <button type="button" onClick={onCancel} style={cancelBtn}>
            CANCEL
          </button>
        </div>
      </form>
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

const submitBtn = {
  background: "var(--accent-green)",
  color: "#000",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "9px 20px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  cursor: "pointer",
};

const cancelBtn = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 20px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  cursor: "pointer",
};
