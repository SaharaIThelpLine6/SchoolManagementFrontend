import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const API_URL = import.meta.env.VITE_SERVER_URL;
export const panelNotificationQuerySlice = createApi({
    reducerPath: 'panelNotificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/userpanel/notification`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('user_panel_token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        subscribeNotification: builder.mutation({
            query: (notification) => ({
                url: '/subscribe',
                method: 'POST',
                body: notification,
            }),
            invalidatesTags: ['Notification'],
        }),
        viewNotification: builder.mutation({
            query: (notification) => ({
                url: '/upadat_notification',
                method: 'POST',
                body: notification,
            }),
            invalidatesTags: ['Notification'],
        }),

        notificationList: builder.query({
            query: (sessionId) => `notification_list?sessionId=${sessionId}`,
            providesTags: ['Notification']
        }),
    }),
});

export const {
    useSubscribeNotificationMutation,
    useViewNotificationMutation,
    useNotificationListQuery
} = panelNotificationQuerySlice;