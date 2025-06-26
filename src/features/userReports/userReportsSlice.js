// src/features/userReports/userReportsSlice.js
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userReportsSlice = createApi({
  reducerPath: "userReports",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/reports`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [],
  endpoints: (builder) => ({
    getUserReport: builder.query({
      query: ({
        report_id,
        user_type,
        gender,
        is_active,
        start_id,
        end_id,
      }) => {
        const params = new URLSearchParams({ report_id });

        if (user_type !== undefined) params.append("user_type", user_type);
        if (gender !== undefined) params.append("gender", gender);
        if (is_active !== undefined) params.append("is_active", is_active);
        if (start_id !== undefined) params.append("start_id", start_id);
        if (end_id !== undefined) params.append("end_id", end_id);

        return `user_report?${params.toString()}`;
      },
    }),
    getStudentReport: builder.query({
      query: ({
        report_id,
        user_type,
        gender,
        is_active,
        start_id,
        SessionID,
        SubClassID,
        ResidentialStatusId,
        NewOldId,
      }) => {
        const params = new URLSearchParams({ report_id });

        if (user_type !== undefined) params.append("user_type", user_type);
        if (gender !== undefined) params.append("gender", gender);
        if (is_active !== undefined) params.append("is_active", is_active);
        if (start_id !== undefined) params.append("start_id", start_id);
        if (SessionID !== undefined) params.append("SessionID", SessionID);
        if (SubClassID !== undefined) params.append("SubClassID", SubClassID);
        if (ResidentialStatusId !== undefined)
          params.append("ResidentialStatusId", ResidentialStatusId);
        if (NewOldId !== undefined) params.append("NewOldId", NewOldId);

        return `student_report?${params.toString()}`;
      },
    }),
  }),
});

export const { useGetUserReportQuery, useGetStudentReportQuery } = userReportsSlice;
