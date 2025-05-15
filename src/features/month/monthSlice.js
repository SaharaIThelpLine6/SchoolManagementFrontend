import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const monthSlice = createApi({
    reducerPath: 'month',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getMonthList: builder.query({
            query: (query) => `settings/month${query ? `?${query}` : ''}`,
        }),
    }),
});

export const {
    useGetMonthListQuery,
} = monthSlice;
