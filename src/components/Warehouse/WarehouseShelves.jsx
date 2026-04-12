import { useState, useEffect } from "react";
import { syncStock } from "../../api/inventory";

export default function WarehouseShelves({
  selectedBlock,
  shelvesLoading,
  shelves,
  auditMode = false,
  onSyncComplete,
}) {
  const [counts, setCounts] = useState({});
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    if (auditMode && shelves) {
      const initialCounts = {};
      shelves.forEach((shelf) => {
        initialCounts[shelf.id] = {};
        (shelf.batches || []).forEach((b) => {
          initialCounts[shelf.id][b.id] = b.available_quantity;
        });
      });
      setCounts(initialCounts);
    }
  }, [auditMode, shelves]);

  const handleSync = async (shelf) => {
    setSyncing(shelf.id);
    const payload = {
      block_letter: selectedBlock.block_letter,
      shelf_number: shelf.shelf_number || parseInt(shelf.address.split("-")[1]),
      items: Object.entries(counts[shelf.id] || {}).map(([batchId, qty]) => ({
        inventory_batch_id: batchId,
        actual_quantity: parseInt(qty) || 0,
      })),
    };
    try {
      await syncStock(payload);
      alert(`Shelf ${shelf.address} synced successfully!`);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      alert("Failed to sync shelf.");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "22px",
            fontWeight: "700",
            color: "var(--accent-blue)",
          }}
        >
          Block {selectedBlock.block_letter}
        </div>
        {selectedBlock.label && (
          <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {selectedBlock.label}
          </div>
        )}
        <div
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {selectedBlock.shelf_count} shelves configured
        </div>
      </div>

      {shelvesLoading ? (
        <div
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          LOADING SHELVES...
        </div>
      ) : shelves.length === 0 ? (
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
            NO STOCK ASSIGNED YET
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-muted)",
              marginTop: "6px",
            }}
          >
            Assign batches from the Unassigned tab to populate this block
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {shelves.map((shelf) => (
            <div
              key={shelf.id}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--accent-blue)",
                    background: "rgba(59,130,246,0.12)",
                    padding: "3px 10px",
                    borderRadius: "4px",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }}
                >
                  {shelf.address}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {shelf.batches?.length || 0}{" "}
                  {shelf.batches?.length === 1 ? "batch" : "batches"}
                </div>
                {auditMode && (
                  <button
                    onClick={() => handleSync(shelf)}
                    disabled={syncing === shelf.id}
                    style={{
                      marginLeft: "auto",
                      background: "var(--accent-red)",
                      color: "#000",
                      border: "none",
                      borderRadius: "3px",
                      padding: "4px 10px",
                      fontSize: "11px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      cursor: syncing === shelf.id ? "not-allowed" : "pointer"
                    }}
                  >
                    {syncing === shelf.id ? "SYNCING..." : "SYNC COUNTS"}
                  </button>
                )}
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                {(shelf.batches || []).map((batch) => (
                  <div
                    key={batch.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      background: "var(--bg-secondary)",
                      borderRadius: "var(--radius-sm)",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-primary)",
                        }}
                      >
                        {batch.medicine_name}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {batch.batch_number} · Exp {batch.expiry_date}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                      }}
                    >
                      {auditMode ? (
                        <input
                          type="number"
                          value={counts[shelf.id]?.[batch.id] ?? batch.available_quantity}
                          onChange={(e) => setCounts(prev => ({
                            ...prev,
                            [shelf.id]: {
                              ...prev[shelf.id],
                              [batch.id]: e.target.value
                            }
                          }))}
                          style={{
                            width: "60px",
                            padding: "4px",
                            background: "var(--bg-card)",
                            border: "1px solid var(--accent-red)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-mono)",
                            fontSize: "12px",
                            textAlign: "right"
                          }}
                        />
                      ) : (
                        <>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "13px",
                              fontWeight: "600",
                              color: "var(--accent-blue)",
                            }}
                          >
                            {batch.available_quantity}{" "}
                            <span
                              style={{
                                fontSize: "9px",
                                color: "var(--text-muted)",
                              }}
                            >
                              tabs
                            </span>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "12px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            ₹{batch.mrp}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
