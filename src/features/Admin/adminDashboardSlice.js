import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const adminDashboardSlice = createApi({
  reducerPath: 'adminDashboard',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin/dashboard`, // Admin ড্যাশবোর্ডের জন্য আলাদা base URL
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminMaddrasahPayments', 'LoginOverview', 'LoginDetails'],
  endpoints: (builder) => ({
    // Login History - Route 1: shob madrasa er overview
    // params: startDate, endDate, loginType, search, groupBy, order (asc|desc), page, limit
    getLoginOverview: builder.query({
      query: (params = {}) => ({
        url: '/user_login_overview',
        method: 'GET',
        params,
      }),
      providesTags: ['LoginOverview'],
    }),

    // Login History - Route 2: ekta madrasa er details (view icon click korle)
    // params: institutionCode (required), startDate, endDate, loginType, userId,
    //         groupBy, order (asc|desc), page, limit
    getLoginDetails: builder.query({
      query: ({ institutionCode, ...params }) => ({
        url: `/user_login_details/${institutionCode}`,
        method: 'GET',
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: 'LoginDetails', id: arg.institutionCode },
      ],
    }),

  }),
});

export const {
  useGetLoginOverviewQuery,
  useGetLoginDetailsQuery,
} = adminDashboardSlice;