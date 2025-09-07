import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const monthListSlice = createApi({
  reducerPath: "months",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Month"],
  endpoints: (builder) => ({
    // GET month list
    getMonthList: builder.query({
      query: () => `academic/month_list`,
      providesTags: ["Month"],
    }),
    getMonthListBySessionAndClass: builder.query({
      query: ({ sessionId, classId }) =>
        `academic/month_list/${sessionId}/${classId}`,
      providesTags: ["Month"],
    }),
    // POST new month
    insertMonth: builder.mutation({
      query: (body) => ({
        url: "academic/insert_month",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Month"],
    }),

    // PUT update existing month
    editMonth: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `academic/update_month/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Month"],
    }),
  }),
});

export const {
  useGetMonthListQuery,
  useInsertMonthMutation,
  useEditMonthMutation,
  useGetMonthListBySessionAndClassQuery,
} = monthListSlice;
