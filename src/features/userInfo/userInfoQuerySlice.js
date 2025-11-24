import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userInfoSlice = createApi({
  reducerPath: 'userInfo',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSoftwareDetails: builder.query({
      query: () => `get_software_link`,
    }),
    getSingleUser: builder.query({
      query: (userId) => `get_single_user/${userId}`,
    }),
  }),
});

export const {
  useGetSoftwareDetailsQuery,
  useGetSingleUserQuery
} = userInfoSlice;
