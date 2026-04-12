import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSalesBills,
  setSelectedBill,
  setSelectedBillId,
} from "../store/slices/inventorySlice";
import { getSalesHistory, getSalesBill, processReturn } from "../api/billing";
import useWindowSize from "../hooks/useWindowSize";
import HistoryList from "../components/History/HistoryList";
import HistoryDetail from "../components/History/HistoryDetail";
import ReturnModal from "../components/History/ReturnModal";

export default function History() {
  const { isMobile } = useWindowSize();
  const dispatch = useAppDispatch();
  const bills = useAppSelector((state) => state.inventory.salesBills);
  const selectedBill = useAppSelector((state) => state.inventory.selectedBill);
  const selectedBillId = useAppSelector(
    (state) => state.inventory.selectedBillId,
  );
  const [loading, setLoading] = useState(true);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [returnModal, setReturnModal] = useState(null);
  const [returnQty, setReturnQty] = useState("");
  const [returnReason, setReturnReason] = useState("Customer Return");
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  const fetchBills = useCallback(() => {
    setLoading(true);
    getSalesHistory()
      .then((res) => dispatch(setSalesBills(res.data.results || [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (bills.length === 0) {
      fetchBills();
    } else {
      setLoading(false);
    }
  }, [bills.length, fetchBills]);

  const openDetail = async (bill) => {
    dispatch(setSelectedBillId(bill.id));
    dispatch(setSelectedBill(null));
    setDetailLoading(true);

    try {
      const res = await getSalesBill(bill.id);
      dispatch(setSelectedBill(res.data));
    } catch (error) {
      console.error("Failed to fetch bill details:", error);
      dispatch(setSelectedBillId(null));
      dispatch(setSelectedBill(null));
    }

    setDetailLoading(false);
  };

  const handleReturn = async () => {
    if (!returnQty || parseInt(returnQty) < 1) {
      setReturnError("Enter a valid quantity.");
      return;
    }

    setReturnError("");
    setReturning(true);

    try {
      // refund_amount is computed server-side from the original line_total —
      // the backend knows the correct tax-inclusive rate, we just send qty + reason.
      await processReturn({
        sales_bill: returnModal.bill.id,
        sales_item: returnModal.item.id,
        return_quantity: parseInt(returnQty),
        reason: returnReason,
      });

      setReturnSuccess(`Return of ${returnQty} tablets processed.`);
      setReturnModal(null);
      setReturnQty("");
      // Refresh both the detail view and the bills list so payment_status is current
      if (selectedBill) openDetail(selectedBill);
      fetchBills();
      setTimeout(() => setReturnSuccess(""), 4000);
    } catch (err) {
      const data = err.response?.data;
      setReturnError(
        typeof data === "string"
          ? data
          : data?.non_field_errors?.[0] ||
              JSON.stringify(data) ||
              "Return failed.",
      );
    } finally {
      setReturning(false);
    }
  };

  const filteredBills = useMemo(
    () =>
      bills.filter(
        (bill) =>
          !phoneFilter ||
          bill.customer_phone?.includes(phoneFilter) ||
          bill.customer_name?.toLowerCase().includes(phoneFilter.toLowerCase()),
      ),
    [bills, phoneFilter],
  );

  const getPaymentColor = (mode) => {
    if (mode === "CREDIT") return "var(--accent-amber)";
    if (mode === "UPI") return "var(--accent-blue)";
    return "var(--accent-green)";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: "1.25rem",
        height: isMobile ? "auto" : "calc(100vh - 120px)",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <HistoryList
          isMobile={isMobile}
          phoneFilter={phoneFilter}
          onPhoneFilterChange={setPhoneFilter}
          loading={loading}
          filteredBills={filteredBills}
          selectedBillId={selectedBillId}
          onSelectBill={openDetail}
          getPaymentColor={getPaymentColor}
          returnSuccess={returnSuccess}
        />
      </div>
      {(selectedBillId !== null || detailLoading) && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <HistoryDetail
            isMobile={isMobile}
            selectedBill={selectedBill}
            detailLoading={detailLoading}
            onClose={() => {
              dispatch(setSelectedBill(null));
              dispatch(setSelectedBillId(null));
            }}
            onReturn={(bill, item) => {
              setReturnModal({ bill, item });
              setReturnQty("");
              setReturnReason("Customer Return");
              setReturnError("");
            }}
            getPaymentColor={getPaymentColor}
          />
        </div>
      )}
      {returnModal && (
        <ReturnModal
          returnModal={returnModal}
          returnQty={returnQty}
          onReturnQtyChange={setReturnQty}
          returnReason={returnReason}
          onReturnReasonChange={setReturnReason}
          returnError={returnError}
          returning={returning}
          onReturn={handleReturn}
          onClose={() => setReturnModal(null)}
        />
      )}
    </div>
  );
}
