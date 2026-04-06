export default function BillCard({ bill }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px",
        background: "var(--bg-primary)",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--border)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "12px",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {bill.customer_name || bill.customer_phone || "Guest"}
        </div>
        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
          {new Date(bill.bill_date).toLocaleDateString("en-IN")}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontSize: "12px",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
          }}
        >
          ₹{parseFloat(bill.grand_total).toLocaleString("en-IN")}
        </div>
        <div
          style={{
            fontSize: "9px",
            color:
              bill.payment_mode === "CREDIT"
                ? "var(--accent-amber)"
                : "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {bill.payment_mode}
        </div>
      </div>
    </div>
  );
}
