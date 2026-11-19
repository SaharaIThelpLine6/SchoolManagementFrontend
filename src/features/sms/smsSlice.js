import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const smsSlice = createApi({
  reducerPath: "sms",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/sms`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Template", "smsBundles", "VoiceAccount", "VoicePayments"],
  endpoints: (builder) => ({
    // ✅ SMS Send
    postSMSSend: builder.mutation({
      query: (data) => ({
        url: `send`,
        method: "POST",
        body: data,
      }),
    }),

    uploadVoiceRecording: builder.mutation({
      query: (audio) => {
        const body = new FormData();
        body.append("audio", audio);
        return { url: "voice/upload", method: "POST", body };
      },
    }),

    // ======================================================
    // ✅ Voice SMS API (backend: routes/voiceSms.js)
    // ======================================================
    getVoiceAccount: builder.query({
      query: () => "voice/account",
      providesTags: ["VoiceAccount"],
    }),
    // Admin প্যানেল: যেকোনো প্রতিষ্ঠানের Voice SMS অ্যাকাউন্ট (backend: routes/Admin/voiceSms.js)
    getAdminVoiceAccount: builder.query({
      query: (databaseName) => `${API_URL}/api/admin/voice-sms/account/${encodeURIComponent(databaseName)}`,
      providesTags: (_result, _error, databaseName) => [{ type: "VoiceAccount", id: databaseName }],
    }),
    getAdminVoiceAccounts: builder.query({
      query: () => `${API_URL}/api/admin/voice-sms/accounts`,
      providesTags: [{ type: "VoiceAccount", id: "ADMIN_LIST" }],
    }),
    createAdminVoiceAccount: builder.mutation({
      query: ({ databaseName, ...data }) => ({
        url: `${API_URL}/api/admin/voice-sms/account/${encodeURIComponent(databaseName)}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { databaseName }) => [
        { type: "VoiceAccount", id: databaseName },
        { type: "VoiceAccount", id: "ADMIN_LIST" },
      ],
    }),
    getVoicePackages: builder.query({
      query: () => "voice/packages",
    }),
    startVoiceDeposit: builder.mutation({
      query: (data) => ({ url: "voice/deposit", method: "POST", body: data }),
      invalidatesTags: ["VoicePayments"],
    }),
    getVoicePayments: builder.query({
      query: () => "voice/payments",
      providesTags: ["VoicePayments"],
    }),
    checkVoicePayment: builder.mutation({
      query: (transactionId) => ({ url: `voice/payment/${encodeURIComponent(transactionId)}` }),
      invalidatesTags: ["VoicePayments", "VoiceAccount"],
    }),
    sendVoiceSMS: builder.mutation({
      query: (data) => ({ url: "voice/send", method: "POST", body: data }),
      invalidatesTags: ["VoiceAccount"],
    }),

    // ✅ Update Template (id আলাদা করে নিন, body তে বাকি ডাটা)
    updateSMSTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `templates/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Template"],
    }),

    // ✅ Delete Template (body লাগে না, শুধু id)
    deleteSMSTemplate: builder.mutation({
      query: (TempID) => ({
        url: `templates/${TempID}`,
        method: "DELETE",
        // ❌ body: data সরিয়ে দেওয়া হয়েছে
      }),
      invalidatesTags: ["Template"],
    }),

    // ✅ Post Template
    postSMSTemplate: builder.mutation({
      query: (data) => ({
        url: `templates`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Template"],
    }),

    // ✅ Get Templates
    getSMSTemplates: builder.query({
      query: () => "templates",
      providesTags: ["Template"],
    }),

    // ✅ Check Balance
    getCheckBalance: builder.query({
      query: () => "check_balance",
      providesTags: ["Template"],
    }),

    // ✅ SMS Bundles
    getSMSBundle: builder.query({
      query: () => "bundles",
      providesTags: ["smsBundles"],
    }),

    // ======================================================
    // smsSlice.js — sendPublishedResult mutation যোগ করুন
    // ======================================================
    sendPublishedResult: builder.mutation({
      query: ({ students, examName }) => ({
        url: "/send-published-result",
        method: "POST",
        body: { students, examName },
      }),
      invalidatesTags: ["SmsBalance"],
    }),
  }),
});

export const {
  usePostSMSSendMutation,
  useUploadVoiceRecordingMutation,
  useGetSMSTemplatesQuery,
  useGetCheckBalanceQuery,
  useGetSMSBundleQuery,
  usePostSMSTemplateMutation,
  useUpdateSMSTemplateMutation,
  useDeleteSMSTemplateMutation,
  useSendPublishedResultMutation,
  useGetVoiceAccountQuery,
  useGetAdminVoiceAccountQuery,
  useGetAdminVoiceAccountsQuery,
  useCreateAdminVoiceAccountMutation,
  useGetVoicePackagesQuery,
  useStartVoiceDepositMutation,
  useGetVoicePaymentsQuery,
  useCheckVoicePaymentMutation,
  useSendVoiceSMSMutation,
} = smsSlice;
