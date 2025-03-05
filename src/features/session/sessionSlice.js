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
    endpoints: (builder) => ({
        getSessions: builder.query({
            query: () => 'view_sessions',
        }),
        getSession: builder.query({
            query: (id) => `view_session/${id}`,
        }),
        addSession: builder.mutation({
            query: (newSession) => ({
                url: 'sessions',
                method: 'POST',
                body: newSession,
            }),
        }),
        updateSession: builder.mutation({
            query: ({ id, ...updatedSession }) => ({
                url: `sessions/${id}`,
                method: 'PUT',
                body: updatedSession,
            }),
        }),
        deleteSession: builder.mutation({
            query: (id) => ({
                url: `sessions/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetSessionsQuery,
    useGetSessionQuery,
    useAddSessionMutation,
    useUpdateSessionMutation,
    useDeleteSessionMutation,
} = sessionSlice;
