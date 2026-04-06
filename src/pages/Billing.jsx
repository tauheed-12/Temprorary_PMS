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
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [isB2b, setIsB2b] = useState(false);
  const [customerGstin, setCustomerGstin] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [patientHistory, setPatientHistory] = useState(null); // null=unfetched, []=empty, [...]=has data
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

  const commitToCart = useCallback((medicine, batch, qty = 1) => {
    const key = `${medicine.id}-${batch.id}`;
    const safeQty = Math.min(Math.max(1, qty), batch.available_quantity);
    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key
            ? { ...i, quantity: Math.min(i.quantity + safeQty, i.available) }
            : i,
        );
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
        const qty = Math.min(
          parseInt(snap.quantity) || 1,
          batch.available_quantity,
        );
        newItems.push({
          key: `${medicine.id}-${batch.id}`,
          medicine,
          batch,
          qty,
        });
      });

      if (newItems.length > 0) {
        setCart((prev) => {
          let updated = [...prev];
          newItems.forEach(({ key, medicine, batch, qty }) => {
            const existing = updated.find((i) => i.key === key);
            if (existing) {
              updated = updated.map((i) =>
                i.key === key
                  ? { ...i, quantity: Math.min(i.quantity + qty, i.available) }
                  : i,
              );
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
    if (isNaN(n) || n < 1) return;
    setCart((prev) =>
      prev.map((i) => {
        if (i.key !== key) return i;
        return { ...i, quantity: Math.min(n, i.available) };
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
    const perUnit = parseFloat(item.mrp) / (item.pack_qty || 1);
    const lineGross = perUnit * item.quantity;
    const pct = parseFloat(item.discount_percentage || "0");
    const lineNet = lineGross * (1 - pct / 100);
    return sum + lineNet;
  }, 0);

  const grandTotal = Math.max(0, cartTotal - parseFloat(discount || 0));

  const hasNarcotic = cart.some((i) => i.drug_schedule === "NARCOTIC");

  const resetBill = useCallback(() => {
    clearTimeout(resetTimerRef.current);
    setResetPending(false);
    setCart([]);
    setCustomerPhone("");
    setCustomerName("");
    setIsB2b(false);
    setCustomerGstin("");
    setDiscount("0");
    setPaymentMode("CASH");
    setBuyerAddress("");
    setPatientHistory(null);
    setHistoryOpen(false);
    setRepeatLoading(false);
    setError("");
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Cart is empty.");
      return;
    }
    if (hasNarcotic) {
      if (!customerName.trim()) {
        setError("Customer name is required for Narcotic drug sales.");
        return;
      }
      if (!buyerAddress.trim()) {
        setError("Buyer address is required for Narcotic drug sales.");
        return;
      }
    }
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        customer_phone: customerPhone || undefined,
        customer_name: customerName || undefined,
        buyer_address: buyerAddress || undefined,
        discount: parseFloat(discount || 0).toFixed(2),
        payment_mode: paymentMode,
        items: cart.map((i) => ({
          medicine: i.medicine_id,
          quantity: i.quantity,
          discount_percentage: parseFloat(i.discount_percentage || "0").toFixed(
            2,
          ),
        })),
      };
      const res = await checkout(payload);
      setReceipt(res.data);
      setCart([]);
      setCustomerPhone("");
      setCustomerName("");
      setIsB2b(false);
      setCustomerGstin("");
      setBuyerAddress("");
      setDiscount("0");
      setPaymentMode("CASH");
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
          customerPhone={customerPhone}
          setCustomerPhone={setCustomerPhone}
          customerName={customerName}
          setCustomerName={setCustomerName}
          isB2b={isB2b}
          setIsB2b={setIsB2b}
          customerGstin={customerGstin}
          setCustomerGstin={setCustomerGstin}
          buyerAddress={buyerAddress}
          setBuyerAddress={setBuyerAddress}
          hasNarcotic={hasNarcotic}
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
          error={error}
          submitting={submitting}
          cart={cart}
          handleCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
