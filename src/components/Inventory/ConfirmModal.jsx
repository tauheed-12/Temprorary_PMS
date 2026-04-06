export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: "var(--radius-md)",
          padding: "1.5rem",
          maxWidth: "360px",
          width: "90%",
          boxShadow: "var(--shadow)",
        }}
      >
        <p
          style={{
            color: "var(--text-primary)",
            fontSize: "13px",
            marginBottom: "1.25rem",
            lineHeight: 1.6,
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "7px 16px",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.06em",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "7px 16px",
              background: "var(--accent-red)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              fontWeight: "700",
              letterSpacing: "0.06em",
            }}
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
