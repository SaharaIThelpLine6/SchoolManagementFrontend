import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { get } from "react-hook-form";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const dashboardSlice = createApi({
  reducerPath: "dashboard",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserWithImages"],
  endpoints: (builder) => ({
    getTotalStudent: builder.query({
      query: () => "total_user?usertype=1",
    }),
    getAllUserWithImage: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `user_info_image?page=${page}&limit=${limit}`,
      providesTags: ["UserWithImages"],
    }),

    postUserSingleImageUpload: builder.mutation({
      query: (data) => ({
        url: `upload_single`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserWithImages"],
    }),
    postUserMultipleImagesUpload: builder.mutation({
      query: (data) => ({
        url: `upload_multiple`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserWithImages"],
    }),
    getTotalTeacher: builder.query({
      query: () => "total_user?usertype=2",
    }),
    getTotalDoner: builder.query({
      query: () => "total_user?usertype=5",
    }),
    getTotalDue: builder.query({
      query: () => "total_due",
    }),
    getStudentNumberByClass: builder.query({
      query: () => `student_by_class`,
    }),
    getStudentBySession: builder.query({
      query: () => `student_by_session`,
    }),
    postLogin: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetTotalStudentQuery,
  useGetAllUserWithImageQuery,
  useGetTotalTeacherQuery,
  useGetTotalDonerQuery,
  useGetTotalDueQuery,
  useGetStudentNumberByClassQuery,
  useGetStudentBySessionQuery,
  usePostLoginMutation,
  usePostUserSingleImageUploadMutation,
  usePostUserMultipleImagesUploadMutation,
} = dashboardSlice;
