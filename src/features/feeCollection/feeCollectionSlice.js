import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_SERVER_URL;

export const feeCollectionSlice = createApi({
    reducerPath: 'feeCollection',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/accounts`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getFees: builder.query({
            query: () => 'view_userfee',
        }),
        getPaymentType: builder.query({
            query: () => 'view_payment_type',
        }),
        getSubLedger: builder.query({
            query: (id) => `view_subledger/${id}`,
        }),
        getFee: builder.query({
            query: ({ sessionID, classID, SFGNID }) => `view_student_fee/${sessionID}/${classID}/${SFGNID}`,
        }), 
        getDueFee: builder.query({
            query: ({ sessionID, classID, SFGNID, AdmissionID }) => `view_student_due_fee/${sessionID}/${classID}/${SFGNID}/${AdmissionID}`,
        }),        
        addFee: builder.mutation({
            query: (newFee) => ({
                url: 'fee_insert',
                method: 'POST',
                body: newFee,
            }),
        }),
        updateFee: builder.mutation({
            query: ({ id, ...updatedFee }) => ({
                url: `fees/${id}`,
                method: 'PUT',
                body: updatedFee,
            }),
        }),
        deleteFee: builder.mutation({
            query: (id) => ({
                url: `fees/${id}`,
                method: 'DELETE',
            }),
        }),
    }),
});

export const {
    useGetFeesQuery,
    useGetPaymentTypeQuery,
    useGetSubLedgerQuery,
    useGetFeeQuery,
    useGetDueFeeQuery,
    useAddFeeMutation,
    useUpdateFeeMutation,
    useDeleteFeeMutation,
} = feeCollectionSlice;
