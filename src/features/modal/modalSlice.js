import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  title: "",
  modalType: null,
  id: null,
  isDrawers: false,

};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.title = action.payload.title || "";
      state.modalType = action.payload.modalType || null;
      state.id = action.payload.id || null;
      state.isDrawers = false;
    },
    openSideDrawer: (state, action) => {
      state.isDrawers = true;
      state.title = action.payload.title || "";
      state.modalType = action.payload.modalType || null;
      state.id = action.payload.id || null
      state.isOpen = false;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.isDrawers = false;
      state.title = "";
      state.content = null;
    },
  },
});

export const { openModal, closeModal, openSideDrawer } = modalSlice.actions;
export default modalSlice.reducer;
