import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userPanelUserInfo = createApi({
  reducerPath: 'userpanelUserInfo',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/userpanel/user/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('user_panel_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MaddrasahReports', 'StudentParentsReports', 'ClassRoutines'],
  endpoints: (builder) => ({
    getUserDetails: builder.query({
      query: (sessionId) => `get_user_details?sessionId=${sessionId}`,
    }),
    geAllReports: builder.query({
      query: (sessionId) => `user_all_report?sessionId=${sessionId}`,
    }),
    geStudentResults: builder.query({
      query: () => `user_result_list`,
    }),
    getStudentRoutines: builder.query({
      query: () => `exam_routine`,
    }),
    getTeachersInfo: builder.query({
      query: () => `teachers_info`,
    }),
    getMaddasahReportList: builder.query({
      query: () => `maddasah_report_list`,
      providesTags: ['MaddrasahReports'],
    }),

    /* ================= POST ================= */
    postStudentParentsReports: builder.mutation({
      query: (data) => ({
        url: `student_parents_report_create`,
        method: 'POST',
        body: data,
      }),
    }),
    getClassRoutines: builder.query({
      query: () => `class_routine_list`,
      providesTags: ['ClassRoutines'],
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useGeAllReportsQuery,
  useGeStudentResultsQuery,
  useGetStudentRoutinesQuery,
  useGetTeachersInfoQuery,
  useGetMaddasahReportListQuery,
  usePostStudentParentsReportsMutation,
  useGetClassRoutinesQuery,
} = userPanelUserInfo;
