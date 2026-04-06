export default function ReturnModal({
  returnModal,
  returnQty,
  onReturnQtyChange,
  returnReason,
  onReturnReasonChange,
  returnError,
  returning,
  onClose,
  onConfirm,
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          width: "100%",
          maxWidth: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
            PROCESS RETURN
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding: "10px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
            {returnModal.item.medicine_name}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginTop: "2px",
            }}
          >
            Batch {returnModal.item.batch_number} · Sold qty:{" "}
            {returnModal.item.quantity} tabs
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label
            style={{
              fontSize: "9px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
            }}
          >
            RETURN QUANTITY (tablets)
          </label>
          <input
            type="number"
            min="1"
            max={returnModal.item.quantity}
            value={returnQty}
            onChange={(e) => onReturnQtyChange(e.target.value)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 10px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
            }}
            autoFocus
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <label
            style={{
              fontSize: "9px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
            }}
          >
            REASON
          </label>
          <select
            value={returnReason}
            onChange={(e) => onReturnReasonChange(e.target.value)}
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 10px",
              color: "var(--text-primary)",
              fontSize: "13px",
              outline: "none",
            }}
          >
            <option>Customer Return</option>
            <option>Wrong Medicine</option>
            <option>Damaged</option>
            <option>Expired</option>
            <option>Other</option>
          </select>
        </div>

        {returnError && (
          <p
            style={{
              color: "var(--accent-red)",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
            }}
          >
            {returnError}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={returning}
            style={{
              flex: 1,
              padding: "9px",
              background: "var(--accent-amber)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#000",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              opacity: returning ? 0.7 : 1,
            }}
          >
            {returning ? "PROCESSING..." : "CONFIRM RETURN"}
          </button>
        </div>
      </div>
    </div>
  );
}
