import { useState, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setBlocks,
  setUnassigned,
  setSelectedBlock,
  setShelves,
} from "../store/slices/inventorySlice";
import {
  getBlocks,
  createBlock,
  getUnassignedBatches,
  assignBatch,
} from "../api/inventory";
import api from "../api/config";
import useWindowSize from "../hooks/useWindowSize";
import WarehouseBlocks from "../components/Warehouse/WarehouseBlocks";
import WarehouseUnassigned from "../components/Warehouse/WarehouseUnassigned";
import WarehouseShelves from "../components/Warehouse/WarehouseShelves";

export default function Warehouse() {
  const { isMobile } = useWindowSize();
  const dispatch = useAppDispatch();
  const blocks = useAppSelector((state) => state.inventory.blocks);
  const unassigned = useAppSelector((state) => state.inventory.unassigned);
  const selectedBlock = useAppSelector(
    (state) => state.inventory.selectedBlock,
  );
  const shelves = useAppSelector((state) => state.inventory.shelves);
  const [activeTab, setActiveTab] = useState("blocks");
  const [loading, setLoading] = useState(true);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [shelvesLoading, setShelvesLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [assignTarget, setAssignTarget] = useState({
    block_letter: "",
    shelf_number: "",
  });
  const [assignError, setAssignError] = useState("");
  const [blockForm, setBlockForm] = useState({
    block_letter: "",
    shelf_count: 5,
    label: "",
  });
  const [auditMode, setAuditMode] = useState(false);

  const fetchAll = useCallback(() => {
    setLoading(true);
    Promise.all([getBlocks(), getUnassignedBatches()])
      .then(([blocksRes, unassignedRes]) => {
        dispatch(setBlocks(blocksRes.data.results || blocksRes.data || []));
        dispatch(
          setUnassigned(unassignedRes.data.results || unassignedRes.data || []),
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchShelves = async (blockLetter) => {
    setShelvesLoading(true);
    dispatch(setShelves([]));
    try {
      const res = await api.get(
        `/api/inventory/blocks/${blockLetter}/shelves/`,
      );
      dispatch(setShelves(res.data.results || res.data || []));
    } catch (error) {
      console.error("Failed to fetch shelves:", error);
    }
    setShelvesLoading(false);
  };

  const handleSelectBlock = (block) => {
    dispatch(setSelectedBlock(block));
    fetchShelves(block.block_letter);
    setActiveTab("shelves");
  };

  const handleCreateBlock = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await createBlock({
        block_letter: blockForm.block_letter.toUpperCase(),
        shelf_count: parseInt(blockForm.shelf_count),
        label: blockForm.label || undefined,
      });
      dispatch(setBlocks([...blocks, res.data]));
      setSuccess(`Block ${res.data.block_letter} created.`);
      setBlockForm({ block_letter: "", shelf_count: 5, label: "" });
      setShowBlockForm(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.block_letter?.[0] ||
          data?.non_field_errors?.[0] ||
          "Failed to create block.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (batch) => {
    if (!assignTarget.block_letter || !assignTarget.shelf_number) {
      setAssignError("Enter block letter and shelf number.");
      return;
    }

    setAssignError("");
    setSubmitting(true);

    try {
      await assignBatch(batch.id, {
        block_letter: assignTarget.block_letter.toUpperCase(),
        shelf_number: parseInt(assignTarget.shelf_number),
      });
      dispatch(setUnassigned(unassigned.filter((b) => b.id !== batch.id)));
      setAssigning(null);
      setAssignTarget({ block_letter: "", shelf_number: "" });
      setSuccess(
        `${batch.medicine_name} assigned to ${assignTarget.block_letter.toUpperCase()}-${assignTarget.shelf_number}.`,
      );
      setTimeout(() => setSuccess(""), 3000);
      fetchAll();
      if (selectedBlock) fetchShelves(selectedBlock.block_letter);
    } catch (err) {
      const data = err.response?.data;
      setAssignError(
        data?.non_field_errors?.[0] ||
          JSON.stringify(data) ||
          "Assignment failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysLeft = (expiry) =>
    Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
  const getExpiryColor = (expiry) => {
    const d = getDaysLeft(expiry);
    if (d <= 7) return "var(--accent-red)";
    if (d <= 30) return "var(--accent-amber)";
    return "var(--accent-green)";
  };

  const tabs = [
    { key: "blocks", label: `BLOCKS (${blocks.length})` },
    { key: "unassigned", label: `UNASSIGNED (${unassigned.length})` },
    ...(selectedBlock
      ? [{ key: "shelves", label: `${selectedBlock.block_letter} — SHELVES` }]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? "16px" : "20px",
            fontWeight: "600",
            fontFamily: "var(--font-mono)",
            color: "var(--text-primary)",
          }}
        >
          WAREHOUSE
        </h1>
        {activeTab === "blocks" && (
          <button
            onClick={() => {
              setShowBlockForm(!showBlockForm);
              setError("");
            }}
            style={{
              background: showBlockForm ? "transparent" : "var(--accent-green)",
              color: showBlockForm ? "var(--text-secondary)" : "#000",
              border: showBlockForm ? "1px solid var(--border)" : "none",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {showBlockForm ? "CANCEL" : "+ ADD BLOCK"}
          </button>
        )}
        {activeTab === "shelves" && (
          <button
            onClick={() => setAuditMode(!auditMode)}
            style={{
              background: auditMode ? "var(--accent-red)" : "transparent",
              color: auditMode ? "#000" : "var(--text-secondary)",
              border: auditMode ? "none" : "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {auditMode ? "EXIT AUDIT MODE" : "ENTER AUDIT MODE"}
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              letterSpacing: "0.08em",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid var(--accent-green)"
                  : "2px solid transparent",
              color:
                activeTab === tab.key
                  ? "var(--accent-green)"
                  : "var(--text-secondary)",
              cursor: "pointer",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
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

      {loading && (
        <div
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
          }}
        >
          LOADING...
        </div>
      )}

      {!loading && activeTab === "blocks" && (
        <WarehouseBlocks
          isMobile={isMobile}
          showBlockForm={showBlockForm}
          blockForm={blockForm}
          onBlockFormChange={setBlockForm}
          error={error}
          submitting={submitting}
          onCreateBlock={handleCreateBlock}
          blocks={blocks}
          onSelectBlock={handleSelectBlock}
        />
      )}

      {!loading && activeTab === "unassigned" && (
        <WarehouseUnassigned
          isMobile={isMobile}
          unassigned={unassigned}
          assigning={assigning}
          assignTarget={assignTarget}
          onStartAssign={setAssigning}
          onCancelAssign={() => {
            setAssigning(null);
            setAssignError("");
          }}
          onAssignTargetChange={setAssignTarget}
          onAssignBatch={handleAssign}
          getExpiryColor={getExpiryColor}
          assignError={assignError}
          submitting={submitting}
        />
      )}

      {!loading && activeTab === "shelves" && selectedBlock && (
        <WarehouseShelves
          selectedBlock={selectedBlock}
          shelvesLoading={shelvesLoading}
          shelves={shelves}
          auditMode={auditMode}
          onSyncComplete={() => fetchShelves(selectedBlock.block_letter)}
        />
      )}
    </div>
  );
}
