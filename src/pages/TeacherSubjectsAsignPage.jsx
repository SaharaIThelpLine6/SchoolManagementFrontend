import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import DefaultSelect from "../components/Forms/DefaultSelect";

import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetExamClassSubjectsQuery } from "../features/class/classQuerySlice";
import {
  useGetTeachersInfoQuery,
  useGetTeacherSubjectsQuery,
  usePostSubjectToTeacherMutation,
  useUpdateTeacherSubjectMutation,
  useDeleteTeacherSubjectMutation,
} from "../features/teachers/teachersSlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";

const TeacherSubjectsAsignPage = ({ id }) => {
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: "",
      SubClassID: "",
      ExamID: "",
      TeacherID: "",
      SubjectID: "",
    },
  });

  const { handleSubmit, reset, watch } = methods;
  const [ExamID, SessionID, TeacherID] = watch([
    "ExamID",
    "SessionID",
    "TeacherID",
  ]);

  // =========================
  // EDIT STATE
  // =========================
  const [editingId, setEditingId] = useState(null);
  const isEditMode = editingId !== null;

  // =========================
  // SELECTED STATE
  // =========================
  const [selectedItems, setSelectedItems] = useState([]);

  // =========================
  // MUTATIONS
  // =========================
  const [postSubjectToTeacher, { isLoading: isPostLoading }] =
    usePostSubjectToTeacherMutation();
  const [updateSubjectToTeacher, { isLoading: isUpdateLoading }] =
    useUpdateTeacherSubjectMutation();
  const [deleteSubjectToTeacher, { isLoading: isDeleteLoading }] =
    useDeleteTeacherSubjectMutation();

  const isSaving = isPostLoading || isUpdateLoading || isDeleteLoading;

  // =========================
  // QUERIES
  // =========================
  const { data: teachers = [] } = useGetTeachersInfoQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const { data: teacherSubjects = [], refetch: refetchTeacherSubjects } =
    useGetTeacherSubjectsQuery();

  const {
    data: ExamClassSubjectsData,
    isLoading: ExamClassSubjectsLoading,
    isFetching: ExamClassSubjectsFetching,
    error: ExamClassSubjectsError,
  } = useGetExamClassSubjectsQuery(
    { SessionID, ExamID },
    { skip: !SessionID || !ExamID }
  );

  // =========================
  // SAFE REFETCH (fix: Cannot refetch a query that has not been started yet)
  // =========================
  const safeRefetchTeacherSubjects = async () => {
    try {
      if (typeof refetchTeacherSubjects === "function") {
        await refetchTeacherSubjects();
      }
    } catch (err) {
      // Query not started / unmounted — ignore silently
      console.warn("refetchTeacherSubjects skipped:", err?.message);
    }
  };

  // =========================
  // ASSIGNED INFO
  // =========================
  const getAssignedInfo = (subClassID, subjectID) => {
    const list = teacherSubjects?.data || teacherSubjects || [];

    const found = list.find(
      (item) =>
        Number(item.SubClassID) === Number(subClassID) &&
        Number(item.SubjectID) === Number(subjectID)
    );

    if (!found) return { assigned: false };

    const isSameTeacher =
      TeacherID && Number(found.TeacherID) === Number(TeacherID);

    return {
      assigned: true,
      isSameTeacher,
      teacherName: found.TeacherName,
      teacherID: found.TeacherID,
      recordID: found.ID,
      record: found,
    };
  };

  // =========================
  // CURRENT TEACHER'S ASSIGNED SUBJECTS (for TOP BAR)
  // =========================
  const currentTeacherAssigned = (() => {
    if (!TeacherID) return [];
    const list = teacherSubjects?.data || teacherSubjects || [];

    return list
      .filter((item) => Number(item.TeacherID) === Number(TeacherID))
      .map((item) => ({
        ID: item.ID,
        TeacherID: item.TeacherID,
        SubClassID: item.SubClassID,
        SubClass: item.SubClass || item.SubClassName || item.SubClassID,
        SubjectID: item.SubjectID,
        SubjectName: item.SubjectName || item.SubjectID,
      }));
  })();

  // =========================
  // HANDLE SUBJECT CLICK
  // =========================
  const handleSubjectToggle = (subClass, subject) => {
    const info = getAssignedInfo(subClass.SubClassID, subject.SubjectID);

    if (info.assigned && !info.isSameTeacher) {
      Swal.fire({
        icon: "warning",
        title: "ইতিমধ্যে বরাদ্দ করা হয়েছে",
        html: `এই বিষয়টি ইতিমধ্যে <b>${info.teacherName}</b> এর কাছে বরাদ্দ করা আছে।`,
      });
      return;
    }

    // Same teacher already assigned → cannot re-select here
    if (info.assigned && info.isSameTeacher) {
      return;
    }

    const exists = selectedItems.some(
      (item) =>
        item.SubClassID === subClass.SubClassID &&
        item.SubjectID === subject.SubjectID
    );

    if (exists) {
      setSelectedItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.SubClassID === subClass.SubClassID &&
              item.SubjectID === subject.SubjectID
            )
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          SubClassID: subClass.SubClassID,
          SubClass: subClass.SubClass,
          SubjectID: subject.SubjectID,
          SubjectName: subject.SubjectName,
        },
      ]);
    }
  };

  // =========================
  // REMOVE SELECTED
  // =========================
  const handleRemoveSelected = (subClassID, subjectID) => {
    setSelectedItems((prev) =>
      prev.filter(
        (item) =>
          !(item.SubClassID === subClassID && item.SubjectID === subjectID)
      )
    );
  };

  // =========================
  // CHECK IF SELECTED
  // =========================
  const isSelected = (subClassID, subjectID) => {
    return selectedItems.some(
      (item) => item.SubClassID === subClassID && item.SubjectID === subjectID
    );
  };

  // =========================
  // CANCEL EDIT
  // =========================
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // =========================
  // DELETE ASSIGNED SUBJECT (from TOP BAR — direct delete)
  // =========================
  const handleDeleteAssigned = async (item) => {
    try {
      const response = await deleteSubjectToTeacher([item.ID]).unwrap();

      toast.success(
        response?.message || "Subject সফলভাবে ডিলিট হয়েছে।"
      );

      await safeRefetchTeacherSubjects();
    } catch (error) {
      console.error("Delete error:", error);

      toast.error(
        error?.data?.error ||
        error?.data?.message ||
        error?.error ||
        "ডিলিট করতে ব্যর্থ হয়েছে।"
      );
    }
  };

  // =========================
  // SUBMIT (POST new selections)
  // =========================
  const onSubmit = async (data) => {
    try {
      if (!data?.SessionID || !data?.TeacherID || !data?.ExamID) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সেশন, পরীক্ষা এবং শিক্ষক নির্বাচন করুন।",
        });
        return;
      }

      if (selectedItems.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "কোন বিষয় নির্বাচন করা হয়নি",
          text: "অনুগ্রহ করে অন্তত একটি ক্লাস ও বিষয় নির্বাচন করুন।",
        });
        return;
      }

      const payloads = selectedItems.map((item) => ({
        SessionID: Number(data.SessionID),
        SubClassID: Number(item.SubClassID),
        ExamID: Number(data.ExamID),
        TeacherID: Number(data.TeacherID),
        SubjectID: Number(item.SubjectID),
      }));

      let response;
      if (isEditMode) {
        response = await updateSubjectToTeacher({
          id: editingId,
          ...payloads[0],
        }).unwrap();
      } else {
        response = await postSubjectToTeacher(payloads).unwrap();
      }

      // state reset BEFORE await Swal (avoid unmount refetch issue)
      setSelectedItems([]);
      setEditingId(null);

      // safe refetch (component may unmount during Swal)
      await safeRefetchTeacherSubjects();

      await Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Teacher subjects saved successfully.",
      });
    } catch (error) {
      console.error("Error saving teacher subject:", error);

      if (error?.status === 409) {
        const conflicts = error?.data?.conflicts || [];
        const conflictList = conflicts
          .map((c) => {
            const matched = selectedItems.find(
              (s) =>
                s.SubClassID === c.SubClassID && s.SubjectID === c.SubjectID
            );
            return matched
              ? `${matched.SubClass} - ${matched.SubjectName}`
              : `SubClassID: ${c.SubClassID}, SubjectID: ${c.SubjectID}`;
          })
          .join("<br/>");

        Swal.fire({
          icon: "warning",
          title: "ইতিমধ্যে বরাদ্দ করা হয়েছে!",
          html: `
            <p style="margin-bottom:10px;">নিচের বিষয়গুলো ইতিমধ্যে অন্য শিক্ষকের কাছে বরাদ্দ করা আছে:</p>
            <div style="text-align:left; font-size:14px; color:#b91c1c;">
              ${conflictList}
            </div>
          `,
        });

        await safeRefetchTeacherSubjects();
        return;
      }

      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text:
          error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
    }
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="font-SolaimanLipi h-screen overflow-hidden bg-gradient-to-br from-slate-50 flex">
      <div className="w-full h-full flex flex-col rounded-[16px] bg-white/85 backdrop-blur-xl ring-1 ring-[#2563EB]/20  overflow-hidden">
        {/* ============ HEADER (FIXED) ============ */}
        <div className="relative shrink-0 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] px-5 sm:px-7 py-5">
          {/* decorative glow */}
          <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,white,transparent_55%)]" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 w-52 h-52 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shadow-blue-900/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-[22px] font-bold text-white tracking-tight leading-tight">
                  শিক্ষক-বিষয় গ্রুপ
                </h3>
                <p className="text-blue-50/90 text-[11px] sm:text-xs mt-0.5">
                  সেশন ও পরীক্ষা অনুযায়ী শিক্ষককে বিষয় বরাদ্দ করুন
                </p>
              </div>
            </div>

            {/* Header stat pills */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_8px_2px_rgba(167,243,208,0.8)]" />
                <span className="text-white text-xs font-semibold">
                  বরাদ্দ: {currentTeacherAssigned.length}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-sky-200 shadow-[0_0_8px_2px_rgba(186,230,253,0.8)]" />
                <span className="text-white text-xs font-semibold">
                  নির্বাচিত: {selectedItems.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* ============ FILTER CARD ============ */}
            <div className="rounded-2xl bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/40 border border-emerald-100/80 p-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DefaultSelect
                  label="Session"
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <DefaultSelect
                  label={translate("Exam Name") + ":"}
                  options={examNameData ?? []}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                />
                <DefaultSelect
                  label={translate("Teacher")}
                  registerKey="TeacherID"
                  options={teachers ?? []}
                  valueField="UserID"
                  nameField="UserName"
                  require={translate("Teacher is required")}
                />
              </div>
            </div>

            {/* ============================
                STICKY WRAPPER (BOTH BARS STACK TOGETHER)
            ============================ */}
            {(currentTeacherAssigned.length > 0 ||
              selectedItems.length > 0) && (
                <div className="sticky top-0 z-20 space-y-3 rounded-2xl">
                  {/* ALREADY ASSIGNED SUBJECTS (TOP BAR - DIRECT DELETE) */}
                  {currentTeacherAssigned.length > 0 && (
                    <div className="rounded-2xl border border-emerald-200/80 bg-white/95 backdrop-blur-xl shadow-lg shadow-emerald-100/70 p-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 text-white shadow-md shadow-emerald-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <h1 className="text-sm font-bold text-gray-800">
                            এই শিক্ষকের বরাদ্দকৃত বিষয়সমূহ
                          </h1>
                          <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[11px] font-bold shadow-sm shadow-emerald-200">
                            {currentTeacherAssigned.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 hidden sm:block">
                          ডিলিট করতে ✕ চাপুন
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                        {currentTeacherAssigned.map((item, idx) => (
                          <span
                            key={`${item.SubClassID}-${item.SubjectID}-${idx}`}
                            className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <span>
                              {item.SubClass} - {item.SubjectName}
                            </span>
                            <button
                              type="button"
                              title="Delete assignment"
                              disabled={isDeleteLoading}
                              onClick={() => handleDeleteAssigned(item)}
                              className="ml-0.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-red-600 hover:from-rose-500 hover:to-red-700 text-white text-[10px] font-bold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SELECTED ITEMS TOP BAR (NEW SELECTIONS) */}
                  {selectedItems.length > 0 && (
                    <div className="rounded-2xl border border-sky-200/80 bg-white/95 backdrop-blur-xl shadow-lg shadow-sky-100/70 p-3">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-md shadow-sky-200">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={3}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                          </div>
                          <h1 className="text-sm font-bold text-gray-800">
                            নতুন নির্বাচিত বিষয়সমূহ
                          </h1>
                          <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[11px] font-bold shadow-sm shadow-sky-200">
                            {selectedItems.length}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 hidden sm:block">
                          মোট নির্বাচিত
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                        {selectedItems.map((item, idx) => (
                          <span
                            key={`${item.SubClassID}-${item.SubjectID}-${idx}`}
                            className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 text-sky-800 text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full shadow-sm hover:shadow-md hover:border-sky-300 hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <span>
                              {item.SubClass} - {item.SubjectName}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSelected(
                                  item.SubClassID,
                                  item.SubjectID
                                )
                              }
                              className="ml-0.5 w-5 h-5 inline-flex items-center justify-center rounded-full bg-white/70 text-sky-600 hover:bg-red-500 hover:text-white text-[12px] font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* ============ CLASS & SUBJECT LIST ============ */}
            <div className="space-y-4 pr-1">
              {ExamClassSubjectsLoading || ExamClassSubjectsFetching ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse"
                    >
                      <div className="h-4 w-32 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full mb-4" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(6)].map((_, j) => (
                          <div
                            key={j}
                            className="h-8 w-24 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : ExamClassSubjectsError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-200">
                    !
                  </div>
                  <p className="text-sm font-semibold text-red-600">
                    Failed to load subjects.
                  </p>
                </div>
              ) : ExamClassSubjectsData?.data?.length > 0 ? (
                ExamClassSubjectsData.data.map((subClass) => (
                  <div
                    key={subClass.SubClassID}
                    className="rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/60 hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                  >
                    {/* Class header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/70 to-transparent border-b border-gray-100">
                      <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2.5">
                        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 shadow-sm" />
                        {subClass.SubClass}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-400 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100">
                        {subClass.Subjects?.length || 0} বিষয়
                      </span>
                    </div>

                    {/* Subjects */}
                    <div className="flex flex-wrap gap-2 p-4">
                      {subClass.Subjects?.map((subject) => {
                        const info = getAssignedInfo(
                          subClass.SubClassID,
                          subject.SubjectID
                        );

                        const selected =
                          isSelected(subClass.SubClassID, subject.SubjectID) ||
                          (info.assigned && info.isSameTeacher);

                        const disabled = info.assigned;

                        return (
                          <button
                            key={subject.SubjectID}
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                              handleSubjectToggle(subClass, subject)
                            }
                            title={
                              info.assigned
                                ? `Assigned to ${info.teacherName}`
                                : "Click to select"
                            }
                            className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-200 focus:outline-none ${selected
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-md shadow-emerald-200/80 cursor-not-allowed"
                              : disabled
                                ? "bg-gradient-to-r from-rose-50 to-red-50 border-rose-200 text-rose-500 cursor-not-allowed opacity-80"
                                : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 hover:shadow-md hover:shadow-emerald-100 hover:-translate-y-0.5"
                              }`}
                          >
                            {subject.SubjectName}

                            {selected && (
                              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow ring-2 ring-emerald-500">
                                ✓
                              </span>
                            )}

                            {disabled && !selected && (
                              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-white text-rose-500 rounded-full flex items-center justify-center text-[10px] font-bold shadow ring-2 ring-rose-400">
                                🔒
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 py-12 rounded-2xl border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/60">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={26}
                      height={26}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">
                    No subjects found.
                  </p>
                  <p className="text-xs text-gray-400">
                    সেশন ও পরীক্ষা নির্বাচন করুন
                  </p>
                </div>
              )}
            </div>

            {/* ============ BUTTONS ============ */}
            <div className="w-full flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={isSaving}
              >
                {isSaving
                  ? translate("Saving...")
                  : isEditMode
                    ? translate("Update")
                    : translate("Save")}
              </Button>

              {isEditMode && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  {translate("Cancel")}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default TeacherSubjectsAsignPage;