import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicData } from "../../utils/read/api";
export const fetchResultFieldData = createAsyncThunk(
    "studentResultPublicView/fetchResultFieldData",
    async (madrasaId) => {
      try {
        const [schoolDataResponse, academicSessionResponse, examsResponse, classListResponse] = await Promise.all([
          getPublicData(`/api/public/result/${madrasaId}`),
          getPublicData(`/api/public/result/${madrasaId}/academic_session`),
          getPublicData(`/api/public/result/${madrasaId}/exam_name`),
          getPublicData(`/api/public/result/${madrasaId}/sub_class`),
        ]);
        return {
          schoolData: schoolDataResponse,
          academicSession: academicSessionResponse,
          exam: examsResponse,
          classList: classListResponse,
        };
      } catch (error) {
        console.error("Error fetching result field data:", error);
        throw error;
      }
    }
  );

export const fetchResult = createAsyncThunk("studentResultPublicView/fetchResult", async (resultUrl) => {
    const [studentResultResponse] = await Promise.all([getPublicData(`/api/public/result/${resultUrl}`)])

    return {
        studentResult: studentResultResponse
    }

})

export const fetchClassResult = createAsyncThunk("studentResultPublicView/fetchClassResult", async ({schoolId,resultUrl}) => {
    const [classResultResponse] = await Promise.all([getPublicData(`/api/public/result/${schoolId}/marhala/${resultUrl}`)])

    return {
        classResult: classResultResponse,
    }

})

const initialState = {
    academicSession: [],
    exam: [],
    classList: [],
    classResult:[],
    resultStatistics: null,
    studentResult:[],
    schoolData:[],
    resultStatus: 'idle',
    resultError: null,
    status: 'idle',
    error: null,
};

const studentResultPublicViewSlice = createSlice({
    name: "studentResultPublicView",
    initialState,
    reducers: {
        setResultError: (state, action)=>{
            state.resultError = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchResultFieldData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchResultFieldData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.schoolData = action.payload.schoolData
                state.academicSession = action.payload.academicSession;
                state.exam = action.payload.exam;
                state.classList = action.payload.classList;
                
            })
            .addCase(fetchResultFieldData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchResult.pending, (state, action) => {
                state.resultStatus = 'loading';
                state.resultError = null;
            })
            .addCase(fetchResult.fulfilled, (state, action) => {
                state.resultStatus = 'succeeded'
                state.studentResult = action.payload.studentResult;
            })
            .addCase(fetchResult.rejected, (state, action) => {
                state.resultStatus = 'failed';
                state.resultError = action.error.message;
            })
            .addCase(fetchClassResult.pending, (state, action) => {
                state.resultStatus = 'loading';
                state.resultError = null;
            })
            .addCase(fetchClassResult.fulfilled, (state, action) => {
                state.resultStatus = 'succeeded'
                state.classResult = action.payload.classResult;
                state.resultStatistics = action.payload.classResult[0];
            })
            .addCase(fetchClassResult.rejected, (state, action) => {
                state.resultStatus = 'failed';
                state.resultError = action.error.message;
            });

    },
});
export const { setResultError } = studentResultPublicViewSlice.actions;
export default studentResultPublicViewSlice.reducer;