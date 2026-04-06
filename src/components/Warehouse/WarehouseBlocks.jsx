export default function WarehouseBlocks({
  isMobile,
  showBlockForm,
  onToggleBlockForm,
  blockForm,
  onBlockFormChange,
  error,
  submitting,
  onCreateBlock,
  blocks,
  onSelectBlock,
}) {
  return (
    <>
      {showBlockForm && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
            }}
          >
            NEW WAREHOUSE BLOCK
          </div>
          <form onSubmit={onCreateBlock}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 2fr",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <div style={fieldWrap}>
                <label style={labelStyle}>BLOCK LETTER *</label>
                <input
                  value={blockForm.block_letter}
                  onChange={(e) =>
                    onBlockFormChange({
                      ...blockForm,
                      block_letter: e.target.value.slice(0, 1).toUpperCase(),
                    })
                  }
                  placeholder="A"
                  required
                  maxLength={1}
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>SHELF COUNT *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={blockForm.shelf_count}
                  onChange={(e) =>
                    onBlockFormChange({
                      ...blockForm,
                      shelf_count: e.target.value,
                    })
                  }
                  required
                  style={inputStyle}
                />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>LABEL (optional)</label>
                <input
                  value={blockForm.label}
                  onChange={(e) =>
                    onBlockFormChange({ ...blockForm, label: e.target.value })
                  }
                  placeholder="e.g. Antibiotics, Refrigerated"
                  style={inputStyle}
                />
              </div>
            </div>
            {error && (
              <p
                style={{
                  color: "var(--accent-red)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  marginBottom: "12px",
                }}
              >
                {error}
              </p>
            )}
            <button type="submit" disabled={submitting} style={submitBtn}>
              {submitting ? "SAVING..." : "CREATE BLOCK"}
            </button>
          </form>
        </div>
      )}

      {blocks.length === 0 ? (
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
            NO BLOCKS YET
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "6px",
            }}
          >
            Create warehouse blocks to organise your stock
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile
              ? "1fr 1fr"
              : "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              onClick={() => onSelectBlock(block)}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "var(--accent-blue)",
                  }}
                >
                  {block.block_letter}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {block.occupied_shelves}/{block.shelf_count} shelves
                </div>
              </div>
              {block.label && (
                <div
                  style={{ fontSize: "11px", color: "var(--text-secondary)" }}
                >
                  {block.label}
                </div>
              )}
              <div
                style={{
                  height: "4px",
                  background: "var(--bg-primary)",
                  borderRadius: "2px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(100, (block.occupied_shelves / block.shelf_count) * 100)}%`,
                    background: "var(--accent-blue)",
                    borderRadius: "2px",
                    transition: "width 0.3s",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.06em",
                }}
              >
                CLICK TO VIEW SHELVES →
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const fieldWrap = { display: "flex", flexDirection: "column", gap: "5px" };
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
const submitBtn = {
  background: "var(--accent-green)",
  color: "#000",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "9px 20px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  cursor: "pointer",
};
