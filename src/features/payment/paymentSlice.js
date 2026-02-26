import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

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
  tagTypes: ['AllSchoolsSSL', 'OnlinePaymentInvoice'],
  endpoints: (builder) => ({
    createPaymentRequest: builder.mutation({
      query: (paymentRequest) => {
        const { method } = paymentRequest;

        let url = '/createRequest';
        if (method === 'cellfin') {
          url = '/create_cellfin_request';
        }

        return {
          url,
          method: 'POST',
          body: paymentRequest,
        };
      },
    }),

    // Execute payment request
    executePaymentRequest: builder.mutation({
      query: (insertdetails) => {
        const { method, schoolid, service, size, paymentID, signature } =
          insertdetails;

        // Conditional URL selection
        let CELLFIN_TOKEN = '';
        let url = `/executeRequest/${schoolid}/${service}/${size}`;
        if (method === 'cellfin') {
          CELLFIN_TOKEN = Cookies.get('CELLFIN_TOKEN');
          url = `/execute_cellfin_request/${schoolid}/${service}/${size}`;
        }

        return {
          url,
          method: 'POST',
          body: {
            paymentID,
            token: CELLFIN_TOKEN,
          },
        };
      },
    }),

    getUserInfo: builder.query({
      query: () => 'userinfo',
    }),
    getPaymentHistory: builder.query({
      query: () => 'paymenthistory',
    }),
    getAllMaddrasahSSLInfo: builder.query({
      query: () => 'get_all_maddrasah_ssl',
      providesTags: ['AllSchoolsSSL'],
    }),
    postMaddrasahSSL: builder.mutation({
      query: (data) => ({
        url: 'create_ssl',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AllSchoolsSSL'], // ✅ Invalidate list after add
    }),
    updateMaddrasahSSL: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_ssl/${id}`,
        method: 'PUT',
        body: data, // send updated fields directly
      }),
      invalidatesTags: ['AllSchoolsSSL'],
    }),
    deleteMaddrasahSSL: builder.mutation({
      query: (id) => ({
        url: `delete_maddrasah_ssl/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AllSchoolsSSL'], // ✅ Invalidate list after delete
    }),
    getMaddrasahSSL: builder.query({
      query: (id) => ({
        url: `get_ssl/${id}`,
      }),
      invalidatesTags: ['AllSchoolsSSL'], // ✅ Invalidate list after delete
    }),
    getMaddrasahDatabases: builder.query({
      query: (params = {}) => {
        const {
          page = 1,
          limit = 50,
          search,
          instituteName,
          userCode,
          databaseName,
          loginStatus,
          qmmStatus,
          sortBy = 'ID',
          sortOrder = 'ASC',
        } = params;

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });

        if (search) queryParams.append('search', search);
        if (instituteName) queryParams.append('instituteName', instituteName);
        if (userCode) queryParams.append('userCode', userCode);
        if (databaseName) queryParams.append('databaseName', databaseName);
        if (loginStatus) queryParams.append('loginStatus', loginStatus);
        if (qmmStatus) queryParams.append('qmmStatus', qmmStatus);

        return {
          url: `/get_databases?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['AllSchoolsSSL'],
    }),
    getOnlinePaymentInvoice: builder.query({
      query: ({ page = 1, limit = 10, search = '' }) => ({
        url: '/get_online_payment_invoice',
        params: { page, limit, search }, // 🔥 UserCode search
      }),
      providesTags: ['OnlinePaymentInvoice'],
    }),
  }),
});

export const {
  useCreatePaymentRequestMutation,
  useExecutePaymentRequestMutation,
  useGetUserInfoQuery,
  useGetPaymentHistoryQuery,
  useGetAllMaddrasahSSLInfoQuery,
  useUpdateMaddrasahSSLMutation,
  usePostMaddrasahSSLMutation,
  useDeleteMaddrasahSSLMutation,
  useGetMaddrasahSSLQuery,
  useGetMaddrasahDatabasesQuery,
  useGetOnlinePaymentInvoiceQuery
} = paymentSlice;
