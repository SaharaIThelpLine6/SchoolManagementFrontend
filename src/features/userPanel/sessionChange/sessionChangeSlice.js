import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    currentSession: null,
};

const sessionChangeSlice = createSlice({
    name: 'sessionChange',
    initialState,
    reducers: {
        setCurrentSession: (state, action) => {
            console.log(action);
            
            state.currentSession = action.payload;
        },
    }
});

export const { setCurrentSession } = sessionChangeSlice.actions;
export default sessionChangeSlice.reducer;
