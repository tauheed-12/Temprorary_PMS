import { useState, useEffect } from 'react'
import { getSalesHistory, getSalesBill, processReturn } from '../api/billing'
import useWindowSize from '../hooks/useWindowSize'
import HistoryList from '../components/History/HistoryList'
import HistoryDetail from '../components/History/HistoryDetail'
import ReturnModal from '../components/History/ReturnModal'

export default function History() {
  const { isMobile } = useWindowSize()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [phoneFilter, setPhoneFilter] = useState('')
  const [selectedBill, setSelectedBill] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [returnModal, setReturnModal] = useState(null)
  const [returnQty, setReturnQty] = useState('')
  const [returnReason, setReturnReason] = useState('Customer Return')
  const [returning, setReturning] = useState(false)
  const [returnError, setReturnError] = useState('')
  const [returnSuccess, setReturnSuccess] = useState('')

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = () => {
    setLoading(true)
    getSalesHistory()
      .then(res => setBills(res.data.results || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const openDetail = async (bill) => {
    setDetailLoading(true)
    setSelectedBill(bill)
    try {
      const res = await getSalesBill(bill.id)
      setSelectedBill(res.data)
    } catch {}
    setDetailLoading(false)
  }

  const handleReturn = async () => {
    if (!returnQty || parseInt(returnQty) < 1) {
      setReturnError('Enter a valid quantity.')
      return
    }

    setReturnError('')
    setReturning(true)

    try {
      await processReturn({
        sales_bill: returnModal.bill.id,
        sales_item: returnModal.item.id,
        return_quantity: parseInt(returnQty),
        refund_amount: (parseFloat(returnModal.item.sale_rate_per_unit) * parseInt(returnQty)).toFixed(2),
        reason: returnReason,
      })

      setReturnSuccess(`Return of ${returnQty} tablets processed.`)
      setReturnModal(null)
      setReturnQty('')
      if (selectedBill) openDetail(selectedBill)
      setTimeout(() => setReturnSuccess(''), 4000)
    } catch (err) {
      const data = err.response?.data
      setReturnError(typeof data === 'string' ? data : data?.non_field_errors?.[0] || JSON.stringify(data) || 'Return failed.')
    } finally {
      setReturning(false)
    }
  }

  const filteredBills = bills.filter(bill =>
    !phoneFilter || bill.customer_phone?.includes(phoneFilter) || bill.customer_name?.toLowerCase().includes(phoneFilter.toLowerCase())
  )

  const getPaymentColor = (mode) => {
    if (mode === 'CREDIT') return 'var(--accent-amber)'
    if (mode === 'UPI') return 'var(--accent-blue)'
    return 'var(--accent-green)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.25rem', height: isMobile ? 'auto' : 'calc(100vh - 120px)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0, overflow: 'hidden' }}>
        <HistoryList
          isMobile={isMobile}
          phoneFilter={phoneFilter}
          onPhoneFilterChange={setPhoneFilter}
          loading={loading}
          filteredBills={filteredBills}
          selectedBillId={selectedBill?.id}
          onSelectBill={openDetail}
          getPaymentColor={getPaymentColor}
          returnSuccess={returnSuccess}
        />
      </div>

      <div style={{ width: isMobile ? '100%' : '340px', flexShrink: 0, overflowY: 'auto' }}>
        <HistoryDetail
          selectedBill={selectedBill}
          detailLoading={detailLoading}
          isMobile={isMobile}
          onItemReturn={(item) => {
            setReturnModal({ bill: selectedBill, item })
            setReturnQty('')
            setReturnError('')
          }}
          getPaymentColor={getPaymentColor}
        />
      </div>

      {returnModal && (
        <ReturnModal
          returnModal={returnModal}
          returnQty={returnQty}
          onReturnQtyChange={setReturnQty}
          returnReason={returnReason}
          onReturnReasonChange={setReturnReason}
          returnError={returnError}
          returning={returning}
          onClose={() => setReturnModal(null)}
          onConfirm={handleReturn}
        />
      )}
    </div>
  )
}
