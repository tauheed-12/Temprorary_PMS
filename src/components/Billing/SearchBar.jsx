import { useState, useEffect, useRef, useCallback } from "react";
import { searchMedicines } from "../../api/inventory";
import ScheduleBadge from "./ScheduleBadge";

function SearchBar({ commitToCart }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [pendingAdd, setPendingAdd] = useState(null); // { med, batch } waiting for qty
  const [qtyValue, setQtyValue] = useState("1");
  const [uomValue, setUomValue] = useState("Tabs");
  const [noStockMsg, setNoStockMsg] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const uomInputRef = useRef(null);
  const qtyInputRef = useRef(null);
  const addBtnRef = useRef(null);
  const noStockTimerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const autoAddRef = useRef(false);

  const selectForAdd = useCallback((med, batch) => {
    setSearchResults([]);
    setSearchOpen(false);
    setQuery("");
    setPendingAdd({ med, batch });
    setQtyValue("1");
    setUomValue("Tabs");
    setTimeout(() => uomInputRef.current?.focus(), 30);
  }, []);

  const doSearch = useCallback(
    async (q) => {
      if (q.length < 2) return;
      try {
        const res = await searchMedicines(q);
        const results = res.data.results || [];
        const sorted = [
          ...results.filter((m) => m.live_batches?.length > 0),
          ...results.filter((m) => !m.live_batches?.length),
        ];
        if (autoAddRef.current) {
          autoAddRef.current = false;
          const inStock = sorted.filter((m) => m.live_batches?.length > 0);
          if (inStock.length === 1) {
            const med = inStock[0];
            const batch = [...med.live_batches].sort((a, b) =>
              a.expiry_date.localeCompare(b.expiry_date),
            )[0];
            selectForAdd(med, batch);
            return;
          }
        }
        setSearchResults(sorted);
        setSearchOpen(true);
      } catch {}
    },
    [selectForAdd],
  );

  useEffect(() => {
    if (noStockMsg) {
      clearTimeout(noStockTimerRef.current);
      setNoStockMsg(false);
    }
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    debounceTimerRef.current = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(debounceTimerRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && query.length >= 2) {
      clearTimeout(debounceTimerRef.current);
      if (searchResults.length > 0) {
        const inStock = searchResults.filter((m) => m.live_batches?.length > 0);
        if (inStock.length > 0) {
          const med = inStock[0];
          const batch = [...med.live_batches].sort((a, b) =>
            a.expiry_date.localeCompare(b.expiry_date),
          )[0];
          selectForAdd(med, batch);
        } else {
          setNoStockMsg(true);
          clearTimeout(noStockTimerRef.current);
          noStockTimerRef.current = setTimeout(
            () => setNoStockMsg(false),
            3000,
          );
        }
      } else {
        autoAddRef.current = true;
        doSearch(query);
      }
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (
        e.key === "F3" ||
        (e.key === "/" &&
          !["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      ) {
        e.preventDefault();
        setPendingAdd(null);
        setQtyValue("1");
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (pendingAdd) {
          setPendingAdd(null);
          setQtyValue("1");
          inputRef.current?.focus();
        } else {
          setQuery("");
          setSearchResults([]);
          setSearchOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pendingAdd]);

  return (
    <div ref={searchRef} style={{ position: "relative", flexShrink: 0 }}>
      <input
        id="main-search-bar"
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !searchOpen) {
            e.preventDefault();
            document.getElementById("cart-row-0")?.focus();
          } else {
            handleSearchKeyDown(e);
          }
        }}
        placeholder="Search by name, salt or scan barcode..."
        autoComplete="off"
        style={{ ...iStyle, fontSize: "14px", padding: "10px 14px" }}
      />
      {pendingAdd && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--accent-green)",
            borderRadius: "var(--radius-md)",
            zIndex: 200,
            padding: "14px 16px",
            marginTop: "4px",
            boxShadow: "var(--shadow)",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "2px",
            }}
          >
            {pendingAdd.med.name}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            Batch {pendingAdd.batch.batch_number} · MRP ₹{pendingAdd.batch.mrp}/strip
            {" · "}Exp {pendingAdd.batch.expiry_date ? (() => { const p = pendingAdd.batch.expiry_date.split("-"); return `${p[1]}/${p[0]}`; })() : ""}
            {" · "}{pendingAdd.batch.available_quantity} tabs in stock
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
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
                UOM
              </label>
              <select
                ref={uomInputRef}
                className="focus-ring-input"
                value={uomValue}
                onChange={(e) => setUomValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    qtyInputRef.current?.focus();
                  }
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    addBtnRef.current?.focus();
                  }
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault();
                    setUomValue((prev) => (prev === "Tabs" ? "Strips" : "Tabs"));
                  }
                  if (e.key === "Escape") {
                    setPendingAdd(null);
                    setQtyValue("1");
                    setUomValue("Tabs");
                    inputRef.current?.focus();
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    qtyInputRef.current?.focus();
                  }
                }}
                style={{
                  height: "33.5px", // To identically align alongside the input
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  padding: "0 8px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  outline: "none",
                }}
              >
                <option value="Tabs">Tabs</option>
                <option value="Strips">Strips</option>
              </select>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
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
                QTY ({uomValue.toUpperCase()})
              </label>
              <input
                ref={qtyInputRef}
                className="focus-ring-input"
                type="number"
                value={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const parsedQty = parseInt(qtyValue);
                    const qty = isNaN(parsedQty) ? 1 : parsedQty;
                    commitToCart(pendingAdd.med, pendingAdd.batch, qty, uomValue);
                    setPendingAdd(null);
                    setQtyValue("1");
                    setUomValue("Tabs");
                    inputRef.current?.focus();
                  }
                  if (e.key === "Escape") {
                    setPendingAdd(null);
                    setQtyValue("1");
                    setUomValue("Tabs");
                    inputRef.current?.focus();
                  }
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    uomInputRef.current?.focus();
                  }
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    addBtnRef.current?.focus();
                  }
                }}
                style={{
                  width: "64px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  padding: "6px 8px",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>
            <button
              ref={addBtnRef}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  qtyInputRef.current?.focus();
                }
                if (e.key === "ArrowRight") {
                  e.preventDefault();
                  uomInputRef.current?.focus();
                }
              }}
              onClick={() => {
                commitToCart(
                  pendingAdd.med,
                  pendingAdd.batch,
                  isNaN(parseInt(qtyValue)) ? 1 : parseInt(qtyValue),
                  uomValue
                );
                setPendingAdd(null);
                setQtyValue("1");
                setUomValue("Tabs");
                inputRef.current?.focus();
              }}
              style={{
                marginTop: "14px",
                background: "var(--accent-green)",
                color: "#000",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "6px 14px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              ADD ↵
            </button>
            <button
              onClick={() => {
                setPendingAdd(null);
                setQtyValue("1");
                inputRef.current?.focus();
              }}
              style={{
                marginTop: "14px",
                background: "transparent",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "6px 10px",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              ESC
            </button>
          </div>
        </div>
      )}
      {!pendingAdd && searchOpen && searchResults.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            zIndex: 200,
            maxHeight: "340px",
            overflowY: "auto",
            marginTop: "4px",
            boxShadow: "var(--shadow)",
          }}
        >
          {searchResults.map((med) => (
            <div key={med.id}>
              {/* Medicine header row — always clickable for in-stock medicines, FEFO batch auto-selected */}
              <div
                onClick={
                  med.live_batches?.length > 0
                    ? () => {
                        const fefo = [...med.live_batches].sort((a, b) =>
                          a.expiry_date.localeCompare(b.expiry_date),
                        )[0];
                        selectForAdd(med, fefo);
                      }
                    : undefined
                }
                onMouseEnter={
                  med.live_batches?.length > 0
                    ? (e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                    : undefined
                }
                onMouseLeave={
                  med.live_batches?.length > 0
                    ? (e) =>
                        (e.currentTarget.style.background =
                          "var(--bg-secondary)")
                    : undefined
                }
                style={{
                  padding: "8px 12px",
                  background: "var(--bg-secondary)",
                  borderBottom: "1px solid var(--border)",
                  cursor: med.live_batches?.length > 0 ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {med.name}
                  </span>
                  <span
                    style={{ fontSize: "11px", color: "var(--text-muted)" }}
                  >
                    {med.company}
                  </span>
                  {med.salt_name?.includes("+") && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontFamily: "var(--font-mono)",
                        fontWeight: "700",
                        letterSpacing: "0.06em",
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: "rgba(168,85,247,0.12)",
                        color: "#a855f7",
                        border: "1px solid rgba(168,85,247,0.3)",
                        flexShrink: 0,
                      }}
                    >
                      COMBINATION
                    </span>
                  )}
                </div>
                {med.salt_name && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      marginTop: "2px",
                      fontStyle: "italic",
                    }}
                  >
                    {med.salt_name}
                  </div>
                )}
              </div>

              {/* Out of stock */}
              {med.live_batches?.length === 0 && (
                <div
                  style={{
                    padding: "8px 16px",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  OUT OF STOCK
                </div>
              )}

              {/* Batch rows */}
              {med.live_batches?.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => selectForAdd(med, batch)}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Left: packaging label + batch + expiry */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-primary)",
                      }}
                    >
                      Batch {batch.batch_number}
                    </span>
                    {med.packaging && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontFamily: "var(--font-mono)",
                          color: "var(--accent-blue)",
                          background: "rgba(59,130,246,0.1)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: "3px",
                          padding: "1px 6px",
                          letterSpacing: "0.04em",
                          flexShrink: 0,
                        }}
                      >
                        {med.packaging}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      Exp: {batch.expiry_date ? (() => { const p = batch.expiry_date.split("-"); return `${p[1]}/${p[0]}`; })() : ""}
                    </span>
                  </div>

                  {/* Right: MRP + stock count */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--accent-green)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      ₹{batch.mrp}/strip
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--text-muted)",
                      }}
                    >
                      {batch.available_quantity} tabs in stock
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {noStockMsg && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            border: "1px solid var(--accent-amber)",
            borderRadius: "var(--radius-md)",
            zIndex: 200,
            padding: "10px 14px",
            fontSize: "11px",
            color: "var(--accent-amber)",
            fontFamily: "var(--font-mono)",
            marginTop: "4px",
            letterSpacing: "0.04em",
          }}
        >
          ⚠ No stock available for this medicine
        </div>
      )}
      {!pendingAdd &&
        !noStockMsg &&
        searchOpen &&
        query.length >= 2 &&
        searchResults.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              zIndex: 200,
              padding: "14px",
              fontSize: "12px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginTop: "4px",
            }}
          >
            No medicines found for "{query}"
          </div>
        )}
    </div>
  );
}

const iStyle = {
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  padding: "8px 10px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  width: "100%",
};

export default SearchBar;
