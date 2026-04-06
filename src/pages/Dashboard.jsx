import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getStock } from "../api/inventory";
import { getSalesHistory } from "../api/billing";
import useWindowSize from "../hooks/useWindowSize";
import MetricCard from "../components/Dashboard/MetricCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import BillCard from "../components/Dashboard/BillCard";
import StockCard from "../components/Dashboard/StockCard";
import ExpiryAlert from "../components/Dashboard/ExpiryAlert";

export default function Dashboard() {
  const { user } = useAuth();
  const { isMobile, isTablet } = useWindowSize();
  const [stock, setStock] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStock(), getSalesHistory()])
      .then(([stockRes, billsRes]) => {
        setStock(stockRes.data.results || []);
        setBills(billsRes.data.results || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        LOADING DATA...
      </div>
    );

  // ── Computed metrics ──
  const totalStock = stock.reduce((sum, b) => sum + b.available_quantity, 0);
  const expiryAlerts = stock.filter((b) => {
    const days = Math.ceil(
      (new Date(b.expiry_date) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return days <= 30;
  });
  const todayBills = bills.filter((b) =>
    b.bill_date?.startsWith(new Date().toISOString().slice(0, 10)),
  );
  const todayRevenue = todayBills.reduce(
    (sum, b) => sum + parseFloat(b.grand_total),
    0,
  );
  const totalRevenue = bills.reduce(
    (sum, b) => sum + parseFloat(b.grand_total),
    0,
  );

  // ── Chart data — last 7 bills grouped by date ──
  const chartData = (() => {
    const map = {};
    bills.slice(0, 30).forEach((b) => {
      const date = b.bill_date?.slice(5, 10);
      if (!map[date]) map[date] = { date, revenue: 0, bills: 0 };
      map[date].revenue += parseFloat(b.grand_total);
      map[date].bills += 1;
    });
    return Object.values(map).slice(-7).reverse();
  })();

  // ── Expiry urgency ──
  const getExpiryColor = (expiry) => {
    const days = Math.ceil(
      (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24),
    );
    if (days <= 7) return "var(--accent-red)";
    if (days <= 15) return "var(--accent-amber)";
    return "var(--text-secondary)";
  };

  const metricsGrid = isMobile
    ? "1fr 1fr"
    : isTablet
      ? "1fr 1fr"
      : "repeat(4, 1fr)";
  const mainGrid = isMobile || isTablet ? "1fr" : "3fr 2fr";
  const bottomGrid = isMobile || isTablet ? "1fr" : "1fr 1fr";

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
              color: "var(--text-primary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {user?.pharmacy?.name || "Dashboard"}
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginTop: "2px",
            }}
          >
            {new Date().toDateString().toUpperCase()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--accent-green)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontSize: "10px",
              color: "var(--accent-green)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.1em",
            }}
          >
            LIVE
          </span>
        </div>
      </div>

      {/* ── Metric cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: metricsGrid,
          gap: "10px",
        }}
      >
        <MetricCard
          label="TODAY'S REVENUE"
          value={`₹${todayRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          sub={`${todayBills.length} bills today`}
          color="var(--accent-green)"
        />
        <MetricCard
          label="TOTAL STOCK"
          value={totalStock.toLocaleString()}
          sub="tablets in inventory"
          color="var(--accent-blue)"
        />
        <MetricCard
          label="EXPIRY ALERTS"
          value={expiryAlerts.length}
          sub="items expiring ≤30 days"
          color={
            expiryAlerts.length > 0
              ? "var(--accent-red)"
              : "var(--accent-green)"
          }
        />
        <MetricCard
          label="TOTAL REVENUE"
          value={`₹${totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          sub={`${bills.length} total bills`}
          color="var(--accent-amber)"
        />
      </div>

      {/* ── Chart + Recent Bills ── */}
      <div
        style={{ display: "grid", gridTemplateColumns: mainGrid, gap: "10px" }}
      >
        {/* Sales chart */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>SALES — LAST 7 DAYS</span>
          </div>
          <div style={{ height: "200px", marginTop: "1rem" }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 0, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#4a5568",
                      fontSize: 10,
                      fontFamily: "monospace",
                    }}
                  />
                  <YAxis
                    tick={{
                      fill: "#4a5568",
                      fontSize: 10,
                      fontFamily: "monospace",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1a2235",
                      border: "1px solid #1e2d45",
                      borderRadius: "4px",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#94a3b8" }}
                    itemStyle={{ color: "#22c55e" }}
                    formatter={(v) => [`₹${v}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                }}
              >
                NO SALES DATA YET
              </div>
            )}
          </div>
        </div>

        {/* Recent bills */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>RECENT BILLS</span>
            <span
              style={{
                fontSize: "10px",
                color: "var(--accent-amber)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {bills.length} TOTAL
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "1rem",
            }}
          >
            {bills.slice(0, 5).map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
            {bills.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "1rem",
                }}
              >
                NO BILLS YET
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Expiry Watch + Stock Summary ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: bottomGrid,
          gap: "10px",
        }}
      >
        {/* Expiry watch */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>EXPIRY WATCH</span>
            <span
              style={{
                fontSize: "10px",
                color:
                  expiryAlerts.length > 0
                    ? "var(--accent-red)"
                    : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {expiryAlerts.length} ALERTS
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "1rem",
            }}
          >
            {expiryAlerts.slice(0, 6).map((batch) => {
              return <ExpiryAlert key={batch.id} batch={batch} />;
            })}
            {expiryAlerts.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--accent-green)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "1rem",
                }}
              >
                ✓ ALL STOCK HEALTHY
              </div>
            )}
          </div>
        </div>

        {/* Stock summary */}
        <div style={card}>
          <div style={cardHeader}>
            <span style={cardTitle}>STOCK SUMMARY</span>
            <span
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {stock.length} BATCHES
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "1rem",
            }}
          >
            {stock.slice(0, 6).map((batch) => (
              <StockCard key={batch.id} batch={batch} />
            ))}
            {stock.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  padding: "1rem",
                }}
              >
                NO STOCK YET
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  padding: "1rem",
};

const cardHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const cardTitle = {
  fontSize: "10px",
  color: "var(--text-secondary)",
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.1em",
};
