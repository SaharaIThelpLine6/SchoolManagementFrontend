import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userStudentSlice = createApi({
  reducerPath: "userStudent",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/students`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Student",
    "StudentVacation",
    "StudentVacationType",
    "StudentReports",
  ],
  endpoints: (builder) => ({
    getStudentBySearch: builder.query({
      query: ({ search, ClassID, SessionID }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append("search", search);
        }
        if (ClassID) params.append("ClassID", ClassID);
        if (SessionID) params.append("SessionID", SessionID);

        return `search_student?${params.toString()}`;
      },
    }),

    getStudent: builder.query({
      query: () => "view_students",
      providesTags: ["Student"],
    }),

    getStudentReportCets: builder.query({
      query: () => `get_studentreport_cet`,
    }),

    getStudentReportType: builder.query({
      query: () => `get_studentreport_type`,
    }),

    getStudentReports: builder.query({
      query: ({ userCode, classID, SessionID }) => {
        const params = new URLSearchParams();
        if (userCode) params.append("StudentCode", userCode);
        if (classID) params.append("SubClassID", classID);
        if (SessionID) params.append("SessionID", SessionID);
        return `get_studentreports?${params.toString()}`;
      },

      providesTags: ["StudentReports"],
    }),

    postStudentCharacterReport: builder.mutation({
      query: (data) => ({
        url: `student_character_report`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["StudentReports"],
    }),

    // Vacation List
    getStudentsVacationList: builder.query({
      query: ({ page = 1, limit = 10 }) =>
        `/get_vacation_list?page=${page}&limit=${limit}`,
      providesTags: ["StudentVacation"],
    }),

    postStudentsVacation: builder.mutation({
      query: (body) => ({
        url: `student_vacation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StudentVacation"],
    }),

    updateStudentsVacation: builder.mutation({
      query: (body) => ({
        url: `student_vacation/${body.ID}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["StudentVacation"],
    }),

    // Vacation Type List
    getStudentsVacationTypeList: builder.query({
      query: () => `get_studentvacation_type_list`,
      providesTags: ["StudentVacationType"],
    }),

    postStudentsVacationType: builder.mutation({
      query: (body) => ({
        url: `studentvacation_type`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["StudentVacationType"],
    }),

    updateStudentsVacationType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `studentvacation_type/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["StudentVacationType"],
    }),
    deleteStudentsVacationType: builder.mutation({
      query: (id) => ({
        url: `studentvacation_type/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["StudentVacationType"], // Ensures the list is refreshed
    }),
  }),
});

export const {
  useGetStudentBySearchQuery,
  useGetStudentQuery,
  useGetStudentReportCetsQuery,
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
} = userStudentSlice;
