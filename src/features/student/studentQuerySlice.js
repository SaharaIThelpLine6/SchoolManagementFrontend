import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userStudentSlice = createApi({
  reducerPath: "userStudent",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/students`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getStudentBySearch: builder.query({
      query: (data) => `search_student?search=${data}`,
    }),
    getStudent: builder.query({
      query: () => "view_students",
    }),
    getStudentReportCets: builder.query({
      query: () => `get_studentreport_cet`,
    }),
    getStudentReportType: builder.query({
      query: () => `get_studentreport_type`,
    }),
    getStudentReports: builder.mutation({
      query: (data) => `get_studentreports?StudentCode=${data}`,
    }),
    postStudentCharacterReport: builder.mutation({
      query: (data) => ({
        url: `student_character_report`,
        method: "POST",
        body: data,
      }),
    }),

    //  for update:
    // In your studentQuerySlice.js
    updateStudentReport: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/students/update_student_report/${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    deleteStudentReport: builder.mutation({
      query: (id) => ({
        url: `/students/delete_student_report/${id}`,
        method: "DELETE",
      }),
    }),

    getSingleStudentReport: builder.query({
      query: (id) => `/students/get_single_student_report/${id}`,
    }),
  }),
});

export const {
  useGetStudentBySearchQuery,
  useGetStudentQuery,
  useGetStudentReportCetsQuery,
  useGetStudentReportTypeQuery,
  useGetStudentReportsMutation,
  usePostStudentCharacterReportMutation,

//   for update
useUpdateStudentReportMutation,
useDeleteStudentReportMutation,
useGetSingleStudentReportQuery

} = userStudentSlice;
