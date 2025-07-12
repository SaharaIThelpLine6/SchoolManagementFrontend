import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const examSlice = createApi({
  reducerPath: "exam",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/exam`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ExamNames", "ExamFeeSettings"],
  endpoints: (builder) => ({
    postNewExam: builder.mutation({
      query: (body) => ({
        url: `insert_exam`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExamNames"],
    }),
    updateExamname: builder.mutation({
      query: (body) => ({
        url: `edit_exam/${body.ID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ExamNames"],
    }),
    deleteExamName: builder.mutation({
      query: (body) => ({
        url: `delete_exam/${body.ID}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExamNames"],
    }),
    getExamNames: builder.query({
      query: () => `get_exam_names`,
      providesTags: ["ExamNames"],
    }),
    getExamFeeSetting: builder.query({
      query: () => `get_exam_fee_setting`,
      providesTags: ["ExamFeeSettings"],
    }),
    postExamFeeSetting: builder.mutation({
      query: (body) => ({
        url: `insert_exam_fee_setting`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["ExamFeeSettings"],
    }),
    updateExamFeeSetting: builder.mutation({
      query: ({ id, body }) => ({
        url: `update_exam_fee_setting/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["ExamFeeSettings"],
    }),
    deleteExamFeeSetting: builder.mutation({
      query: (id) => ({
        url: `delete_exam_fee_setting/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ExamFeeSettings"],
    }),
    postExamPointCondition: builder.mutation({
      query: (body) => ({
        url: `pointwise_exam_condition_setting`,
        method: "POST",
        body,
      }),
      // invalidatesTags: ["ExamFeeSettings"],
    }),
  }),
});

export const {
  usePostNewExamMutation,
  useUpdateExamnameMutation,
  useDeleteExamNameMutation,
  useGetExamNamesQuery,
  useGetExamFeeSettingQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
  useDeleteExamFeeSettingMutation,
  usePostExamPointConditionMutation
} = examSlice;
