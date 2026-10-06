import { useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useTranslate from "../utils/Translate";
import DefaultSelect from "../components/Forms/DefaultSelect";

import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetExamClassSubjectsQuery } from "../features/class/classQuerySlice";
import {
  useGetTeachersInfoQuery,
  useGetTeacherSubjectSubmissionsQuery,
  useSubmitTeacherKhataMutation,
} from "../features/teachers/teachersSlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";

const TeacherKhataSubmission = () => {
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: { SessionID: "", ExamID: "", TeacherID: "" },
  });

  const { watch } = methods;
  const [SessionID, ExamID, TeacherID] = watch([
    "SessionID",
    "ExamID",
    "TeacherID",
  ]);

  const filterReady = !!(SessionID && ExamID && TeacherID);

  // =========================
  // QUERIES
  // =========================
  const { data: teachers = [] } = useGetTeachersInfoQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const {
    data: classSubjectsData,
    isLoading: csLoading,
    isFetching: csFetching,
    error: csError,
  } = useGetExamClassSubjectsQuery(
    { SessionID, ExamID },
    { skip: !SessionID || !ExamID }
  );

  const {
    data: submissionData,
    isLoading: subLoading,
    isFetching: subFetching,
    error: subError,
  } = useGetTeacherSubjectSubmissionsQuery(
    { SessionID, ExamID, TeacherID },
    { skip: !filterReady }
  );

  const [submitKhata, { isLoading: isSubmitting }] =
    useSubmitTeacherKhataMutation();

  // =========================
  // MAP: "SubClassID-SubjectID" -> assigned record
  // =========================
  const assignedMap = useMemo(() => {
    const map = new Map();
    const list = submissionData?.data || [];
    list.forEach((r) => map.set(`${r.SubClassID}-${r.SubjectID}`, r));
    return map;
  }, [submissionData]);

  // Sudhu ei teacher er assigned subject gulo class wise
  const visibleClasses = useMemo(() => {
    const classes = classSubjectsData?.data || [];
    return classes
      .map((c) => ({
        ...c,
        Subjects: (c.Subjects || []).filter((s) =>
          assignedMap.has(`${c.SubClassID}-${s.SubjectID}`)
        ),
      }))
      .filter((c) => c.Subjects.length > 0);
  }, [classSubjectsData, assignedMap]);

  const totalAssigned = assignedMap.size;
  const totalSubmitted = useMemo(
    () =>
      Array.from(assignedMap.values()).filter((r) => !!r.IsKhataSubmitted)
        .length,
    [assignedMap]
  );

  // =========================
  // CLICK HANDLER (joma / update)
  // =========================
  const handleToggle = async (record, subClassName, subjectName) => {
    if (isSubmitting) return;

    const currentlySubmitted = !!record.IsKhataSubmitted;

    // Already joma → update (joma batil) korar age confirm
    if (currentlySubmitted) {
      const result = await Swal.fire({
        icon: "question",
        title: "জমা বাতিল করবেন?",
        html: `<b>${subClassName} - ${subjectName}</b> এর খাতা জমা বাতিল করা হবে।`,
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ, বাতিল করুন",
        cancelButtonText: "না",
      });
      if (!result.isConfirmed) return;
    }

    try {
      const res = await submitKhata({
        ids: [record.ID],
        submitted: !currentlySubmitted,
      }).unwrap();

      toast.success(
        res?.message ||
        (!currentlySubmitted
          ? "খাতা জমা সফল হয়েছে।"
          : "জমা বাতিল করা হয়েছে।")
      );
    } catch (error) {
      console.error("Khata submit error:", error);
      toast.error(
        error?.data?.error ||
        error?.data?.message ||
        error?.error ||
        "আপডেট করতে ব্যর্থ হয়েছে।"
      );
    }
  };

  // =========================
  // SUBMIT ALL (optional bulk)
  // =========================
  const handleSubmitAll = async () => {
    const pendingIds = Array.from(assignedMap.values())
      .filter((r) => !r.IsKhataSubmitted)
      .map((r) => r.ID);

    if (pendingIds.length === 0) return;

    const result = await Swal.fire({
      icon: "question",
      title: "সব খাতা জমা নিবেন?",
      text: `মোট ${pendingIds.length} টি বিষয়ের খাতা জমা হবে।`,
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, জমা নিন",
      cancelButtonText: "না",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await submitKhata({
        ids: pendingIds,
        submitted: true,
      }).unwrap();
      toast.success(res?.message || "সব খাতা জমা সফল হয়েছে।");
    } catch (error) {
      toast.error(
        error?.data?.error || error?.data?.message || "জমা করতে ব্যর্থ হয়েছে।"
      );
    }
  };

  const isListLoading = csLoading || csFetching || subLoading || subFetching;

  const formatDT = (v) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d) ? "" : d.toLocaleString("en-GB");
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="font-SolaimanLipi h-screen overflow-hidden bg-gradient-to-br from-slate-50 flex">
      <div className="w-full h-full flex flex-col rounded-[16px] bg-white/85 backdrop-blur-xl ring-1 ring-[#2563EB]/20 overflow-hidden">
        {/* ============ HEADER ============ */}
        <div className="relative shrink-0 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] px-5 sm:px-7 py-5">
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
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <polyline points="9 10 11 12 15 8" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-[22px] font-bold text-white tracking-tight leading-tight">
                  খাতা জমা
                </h3>
                <p className="text-blue-50/90 text-[11px] sm:text-xs mt-0.5">
                  শিক্ষকের কাছ থেকে বিষয় অনুযায়ী পরীক্ষার খাতা জমা নিন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-200 shadow-[0_0_8px_2px_rgba(167,243,208,0.8)]" />
                <span className="text-white text-xs font-semibold">
                  জমা: {totalSubmitted}/{totalAssigned}
                </span>
              </div>
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
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
                />
              </div>
            </div>

            {/* ============ SUMMARY BAR ============ */}
            {filterReady && totalAssigned > 0 && (
              <div className="sticky top-0 z-20 rounded-2xl border border-sky-200/80 bg-white/95 backdrop-blur-xl shadow-lg shadow-sky-100/70 p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow-sm">
                    জমা: {totalSubmitted}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-rose-400 to-red-500 text-white text-xs font-bold shadow-sm">
                    বাকি: {totalAssigned - totalSubmitted}
                  </span>
                  <span className="text-[11px] text-gray-400 hidden sm:block">
                    বিষয়ে ক্লিক করলে জমা হবে, আবার ক্লিক করলে বাতিল
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitAll}
                  disabled={isSubmitting || totalSubmitted === totalAssigned}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1E40AF] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  সব জমা নিন
                </button>
              </div>
            )}

            {/* ============ LIST ============ */}
            <div className="space-y-4 pr-1">
              {!filterReady ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 rounded-2xl border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/60">
                  <p className="text-sm font-semibold text-gray-600">
                    সেশন, পরীক্ষা ও শিক্ষক নির্বাচন করুন
                  </p>
                </div>
              ) : isListLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-gray-100 bg-white p-4 animate-pulse"
                    >
                      <div className="h-4 w-32 bg-gray-200 rounded-full mb-4" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="h-8 w-24 bg-gray-100 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : csError || subError ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50">
                  <p className="text-sm font-semibold text-red-600">
                    Failed to load data.
                  </p>
                </div>
              ) : visibleClasses.length > 0 ? (
                visibleClasses.map((subClass) => (
                  <div
                    key={subClass.SubClassID}
                    className="rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:shadow-lg hover:shadow-emerald-100/60 hover:border-emerald-200 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 via-emerald-50/70 to-transparent border-b border-gray-100">
                      <h3 className="text-[15px] font-bold text-gray-800 flex items-center gap-2.5">
                        <span className="w-1.5 h-5 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500 shadow-sm" />
                        {subClass.SubClass}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-400 bg-white/70 px-2.5 py-1 rounded-full border border-gray-100">
                        {subClass.Subjects.length} বিষয়
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 p-4">
                      {subClass.Subjects.map((subject) => {
                        const record = assignedMap.get(
                          `${subClass.SubClassID}-${subject.SubjectID}`
                        );
                        const submitted = !!record?.IsKhataSubmitted;

                        return (
                          <button
                            key={subject.SubjectID}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() =>
                              handleToggle(
                                record,
                                subClass.SubClass,
                                subject.SubjectName
                              )
                            }
                            title={
                              submitted
                                ? `জমা: ${formatDT(
                                  record.KhataSubmittedAt
                                )} (ক্লিক করে বাতিল করুন)`
                                : "ক্লিক করে খাতা জমা নিন"
                            }
                            className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-200 focus:outline-none disabled:opacity-60 ${submitted
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-md shadow-emerald-200/80"
                              : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:text-emerald-700 hover:shadow-md hover:shadow-emerald-100 hover:-translate-y-0.5"
                              }`}
                          >
                            {subject.SubjectName}

                            {submitted && (
                              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow ring-2 ring-emerald-500">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12 rounded-2xl border border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/60">
                  <p className="text-sm font-semibold text-gray-600">
                    এই শিক্ষকের কোনো বিষয় বরাদ্দ নেই।
                  </p>
                </div>
              )}
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
};

export default TeacherKhataSubmission;