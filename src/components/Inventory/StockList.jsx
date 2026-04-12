import StockCard from "./StockCard";
import EmptyState from "./EmptyState";
import useWindowSize from "../../hooks/useWindowSize";

export default function StockList({ stock, search, filter, loading, onReturn }) {
  const { isMobile } = useWindowSize();

  const filteredStock = stock.filter((batch) => {
    const days = Math.ceil(
      (new Date(batch.expiry_date) - new Date()) / (1000 * 60 * 60 * 24),
    );
    const matchSearch =
      batch.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
      batch.batch_number?.toLowerCase().includes(search.toLowerCase());
    if (filter === "low") return matchSearch && batch.available_quantity < 50;
    if (filter === "expiring") return matchSearch && days <= 30;
    if (filter === "unassigned") return matchSearch && !batch.shelf;
    return matchSearch;
  });

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

  if (filteredStock.length === 0) {
    return (
      <EmptyState
        message="NO STOCK FOUND"
        sub="Add purchase bills to stock your inventory"
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {!isMobile && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: "8px",
            padding: "6px 12px",
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
          <span>MRP</span>
          <span>SHELF</span>
        </div>
      )}
      {filteredStock.map((batch) => (
        <StockCard key={batch.id} batch={batch} onReturn={onReturn} />
      ))}
    </div>
  );
}
