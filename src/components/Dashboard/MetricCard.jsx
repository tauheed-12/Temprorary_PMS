export default function MetricCard({ label, value, sub, color }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        borderTop: `2px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: "9px",
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.1em",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "22px",
          fontWeight: "600",
          color: color,
          fontFamily: "var(--font-mono)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "10px",
          color: "var(--text-secondary)",
          marginTop: "4px",
        }}
      >
        {sub}
      </div>
    </div>
  );
}
