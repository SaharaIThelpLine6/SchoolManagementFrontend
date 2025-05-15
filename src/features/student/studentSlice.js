import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getUserData } from "../../utils/read/api";

export const fetchAdmissionStudentData = createAsyncThunk("student/fetchAdmissionStudentData", async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
        getUserData(token, `/api/students/view_students`),
    ]);
    return {
        studentList: studentListResponse.data,
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
export const fetchSingleStudentDataByStudentCode = createAsyncThunk("student/fetchSingleStudentDataByStudentCode", async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentResponse] = await Promise.all([
        getUserData(token, `/api/students/view_single_student_withcode?id=${id}`),
    ]);
    return {
        academicStudent: studentResponse,
    };
});

const initialState = {
    studentList: [],
    userOnlyStudents: [],
    singleStudent: null, 
    editMode: 0,
    status: 'idle',
    error: null,
    admittedStudent:{}
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
            .addCase(fetchAdmissionStudentData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAdmissionStudentData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.studentList = action.payload.studentList;
            })
            .addCase(fetchAdmissionStudentData.rejected, (state, action) => {
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
            })
            .addCase(fetchSingleStudentDataByStudentCode.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSingleStudentDataByStudentCode.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.admittedStudent = action.payload.academicStudent; 
            })
            .addCase(fetchSingleStudentDataByStudentCode.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});
export const { setEditMode } = classSlice.actions;
export default classSlice.reducer;
