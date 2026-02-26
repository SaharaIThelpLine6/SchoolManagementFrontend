import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const teachersSlice = createApi({
  reducerPath: 'teachers',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/teachers`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Teacher'], // define tag type
  endpoints: (builder) => ({
    getDesignation: builder.query({
      query: () => 'designation',
      providesTags: ['Designation'], // cache tagging
    }),
    getTeacherInfo: builder.query({
      query: () => 'teacher_info',
      providesTags: ['Teacher'], // cache tagging
    }),
    getTeacherInfoWhitUser: builder.query({
      query: () => 'teacher_info_with_user',
      providesTags: ['Teacher'], // cache tagging
    }),
    getTeachersInfo: builder.query({
      query: () => 'teachers_info',
      providesTags: ['Teacher'], // cache tagging
    }),
    getLoginTeacherInfo: builder.query({
      query: () => 'login_teacher_info',
      providesTags: ['Teacher'], // cache tagging
    }),
    getTeacherInfoNotRegistered: builder.query({
      query: () => 'teacher_info_not_registered',
      providesTags: ['Teacher'],
    }),
    postTeacherInfoRegistered: builder.mutation({
      query: (body) => ({
        url: 'insert_teacher',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Teacher'],
    }),
    createDesignation: builder.mutation({
      query: (body) => ({
        url: 'designation',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Designation'],
    }),
    updateDesignation: builder.mutation({
      query: (data) => ({
        url: `/designation/${data.DNID}`,
        method: 'PUT',
        body: { Designation: data.Designation },
      }),
      invalidatesTags: ['Designation'],
    }),
    deleteDesignation: builder.mutation({
      query: (DNID) => ({
        url: `/designation/${DNID}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Designation'],
    }),
    updateTeacherInfo: builder.mutation({
      query: (body) => ({
        url: 'update_teacher',
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['Teacher'],
    }),
  }),
});

export const {
  useGetDesignationQuery,
  useGetTeacherInfoQuery,
  useGetTeacherInfoNotRegisteredQuery,
  usePostTeacherInfoRegisteredMutation,
  useUpdateTeacherInfoMutation,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetLoginTeacherInfoQuery,
  useGetTeachersInfoQuery,
  useGetTeacherInfoWhitUserQuery
} = teachersSlice;
