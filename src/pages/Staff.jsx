import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setStaff } from "../store/slices/inventorySlice";
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
  const dispatch = useAppDispatch();
  const staff = useAppSelector((state) => state.inventory.staff);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get("/api/accounts/staff/")
      .then((res) => dispatch(setStaff(res.data.results || res.data || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading)
    return (
      <div
        style={{
          color: "var(--text-secondary)",
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "2rem",
        }}
      >
        LOADING STAFF DATA...
      </div>
    );

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
            {staff.length} TOTAL STAFF MEMBERS
          </p>
        </div>
        {user?.privilege_level >= 2 && (
          <button
            onClick={() => {
              setShowForm(!showForm);
              setSuccess("");
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
            }}
          >
            {showForm ? "CANCEL" : "+ ADD STAFF"}
          </button>
        )}
      </div>

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
          }}
        >
          ✓ {success}
        </div>
      )}

      {showForm && (
        <StaffForm
          onSuccess={(newStaff) => {
            dispatch(setStaff([newStaff, ...staff]));
            setSuccess("Staff member added successfully.");
            setShowForm(false);
            setTimeout(() => setSuccess(""), 3000);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      <StaffList
        staff={staff}
        userLevel={user?.privilege_level || 1}
        levelLabels={LEVEL_LABEL}
      />
    </div>
  );
}
