import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  blocks: [],
  unassigned: [],
  selectedBlock: null,
  shelves: [],
  stock: [],
  medicines: [],
  salesBills: [],
  purchaseBills: [],
  suppliers: [],
  staff: [],
  selectedBill: null,
  selectedBillId: null,
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setBlocks(state, action) {
      state.blocks = action.payload;
    },
    setUnassigned(state, action) {
      state.unassigned = action.payload;
    },
    setSelectedBlock(state, action) {
      state.selectedBlock = action.payload;
    },
    setShelves(state, action) {
      state.shelves = action.payload;
    },
    setStock(state, action) {
      state.stock = action.payload;
    },
    setMedicines(state, action) {
      state.medicines = action.payload;
    },
    setSalesBills(state, action) {
      state.salesBills = action.payload;
    },
    setPurchaseBills(state, action) {
      state.purchaseBills = action.payload;
    },
    setSuppliers(state, action) {
      state.suppliers = action.payload;
    },
    setStaff(state, action) {
      state.staff = action.payload;
    },
    setSelectedBill(state, action) {
      state.selectedBill = action.payload;
    },
    setSelectedBillId(state, action) {
      state.selectedBillId = action.payload;
    },
    clearInventory(state) {
      state.blocks = [];
      state.unassigned = [];
      state.selectedBlock = null;
      state.shelves = [];
      state.stock = [];
      state.medicines = [];
      state.salesBills = [];
      state.purchaseBills = [];
      state.suppliers = [];
      state.staff = [];
      state.selectedBill = null;
      state.selectedBillId = null;
    },
  },
});

export const {
  setBlocks,
  setUnassigned,
  setSelectedBlock,
  setShelves,
  setStock,
  setMedicines,
  setSalesBills,
  setPurchaseBills,
  setSuppliers,
  setStaff,
  setSelectedBill,
  setSelectedBillId,
  clearInventory,
} = inventorySlice.actions;
export default inventorySlice.reducer;
