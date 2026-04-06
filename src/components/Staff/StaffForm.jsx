import { useState } from "react";
import api from "../../api/config";
import Field from "../Inventory/Field";

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

export default function StaffForm({ onSuccess, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone_number: "",
    password: "",
    privilege_level: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.post("/api/accounts/staff/", {
        name: form.name,
        phone_number: form.phone_number,
        password: form.password,
        privilege_level: Number(form.privilege_level),
      });
      onSuccess(res.data);
      setForm({ name: "", phone_number: "", password: "", privilege_level: 1 });
    } catch (err) {
      const data = err.response?.data;
      if (data?.phone_number) setError(data.phone_number[0]);
      else if (data?.password) setError(data.password[0]);
      else if (data?.detail) setError(data.detail);
      else if (data?.privilege_level) setError(data.privilege_level[0]);
      else setError("Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateForm = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  return (
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
          marginBottom: "1.25rem",
        }}
      >
        NEW STAFF ACCOUNT
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          {/* Name */}
          <Field
            label="NAME"
            value={form.name}
            onChange={(v) => updateForm("name", v)}
            placeholder="e.g. Ramesh Kumar"
          />

          {/* Phone */}
          <Field
            label="PHONE NUMBER *"
            value={form.phone_number}
            onChange={(v) => updateForm("phone_number", v)}
            placeholder="e.g. 9876543210"
            type="tel"
            required
          />

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label
              style={{
                fontSize: "9px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
              }}
            >
              PASSWORD *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={(e) => updateForm("password", e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 42px 8px 10px",
                  color: "var(--text-primary)",
                  fontSize: "13px",
                  outline: "none",
                  width: "100%",
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "11px",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.05em",
                }}
              >
                {showPass ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          {/* Role */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
              gridColumn: "1 / -1",
            }}
          >
            <label
              style={{
                fontSize: "9px",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.1em",
              }}
            >
              ROLE
            </label>
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                marginTop: "4px",
              }}
            >
              {[
                {
                  value: 1,
                  label: "CLERK",
                  desc: "Can bill and view stock",
                },
              ].map((role) => {
                const active = Number(form.privilege_level) === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => updateForm("privilege_level", role.value)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "2px",
                      padding: "10px 14px",
                      borderRadius: "var(--radius-sm)",
                      border: active
                        ? `1px solid ${LEVEL_COLOR[role.value].text}`
                        : "1px solid var(--border)",
                      background: active
                        ? LEVEL_COLOR[role.value].bg
                        : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      minWidth: "140px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.08em",
                        color: active
                          ? LEVEL_COLOR[role.value].text
                          : "var(--text-secondary)",
                      }}
                    >
                      {role.label}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {role.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {error && (
          <p
            style={{
              color: "var(--accent-red)",
              fontSize: "12px",
              fontFamily: "var(--font-mono)",
              marginBottom: "14px",
            }}
          >
            ✕ {error}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={submitting} style={submitBtn}>
            {submitting ? "CREATING..." : "CREATE ACCOUNT"}
          </button>
          <button type="button" onClick={onCancel} style={cancelBtn}>
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
}

const submitBtn = {
  background: "var(--accent-green)",
  color: "#000",
  border: "none",
  borderRadius: "var(--radius-sm)",
  padding: "9px 22px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  cursor: "pointer",
};

const cancelBtn = {
  background: "transparent",
  color: "var(--text-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "9px 20px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  cursor: "pointer",
};
