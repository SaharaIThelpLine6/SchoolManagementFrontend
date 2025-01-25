import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicData } from "../../utils/read/api";

export const fetchResultFieldData = createAsyncThunk("studentResultPublicView/fetchResultFieldData", async (madrasaId) => {
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
});

export const fetchResult = createAsyncThunk("studentResultPublicView/fetchResult", async (resultUrl) => {
    const [studentResultResponse] = await Promise.all([getPublicData(`/api/public/result/${resultUrl}`)])

    return {
        studentResult: studentResultResponse
    }

})

export const fetchClassResult = createAsyncThunk("studentResultPublicView/fetchClassResult", async (resultUrl) => {
    const [classResultResponse] = await Promise.all([getPublicData(`/api/public/result/${resultUrl}`)])

    return {
        classResult: classResultResponse
    }

})

const initialState = {
    academicSession: [],
    exam: [],
    classList: [],
    classResult:[],
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
            })
            .addCase(fetchClassResult.rejected, (state, action) => {
                state.resultStatus = 'failed';
                state.resultError = action.error.message;
            });

    },
});
export const { setResultError } = studentResultPublicViewSlice.actions;
export default studentResultPublicViewSlice.reducer;