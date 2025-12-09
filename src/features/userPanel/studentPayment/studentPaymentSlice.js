import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const studentPaymentSlice = createApi({
  reducerPath: 'userpanelStudentPayment',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/userpanel/student-payment/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('user_panel_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getStudentPayments: builder.query({
      query: () => `history`,
    }),
    getStudentPaymentDetails: builder.query({
      query: (UFOID) => `history/details/${UFOID}`,
    }),
  }),
});

export const { useGetStudentPaymentsQuery, useGetStudentPaymentDetailsQuery } = studentPaymentSlice;
