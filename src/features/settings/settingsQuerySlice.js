import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

/**
 * ⚠️ সিট কার্ড সেটিংসের রাউটটা exam_report এর রাউটার ফাইলে বসানো, তাই
 * এই slice এর নিজের base (/api/settings) দিয়ে ওটায় পৌঁছানো যায় না।
 *
 * আপনার server এ exam_report যে পথে ডাকা হয় — যেমন
 * `/api/exam/exam_report` হলে এখানে `/api/exam` — ঠিক সেই prefix টাই
 * নিচে বসান। শুধু এই একটা লাইনই বদলাতে হবে, এন্ডপয়েন্ট দুইটা এখান
 * থেকেই পথ নেয়।
 */
const EXAM_API = `${API_URL}/api/exam`;

export const settingsSlice = createApi({
  reducerPath: 'siteSettings',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/settings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'InstitutionInfo',
    'Residential',
    'Settings',
    'Acc_Report_Settings',
    'CodeSettings',
    'Genders',
    'WebSettings',
    'DocumentSettings',
    'StudentDataExportTemplate',
    'SeatCardSettings',
  ],
  endpoints: (builder) => ({
    getInstitutionInfo: builder.query({
      query: () => 'institution_info',
      providesTags: ['InstitutionInfo'],
    }),
    getAllGenders: builder.query({
      query: () => 'gender',
      providesTags: ['Genders'],
    }),
    getResidential: builder.query({
      query: () => 'residential',
      providesTags: ['Residential'],
    }),
    getPermissionTypes: builder.query({
      query: () => 'permission_type',
      providesTags: ['PermissionType'],
    }),
    getSettings: builder.query({
      query: () => 'settings_info',
      providesTags: ['Settings'],
    }),
    getStudentRelations: builder.query({
      query: () => 'student_relation',
    }),
    getFinancialStatus: builder.query({
      query: () => 'financial_status',
    }),
    getAccReportSettings: builder.query({
      query: () => 'acc_report_settings',
      providesTags: ['Acc_Report_Settings'],
    }),
    updateInstitutionInfo: builder.mutation({
      query: (body) => ({
        url: `institution_info`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['InstitutionInfo'],
    }),
    getCodeSettings: builder.query({
      query: () => 'code_setting',
      providesTags: ['CodeSettings'],
    }),
    updateCodeSetting: builder.mutation({
      query: (body) => ({
        url: `code_setting`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CodeSettings'],
    }),
    updateSettings: builder.mutation({
      query: (body) => ({
        url: `settings_info`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Settings'],
    }),
    updateAccReportSetting: builder.mutation({
      query: (body) => ({
        url: `update_report_settings`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Acc_Report_Settings'],
    }),
    // Division, District, Thana Get
    getDivisions: builder.query({
      query: () => 'division',
    }),
    getDistricts: builder.query({
      query: (id) => `district?divition_id=${id}`,
    }),
    getPoliceStations: builder.query({
      query: (id) => `thana?district_id=${id}`,
    }),
    getLoginUsers: builder.query({
      query: () => `login_users`,
    }),
    getLastAdmissionSerial: builder.query({
      query: ({ ClassID, SessionID }) => ({
        url: 'next_admission_serial',
        method: 'GET',
        params: { ClassID, SessionID },
      }),
      providesTags: ['Settings'],
    }),
    getExamConditionsSettings: builder.query({
      query: () => `exam_conditions`,
    }),
    getWebSettings: builder.query({
      query: () => `website_settings`,
      // providesTags: ['WebSettings'],
    }),
    postWebsitesettings: builder.mutation({
      query: (body) => ({
        url: `website_settings`,
        method: 'POST',
        body,
      }),
      // invalidatesTags: ['WebSettings'],
    }),
    getStudentAdmissionMessage: builder.query({
      query: () => ({
        url: 'student_admission_message',
        method: 'GET',
      }),
      providesTags: ['StudentAdmissionMessage'],
    }),
    updateStudentAdmissionMessage: builder.mutation({
      query: (body) => ({
        url: `student_admission_message`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['StudentAdmissionMessage'],
    }),
    // ================== External API Key ==================
    generateApiKey: builder.mutation({
      query: () => ({
        url: `${API_URL}/api/users/generate_api_key`,   // 👈 absolute URL
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),
    regenerateApiKey: builder.mutation({
      query: () => ({
        url: `${API_URL}/api/users/regenerate_api_key`, // 👈 absolute URL
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),
    getUserNotices: builder.query({
      query: ({ page = 1, limit = 10, UserCode, UserName, UserTypeID, SessionID, SubClassID }) => {
        const params = new URLSearchParams();

        params.append('page', page);
        params.append('limit', limit);

        if (UserCode) params.append('UserCode', UserCode);
        if (UserName) params.append('UserName', UserName);
        if (UserTypeID) params.append('UserTypeID', UserTypeID);
        if (SessionID) params.append('SessionID', SessionID);
        if (SubClassID) params.append('SubClassID', SubClassID);

        return `/user_notice?${params.toString()}`;
      },
      providesTags: ['UserNotice'],
    }),
    createUserNotice: builder.mutation({
      query: (body) => ({
        url: '/user_notice',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UserNotice'],

    }),

    updateUserNotice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/user_notice/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UserNotice'],

    }),

    deleteUserNotice: builder.mutation({
      query: (id) => ({
        url: `user_notice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UserNotice'], // ✅ Invalidate list after delete
    }),
    deleteUserNotices: builder.mutation({
      query: (ids) => ({
        url: 'user_notices',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }, // ✅ Required for DELETE body
        body: { ids }, // ✅ wrap in object
      }),
      invalidatesTags: ['UserNotice'], // ✅ refresh list after delete
    }),
    getUserNotice: builder.query({
      query: (id) => ({
        url: `user_notice/${id}`,
        method: 'GET',
      }),
      providesTags: ['UserNotice'],
    }),
    getUsersWithType: builder.query({
      query: ({ id, page = 1, limit = 10, search = "", sessionID, subClassID }) => ({
        url: `/get_user_data_with_type/${id}`,
        method: "GET",
        params: { page, limit, search, sessionID, subClassID }, // ✅ query params
      }),
    }),

    getSupportTicketsList: builder.query({
      query: ({ type = "", page = 1, limit = 10, search = "" } = {}) => ({
        url: `/support_ticket/list`,
        method: "GET",
        params: { type, page, limit, search }, // ✅ query params
      }),
      providesTags: ['SupportTicketList'],
    }),

    getSupportTicketDetails: builder.query({
      query: (id) => ({
        url: `/support_ticket/details/${id}`,
        method: "GET"
      }),
      providesTags: ['SupportTicketDetails'],
    }),



    createSupportTickets: builder.mutation({
      query: (body) => ({
        url: '/support_ticket/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SupportTicketList'],

    }),


    replySupportTickets: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/support_ticket/reply/${id}`,
        method: 'POST',
        body: formData,

      }),
      invalidatesTags: ['SupportTicketDetails'],

    }),
    supportTicketsSupport: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/support_ticket/support/${id}`,
        method: 'POST',
        body: formData,

      }),
      invalidatesTags: ['SupportTicketDetails', 'SupportTicketList'],

    }),
    getsupportTicketsSupport: builder.query({
      query: (id) => ({
        url: `/support_ticket/support/${id}`,
        method: "GET"
      }),
      providesTags: ['SupportTicketDetails'],
    }),
    supportTicketsDepartment: builder.query({
      query: (id) => ({
        url: `/support_ticket/departments`,
        method: "GET"
      }),
      providesTags: ['SupportTicketDeparmetns'],
    }),
    deleteSupportTicket: builder.mutation({
      query: (id) => ({
        url: `/support_ticket/delete/${id}`,
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: { id },
      }),
      invalidatesTags: ['SupportTicketList'],
    }),
    // ================== Document Setting ==================
    getDocumentSettings: builder.query({
      query: () => 'document_settings',
      providesTags: ['DocumentSettings'],
    }),
    saveDocumentSettings: builder.mutation({
      query: (body) => ({
        url: 'document_settings',
        method: 'POST',
        body,           // FormData পাঠানো হবে
      }),
      invalidatesTags: ['DocumentSettings'],
    }),

    // ================== সিট কার্ড সেটিংস ==================
    //
    // ⭐ ব্যবহারকারীর বাছাই করা ডিজাইন, লেখার আকার, জলছাপের ঘনত্ব আর
    //    কোন ঘরগুলো দেখাবে — সব একটা JSON হয়ে ডেটাবেজে বসে। ভাষা ধরে
    //    আলাদা (বাংলা/আরবি), তাই দুই ভাষার কার্ড আলাদা সাজে রাখা যায়।
    //
    // এন্ডপয়েন্টটা না থাকলেও (পুরোনো সার্ভার) কিছু ভাঙে না — মডাল
    // localStorage থেকেই চালায়, শুধু অন্য কম্পিউটারে সেটিংসটা যায় না।
    getSeatCardSettings: builder.query({
      // পুরো URL দেওয়া হয়েছে ইচ্ছে করেই — RTK Query পুরো URL পেলে
      // slice এর base টা আর জোড়ে না, তাই অন্য রাউটারেও পৌঁছানো যায়
      query: (languageId = 1) =>
        `${EXAM_API}/seat_card_settings?LanguageID=${languageId}`,
      providesTags: (result, error, languageId) => [
        { type: 'SeatCardSettings', id: languageId ?? 1 },
      ],
    }),
    saveSeatCardSettings: builder.mutation({
      query: ({ languageId = 1, settings }) => ({
        url: `${EXAM_API}/seat_card_settings`,
        method: 'POST',
        body: { LanguageID: languageId, Settings: settings },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'SeatCardSettings', id: arg?.languageId ?? 1 },
      ],
    }),



    /* =========== student-data-export-template ✅ ১. GET ALL ============ */
    getAllStudentDataExportTemplates: builder.query({
      query: () => ({
        url: "/student-data-export-template",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
            ...result.data.map((item) => ({
              type: "StudentDataExportTemplate",
              id: item.FieldKey,        // ✅ FieldKey দিয়ে tag
            })),
            { type: "StudentDataExportTemplate", id: "LIST" },
          ]
          : [{ type: "StudentDataExportTemplate", id: "LIST" }],
    }),

    /* ================ ✅ ২. GET SINGLE ============================== */
    getStudentDataExportTemplateByKey: builder.query({
      query: (fieldKey) => ({
        url: `/student-data-export-template/${fieldKey}`,
        method: "GET",
      }),
      providesTags: (result, error, fieldKey) => [
        { type: "StudentDataExportTemplate", id: fieldKey },
      ],
    }),

    /* ============= ✅ ৩. CREATE (POST) ============================== */
    createStudentDataExportTemplate: builder.mutation({
      query: (body) => ({
        url: "/student-data-export-template",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "StudentDataExportTemplate", id: "LIST" },
      ],
    }),

    /* ============= ✅ ৪. UPDATE (PUT) =============================== */
    updateStudentDataExportTemplate: builder.mutation({
      query: ({ fieldKey, ...body }) => ({
        url: `/student-data-export-template/${fieldKey}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { fieldKey }) => [
        { type: "StudentDataExportTemplate", id: fieldKey },
        { type: "StudentDataExportTemplate", id: "LIST" },
      ],
    }),

    /* ============== ✅ ৫. DELETE SINGLE =============================== */
    deleteStudentDataExportTemplate: builder.mutation({
      query: (fieldKey) => ({
        url: `/student-data-export-template/${fieldKey}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, fieldKey) => [
        { type: "StudentDataExportTemplate", id: fieldKey },
        { type: "StudentDataExportTemplate", id: "LIST" },
      ],
    }),

    /* =================== ✅ ৬. DELETE ALL ============================ */
    deleteAllStudentDataExportTemplates: builder.mutation({
      query: () => ({
        url: "/student-data-export-template",
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "StudentDataExportTemplate", id: "LIST" },
      ],
    }),

    // ✅ App notification পাঠানোর endpoint (আপনার দেওয়া router.post("/send_result_notification"))
    sendResultNotification: builder.mutation({
      query: (body) => ({
        url: '/send_result_notification',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetInstitutionInfoQuery,
  useUpdateInstitutionInfoMutation,
  useUpdateAccReportSettingMutation,
  useGetResidentialQuery,
  useGetStudentRelationsQuery,
  useGetFinancialStatusQuery,
  useGetAccReportSettingsQuery,
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetPoliceStationsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetPermissionTypesQuery,
  useUpdateCodeSettingMutation,
  useGetCodeSettingsQuery,
  useGetLoginUsersQuery,
  useGetAllGendersQuery,
  useGetLastAdmissionSerialQuery,
  useGetExamConditionsSettingsQuery,
  useGetWebSettingsQuery,
  usePostWebsitesettingsMutation,
  useGetStudentAdmissionMessageQuery,
  useUpdateStudentAdmissionMessageMutation,
  useCreateUserNoticeMutation,
  useGetUserNoticesQuery,
  useUpdateUserNoticeMutation,
  useDeleteUserNoticeMutation,
  useGetUsersWithTypeQuery,
  useDeleteUserNoticesMutation,
  useGetUserNoticeQuery,
  useGetSupportTicketsListQuery,
  useGetSupportTicketDetailsQuery,
  useCreateSupportTicketsMutation,
  useReplySupportTicketsMutation,
  useSupportTicketsSupportMutation,
  useGetsupportTicketsSupportQuery,
  useSupportTicketsDepartmentQuery,
  useDeleteSupportTicketMutation,
  useGetDocumentSettingsQuery,
  useSaveDocumentSettingsMutation,

  useGetSeatCardSettingsQuery,
  useSaveSeatCardSettingsMutation,
  useGenerateApiKeyMutation,
  useRegenerateApiKeyMutation,

  useGetAllStudentDataExportTemplatesQuery,
  useGetStudentDataExportTemplateByKeyQuery,      // ← নতুন নাম
  useCreateStudentDataExportTemplateMutation,
  useUpdateStudentDataExportTemplateMutation,
  useDeleteStudentDataExportTemplateMutation,
  useDeleteAllStudentDataExportTemplatesMutation,
  useLazyGetAllStudentDataExportTemplatesQuery,
  useLazyGetStudentDataExportTemplateByKeyQuery,  // ← নতুন নাম

  useSendResultNotificationMutation
} = settingsSlice;
