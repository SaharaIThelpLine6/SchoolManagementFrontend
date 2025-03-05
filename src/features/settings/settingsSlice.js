import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSettingsData, getUserData } from '../../utils/read/api';

export const fetchSettingsData = createAsyncThunk('settings/fetchSettingsData', async (_, { getState }) => {
    const token = localStorage.getItem('token');
    const state = getState();
    if (!token) throw new Error('Token is missing');
    const [genderResponse, divisionResponse, codeSettingResponse, residentialResponse,permissionTypeResponse, studentRelationResponse, academicSessionResponse, userTypeResponse, studentFinancialStatusResponse] = await Promise.all([
        getSettingsData(token, '/api/settings/gender'),
        getSettingsData(token, '/api/settings/division'),
        getSettingsData(token, '/api/settings/code_setting'),
        getSettingsData(token, '/api/settings/residential'),
        getSettingsData(token, '/api/settings/permission_type'),
        getSettingsData(token, '/api/settings/student_relation'),
        getSettingsData(token, '/api/settings/academic_session'),
        getUserData(token, '/api/users/user_type'),
        getUserData(token, '/api/settings/financial_status'),
    ]);
    return {
        gender: genderResponse,
        divition: divisionResponse,
        codeSetting: codeSettingResponse,
        residential: residentialResponse,
        permissionType: permissionTypeResponse,
        studentRelation: studentRelationResponse,
        academicSession: academicSessionResponse,
        userType: userTypeResponse,
        studentFinancialStatus: studentFinancialStatusResponse
    };
});

export const fetchDidata = createAsyncThunk("settings/fetchDidata", async (id, { getState }) => {
    console.log("Fetch thana data");
    
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const state = getState();
    if (state.settings.district[id]) {
        return { id, data: state.settings.district[id] }; 
    }
    const response = await getSettingsData(token, `/api/settings/district?divition_id=${id}`);
    return { id, data: response };
});

export const fetchThanadata = createAsyncThunk("settings/fetchThanadata", async (id, { getState }) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token is missing');
    const state = getState();
    if (state.settings.thana[id]) {
        return { id, data: state.settings.thana[id] };
    }
    const response = await getSettingsData(token, `/api/settings/thana?district_id=${id}`);
    return { id, data: response };
});

const initialState = {
    gender: [],
    divition: [],
    userType: [],
    district: {},
    thana: {},
    codeSetting: [],
    residential: [],
    permissionType: [],
    studentRelation: [],
    academicSession:[],
    studentFinancialStatus: [],
    currentDivitionId: null,
    currentDistrictId: null,
    status: 'idle',
    error: null,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setDivisionID: (state, action) => {
            state.currentDivitionId = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettingsData.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchSettingsData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.gender = action.payload.gender;
                state.divition = action.payload.divition;
                state.codeSetting = action.payload.codeSetting;
                state.residential = action.payload.residential;
                state.permissionType = action.payload.permissionType;
                state.studentRelation = action.payload.studentRelation;
                state.academicSession = action.payload.academicSession;
                state.userType = action.payload.userType;
                state.studentFinancialStatus = action.payload.studentFinancialStatus;
            })
            .addCase(fetchSettingsData.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
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
    },
});
export const { setDivisionID } = settingsSlice.actions;
export default settingsSlice.reducer;
