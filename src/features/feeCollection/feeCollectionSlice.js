import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const feeCollectionSlice = createApi({
  reducerPath: "feeCollection",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/accounts`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "ExamNames",
    "FundNames",
    "GeneralLedgers",
    "StudentFeeGroups",
    "ResceiptNumber",
  ],
  endpoints: (builder) => ({
    getFees: builder.query({
      query: () => "view_userfee",
    }),
    getPaymentType: builder.query({
      query: () => "view_payment_type",
    }),
    getSubLedger: builder.query({
      query: (id) => `view_subledger/${id}`,
    }),
    getAllSubLedger: builder.query({
      query: () => `view_subledger`,
    }),
    getFee: builder.query({
      query: ({ sessionID, classID, SFGNID }) =>
        `view_student_fee/${sessionID}/${classID}/${SFGNID}`,
    }),
    getDueFee: builder.query({
      query: ({ sessionID, classID, SFGNID, AdmissionID, monthID }) =>
        `view_student_due_fee/${sessionID}/${classID}/${SFGNID}/${AdmissionID}/${
          monthID ? monthID : 0
        }`,
    }),
    getFeeById: builder.query({
      query: ({ studentCode, sessionID, SFGNID, monthID }) =>
        `view_student_fee_by_code/${studentCode}/${sessionID}/${SFGNID}/${monthID}`,
    }),
    addFee: builder.mutation({
      query: (newFee) => ({
        url: "fee_insert",
        method: "POST",
        body: newFee,
      }),
    }),
    updateFee: builder.mutation({
      query: ({ id, ...updatedFee }) => ({
        url: `fees/${id}`,
        method: "PUT",
        body: updatedFee,
      }),
    }),
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `fees/${id}`,
        method: "DELETE",
      }),
    }),
    getNameOFExamFee: builder.query({
      query: () => `name_of_exam_fee`,
      providesTags: ["NameOfExamFee"],
    }),
    getFundNames: builder.query({
      query: () => `fund_names`,
      providesTags: ["FundNames"],
    }),
    getGeneralLedgers: builder.query({
      query: (id) => `general_ledger/${id}`,
      providesTags: ["GeneralLedgers"],
    }),
    getGLedgers: builder.query({
      query: () => `general_ledger/`,
      providesTags: ["GeneralLedgers"],
    }),
    getFeeGroupNames: builder.query({
      query: () => `fee_group_name`,
      providesTags: ["FeeGroupNames"],
    }),
    getStudentFeeGroups: builder.query({
      query: () => `student_fee_groups`,
      providesTags: ["StudentFeeGroups"],
    }),
    getChartOFAccount: builder.query({
      query: () => `chart_of_account`,
      providesTags: ["ChartOFAccount"],
    }),
    getTransactionDetails: builder.query({
      query: () => `transaction_details`,
      providesTags: ["TransactionDetails"],
    }),
    getTransactionOrders: builder.query({
      query: ({ id }) => `transaction_orders/${id}`,
      providesTags: ["TransactionOrders"],
    }),
    getReceiptNumber: builder.query({
      query: ({ fundid, caid }) => `receipt_number/${fundid}/${caid}`,
      providesTags: ["ReceiptNumber"],
    }),

    postStudentFeeGroup: builder.mutation({
      query: (data) => ({
        url: "create_student_fee_group",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentFeeGroups"],
    }),
    postInComeExpense: builder.mutation({
      query: (data) => ({
        url: "income_expense",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TransactionOrders"],
    }),
    updateInComeExpense: builder.mutation({
      query: ({ id, data }) => ({
        url: `income_expense/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["TransactionOrders"],
    }),
    updateStudentFeeGroup: builder.mutation({
      query: (data) => ({
        url: `update_student_fee_group/${data.ID}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["StudentFeeGroups"],
    }),
    deleteStudentFeeGroup: builder.mutation({
      query: (id) => ({
        url: `delete_student_fee_group/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentFeeGroups"],
    }),
    deleteInComeExpense: builder.mutation({
      query: (id) => ({
        url: `income_expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TransactionOrders"],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetPaymentTypeQuery,
  useGetSubLedgerQuery,
  useGetAllSubLedgerQuery,
  useGetFeeQuery,
  useGetDueFeeQuery,
  useGetFeeByIdQuery,
  useAddFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  useGetNameOFExamFeeQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersQuery,
  useGetGLedgersQuery,
  useGetFeeGroupNamesQuery,
  usePostStudentFeeGroupMutation,
  useGetStudentFeeGroupsQuery,
  useUpdateStudentFeeGroupMutation,
  useDeleteStudentFeeGroupMutation,
  useGetChartOFAccountQuery,
  useGetTransactionDetailsQuery,
  useGetTransactionOrdersQuery,
  usePostInComeExpenseMutation,
  useGetReceiptNumberQuery,
  useUpdateInComeExpenseMutation,
  useDeleteInComeExpenseMutation,
} = feeCollectionSlice;
