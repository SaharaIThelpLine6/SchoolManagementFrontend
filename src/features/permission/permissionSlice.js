import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const permissionSlice = createApi({
  reducerPath: "permissions",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/permissions`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Permissions"], // Define your tag type
  endpoints: (builder) => ({
    getAllUserPermissions: builder.query({
      query: () => "user_permission_list",
      providesTags: ["Permissions"], // This query provides this tag
    }),
    // ================== Get All Permissions (with search + pagination) ==================
    getAllUserPermissionListViews: builder.query({
      query: ({ page = 1, limit = 10, search = "", id }) =>
        `user_permission_lists?page=${page}&limit=${limit}&search=${search}&id=${id}`,
      providesTags: ["PermissionLists"],
    }),

    // ================== Update Permission Toggle ==================
    updatePermissionToggle: builder.mutation({
      query: (body) => ({
        url: "permission_toggle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PermissionLists"],
    }),
    // ================== Update Permission Checked All ==================
    updatePermissionCheckedAll: builder.mutation({
      query: (body) => ({
        url: "permission_checked_all",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PermissionLists"],
    }),
    // updateInstitutionInfo: builder.mutation({
    //   query: (body) => ({
    //     url: `institution_info`,
    //     method: "PUT",
    //     body,
    //   }),
    //   invalidatesTags: ['InstitutionInfo'], // This mutation invalidates this tag
    // }),
  }),
});

export const { useGetAllUserPermissionsQuery, useGetAllUserPermissionListViewsQuery, useUpdatePermissionToggleMutation, useUpdatePermissionCheckedAllMutation } = permissionSlice;
