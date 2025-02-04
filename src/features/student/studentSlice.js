import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData } from "../../utils/read/api";
import { updateInData } from "../../utils/update/api";

export const fetchStudentData = createAsyncThunk("student/fetchStudentData", async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
        getUserData(token, `/api/students/view_students`),
    ]);
    console.log(studentListResponse);
    
    return {
        studentList: studentListResponse,
    };
});

// export const updateClassSerial = createAsyncThunk("class/updateClassSerial",
//     async ({ id, data }, { rejectWithValue }) => {
//         try {
//             const token = localStorage.getItem("token");
//             if (!token) throw new Error("Token is missing");

//             console.log("Token verified");
//             console.log("Data to update:", data);
//             const response = await updateInData(1, data, `/api/academic/update_serial`);
//             return { id, data: response };
//         } catch (error) {
//             console.error("Error updating class serial:", error);
//             return rejectWithValue(error.message);
//         }
//     }
// );


const initialState = {
    studentList: [],
    editMode: 0,
    status: 'idle',
    error: null,
};

const classSlice = createSlice({
    name: "student",
    initialState,
    reducers: {
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchStudentData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.studentList = action.payload.studentList;
            })
            .addCase(fetchStudentData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
    },
});
export const { setEditMode } = classSlice.actions;
export default classSlice.reducer;
