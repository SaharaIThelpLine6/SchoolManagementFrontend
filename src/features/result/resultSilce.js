import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_URL = import.meta.env.VITE_SERVER_URL;

export const resultSilce = createApi({
  reducerPath: "result",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_URL}/api/result`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["ExamList", "Result", "StudentMarksheetNote"],
  endpoints: (builder) => ({
    getExamList: builder.query({
      query: ({ session_id, exam_id, subclass_id } = {}) => {
        const params = new URLSearchParams();

        if (session_id) params.append("session_id", session_id);
        if (exam_id) params.append("exam_id", exam_id);
        if (subclass_id) params.append("subclass_id", subclass_id);

        const queryString = params.toString();
        return queryString ? `exam_list?${queryString}` : "exam_list";
      },
      providesTags: ["ExamList"],
    }),
    getUserResult: builder.query({
      query: ({ session_id, exam_id, subclass_id } = {}) => {
        const params = new URLSearchParams();

        if (session_id) params.append("session_id", session_id);
        if (exam_id) params.append("exam_id", exam_id);
        if (subclass_id) params.append("subclass_id", subclass_id);

        const queryString = params.toString();
        return queryString
          ? `get_user_result?${queryString}`
          : "get_user_result";
      },
      providesTags: ["Result"],
    }),

    updateExamListStatusUpdate: builder.mutation({
      query: ({ id, ...updatedData }) => ({
        url: `exam_list_status_update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: ["ExamList"],
    }),
    updateAndPostResult: builder.mutation({
      query: (body) => ({
        url: `update_result`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Result", "getResultReportData"],
    }),
    getUserSingleResult: builder.query({
      query: ({ session_id, exam_id, class_id, user_id }) => {
        let url = `students/${session_id}/${exam_id}/${class_id}`;
        if (user_id) {
          url += `?user_id=${user_id}`;
        }
        return url;
      },
      providesTags: ["Result"],
    }),
    getResultReportData: builder.query({
      query: ({ session_id, exam_id, subclass_id, report_data }) => {
        const params = new URLSearchParams();
        if (report_data) params.append("reportid", report_data);
        if (session_id) params.append("sessionid", session_id);
        if (exam_id) params.append("examid", exam_id);
        if (subclass_id) params.append("subclassid", subclass_id);


        const queryString = params.toString();
        return queryString ? `result_report?${queryString}` : "result_report";
      },
      providesTags: ["getResultReportData"],
    }),
    getMarkSheet: builder.query({
      query: ({ sessionid, examid, classid, recordName, UserCode1, UserCode2 }) => ({
        url: "/mark-sheet",
        method: "GET",
        params: { sessionid, examid, classid, recordName, UserCode1, UserCode2 },
      }),
      providesTags: (result, error, arg) => [
        { type: "MarkSheet", id: `${arg.sessionid}-${arg.examid}-${arg.classid}` },
      ],
    }),
    getLabelNameLists: builder.query({
      query: () => `get_label_names`,
    }),

    getExamDivisionName: builder.query({
      query: ({ ExamType }) => ({
        url: '/get_exam_division_name',
        method: 'GET',
        params: {
          ExamType,
        },
      }),
    }),

    // GET: /get_exam_division_note/:ExamType/:ID
    getExamDivisionNote: builder.query({
      query: ({ ExamType, ID }) => ({
        url: `/get_exam_division_note/${ExamType}/${ID}`, // apnar baseUrl/prefix onujayi
        method: 'GET',
      }),
      providesTags: (result, error, { ExamType, ID }) => [
        { type: 'ExamDivisionNote', id: `${ExamType}-${ID}` },
      ],
    }),

    // PUT: /update_exam_division_note
    updateExamDivisionNote: builder.mutation({
      query: ({ DivisionID, ExamType, Note }) => ({
        url: `/update_exam_division_note`,
        method: 'PUT',
        body: { DivisionID, ExamType, Note },
      }),
      invalidatesTags: (result, error, { ExamType, DivisionID }) => [
        { type: 'ExamDivisionNote', id: `${ExamType}-${DivisionID}` },
      ],
    }),
  }),
});

export const {
  useGetExamListQuery,
  useGetUserResultQuery,
  useUpdateExamListStatusUpdateMutation,
  useUpdateAndPostResultMutation,
  useGetUserSingleResultQuery,
  useGetResultReportDataQuery,
  useGetMarkSheetQuery,
  useGetLabelNameListsQuery,

  useGetExamDivisionNameQuery,
  useGetExamDivisionNoteQuery,
  useUpdateExamDivisionNoteMutation,
} = resultSilce;
