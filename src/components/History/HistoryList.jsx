export default function HistoryList({
  isMobile,
  phoneFilter,
  onPhoneFilterChange,
  loading,
  filteredBills,
  selectedBillId,
  onSelectBill,
  getPaymentColor,
  returnSuccess,
}) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: "600",
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
          }}
        >
          HISTORY
        </h1>
        <input
          placeholder="Search by phone or name..."
          value={phoneFilter}
          onChange={(e) => onPhoneFilterChange(e.target.value)}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "7px 10px",
            color: "var(--text-primary)",
            fontSize: "12px",
            outline: "none",
            width: "220px",
          }}
        />
      </div>

      {returnSuccess && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-green)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: "12px",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
            flexShrink: 0,
          }}
        >
          ✓ {returnSuccess}
        </div>
      )}

      {loading ? (
        <div
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          LOADING...
        </div>
      ) : filteredBills.length === 0 ? (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            NO BILLS FOUND
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {filteredBills.map((bill) => (
            <div
              key={bill.id}
              onClick={() => onSelectBill(bill)}
              style={{
                background:
                  selectedBillId === bill.id
                    ? "var(--bg-hover)"
                    : "var(--bg-card)",
                border: `1px solid ${selectedBillId === bill.id ? "var(--border-light)" : "var(--border)"}`,
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "var(--text-primary)",
                  }}
                >
                  {bill.customer_name || bill.customer_phone || "Guest"}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                    marginTop: "2px",
                  }}
                >
                  {new Date(bill.bill_date).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {bill.billed_by_phone && ` · ${bill.billed_by_phone}`}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
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
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: getPaymentColor(bill.payment_mode),
                  }}
                >
                  {bill.payment_mode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
