import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL; // Add your server URL here

export const paymentSlice = createApi({
  reducerPath: 'payment',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}`, // base URL for your API
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createPaymentRequest: builder.mutation({
      query: (paymentRequest) => ({
        url: '/createRequest',
        method: 'POST',
        body: paymentRequest,
      }),
    }),

    // Execute payment request
    executePaymentRequest: builder.mutation({
      query: ({ paymentID, signature }) => ({
        url: '/executeRequest',
        method: 'POST',
        body: { paymentID, signature },
      }),
    }),
  }),
});

export const {
  useCreatePaymentRequestMutation,
  useExecutePaymentRequestMutation,
} = paymentSlice;
