import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { get } from "react-hook-form";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const dashboardSlice = createApi({
  reducerPath: "dashboard",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["UserWithImages"],
  endpoints: (builder) => ({
    getTotalStudent: builder.query({
      query: () => "total_user?usertype=1",
    }),
    getAllUserWithImage: builder.query({
      query: ({ page = 1, limit = 10 } = {}) =>
        `user_info_image?page=${page}&limit=${limit}`,
      providesTags: ["UserWithImages"],
    }),

    postUserSingleImageUpload: builder.mutation({
      query: (data) => ({
        url: `upload_single`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserWithImages"],
    }),
    postUserMultipleImagesUpload: builder.mutation({
      query: (data) => ({
        url: `upload_multiple`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserWithImages"],
    }),
    getTotalTeacher: builder.query({
      query: () => "total_user?usertype=2",
    }),
    getTotalDoner: builder.query({
      query: () => "total_user?usertype=5",
    }),
    getTotalDue: builder.query({
      query: () => "total_due",
    }),
    getStudentNumberByClass: builder.query({
      query: () => `student_by_class`,
    }),
    getStudentBySession: builder.query({
      query: () => `student_by_session`,
    }),
    postLogin: builder.mutation({
      query: (data) => ({
        url: "/login",
        method: "POST",
        body: data,
      }),
    }),

    postForgetPassword: builder.mutation({
      query: (data) => ({
        url: "/forget_password",
        method: "POST",
        body: data,
      }),
    }),
    postVerifyOTP: builder.mutation({
      query: (data) => ({
        url: "/verify_otp",
        method: "POST",
        body: data,
      }),
    }),
    postResetPassword: builder.mutation({
      query: (data) => ({
        url: "/reset_password",
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('passwordreset_token')}`,
        },
      }),
    }),
    deleteUserSingleImage: builder.mutation({
      query: (ImageID) => ({
        url: `delete_single/${ImageID}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserWithImages"],
    }),
    downloadUserImagesZip: builder.query({
      query: () => ({
        url: 'download_user_images_zip',
        method: 'GET',
        // ⚠️ RTK Query default ভাবে JSON parse করে, তাই blob এর জন্য custom handler লাগবে
        responseHandler: async (response) => {
          // ❌ Server error হলে
          if (!response.ok) {
            let message = `Download failed (${response.status})`;
            try {
              const errData = await response.json();
              message = errData.error || errData.message || message;
            } catch {
              // JSON না হলে default message
            }
            throw new Error(message);
          }

          // ✅ Blob নামাও
          const blob = await response.blob();

          // ✅ Filename বের করো header থেকে
          const contentDisposition = response.headers.get('content-disposition') || '';
          let fileName = 'user_photos.zip';
          const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
          if (match && match[1]) {
            fileName = decodeURIComponent(match[1]);
          }

          return { blob, fileName };
        },
      }),
    }),
  }),
});

export const {
  useGetTotalStudentQuery,
  useGetAllUserWithImageQuery,
  useLazyGetAllUserWithImageQuery,
  useGetTotalTeacherQuery,
  useGetTotalDonerQuery,
  useGetTotalDueQuery,
  useGetStudentNumberByClassQuery,
  useGetStudentBySessionQuery,
  usePostLoginMutation,
  usePostUserSingleImageUploadMutation,
  usePostUserMultipleImagesUploadMutation,
  usePostForgetPasswordMutation,
  usePostVerifyOTPMutation,
  usePostResetPasswordMutation,
  useDeleteUserSingleImageMutation,
  useLazyDownloadUserImagesZipQuery,
} = dashboardSlice;
