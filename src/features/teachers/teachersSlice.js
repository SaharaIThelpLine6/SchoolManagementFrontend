import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

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
    'Teacher',
    "Teacher_Subject",
    "TeacherSubjectSubmission",
    "Teacher",
    "Head",
    "Structure",
    "Sheet",
    "Payment",
    "MonthStatus",
    "TeacherSummary",
    "ReportTeacherMonthly",
    "ReportMatrix"
  ], // define tag type
  endpoints: (builder) => ({
    getDesignation: builder.query({
      query: () => 'designation',
      providesTags: ['Designation'], // cache tagging
    }),
    getTeacherInfo: builder.query({
      query: () => 'teacher_info',
      providesTags: ['Teacher'], // cache tagging
    }),
    getTeacherInfoWhitUser: builder.query({
      query: () => 'teacher_info_with_user',
      providesTags: ['Teacher'], // cache tagging
    }),
    getTeachersInfo: builder.query({
      query: () => 'teachers_info',
      providesTags: ['Teacher'], // cache tagging
    }),
    getLoginTeacherInfo: builder.query({
      query: () => 'login_teacher_info',
      providesTags: ['Teacher'], // cache tagging
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
      query: (data) => ({
        url: "update_teacher_info",
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Teacher'],
    }),
    postTeacherInfoRegistered: builder.mutation({
      query: (body) => ({
        url: 'insert_teacher',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Teacher'],
    }),

    createDesignation: builder.mutation({
      query: (body) => ({
        url: 'designation',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Designation'],
    }),
    updateDesignation: builder.mutation({
      query: (data) => ({
        url: `/designation/${data.DNID}`,
        method: 'PUT',
        body: { Designation: data.Designation },
      }),
      invalidatesTags: ['Designation'],
    }),
    deleteDesignation: builder.mutation({
      query: (DNID) => ({
        url: `/designation/${DNID}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Designation'],
    }),
    updateTeacherInfo: builder.mutation({
      query: (body) => ({
        url: 'update_teacher',
        method: 'PUT',
        body: body,
      }),
      invalidatesTags: ['Teacher'],
    }),
    postSubjectToTeacher: builder.mutation({
      query: (body) => ({
        url: 'teacher_subject',
        method: 'POST',
        body: body,
      }),
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
      query: (body) => ({
        url: 'insert_teacher_info',
        method: 'POST',
        body: body,
      }),
      invalidatesTags: ['Teacher'],
    }),
    getFilteredTeachers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        userTypeID,
        filterTypeId,
        filterValue,
        DNID,          // ✅ NEW
        UserAction,    // ✅ NEW
      }) => {
        const params = new URLSearchParams();

        params.append('page', page);
        params.append('limit', limit);

        if (userTypeID) params.append('userTypeID', userTypeID);
        if (filterTypeId) params.append('filterTypeId', filterTypeId);
        if (filterValue) params.append('filterValue', filterValue);

        // ✅ DNID filter (Teacher_Info.DNID)
        if (DNID !== undefined && DNID !== null && DNID !== '') {
          params.append('DNID', DNID);
        }

        // ✅ UserAction filter (User_Info.UserAction: 1 = Active, 0 = Inactive)
        if (UserAction !== undefined && UserAction !== null && UserAction !== '') {
          params.append('UserAction', UserAction);
        }

        return `/teacher_filter?${params.toString()}`;
      },
      providesTags: ['Teacher'],
    }),
    deleteTeacherSubject: builder.mutation({
      query: (ids) => {
        // ids can be: number | array
        const body = Array.isArray(ids) ? ids : [ids];
        return {
          url: "/teacher_subject",
          method: "DELETE",
          body,
        };
      },
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
      query: (body) => ({
        url: `/teacher_subject_submission`,
        method: "PUT",
        body, // { ids: [], submitted: true/false }
      }),
      invalidatesTags: ["Teacher_Subject"],
    }),
    getTeacherAttendanceTodayDashboard: builder.query({
      query: ({ date }) => ({
        url: "/teacher_attendance_today_count",
        method: "GET",
        params: {
          date,
        },
      }),
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
      // ?IsActive=1|0 (optional)
      query: ({ IsActive } = {}) => {
        const params = new URLSearchParams();
        if (IsActive !== undefined && IsActive !== null && IsActive !== "") {
          params.append("IsActive", String(IsActive));
        }
        const qs = params.toString();
        return `heads${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Head"],
    }),

    createHead: builder.mutation({
      // body: { HeadName, HeadType, SortOrder }
      query: (body) => ({ url: "heads", method: "POST", body }),
      invalidatesTags: ["Head", "Sheet"], // new head affects future generate
    }),

    updateHead: builder.mutation({
      // body: { HeadName, HeadType, SortOrder }
      query: ({ headId, ...body }) => ({
        url: `heads/${headId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Head", "Sheet"],
    }),

    toggleHeadActive: builder.mutation({
      query: (headId) => ({
        url: `heads/${headId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Head", "Structure", "Sheet"],
    }),

    /* ============================================================
       C) SALARY STRUCTURE
       ============================================================ */
    getStructures: builder.query({
      // ?UserID= (optional)
      query: ({ UserID } = {}) => {
        const params = new URLSearchParams();
        if (UserID) params.append("UserID", String(UserID));
        const qs = params.toString();
        return `structures${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Structure"],
    }),

    saveTeacherStructure: builder.mutation({
      // body: { Amounts: { "<HeadID>": 5000, ... } }
      query: ({ userId, Amounts }) => ({
        url: `structures/teacher/${userId}`,
        method: "PUT",
        body: { Amounts },
      }),
      invalidatesTags: ["Structure", "Sheet"],
    }),

    applyStructureBulk: builder.mutation({
      // body: { UserIDs: [1,2,3], Amounts: {...} }
      query: (body) => ({
        url: "structures/apply-bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Structure", "Sheet"],
    }),

    /* ============================================================
       D) SALARY SHEETS
       ============================================================ */
    getSheets: builder.query({
      // ?Year=&Month=&UserID=&Status=  (all optional)
      query: ({ Year, Month, UserID, Status } = {}) => {
        const params = new URLSearchParams();
        if (Year) params.append("Year", String(Year));
        if (Month) params.append("Month", String(Month));
        if (UserID) params.append("UserID", String(UserID));
        if (Status) params.append("Status", Status);
        const qs = params.toString();
        return `sheets${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Sheet"],
    }),

    generateSheets: builder.mutation({
      // body: { Year, Month, UserIDs? }
      query: (body) => ({
        url: "sheets/generate",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sheet"],
    }),

    updateSheet: builder.mutation({
      // body: { Details: [{ HeadID, Amount }], Remarks? }
      query: ({ sheetId, ...body }) => ({
        url: `sheets/${sheetId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Sheet"],
    }),

    finalizeSheet: builder.mutation({
      query: (sheetId) => ({
        url: `sheets/${sheetId}/finalize`,
        method: "PATCH",
      }),
      invalidatesTags: ["Sheet"],
    }),

    finalizeSheetsForMonth: builder.mutation({
      // body: { Year, Month }
      query: (body) => ({
        url: "sheets/finalize",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sheet"],
    }),

    revertSheet: builder.mutation({
      query: (sheetId) => ({
        url: `sheets/${sheetId}/revert`,
        method: "PATCH",
      }),
      invalidatesTags: ["Sheet"],
    }),

    /* ============================================================
       E) PAYMENTS
       ============================================================ */
    getPayments: builder.query({
      // ?UserID=&From=&To=&PaymentMethod=&IsReversed=
      query: ({ UserID, From, To, PaymentMethod, IsReversed } = {}) => {
        const params = new URLSearchParams();
        if (UserID) params.append("UserID", String(UserID));
        if (From) params.append("From", From);
        if (To) params.append("To", To);
        if (PaymentMethod) params.append("PaymentMethod", PaymentMethod);
        if (IsReversed !== undefined && IsReversed !== null && IsReversed !== "") {
          params.append("IsReversed", String(IsReversed));
        }
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
      // body: { UserID, PaymentDate, PaymentMethod, Note, Details: [{ SalaryYear, SalaryMonth, Amount }] }
      query: (body) => ({
        url: "payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment", "MonthStatus", "TeacherSummary", "Sheet"],
    }),

    reversePayment: builder.mutation({
      // body: { ReverseReason }
      query: ({ paymentId, ReverseReason }) => ({
        url: `payments/${paymentId}/reverse`,
        method: "PATCH",
        body: { ReverseReason },
      }),
      invalidatesTags: ["Payment", "MonthStatus", "TeacherSummary"],
    }),

    /* ============================================================
       F) STATUS & REPORTS
       ============================================================ */
    getMonthStatus: builder.query({
      // ?UserID=&Year=
      query: ({ UserID, Year }) => ({
        url: "month-status",
        params: { UserID, Year },
      }),
      providesTags: ["MonthStatus"],
    }),

    getTeacherSummary: builder.query({
      // ?UserID=
      query: ({ UserID }) => ({
        url: "teacher-summary",
        params: { UserID },
      }),
      providesTags: ["TeacherSummary"],
    }),

    getReportTeacherMonthly: builder.query({
      // ?UserID=&Year=
      query: ({ UserID, Year }) => ({
        url: "reports/teacher-monthly",
        params: { UserID, Year },
      }),
      providesTags: ["ReportTeacherMonthly"],
    }),

    getReportMatrix: builder.query({
      // ?Year=
      query: ({ Year }) => ({
        url: "reports/matrix",
        params: { Year },
      }),
      providesTags: ["ReportMatrix"],
    }),
  }),
});

export const {
  useGetDesignationQuery,
  useGetTeacherInfoQuery,
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

  // Structure
  useGetStructuresQuery,
  useSaveTeacherStructureMutation,
  useApplyStructureBulkMutation,

  // Sheets
  useGetSheetsQuery,
  useGenerateSheetsMutation,
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
