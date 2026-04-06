function SaleSummary({
  cartTotal,
  discount,
  setDiscount,
  grandTotal,
  paymentMode,
  setPaymentMode,
  paymentModeRefs,
  error,
  submitting,
  cart,
  handleCheckout,
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
        }}
      >
        SALE SUMMARY
      </div>

      <div style={fWrap}>
        <label style={lStyle}>PAYMENT MODE</label>
        <div style={{ display: "flex", gap: "6px" }}>
          {["CASH", "UPI", "CREDIT"].map((mode, idx) => (
            <button
              key={mode}
              ref={(el) => (paymentModeRefs.current[idx] = el)}
              onClick={() => setPaymentMode(mode)}
              onKeyDown={(e) => {
                const modes = ["CASH", "UPI", "CREDIT"];
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  const next = (idx + 1) % modes.length;
                  setPaymentMode(modes[next]);
                  paymentModeRefs.current[next]?.focus();
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  const prev = (idx - 1 + modes.length) % modes.length;
                  setPaymentMode(modes[prev]);
                  paymentModeRefs.current[prev]?.focus();
                }
              }}
              style={{
                flex: 1,
                padding: "7px 4px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: "700",
                letterSpacing: "0.06em",
                borderRadius: "var(--radius-sm)",
                border:
                  paymentMode === mode
                    ? "1px solid var(--accent-green)"
                    : "1px solid var(--border)",
                background:
                  paymentMode === mode ? "rgba(34,197,94,0.12)" : "transparent",
                color:
                  paymentMode === mode
                    ? "var(--accent-green)"
                    : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div style={fWrap}>
        <label style={lStyle}>DISCOUNT (₹)</label>
        <input
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          type="number"
          min="0"
          style={iStyle}
        />
      </div>

      {/* Totals */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
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
            ₹{cartTotal.toFixed(2)}
          </span>
        </div>
        {parseFloat(discount) > 0 && (
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
              −₹{parseFloat(discount).toFixed(2)}
            </span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "16px",
            fontWeight: "600",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
            marginTop: "4px",
          }}
        >
          <span>TOTAL</span>
          <span>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <p
          style={{
            color: "var(--accent-red)",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {error}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={submitting || cart.length === 0}
        style={{
          background:
            cart.length === 0 ? "var(--bg-hover)" : "var(--accent-green)",
          color: cart.length === 0 ? "var(--text-muted)" : "#000",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.08em",
          cursor: cart.length === 0 ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
      >
        {submitting
          ? "PROCESSING..."
          : `CONFIRM SALE · ₹${grandTotal.toFixed(2)}`}
      </button>
    </div>
  );
}

const fWrap = { display: "flex", flexDirection: "column", gap: "5px" };
const lStyle = {
  fontSize: "9px",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
};
const iStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

export default SaleSummary;
