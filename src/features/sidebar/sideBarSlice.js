import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
};

const sideBarSlice = createSlice({
    name: 'sideBar',
    initialState,
    reducers: {
        openSidebar: (state) => {
            state.isOpen = true;
        },
        closeSidebar: (state) => {
            state.isOpen = false;
        },
        toggleSidebar: (state) => {
            state.isOpen = !state.isOpen;
        },
    },
});

export const { openSidebar, closeSidebar, toggleSidebar } = sideBarSlice.actions;

export default sideBarSlice.reducer;