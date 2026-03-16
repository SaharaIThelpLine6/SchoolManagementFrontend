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
    getInvoiceByTran: builder.query({
      query: (tran_id) => `get_invoice_by_tran/${tran_id}`,
    }),
    // In your RTK Query API slice
    getAllPaymentInvoices: builder.query({
      query: ({ startDate, endDate } = {}) => ({
        url: 'get_userpanel_payment_invoice',
        params: {
          ...(startDate && { startDate }), // only include if defined
          ...(endDate && { endDate }),
        },
      }),
    }),

    initPayment: builder.mutation({
      query: (payload) => ({
        url: '/init',
        method: 'POST',
        body: payload,
      }),
    }),
    admissionCheck: builder.query({
      query: ({ AdmissionID, ClassID, SessionID, UserID }) => ({
        url: `/admission_check_user_panel`,
        method: 'GET',
        params: {
          AdmissionID,
          ClassID,
          SessionID,
          UserID
        },
      }),
    }),
  }),
});

export const {
  useGetStudentPaymentsQuery,
  useGetStudentPaymentDetailsQuery,
  useInitPaymentMutation,
  useGetInvoiceByTranQuery,
  useGetAllPaymentInvoicesQuery,
  useAdmissionCheckQuery,
  useLazyAdmissionCheckQuery
} = studentPaymentSlice;
