export default function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

const labelStyle = {
  fontSize: "9px",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
};

const inputStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};
