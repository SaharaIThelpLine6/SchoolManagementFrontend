import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData } from "../../utils/read/api";

export const fetchStudentData = createAsyncThunk("student/fetchStudentData", async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
        getUserData(token, `/api/students/view_students`),
    ]);
    return {
        studentList: studentListResponse,
    };
});

export const fetchUserOnlyStudentData = createAsyncThunk("student/fetchUserOnlyStudentData", async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
        getUserData(token, `/api/students/view_useronly_students`),
    ]);
    return {
        userOnlyStudents: studentListResponse,
    };
});
export const fetchSingleStudentData = createAsyncThunk("student/fetchSingleStudentData", async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentResponse] = await Promise.all([
        getUserData(token, `/api/students/view_single_student?id=${id}`),
    ]);
    return {
        singleStudent: studentResponse,
    };
});

const initialState = {
    studentList: [],
    userOnlyStudents: [],
    singleStudent: null, // Added initial state for single student
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
            .addCase(fetchUserOnlyStudentData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserOnlyStudentData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.userOnlyStudents = action.payload.userOnlyStudents;
            })
            .addCase(fetchUserOnlyStudentData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchSingleStudentData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSingleStudentData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.singleStudent = action.payload.singleStudent;
            })
            .addCase(fetchSingleStudentData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});
export const { setEditMode } = classSlice.actions;
export default classSlice.reducer;
