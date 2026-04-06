import EmptyState from "../Inventory/EmptyState";

export default function SupplierList({ suppliers, loading }) {
  if (loading) {
    return (
      <div
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
        }}
      >
        LOADING...
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <EmptyState
        message="NO SUPPLIERS YET"
        sub="Add your first supplier to get started"
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {suppliers.map((supplier) => (
        <div
          key={supplier.id}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text-primary)",
              }}
            >
              {supplier.name}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {supplier.contact_person && (
                <span style={meta}>{supplier.contact_person}</span>
              )}
              {supplier.phone && <span style={meta}>📞 {supplier.phone}</span>}
              {supplier.gstin && (
                <span
                  style={{
                    ...meta,
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent-blue)",
                  }}
                >
                  GST: {supplier.gstin}
                </span>
              )}
              {supplier.email && <span style={meta}>{supplier.email}</span>}
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                borderRadius: "3px",
                background: supplier.is_active
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
                color: supplier.is_active
                  ? "var(--accent-green)"
                  : "var(--accent-red)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
              }}
            >
              {supplier.is_active ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  fontSize: "11px",
  color: "var(--text-secondary)",
};
