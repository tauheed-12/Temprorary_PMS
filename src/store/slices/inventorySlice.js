import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  blocks: [],
  unassigned: [],
  selectedBlock: null,
  shelves: [],
  stock: [],
  medicines: [],
  bills: [],
  suppliers: [],
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setBlocks(state, action) {
      state.blocks = action.payload
    },
    setUnassigned(state, action) {
      state.unassigned = action.payload
    },
    setSelectedBlock(state, action) {
      state.selectedBlock = action.payload
    },
    setShelves(state, action) {
      state.shelves = action.payload
    },
    setStock(state, action) {
      state.stock = action.payload
    },
    setMedicines(state, action) {
      state.medicines = action.payload
    },
    setBills(state, action) {
      state.bills = action.payload
    },
    setSuppliers(state, action) {
      state.suppliers = action.payload
    },
    clearInventory(state) {
      state.blocks = []
      state.unassigned = []
      state.selectedBlock = null
      state.shelves = []
      state.stock = []
      state.medicines = []
      state.bills = []
      state.suppliers = []
    },
  },
})

export const {
  setBlocks,
  setUnassigned,
  setSelectedBlock,
  setShelves,
  setStock,
  setMedicines,
  setBills,
  setSuppliers,
  clearInventory,
} = inventorySlice.actions
export default inventorySlice.reducer
