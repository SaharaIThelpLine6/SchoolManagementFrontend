import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const onlineAdmissionSlice = createApi({
    reducerPath: 'onlineAdmission',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/public/result`,
    }),
    endpoints: (builder) => ({
        getClass: builder.query({
            query: ({id}) => `${id}/view_class`,
        }),
        getResidential: builder.query({
            query: ({id}) => `${id}/residential`,
        }),     
        addStudent: builder.mutation({
            query: ({dataBody, id}) => ({
                url:  `${id}/online_admission`,
                method: 'POST',
                body: dataBody,
            }),
        }),
        getGender: builder.query({
            query: ({id}) => `${id}/gender`,
        }),
        getDivision: builder.query({
            query: ({id}) => `${id}/division`,
        }),
        getDistrict: builder.query({
            query: ({id, divisionId}) => `${id}/district?division_id=${divisionId}`,
        }),
        getThana: builder.query({
            query: ({id, districtId}) => `${id}/thana?district_id=${districtId}`,
        }),
        getStudentRelation: builder.query({
            query: ({id}) => `${id}/student_relation`,
        }),
        getOnlineAdmission: builder.query({
            query: ({id}) => `${id}/online_admission`,
        }),
        getForm: builder.query({
            query: ({id, usercode}) => `${id}/online_admission/${usercode}`,
        })
    }),
});

export const {
    useGetClassQuery,
    useGetResidentialQuery,
    useAddStudentMutation,
    useGetGenderQuery,
    useGetDivisionQuery,
    useGetDistrictQuery,
    useGetThanaQuery,
    useGetStudentRelationQuery,
    useGetOnlineAdmissionQuery,
    useGetFormQuery,
} = onlineAdmissionSlice;
