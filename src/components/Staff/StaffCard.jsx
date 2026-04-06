// ── Staff card component ──────────────────────────────────────────────────────

export default function StaffCard({
  member,
  isSelf,
  isMobile,
  LEVEL_COLOR,
  LEVEL_LABEL,
}) {
  const level = member.privilege_level;
  const badge = LEVEL_COLOR[level] || LEVEL_COLOR[1];

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${isSelf ? "var(--border-light)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}
    >
      {/* Left: avatar + info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Avatar circle */}
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: badge.bg,
            border: `1px solid ${badge.text}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            fontWeight: "700",
            color: badge.text,
          }}
        >
          {member.name
            ? member.name.substring(0, 2).toUpperCase()
            : member.phone_number?.slice(-2) || "??"}
        </div>

        {/* Phone + meta */}
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                color: "var(--text-primary)",
                fontWeight: "600",
              }}
            >
              {member.name || member.phone_number}
            </span>
            {isSelf && (
              <span
                style={{
                  fontSize: "9px",
                  fontFamily: "var(--font-mono)",
                  color: "var(--accent-green)",
                  letterSpacing: "0.08em",
                }}
              >
                YOU
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginTop: "2px",
            }}
          >
            {member.name ? `${member.phone_number} · ` : ""}
            {member.pharmacy?.name || "This pharmacy"}
          </div>
        </div>
      </div>

      {/* Right: role badge */}
      <div style={{ flexShrink: 0 }}>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            fontWeight: "700",
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: "4px",
            background: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.text}`,
            opacity: 0.9,
          }}
        >
          {LEVEL_LABEL[level] || "STAFF"}
        </span>
      </div>
    </div>
  );
}
