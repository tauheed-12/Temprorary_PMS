export default function HistoryDetail({
  selectedBill,
  detailLoading,
  isMobile,
  onReturn,
  getPaymentColor,
}) {
  if (detailLoading) {
    return (
      <div
        style={{
          padding: "2rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
        }}
      >
        LOADING...
      </div>
    );
  }

  if (!selectedBill) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          minHeight: "200px",
        }}
      >
        SELECT A BILL
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            {selectedBill.customer_name ||
              selectedBill.customer_phone ||
              "Guest Customer"}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginTop: "2px",
            }}
          >
            {new Date(selectedBill.bill_date).toLocaleString("en-IN")}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {selectedBill.id?.slice(0, 8).toUpperCase()}
          </div>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            padding: "3px 8px",
            borderRadius: "4px",
            background: getPaymentColor(selectedBill.payment_mode) + "20",
            color: getPaymentColor(selectedBill.payment_mode),
          }}
        >
          {selectedBill.payment_mode}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.1em",
            marginBottom: "4px",
          }}
        >
          ITEMS
        </div>
        {(selectedBill.items || []).map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "8px",
              padding: "8px",
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "12px", color: "var(--text-primary)" }}>
                {item.medicine_name}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Batch {item.batch_number} · {item.quantity} tabs · ₹
                {parseFloat(item.sale_rate_per_unit).toFixed(2)}/tab
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{parseFloat(item.line_total).toFixed(2)}
              </div>
              <button
                onClick={() => onReturn(item)}
                style={{
                  fontSize: "9px",
                  color: "var(--accent-amber)",
                  fontFamily: "var(--font-mono)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                  marginTop: "2px",
                }}
              >
                RETURN
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          <span>Subtotal</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            ₹{parseFloat(selectedBill.subtotal).toFixed(2)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "var(--text-secondary)",
          }}
        >
          <span>Tax</span>
          <span style={{ fontFamily: "var(--font-mono)" }}>
            ₹{parseFloat(selectedBill.total_tax).toFixed(2)}
          </span>
        </div>
        {parseFloat(selectedBill.discount) > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "11px",
              color: "var(--accent-amber)",
            }}
          >
            <span>Discount</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>
              −₹{parseFloat(selectedBill.discount).toFixed(2)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "15px",
            fontWeight: "600",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>TOTAL</span>
          <span>₹{parseFloat(selectedBill.grand_total).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
