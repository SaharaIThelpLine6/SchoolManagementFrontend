import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;
import Cookies from "js-cookie";
export const paymentSlice = createApi({
  reducerPath: "payment",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/payment`, // base URL for your API
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createPaymentRequest: builder.mutation({
      query: (paymentRequest) => {
        const { method } = paymentRequest;

        let url = "/createRequest";
        if (method === "cellfin") {
          url = "/create_cellfin_request";
        }

        return {
          url,
          method: "POST",
          body: paymentRequest,
        };
      },
    }),

    // Execute payment request
    executePaymentRequest: builder.mutation({
      query: (insertdetails) => {
        const { method, schoolid, service, size, paymentID, signature } = insertdetails;

        // Conditional URL selection
        let CELLFIN_TOKEN = '' ;
        let url = `/executeRequest/${schoolid}/${service}/${size}`;
        if (method === "cellfin") {
          CELLFIN_TOKEN = Cookies.get("CELLFIN_TOKEN");
          url = `/execute_cellfin_request/${schoolid}/${service}/${size}`;
        }

        return {
          url,
          method: "POST",
          body: {
            paymentID,
            token: CELLFIN_TOKEN
          },
        };
      },
    }),


    getUserInfo: builder.query({
      query: () => "userinfo",
    }),
    getPaymentHistory: builder.query({
      query: () => "paymenthistory",
    }),
  }),
});

export const {
  useCreatePaymentRequestMutation,
  useExecutePaymentRequestMutation,
  useGetUserInfoQuery,
  useGetPaymentHistoryQuery
} = paymentSlice;
