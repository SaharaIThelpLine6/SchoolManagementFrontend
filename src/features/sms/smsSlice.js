import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const smsSlice = createApi({
  reducerPath: "sms",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/sms`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Template"],
  endpoints: (builder) => ({
    postSMSSend: builder.mutation({
      query: (data) => ({
        url: `send`,
        method: "POST",
        body: data,
      }),
    }),
    getSMSTemplates: builder.query({
      query: () => "templates",
      providesTags: ["Template"],
    }),
    getCheckBalance: builder.query({
      query: () => "check_balance",
      providesTags: ["Template"],
    }),
  }),
});

export const { usePostSMSSendMutation, useGetSMSTemplatesQuery, useGetCheckBalanceQuery } = smsSlice;
