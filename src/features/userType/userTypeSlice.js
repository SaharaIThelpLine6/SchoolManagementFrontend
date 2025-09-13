import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userTypeSlice = createApi({
  reducerPath: "userType",
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
  tagTypes: ["UserType", "User", "Madrasah", "LoginUsers"], // Define your tag type
  endpoints: (builder) => ({
    getUserTypes: builder.query({
      query: () => "user_type",
      providesTags: ["UserType"], // This query provides this tag
    }),
    getUserBySearch: builder.query({
      query: ({ search, ClassID, SessionID, UserTypeID }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append("search", search);
        }
        if (ClassID) params.append("ClassID", ClassID);
        if (UserTypeID) params.append("UserTypeID", UserTypeID);
        if (SessionID) params.append("SessionID", SessionID);
        return `search_user?${params.toString()}`;
      },
      providesTags: ["User"],
    }),
    getAllMadrasah: builder.query({
      query: ({ page, limit, search, filter }) => ({
        url: "all_madrasah",
        params: { page, limit, search, filter },
      }),
      providesTags: ["Madrasah"],
    }),
    getMadrasahStats: builder.query({
      query: () => "all_madrasah_stats",
      providesTags: ["Madrasah"],
    }),
    getLoginUsers: builder.query({
      query: () => "get_all_login_users",
      providesTags: ["LoginUsers"],
    }),
    toggleMadrasahAction: builder.mutation({
      query: (id) => ({
        url: `madrasah/${id}/toggle-action`,
        method: "PATCH",
      }),
      invalidatesTags: ["Madrasah"],
    }),
    postLoginUser: builder.mutation({
      query: (data) => ({
        url: "create_login_user",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["LoginUsers"],
    }),
  }),
});

export const {
  useGetUserTypesQuery,
  useGetUserBySearchQuery,
  useGetAllMadrasahQuery,
  useGetMadrasahStatsQuery,
  useToggleMadrasahActionMutation,
  useGetLoginUsersQuery,
  usePostLoginUserMutation
} = userTypeSlice;
