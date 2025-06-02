import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userTypeSlice = createApi({
  reducerPath: "userType",
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
  tagTypes: ['UserType'], // Define your tag type
  endpoints: (builder) => ({
    getUserTypes: builder.query({
      query: () => "user_type",
      providesTags: ['UserType'], // This query provides this tag
    }),
  }),
});

export const {  useGetUserTypesQuery} = userTypeSlice;