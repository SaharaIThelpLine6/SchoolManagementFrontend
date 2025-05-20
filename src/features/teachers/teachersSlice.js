import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const teachersSlice = createApi({
  reducerPath: "teachers",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/teachers`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Teacher"], // define tag type
  endpoints: (builder) => ({
    getDesignation: builder.query({
      query: () => "designation",
    }),
    getTeacherInfo: builder.query({
      query: () => "teacher_info",
      providesTags: ["Teacher"], // cache tagging
    }),
    getTeacherInfoNotRegistered: builder.query({
      query: () => "teacher_info_not_registered",
      providesTags: ["Teacher"],
    }),
    postTeacherInfoRegistered: builder.mutation({
      query: (body) => ({
        url: "insert_teacher",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Teacher"], // invalidate cache
    }),
  }),
});

export const {
  useGetDesignationQuery,
  useGetTeacherInfoQuery,
  useGetTeacherInfoNotRegisteredQuery,
  usePostTeacherInfoRegisteredMutation,
} = teachersSlice;
