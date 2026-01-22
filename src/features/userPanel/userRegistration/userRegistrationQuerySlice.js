import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const userPanelRegistrationUser = createApi({
  reducerPath: 'userpanelUserRegistration',

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

  tagTypes: ['UserPanelUser222', 'LoginUserPanel333'],

  endpoints: (builder) => ({
    postUserPhone: builder.mutation({
      query: (data) => ({
        url: `check_user_phone`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['UserPanelUser222'],
    }),
    postVerifyToken: builder.mutation({
      query: (data) => ({
        url: `verify_otp`,
        method: 'POST',
        body: data,
      }),
    }),

    postUserRegister: builder.mutation({
      query: (data) => ({
        url: `register`,
        method: 'POST',
        body: data,
      }),
    }),
    getSoftwareLinkUserPanel: builder.query({
      query: () => ({
        url: `/get_software_link_user_panel`,
      }),
    }),

    postForgetPass: builder.mutation({
      query: (data) => ({
        url: `forgot_password`,
        method: 'POST',
        body: data,
      })
    }),
    postVerifyResetOtp: builder.mutation({
      query: (data) => ({
        url: `verify_reset_otp`,
        method: 'POST',
        body: data,
      })
    }),
    postResetPassword: builder.mutation({
      query: (data) => ({
        url: `reset_password`,
        method: 'POST',
        body: data,
      })
    }),

    // postLoginUserPanel: builder.mutation({
    //   query: (data) => ({
    //     url: 'login',
    //     method: "POST",
    //     body: data,
    //   })
    // }),

    // verifyUserPanelToken: builder.mutation({
    //   query: (data) => ({
    //     url: `authenticate`,
    //     method: "POST",
    //     body: data,
    //   }),
    // }),
  }),
});

export const {
  usePostUserPhoneMutation,
  usePostVerifyTokenMutation,
  usePostUserRegisterMutation,
  useGetSoftwareLinkUserPanelQuery,
  usePostForgetPassMutation,
  usePostVerifyResetOtpMutation,
  usePostResetPasswordMutation
  // usePostLoginUserPanelMutation,
  // useVerifyUserPanelTokenMutation,
} = userPanelRegistrationUser;

// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// const API_URL = import.meta.env.VITE_SERVER_URL;

// export const userloginQuerySlice = createApi({
//   reducerPath: 'userPanelLogin',
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${API_URL}/api/userpanel/user/`,
//     prepareHeaders: (headers) => {
//       const token = localStorage.getItem('user_panel_token');
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }
//       return headers;
//     },
//   }),
//   tagTypes: ['UserLogins'], // ✅ Add tag for cache invalidation
//   endpoints: (builder) => ({
//     // getSessions: builder.query({
//     //   query: () => 'academic_session',
//     //   // providesTags: ['UserLogins'], // ✅ Refetch when invalidated
//     // }),

//     checkUserPhone: builder.mutation({
//       query: (data) => ({
//         url: 'check_user_phone',
//         method: 'POST',
//         body: data,
//       }),
//       invalidatesTags: ['UserLogins'],
//     }),

//   }),
// });

// export const {
//   useCheckUserPhoneMutation,
// } = userloginQuerySlice;
