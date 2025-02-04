import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSettingsData } from '../../utils/read/api';

export const fetchSingleUser = createAsyncThunk("userInfo/fetchSingleUser", async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const response = await getSettingsData(token, `/api/users/get_single_user?id=${id}`);
    return { id, data: response };
})


export const fetchUserList = createAsyncThunk(
    "userInfo/fetchUserList",
    async ({ itemPerPage, currentPage }, { rejectWithValue }) => {
        console.log("home");
        
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');
        try {
            const response = await getSettingsData(token, `/api/users?page=${currentPage}&limit=${itemPerPage}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchStudentData = createAsyncThunk(
    "userInfo/fetchStudentData",
    async ({ itemPerPage, currentPage, userType }, { rejectWithValue }) => {

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');
        try {
            const response = await getSettingsData(token, `/api/users?page=${currentPage}&limit=${itemPerPage}&usertype=1`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchTeacherData = createAsyncThunk(
    "userInfo/fetchTeacherData",
    async ({ itemPerPage, currentPage, userType }, { rejectWithValue }) => {

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');
        try {
            const response = await getSettingsData(token, `/api/users?page=${currentPage}&limit=${itemPerPage}&usertype=2`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGuardianData = createAsyncThunk(
    "userInfo/fetchGuardianData",
    async ({ itemPerPage, currentPage, userType }, { rejectWithValue }) => {

        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token is missing');
        try {
            const response = await getSettingsData(token, `/api/users?page=${currentPage}&limit=${itemPerPage}&usertype=4`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);



const initialState = {
    defaultFormValue: null,
    editMode: 0,
    singleUserstatus: 'idle',
    singleUsererror: null,

    userList: [], // For general user list
    totalPages: 0, // For general user list
    totalUsers: 0,

    totalStudents: 0,
    totalTeachers: 0,
    totalGuardian: 0,


    userListStatus: 'idle',
    userListError: null,
    students: [], // For students
    teachers: [], // For teachers
    guardians: [], // For guardians
    studentsStatus: 'idle',
    teachersStatus: 'idle',
    guardiansStatus: 'idle',
    studentsError: null,
    teachersError: null,
    guardiansError: null,
};

const userInfoSlice = createSlice({
    name: 'userInfo',
    initialState,
    reducers: {
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchSingleUser
            .addCase(fetchSingleUser.pending, (state) => {
                state.singleUserstatus = 'loading';
                state.singleUsererror = null;
            })
            .addCase(fetchSingleUser.fulfilled, (state, action) => {
                state.singleUserstatus = 'succeeded';
                state.defaultFormValue = action.payload.data;
            })
            .addCase(fetchSingleUser.rejected, (state, action) => {
                state.singleUserstatus = 'failed';
                state.singleUsererror = action.error.message;
            })

            // Handle fetchUserList
            .addCase(fetchUserList.pending, (state) => {
                state.userListStatus = 'loading';
                state.userListError = null;
            })
            .addCase(fetchUserList.fulfilled, (state, action) => {
                state.userListStatus = 'succeeded';
                state.userList = action.payload.users;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchUserList.rejected, (state, action) => {
                state.userListStatus = 'failed';
                state.userListError = action.payload;
            })

            // Handle fetchStudentData
            .addCase(fetchStudentData.pending, (state) => {
                state.studentsStatus = 'loading';
                state.studentsError = null;
            })
            .addCase(fetchStudentData.fulfilled, (state, action) => {
                state.studentsStatus = 'succeeded';
                state.students = action.payload.users;
                state.totalStudents = action.payload.totalUsers;
            })
            .addCase(fetchStudentData.rejected, (state, action) => {
                state.studentsStatus = 'failed';
                state.studentsError = action.payload;
                
            })

            // Handle fetchTeacherData
            .addCase(fetchTeacherData.pending, (state) => {
                state.teachersStatus = 'loading';
                state.teachersError = null;
            })
            .addCase(fetchTeacherData.fulfilled, (state, action) => {
                state.teachersStatus = 'succeeded';
                state.teachers = action.payload.users;
                state.totalTeachers = action.payload.totalUsers
            })
            .addCase(fetchTeacherData.rejected, (state, action) => {
                state.teachersStatus = 'failed';
                state.teachersError = action.payload;
            })

            // Handle fetchGuardianData
            .addCase(fetchGuardianData.pending, (state) => {
                state.guardiansStatus = 'loading';
                state.guardiansError = null;
            })
            .addCase(fetchGuardianData.fulfilled, (state, action) => {
                state.guardiansStatus = 'succeeded';
                state.guardians = action.payload.users;
                state.totalGuardian = action.payload.totalUsers
            })
            .addCase(fetchGuardianData.rejected, (state, action) => {
                state.guardiansStatus = 'failed';
                state.guardiansError = action.payload;
            });
    }
});

export const { setEditMode } = userInfoSlice.actions;
export default userInfoSlice.reducer;
