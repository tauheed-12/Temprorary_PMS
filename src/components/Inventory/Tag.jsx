export default function Tag({ label, color }) {
  return (
    <span
      style={{
        fontSize: "10px",
        padding: "2px 7px",
        borderRadius: "3px",
        background: "var(--bg-secondary)",
        color: color,
        fontFamily: "var(--font-mono)",
        border: "1px solid var(--border)",
      }}
    >
      {label}
    </span>
  );
}
