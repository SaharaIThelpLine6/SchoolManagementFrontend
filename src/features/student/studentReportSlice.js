// src/features/studentReports/studentReportSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const studentReportSlice = createApi({
  reducerPath: "studentReport",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/students`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["StudentReport"],
  endpoints: (builder) => ({
    // 🟢 Filter dropdown options
    getStudentReportFilters: builder.query({
      query: () => "/student_report_filters",
      providesTags: ["StudentReport"],
    }),

    // 🟢 Main report data
    getStudentReports: builder.query({
      query: (params) => {
        const q = new URLSearchParams();
        Object.entries(params || {}).forEach(([k, v]) => {
          if (v !== "" && v !== null && v !== undefined) q.append(k, v);
        });
        return `/student_report_data?${q.toString()}`;
      },
      providesTags: ["StudentReport"],
    }),
  }),
});

export const {
  useGetStudentReportFiltersQuery,
  useGetStudentReportsQuery,
} = studentReportSlice;

export default studentReportSlice.reducer;