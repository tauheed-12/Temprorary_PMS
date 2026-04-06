import MedicineCard from "./MedicineCard";
import EmptyState from "./EmptyState";

export default function MedicineList({
  medicines,
  loading,
  isOwner,
  onDeactivate,
  onReactivate,
}) {
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

  if (medicines.length === 0) {
    return (
      <EmptyState
        message="NO MEDICINES YET"
        sub="Add your first medicine to get started"
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "8px",
      }}
    >
      {[...medicines]
        .sort((a, b) => b.is_active - a.is_active)
        .map((med) => (
          <MedicineCard
            key={med.id}
            med={med}
            isOwner={isOwner}
            onDeactivate={onDeactivate}
            onReactivate={onReactivate}
          />
        ))}
    </div>
  );
}
