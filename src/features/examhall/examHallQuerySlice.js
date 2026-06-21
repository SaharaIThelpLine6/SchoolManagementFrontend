import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const examHallSlice = createApi({
  reducerPath: 'examHall',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/hall`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ExamHall'],
  endpoints: (builder) => ({
    hallEntry: builder.mutation({
      query: (body) => ({
        url: `hall_entry`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamHall'],
    }),
    hallUpdate: builder.mutation({
      query: (body) => ({
        url: `hall_update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ExamHall'],
    }),
    getExamHallList: builder.query({
      query: () => `hall_list`,
      providesTags: ['ExamHall'],
    }),
    getExamHallDetails: builder.query({
      query: (id) => `hall_entry/${id}`,
      providesTags: ['ExamHallDetails'],
    }),

  }),
});

export const {
  useHallEntryMutation,
  useHallUpdateMutation,
  useGetExamHallListQuery,
  useGetExamHallDetailsQuery
} = examHallSlice;
