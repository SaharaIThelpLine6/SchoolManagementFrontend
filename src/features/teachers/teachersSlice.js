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
  tagTypes: ['Teacher', "Teacher_Subject"], // define tag type
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
      query: ({ SessionID, ExamID, SubClassID, SubjectID } = {}) => {
        const params = new URLSearchParams();
        if (SessionID) params.append("SessionID", SessionID);
        if (ExamID) params.append("ExamID", ExamID);
        if (SubClassID) params.append("SubClassID", SubClassID);
        if (SubjectID) params.append("SubjectID", SubjectID);

        return `/teacher_subject/filter?${params.toString()}`;
      },
      providesTags: ["TeacherSubjects"],
    }),
    updateTeacherSubject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/teacher_subject/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Teacher_Subject"],
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
  useUpdateTeacherSubjectMutation,
  useGetTeacherSubjectsByFilterQuery,
  useGetTeacherLastSerialQuery,
  usePostInsertTeacherInfoMutation,
  useGetTeacherInfoListQuery,
  useUpdateTeacherMutation,
  useGetFilteredTeachersQuery,
  useDeleteTeacherSubjectMutation
} = teachersSlice;
