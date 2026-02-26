import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const examSlice = createApi({
  reducerPath: 'exam',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/exam`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'ExamNames',
    'ExamFeeSettings',
    'ExamCondition',
    'AverageExamConditionAll',
    'GetStudentList',
    'StudentAdmitCard',
    'ExamTalentCondition',
    'ReportSettings',
    'ExamRoutine',
    'ExamRules',
  ],
  endpoints: (builder) => ({
    postNewExam: builder.mutation({
      query: (body) => ({
        url: `insert_exam`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamNames'],
    }),
    updateExamname: builder.mutation({
      query: (body) => ({
        url: `edit_exam/${body.ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamNames'],
    }),
    deleteExamName: builder.mutation({
      query: (body) => ({
        url: `delete_exam/${body.ID}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamNames'],
    }),
    getExamNames: builder.query({
      query: () => `get_exam_names`,
      providesTags: ['ExamNames'],
    }),
    getExamFeeSetting: builder.query({
      query: () => `get_exam_fee_setting`,
      providesTags: ['ExamFeeSettings'],
    }),

    postExamFeeSetting: builder.mutation({
      query: (body) => ({
        url: `insert_exam_fee_setting`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamFeeSettings'],
    }),
    postNewExamCondition: builder.mutation({
      query: (body) => ({
        url: `new_exam_condition`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NewExamCondition'],
    }),
    updateExamFeeSetting: builder.mutation({
      query: ({ id, body }) => ({
        url: `update_exam_fee_setting/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamFeeSettings'],
    }),
    deleteExamFeeSetting: builder.mutation({
      query: (id) => ({
        url: `delete_exam_fee_setting/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamFeeSettings'],
    }),
    postExamPointCondition: builder.mutation({
      query: (body) => ({
        url: `pointwise_exam_condition_setting`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ["ExamFeeSettings"],
    }),
    getAverageExamConditionAll: builder.query({
      query: ({ SessionID = 'all', ExamID = 'all', SubClassID = 'all' }) => ({
        url: `average_exam_condition_all/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        {
          type: 'AverageExamConditionAll',
          id: `${SessionID}-${ExamID}-${SubClassID}`,
        },
      ],
    }),

    postAverageExamConditionSetting: builder.mutation({
      query: (body) => ({
        url: `average_exam_condition_setting`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AverageExamConditionAll'],
    }),

    updateAverageExamConditionSetting: builder.mutation({
      query: (body) => ({
        url: `average_exam_condition_setting`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AverageExamConditionAll'],
    }),
    deleteAverageExamConditionSetting: builder.mutation({
      query: (id) => ({
        url: `average_exam_condition_setting/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AverageExamConditionAll'],
    }),

    getExamCondition: builder.query({
      query: ({ SessionID, ExamID, SubClassID }) => ({
        url: `exam_condition/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        { type: 'ExamCondition', id: `${SessionID}-${ExamID}-${SubClassID}` },
      ],
    }),
    postExamCondition: builder.mutation({
      query: (body) => ({
        url: 'new_exam_condition',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        { type: 'ExamCondition', id: `${SessionID}-${ExamID}-${SubClassID}` },
      ],
    }),
    updatePointWiseExamCondition: builder.mutation({
      query: (body) => ({
        url: `pointwise_exam_condition_setting`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamCondition'],
    }),
    getPointWiseExamCondition: builder.query({
      query: ({ SessionID, ExamID, SubClassID }) => ({
        url: `pointwise_exam_condition/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        { type: 'ExamCondition', id: `${SessionID}-${ExamID}-${SubClassID}` },
      ],
    }),
    postAverageSubjectPassNumber: builder.mutation({
      query: (body) => ({
        url: `average_subject_and_passnumber`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AverageSubjectPassNumberAll'],
    }),

    updateAverageSubjectPassNumber: builder.mutation({
      query: (body) => ({
        url: `average_subject_and_passnumber`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AverageSubjectPassNumberAll'],
    }),
    getAverageSubjectPassNumber: builder.query({
      query: ({ SessionID, ExamID, SubClassID }) => ({
        url: `average_subject_and_passnumber/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        {
          type: 'AverageSubjectPassNumberAll',
          id: `${SessionID}-${ExamID}-${SubClassID}`,
        },
      ],
    }),
    getGetStudentList: builder.query({
      query: ({ SessionID, ExamID, SubClassID }) => ({
        url: `get_student_list/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        {
          type: 'GetStudentList',
          id: `${SessionID}-${ExamID}-${SubClassID}`,
        },
      ],
    }),
    getStudentAdmitCards: builder.query({
      query: ({ SessionID, ExamID, SubClassID, RDID, UserCode }) => {
        const url = UserCode?.trim()
          ? `student_admit_card/${SessionID}/${ExamID}/${SubClassID}/${RDID}/${UserCode}`
          : `student_admit_card/${SessionID}/${ExamID}/${SubClassID}/${RDID}`;
        return {
          url,
          method: 'GET',
        };
      },
      providesTags: (
        result,
        error,
        { SessionID, ExamID, SubClassID, RDID, UserCode }
      ) => [
        {
          type: 'StudentAdmitCard',
          id: `${SessionID}-${ExamID}-${SubClassID}-${RDID}-${
            UserCode || 'all'
          }`,
        },
      ],
    }),
    postGetStudentList: builder.mutation({
      query: (body) => ({
        url: `addto_student_list`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['GetStudentList'],
    }),
    postExamTalentCondition: builder.mutation({
      query: (body) => ({
        url: `exam_talent_condition`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamTalentCondition'],
    }),
    getExamTalentCondition: builder.query({
      query: ({ SessionID, ExamID, SubClassID }) => ({
        url: `exam_talent_condition/${SessionID}/${ExamID}/${SubClassID}`,
        method: 'GET',
      }),
      providesTags: (result, error, { SessionID, ExamID, SubClassID }) => [
        {
          type: 'ExamTalentCondition',
          id: `${SessionID}-${ExamID}-${SubClassID}`,
        },
      ],
    }),
    getReportSetting: builder.query({
      query: () => `report_settings`,
      providesTags: ['ReportSettings'],
    }),

    getExamFeeSettingByExamID: builder.query({
      query: ({ examId, userCode, sessionId }) => {
        let url = `exam_fee_setting_by_examId/${examId}`;
        const params = new URLSearchParams();

        if (userCode) params.append('userCode', userCode);
        if (sessionId) params.append('sessionId', sessionId);

        if (params.toString()) url += `?${params.toString()}`;

        return url;
      },
      providesTags: ['StudentFee', 'SelectedStudentPerFee'],
    }),
    getExamRoutine: builder.query({
      query: ({ sessionID, examID, subclassID, printID }) =>
        `exam_routine?sessionID=${sessionID}&examID=${examID}&subclassID=${subclassID}&printID=${printID}`,
      providesTags: ['ExamRoutine'],
    }),
    getAllExamRoutine: builder.query({
      query: ({ sessionID, examID }) =>
        `get_all_exam_routine/${sessionID}/${examID}`,
      providesTags: ['ExamRoutine'],
    }),
    getSingleExamRoutine: builder.query({
      query: (eridl) => `get_single_exam_routine/${eridl}`,
      providesTags: ['ExamRoutine'],
    }),

    postExamRoutine: builder.mutation({
      query: (body) => ({
        url: `exam_routine_create`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamRoutine'],
    }),
    putExamRoutine: builder.mutation({
      query: (body) => ({
        url: `exam_routine_update/${body.ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamRoutine'],
    }),
    deleteExamRoutine: builder.mutation({
      query: (id) => ({
        url: `delete_exam_routine/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamRoutine'],
    }),
    getExamRules: builder.query({
      query: () => `get_exam_rules`,
      providesTags: ['ExamRules'],
    }),
    getExamRule: builder.query({
      query: (id) => `get_exam_rule/${id}`,
      providesTags: ['ExamRules'],
    }),
    postExamRule: builder.mutation({
      query: (body) => ({
        url: `exam_rule`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamRules'],
    }),
    putExamRule: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `exam_rule/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ExamRules'],
    }),
    deleteExamRule: builder.mutation({
      query: (id) => ({
        url: `exam_rule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamRules'],
    }),
  }),
});

export const {
  usePostExamRoutineMutation,
  useDeleteExamRoutineMutation,
  usePostNewExamMutation,
  useUpdateExamnameMutation,
  useDeleteExamNameMutation,
  useGetExamNamesQuery,
  useGetExamFeeSettingQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
  useDeleteExamFeeSettingMutation,
  usePostExamPointConditionMutation,
  useGetExamConditionQuery,
  usePostExamConditionMutation,
  useGetPointWiseExamConditionQuery,
  useUpdatePointWiseExamConditionMutation,
  useGetAverageExamConditionAllQuery,
  usePostAverageExamConditionSettingMutation,
  useUpdateAverageExamConditionSettingMutation,
  usePostAverageSubjectPassNumberMutation,
  useUpdateAverageSubjectPassNumberMutation,
  useGetAverageSubjectPassNumberQuery,
  useGetGetStudentListQuery,
  usePostGetStudentListMutation,
  useGetStudentAdmitCardsQuery,
  usePostNewExamConditionMutation,
  useGetExamTalentConditionQuery,
  usePostExamTalentConditionMutation,
  useGetReportSettingQuery,
  usePostReportSettingMutation,
  useGetExamFeeSettingByExamIDQuery,
  useDeleteAverageExamConditionSettingMutation,
  useGetExamRoutineQuery,
  useGetAllExamRoutineQuery,
  usePutExamRoutineMutation,
  useGetSingleExamRoutineQuery,

  useGetExamRuleQuery,
  useGetExamRulesQuery,
  usePostExamRuleMutation,
  usePutExamRuleMutation,
  useDeleteExamRuleMutation
} = examSlice;
