import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/uiSlice";
import inventoryReducer from "./slices/inventorySlice";

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    inventory: inventoryReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
