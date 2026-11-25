// src/features/attendance/attendanceDeviceSlice.js
// Madrasha's own ZKTeco ADMS devices -> its Time_IP table (backend routes/attendanceDevices.js)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const attendanceDeviceSlice = createApi({
  reducerPath: "attendanceDevice",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/attendance-devices`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["AttendanceDevice", "DeviceUpload", "DeviceUsers"],
  endpoints: (builder) => ({
    getAttendanceDevices: builder.query({
      query: () => "/",
      providesTags: ["AttendanceDevice"],
    }),

    addAttendanceDevice: builder.mutation({
      query: (body) => ({ url: "/", method: "POST", body }),
      invalidatesTags: ["AttendanceDevice"],
    }),

    updateAttendanceDevice: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/${id}`, method: "PUT", body }),
      invalidatesTags: ["AttendanceDevice"],
    }),

    removeAttendanceDevice: builder.mutation({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: ["AttendanceDevice"],
    }),

    // Send users (PIN = UserID) to the device
    uploadUsersToDevice: builder.mutation({
      query: ({ id, userIds }) => ({ url: `/${id}/upload-users`, method: "POST", body: { userIds } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "DeviceUpload", id }, { type: "DeviceUsers", id }],
    }),

    getDeviceUploadStatus: builder.query({
      query: (id) => `/${id}/upload-status`,
      providesTags: (_result, _error, id) => [{ type: "DeviceUpload", id }],
    }),

    // Which users are on the device: { users: { [UserID]: { status, at } }, lastSync, syncing }
    getDeviceUsers: builder.query({
      query: (id) => `/${id}/device-users`,
      providesTags: (_result, _error, id) => [{ type: "DeviceUsers", id }],
    }),

    // Ask the device for its user list (finds users deleted on the device)
    syncDeviceUsers: builder.mutation({
      query: (id) => ({ url: `/${id}/sync-users`, method: "POST" }),
      invalidatesTags: (_result, _error, id) => [{ type: "DeviceUsers", id }],
    }),
  }),
});

export const {
  useGetAttendanceDevicesQuery,
  useAddAttendanceDeviceMutation,
  useUpdateAttendanceDeviceMutation,
  useRemoveAttendanceDeviceMutation,
  useUploadUsersToDeviceMutation,
  useGetDeviceUploadStatusQuery,
  useGetDeviceUsersQuery,
  useSyncDeviceUsersMutation,
} = attendanceDeviceSlice;
