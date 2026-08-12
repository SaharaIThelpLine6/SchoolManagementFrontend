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
  tagTypes: ['Attendance', "TimeShifting", "TimeSwitch", "TimeSettings"],
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
      invalidatesTags: ['Attendance'],
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
      query: ({ ...body }) => ({
        url: `/time_switch_update`,
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

    createTimeSetting: builder.mutation({
      query: (data) => ({
        url: '/time_settings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TimeSettings'],
    }),

    deleteTimeSetting: builder.mutation({
      query: (id) => ({
        url: `/time_settings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TimeSettings'],
    }),

    // ===================== Get Time Settings =====================
    getTimeSettings: builder.query({
      query: ({
        UserTypeID,
        SessionID,
        ClassID,
        ResidentialID,
        ShiftID,
      }) => {
        const params = new URLSearchParams();

        if (UserTypeID) params.append("UserTypeID", UserTypeID);
        if (SessionID) params.append("SessionID", SessionID);
        if (ClassID) params.append("ClassID", ClassID);
        if (ResidentialID) params.append("ResidentialID", ResidentialID);
        if (ShiftID) params.append("ShiftID", ShiftID);

        return {
          url: `/time_settings?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["TimeSettings"],
    }),
    // ===================== Get Time Settings filtered =====================
    getTimeSettingsFiltered: builder.query({
      query: ({
        UserTypeID,
        SessionID,
        ClassID,
        ShiftID,
        ResidentialStatusId,
        UserCode,
      }) => {
        const params = new URLSearchParams();

        if (UserTypeID) params.append("UserTypeID", UserTypeID);
        if (SessionID) params.append("SessionID", SessionID);
        if (ClassID) params.append("ClassID", ClassID);
        if (ShiftID) params.append("ShiftID", ShiftID);
        if (ResidentialStatusId)
          params.append("ResidentialStatusId", ResidentialStatusId);
        if (UserCode) params.append("UserCode", UserCode);

        return `/time_settings_filtered?${params.toString()}`;
      },
      providesTags: ["TimeSettings"],
    }),
    getAttendanceLists: builder.query({
      query: () => ({
        url: `/get_attendance_list`,
        method: 'GET',
      }),
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
  useGetTimeSettingsQuery,
  useCreateTimeSettingMutation,
  useDeleteTimeSettingMutation,
  useGetTimeSettingsFilteredQuery,
  useGetAttendanceListsQuery
} = attendanceSlice;