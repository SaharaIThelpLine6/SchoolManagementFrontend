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
  tagTypes: [
    "ExamNames",
  ],
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
    })
  }),
});

export const {
  usePostNewExamMutation,
  useUpdateExamnameMutation,
  useDeleteExamNameMutation,
  useGetExamNamesQuery
} = examSlice;
