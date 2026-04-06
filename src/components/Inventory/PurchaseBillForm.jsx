import { useState } from "react";
import api from "../../api/config";
import Field from "./Field";
import SupplierField from "./SupplierField";
import MedicineSearchField from "./MedicineSearchField";

export default function PurchaseBillForm({
  suppliers,
  onSuccess,
  onCancel,
  onSupplierCreate,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    supplier: "",
    invoice_number: "",
    bill_date: new Date().toISOString().slice(0, 10),
    discount: "0.00",
    payment_status: "PENDING",
    items: [
      {
        medicine: "",
        medicine_name: "",
        batch_number: "",
        expiry_date: "",
        quantity: "",
        free_quantity: 0,
        purchase_rate_base: "",
        discount_percentage: "0.00",
        gst_percentage: "12.00",
        mrp: "",
      },
    ],
  });

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          medicine: "",
          medicine_name: "",
          batch_number: "",
          expiry_date: "",
          quantity: "",
          free_quantity: 0,
          purchase_rate_base: "",
          discount_percentage: "0.00",
          gst_percentage: "12.00",
          mrp: "",
        },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        items: form.items.map(({ medicine_name, ...rest }) => rest),
      };
      const res = await api.post("/api/inventory/purchase/", payload);
      onSuccess(res.data);
      setForm({
        supplier: "",
        invoice_number: "",
        bill_date: new Date().toISOString().slice(0, 10),
        discount: "0.00",
        payment_status: "PENDING",
        items: [
          {
            medicine: "",
            medicine_name: "",
            batch_number: "",
            expiry_date: "",
            quantity: "",
            free_quantity: 0,
            purchase_rate_base: "",
            discount_percentage: "0.00",
            gst_percentage: "12.00",
            mrp: "",
          },
        ],
      });
    } catch (err) {
      setError(
        JSON.stringify(err.response?.data) || "Failed to add purchase bill.",
      );
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
        NEW PURCHASE BILL
      </div>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "1.5rem",
          }}
        >
          <SupplierField
            suppliers={suppliers}
            value={form.supplier}
            onSelect={(id, newSupplier) => {
              updateForm("supplier", id);
              if (newSupplier) onSupplierCreate(newSupplier);
            }}
          />
          <Field
            label="INVOICE NUMBER *"
            value={form.invoice_number}
            onChange={(v) => updateForm("invoice_number", v)}
            required
          />
          <Field
            label="BILL DATE"
            value={form.bill_date}
            onChange={(v) => updateForm("bill_date", v)}
            type="date"
          />
          <Field
            label="DISCOUNT"
            value={form.discount}
            onChange={(v) => updateForm("discount", v)}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label style={labelStyle}>PAYMENT STATUS</label>
            <select
              value={form.payment_status}
              onChange={(e) => updateForm("payment_status", e.target.value)}
              style={inputStyle}
            >
              <option value="PENDING">Pending</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        <div
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            marginBottom: "0.75rem",
          }}
        >
          ITEMS
        </div>

        {form.items.map((item, index) => (
          <div
            key={index}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "1rem",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ITEM {index + 1}
              </span>
              {form.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  style={{
                    fontSize: "11px",
                    color: "var(--accent-red)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  REMOVE
                </button>
              )}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              <MedicineSearchField
                value={item.medicine_name}
                onSelect={(med) => {
                  updateItem(index, "medicine", med.id);
                  updateItem(
                    index,
                    "medicine_name",
                    `${med.name} — ${med.company}`,
                  );
                  updateItem(
                    index,
                    "gst_percentage",
                    med.default_gst_percentage,
                  );
                }}
              />
              <Field
                label="BATCH NUMBER *"
                value={item.batch_number}
                onChange={(v) => updateItem(index, "batch_number", v)}
                required
              />
              <Field
                label="EXPIRY DATE *"
                value={item.expiry_date}
                onChange={(v) => updateItem(index, "expiry_date", v)}
                type="date"
              />
              <Field
                label="QUANTITY (strips) *"
                value={item.quantity}
                onChange={(v) => updateItem(index, "quantity", v)}
                type="number"
              />
              <Field
                label="FREE QUANTITY"
                value={item.free_quantity}
                onChange={(v) => updateItem(index, "free_quantity", v)}
                type="number"
              />
              <Field
                label="PURCHASE RATE (per strip) *"
                value={item.purchase_rate_base}
                onChange={(v) => updateItem(index, "purchase_rate_base", v)}
              />
              <Field
                label="DISCOUNT %"
                value={item.discount_percentage}
                onChange={(v) => updateItem(index, "discount_percentage", v)}
              />
              <Field
                label="GST %"
                value={item.gst_percentage}
                onChange={(v) => updateItem(index, "gst_percentage", v)}
              />
              <Field
                label="MRP (per strip) *"
                value={item.mrp}
                onChange={(v) => updateItem(index, "mrp", v)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          style={{
            fontSize: "11px",
            color: "var(--accent-blue)",
            background: "none",
            border: "1px solid var(--accent-blue)",
            borderRadius: "var(--radius-sm)",
            padding: "6px 14px",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            marginBottom: "1rem",
          }}
        >
          + ADD ITEM
        </button>

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
            {submitting ? "SAVING..." : "SAVE PURCHASE BILL"}
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
