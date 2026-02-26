import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userPanelVerifyUser = createApi({
  reducerPath: 'userPanelVerifyUser',

  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/userpanel/auth/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('user_panel_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    postLoginUserPanel: builder.mutation({
      query: (data) => ({
        url: 'login',
        method: "POST",
        body: data,
      })
    }),

    verifyUserPanelToken: builder.mutation({
      query: (data) => ({
        url: `authenticate`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  usePostLoginUserPanelMutation,
  useVerifyUserPanelTokenMutation,
} = userPanelVerifyUser;
