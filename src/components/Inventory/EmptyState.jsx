export default function EmptyState({ message, sub }) {
  return (
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
        {message}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          marginTop: "6px",
        }}
      >
        {sub}
      </div>
    </div>
  );
}
