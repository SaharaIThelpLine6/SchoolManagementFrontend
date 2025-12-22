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
  tagTypes: ['MaddrasahReports', 'StudentParentsReports'],
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
      providesTags: ['StudentParentsReports'],
    }),
    getMaddasahReportList: builder.query({
      query: () => `maddasah_report_list`,
      providesTags: ['MaddrasahReports'],
    }),
    getSingleMaddasahReport: builder.query({
      query: (id) => `maddasah_report_get/${id}`,
      providesTags: ['MaddrasahReports'],
    }),
    getSingleStudentReport: builder.query({
      query: (id) => `student_report_get/${id}`,
      providesTags: ['StudentParentsReports'],
    }),
    /* ================= POST ================= */

    postMaddasahReports: builder.mutation({
      query: (data) => ({
        url: `maddasah_report_create`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['MaddrasahReports'],
    }),

    postStudentParentsReports: builder.mutation({
      query: (data) => ({
        url: `student_parents_report_create`,
        method: 'POST',
        body: data,
      }),
    }),
    putStudentReportStatusUpdate: builder.mutation({
      query: ({ id, SeeUnSee }) => ({
        url: `student_complaint_see_unsee_update/${id}`,
        method: 'PUT',
        body: { SeeUnSee },
      }),
      invalidatesTags: ['StudentParentsReports'],
    }),

    deleteMaddrasahReport: builder.mutation({
      query: (id) => ({
        url: `maddasah_report/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MaddrasahReports'],
    }),
    deleteStudentReport: builder.mutation({
      query: (id) => ({
        url: `student_complaint_delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentParentsReports'],
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
  useGetSingleMaddasahReportQuery,
  usePutStudentReportStatusUpdateMutation,
  useGetSingleStudentReportQuery,
  useDeleteStudentReportMutation
} = userPanelUserInfo;
