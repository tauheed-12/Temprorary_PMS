export default function WarehouseUnassigned({
  isMobile,
  unassigned,
  assigning,
  assignTarget,
  onStartAssign,
  onCancelAssign,
  onAssignTargetChange,
  onAssignBatch,
  getExpiryColor,
  assignError,
  submitting,
}) {
  return (
    <>
      {unassigned.length === 0 ? (
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
              color: "var(--accent-green)",
              fontFamily: "var(--font-mono)",
            }}
          >
            ✓ ALL BATCHES ASSIGNED
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "6px",
            }}
          >
            No pending stock placement
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {!isMobile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 160px",
                gap: "8px",
                padding: "0 12px",
                fontSize: "9px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.08em",
              }}
            >
              <span>MEDICINE</span>
              <span>BATCH</span>
              <span>EXPIRY</span>
              <span>QTY</span>
              <span>ASSIGN TO</span>
            </div>
          )}
          {unassigned.map((batch) => (
            <div
              key={batch.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                display: isMobile ? "flex" : "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 160px",
                flexDirection: isMobile ? "column" : undefined,
                gap: "8px",
                alignItems: "center",
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
                  {batch.medicine_name}
                </div>
                <div
                  style={{ fontSize: "10px", color: "var(--text-secondary)" }}
                >
                  {batch.medicine_company}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-primary)",
                }}
              >
                {batch.batch_number}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: getExpiryColor(batch.expiry_date),
                }}
              >
                {batch.expiry_date}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "var(--accent-blue)",
                }}
              >
                {batch.available_quantity}{" "}
                <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>
                  tabs
                </span>
              </div>
              {assigning?.id === batch.id ? (
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    value={assignTarget.block_letter}
                    onChange={(e) =>
                      onAssignTargetChange({
                        ...assignTarget,
                        block_letter: e.target.value.slice(0, 1).toUpperCase(),
                      })
                    }
                    placeholder="A"
                    maxLength={1}
                    style={{
                      ...inputStyle,
                      width: "40px",
                      padding: "5px 6px",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  />
                  <input
                    type="number"
                    value={assignTarget.shelf_number}
                    onChange={(e) =>
                      onAssignTargetChange({
                        ...assignTarget,
                        shelf_number: e.target.value,
                      })
                    }
                    placeholder="3"
                    min="1"
                    style={{
                      ...inputStyle,
                      width: "44px",
                      padding: "5px 6px",
                      fontSize: "12px",
                      textAlign: "center",
                    }}
                  />
                  <button
                    onClick={() => onAssignBatch(batch)}
                    disabled={submitting}
                    style={{
                      ...assignButton,
                      padding: "5px 10px",
                      fontSize: "10px",
                    }}
                  >
                    GO
                  </button>
                  <button
                    onClick={onCancelAssign}
                    style={{
                      padding: "5px 8px",
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ✕
                  </button>
                  {assignError && (
                    <div
                      style={{
                        width: "100%",
                        fontSize: "10px",
                        color: "var(--accent-red)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {assignError}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onStartAssign(batch)}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid var(--accent-blue)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--accent-blue)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}
                >
                  ASSIGN SHELF
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

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
const assignButton = {
  background: "var(--accent-green)",
  color: "#000",
  border: "none",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  fontFamily: "var(--font-mono)",
  fontWeight: "700",
};
