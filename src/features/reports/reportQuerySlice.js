import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const reportQuerySlice = createApi({
  reducerPath: 'reportQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/reports`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ReportTemplate'],
  endpoints: (builder) => ({
    // ---------- Template CRUD ----------
    getReportTemplates: builder.query({
      query: (reportType = 'admission_register') => ({
        url: '/report_template',
        params: { report_type: reportType },
      }),
      providesTags: ['ReportTemplate'],
    }),

    addReportTemplate: builder.mutation({
      query: (body) => ({
        url: '/report_template',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ReportTemplate'],
    }),

    updateReportTemplate: builder.mutation({
      query: ({ TemplateID, ...body }) => ({
        url: `/report_template/${TemplateID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ReportTemplate'],
    }),

    deleteReportTemplate: builder.mutation({
      query: (TemplateID) => ({
        url: `/report_template/${TemplateID}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReportTemplate'],
    }),

    // ---------- Filter dropdown options ----------
    getReportFilters: builder.query({
      query: () => '/student_report_filters',
    }),

    // ---------- Live student data for the builder preview ----------
    getStudentReportList: builder.query({
      query: (params = {}) => {
        // null, undefined বা empty string গুলো বাদ দিয়ে ক্লিন প্যারামিটার তৈরি করা
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
        );
        return {
          url: '/student_report_list',
          params: cleanParams,
        };
      },
    }),
  }),
});

export const {
  useGetReportTemplatesQuery,
  useAddReportTemplateMutation,
  useUpdateReportTemplateMutation,
  useDeleteReportTemplateMutation,
  useGetReportFiltersQuery,
  useGetStudentReportListQuery,
} = reportQuerySlice;
