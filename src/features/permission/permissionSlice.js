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
  tagTypes: ['Permissions'], // Define your tag type
  endpoints: (builder) => ({
    getAllUserPermissions: builder.query({
      query: () => "user_permission_list",
      providesTags: ['Permissions'], // This query provides this tag
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

export const { useGetAllUserPermissionsQuery } = permissionSlice;