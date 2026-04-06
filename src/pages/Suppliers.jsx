import { useState, useEffect } from "react";
import { getSuppliers } from "../api/inventory";
import useWindowSize from "../hooks/useWindowSize";
import SupplierForm from "../components/Suppliers/SupplierForm";
import SupplierList from "../components/Suppliers/SupplierList";

export default function Suppliers() {
  const { isMobile } = useWindowSize();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchSuppliers = () => {
    setLoading(true);
    getSuppliers()
      .then((res) => setSuppliers(res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "16px" : "20px",
              fontWeight: "600",
              fontFamily: "var(--font-mono)",
              color: "var(--text-primary)",
            }}
          >
            SUPPLIERS
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {suppliers.length} ACTIVE SUPPLIERS
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
          }}
          style={{
            background: showForm ? "transparent" : "var(--accent-green)",
            color: showForm ? "var(--text-secondary)" : "#000",
            border: showForm ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            cursor: "pointer",
          }}
        >
          {showForm ? "CANCEL" : "+ ADD SUPPLIER"}
        </button>
      </div>

      {/* Success message */}
      {success && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-green)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: "12px",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* Add supplier form */}
      {showForm && (
        <SupplierForm
          onSuccess={(newSupplier) => {
            setSuppliers((prev) => [newSupplier, ...prev]);
            setSuccess("Supplier added successfully.");
            setShowForm(false);
            setTimeout(() => setSuccess(""), 3000);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Suppliers list */}
      <SupplierList suppliers={suppliers} loading={loading} />
    </div>
  );
}
