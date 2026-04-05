import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const onlineDonationSlice = createApi({
  reducerPath: 'onlineDonationPayment',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/userpanel/madrasha-donation/`,
  }),
  endpoints: (builder) => ({
    donationInitPayment: builder.mutation({
      query: (payload) => ({
        url: '/init',
        method: 'POST',
        body: payload,
      }),
    }),

    getpaymentdetails: builder.query({
    query: ({ tran_id, schoolid }) => {
      const params = new URLSearchParams();
      params.append('tran_id', tran_id);
      params.append('schoolid', schoolid);
      return {
        url: `/payment-details?${params.toString()}`,
        method: 'GET'
      };
    }
  })
 
  }),
});

export const {
  useDonationInitPaymentMutation,
  useGetpaymentdetailsQuery,
} = onlineDonationSlice;
// 