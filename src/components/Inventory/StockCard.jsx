import { getDaysLeft } from "../../utils";
import { getExpiryColor } from "../../utils";
import useWindowSize from "../../hooks/useWindowSize";

export default function StockCard({ batch, onReturn }) {
  const { isMobile } = useWindowSize();
  const days = getDaysLeft(batch.expiry_date);
  const expiryColor = getExpiryColor(batch.expiry_date);
  return (
    <div
      key={batch.id}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 12px",
        display: isMobile ? "flex" : "grid",
        gridTemplateColumns: "3fr 1fr 1fr 1fr 1fr 1fr 1fr",
        flexDirection: isMobile ? "column" : undefined,
        gap: "8px",
        alignItems: "center",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "var(--text-primary)",
            }}
          >
            {batch.medicine_name}
          </div>
          {batch.packaging && (
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
              {batch.packaging}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "var(--text-secondary)",
          }}
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
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: expiryColor,
          }}
        >
          {batch.expiry_date}
        </div>
        <div style={{ fontSize: "10px", color: expiryColor }}>{days}d left</div>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          fontWeight: "600",
          color:
            batch.available_quantity < 50
              ? "var(--accent-amber)"
              : "var(--accent-blue)",
        }}
      >
        {batch.available_quantity}
        <span
          style={{
            fontSize: "9px",
            color: "var(--text-muted)",
            marginLeft: "3px",
          }}
        >
          tabs
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-primary)",
        }}
      >
        ₹{batch.mrp}
      </div>
      <div>
        {batch.shelf ? (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 7px",
              borderRadius: "3px",
              background: "rgba(34,197,94,0.1)",
              color: "var(--accent-green)",
              fontFamily: "var(--font-mono)",
            }}
          >
            SHELF {batch.shelf}
          </span>
        ) : (
          <span
            style={{
              fontSize: "10px",
              padding: "2px 7px",
              borderRadius: "3px",
              background: "rgba(239,68,68,0.1)",
              color: "var(--accent-red)",
              fontFamily: "var(--font-mono)",
            }}
          >
            UNASSIGNED
          </span>
        )}
      </div>
      {onReturn && (
        <button
          onClick={() => onReturn(batch)}
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--accent-red)",
            color: "var(--accent-red)",
            padding: "4px 8px",
            borderRadius: "3px",
            fontSize: "10px",
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            cursor: "pointer",
            marginLeft: isMobile ? "0" : "auto"
          }}
        >
          RETURN
        </button>
      )}
    </div>
  );
}
