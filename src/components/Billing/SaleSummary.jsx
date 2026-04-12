function SaleSummary({
  cartTotal,
  discount,
  setDiscount,
  grandTotal,
  paymentMode,
  setPaymentMode,
  paymentModeRefs,
  splitPayments,
  setSplitPayments,
  error,
  submitting,
  cart,
  handleCheckout,
}) {
  const splitSum = Object.values(splitPayments || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const isSplitMismatch = paymentMode === "SPLIT" && Math.abs(splitSum - grandTotal) > 0.01;
  const isSubmitDisabled = submitting || cart.length === 0 || isSplitMismatch;

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
          {["CASH", "UPI", "CREDIT", "SPLIT"].map((mode, idx) => {
            const isDisabled = grandTotal < 0 && mode === "SPLIT";
            return (
            <button
              key={mode}
              disabled={isDisabled}
              ref={(el) => (paymentModeRefs.current[idx] = el)}
              onClick={() => { if (!isDisabled) setPaymentMode(mode); }}
              onKeyDown={(e) => {
                const modes = ["CASH", "UPI", "CREDIT", "SPLIT"];
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  let next = (idx + 1) % modes.length;
                  if (grandTotal < 0 && modes[next] === "SPLIT") next = (next + 1) % modes.length;
                  setPaymentMode(modes[next]);
                  paymentModeRefs.current[next]?.focus();
                }
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  let prev = (idx - 1 + modes.length) % modes.length;
                  if (grandTotal < 0 && modes[prev] === "SPLIT") prev = (prev - 1 + modes.length) % modes.length;
                  setPaymentMode(modes[prev]);
                  paymentModeRefs.current[prev]?.focus();
                }
              }}
              style={{
                opacity: isDisabled ? 0.2 : 1,
                cursor: isDisabled ? "not-allowed" : "pointer",
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
                cursor: isDisabled ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {mode}
            </button>
          )})}
        </div>
      </div>

      {paymentMode === "SPLIT" && (
        <div style={{ display: "flex", gap: "8px", flexDirection: "row" }}>
          {["CASH", "UPI", "CREDIT"].map((type) => (
            <div key={type} style={fWrap}>
              <label style={lStyle}>{type} ₹</label>
              <input
                type="number"
                min="0"
                value={splitPayments?.[type] || ""}
                onChange={(e) => setSplitPayments(prev => ({ ...prev, [type]: e.target.value }))}
                style={{ ...iStyle, padding: "6px 8px", fontSize: "11px" }}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      )}

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

      {isSplitMismatch && (
        <p
          style={{
            color: "var(--accent-red)",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            lineHeight: "1.3",
          }}
        >
          Split amounts must equal exactly ₹{grandTotal.toFixed(2)}
        </p>
      )}

      <button
        onClick={handleCheckout}
        disabled={isSubmitDisabled}
        style={{
          background:
            isSubmitDisabled ? "var(--bg-hover)" : "var(--accent-green)",
          color: isSubmitDisabled ? "var(--text-muted)" : "#000",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "12px",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          fontWeight: "700",
          letterSpacing: "0.08em",
          cursor: isSubmitDisabled ? "not-allowed" : "pointer",
          transition: "all 0.15s",
        }}
      >
        {submitting
          ? "PROCESSING..."
          : grandTotal < 0 
            ? `REFUND · ₹${Math.abs(grandTotal).toFixed(2)}` 
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
