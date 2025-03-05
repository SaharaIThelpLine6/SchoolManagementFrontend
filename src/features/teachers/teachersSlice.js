import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const teachersSlice = createApi({
    reducerPath: 'teachers',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/teachers`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getDesignation: builder.query({
            query: () => 'designation',
        }),
        getTeacherInfo: builder.query({
            query: () => 'teacher_info',
        }),
    }),
});

export const {
    useGetDesignationQuery,
    useGetTeacherInfoQuery,
} = teachersSlice;