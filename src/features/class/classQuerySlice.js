import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const classSlice = createApi({
  reducerPath: "classs",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/academic`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ClassList'], // Define your tag type
  endpoints: (builder) => ({
    getClassList: builder.query({
      query: () => "view_class",
      providesTags: ['ClassList'], // This query provides this tag
    }),
  }),
});

export const { useGetClassListQuery } = classSlice;