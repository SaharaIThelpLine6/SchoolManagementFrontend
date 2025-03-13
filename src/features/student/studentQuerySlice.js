
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userStudentSlice = createApi({
    reducerPath: 'userStudent',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/students`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getStudent: builder.query({
            query: () => 'view_students',
        })
    }),
});

export const {
    useGetStudentQuery
} = userStudentSlice;
