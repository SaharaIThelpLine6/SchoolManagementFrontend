import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const classSlice = createApi({
  reducerPath: 'classs',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/academic`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'ClassList',
    'SubClassList',
    'Academic_Subjects',
    'SubClasss',
    'Class_Routine',
  ],
  endpoints: (builder) => ({
    // GET endpoints
    getClassList: builder.query({
      query: () => 'view_class',
      providesTags: ['ClassList'],
    }),
    createClass: builder.mutation({
      query: (data) => ({
        url: 'insert_class',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ClassList'],
    }),
    updateClass: builder.mutation({
      query: (studentData) => ({
        url: `update_class/${studentData.id}`,
        method: 'PUT',
        body: studentData,
      }),
      invalidatesTags: ['ClassList'],
    }),
    getSingleClass: builder.query({
      query: (id) => `single_class/${id}`,
      providesTags: ['ClassList'],
    }),
    getSubClassLisByClassID: builder.query({
      query: (id) => `view_subclass/${id}`,
      providesTags: ['SubClassList'],
    }),
    getSubClassList: builder.query({
      query: () => 'view_subclass',
      providesTags: ['SubClassList'],
    }),
    getAcademicSubjects: builder.query({
      query: (SubClassID) => ({
        url: 'academic_subjects',
        params: SubClassID ? { SubClassID } : {},
      }),
      providesTags: ['Academic_Subjects'],
    }),
    getSubClasss: builder.query({
      query: () => 'view_subclass',
      providesTags: ['SubClasss'],
    }),

    // POST endpoint - Create new academic subject
    createAcademicSubject: builder.mutation({
      query: (subjectData) => ({
        url: 'academic_subjects',
        method: 'POST',
        body: subjectData,
      }),
      invalidatesTags: ['Academic_Subjects'],
    }),

    // PUT endpoint - Update academic subject
    updateAcademicSubject: builder.mutation({
      query: ({ id, ...subjectData }) => ({
        url: `academic_subjects/${id}`,
        method: 'PUT',
        body: subjectData,
      }),
      invalidatesTags: ['Academic_Subjects'],
    }),

    // DELETE endpoint - Remove academic subject
    deleteAcademicSubject: builder.mutation({
      query: (id) => ({
        url: `academic_subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Academic_Subjects'],
    }),
    getLastSerialSubject: builder.query({
      query: (id) => `academic_subjects/last-serial/${id}`,
      providesTags: ['Academic_Subjects'],
    }),
    getAcademicSubjectsBySubClass: builder.query({
      query: (id) => `academic_subjects/by-subclass/${id}`,
      providesTags: ['ClassList', 'Academic_Subjects'],
    }),

    // Class Routine
    getClassRoutines: builder.query({
      query: () => `class_routine_list`,
      providesTags: ['Class_Routine'],
    }),
    createClassRoutine: builder.mutation({
      query: (data) => ({
        url: 'create_class_routine',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Class_Routine'],
    }),
    updateClassRoutine: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_class_routine/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Class_Routine'],
    }),
    getSingleClassRoutine: builder.query({
      query: (id) => `class_routine_get/${id}`,
      providesTags: ['Class_Routine'],
    }),
    deleteClassRoutine: builder.mutation({
      query: (id) => ({
        url: `delete_class_routine/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Class_Routine'],
    }),
  }),
});

// Export all hooks
export const {
  useGetClassListQuery,
  useGetSubClassListQuery,
  useGetSubClassLisByClassIDQuery,
  useGetAcademicSubjectsQuery,
  useGetSubClasssQuery,
  useCreateAcademicSubjectMutation,
  useUpdateAcademicSubjectMutation,
  useDeleteAcademicSubjectMutation,
  useGetLastSerialSubjectQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useGetSingleClassQuery,
  useGetAcademicSubjectsBySubClassQuery,
  useGetClassRoutinesQuery,
  useCreateClassRoutineMutation,
  useUpdateClassRoutineMutation,
  useGetSingleClassRoutineQuery,
  useDeleteClassRoutineMutation,
} = classSlice;
