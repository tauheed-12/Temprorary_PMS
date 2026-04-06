import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/config";
import useWindowSize from "../hooks/useWindowSize";
import StaffForm from "../components/Staff/StaffForm";
import StaffList from "../components/Staff/StaffList";

const LEVEL_LABEL = {
  1: "CLERK",
  2: "OWNER",
  3: "SUPPORT",
  4: "CHAIN OWNER",
  5: "ADMIN",
};

export default function Staff() {
  const { user } = useAuth();
  const { isMobile } = useWindowSize();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchStaff = () => {
    setLoading(true);
    api
      .get("/api/accounts/staff/")
      .then((res) => setStaff(res.data.results || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: isMobile ? "16px" : "20px",
              fontWeight: "600",
              fontFamily: "var(--font-mono)",
              color: "var(--text-primary)",
            }}
          >
            STAFF
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginTop: "2px",
            }}
          >
            {staff.length} {staff.length === 1 ? "MEMBER" : "MEMBERS"} ·{" "}
            {user?.pharmacy?.name || "Your Pharmacy"}
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
          }}
          style={{
            background: showForm ? "transparent" : "var(--accent-green)",
            color: showForm ? "var(--text-secondary)" : "#000",
            border: showForm ? "1px solid var(--border)" : "none",
            borderRadius: "var(--radius-sm)",
            padding: "8px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {showForm ? "CANCEL" : "+ ADD STAFF"}
        </button>
      </div>

      {/* ── Success banner ── */}
      {success && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-green)",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            fontSize: "12px",
            color: "var(--accent-green)",
            fontFamily: "var(--font-mono)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {/* ── Create staff form ── */}
      {showForm && (
        <StaffForm
          onSuccess={(newStaff) => {
            setStaff((prev) => [newStaff, ...prev]);
            setSuccess(
              `${LEVEL_LABEL[newStaff.privilege_level]} account created for ${newStaff.name || newStaff.phone_number}.`,
            );
            setShowForm(false);
            setTimeout(() => setSuccess(""), 4000);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* ── Staff list ── */}
      <StaffList
        staff={staff}
        loading={loading}
        user={user}
        isMobile={isMobile}
      />
    </div>
  );
}
