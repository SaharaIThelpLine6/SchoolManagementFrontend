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
  tagTypes: [
    'MaddrasahReports',
    'StudentParentsReports',
    'ClassRoutines',
    'HomeWorks',
    'HomeWorkStudyTracks',
  ],
  endpoints: (builder) => ({
    getUserDetails: builder.query({
      query: (sessionId) => `get_user_details?sessionId=${sessionId}`,
    }),
    geAllReports: builder.query({
      query: (sessionId) => `user_all_report?sessionId=${sessionId}`,
    }),
    getExamRulesUserPanel: builder.query({
      query: () => `get_exam_rules`,
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
    getHomeWorksUserPanel: builder.query({
      query: ({ SessionID, DateValue }) => ({
        url: 'home_works',
        params: { SessionID, DateValue },
      }),
      providesTags: ['HomeWorks'],
    }),
    getHomeWorkStudyTracksHistoryUserPanel: builder.query({
      query: ({ SessionID, range }) => ({
        url: 'home_work_study_track_history',
        params: { SessionID, range },
      }),
      providesTags: ['HomeWorkStudyTracks'],
    }),
    getFeeLandByAdmissionIdUserPanel: builder.query({
      query: (admissionId) => ({
        url: `/fee_land_by_admission_id_user_panel/${admissionId}`,
        method: 'GET',
      }),
    }),
    getMonthPerStudentsFeeUserPanel: builder.query({
      query: (admissionId) => `month_per_student_fee_userpanel/${admissionId}`,
      providesTags: [],
    }),

    getStudentReportList: builder.query({
      query: (params) => ({
        url: 'student_userpanel_report_list',
        params: {
          seeUnSee: params?.seeUnSee || '',
        },
      }),
    }),
    getStudentComplaintReport: builder.query({
      query: ({ SCID }) => `student_userpanel_report_get/${SCID}`,
    }),
    getGrClassRoutineForUserPanel: builder.query({
      query: () => `gr_class_routine_for_userpanel`,
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useGetExamRulesUserPanelQuery,
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
  useGetSessionUserPanelQuery,
  useGetHomeWorksUserPanelQuery,
  useGetHomeWorkStudyTracksHistoryUserPanelQuery,
  useGetFeeLandByAdmissionIdUserPanelQuery,
  useGetMonthPerStudentsFeeUserPanelQuery,
  useGetStudentReportListQuery,
  useGetStudentComplaintReportQuery,
  useGetGrClassRoutineForUserPanelQuery
} = userPanelUserInfo;
