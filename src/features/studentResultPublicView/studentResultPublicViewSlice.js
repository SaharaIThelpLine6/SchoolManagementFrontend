import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPublicData } from "../../utils/read/api";
export const fetchResultFieldData = createAsyncThunk(
    "studentResultPublicView/fetchResultFieldData",
    async (madrasaId) => {
        try {
            const [schoolDataResponse, academicSessionResponse, examsResponse, classListResponse, genderListRespose] = await Promise.all([
                getPublicData(`/api/public/result/${madrasaId}`),
                getPublicData(`/api/public/result/${madrasaId}/academic_session`),
                getPublicData(`/api/public/result/${madrasaId}/exam_name`),
                getPublicData(`/api/public/result/${madrasaId}/sub_class`)
            ]);
            return {
                schoolData: schoolDataResponse,
                academicSession: academicSessionResponse,
                exam: examsResponse,
                classList: classListResponse
            };
        } catch (error) {
            console.error("Error fetching result field data:", error);
            throw error;
        }
    }
);

export const fetchSettingsFieldData = createAsyncThunk(
    "studentResultPublicView/fetchSettingsFieldData",
    async (madrasaId) => {
        try {
            const [genderDataResponse, divitionResponse, studentRelationResponse] = await Promise.all([
                getPublicData(`/api/public/result/${madrasaId}/gender`),
                getPublicData(`/api/public/result/${madrasaId}/division`),
                getPublicData(`/api/public/result/${madrasaId}/student_relation`)
            ]);
            return {
                gender: genderDataResponse,
                divition: divitionResponse,
                studentRelation: studentRelationResponse
            };
        } catch (error) {
            console.error("Error fetching result field data:", error);
            throw error;
        }
    }
);

export const fetchDidata = createAsyncThunk("studentResultPublicView/fetchDidata", async ({ madrasaId, id }, { getState }) => {
    const state = getState();
    if (state.studentResultPublicView.district[id]) {
        return { id, data: state.studentResultPublicView.district[id] };
    }
    const response = await getPublicData(`/api/public/result/${madrasaId}/district?divition_id=${id}`);
    return { id, data: response };
});

export const fetchThanadata = createAsyncThunk("settings/fetchThanadata", async ({ madrasaId, id }, { getState }) => {

    const state = getState();
    if (state.studentResultPublicView.thana[id]) {
        return { id, data: state.studentResultPublicView.thana[id] };
    }
    const response = await getPublicData(`/api/public/result/${madrasaId}/thana?district_id=${id}`);
    return { id, data: response };
});


export const fetchResult = createAsyncThunk("studentResultPublicView/fetchResult", async (resultUrl) => {
    const [studentResultResponse] = await Promise.all([getPublicData(`/api/public/result/${resultUrl}`)])

    return {
        studentResult: studentResultResponse
    }

})

export const fetchClassResult = createAsyncThunk("studentResultPublicView/fetchClassResult", async ({ schoolId, resultUrl }) => {
    const [classResultResponse] = await Promise.all([getPublicData(`/api/public/result/${schoolId}/marhala/${resultUrl}`)])

    return {
        classResult: classResultResponse,
    }

})

const initialState = {
    defaultFormValue: null,
    editMode: 0,
    academicSession: [],
    district: {},
    thana: {},
    exam: [],
    classList: [],
    classResult: [],
    resultStatistics: null,
    studentResult: [],
    schoolData: [],
    studentRelation: [],
    gender:[],
    divition: [],
    resultStatus: 'idle',
    resultError: null,
    status: 'idle',
    error: null,
};

const studentResultPublicViewSlice = createSlice({
    name: "studentResultPublicView",
    initialState,
    reducers: {
        setResultError: (state, action) => {
            state.resultError = action.payload
        },
        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },
        setDefaultValue: (state, action) => {
            state.defaultFormValue = action.payload
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
            })
            .addCase(fetchDidata.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDidata.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { id, data } = action.payload || {};
                if (id && data) {
                    state.district[id] = data;
                }
            })
            .addCase(fetchDidata.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchThanadata.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchThanadata.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const { id, data } = action.payload || {};
                if (id && data) {
                    state.thana[id] = data;
                }
            })
            .addCase(fetchThanadata.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchSettingsFieldData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSettingsFieldData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gender = action.payload.gender;
                state.divition = action.payload.divition;
                state.studentRelation = action.payload.studentRelation;
            })
            .addCase(fetchSettingsFieldData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });

    },
});
export const { setResultError, setEditMode, setDefaultValue } = studentResultPublicViewSlice.actions;
export default studentResultPublicViewSlice.reducer;