import Tag from "./Tag";
import EmptyState from "./EmptyState";

export default function PurchaseBillList({ bills, loading }) {
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

  if (bills.length === 0) {
    return (
      <EmptyState
        message="NO PURCHASE BILLS YET"
        sub="Add your first purchase bill to stock inventory"
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {bills.map((bill) => (
        <div
          key={bill.id}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {bill.invoice_number}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                {bill.bill_date}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--accent-green)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{parseFloat(bill.grand_total).toLocaleString("en-IN")}
              </div>
              <Tag
                label={bill.payment_status}
                color={
                  bill.payment_status === "PAID"
                    ? "var(--accent-green)"
                    : bill.payment_status === "PARTIAL"
                      ? "var(--accent-amber)"
                      : "var(--accent-red)"
                }
              />
            </div>
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {bill.items?.length || 0} items · Subtotal ₹
            {parseFloat(bill.subtotal).toLocaleString("en-IN")} · Tax ₹
            {parseFloat(bill.total_tax).toLocaleString("en-IN")}
          </div>
        </div>
      ))}
    </div>
  );
}
