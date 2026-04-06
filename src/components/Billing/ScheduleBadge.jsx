function ScheduleBadge({ schedule }) {
  if (!schedule || schedule === "GENERAL") return null;
  const isNarcotic = schedule === "NARCOTIC";
  const isH = schedule === "H" || schedule === "H1";
  if (!isNarcotic && !isH) return null;
  return (
    <span
      style={{
        fontSize: "9px",
        fontFamily: "var(--font-mono)",
        fontWeight: "700",
        letterSpacing: "0.06em",
        padding: "1px 5px",
        borderRadius: "3px",
        flexShrink: 0,
        background: isNarcotic
          ? "rgba(239,68,68,0.12)"
          : "rgba(249,115,22,0.12)",
        color: isNarcotic ? "#ef4444" : "#f97316",
        border: isNarcotic
          ? "1px solid rgba(239,68,68,0.35)"
          : "1px solid rgba(249,115,22,0.35)",
      }}
    >
      {isNarcotic ? "NARCOTIC" : `SCH-${schedule}`}
    </span>
  );
}

export default ScheduleBadge;
