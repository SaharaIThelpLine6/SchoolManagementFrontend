import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const redirectSlice = createApi({
  reducerPath: 'redirect',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin/redirect`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Madrasah'], // userTypeSlice-এর সাথে সামঞ্জস্যপূর্ণ
  endpoints: (builder) => ({
    // Redirect status update (onTestStatus 1/0)
    updateRedirect: builder.mutation({
      query: ({ UserCode, Value }) => ({
        url: '/update',
        method: 'POST',
        body: { UserCode, Value },
      }),
      invalidatesTags: ['Madrasah'], // তালিকা রিফ্রেশ হবে
    }),

    // নির্দিষ্ট মাদ্রাসার বর্তমান redirect status
    getRedirectStatus: builder.query({
      query: (UserCode) => `/status/${UserCode}`,
      providesTags: ['Madrasah'],
    }),
  }),
});

export const {
  useUpdateRedirectMutation,
  useGetRedirectStatusQuery,
} = redirectSlice;
