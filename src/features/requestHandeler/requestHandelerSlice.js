import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reqLoading: false,
};

const requestHandelerSlice = createSlice({
    name: 'requestHandeler',
    initialState,
    reducers: {
        setReqLoading: (state, action) => {
            state.reqLoading = action.payload;
        },
    },
});

export const { setReqLoading } = requestHandelerSlice.actions;
export default requestHandelerSlice.reducer;