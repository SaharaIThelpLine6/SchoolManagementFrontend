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
  tagTypes: ['MaddrasahReports'],
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
    getStudentParentsReportList: builder.query({
      query: () => `student_parents_report_list`,
    }),
    getMaddasahReportList: builder.query({
      query: () => `maddasah_report_list`,
      providesTags: ['MaddrasahReports'],
    }),
    getSingleMaddasahReport: builder.query({
      query: (id) => `maddasah_report_get/${id}`,
      providesTags: ['MaddrasahReports'],
    }),
    /* ================= POST ================= */

    postMaddasahReports: builder.mutation({
      query: (data) => ({
        url: `maddasah_report_create`, // ✅ POST
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MaddrasahReports'],
    }),

    postStudentParentsReports: builder.mutation({
      query: (data) => ({
        url: `student_parents_report_create`, // ✅ FIXED
        method: 'POST',
        body: data,
      }),
    }),
    deleteMaddrasahReport: builder.mutation({
      query: (id) => ({
        url: `maddasah_report/${id}`, // ✅ FIXED
        method: 'DELETE',
      }),
      invalidatesTags: ['MaddrasahReports'],
    }),

    updateMaddasahReports: builder.mutation({
      query: (data) => ({
        url: `maddasah_report_update/${data.id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['MaddrasahReports'],
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
  useGetStudentParentsReportListQuery,
  usePostMaddasahReportsMutation,
  usePostStudentParentsReportsMutation,
  useDeleteMaddrasahReportMutation,
  useUpdateMaddasahReportsMutation,
  useGetSingleMaddasahReportQuery
} = userPanelUserInfo;
