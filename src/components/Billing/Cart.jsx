import ScheduleBadge from "./ScheduleBadge";

function Cart({ cart, updateQty, updateDiscount, removeItem, isMobile }) {
  const qtyBtn = {
    width: "26px",
    height: "26px",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return cart.length === 0 ? (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px dashed var(--border)",
        borderRadius: "var(--radius-md)",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        minHeight: "120px",
      }}
    >
      SEARCH AND ADD MEDICINES ABOVE
    </div>
  ) : (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        overflowY: "auto",
      }}
    >
      {/* Column headers */}
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 36px",
            gap: "8px",
            padding: "0 4px",
            fontSize: "9px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
          }}
        >
          <span>MEDICINE</span>
          <span>BATCH</span>
          <span style={{ textAlign: "right" }}>RATE</span>
          <span style={{ textAlign: "center" }}>DISC %</span>
          <span style={{ textAlign: "center" }}>QTY</span>
          <span />
        </div>
      )}
      {cart.map((item) => {
        const perUnit = parseFloat(item.mrp) / (item.pack_qty || 1);
        const lineGross = perUnit * item.quantity;
        const pct = parseFloat(item.discount_percentage || "0");
        const lineTotal = lineGross * (1 - pct / 100);
        return (
          <div
            key={item.key}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              display: isMobile ? "flex" : "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 36px",
              flexDirection: isMobile ? "column" : undefined,
              gap: "8px",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  {item.medicine_name}
                </div>
                {item.packaging && (
                  <span
                    style={{
                      fontSize: "9px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent-blue)",
                      background: "rgba(59,130,246,0.1)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      borderRadius: "3px",
                      padding: "1px 6px",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {item.packaging}
                  </span>
                )}
                <ScheduleBadge schedule={item.drug_schedule} />
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-secondary)",
                  marginTop: "2px",
                }}
              >
                {item.company} · Exp {item.expiry_date}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              {item.batch_number}
            </div>
            <div style={{ textAlign: isMobile ? "left" : "right" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--accent-green)",
                }}
              >
                ₹{lineTotal.toFixed(2)}
              </div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                ₹{perUnit.toFixed(2)}/tab
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "flex-start" : "center",
              }}
            >
              <input
                type="number"
                step="0.01"
                value={item.discount_percentage}
                onChange={(e) => updateDiscount(item.key, e.target.value)}
                placeholder="0.00"
                style={{
                  width: "48px",
                  textAlign: "center",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--accent-amber)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "4px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                justifyContent: isMobile ? "flex-start" : "center",
              }}
            >
              <button
                onClick={() => updateQty(item.key, item.quantity - 1)}
                style={qtyBtn}
              >
                −
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => updateQty(item.key, e.target.value)}
                min={1}
                max={item.available}
                style={{
                  width: "44px",
                  textAlign: "center",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "4px",
                }}
              />
              <button
                onClick={() => updateQty(item.key, item.quantity + 1)}
                style={qtyBtn}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeItem(item.key)}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-red)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0",
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Cart;
