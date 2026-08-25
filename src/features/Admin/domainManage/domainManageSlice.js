// src/features/Admin/redirectSlice
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const domainManageSlice = createApi({
  reducerPath: 'domainManage',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin/domain_manage`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Madrasah'],
  endpoints: (builder) => ({

    connectDomain: builder.mutation({
      query: (body) => ({
        url: '/connect_domain',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Madrasah'],
    }),
    checkUserDomain: builder.query({
      query: ({ UserCode }) => {
        const params = new URLSearchParams();
        if (UserCode) params.append("classId", UserCode);

        return {
          url: `/check_user_domain?UserCode=${UserCode}`,
          method: "GET",
        };
      },
      providesTags: ["UserDomain"],
    }),

  }),
});

export const {
  useConnectDomainMutation,
  useCheckUserDomainQuery,
} = domainManageSlice;
