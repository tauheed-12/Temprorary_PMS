import { getDaysLeft } from "../../utils";
import { getExpiryColor } from "../../utils";

export default function ExpiryAlert({ batch }) {
  const days = getDaysLeft(batch.expiry_date);
  const pct = Math.max(0, Math.min(100, (days / 30) * 100));

  return (
    <div key={batch.id}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "3px",
        }}
      >
        <span style={{ fontSize: "11px", color: "var(--text-primary)" }}>
          {batch.medicine_name} — {batch.batch_number}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: getExpiryColor(batch.expiry_date),
            fontFamily: "var(--font-mono)",
          }}
        >
          {days}d
        </span>
      </div>
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
            width: `${pct}%`,
            height: "100%",
            background: getExpiryColor(batch.expiry_date),
            borderRadius: "2px",
          }}
        />
      </div>
    </div>
  );
}
