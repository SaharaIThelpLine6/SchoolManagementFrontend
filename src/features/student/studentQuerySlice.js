
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userStudentSlice = createApi({
    reducerPath: 'userStudent',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/students`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getStudentBySearch: builder.query({
            query: ({ search, ClassID, SessionID }) => {
                const params = new URLSearchParams();
                params.append("search", search);
                if (ClassID) params.append("ClassID", ClassID);
                if (SessionID) params.append("SessionID", SessionID);

                return `search_student?${params.toString()}`;
            },
        }),

        getStudent: builder.query({
            query: () => 'view_students',
        }),
        getStudentReportCets: builder.query({
            query: () => `get_studentreport_cet`,

        }),
        getStudentReportType: builder.query({
            query: () => `get_studentreport_type`,
        }),
        getStudentReports: builder.query({
            query: ({ userCode, classID, SessionID }) => {
                const params = new URLSearchParams();

                if (userCode) params.append('StudentCode', userCode);
                if (classID) params.append('SubClassID', classID);
                if (SessionID) params.append('SessionID', SessionID);

                return `get_studentreports?${params.toString()}`;
            },
        }),
        postStudentCharacterReport: builder.mutation({
            query: (data) => ({
                url: `student_character_report`,
                method: 'POST',
                body: data,
            }),
        })
    }),
});

export const {
    useGetStudentBySearchQuery,
    useGetStudentQuery,
    useGetStudentReportCetsQuery,
    useGetStudentReportTypeQuery,
    useGetStudentReportsQuery,
    usePostStudentCharacterReportMutation
} = userStudentSlice;

