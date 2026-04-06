import { useState } from "react";
import StaffCard from "./StaffCard";

const LEVEL_LABEL = {
  1: "CLERK",
  2: "OWNER",
  3: "SUPPORT",
  4: "CHAIN OWNER",
  5: "ADMIN",
};
const LEVEL_COLOR = {
  1: { bg: "rgba(59,130,246,0.12)", text: "var(--accent-blue)" },
  2: { bg: "rgba(34,197,94,0.12)", text: "var(--accent-green)" },
  3: { bg: "rgba(245,158,11,0.12)", text: "var(--accent-amber)" },
  4: { bg: "rgba(168,85,247,0.12)", text: "#a855f7" },
  5: { bg: "rgba(239,68,68,0.12)", text: "var(--accent-red)" },
};

export default function StaffList({ staff, loading, user, isMobile }) {
  const [search, setSearch] = useState("");

  const filtered = staff.filter(
    (s) =>
      (s.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.phone_number || "").includes(search),
  );

  // Separate current user from the rest
  const others = filtered.filter((s) => s.id !== user?.id);
  const self = filtered.find((s) => s.id === user?.id);

  if (loading) {
    return (
      <div
        style={{
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
        }}
      >
        LOADING...
      </div>
    );
  }

  if (staff.length === 0) {
    return (
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
          NO STAFF YET
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "6px",
          }}
        >
          Add clerks or co-owners to give them access
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Search */}
      <input
        placeholder="Search by name or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 10px",
          color: "var(--text-primary)",
          fontSize: "13px",
          outline: "none",
          maxWidth: "320px",
        }}
      />

      {/* Your account (pinned at top) */}
      {self && (
        <div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            YOUR ACCOUNT
          </div>
          <StaffCard
            member={self}
            isSelf={true}
            isMobile={isMobile}
            LEVEL_COLOR={LEVEL_COLOR}
            LEVEL_LABEL={LEVEL_LABEL}
          />
        </div>
      )}

      {/* Staff list */}
      {others.length > 0 && (
        <div>
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            {others.length} {others.length === 1 ? "MEMBER" : "MEMBERS"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {others.map((member) => (
              <StaffCard
                key={member.id}
                member={member}
                isSelf={false}
                isMobile={isMobile}
                LEVEL_COLOR={LEVEL_COLOR}
                LEVEL_LABEL={LEVEL_LABEL}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results from search */}
      {search && filtered.length === 0 && (
        <div
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            padding: "1rem 0",
          }}
        >
          No staff found matching "{search}"
        </div>
      )}
    </div>
  );
}
