import { useAuth } from "../../context/AuthContext";

function Receipt({ receipt, onNew }) {
  const { user } = useAuth();
  const pharmacy = user?.pharmacy;

  const billDate = new Date(receipt.bill_date);
  const dateStr = billDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = billDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Aggregate CGST / SGST / IGST from snapshot for receipt totals
  const taxBreakdown = (receipt.items_snapshot || []).reduce(
    (acc, item) => {
      acc.cgst += parseFloat(item.cgst_amount || 0);
      acc.sgst += parseFloat(item.sgst_amount || 0);
      acc.igst += parseFloat(item.igst_amount || 0);
      return acc;
    },
    { cgst: 0, sgst: 0, igst: 0 },
  );

  const isIgst = taxBreakdown.igst > 0;

  const hrStyle = {
    border: "none",
    borderTop: "1px dashed #000",
    margin: "4px 0",
  };

  return (
    <>
      {/* ── Screen view ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          maxWidth: "560px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "18px",
              color: "var(--accent-green)",
            }}
          >
            ✓ SALE COMPLETE
          </h1>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => window.print()}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              PRINT
            </button>
            <button
              onClick={onNew}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                background: "var(--accent-green)",
                color: "#000",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              NEW SALE
            </button>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {pharmacy && (
            <div
              style={{
                borderBottom: "1px solid var(--border)",
                paddingBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                {pharmacy.name}
              </div>
              {pharmacy.drug_license_no && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  DL: {pharmacy.drug_license_no}
                </div>
              )}
              {pharmacy.gstin && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  GSTIN: {pharmacy.gstin}
                </div>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                {receipt.customer_name ||
                  receipt.customer_phone ||
                  "Guest Customer"}
              </div>
              {receipt.customer_name && receipt.customer_phone && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {receipt.customer_phone}
                </div>
              )}
              {receipt.buyer_address && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-muted)",
                    maxWidth: "240px",
                  }}
                >
                  {receipt.buyer_address}
                </div>
              )}
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {dateStr} {timeStr}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {receipt.invoice_number ? (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Invoice No.
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                    }}
                  >
                    {receipt.invoice_number}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    Bill ID
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {receipt.id?.slice(0, 8).toUpperCase()}
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {(receipt.items_snapshot || []).map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <div>
                  <div
                    style={{ fontSize: "13px", color: "var(--text-primary)" }}
                  >
                    {item.medicine_name}
                    {item.drug_schedule && item.drug_schedule !== "GENERAL" && (
                      <span
                        style={{
                          marginLeft: "6px",
                          fontSize: "9px",
                          fontFamily: "var(--font-mono)",
                          color:
                            item.drug_schedule === "NARCOTIC"
                              ? "#ef4444"
                              : "#f97316",
                        }}
                      >
                        [
                        {item.drug_schedule === "NARCOTIC"
                          ? "NARCOTIC"
                          : `SCH-${item.drug_schedule}`}
                        ]
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    Batch {item.batch_number} · Exp{" "}
                    {item.expiry_date
                      ? `${item.expiry_date.split("-")[1]}/${item.expiry_date.split("-")[0]}`
                      : ""}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {item.quantity} {item.uom === 'Strips' ? 'Strips' : 'tabs'}
                    {parseInt(item.free_quantity) > 0
                      ? ` + ${item.free_quantity} free`
                      : ""}{" "}
                    · ₹{parseFloat(item.sale_rate_per_unit).toFixed(2)}/{item.uom === 'Strips' ? 'strip' : 'tab'}
                    {parseFloat(item.discount_percentage) > 0 &&
                      ` · Disc ${item.discount_percentage}%`}
                    {" · "}GST {item.gst_percentage}%
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text-primary)",
                    flexShrink: 0,
                  }}
                >
                  ₹{parseFloat(item.line_total).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--text-secondary)",
              }}
            >
              <span>Subtotal</span>
              <span style={{ fontFamily: "var(--font-mono)" }}>
                ₹{parseFloat(receipt.subtotal).toFixed(2)}
              </span>
            </div>
            {isIgst ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                }}
              >
                <span>IGST</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  ₹{taxBreakdown.igst.toFixed(2)}
                </span>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>CGST</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    ₹{taxBreakdown.cgst.toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>SGST</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>
                    ₹{taxBreakdown.sgst.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {parseFloat(receipt.discount) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "var(--accent-amber)",
                }}
              >
                <span>Disc. applied <span style={{ fontSize: "9px", opacity: 0.7 }}>(incl. in subtotal)</span></span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  ₹{parseFloat(receipt.discount).toFixed(2)}
                </span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "16px",
                fontWeight: "600",
                color: "var(--accent-green)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <span>TOTAL</span>
              <span>₹{parseFloat(receipt.grand_total).toFixed(2)}</span>
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                textAlign: "right",
              }}
            >
              {receipt.payment_mode === "SPLIT" && receipt.split_payments
                ? Object.entries(receipt.split_payments)
                    .filter(([, v]) => parseFloat(v) > 0)
                    .map(([mode, amt]) => (
                      <div key={mode}>
                        Paid via {mode}: ₹{parseFloat(amt).toFixed(2)}
                      </div>
                    ))
                : <div>Paid via {receipt.payment_mode}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Print-only thermal receipt (80mm) ─────────────────────────── */}
      <div className="receipt-print">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "4px" }}>
          <div style={{ fontWeight: "bold", fontSize: "13px" }}>
            {pharmacy?.name || "PHARMACY"}
          </div>
          {pharmacy?.drug_license_no && (
            <div>DL No: {pharmacy.drug_license_no}</div>
          )}
          {pharmacy?.gstin && <div>GSTIN: {pharmacy.gstin}</div>}
        </div>
        <hr style={hrStyle} />

        {/* Bill meta */}
        {receipt.invoice_number
          ? <div>Invoice: {receipt.invoice_number}</div>
          : <div>Bill: {receipt.id?.slice(0, 8).toUpperCase()}</div>
        }
        <div>
          Date: {dateStr} {timeStr}
        </div>
        {receipt.customer_name && <div>Name: {receipt.customer_name}</div>}
        {receipt.customer_phone && <div>Phone: {receipt.customer_phone}</div>}
        {receipt.buyer_address && <div>Address: {receipt.buyer_address}</div>}
        <hr style={hrStyle} />

        {/* Items */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
          }}
        >
          <span style={{ flex: 2 }}>MEDICINE</span>
          <span style={{ flex: 0, minWidth: "32px", textAlign: "right" }}>
            QTY
          </span>
          <span style={{ flex: 0, minWidth: "52px", textAlign: "right" }}>
            AMT
          </span>
        </div>
        <hr style={hrStyle} />
        {(receipt.items_snapshot || []).map((item, i) => (
          <div key={i} style={{ marginBottom: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ flex: 2, wordBreak: "break-word" }}>
                {item.medicine_name}
              </span>
              <span style={{ flex: 0, minWidth: "32px", textAlign: "right" }}>
                {item.quantity}
                {parseInt(item.free_quantity) > 0
                  ? `+${item.free_quantity}`
                  : ""}
              </span>
              <span style={{ flex: 0, minWidth: "52px", textAlign: "right" }}>
                ₹{parseFloat(item.line_total).toFixed(2)}
              </span>
            </div>
            <div style={{ fontSize: "9px", paddingLeft: "8px" }}>
              Batch: {item.batch_number} Exp:{" "}
              {item.expiry_date
                ? `${item.expiry_date.split("-")[1]}/${item.expiry_date.split("-")[0]}`
                : ""}
            </div>
            <div style={{ fontSize: "9px", paddingLeft: "8px" }}>
              @₹{parseFloat(item.sale_rate_per_unit).toFixed(2)}/{item.uom === 'Strips' ? 'strip' : 'tab'}
              {parseFloat(item.discount_percentage) > 0
                ? `  Disc: ${item.discount_percentage}%`
                : ""}
              {"  "}GST: {item.gst_percentage}%
              {item.drug_schedule &&
                item.drug_schedule !== "GENERAL" &&
                `  [${item.drug_schedule === "NARCOTIC" ? "NARCOTIC" : "SCH-" + item.drug_schedule}]`}
            </div>
          </div>
        ))}
        <hr style={hrStyle} />

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal</span>
          <span>₹{parseFloat(receipt.subtotal).toFixed(2)}</span>
        </div>
        {isIgst ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>IGST</span>
            <span>₹{taxBreakdown.igst.toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>CGST</span>
              <span>₹{taxBreakdown.cgst.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>SGST</span>
              <span>₹{taxBreakdown.sgst.toFixed(2)}</span>
            </div>
          </>
        )}
        {parseFloat(receipt.discount) > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Disc. applied (in subtotal)</span>
            <span>₹{parseFloat(receipt.discount).toFixed(2)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: "12px",
            marginTop: "2px",
          }}
        >
          <span>GRAND TOTAL</span>
          <span>₹{parseFloat(receipt.grand_total).toFixed(2)}</span>
        </div>
        {receipt.payment_mode === "SPLIT" && receipt.split_payments
          ? Object.entries(receipt.split_payments)
              .filter(([, v]) => parseFloat(v) > 0)
              .map(([mode, amt]) => (
                <div key={mode} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Paid ({mode})</span>
                  <span>₹{parseFloat(amt).toFixed(2)}</span>
                </div>
              ))
          : <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Payment</span>
              <span>{receipt.payment_mode}</span>
            </div>
        }
        <hr style={hrStyle} />

        {/* Footer */}
        <div>Billed by: {receipt.billed_by_phone || "-"}</div>
        <div style={{ textAlign: "center", marginTop: "6px" }}>
          Thank you for your visit!
        </div>
      </div>
    </>
  );
}

export default Receipt;
