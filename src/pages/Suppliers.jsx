import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSuppliers } from "../store/slices/inventorySlice";
import { getSuppliers } from "../api/inventory";
import useWindowSize from "../hooks/useWindowSize";
import SupplierForm from "../components/Suppliers/SupplierForm";
import SupplierList from "../components/Suppliers/SupplierList";

export default function Suppliers() {
  const { isMobile } = useWindowSize();
  const dispatch = useAppDispatch();
  const suppliers = useAppSelector((state) => state.inventory.suppliers);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (suppliers.length === 0) {
      getSuppliers()
        .then((res) => dispatch(setSuppliers(res.data.results || [])))
        .catch(console.error);
    }
  }, [suppliers.length, dispatch]);

  // Show loading if no suppliers data yet
  if (suppliers.length === 0)
    return (
      <div
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "2rem",
        }}
      >
        LOADING SUPPLIERS DATA...
      </div>
    );

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
              marginTop: "2px",
            }}
          >
            {suppliers.length} TOTAL SUPPLIERS
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setSuccess("");
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

      {showForm && (
        <SupplierForm
          onSuccess={(newSupplier) => {
            dispatch(setSuppliers([newSupplier, ...suppliers]));
            setSuccess("Supplier added successfully.");
            setShowForm(false);
            setTimeout(() => setSuccess(""), 3000);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <SupplierList suppliers={suppliers} />
    </div>
  );
}
