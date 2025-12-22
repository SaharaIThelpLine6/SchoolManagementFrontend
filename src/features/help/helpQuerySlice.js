import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const helpQuerySlice = createApi({
  reducerPath: 'helpQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/help`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['videoLinks'],
  endpoints: (builder) => ({
    // GET endpoints
    getVideoLinkList: builder.query({
      query: () => 'video_tutorials',
      providesTags: ['videoLinks'],
    })
  }),
});

// Export all hooks
export const {
  useGetVideoLinkListQuery
} = helpQuerySlice;
