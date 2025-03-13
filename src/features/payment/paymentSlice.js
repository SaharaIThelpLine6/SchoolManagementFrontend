import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL; 

export const paymentSlice = createApi({
  reducerPath: 'payment',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/payment`, // base URL for your API
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
      query: (insertdetails) => ({
        url: `/executeRequest/${insertdetails.schoolid}/${insertdetails.service}/${insertdetails.size}`,
        method: 'POST',
        body: { paymentID: insertdetails.paymentID, signature: insertdetails.signature },
      }),
    }),

    getUserInfo: builder.query({
      query: () => 'userinfo',
    }),


  }),
});

export const {
  useCreatePaymentRequestMutation,
  useExecutePaymentRequestMutation,
  useGetUserInfoQuery
} = paymentSlice;
