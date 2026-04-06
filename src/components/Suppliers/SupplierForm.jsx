import { useState } from "react";
import api from "../../api/config";
import Field from "../Inventory/Field";

export default function SupplierForm({ onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/api/inventory/suppliers/", form);
      onSuccess(res.data);
      setForm({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
      });
    } catch (err) {
      setError(err.response?.data?.name?.[0] || "Failed to add supplier.");
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
        NEW SUPPLIER
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
            label="SUPPLIER NAME *"
            value={form.name}
            onChange={(v) => updateForm("name", v)}
            required
          />
          <Field
            label="CONTACT PERSON"
            value={form.contact_person}
            onChange={(v) => updateForm("contact_person", v)}
          />
          <Field
            label="PHONE"
            value={form.phone}
            onChange={(v) => updateForm("phone", v)}
            type="tel"
          />
          <Field
            label="EMAIL"
            value={form.email}
            onChange={(v) => updateForm("email", v)}
            type="email"
          />
          <Field
            label="GSTIN"
            value={form.gstin}
            onChange={(v) => updateForm("gstin", v)}
          />
          <Field
            label="ADDRESS"
            value={form.address}
            onChange={(v) => updateForm("address", v)}
          />
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
            {submitting ? "SAVING..." : "SAVE SUPPLIER"}
          </button>
          <button type="button" onClick={onCancel} style={cancelBtn}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

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
