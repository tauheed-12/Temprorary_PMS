function CustomerForm({
  customerPhone,
  setCustomerPhone,
  customerName,
  setCustomerName,
  isB2b,
  setIsB2b,
  customerGstin,
  setCustomerGstin,
  buyerAddress,
  setBuyerAddress,
  hasNarcotic,
  patientHistory,
  historyOpen,
  setHistoryOpen,
  repeatLoading,
  handleRepeat,
  customerPhoneRef,
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
        CUSTOMER DETAILS
      </div>

      {hasNarcotic && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "var(--radius-sm)",
            padding: "8px 12px",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            color: "#ef4444",
            letterSpacing: "0.04em",
          }}
        >
          NARCOTIC — Buyer name &amp; address required by law
        </div>
      )}
      <div style={fWrap}>
        <label style={lStyle}>CUSTOMER PHONE</label>
        <input
          ref={customerPhoneRef}
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Optional"
          style={iStyle}
          type="tel"
        />
      </div>

      {/* Patient history panel */}
      {patientHistory !== null && (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setHistoryOpen((o) => !o)}
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "var(--bg-secondary)",
              border: "none",
              padding: "7px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--text-secondary)",
              letterSpacing: "0.08em",
            }}
          >
            <span>
              LAST VISITS{" "}
              {patientHistory.length > 0 ? `(${patientHistory.length})` : ""}
            </span>
            <span>{historyOpen ? "▾" : "▸"}</span>
          </button>
          {historyOpen && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {patientHistory.length === 0 ? (
                <div
                  style={{
                    padding: "10px",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    textAlign: "center",
                  }}
                >
                  No previous visits
                </div>
              ) : (
                patientHistory.map((bill) => {
                  const names = (bill.items_snapshot || [])
                    .map((i) => i.medicine_name)
                    .join(", ");
                  const date = new Date(bill.bill_date).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "2-digit" },
                  );
                  return (
                    <div
                      key={bill.id}
                      style={{
                        padding: "8px 10px",
                        borderTop: "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "var(--text-secondary)",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {date} ·{" "}
                            <span style={{ color: "var(--accent-green)" }}>
                              ₹{parseFloat(bill.grand_total).toFixed(2)}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "var(--text-muted)",
                              marginTop: "2px",
                              maxWidth: "160px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {names}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRepeat(bill)}
                          disabled={repeatLoading}
                          style={{
                            flexShrink: 0,
                            background: "transparent",
                            border: "1px solid var(--accent-blue)",
                            color: "var(--accent-blue)",
                            borderRadius: "var(--radius-sm)",
                            padding: "4px 8px",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            fontWeight: "700",
                            letterSpacing: "0.06em",
                            cursor: repeatLoading ? "not-allowed" : "pointer",
                            opacity: repeatLoading ? 0.5 : 1,
                          }}
                        >
                          {repeatLoading ? "..." : "REPEAT"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      <div style={fWrap}>
        <label
          style={{ ...lStyle, color: hasNarcotic ? "#ef4444" : undefined }}
        >
          CUSTOMER NAME{hasNarcotic ? " *" : ""}
        </label>
        <input
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={hasNarcotic ? "Required" : "Optional"}
          style={{
            ...iStyle,
            borderColor:
              hasNarcotic && !customerName.trim()
                ? "rgba(239,68,68,0.6)"
                : undefined,
          }}
        />
      </div>
      {hasNarcotic && (
        <div style={fWrap}>
          <label style={{ ...lStyle, color: "#ef4444" }}>BUYER ADDRESS *</label>
          <input
            value={buyerAddress}
            onChange={(e) => setBuyerAddress(e.target.value)}
            placeholder="Required for Narcotic drugs"
            style={{
              ...iStyle,
              borderColor: !buyerAddress.trim()
                ? "rgba(239,68,68,0.6)"
                : undefined,
            }}
          />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="checkbox"
          checked={isB2b}
          onChange={(e) => setIsB2b(e.target.checked)}
          id="b2b-check"
          style={{ cursor: "pointer" }}
        />
        <label
          htmlFor="b2b-check"
          style={{ ...lStyle, cursor: "pointer", margin: 0 }}
        >
          THIS IS A B2B SALE
        </label>
      </div>

      {isB2b && (
        <div style={fWrap}>
          <label style={lStyle}>CUSTOMER GSTIN *</label>
          <input
            value={customerGstin}
            onChange={(e) => setCustomerGstin(e.target.value)}
            placeholder="e.g. 27AABCU...1ZX"
            style={iStyle}
          />
        </div>
      )}
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

export default CustomerForm;
