import Tag from "./Tag";

export default function MedicineCard({
  med,
  isOwner,
  onDeactivate,
  onReactivate,
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px ${med.is_active ? "solid" : "dashed"} var(--border)`,
        borderRadius: "var(--radius-md)",
        padding: "1rem",
        opacity: med.is_active ? 1 : 0.45,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            {med.name}
          </div>
          {med.packaging && (
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                background: "var(--bg-secondary)",
                padding: "1px 6px",
                borderRadius: "3px",
                border: "1px solid var(--border)",
              }}
            >
              {med.packaging}
            </span>
          )}
          {!med.is_active && (
            <span
              style={{
                fontSize: "9px",
                color: "var(--accent-red)",
                fontFamily: "var(--font-mono)",
                background: "rgba(239,68,68,0.1)",
                padding: "1px 6px",
                borderRadius: "3px",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              INACTIVE
            </span>
          )}
        </div>
        {isOwner() &&
          (med.is_active ? (
            <button
              onClick={() => onDeactivate(med)}
              title="Deactivate medicine"
              style={{
                flexShrink: 0,
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "16px",
                lineHeight: 1,
                cursor: "pointer",
                padding: "0 2px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-red)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              ×
            </button>
          ) : (
            <button
              onClick={() => onReactivate(med)}
              title="Reactivate medicine"
              style={{
                flexShrink: 0,
                background: "none",
                border: "1px solid var(--accent-green)",
                borderRadius: "3px",
                color: "var(--accent-green)",
                fontSize: "9px",
                lineHeight: 1,
                cursor: "pointer",
                padding: "2px 6px",
                fontFamily: "var(--font-mono)",
              }}
            >
              ACTIVATE
            </button>
          ))}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "var(--text-secondary)",
          marginBottom: med.salt_name ? "2px" : "8px",
        }}
      >
        {med.company}
      </div>
      {med.salt_name && (
        <div
          style={{
            fontSize: "10px",
            color: "var(--text-muted)",
            fontStyle: "italic",
            marginBottom: "8px",
          }}
        >
          {med.salt_name}
        </div>
      )}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        <Tag label={med.category} color="var(--accent-blue)" />
        <Tag label={`${med.pack_qty} tabs/strip`} color="var(--text-muted)" />
        <Tag
          label={`GST ${med.default_gst_percentage}%`}
          color="var(--accent-amber)"
        />
        {med.hsn_code && (
          <Tag label={`HSN: ${med.hsn_code}`} color="var(--text-muted)" />
        )}
        {med.barcode && (
          <Tag label={`EAN: ${med.barcode}`} color="var(--text-muted)" />
        )}
        {med.drug_schedule && med.drug_schedule !== "GENERAL" && (
          <Tag
            label={
              med.drug_schedule === "NARCOTIC"
                ? "NARCOTIC"
                : `SCH-${med.drug_schedule}`
            }
            color={med.drug_schedule === "NARCOTIC" ? "#ef4444" : "#f97316"}
          />
        )}
      </div>
    </div>
  );
}
