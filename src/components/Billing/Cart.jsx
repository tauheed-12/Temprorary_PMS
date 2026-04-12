import { useState, useEffect, useRef } from "react";
import ScheduleBadge from "./ScheduleBadge";

function Cart({ cart, updateQty, updateFreeQty, updateUom, updateDiscount, removeItem, isMobile }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const rowRefs = useRef([]);
  const fieldRefs = useRef([]);

  const handleRowKeyDown = (e, index) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      document.getElementById(`cart-row-${index + 1}`)?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        document.getElementById("main-search-bar")?.focus();
        setActiveIndex(-1);
      } else {
        document.getElementById(`cart-row-${index - 1}`)?.focus();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      // Find first valid field in this row
      let firstCol = 0;
      while(firstCol < 7 && !fieldRefs.current[index]?.[firstCol]) firstCol++;
      if (firstCol < 7) fieldRefs.current[index]?.[firstCol]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      // Find last valid field (like delete button)
      let lastCol = 6;
      while(lastCol >= 0 && !fieldRefs.current[index]?.[lastCol]) lastCol--;
      if (lastCol >= 0) fieldRefs.current[index]?.[lastCol]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("main-search-bar")?.focus();
      setActiveIndex(-1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      removeItem(cart[index].key);
      document.getElementById("main-search-bar")?.focus();
      setActiveIndex(-1);
    }
  };

  const handleFieldKeyDown = (e, index, col) => {
    // If navigating inside fields, natively override row vertical jumping protecting UX isolation natively
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
       e.stopPropagation();
    } else if (e.key === "ArrowRight") {
      // Small UX tweak: only jump if at the end of the text, or if it's the delete button which has no text
      if (e.target.tagName !== "INPUT" || e.target.selectionStart === e.target.value.length || e.target.type === "number") {
        e.preventDefault();
        e.stopPropagation();
        let nextCol = col + 1;
        while(nextCol < 7 && !fieldRefs.current[index]?.[nextCol]) {
            nextCol++;
        }
        if (nextCol < 7) fieldRefs.current[index]?.[nextCol]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      if (e.target.tagName !== "INPUT" || e.target.selectionStart === 0 || e.target.type === "number") {
        e.preventDefault();
        e.stopPropagation();
        let nextCol = col - 1;
        while(nextCol >= 0 && !fieldRefs.current[index]?.[nextCol]) {
            nextCol--;
        }
        if (nextCol >= 0) fieldRefs.current[index]?.[nextCol]?.focus();
        else document.getElementById(`cart-row-${index}`)?.focus();
      }
    } else if (e.key === "Enter" || e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById(`cart-row-${index}`)?.focus();
    }
  };
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
            gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,3fr) 36px",
            gap: "8px",
            padding: "0 12px",
            border: "1px solid transparent",
            fontSize: "9px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.08em",
          }}
        >
          <span>MEDICINE</span>
          <span>BATCH · EXP</span>
          <span style={{ textAlign: "center" }}>DISC %</span>
          <span style={{ textAlign: "right" }}>TOTAL</span>
          <span style={{ textAlign: "center" }}>QTY / FREE / UOM</span>
          <span />
        </div>
      )}
      {cart.map((item, index) => {
        const rate = item.uom === 'Strips' ? parseFloat(item.mrp) : parseFloat(item.mrp) / (item.pack_qty || 1);
        const lineGross = rate * item.quantity;
        const pct = parseFloat(item.discount_percentage || "0");
        const lineTotal = lineGross * (1 - pct / 100);
        return (
          <div
            id={`cart-row-${index}`}
            tabIndex={0}
            ref={(el) => (rowRefs.current[index] = el)}
            key={item.key}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(e) => handleRowKeyDown(e, index)}
            style={{
              background: index === activeIndex ? "var(--bg-hover, rgba(0,0,0,0.05))" : "var(--bg-card)",
              border: "1px solid var(--border)",
              borderLeft: index === activeIndex ? "4px solid var(--accent-green, #10b981)" : "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              padding: index === activeIndex ? "10px 12px 10px 9px" : "10px 12px",
              display: isMobile ? "flex" : "grid",
              gridTemplateColumns: "minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,3fr) 36px",
              flexDirection: isMobile ? "column" : undefined,
              gap: "8px",
              alignItems: isMobile ? "flex-start" : "center",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <div style={{ minWidth: 0 }}>
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
                {item.company}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              <div>{item.batch_number}</div>
              <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }}>
                {item.expiry_date ? (() => { const p = item.expiry_date.split("-"); return `${p[1]}/${p[0]}`; })() : ""}
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
                ref={(el) => {
                  if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                  fieldRefs.current[index][0] = el;
                }}
                className="focus-ring-input"
                onKeyDown={(e) => handleFieldKeyDown(e, index, 0)}
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
                ₹{rate.toFixed(2)}/{item.uom === 'Strips' ? 'strip' : 'tab'}
              </div>
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
                ref={(el) => {
                  if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                  fieldRefs.current[index][1] = el;
                }}
                onKeyDown={(e) => handleFieldKeyDown(e, index, 1)}
                onClick={() => updateQty(item.key, item.quantity - 1)}
                style={qtyBtn}
              >
                −
              </button>
              <input
                className="focus-ring-input"
                type="number"
                ref={(el) => {
                  if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                  fieldRefs.current[index][2] = el;
                }}
                onKeyDown={(e) => handleFieldKeyDown(e, index, 2)}
                value={item.quantity}
                onChange={(e) => updateQty(item.key, e.target.value)}
                max={item.quantity > 0 ? (item.uom === "Strips" ? Math.floor(item.available / (item.pack_qty || 1)) : item.available) : undefined}
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
                ref={(el) => {
                  if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                  fieldRefs.current[index][3] = el;
                }}
                onKeyDown={(e) => handleFieldKeyDown(e, index, 3)}
                onClick={() => updateQty(item.key, item.quantity + 1)}
                style={qtyBtn}
              >
                +
              </button>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontSize: "9px", padding: "0 4px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>FREE</div>
                <input
                  className="focus-ring-input"
                  type="number"
                  ref={(el) => {
                    if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                    fieldRefs.current[index][4] = el;
                  }}
                  onKeyDown={(e) => handleFieldKeyDown(e, index, 4)}
                  value={item.free_quantity || 0}
                  onChange={(e) => updateFreeQty(item.key, e.target.value)}
                  style={{
                    width: "30px",
                    textAlign: "center",
                    background: "transparent",
                    border: "none",
                    color: "var(--accent-blue)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    padding: "4px 0",
                    outline: "none",
                  }}
                />
              </div>
              <select
                className="focus-ring-input"
                ref={(el) => {
                  if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                  fieldRefs.current[index][5] = el;
                }}
                onKeyDown={(e) => handleFieldKeyDown(e, index, 5)}
                value={item.uom || 'Tabs'}
                onChange={(e) => updateUom(item.key, e.target.value)}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  padding: "4px 2px",
                  outline: "none"
                }}
              >
                <option value="Tabs">Tabs</option>
                <option value="Strips">Strips</option>
              </select>
            </div>
            <button
              ref={(el) => {
                if (!fieldRefs.current[index]) fieldRefs.current[index] = [];
                fieldRefs.current[index][6] = el;
              }}
              onKeyDown={(e) => handleFieldKeyDown(e, index, 6)}
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
