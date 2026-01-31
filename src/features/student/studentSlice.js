import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUserData } from '../../utils/read/api';

export const fetchAdmissionStudentData = createAsyncThunk(
  'student/fetchAdmissionStudentData',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
      getUserData(token, `/api/students/view_students`),
    ]);
    return {
      studentList: studentListResponse.data,
    };
  }
);

export const fetchUserOnlyStudentData = createAsyncThunk(
  'student/fetchUserOnlyStudentData',
  async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentListResponse] = await Promise.all([
      getUserData(token, `/api/students/view_useronly_students`),
    ]);
    return {
      userOnlyStudents: studentListResponse,
    };
  }
);
export const fetchSingleStudentData = createAsyncThunk(
  'student/fetchSingleStudentData',
  async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentResponse] = await Promise.all([
      getUserData(token, `/api/students/view_single_student?id=${id}`),
    ]);
    return {
      singleStudent: studentResponse,
    };
  }
);
export const fetchSingleStudentDataByStudentCode = createAsyncThunk(
  'student/fetchSingleStudentDataByStudentCode',
  async (id) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentResponse] = await Promise.all([
      getUserData(token, `/api/students/view_single_student_withcode?id=${id}`),
    ]);
    return {
      academicStudent: studentResponse,
    };
  }
);
export const fetchSingleStudentDataByStudentCodeAndSession = createAsyncThunk(
  'student/fetchSingleStudentDataByStudentCodeAndSession',
  async ({ id, sessionId }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const [studentResponse] = await Promise.all([
      getUserData(
        token,
        `/api/students/view_single_student_withcode_and_session?id=${id}&sessionId=${sessionId}`
      ),
    ]);
    return {
      academicClassStudent: studentResponse,
    };
  }
);

const initialState = {
  studentList: [],
  userOnlyStudents: [],
  singleStudent: null,
  editMode: 0,
  status: 'idle',
  error: null,
  admittedStudent: {},
  academicClassStudent: {},
  academicClassStudentError: null,
  filteredStudent: null,
  filteredUser: null,
  filteredSelectedPerStudentFee: null,
  monthFeeData: null,
  studentFeeUpdateID: null,
  characterReportEditMode: null,
  parentsData: [],
  allUsers: [],
  PrintableStudentList: []
};

const classSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setEditMode: (state, action) => {
      state.editMode = action.payload;
    },
    setFilteredStudent: (state, action) => {
      state.filteredStudent = action.payload;
    },
    setFilteredUser: (state, action) => {
      state.filteredUser = action.payload;
    },
    setFilteredSelectedPerStudentFee: (state, action) => {
      state.filteredSelectedPerStudentFee = action.payload;
    },
    setCharacterReportEditMode: (state, action) => {
      state.characterReportEditMode = action.payload;
    },
    setParentsData: (state, action) => {
      state.parentsData = action.payload;
    },
    setMonthFeeData: (state, action) => {
      state.monthFeeData = action.payload;
    },
    setStudentFeeUpdateID: (state, action) => {
      state.studentFeeUpdateID = action.payload;
    },
    deleteParentData: (state, action) => {
      state.parentsData = state.parentsData.filter(
        (student) => student.StudentCode !== action.payload
      );
    },
    clearParentsData: (state) => {
      state.parentsData = [];
    },
    setAllUsersData: (state, action) => {
      state.allUsers = action.payload;
    },
    deleteAllUsersData: (state, action) => {
      state.allUsers = state.allUsers.filter(
        (user) => user.UserCode !== action.payload
      );
    },
    clearAllUsersData: (state) => {
      state.allUsers = [];
    },
    setPrintableStudentList: (state, action) => {
      state.PrintableStudentList = action.payload;
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
      .addCase(
        fetchSingleStudentDataByStudentCode.fulfilled,
        (state, action) => {
          state.status = 'succeeded';
          state.admittedStudent = action.payload.academicStudent;
        }
      )
      .addCase(
        fetchSingleStudentDataByStudentCode.rejected,
        (state, action) => {
          state.status = 'failed';
          state.error = action.error.message;
        }
      )
      .addCase(
        fetchSingleStudentDataByStudentCodeAndSession.pending,
        (state) => {
          state.status = 'loading';
          state.academicClassStudentError = null;
        }
      )
      .addCase(
        fetchSingleStudentDataByStudentCodeAndSession.fulfilled,
        (state, action) => {
          state.status = 'succeeded';
          state.admittedStudent = action.payload.academicClassStudent;
        }
      )
      .addCase(
        fetchSingleStudentDataByStudentCodeAndSession.rejected,
        (state, action) => {
          state.status = 'failed';
          state.academicClassStudentError = action.error.message;
        }
      );
  },
});
export const {
  setEditMode,
  setFilteredStudent,
  setFilteredUser,
  setFilteredSelectedPerStudentFee,
  setCharacterReportEditMode,
  setParentsData,
  deleteParentData,
  clearParentsData,
  setAllUsersData,
  deleteAllUsersData,
  clearAllUsersData,
  setMonthFeeData,
  setStudentFeeUpdateID,
  setPrintableStudentList,
} = classSlice.actions;
export default classSlice.reducer;
