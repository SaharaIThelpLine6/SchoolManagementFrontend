import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   currectLanguage : 'en'
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setCurrentLanguage: (state, action) => {
            state.currectLanguage = action.payload;
            localStorage.setItem('lang', action.payload);
        },
    },
});

export const { setCurrentLanguage} = languageSlice.actions;
export default languageSlice.reducer;