import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentPage: 1,
    itemsPerPage: 2,
};

const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        },
        setItemsPerPage: (state, action) => {
            state.itemsPerPage = action.payload;
        },
    },
});

export const { setCurrentPage, setItemsPerPage } = paginationSlice.actions;
export default paginationSlice.reducer;