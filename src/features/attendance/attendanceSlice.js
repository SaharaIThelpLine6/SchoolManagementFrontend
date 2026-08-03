import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const attendanceSlice = createApi({
  reducerPath: 'attendance',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/attendance`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Attendance', "TimeShifting", "TimeSwitch"],
  endpoints: (builder) => ({
    // ================= Get All Users =================
    getAllUserForAttendances: builder.query({
      query: ({ sessionId, userTypeId, classId, subClassId }) => {
        const params = new URLSearchParams();

        if (classId) params.append("classId", classId);
        if (subClassId) params.append("subClassId", subClassId);

        return {
          url: `/get_all_users/${Number(userTypeId) === 2 ? 0 : sessionId
            }/${userTypeId}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Attendance"],
    }),
    getAllUserListAttendances: builder.query({
      query: ({ userTypeId, sessionId, classId }) => {
        const params = new URLSearchParams();

        if (sessionId) {
          params.append('sessionId', sessionId);
        }

        if (classId) {
          params.append('classId', classId);
        }

        return {
          url: `/attendance_users/${userTypeId}${params.toString() ? `?${params.toString()}` : ''
            }`,
          method: 'GET',
        };
      },
      providesTags: ['Attendance'],
    }),
    usersListCreate: builder.mutation({
      query: (body) => ({
        url: "/users_list_create",
        method: "POST",
        body,
      }),
    }),
    getTimeShiftings: builder.query({
      query: () => '/time_shiftings',
      providesTags: ['TimeShifting'],
    }),
    getTimeCheckTypes: builder.query({
      query: () => '/time_check_types',
      providesTags: ['TimeShifting'],
    }),
    getTimeShiftingById: builder.query({
      query: (id) => ({
        url: `/time_shifting/${id}`,
        method: 'GET',
      }),
      providesTags: ['TimeShifting'],
    }),
    createTimeShifting: builder.mutation({
      query: (body) => ({
        url: '/time_shifting_create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TimeShifting'],
    }),

    updateTimeShifting: builder.mutation({
      query: ({ ...body }) => ({
        url: `/time_shifting_update`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['TimeShifting'],
    }),

    deleteTimeShifting: builder.mutation({
      query: (id) => ({
        url: `/time_shifting_delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeShifting'],
    }),
    getTimeSwitches: builder.query({
      query: (shiftId) => ({
        url: `/time_switches${shiftId ? `?shiftId=${shiftId}` : ''}`,
        method: 'GET',
      }),
      providesTags: ['TimeSwitch'],
    }),
    createTimeSwitch: builder.mutation({
      query: (body) => ({
        url: '/time_switch_create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TimeSwitch'],
    }),

    updateTimeSwitch: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/time_switch_update/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['TimeSwitch'],
    }),

    deleteTimeSwitch: builder.mutation({
      query: (id) => ({
        url: `/time_switch_delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeSwitch'],
    }),
  }),
});

// Export hooks
export const {
  useGetAllUserForAttendancesQuery,
  useUsersListCreateMutation,
  useGetAllUserListAttendancesQuery,
  useGetTimeShiftingsQuery,
  useCreateTimeShiftingMutation,
  useUpdateTimeShiftingMutation,
  useDeleteTimeShiftingMutation,
  useGetTimeShiftingByIdQuery,
  useGetTimeCheckTypesQuery,
  useGetTimeSwitchesQuery,
  useCreateTimeSwitchMutation,
  useUpdateTimeSwitchMutation,
  useDeleteTimeSwitchMutation,
} = attendanceSlice;