import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const VideoTutorialQuerySlice = createApi({
  reducerPath: 'helpQuery',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/videotutorial`,
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
    getVideoTutorial: builder.query({
      query: (VType) => ({
        url: 'video_tutorials',
        params: VType ? { VType } : undefined,
      }),
      providesTags: ['videoLinks'],
    }),
  }),
});

// Export all hooks
export const {
  useGetVideoTutorialQuery
} = VideoTutorialQuerySlice;
