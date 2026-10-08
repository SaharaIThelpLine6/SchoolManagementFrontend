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
  tagTypes: ["Template", "smsBundles"],
  endpoints: (builder) => ({
    // ✅ SMS Send
    postSMSSend: builder.mutation({
      query: (data) => ({
        url: `send`,
        method: "POST",
        body: data,
      }),
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
  }),
});

export const {
  usePostSMSSendMutation,
  useGetSMSTemplatesQuery,
  useGetCheckBalanceQuery,
  useGetSMSBundleQuery,
  usePostSMSTemplateMutation,
  useUpdateSMSTemplateMutation,
  useDeleteSMSTemplateMutation,
} = smsSlice;