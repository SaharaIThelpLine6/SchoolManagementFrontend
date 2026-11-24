import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

// বেতন সংক্রান্ত কোনো কিছু বদলালে যে সব ক্যাশ রিফ্রেশ হবে
const SALARY_VIEW_TAGS = ["MonthStatus", "TeacherSummary", "ReportTeacherMonthly", "ReportMatrix"];

export const teachersSlice = createApi({
  reducerPath: 'teachers',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/teachers`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Teacher",
    "Teacher_Subject",
    "TeacherSubjectSubmission",
    "Designation",          // ✅ আগে ছিল না
    "Head",
    "Year",                 // ✅ আগে ছিল না
    "Month",                // ✅ আগে ছিল না
    "Structure",
    "Sheet",
    "Payment",
    "MonthStatus",
    "TeacherSummary",
    "ReportTeacherMonthly",
    "ReportMatrix",
  ],
  endpoints: (builder) => ({
    getDesignation: builder.query({
      query: () => 'designation',
      providesTags: ['Designation'],
    }),
    getTeacherInfo: builder.query({
      query: () => 'teacher_info',
      providesTags: ['Teacher'],
    }),
    getTeacherInfoWhitUser: builder.query({
      query: () => 'teacher_info_with_user',
      providesTags: ['Teacher'],
    }),
    getTeachersInfo: builder.query({
      query: () => 'teachers_info',
      providesTags: ['Teacher'],
    }),
    getLoginTeacherInfo: builder.query({
      query: () => 'login_teacher_info',
      providesTags: ['Teacher'],
    }),
    getTeacherInfoNotRegistered: builder.query({
      query: () => 'teacher_info_not_registered',
      providesTags: ['Teacher'],
    }),
    getTeacherLastSerial: builder.query({
      query: () => 'teacher_last_serial',
      providesTags: ['Teacher'],
    }),
    getTeacherInfoList: builder.query({
      query: ({ UserID, UserCode, Serial, DNID } = {}) => {
        const params = new URLSearchParams();
        if (UserID) params.append('UserID', String(UserID));
        if (UserCode) params.append('UserCode', String(UserCode));
        if (Serial) params.append('Serial', String(Serial));
        if (DNID) params.append('DNID', String(DNID));
        const queryString = params.toString();
        return `get_teacher_info${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Teacher'],
    }),
    updateTeacher: builder.mutation({
      query: (data) => ({ url: "update_teacher_info", method: 'PUT', body: data }),
      invalidatesTags: ['Teacher'],
    }),
    postTeacherInfoRegistered: builder.mutation({
      query: (body) => ({ url: 'insert_teacher', method: 'POST', body }),
      invalidatesTags: ['Teacher'],
    }),
    createDesignation: builder.mutation({
      query: (body) => ({ url: 'designation', method: 'POST', body }),
      invalidatesTags: ['Designation'],
    }),
    updateDesignation: builder.mutation({
      query: (data) => ({ url: `/designation/${data.DNID}`, method: 'PUT', body: { Designation: data.Designation } }),
      invalidatesTags: ['Designation'],
    }),
    deleteDesignation: builder.mutation({
      query: (DNID) => ({ url: `/designation/${DNID}`, method: 'DELETE' }),
      invalidatesTags: ['Designation'],
    }),
    updateTeacherInfo: builder.mutation({
      query: (body) => ({ url: 'update_teacher', method: 'PUT', body }),
      invalidatesTags: ['Teacher'],
    }),
    postSubjectToTeacher: builder.mutation({
      query: (body) => ({ url: 'teacher_subject', method: 'POST', body }),
      invalidatesTags: ['Teacher_Subject'],
    }),
    getTeacherSubjects: builder.query({
      query: () => 'teacher_subject',
      providesTags: ['Teacher_Subject'],
    }),
    getTeacherSubjectsByFilter: builder.query({
      query: ({ SessionID, ExamID, SubClassID } = {}) => {
        const params = new URLSearchParams();
        if (SessionID) params.append("SessionID", SessionID);
        if (ExamID) params.append("ExamID", ExamID);
        if (SubClassID) params.append("SubClassID", SubClassID);
        return `/teacher_subject/filter/list?${params.toString()}`;
      },
      providesTags: ["Teacher_Subject"],
    }),
    postInsertTeacherInfo: builder.mutation({
      query: (body) => ({ url: 'insert_teacher_info', method: 'POST', body }),
      invalidatesTags: ['Teacher'],
    }),
    getFilteredTeachers: builder.query({
      query: ({ page = 1, limit = 10, userTypeID, filterTypeId, filterValue, DNID, UserAction }) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (userTypeID) params.append('userTypeID', userTypeID);
        if (filterTypeId) params.append('filterTypeId', filterTypeId);
        if (filterValue) params.append('filterValue', filterValue);
        if (DNID !== undefined && DNID !== null && DNID !== '') params.append('DNID', DNID);
        if (UserAction !== undefined && UserAction !== null && UserAction !== '') params.append('UserAction', UserAction);
        return `/teacher_filter?${params.toString()}`;
      },
      providesTags: ['Teacher'],
    }),
    deleteTeacherSubject: builder.mutation({
      query: (ids) => ({ url: "/teacher_subject", method: "DELETE", body: Array.isArray(ids) ? ids : [ids] }),
      invalidatesTags: ["Teacher_Subject"],
    }),
    getTeacherSubjectSubmissions: builder.query({
      query: ({ SessionID, ExamID, TeacherID }) => ({
        url: `/teacher_subject_submission`,
        params: { SessionID, ExamID, TeacherID },
      }),
      providesTags: ["Teacher_Subject"],
    }),
    submitTeacherKhata: builder.mutation({
      query: (body) => ({ url: `/teacher_subject_submission`, method: "PUT", body }),
      invalidatesTags: ["Teacher_Subject"],
    }),
    getTeacherAttendanceTodayDashboard: builder.query({
      query: ({ date }) => ({ url: "/teacher_attendance_today_count", method: "GET", params: { date } }),
    }),

    /* ============================================================
       A) TEACHERS
       ============================================================ */
    getTeachers: builder.query({
      query: () => "teachers",
      providesTags: ["Teacher"],
    }),

    /* ============================================================
       B) SALARY HEADS
       ============================================================ */
    getHeads: builder.query({
      query: ({ IsActive } = {}) => {
        const params = new URLSearchParams();
        if (IsActive !== undefined && IsActive !== null && IsActive !== "") params.append("IsActive", String(IsActive));
        const qs = params.toString();
        return `heads${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Head"],
    }),
    createHead: builder.mutation({
      query: (body) => ({ url: "heads", method: "POST", body }),
      invalidatesTags: ["Head", "Sheet"],
    }),
    updateHead: builder.mutation({
      query: ({ headId, ...body }) => ({ url: `heads/${headId}`, method: "PUT", body }),
      invalidatesTags: ["Head", "Sheet", "ReportTeacherMonthly"],
    }),
    toggleHeadActive: builder.mutation({
      query: (headId) => ({ url: `heads/${headId}/toggle`, method: "PATCH" }),
      invalidatesTags: ["Head", "Structure", "Sheet"],
    }),

    /* ============================================================
       SALARY YEARS & MONTHS
       ============================================================ */
    getYears: builder.query({
      query: ({ IsActive } = {}) => {
        const params = new URLSearchParams();
        if (IsActive !== undefined && IsActive !== null && IsActive !== "") params.append("IsActive", String(IsActive));
        const qs = params.toString();
        return `years${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Year"],
    }),
    createYear: builder.mutation({
      query: (body) => ({ url: "years", method: "POST", body }),
      invalidatesTags: ["Year"],
    }),
    updateYear: builder.mutation({
      query: ({ yearId, ...body }) => ({ url: `years/${yearId}`, method: "PUT", body }),
      invalidatesTags: ["Year", "Month", ...SALARY_VIEW_TAGS],
    }),
    updateYearStatus: builder.mutation({
      query: ({ yearId, ...body }) => ({ url: `years/${yearId}/status`, method: "PATCH", body }),
      invalidatesTags: ["Year", "Month"],
    }),
    getMonths: builder.query({
      query: ({ yearId } = {}) => {
        const params = new URLSearchParams();
        if (yearId) params.append("yearId", String(yearId));
        const qs = params.toString();
        return `months${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Month"],
    }),
    createMonth: builder.mutation({
      query: (body) => ({ url: "months", method: "POST", body }),
      invalidatesTags: ["Month", ...SALARY_VIEW_TAGS],
    }),
    updateMonth: builder.mutation({
      query: ({ monthId, ...body }) => ({ url: `months/${monthId}`, method: "PUT", body }),
      invalidatesTags: ["Month", ...SALARY_VIEW_TAGS],
    }),
    updateMonthStatus: builder.mutation({
      query: ({ monthId, ...body }) => ({ url: `months/${monthId}/status`, method: "PATCH", body }),
      invalidatesTags: ["Month"],
    }),

    /* ============================================================
       C) SALARY STRUCTURE
       ============================================================ */
    getStructures: builder.query({
      query: ({ UserID } = {}) => {
        const params = new URLSearchParams();
        if (UserID) params.append("UserID", String(UserID));
        const qs = params.toString();
        return `structures${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Structure"],
    }),
    saveTeacherStructure: builder.mutation({
      // body: { Amounts: { "<HeadID>": 5000, ... } }  (0 দিলে ওই খাত মুছে যায়)
      query: ({ userId, Amounts }) => ({ url: `structures/teacher/${userId}`, method: "PUT", body: { Amounts } }),
      invalidatesTags: ["Structure"],
    }),
    applyStructureBulk: builder.mutation({
      // body: { UserIDs: [1,2,3], Amounts: {...} }
      query: (body) => ({ url: "structures/apply-bulk", method: "POST", body }),
      invalidatesTags: ["Structure"],
    }),

    /* ============================================================
       D) SALARY SHEETS  — ✅ এখন YearID / MonthID
       ============================================================ */
    getSheets: builder.query({
      // ?YearID=&MonthID=&UserID=&Status=
      query: ({ YearID, MonthID, UserID, Status } = {}) => {
        const params = new URLSearchParams();
        if (YearID) params.append("YearID", String(YearID));
        if (MonthID) params.append("MonthID", String(MonthID));
        if (UserID) params.append("UserID", String(UserID));
        if (Status) params.append("Status", Status);
        const qs = params.toString();
        return `sheets${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Sheet"],
    }),
    generateSheets: builder.mutation({
      // body: { YearID, MonthID, UserIDs? }
      query: (body) => ({ url: "sheets/generate", method: "POST", body }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),
    // ✅ কাঠামো থেকে খসড়া শিট আপডেট
    syncSheets: builder.mutation({
      // body: { YearID, MonthID, UserIDs? }
      query: (body) => ({ url: "sheets/sync", method: "POST", body }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),
    updateSheet: builder.mutation({
      // body: { Details: [{ HeadID, Amount }], Remarks? }
      query: ({ sheetId, ...body }) => ({ url: `sheets/${sheetId}`, method: "PUT", body }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),
    finalizeSheet: builder.mutation({
      query: (sheetId) => ({ url: `sheets/${sheetId}/finalize`, method: "PATCH" }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),
    finalizeSheetsForMonth: builder.mutation({
      // body: { YearID, MonthID }
      query: (body) => ({ url: "sheets/finalize", method: "POST", body }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),
    revertSheet: builder.mutation({
      query: (sheetId) => ({ url: `sheets/${sheetId}/revert`, method: "PATCH" }),
      invalidatesTags: ["Sheet", ...SALARY_VIEW_TAGS],
    }),

    /* ============================================================
       E) PAYMENTS
       ============================================================ */
    getPayments: builder.query({
      query: ({ UserID, From, To, PaymentMethod, IsReversed } = {}) => {
        const params = new URLSearchParams();
        if (UserID) params.append("UserID", String(UserID));
        if (From) params.append("From", From);
        if (To) params.append("To", To);
        if (PaymentMethod) params.append("PaymentMethod", PaymentMethod);
        if (IsReversed !== undefined && IsReversed !== null && IsReversed !== "") params.append("IsReversed", String(IsReversed));
        const qs = params.toString();
        return `payments${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Payment"],
    }),
    getPaymentById: builder.query({
      query: (paymentId) => `payments/${paymentId}`,
      providesTags: ["Payment"],
    }),
    createPayment: builder.mutation({
      // body: { UserID, PaymentDate, PaymentMethod, Note, Details: [{ YearID, MonthID, Amount }] }
      query: (body) => ({ url: "payments", method: "POST", body }),
      invalidatesTags: ["Payment", ...SALARY_VIEW_TAGS],
    }),
    reversePayment: builder.mutation({
      query: ({ paymentId, ReverseReason }) => ({
        url: `payments/${paymentId}/reverse`,
        method: "PATCH",
        body: { ReverseReason },
      }),
      invalidatesTags: ["Payment", ...SALARY_VIEW_TAGS],
    }),

    /* ============================================================
       F) STATUS & REPORTS  — ✅ এখন YearID
       ============================================================ */
    getMonthStatus: builder.query({
      // ?UserID=&YearID=
      query: ({ UserID, YearID }) => ({ url: "month-status", params: { UserID, YearID } }),
      providesTags: ["MonthStatus"],
    }),
    getTeacherSummary: builder.query({
      query: ({ UserID }) => ({ url: "teacher-summary", params: { UserID } }),
      providesTags: ["TeacherSummary"],
    }),
    getReportTeacherMonthly: builder.query({
      // ?UserID=&YearID=
      query: ({ UserID, YearID }) => ({ url: "reports/teacher-monthly", params: { UserID, YearID } }),
      providesTags: ["ReportTeacherMonthly"],
    }),
    getReportMatrix: builder.query({
      // ?YearID=
      query: ({ YearID }) => ({ url: "reports/matrix", params: { YearID } }),
      providesTags: ["ReportMatrix"],
    }),
  }),
});

export const {
  useGetDesignationQuery,
  useGetTeacherInfoQuery,
  useGetTeacherInfoWhitUserQuery,
  useGetTeacherInfoNotRegisteredQuery,
  usePostTeacherInfoRegisteredMutation,
  useUpdateTeacherInfoMutation,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetLoginTeacherInfoQuery,
  useGetTeachersInfoQuery,
  usePostSubjectToTeacherMutation,
  useGetTeacherSubjectsQuery,
  useGetTeacherSubjectsByFilterQuery,
  useGetTeacherLastSerialQuery,
  usePostInsertTeacherInfoMutation,
  useGetTeacherInfoListQuery,
  useUpdateTeacherMutation,
  useGetFilteredTeachersQuery,
  useDeleteTeacherSubjectMutation,
  useGetTeacherSubjectSubmissionsQuery,
  useSubmitTeacherKhataMutation,
  useGetTeacherAttendanceTodayDashboardQuery,

  // Teachers
  useGetTeachersQuery,

  // Heads
  useGetHeadsQuery,
  useCreateHeadMutation,
  useUpdateHeadMutation,
  useToggleHeadActiveMutation,

  // Years
  useGetYearsQuery,
  useCreateYearMutation,
  useUpdateYearMutation,
  useUpdateYearStatusMutation,

  // Months
  useGetMonthsQuery,
  useCreateMonthMutation,
  useUpdateMonthMutation,
  useUpdateMonthStatusMutation,

  // Structure
  useGetStructuresQuery,
  useSaveTeacherStructureMutation,
  useApplyStructureBulkMutation,

  // Sheets
  useGetSheetsQuery,
  useGenerateSheetsMutation,
  useSyncSheetsMutation,
  useUpdateSheetMutation,
  useFinalizeSheetMutation,
  useFinalizeSheetsForMonthMutation,
  useRevertSheetMutation,

  // Payments
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useReversePaymentMutation,

  // Status & Reports
  useGetMonthStatusQuery,
  useGetTeacherSummaryQuery,
  useGetReportTeacherMonthlyQuery,
  useGetReportMatrixQuery,
} = teachersSlice;
