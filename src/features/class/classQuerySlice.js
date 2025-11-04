import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const classSlice = createApi({
  reducerPath: "classs",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/academic`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ClassList", "SubClassList", "Academic_Subjects", "SubClasss"],
  endpoints: (builder) => ({
    // GET endpoints
    getClassList: builder.query({
      query: () => "view_class",
      providesTags: ["ClassList"],
    }),
    getSubClassLisByClassID: builder.query({
      query: (id) => `view_subclass/${id}`,
      providesTags: ["SubClassList"],
    }),
    getSubClassList: builder.query({
      query: () => "view_subclass",
      providesTags: ["SubClassList"],
    }),
    getAcademicSubjects: builder.query({
      query: () => "academic_subjects",
      providesTags: ["Academic_Subjects"],
    }),
    getSubClasss: builder.query({
      query: () => "view_subclass",
      providesTags: ["SubClasss"],
    }),

    // POST endpoint - Create new academic subject
    createAcademicSubject: builder.mutation({
      query: (subjectData) => ({
        url: "academic_subjects",
        method: "POST",
        body: subjectData,
      }),
      invalidatesTags: ["Academic_Subjects"], 
    }),
    changeStudentClass: builder.mutation({
      query: (studentData) => ({
        url: "update_student_class",
        method: "POST",
        body: studentData,
      }), 
    }),

    // PUT endpoint - Update academic subject
    updateAcademicSubject: builder.mutation({
      query: ({ id, ...subjectData }) => ({
        url: `academic_subjects/${id}`,
        method: "PUT",
        body: subjectData,
      }),
      invalidatesTags: ["Academic_Subjects"], 
    }),

    // DELETE endpoint - Remove academic subject
    deleteAcademicSubject: builder.mutation({
      query: (id) => ({
        url: `academic_subjects/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Academic_Subjects"],
    }),
  }),
});

// Export all hooks
export const {
  useGetClassListQuery,
  useGetSubClassListQuery,
 useGetSubClassLisByClassIDQuery,
 useChangeStudentClassMutation,
  useGetAcademicSubjectsQuery,
  useGetSubClasssQuery,
  useCreateAcademicSubjectMutation,
  useUpdateAcademicSubjectMutation,
  useDeleteAcademicSubjectMutation,
} = classSlice;