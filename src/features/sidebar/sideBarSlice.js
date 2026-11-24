import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOpen: false,
    isDesktopOpen: true,
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
        openDesktopSidebar: (state) => { state.isDesktopOpen = true; },
        closeDesktopSidebar: (state) => { state.isDesktopOpen = false; },
        toggleDesktopSidebar: (state) => { state.isDesktopOpen = !state.isDesktopOpen; },

    },
});

export const { openSidebar, closeSidebar, toggleSidebar, openDesktopSidebar, closeDesktopSidebar, toggleDesktopSidebar } = sideBarSlice.actions;

export default sideBarSlice.reducer;