import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const settingsSlice = createApi({
  reducerPath: "siteSettings",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/settings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["InstitutionInfo", "Residential"], // Define your tag type
  endpoints: (builder) => ({
    getInstitutionInfo: builder.query({
      query: () => "institution_info",
      providesTags: ["InstitutionInfo"], // This query provides this tag
    }),
    getResidential: builder.query({
      query: () => "residential",
      providesTags: ["Residential"], // This query provides this tag
    }),
    getStudentRelations: builder.query({
      query: () => "student_relation",
    }),
    getFinancialStatus: builder.query({
      query: () => "financial_status",
    }),
    updateInstitutionInfo: builder.mutation({
      query: (body) => ({
        url: `institution_info`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["InstitutionInfo"], // This mutation invalidates this tag
    }),
    // Division, District, Thana Get
    getDivisions: builder.query({
      query: () => "division",
    }),
    getDistricts: builder.query({
      query: (id) => `district?divition_id=${id}`,
    }),
    getPoliceStations: builder.query({
      query: (id) => `thana?district_id=${id}`,
    }),
  }),
});

export const {
  useGetInstitutionInfoQuery,
  useUpdateInstitutionInfoMutation,
  useGetResidentialQuery,
  useGetStudentRelationsQuery,
  useGetFinancialStatusQuery,
  useGetDivisionsQuery,
  useGetDistrictsQuery,
  useGetPoliceStationsQuery
} = settingsSlice;
