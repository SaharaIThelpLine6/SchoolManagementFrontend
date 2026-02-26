import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const feeCollectionSlice = createApi({
  reducerPath: 'feeCollection',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/accounts`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'ExamNames',
    'FundNames',
    'GeneralLedgers',
    'StudentFeeGroups',
    'ResceiptNumber',
    'StudentFeeSettings',
    'SelectedStudentPerFee',
    'GeneralLedgersByFundAndCaids',
    'FeeLand',
    'SubGeneralLedger',
    'StudentFee',
  ],
  endpoints: (builder) => ({
    getFees: builder.query({
      query: () => 'view_userfee',
    }),
    getPaymentType: builder.query({
      query: () => 'view_payment_type',
    }),
    getSubLedger: builder.query({
      query: (id) => `view_subledger/${id}`,
      providesTags: ['GetSubLedgers'],
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
        url: 'fee_insert',
        method: 'POST',
        body: newFee,
      }),
    }),
    updateFee: builder.mutation({
      query: ({ id, ...updatedFee }) => ({
        url: `fees/${id}`,
        method: 'PUT',
        body: updatedFee,
      }),
    }),
    deleteFee: builder.mutation({
      query: (id) => ({
        url: `fees/${id}`,
        method: 'DELETE',
      }),
    }),
    getNameOFExamFee: builder.query({
      query: () => `name_of_exam_fee`,
      providesTags: ['NameOfExamFee'],
    }),
    getFundNames: builder.query({
      query: () => `fund_names`,
      providesTags: ['FundNames'],
    }),
    postFund: builder.mutation({
      query: (data) => ({
        url: 'insert_fund',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FundNames'],
    }),
    deleteFund: builder.mutation({
      query: (id) => ({
        url: `delete_fund/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FundNames'],
    }),
    updateFund: builder.mutation({
      query: ({ id, data }) => ({
        url: `insert_fund/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['FundNames'],
    }),
    updateFundStatus: builder.mutation({
      query: ({ id, Action }) => ({
        url: `/update_fund_status/${id}`,
        method: 'PATCH',
        body: { Action },
      }),
      invalidatesTags: ['FundNames'],
    }),
    getGeneralLedgers: builder.query({
      query: (id) => `general_ledger/${id}`,
      providesTags: ['GeneralLedgers'],
    }),
    getGeneralLedgersByFundAndCaids: builder.query({
      query: ({ fundId, caId }) => `general_ledger_by_caid/${fundId}/${caId}`,
      providesTags: ['GeneralLedgersByFundAndCaids'],
    }),

    getGLedgers: builder.query({
      query: () => `general_ledger/`,
      providesTags: ['GeneralLedgers'],
    }),
    getFeeGroupNames: builder.query({
      query: () => `fee_group_name`,
      providesTags: ['FeeGroupNames'],
    }),
    getStudentFeeSettings: builder.query({
      query: ({ sessionId, classId } = {}) => {
        if (sessionId && classId) {
          return `view_student_fee/${sessionId}/${classId}`;
        } else if (!sessionId && !classId) {
          return `view_student_fee_settings`;
        }
        return { url: '', skip: true };
      },
      providesTags: ['StudentFeeSettings'],
    }),

    postStudentFeeSettings: builder.mutation({
      query: (data) => ({
        url: 'insert_student_fee_settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentFeeSettings'],
    }),
    postFeeLand: builder.mutation({
      query: (data) => ({
        url: 'insert_fee_land',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FeeLand'],
    }),
    postGeneralLedgersByFundAndCaids: builder.mutation({
      query: (data) => ({
        url: 'insert_general_ledger',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GeneralLedgersByFundAndCaids'],
    }),
    updateGeneralLedgersByFundAndCaids: builder.mutation({
      query: ({ FundID, CAID, GLID, data }) => ({
        url: `/update_general_ledger/${FundID}/${CAID}/${GLID}`,
        method: 'PUT',
        body: data, // body সরাসরি পাঠানো, { data } না
      }),
      invalidatesTags: ['GeneralLedgersByFundAndCaids'],
    }),

    deleteGeneralLedgersByFundAndCaids: builder.mutation({
      query: ({ FundID, CAID, GLID }) => ({
        url: `/delete_general_ledger/${FundID}/${CAID}/${GLID}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GeneralLedgersByFundAndCaids'],
    }),
    getChartOFAccount: builder.query({
      query: () => `chart_of_account`,
      providesTags: ['ChartOFAccount'],
    }),
    getTransactionDetails: builder.query({
      query: () => `transaction_details`,
      providesTags: ['TransactionDetails'],
    }),
    getTransactionOrders: builder.query({
      query: ({ id }) => `transaction_orders/${id}`,
      providesTags: ['TransactionOrders'],
    }),
    getFeeLandByAdmission: builder.query({
      query: ({ id }) => `fee_land_by_admission_id/${id}`,
      providesTags: ['FeeLand'],
    }),
    getReceiptNumber: builder.query({
      query: ({ fundid, caid }) => `receipt_number/${fundid}/${caid}`,
      providesTags: ['ReceiptNumber'],
    }),

    postInComeExpense: builder.mutation({
      query: (data) => ({
        url: 'income_expense',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TransactionOrders'],
    }),
    updateInComeExpense: builder.mutation({
      query: ({ id, data }) => ({
        url: `income_expense/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TransactionOrders'],
    }),
    deleteInComeExpense: builder.mutation({
      query: (id) => ({
        url: `income_expense/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransactionOrders'],
    }),
    deleteStudentFeeSettings: builder.mutation({
      query: (body) => ({
        url: 'delete_student_fee_settings',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['StudentFeeSettings'],
    }),
    getSearchStudents: builder.query({
      query: ({ search, ClassID, SessionID }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (ClassID) params.append('ClassID', ClassID);
        if (SessionID) params.append('SessionID', SessionID);
        return `/search_students?${params.toString()}`;
      },
      providesTags: ['SelectedStudentPerFee', 'FeeLand'],
    }),
    getSearchStudentWithUser: builder.query({
      query: ({ search, ClassID }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (ClassID) params.append('ClassID', ClassID);
        // if (SessionID) params.append('SessionID', SessionID);
        return `/search_student_with_user?${params.toString()}`;
      },
      providesTags: [],
    }),
    postSelectedPerStudentFee: builder.mutation({
      query: (data) => ({
        url: 'selected_per_student_fee',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SelectedStudentPerFee', 'FeeLand'],
    }),
    deleteSelectedPerStudentFee: builder.mutation({
      query: (body) => ({
        url: '/selected_per_student_fee',
        method: 'DELETE',
        body, // backend expects JSON body
      }),
      invalidatesTags: ['SelectedStudentPerFee'],
    }),

    // Sub General Ledger
    getSubGeneralLedgers: builder.query({
      query: ({ fundId, caId, glid }) =>
        `subledger_by_glid/${fundId}/${caId}/${glid}`,
      providesTags: ['SubGeneralLedger'],
    }),
    postSubGeneralLedger: builder.mutation({
      query: (data) => ({
        url: 'insert_subsidiary_ledger',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SubGeneralLedger'],
    }),
    updateSubGeneralLedger: builder.mutation({
      query: ({ SlName, slId }) => ({
        url: `update_subsidiary_ledger/${slId}`,
        method: 'PUT',
        body: { SlName },
      }),
      invalidatesTags: ['SubGeneralLedger'],
    }),
    deleteSubGeneralLedger: builder.mutation({
      query: (slId) => ({
        url: `/delete_subsidiary_ledger/${slId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubGeneralLedger'],
    }),

    // Get Sub General by FundId and GLID
    getSubGeneralLedgersByFundIdAndGlId: builder.query({
      query: ({ fundId, caId, glid }) => `subledger_by_glid/${fundId}/${glid}`,
      providesTags: ['SubGeneralLedger'],
    }),

    // Student Fee Group
    getStudentFeeGroups: builder.query({
      query: () => `student_fee_groups`,
      providesTags: ['StudentFeeGroups'],
    }),
    postStudentFeeGroup: builder.mutation({
      query: (data) => ({
        url: 'create_student_fee_group',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentFeeGroups'],
    }),

    updateStudentFeeGroup: builder.mutation({
      query: (data) => ({
        url: `update_student_fee_group/${data.ID}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentFeeGroups'],
    }),
    deleteStudentFeeGroup: builder.mutation({
      query: (id) => ({
        url: `delete_student_fee_group/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentFeeGroups'],
    }),
    getStudentFeeAdmissions: builder.query({
      query: ({ admissionId, sfgnid }) =>
        `view_student_fees_by_admissionId_and_sfgnid/${admissionId}/${sfgnid}`,
      providesTags: ['StudentFeeAdmissions', 'StudentFeeSettings'],
    }),
    getStudentOthersMonthFees: builder.query({
      query: (admissionId) => `others_month_fees/${admissionId}`,
      providesTags: ['StudentFeeAdmissions', 'StudentFeeSettings'],
    }),
    getMonthDuePerStudentFee: builder.query({
      query: ({ admissionId, monthId }) =>
        `month_due_per_student_fee/${admissionId}/${monthId}`,
      providesTags: ['StudentFeeAdmissions', 'StudentFeeSettings'],
    }),
    getOthersDueStudentFee: builder.query({
      query: (admissionId) => `others_due_student_fee/${admissionId}`,
      providesTags: [
        'StudentFeeAdmissions',
        'StudentFeeSettings',
        'StudentFeeCollection',
        'StudentFee',
      ],
    }),

    getGeneralLedgersByCAID: builder.query({
      query: (id) => `general_ledgers_by_caid`,
      providesTags: ['GeneralLedgers'],
    }),
    getSubLedgersByGLID: builder.query({
      query: (id) => `subledgers_by_glid/${id}`,
      providesTags: ['SubGeneralLedger'],
    }),
    postStudentFeeCollection: builder.mutation({
      query: (data) => ({
        url: 'create_student_fee',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        'StudentFee',
        'StudentFeeCollection',
        'StudentFeeAdmissions',
      ],
    }),
    getMonthlyFeeAccept: builder.query({
      query: (id) => `monthly_fee_accept`,
      providesTags: ['StudentFeeGroups'],
    }),
    getStudentFeeIncreaseDecrease: builder.query({
      query: ({ AdmissionID, UserID, search, ClassID, SessionID }) => ({
        url: `search__selected_per_student_fee`,
        params: {
          AdmissionID,
          UserID,
          search,
          ClassID,
          SessionID,
        },
      }),
      providesTags: [
        'StudentFee',
        'SelectedStudentPerFee',
        'StudentFeeSettings',
      ],
    }),
    getStudentCompleteFeeFilter: builder.query({
      query: ({ DateFrom, DateTo, UserCode, UFOID }) => ({
        url: 'student_complete_fee_filter_get_data',
        method: 'GET',
        params: { DateFrom, DateTo, UserCode, UFOID },
      }),
      providesTags: ['StudentFee'],
    }),
    getExamSeparateFeeFilter: builder.query({
      query: ({
        DateFrom,
        DateTo,
        UserCode,
        SessionID,
        ExamID,
        SubClassID,
        type,
      }) => ({
        url: 'exam_separate_fee_filter_get_data',
        method: 'GET',
        params: {
          DateFrom,
          DateTo,
          UserCode,
          SessionID,
          ExamID,
          SubClassID,
          type,
        },
      }),
      providesTags: ['ExamSeparateFee'],
    }),

    getMonthPerStudentsFee: builder.query({
      query: (admissionId) => `month_per_student_fee/${admissionId}`,
      providesTags: ['StudentFee', 'SelectedStudentPerFee'],
    }),

    postBankInfoLedger: builder.mutation({
      query: (data) => ({
        url: 'insert_subledger',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GetSubLedgers'],
    }),
    putBankInfoLedger: builder.mutation({
      query: (data) => ({
        url: `edit_subledger/${data.GLID}/${data.SLID}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['GetSubLedgers'],
    }),

    deleteBankInfoLedger: builder.mutation({
      query: (id) => ({
        url: `/delete_subledger/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['GetSubLedgers'],
    }),

    getIncomeExpenseReportByOrderId: builder.query({
      query: ({ orderid }) => `income_expense_by_orderid/${orderid}`,
    }),

    getIncomeExpenseTodaysBalance: builder.query({
      query: () => `get_todays_balance_of_caid`,
      providesTags: ['IncomeExpenseTodaysBalance'],
    }),
    getIncomeExpenseTodaysBalanceByCaid: builder.query({
      query: ({ caid }) => `get_todays_balance/${caid}`,
      providesTags: ['IncomeExpenseTodaysBalanceByCaid'],
    }),
    getStudentFeeUpdateGetDataByUFOID: builder.query({
      query: (ufoid) => `student_fee_update_get_data/${ufoid}`,
      providesTags: ['StudentFee'],
    }),
    putUpdateStudentFee: builder.mutation({
      query: (data) => ({
        url: `update_student_fee/${data.UFOID}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentFee'],
    }),

    getStudentFeeDue: builder.query({
      query: ({ AdmissionID }) => `student_fee_due/${AdmissionID}`,
      providesTags: [
        'StudentFee',
        'StudentFeeCollection',
        'StudentFeeAdmissions',
      ],
    }),
    getUserTransactionFilter: builder.query({
      query: ({ page = 1, limit = 10, DateFrom, DateTo, userId }) => {
        let params = `page=${page}&limit=${limit}`;

        if (DateFrom && DateTo) {
          params += `&DateFrom=${DateFrom}&DateTo=${DateTo}`;
        }

        if (userId) {
          params += `&userId=${userId}`;
        }

        return `user_transaction_filter?${params}`;
      },
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetPaymentTypeQuery,
  useGetSubLedgerQuery,
  useGetSearchStudentWithUserQuery,
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
  useGetStudentFeeSettingsQuery,
  usePostStudentFeeSettingsMutation,
  useDeleteStudentFeeSettingsMutation,
  useGetSearchStudentsQuery,
  usePostSelectedPerStudentFeeMutation,
  useDeleteSelectedPerStudentFeeMutation,
  usePostFundMutation,
  useUpdateFundMutation,
  useDeleteFundMutation,
  useUpdateFundStatusMutation,
  useGetGeneralLedgersByFundAndCaidsQuery,
  usePostGeneralLedgersByFundAndCaidsMutation,
  useUpdateGeneralLedgersByFundAndCaidsMutation,
  useDeleteGeneralLedgersByFundAndCaidsMutation,
  usePostFeeLandMutation,
  useGetFeeLandByAdmissionQuery,

  // Sub general ledger
  useGetSubGeneralLedgersQuery,
  usePostSubGeneralLedgerMutation,
  useUpdateSubGeneralLedgerMutation,
  useDeleteSubGeneralLedgerMutation,

  useGetSubGeneralLedgersByFundIdAndGlIdQuery,
  useGetStudentFeeAdmissionsQuery,
  useGetGeneralLedgersByCAIDQuery,
  useGetSubLedgersByGLIDQuery,
  useGetMonthlyFeeAcceptQuery,

  usePostStudentFeeCollectionMutation,
  useGetStudentFeeIncreaseDecreaseQuery,
  useGetMonthPerStudentsFeeQuery,
  useGetMonthDuePerStudentFeeQuery,
  useGetStudentOthersMonthFeesQuery,
  useGetOthersDueStudentFeeQuery,
  useGetStudentCompleteFeeFilterQuery,
  useGetExamSeparateFeeFilterQuery,
  useGetStudentFeeUpdateGetDataByUFOIDQuery,
  usePutUpdateStudentFeeMutation,

  usePostBankInfoLedgerMutation,
  usePutBankInfoLedgerMutation,
  useDeleteBankInfoLedgerMutation,
  useGetIncomeExpenseReportByOrderIdQuery,
  useGetIncomeExpenseTodaysBalanceQuery,
  useGetIncomeExpenseTodaysBalanceByCaidQuery,
  useGetStudentFeeDueQuery,

  useGetUserTransactionFilterQuery,
} = feeCollectionSlice;
