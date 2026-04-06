import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: true,
  notification: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    setNotification(state, action) {
      state.notification = action.payload;
    },
    clearNotification(state) {
      state.notification = null;
    },
  },
});

export const { setSidebarOpen, setNotification, clearNotification } =
  uiSlice.actions;
export default uiSlice.reducer;
