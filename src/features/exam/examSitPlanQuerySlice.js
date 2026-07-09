import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const examSitPlanSlice = createApi({
  reducerPath: 'examSitPlan',
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
  tagTypes: [],
  endpoints: (builder) => ({

    getExamSitPlans: builder.query({
      query: ({ sessionId, examId }) => {
        const params = new URLSearchParams();
        if (sessionId) params.append("SessionID", sessionId);
        if (examId) params.append("ExamID", examId);
        return `sitplans?${params.toString()}`;
      },
      providesTags: ["ExamSitPlans"],
    }),
    getExamSubClass: builder.query({
      query: ({ sessionId, examId }) => `exam_subclass/${sessionId}/${examId}`,
      providesTags: ['ExamHallDetails'],
    }),
    getExamSubClassStudents: builder.query({
      query: ({ sessionId, examId, subClassId }) => `exam_subclass_students/${sessionId}/${examId}/${subClassId}`,
      providesTags: ['ExamHallDetailsSubClassStudents'],
    }),
    postExamShift: builder.mutation({
      query: (body) => ({
        url: `exam_shift`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamShift'],
    }),
    getExamShift: builder.query({
      query: ({ sessionId, examId }) => `exam_shift/${sessionId}/${examId}`,
      providesTags: ['ExamShift'],
    }),
    saveSitPlan: builder.mutation({
      query: (body) => ({
        url: `exam_seat_assignment`,
        method: 'POST',
        body,
      }),
    }),
    getSitPlanBySitPlanID: builder.query({
      query: ({ sitplanid }) => `sit_allocated_students_by_sitplanid/${sitplanid}`,
      providesTags: ['ExamShift'],
    }),
    getHallwiseSeatPlan: builder.query({
      query: ({ sessionId, examId, subClassId }) => `hallwise_sit_allocated_students/${sessionId}/${examId}/${subClassId}`,
      providesTags: ['HallWiseSit'],
    }),
    deleteSitPlan: builder.mutation({
      query: (seatPlanId) => ({
        url: `delete_exam_seatplan/${seatPlanId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamSitPlans']
    }),
    updateSitPlan: builder.mutation({
      query: (seatPlanId) => ({
        url: `update_seatplan_status/${seatPlanId}`,
        method: 'POST',
      }),
      invalidatesTags: ['ExamSitPlans']
    }),


  }),
});

export const {
  useGetExamSitPlansQuery,
  useGetExamSubClassQuery,
  useGetExamSubClassStudentsQuery,
  usePostExamShiftMutation,
  useGetExamShiftQuery,
  useGetHallwiseSeatPlanQuery,
  useSaveSitPlanMutation,
  useGetSitPlanBySitPlanIDQuery,
  useDeleteSitPlanMutation,
  useUpdateSitPlanMutation,
} = examSitPlanSlice;
