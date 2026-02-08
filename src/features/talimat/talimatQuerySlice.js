import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const talimatQuerySlice = createApi({
  reducerPath: 'talimat',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/talimat`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['MaddrasahReports', 'StudentParentsReports'],
  endpoints: (builder) => ({
    getStudentParentsReportList: builder.query({
      query: (params) => ({
        url: 'student_parents_report_list',
        params: {
          userName: params?.userName || '',
          mobile1: params?.mobile1 || '',
          seeUnSee: params?.seeUnSee || '',
          sortBy: params?.sortBy || 'SCID',
          sortOrder: params?.sortOrder || 'DESC',
        },
      }),
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
    putStudentReportConfirmDetailsUpdate: builder.mutation({
      query: ({ id, confirmDetails }) => ({
        url: `student_complaint_update/${id}`,
        method: 'PUT',
        body: { confirmDetails },
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
  useGetMaddasahReportListQuery,
  useGetStudentParentsReportListQuery,
  usePostMaddasahReportsMutation,
  usePostStudentParentsReportsMutation,
  useDeleteMaddrasahReportMutation,
  useUpdateMaddasahReportsMutation,
  useGetSingleMaddasahReportQuery,
  usePutStudentReportStatusUpdateMutation,
  useGetSingleStudentReportQuery,
  useDeleteStudentReportMutation,
  usePutStudentReportConfirmDetailsUpdateMutation,
} = talimatQuerySlice;
