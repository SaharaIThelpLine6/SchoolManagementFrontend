import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSettingsData } from '../../utils/read/api';

export const fetchSingleUser = createAsyncThunk("userInfo/fetchSingleUser", async (id) => {
    console.log("data fetcher");

    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const response = await getSettingsData(token, `/api/users/get_single_user?id=${id}`);
    return { id, data: response };
})

const initialState = {
    defaultFormValue: null,
    editMode: 0,
    singleUserstatus: 'idle',
    singleUsererror: null,
};

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setEditMode: (state, action) => {
            state.editMode = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSingleUser.pending, (state) => {
                state.singleUserstatus = 'loading';
                state.error = null;
            })
            .addCase(fetchSingleUser.fulfilled, (state, action) => {
                state.singleUserstatus = 'succeeded';
                state.defaultFormValue = action.payload.data
            })
            .addCase(fetchSingleUser.rejected, (state, action) => {
                state.singleUserstatus = 'failed';
                state.error = action.error.message;
            })
    }
});
export const {setEditMode} = userInfoSlice.actions
export default userInfoSlice.reducer;
