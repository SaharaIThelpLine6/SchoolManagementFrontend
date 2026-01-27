// src/features/userReports/userReportsSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userReportsSlice = createApi({
  reducerPath: 'userReports',
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
  tagTypes: [],
  endpoints: (builder) => ({
    getUserReport: builder.query({
      query: ({
        report_id,
        user_type,
        gender,
        is_active,
        start_id,
        end_id,
      }) => {
        const params = new URLSearchParams({ report_id });

        if (user_type !== undefined) params.append('user_type', user_type);
        if (gender !== undefined) params.append('gender', gender);
        if (is_active !== undefined) params.append('is_active', is_active);
        if (start_id !== undefined) params.append('start_id', start_id);
        if (end_id !== undefined) params.append('end_id', end_id);

        return `user_report?${params.toString()}`;
      },
    }),
    getStudentReport: builder.query({
      query: ({
        report_id,
        user_type,
        gender,
        is_active,
        start_id,
        SessionID,
        SubClassID,
        ResidentialStatusId,
        NewOldId,
      }) => {
        const params = new URLSearchParams({ report_id });

        if (user_type !== undefined) params.append('user_type', user_type);
        if (gender !== undefined) params.append('gender', gender);
        if (is_active !== undefined) params.append('is_active', is_active);
        if (start_id !== undefined) params.append('start_id', start_id);
        if (SessionID !== undefined) params.append('SessionID', SessionID);
        if (SubClassID !== undefined) params.append('SubClassID', SubClassID);
        if (ResidentialStatusId !== undefined)
          params.append('ResidentialStatusId', ResidentialStatusId);
        if (NewOldId !== undefined) params.append('NewOldId', NewOldId);

        return `student_report?${params.toString()}`;
      },
    }),
    getPointVReport: builder.query({
      query: ({
        report_id,
        session_id,
        class_id,
        exam_id,
        start_id,
        end_id,
      }) => {
        const params = new URLSearchParams();

        if (report_id !== undefined) params.append('report_id', report_id);
        if (session_id !== undefined) params.append('session_id', session_id);
        if (class_id !== undefined) params.append('class_id', class_id);
        if (exam_id !== undefined) params.append('exam_id', exam_id);
        if (start_id !== undefined) params.append('start_id', start_id);
        if (end_id !== undefined) params.append('end_id', end_id);

        return `/pointV_report?${params.toString()}`;
      },
    }),
    getAverageVReport: builder.query({
      query: ({
        report_id,
        session_id,
        class_id,
        exam_id,
        start_id,
        end_id,
      }) => {
        const params = new URLSearchParams();

        if (report_id !== undefined) params.append('report_id', report_id);
        // if (session_id !== undefined) params.append('session_id', session_id);
        // if (class_id !== undefined) params.append('class_id', class_id);
        // if (exam_id !== undefined) params.append('exam_id', exam_id);
        // if (start_id !== undefined) params.append('start_id', start_id);
        // if (end_id !== undefined) params.append('end_id', end_id);

        return `/avarageV_report?${params.toString()}`;
      },
    }),

    getDepositCostReport: builder.query({
      query: ({
        report_id,
        FundID,
        StartDate,
        EndDate,
        CAID,
        start_vouture,
        end_vouture,
        report_base,
        GLID,
        SLID,
        UserID,
      }) => {
        const params = new URLSearchParams({ report_id });
        if (FundID !== undefined) params.append('FundID', FundID);
        if (StartDate !== undefined) params.append('StartDate', StartDate);
        if (EndDate !== undefined) params.append('EndDate', EndDate);
        // if (ResidentialStatusId !== undefined)
        //   params.append("ResidentialStatusId", ResidentialStatusId);
        // if (NewOldId !== undefined) params.append("NewOldId", NewOldId);

        if (CAID !== undefined) params.append('accCaid', CAID);
        if (GLID !== undefined) params.append('GLID', GLID);
        if (start_vouture !== undefined)
          params.append('startVoucherNumber', start_vouture);
        if (end_vouture !== undefined)
          params.append('endVoucherNumber', end_vouture);
        if (report_base !== undefined)
          params.append('report_base', report_base);
        if (SLID !== undefined) params.append('SLID', SLID);
        if (UserID !== undefined) params.append('UserID', UserID);

        console.log(params);
        return `depositcost_report?${params.toString()}`;
      },
    }),
    getExamReport: builder.query({
      query: ({
        report_id,
        SessionID,
        ExamID,
        SubClassID,
        RDID,
        ERIsActive,
        Language,
        sevenColor,
      }) => ({
        url: '/exam_report',
        method: 'GET',
        params: {
          report_id,
          SessionID,
          ExamID,
          SubClassID,
          RDID,
          ERIsActive,
          Language,
          sevenColor,
        },
      }),
    }),
  }),
});

export const {
  useGetUserReportQuery,
  useGetStudentReportQuery,
  useGetDepositCostReportQuery,
  useGetAverageVReportQuery,
  useGetExamReportQuery,
  useGetPointVReportQuery
} = userReportsSlice;
