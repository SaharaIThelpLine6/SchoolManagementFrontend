import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  title: "",
  modalType: null,
  id: null
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal: (state, action) => {
      state.isOpen = true;
      state.title = action.payload.title || "";
      state.modalType = action.payload.modalType || null;
      state.id = action.payload.id || null
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.title = "";
      state.content = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
