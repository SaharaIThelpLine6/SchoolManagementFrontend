import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userStudentSlice = createApi({
  reducerPath: 'userStudent',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/students`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Student',
    'StudentVacation',
    'StudentVacationType',
    'StudentReports',
    'ExamNames',
    'UsersOnlineRegInfo',
    'StudentAdmissions',
  ],
  endpoints: (builder) => ({
    getStudentBySearch: builder.query({
      query: ({
        search,
        ClassID,
        SessionID,
        NewOldId,
        GenderID,
        ResidentialStatusId,
      }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (ClassID) params.append('ClassID', ClassID);
        if (GenderID) params.append('GenderID', GenderID);
        if (SessionID) params.append('SessionID', SessionID);
        if (NewOldId) params.append('NewOldId', NewOldId);
        if (ResidentialStatusId)
          params.append('ResidentialStatusId', ResidentialStatusId);

        return `search_student?${params.toString()}`;
      },
      providesTags: ['Student'],
    }),

    getStudent: builder.query({
      query: () => 'view_students',
      providesTags: ['Student'],
    }),

    getStudentReportCets: builder.query({
      query: () => `get_studentreport_cet`,
      providesTags: ['StudentReportsCet'],
    }),

    postStudentReportCets: builder.mutation({
      query: (data) => ({
        url: `student_report_cet`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentReportsCet'],
    }),

    updateStudentReportCets: builder.mutation({
      query: (data) => ({
        url: `student_report_cet/${data.catid}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentReportsCet'],
    }),

    getStudentReportType: builder.query({
      query: () => `get_studentreport_type`,
      providesTags: ['StudentReportsType'],
    }),
    postStudentReportType: builder.mutation({
      query: (data) => ({
        url: `student_report_type`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentReportsType'],
    }),
    updateStudentReportType: builder.mutation({
      query: (data) => ({
        url: `student_report_type/${data.catid}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentReportsType'],
    }),

    getStudentReports: builder.query({
      query: ({ userCode, classID, SessionID }) => {
        const params = new URLSearchParams();
        if (userCode) params.append('StudentCode', userCode);
        if (classID) params.append('SubClassID', classID);
        if (SessionID) params.append('SessionID', SessionID);
        return `get_studentreports?${params.toString()}`;
      },

      providesTags: ['StudentReports'],
    }),

    postStudentCharacterReport: builder.mutation({
      query: (data) => ({
        url: `student_character_report`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StudentReports'],
    }),
    updateStudentCharacterReport: builder.mutation({
      query: (data) => ({
        url: `student_character_report`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['StudentReports'],
    }),
    deleteStudentCharacterReport: builder.mutation({
      query: (id) => ({
        url: `student_character_report/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentReports'],
    }),
    postEnglishAndArobicName: builder.mutation({
      query: (data) => ({
        url: `student_translate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),

    // Vacation List
    getStudentsVacationList: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/get_vacation_list?page=${page}&limit=${limit}`,
      providesTags: ['StudentVacation'],
    }),

    postStudentsVacation: builder.mutation({
      query: (body) => ({
        url: `student_vacation`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudentVacation'],
    }),

    updateStudentsVacation: builder.mutation({
      query: (body) => ({
        url: `student_vacation/${body.ID}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['StudentVacation'],
    }),
    deleteStudentsVacation: builder.mutation({
      query: (id) => ({
        url: `student_vacation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentVacation'],
    }),

    // Vacation Type List
    getStudentsVacationTypeList: builder.query({
      query: () => `get_studentvacation_type_list`,
      providesTags: ['StudentVacationType'],
    }),
    postStudentsVacationType: builder.mutation({
      query: (body) => ({
        url: `studentvacation_type`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudentVacationType'],
    }),
    updateStudentsVacationType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `studentvacation_type/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['StudentVacationType'],
    }),
    deleteStudentsVacationType: builder.mutation({
      query: (id) => ({
        url: `studentvacation_type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentVacationType'], // Ensures the list is refreshed
    }),
    // Transfer Certificate
    getStudentsTransferCertificate: builder.query({
      query: () => `get_student_transfer_certificate`,
      providesTags: ['StudentTransferCertificate'],
    }),
    getExamNames: builder.query({
      query: () => `get_exam_names`,
      providesTags: ['ExamNames'],
    }),
    getLastAdmissionUserCode: builder.query({
      query: () => `next_user_code`,
      providesTags: ['Users'],
    }),
    postStudentsTransferCertificate: builder.mutation({
      query: (body) => ({
        url: `student_transfer_certificate`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['StudentTransferCertificate'],
    }),
    updateStudentsTransferCertificate: builder.mutation({
      query: ({ id, body }) => ({
        url: `student_transfer_certificate/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'StudentTransferCertificate', id },
        'StudentTransferCertificate', // Invalidate both specific and all queries
      ],
    }),
    postChnageStudentGroup: builder.mutation({
      query: ({ id, body }) => ({
        url: `change_studentgroup/${id}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Student'], // Ensures the list is refreshed
    }),

    deleteStudentsTransferCertificate: builder.mutation({
      query: (id) => ({
        url: `student_transfer_certificate/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StudentTransferCertificate'], // Ensures the list is refreshed
    }),
    getUsersOnlineRegInfo: builder.query({
      query: ({ page = 1, limit = 20 }) =>
        `get_User_Onlice_RegInfo?page=${page}&limit=${limit}`,
      providesTags: ['UsersOnlineRegInfo'],
    }),
    postStudentAdmission: builder.mutation({
      query: (body) => ({
        url: `student_admission`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UsersOnlineRegInfo', 'Student'], // Ensures the list is refreshed
    }),
    postStudentAdmissionInsert: builder.mutation({
      query: (body) => ({
        url: `insert_student`,
        method: 'POST',
        body: { data: body },
      }),
      invalidatesTags: ['StudentAdmissions', 'Student'],
    }),

    getStudentsAdmissionData: builder.query({
      query: () => `view_useronly_students`,
      providesTags: ['StudentAdmissions', 'Student'],
    }),
  }),
});

export const {
  useGetStudentBySearchQuery,
  useGetStudentQuery,
  useGetStudentsAdmissionDataQuery,
  usePostStudentAdmissionInsertMutation,
  useGetStudentReportCetsQuery,
  usePostStudentReportCetsMutation,
  useUpdateStudentReportCetsMutation,
  usePostStudentReportTypeMutation,
  useUpdateStudentReportTypeMutation,
  useGetStudentReportTypeQuery,
  useGetStudentReportsQuery,
  usePostStudentCharacterReportMutation,
  useGetStudentsVacationListQuery,
  usePostStudentsVacationMutation,
  useUpdateStudentsVacationMutation,
  useGetStudentsVacationTypeListQuery,
  usePostStudentsVacationTypeMutation,
  useUpdateStudentsVacationTypeMutation,
  useDeleteStudentsVacationTypeMutation,
  usePostEnglishAndArobicNameMutation,
  useGetStudentsTransferCertificateQuery,
  usePostStudentsTransferCertificateMutation,
  useUpdateStudentsTransferCertificateMutation,
  useDeleteStudentsTransferCertificateMutation,
  useGetExamNamesQuery,
  usePostChnageStudentGroupMutation,
  useGetUsersOnlineRegInfoQuery,
  usePostStudentAdmissionMutation,
  useUpdateStudentCharacterReportMutation,
  useDeleteStudentCharacterReportMutation,
  useDeleteStudentsVacationMutation,
  useGetLastAdmissionUserCodeQuery,
} = userStudentSlice;
