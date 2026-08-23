import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const adminPaymentSlice = createApi({
  reducerPath: 'adminPayment',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin/payments`, // Admin পেমেন্টের জন্য আলাদা base URL
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminMaddrasahPayments'],
  endpoints: (builder) => ({
    
    // Get All Maddrasah Payments History with filters and pagination
    getAllMaddrasahPayments: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 20,
          search = '',
          status = '',
          intentId = ''
        } = params;

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) queryParams.append('search', search);
        if (status) queryParams.append('status', status);
        if (intentId) queryParams.append('intentId', intentId);

        return {
          url: `/maddrasah-payment-history?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['AdminMaddrasahPayments'],
    }),

  }),
});

export const {
  useGetAllMaddrasahPaymentsQuery,
} = adminPaymentSlice;
