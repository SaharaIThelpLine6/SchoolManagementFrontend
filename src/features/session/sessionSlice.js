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
      query: ({ id, SessionAction }) => ({
        url: `status_update_session/${id}`, // pass id in URL
        method: 'PUT',
        body: { SessionAction }, // only send SessionAction
      }),
      invalidatesTags: ['Sessions'], // ✅ Invalidate list after update
    }),

    deleteSession: builder.mutation({
      query: (id) => ({
        url: `sessions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'], // ✅ Invalidate list after delete
    }),
  }),
});

export const {
  useGetSessionsQuery,
  useGetSessionQuery,
  useAddSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useStatusUpdateSessionMutation
} = sessionSlice;
