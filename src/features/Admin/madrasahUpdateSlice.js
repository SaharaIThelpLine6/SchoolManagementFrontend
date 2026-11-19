// src/features/Admin/madrasahUpdateSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const madrasahUpdateSlice = createApi({
  reducerPath: 'madrasahUpdate',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/admin/madrasha-update-management`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UpdateTemplate', 'UpdateType', 'UpdateEntry'],
  endpoints: (builder) => ({
    // ---------- Template ----------
    getUpdateTemplates: builder.query({
      query: () => ({
        url: '/templates',
        method: 'GET',
      }),
      providesTags: ['UpdateTemplate'],
    }),

    createUpdateTemplate: builder.mutation({
      query: (body) => ({
        url: '/templates',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpdateTemplate'],
    }),

    updateUpdateTemplate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/templates/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UpdateTemplate'],
    }),

    deleteUpdateTemplate: builder.mutation({
      query: (id) => ({
        url: `/templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UpdateTemplate', 'UpdateEntry'],
    }),

    // ---------- Type ----------
    getTemplateTypes: builder.query({
      query: (templateId) => ({
        url: `/templates/${templateId}/types`,
        method: 'GET',
      }),
      providesTags: ['UpdateType'],
    }),

    createTemplateType: builder.mutation({
      query: ({ templateId, ...body }) => ({
        url: `/templates/${templateId}/types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpdateType', 'UpdateTemplate', 'UpdateEntry'],
    }),

    updateTemplateType: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/types/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['UpdateType', 'UpdateTemplate', 'UpdateEntry'],
    }),

    deleteTemplateType: builder.mutation({
      query: (id) => ({
        url: `/types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['UpdateType', 'UpdateTemplate', 'UpdateEntry'],
    }),

    // ---------- Entry ----------
    getTemplateEntries: builder.query({
      query: ({ templateId, page = 1, limit = 50, search, typeId }) => ({
        url: `/templates/${templateId}/entries`,
        method: 'GET',
        params: {
          page,
          limit,
          search: search || undefined,
          typeId: typeId || undefined,
        },
      }),
      providesTags: ['UpdateEntry'],
    }),

    getTemplateStats: builder.query({
      query: (templateId) => ({
        url: `/templates/${templateId}/stats`,
        method: 'GET',
      }),
      providesTags: ['UpdateEntry'],
    }),

    saveTemplateEntry: builder.mutation({
      query: (body) => ({
        url: '/entries',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpdateEntry'],
    }),

    saveTemplateEntriesBulk: builder.mutation({
      query: (body) => ({
        url: '/entries/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['UpdateEntry'],
    }),
  }),
});

export const {
  useGetUpdateTemplatesQuery,
  useCreateUpdateTemplateMutation,
  useUpdateUpdateTemplateMutation,
  useDeleteUpdateTemplateMutation,
  useGetTemplateTypesQuery,
  useCreateTemplateTypeMutation,
  useUpdateTemplateTypeMutation,
  useDeleteTemplateTypeMutation,
  useGetTemplateEntriesQuery,
  useGetTemplateStatsQuery,
  useSaveTemplateEntryMutation,
  useSaveTemplateEntriesBulkMutation,
} = madrasahUpdateSlice;