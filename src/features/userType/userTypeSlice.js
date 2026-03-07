import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userTypeSlice = createApi({
  reducerPath: 'userType',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/users`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UserType', 'User', 'Madrasah', 'LoginUsers', 'UserCodeCheck'], // Define your tag type
  endpoints: (builder) => ({
    getUserTypes: builder.query({
      query: () => 'user_type',
      providesTags: ['UserType'], // This query provides this tag
    }),
    getUserCodeCheck: builder.query({
      query: (UserTypeID) => `user_code_check?UserTypeID=${UserTypeID}`,
      providesTags: ['UserCodeCheck'],
    }),

    getUserBySearch: builder.query({
      query: ({ search, ClassID, SessionID, UserTypeID }) => {
        const params = new URLSearchParams();
        if (search) {
          params.append('search', search);
        }
        if (ClassID) params.append('ClassID', ClassID);
        if (UserTypeID) params.append('UserTypeID', UserTypeID);
        if (SessionID) params.append('SessionID', SessionID);
        return `search_user?${params.toString()}`;
      },
      providesTags: ['User'],
    }),
    getAllMadrasah: builder.query({
      query: ({ page, limit, search, filter }) => ({
        url: 'all_madrasah',
        params: { page, limit, search, filter },
      }),
      providesTags: ['Madrasah'],
    }),
    getCurrentMadrasah: builder.query({
      query: (school_id) => `madrasah/${school_id}`,
      providesTags: ['Madrasah'],
    }),
    getMadrasahStats: builder.query({
      query: () => 'all_madrasah_status',
      providesTags: ['Madrasah'],
    }),
    getLoginUsers: builder.query({
      query: () => 'get_all_login_users',
      providesTags: ['LoginUsers'],
    }),
    toggleMadrasahAction: builder.mutation({
      query: (id) => ({
        url: `madrasah/${id}/toggle-action`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Madrasah'],
    }),
    postLoginUser: builder.mutation({
      query: (data) => ({
        url: 'create_login_user',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LoginUsers'],
    }),
    updateLoginUserNameChange: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_login_user_name/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LoginUsers'],
    }),
    updateLoginUserTypeChange: builder.mutation({
      query: ({ id, permissionTypeId, school_id }) => ({
        url: `update_login_user_type/${id}`,
        method: 'PUT',
        body: { permissionTypeId, school_id },
      }),
      invalidatesTags: ['LoginUsers'],
    }),
    updateLoginUserPasswordChange: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_login_user_password/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LoginUsers'],
    }),
    updateLoginUserStatusChange: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_login_user_status/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['LoginUsers'],
    }),
    postUser: builder.mutation({
      query: (data) => ({
        url: 'insert_user_info',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, userTypeID }) => {
        let url = `/?page=${page}&limit=${limit}`;
        if (userTypeID) {
          url += `&usertype=${userTypeID}`;
        }
        return {
          url,
          method: 'GET',
        };
      },
      providesTags: ['Users'],
    }),
    //

    updateUser: builder.mutation({
      query: ({ id, payload }) => ({
        url: `update_user_info/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Users'],
    }),
    getSingleUser: builder.query({
      query: (id) => `get_single_user/${id}`,
      providesTags: ['Users'],
    }),
    getFilteredUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        userTypeID,
        filterTypeId,
        filterValue,
      }) => {
        const params = new URLSearchParams();

        params.append('page', page);
        params.append('limit', limit);

        if (userTypeID) params.append('userTypeID', userTypeID);
        if (filterTypeId) params.append('filterTypeId', filterTypeId);
        if (filterValue) params.append('filterValue', filterValue);

        return `/user_filter?${params.toString()}`;
      },
      providesTags: ['Users'],
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
  usePostLoginUserMutation,
  useUpdateLoginUserNameChangeMutation,
  useUpdateLoginUserPasswordChangeMutation,
  useUpdateLoginUserStatusChangeMutation,
  useUpdateLoginUserTypeChangeMutation,
  useGetCurrentMadrasahQuery,
  useGetUserCodeCheckQuery,
  usePostUserMutation,
  useUpdateUserMutation,
  useGetAllUsersQuery,
  useGetSingleUserQuery,
  useGetFilteredUsersQuery
} = userTypeSlice;
