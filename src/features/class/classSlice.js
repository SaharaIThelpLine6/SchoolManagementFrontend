import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData } from "../../utils/read/api";
import { updateInData } from "../../utils/update/api";

export const fetchClassData = createAsyncThunk("class/fetchClassData", async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    // console.log("fetch data =============");


    const [classListResponse, subClassListResponse] = await Promise.all([
        getUserData(token, `/api/academic/view_class`),
        getUserData(token, '/api/academic/view_subclass'),
    ]);


    // await 
    return {
        classList: classListResponse,
        subClassList: subClassListResponse
    }; // Assuming response contains the class data
});

export const updateClassSerial = createAsyncThunk("class/updateClassSerial",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token is missing");

            console.log("Token verified");
            console.log("Data to update:", data);
            const response = await updateInData(1, data, `/api/academic/update_serial`);
            return { id, data: response };
        } catch (error) {
            console.error("Error updating class serial:", error);
            return rejectWithValue(error.message);
        }
    }
);


const initialState = {
    classList: [],
    subClassList: [],
    editMode: 0,
    updateClassSerialStatus: 'idle',
    status: 'idle',
    error: null,
};

const classSlice = createSlice({
    name: "class",
    initialState,
    reducers: {
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchClassData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchClassData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.classList = action.payload.classList;
                state.subClassList = action.payload.subClassList;
            })
            .addCase(fetchClassData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateClassSerial.pending, (state, action) => {
                state.updateClassSerialStatus = 'loading';
                state.error = null;
            })
            .addCase(updateClassSerial.fulfilled, (state, action) => {
                state.updateClassSerialStatus = 'succeeded'
            })
            .addCase(updateClassSerial.rejected, (state, action) => {
                state.updateClassSerialStatus = 'failed';
                state.error = action.error.message;
            });
    },
});
export const { setEditMode } = classSlice.actions;
export default classSlice.reducer;
