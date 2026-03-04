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
    'Class_Videos',
    'TimeSlot',
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
    // ==================== Video Tutorial ====================
    getVideoTutorialLinks: builder.query({
      query: ({ SessionID, SubClassID }) => ({
        url: `/get_video_tutorial_link`,
        params: {
          ...(SessionID && { SessionID }),
          ...(SubClassID && { SubClassID }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.videos.map(({ ID }) => ({
              type: 'Class_Videos',
              id: ID,
            })),
            { type: 'Class_Videos', id: 'LIST' },
          ]
          : [{ type: 'Class_Videos', id: 'LIST' }],
    }),

    createClassVideo: builder.mutation({
      query: (data) => ({
        url: 'video_tutorial_link',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Class_Videos', id: 'LIST' }],
    }),
    updateClassVideo: builder.mutation({
      query: ({ id, data }) => ({
        url: `video_tutorial_link/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Class_Videos', id },
      ],
    }),
    deleteClassVideo: builder.mutation({
      query: (id) => ({ url: `video_tutorial_link/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [{ type: 'Class_Videos', id }],
    }),
    getSingleClassVideo: builder.query({
      query: ({ id }) => `video_tutorial_link/${id}`,
      providesTags: ['Class_Videos'],
    }),
    // ============= Time Slots ===================
    getTimeSlots: builder.query({
      query: () => `gr_time_slot`,
      providesTags: ['TimeSlot'],
    }),
    createTimeSlot: builder.mutation({
      query: (data) => ({
        url: 'gr_time_slot',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeSlot'],
    }),
    deleteTimeSlot: builder.mutation({
      query: (id) => ({
        url: `gr_time_slot/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeSlot'],
    }),
    // ============= Class Routine day ===================
    getClassRoutineDays: builder.query({
      query: () => `gr_days`,
      providesTags: ['Days'],
    }),
    // ============= Class Routine ===================
    getClassRoutines: builder.query({
      // query function receives params for pagination & filter
      query: ({ page = 1, limit = 20, SessionID, SubClassID } = {}) => {
        // build query string dynamically
        const params = new URLSearchParams();

        params.append('page', page);
        params.append('limit', limit);

        if (SessionID) params.append('SessionID', SessionID);
        if (SubClassID) params.append('SubClassID', SubClassID);

        return `gr_class_routine?${params.toString()}`;
      },
      providesTags: ['Class_Routine'],
    }),
    createClassRoutine: builder.mutation({
      query: (data) => ({
        url: 'gr_class_routine',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Class_Routine'],
    }),

    updateClassRoutine: builder.mutation({
      query: ({ id, data }) => ({
        url: `gr_class_routine/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Class_Routine'],
    }),
    getSingleClassRoutine: builder.query({
      query: (id) => `gr_class_routine/${id}`,
      providesTags: ['Class_Routine'],
    }),

    deleteClassRoutine: builder.mutation({
      query: (id) => ({
        url: `gr_class_routine/${id}`,
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
  useGetVideoTutorialLinksQuery,
  useCreateClassVideoMutation,
  useUpdateClassVideoMutation,
  useDeleteClassVideoMutation,
  useGetSingleClassVideoQuery,

  useGetTimeSlotsQuery,
  useGetClassRoutineDaysQuery,
  useCreateTimeSlotMutation,
  useDeleteTimeSlotMutation
} = classSlice;
