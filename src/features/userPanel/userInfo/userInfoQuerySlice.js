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
    getLabelNames: builder.query({
      query: () => `get_label_name`,
    }),

    getSingleExamData: builder.query({
      query: ({ examId, subClassId, sessionId }) => ({
        url: '/get_single_exam',
        params: {
          examId,
          subClassId,
          sessionId,
        },
      }),
    }),
    getUserSingleReport: builder.query({
      query: ({ SRID }) => ({
        url: `/user_single_report/${SRID}`,
      }),
    }),
    getInstitutionInfoUserPanel: builder.query({
      query: () => ({
        url: `/get_institution_info`,
      }),
    }),

    getVideoTutorialLinkUserPanel: builder.query({
      query: ({ SessionID }) => ({
        url: `/get_video_tutorial_link`,
        params: {
          ...(SessionID && { SessionID }),
        },
      }),
      keepUnusedDataFor: 0, // Optional: auto refetch on param change
    }),
    getExamRoutineView: builder.query({
      query: ({ sessionId, examId }) => ({
        url: `/get_exam_routine`,
        params: {
          ...(sessionId && { sessionId }),
          ...(examId && { examId }),
        },
      }),
      keepUnusedDataFor: 0, // Optional: auto refetch on param change
    }),
    getSessionUserPanel: builder.query({
      query: () => ({
        url: `/academic_session_user_panel`,
      }),
    }),
    getExamListUserPanel: builder.query({
      query: () => ({
        url: `/exam_list_user_panel`,
      }),
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
  useGetSingleExamDataQuery,
  useGetLabelNamesQuery,
  useGetUserSingleReportQuery,
  useGetInstitutionInfoUserPanelQuery,
  useGetVideoTutorialLinkUserPanelQuery,
  useGetExamRoutineViewQuery,
  useGetExamListUserPanelQuery,
  useGetSessionUserPanelQuery
} = userPanelUserInfo;
