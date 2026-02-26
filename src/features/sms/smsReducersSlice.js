import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  successAndErrorMessages: [],
  smsTemplate: [],
};

const smsReducersSlice = createSlice({
  name: "smsSuccessAndErrorMessage",
  initialState,
  reducers: {
    setSuccessAndErrorMessage: (state, action) => {
      state.successAndErrorMessages = action.payload;
    },
    clearSuccessAndErrorMessage: (state) => {
      state.successAndErrorMessages = [];
    },
    setAddSMSTemplate: (state, action) => {
      state.smsTemplate = action.payload;
    },
    clearSmsTemplate: (state) => {
      state.smsTemplate = [];
    },
  },
});
export const {
  setSuccessAndErrorMessage,
  clearSuccessAndErrorMessage,
  setAddSMSTemplate,
  clearSmsTemplate,
} = smsReducersSlice.actions;
export default smsReducersSlice.reducer;
