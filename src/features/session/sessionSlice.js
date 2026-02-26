import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const sessionSlice = createApi({
  reducerPath: 'session',
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
  tagTypes: ['Sessions'], // ✅ Add tag for cache invalidation
  endpoints: (builder) => ({
    getSessions: builder.query({
      query: () => 'academic_session',
      providesTags: ['Sessions'], // ✅ Refetch when invalidated
    }),

    getSession: builder.query({
      query: (id) => `get_session/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sessions', id }],
    }),

    addSession: builder.mutation({
      query: (newSession) => ({
        url: 'insert_session',
        method: 'POST',
        body: newSession,
      }),
      invalidatesTags: ['Sessions'], // ✅ Invalidate list after add
    }),

    updateSession: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_session/${id}`,
        method: 'PUT',
        body: data, // send updated fields directly
      }),
      invalidatesTags: ['Sessions'],
    }),

    statusUpdateSession: builder.mutation({
      query: ({ id, SessionStatus }) => ({
        url: `status_update_session/${id}`, // pass id in URL
        method: 'PUT',
        body: { SessionStatus }, // only send SessionStatus
      }),
      invalidatesTags: ['Sessions'], // ✅ Invalidate list after update
    }),

    deleteSession: builder.mutation({
      query: (id) => ({
        url: `delete_session/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'], // ✅ Invalidate list after delete
    }),

    // Sub Classes
    getSubclasses: builder.query({
      query: () => 'sub_classes',
      providesTags: ['SubClasses'],
    }),
    getLastSubclass: builder.query({
      query: () => 'sub_classes/last_serial',
      providesTags: ['SubClasses'],
    }),
    postSubClass: builder.mutation({
      query: (data) => ({
        url: 'insert_sub_class',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SubClasses'], // ✅ Invalidate list after add
    }),
    updateSubClass: builder.mutation({
      query: ({ id, data }) => ({
        url: `update_sub_class/${id}`,
        method: 'PUT',
        body: data, // send updated fields directly
      }),
      invalidatesTags: ['SubClasses'],
    }),
    deleteSubclass: builder.mutation({
      query: (id) => ({
        url: `delete_sub_class/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SubClasses'], // ✅ Invalidate list after delete
    }),
    getSubclass: builder.query({
      query: (id) => `get_sub_class/${id}`,
      providesTags: (result, error, id) => [{ type: 'Sessions', id }],
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionQuery,
  useAddSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useStatusUpdateSessionMutation,
  useGetSubclassesQuery,
  usePostSubClassMutation,
  useUpdateSubClassMutation,
  useDeleteSubclassMutation,
  useGetSubclassQuery,
  useGetLastSubclassQuery
} = sessionSlice;
