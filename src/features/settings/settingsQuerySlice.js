import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

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
    'WebSettings'
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
  useUpdateStudentAdmissionMessageMutation
} = settingsSlice;
