import { useState } from "react";
import { submitPurchaseReturn } from "../../api/inventory";

export default function PurchaseReturnForm({ batch, suppliers, onSuccess, onCancel }) {
  const [supplierId, setSupplierId] = useState("");
  const [returnQty, setReturnQty] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [reason, setReason] = useState("Expired");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId || !returnQty || !refundAmount) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitPurchaseReturn({
        supplier: supplierId,
        inventory_batch: batch.id,
        medicine: batch.medicine,
        return_quantity: parseInt(returnQty),
        refund_amount: parseFloat(refundAmount).toFixed(2),
        reason: reason,
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.non_field_errors?.[0] || 
        JSON.stringify(err.response?.data) ||
        "Failed to submit return."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleSubmit} style={{ background: "var(--bg-card)", padding: "24px", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: "450px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 600, borderBottom: "1px solid var(--border)", paddingBottom: "12px", margin: 0 }}>
          RETURN TO SUPPLIER: {batch.medicine_name}
        </h2>
        
        {error && <div style={{ color: "var(--accent-red)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{error}</div>}

        <div style={{ padding: "10px", background: "var(--bg-secondary)", borderRadius: "4px", fontSize: "11px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <div>Batch: {batch.batch_number}</div>
          <div>Available: {batch.available_quantity} tabs</div>
          <div>MRP: ₹{batch.mrp}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>SELECT SUPPLIER *</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", color: "var(--text-primary)", fontSize: "13px", outline: "none", width: "100%" }}>
            <option value="">-- Choose Supplier --</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} - {s.phone}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>RETURN QTY (TABS) *</label>
            <input type="number" max={batch.available_quantity} min="1" required value={returnQty} onChange={(e) => setReturnQty(e.target.value)} placeholder="e.g. 10" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", color: "var(--text-primary)", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>REFUND VALUE (₹) *</label>
            <input type="number" step="0.01" required value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="0.00" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", color: "var(--text-primary)", fontSize: "13px", outline: "none", width: "100%", boxSizing: "border-box" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "10px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>REASON</label>
          <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", padding: "10px", borderRadius: "4px", color: "var(--text-primary)", fontSize: "13px", outline: "none", width: "100%" }}>
            <option value="Expired">Expired</option>
            <option value="Damaged">Damaged</option>
            <option value="Recall">Recall</option>
            <option value="Defective">Defective</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
          <button type="button" onClick={onCancel} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>CANCEL</button>
          <button type="submit" disabled={submitting} style={{ background: "var(--accent-red)", color: "#000", border: "none", padding: "10px 16px", borderRadius: "4px", cursor: submitting ? "not-allowed" : "pointer", fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {submitting ? "PROCESSING..." : "SUBMIT RETURN"}
          </button>
        </div>
      </form>
    </div>
  );
}
