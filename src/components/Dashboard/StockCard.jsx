export default function StockCard({ batch }) {
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 8px",
      background: "var(--bg-primary)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--border)",
    }}
  >
    <div>
      <div style={{ fontSize: "11px", color: "var(--text-primary)" }}>
        {batch.medicine_name}
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {batch.batch_number}
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontSize: "12px",
          color: "var(--accent-blue)",
          fontFamily: "var(--font-mono)",
        }}
      >
        {batch.available_quantity}
      </div>
      <div style={{ fontSize: "9px", color: "var(--text-muted)" }}>tablets</div>
    </div>
  </div>;
}
