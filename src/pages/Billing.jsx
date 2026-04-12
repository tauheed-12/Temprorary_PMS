import { useState, useEffect, useRef, useCallback } from "react";
import { getBatchesForMedicine } from "../api/inventory";
import { checkout, getCustomerHistory } from "../api/billing";
import useWindowSize from "../hooks/useWindowSize";
import SearchBar from "../components/Billing/SearchBar";
import Cart from "../components/Billing/Cart";
import CustomerForm from "../components/Billing/CustomerForm";
import SaleSummary from "../components/Billing/SaleSummary";
import Receipt from "../components/Billing/Receipt";

export default function Billing() {
  const { isMobile } = useWindowSize();
  const [cart, setCart] = useState([]);
  // ── Sale mode
  const [saleMode, setSaleMode] = useState("B2C"); // 'B2C' | 'B2B'
  // ── Customer fields
  const [customerId, setCustomerId] = useState(null);
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null); // full B2B CustomerParty object
  const [buyerAddress, setBuyerAddress] = useState("");
  const [prescriberName, setPrescriberName] = useState("");
  const [prescriberRegNo, setPrescriberRegNo] = useState("");
  // ── Payment
  const [discount, setDiscount] = useState("0");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [splitPayments, setSplitPayments] = useState({ CASH: "", UPI: "", CREDIT: "" });
  // ── UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [patientHistory, setPatientHistory] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [repeatLoading, setRepeatLoading] = useState(false);
  const phoneDebounceRef = useRef(null);
  const customerPhoneRef = useRef(null);
  const checkoutRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const resetTimerRef = useRef(null);
  const paymentModeRefs = useRef([]);
  const [resetPending, setResetPending] = useState(false);
  const resetPendingRef = useRef(false);
  resetPendingRef.current = resetPending;
  const cartRef = useRef([]);
  cartRef.current = cart;

  // ── Schedule-level helpers ────────────────────────────────────────────────
  const scheduleLevel = (s) => ({ GENERAL: 0, H: 1, H1: 2, X: 2, NARCOTIC: 2 }[s] ?? 0);
  const maxScheduleLevel = cart.reduce((max, i) => Math.max(max, scheduleLevel(i.drug_schedule)), 0);
  const needsPrescriber = maxScheduleLevel >= 1; // Schedule H and above
  const needsFullLegal  = maxScheduleLevel >= 2; // Schedule H1/X/NARCOTIC

  const commitToCart = useCallback((medicine, batch, qty = 1, customUom = "Tabs") => {
    const key = `${medicine.id}-${batch.id}`;
    const packQty = medicine.pack_qty || 1;
    const maxAllowed = customUom === "Strips" ? Math.floor(batch.available_quantity / packQty) : batch.available_quantity;
    const safeQty = qty > 0 ? Math.min(qty, maxAllowed) : qty;
    
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => {
          if (i.key !== key) return i;
          
          let addQty = safeQty;
          let newUom = i.uom;
          let newQty = i.quantity;

          if (i.uom !== customUom) {
             newUom = "Tabs";
             if (i.uom === "Strips") newQty = i.quantity * packQty;
             if (customUom === "Strips") addQty = safeQty * packQty;
          }
          
          const iMax = newUom === "Strips" ? Math.floor(i.available / packQty) : i.available;
          return { ...i, uom: newUom, quantity: newQty + addQty < 0 ? (newQty + addQty) : Math.min(newQty + addQty, iMax) };
        });
      }
      return [
        ...prev,
        {
          key,
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          company: medicine.company,
          packaging: medicine.packaging,
          drug_schedule: medicine.drug_schedule || "GENERAL",
          batch_id: batch.id,
          batch_number: batch.batch_number,
          expiry_date: batch.expiry_date,
          mrp: batch.mrp,
          pack_qty: medicine.pack_qty,
          available: batch.available_quantity,
          quantity: safeQty,
          free_quantity: 0,
          uom: customUom,
          discount_percentage: "0.00",
        },
      ];
    });
  }, []);

  // Phone lookup — fires after 500ms debounce once ≥10 digits entered
  useEffect(() => {
    clearTimeout(phoneDebounceRef.current);
    const digits = customerPhone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPatientHistory(null);
      setHistoryOpen(false);
      return;
    }
    phoneDebounceRef.current = setTimeout(async () => {
      try {
        const res = await getCustomerHistory(customerPhone);
        const bills = (res.data.results || res.data || []).slice(0, 5);
        setPatientHistory(bills);
        if (bills.length > 0) setHistoryOpen(true);
      } catch {
        setPatientHistory([]);
      }
    }, 500);
    return () => clearTimeout(phoneDebounceRef.current);
  }, [customerPhone]);

  const handleRepeat = async (bill) => {
    setRepeatLoading(true);
    try {
      const results = await Promise.all(
        bill.items_snapshot.map((item) =>
          getBatchesForMedicine(item.medicine_id),
        ),
      );
      const skipped = [];
      const newItems = [];

      results.forEach((res, idx) => {
        const snap = bill.items_snapshot[idx];
        const batches = (res.data.results || res.data || [])
          .filter((b) => b.available_quantity > 0)
          .sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

        if (batches.length === 0) {
          skipped.push(snap.medicine_name);
          return;
        }

        const batch = batches[0];
        const medicine = {
          id: snap.medicine_id,
          name: snap.medicine_name,
          company: batch.medicine_company,
          packaging: batch.packaging,
          drug_schedule: batch.drug_schedule || "GENERAL",
          pack_qty: batch.pack_qty || 1,
        };
        const parsedQty = parseInt(snap.quantity) || 1;
        const uomRef = snap.uom || "Tabs";
        const packQty = batch.pack_qty || 1;
        const maxAllowed = uomRef === "Strips" ? Math.floor(batch.available_quantity / packQty) : batch.available_quantity;
        const qty = parsedQty > 0 ? Math.min(parsedQty, maxAllowed) : parsedQty;
        newItems.push({
          key: `${medicine.id}-${batch.id}`,
          medicine,
          batch,
          qty,
          uom: uomRef,
        });
      });

      if (newItems.length > 0) {
        setCart((prev) => {
          let updated = [...prev];
          newItems.forEach(({ key, medicine, batch, qty, uom }) => {
            const existing = updated.find((i) => i.key === key);
            if (existing) {
              updated = updated.map((i) => {
                if (i.key !== key) return i;
                
                let addQty = qty;
                let newUom = i.uom;
                let newQty = i.quantity;
                const packQty = i.pack_qty || 1;

                if (i.uom !== uom) {
                   newUom = "Tabs";
                   if (i.uom === "Strips") newQty = i.quantity * packQty;
                   if (uom === "Strips") addQty = qty * packQty;
                }
                
                const iMax = newUom === "Strips" ? Math.floor(i.available / packQty) : i.available;
                return { ...i, uom: newUom, quantity: newQty + addQty < 0 ? (newQty + addQty) : Math.min(newQty + addQty, iMax) };
              });
            } else {
              updated.push({
                key,
                medicine_id: medicine.id,
                medicine_name: medicine.name,
                company: medicine.company,
                packaging: medicine.packaging,
                drug_schedule: medicine.drug_schedule,
                batch_id: batch.id,
                batch_number: batch.batch_number,
                expiry_date: batch.expiry_date,
                mrp: batch.mrp,
                pack_qty: medicine.pack_qty,
                available: batch.available_quantity,
                quantity: qty,
                free_quantity: 0,
                uom: uom,
                discount_percentage: "0.00",
              });
            }
          });
          return updated;
        });
      }

      if (skipped.length > 0)
        setError(`Skipped (out of stock): ${skipped.join(", ")}`);
    } catch {
      setError("Failed to load repeat order. Please try again.");
    } finally {
      setRepeatLoading(false);
    }
  };

  const updateQty = (key, val) => {
    const n = parseInt(val);
    if (isNaN(n) || n === 0) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const maxAllowed = i.uom === "Strips" ? Math.floor(i.available / (i.pack_qty || 1)) : i.available;
        return { ...i, quantity: n < 0 ? n : Math.min(n, maxAllowed) };
      }),
    );
  };

  const updateFreeQty = (key, val) => {
    const n = parseInt(val) || 0;
    setCart((prev) =>
      prev.map((i) => (i.key === key ? { ...i, free_quantity: n >= 0 ? n : 0 } : i))
    );
  };

  const updateUom = (key, val) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        const maxAllowed = val === "Strips" ? Math.floor(i.available / (i.pack_qty || 1)) : i.available;
        return { ...i, uom: val, quantity: i.quantity < 0 ? i.quantity : Math.min(i.quantity, maxAllowed) };
      }),
    );
  };

  const updateDiscount = (key, val) => {
    setCart((prev) =>
      prev.map((i) => (i.key === key ? { ...i, discount_percentage: val } : i)),
    );
  };

  const removeItem = (key) =>
    setCart((prev) => prev.filter((i) => i.key !== key));

  const cartTotal = cart.reduce((sum, item) => {
    const rate = item.uom === 'Strips' ? parseFloat(item.mrp) : parseFloat(item.mrp) / (item.pack_qty || 1);
    const lineGross = rate * item.quantity;
    const pct = parseFloat(item.discount_percentage || "0");
    const lineNet = lineGross * (1 - pct / 100);
    return sum + lineNet;
  }, 0);

  const grandTotal = cartTotal - parseFloat(discount || 0);

  const hasNarcotic = cart.some((i) => i.drug_schedule === "NARCOTIC");

  const resetBill = useCallback(() => {
    clearTimeout(resetTimerRef.current);
    setResetPending(false);
    setCart([]);
    setCustomerId(null);
    setCustomerPhone("");
    setCustomerName("");
    setSelectedCustomer(null);
    setBuyerAddress("");
    setPrescriberName("");
    setPrescriberRegNo("");
    setDiscount("0");
    setPaymentMode("CASH");
    setSplitPayments({ CASH: "", UPI: "", CREDIT: "" });
    setPatientHistory(null);
    setHistoryOpen(false);
    setRepeatLoading(false);
    setError("");
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) { setError("Cart is empty."); return; }

    setError("");

    // ── B2B validation ──────────────────────────────────────────────────────
    if (saleMode === "B2B") {
      if (!customerId) {
        setError("B2B sale requires a registered customer. Search and select one, or register a new one.");
        return;
      }
    }

    // ── B2C validation ──────────────────────────────────────────────────────
    if (saleMode === "B2C") {
      if (!customerName.trim()) { setError("Patient name is required."); return; }
      if (!customerPhone.trim()) { setError("Patient phone is required."); return; }
      if (needsPrescriber && !prescriberName.trim()) {
        setError("Prescribing doctor's name is legally required for Schedule H/H1/X/Narcotic drugs."); return;
      }
      if (needsFullLegal) {
        if (!buyerAddress.trim()) { setError("Patient address is legally required for Schedule H1/X/Narcotic drugs."); return; }
        if (!prescriberRegNo.trim()) { setError("Doctor/Clinic registration number is legally required for Schedule H1/X/Narcotic drugs."); return; }
      }
      if (paymentMode === "CREDIT" && !customerId) {
        setError("Credit sale requires a registered patient profile for ledger tracking. Please use the 'REGISTER +' button."); return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        customer_id:    customerId || undefined,
        customer_phone: customerPhone || undefined,
        customer_name:  customerName || undefined,
        buyer_address:  buyerAddress || undefined,
        prescriber_name:   prescriberName || undefined,
        prescriber_reg_no: prescriberRegNo || undefined,
        discount: parseFloat(discount || 0).toFixed(2),
        payment_mode: paymentMode,
        items: cart.map((i) => ({
          medicine: i.medicine_id,
          quantity: i.quantity,
          free_quantity: i.free_quantity || 0,
          uom: i.uom,
          discount_percentage: parseFloat(i.discount_percentage || "0").toFixed(2),
        })),
      };
      if (paymentMode === "SPLIT") {
        const cleanSplit = {};
        for (const [k, v] of Object.entries(splitPayments)) {
          const num = parseFloat(v);
          if (!isNaN(num) && num > 0) cleanSplit[k] = num.toFixed(2);
        }
        payload.split_payments = cleanSplit;
      }

      const res = await checkout(payload);
      setReceipt(res.data);
      // Reset after successful checkout
      setCart([]);
      setCustomerId(null);
      setCustomerPhone("");
      setCustomerName("");
      setSelectedCustomer(null);
      setBuyerAddress("");
      setPrescriberName("");
      setPrescriberRegNo("");
      setDiscount("0");
      setPaymentMode("CASH");
      setSplitPayments({ CASH: "", UPI: "", CREDIT: "" });
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          .join(" | ");
        setError(msgs);
      } else {
        setError("Checkout failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  checkoutRef.current = handleCheckout;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "F2") {
        e.preventDefault();
        if (cartRef.current.length === 0) {
          resetBill();
          return;
        }
        if (resetPendingRef.current) {
          resetBill();
          return;
        }
        setResetPending(true);
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = setTimeout(() => setResetPending(false), 3000);
      }
      // Any key other than F2 dismisses the reset confirmation banner
      if (e.key !== "F2" && resetPendingRef.current) {
        clearTimeout(resetTimerRef.current);
        setResetPending(false);
      }
      if (e.key === "F4") {
        e.preventDefault();
        customerPhoneRef.current?.focus();
      }
      if (e.altKey && e.key === "s") {
        e.preventDefault();
        checkoutRef.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [resetBill]);

  if (receipt)
    return <Receipt receipt={receipt} onNew={() => setReceipt(null)} />;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "1.25rem",
        height: isMobile ? "auto" : "calc(100vh - 120px)",
      }}
    >
      {/* ── Left: search + cart ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minWidth: 0,
          overflow: isMobile ? "visible" : "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            flexShrink: 0,
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
            BILLING
          </h1>
          {!isMobile && (
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                ["F2", "NEW"],
                ["F3", "SEARCH"],
                ["F4", "CUSTOMER"],
                ["Alt+S", "CONFIRM"],
              ].map(([key, label]) => (
                <span
                  key={key}
                  style={{
                    fontSize: "9px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span
                    style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border)",
                      borderRadius: "3px",
                      padding: "1px 5px",
                      marginRight: "3px",
                    }}
                  >
                    {key}
                  </span>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* F2 confirm banner */}
        {resetPending && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid var(--accent-red)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "var(--accent-red)",
              letterSpacing: "0.04em",
              flexShrink: 0,
            }}
          >
            Press <strong>F2</strong> again to clear the bill — or any other key
            to cancel
          </div>
        )}

        <SearchBar commitToCart={commitToCart} />

        <Cart
          cart={cart}
          updateQty={updateQty}
          updateFreeQty={updateFreeQty}
          updateUom={updateUom}
          updateDiscount={updateDiscount}
          removeItem={removeItem}
          isMobile={isMobile}
        />
      </div>

      {/* ── Right: summary panel ── */}
      <div
        style={{
          width: isMobile ? "100%" : "300px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <CustomerForm
          saleMode={saleMode}
          setSaleMode={setSaleMode}
          customerId={customerId}
          setCustomerId={setCustomerId}
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerName={customerName}
          setCustomerName={setCustomerName}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          buyerAddress={buyerAddress}
          setBuyerAddress={setBuyerAddress}
          prescriberName={prescriberName}
          setPrescriberName={setPrescriberName}
          prescriberRegNo={prescriberRegNo}
          setPrescriberRegNo={setPrescriberRegNo}
          needsPrescriber={needsPrescriber}
          needsFullLegal={needsFullLegal}
          paymentMode={paymentMode}
          patientHistory={patientHistory}
          historyOpen={historyOpen}
          setHistoryOpen={setHistoryOpen}
          repeatLoading={repeatLoading}
          handleRepeat={handleRepeat}
          customerPhoneRef={customerPhoneRef}
        />

        <SaleSummary
          cartTotal={cartTotal}
          discount={discount}
          setDiscount={setDiscount}
          grandTotal={grandTotal}
          paymentMode={paymentMode}
          setPaymentMode={setPaymentMode}
          paymentModeRefs={paymentModeRefs}
          splitPayments={splitPayments}
          setSplitPayments={setSplitPayments}
          error={error}
          submitting={submitting}
          cart={cart}
          handleCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
