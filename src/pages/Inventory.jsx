import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setStock,
  setMedicines,
  setBills,
  setSuppliers,
} from '../store/slices/inventorySlice'
import ConfirmModal from '../components/Inventory/ConfirmModal'
import {
  getMedicines,
  getPurchaseBills,
  getSuppliers,
  getStock,
  deactivateMedicine,
  reactivateMedicine,
} from '../api/inventory'
import useWindowSize from '../hooks/useWindowSize'
import { useAuth } from '../context/AuthContext'
import MedicineForm from '../components/Inventory/MedicineForm'
import PurchaseBillForm from '../components/Inventory/PurchaseBillForm'
import StockList from '../components/Inventory/StockList'
import MedicineList from '../components/Inventory/MedicineList'
import PurchaseBillList from '../components/Inventory/PurchaseBillList'

export default function Inventory() {
  const { isMobile } = useWindowSize()
  const { isOwner } = useAuth()
  const dispatch = useAppDispatch()
  const stock = useAppSelector((state) => state.inventory.stock)
  const medicines = useAppSelector((state) => state.inventory.medicines)
  const bills = useAppSelector((state) => state.inventory.bills)
  const suppliers = useAppSelector((state) => state.inventory.suppliers)

  const [activeTab, setActiveTab] = useState('stock')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stockSearch, setStockSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    message: '',
    onConfirm: null,
  })

  useEffect(() => {
    setLoading(true)
    Promise.all([getStock(), getMedicines(), getPurchaseBills(), getSuppliers()])
      .then(([stockRes, medRes, billRes, supRes]) => {
        dispatch(setStock(stockRes.data.results || []))
        dispatch(setMedicines(medRes.data.results || []))
        dispatch(setBills(billRes.data.results || []))
        dispatch(setSuppliers(supRes.data.results || []))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [dispatch])

  const handleDeactivateMedicine = (med) => {
    setConfirmModal({
      open: true,
      message: `Deactivate "${med.name}"? It will no longer appear in billing searches but can still be used in purchase bills.`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null })
        try {
          await deactivateMedicine(med.id)
          dispatch(
            setMedicines(
              medicines.map((m) =>
                m.id === med.id ? { ...m, is_active: false } : m,
              ),
            ),
          )
          setSuccess(`"${med.name}" has been deactivated.`)
          setTimeout(() => setSuccess(''), 3000)
        } catch {
          setError('Failed to deactivate medicine. Please try again.')
        }
      },
    })
  }

  const handleReactivateMedicine = (med) => {
    setConfirmModal({
      open: true,
      message: `Reactivate "${med.name}"? It will appear in billing searches again.`,
      onConfirm: async () => {
        setConfirmModal({ open: false, message: '', onConfirm: null })
        try {
          await reactivateMedicine(med.id)
          dispatch(
            setMedicines(
              medicines.map((m) =>
                m.id === med.id ? { ...m, is_active: true } : m,
              ),
            ),
          )
          setSuccess(`"${med.name}" has been reactivated.`)
          setTimeout(() => setSuccess(''), 3000)
        } catch {
          setError('Failed to reactivate medicine. Please try again.')
        }
      },
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {confirmModal.open && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() =>
            setConfirmModal({ open: false, message: '', onConfirm: null })
          }
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h1
          style={{
            fontSize: isMobile ? '16px' : '20px',
            fontWeight: '600',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
          }}
        >
          INVENTORY
        </h1>
        {activeTab !== 'stock' && (
          <button
            onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
            style={{
              background: showForm ? 'transparent' : 'var(--accent-green)',
              color: showForm ? 'var(--text-secondary)' : '#000',
              border: showForm ? '1px solid var(--border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              cursor: 'pointer',
            }}
          >
            {showForm
              ? 'CANCEL'
              : activeTab === 'medicines'
              ? '+ ADD MEDICINE'
              : '+ ADD PURCHASE BILL'}
          </button>
        )}
      </div>

      <div
        style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)' }}
      >
        {[
          { key: 'stock', label: `STOCK (${stock.length})` },
          { key: 'medicines', label: `MEDICINES (${medicines.length})` },
          { key: 'bills', label: `PURCHASE BILLS (${bills.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key)
              setShowForm(false)
              setError('')
            }}
            style={{
              padding: '8px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.08em',
              background: 'none',
              border: 'none',
              borderBottom:
                activeTab === tab.key
                  ? '2px solid var(--accent-green)'
                  : '2px solid transparent',
              color:
                activeTab === tab.key
                  ? 'var(--accent-green)'
                  : 'var(--text-secondary)',
              cursor: 'pointer',
              marginBottom: '-1px',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {success && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-green)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--accent-green)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          ✓ {success}
        </div>
      )}

      {activeTab === 'stock' && (
        <>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              placeholder="Search medicine or batch..."
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
            />
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'ALL' },
                { key: 'low', label: 'LOW STOCK' },
                { key: 'expiring', label: 'EXPIRING' },
                { key: 'unassigned', label: 'UNASSIGNED' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setStockFilter(f.key)}
                  style={{
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    letterSpacing: '0.06em',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background:
                      stockFilter === f.key ? 'var(--accent-green)' : 'transparent',
                    color:
                      stockFilter === f.key ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <StockList
            stock={stock}
            search={stockSearch}
            filter={stockFilter}
            loading={loading}
          />
        </>
      )}

      {activeTab === 'medicines' && (
        <>
          {showForm && (
            <MedicineForm
              onSuccess={(newMed) => {
                dispatch(setMedicines([newMed, ...medicines]))
                setSuccess('Medicine added successfully.')
                setShowForm(false)
                setTimeout(() => setSuccess(''), 3000)
              }}
              onCancel={() => setShowForm(false)}
            />
          )}
          <MedicineList
            medicines={medicines}
            loading={loading}
            isOwner={isOwner}
            onDeactivate={handleDeactivateMedicine}
            onReactivate={handleReactivateMedicine}
          />
        </>
      )}

      {activeTab === 'bills' && (
        <>
          {showForm && (
            <PurchaseBillForm
              suppliers={suppliers}
              onSuccess={async (newBill) => {
                dispatch(setBills([newBill, ...bills]))
                const stockRes = await getStock()
                dispatch(setStock(stockRes.data.results || []))
                setSuccess('Purchase bill added. Stock updated.')
                setShowForm(false)
                setTimeout(() => setSuccess(''), 3000)
              }}
              onCancel={() => setShowForm(false)}
              onSupplierCreate={(newSupplier) =>
                dispatch(setSuppliers([newSupplier, ...suppliers]))
              }
            />
          )}
          <PurchaseBillList bills={bills} loading={loading} />
        </>
      )}
    </div>
  )
}

const inputStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '8px 10px',
  color: 'var(--text-primary)',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}
