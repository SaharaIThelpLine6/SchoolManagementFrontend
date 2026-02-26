import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const resultSilce = createApi({
  reducerPath: "result",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/result`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ExamList", "Result"],
  endpoints: (builder) => ({
    getExamList: builder.query({
      query: ({ session_id, exam_id, subclass_id } = {}) => {
        const params = new URLSearchParams();

        if (session_id) params.append("session_id", session_id);
        if (exam_id) params.append("exam_id", exam_id);
        if (subclass_id) params.append("subclass_id", subclass_id);

        const queryString = params.toString();
        return queryString ? `exam_list?${queryString}` : "exam_list";
      },
      providesTags: ["ExamList"],
    }),
    getUserResult: builder.query({
      query: ({ session_id, exam_id, subclass_id } = {}) => {
        const params = new URLSearchParams();

        if (session_id) params.append("session_id", session_id);
        if (exam_id) params.append("exam_id", exam_id);
        if (subclass_id) params.append("subclass_id", subclass_id);

        const queryString = params.toString();
        return queryString
          ? `get_user_result?${queryString}`
          : "get_user_result";
      },
      providesTags: ["Result"],
    }),

    updateExamListStatusUpdate: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `exam_list_status_update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["ExamList"],
    }),
    updateAndPostResult: builder.mutation({
      query: (body) => ({
        url: `update_result`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Result"],
    }),
    getUserSingleResult: builder.query({
      query: ({ session_id, exam_id, class_id, user_id }) => {
        let url = `students/${session_id}/${exam_id}/${class_id}`;
        if (user_id) {
          url += `?user_id=${user_id}`;
        }
        return url;
      },
      providesTags: ["Result"],
    }),
  }),
});

export const {
  useGetExamListQuery,
  useGetUserResultQuery,
  useUpdateExamListStatusUpdateMutation,
  useUpdateAndPostResultMutation,
  useGetUserSingleResultQuery,
} = resultSilce;
