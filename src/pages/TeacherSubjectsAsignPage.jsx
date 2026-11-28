import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import DefaultSelect from "../components/Forms/DefaultSelect";
import { Modal } from "../pages/teacher/Modal"; // আপনার Modal কম্পোনেন্টের পাথ

import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetExamClassSubjectsQuery } from "../features/class/classQuerySlice";
import {
  useGetTeachersInfoQuery,
  useGetTeacherSubjectsQuery,
  usePostSubjectToTeacherMutation,
  useDeleteTeacherSubjectMutation,
} from "../features/teachers/teachersSlice";
import { useGetExamNamesQuery } from "../features/exam/examQuerySlice";

const TeacherSubjectsAssignPage = () => {
  const translate = useTranslate();

  // =========================
  // PAGE FILTERS
  // =========================
  const pageMethods = useForm({
    defaultValues: {
      SessionID: "",
      ExamID: "",
      TeacherID: "", // নতুন যোগ করা হয়েছে
    },
  });
  const [pageSessionID, pageExamID, pageTeacherID] = pageMethods.watch([
    "SessionID",
    "ExamID",
    "TeacherID",
  ]);

  // =========================
  // MODAL FORM & STATE
  // =========================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalMethods = useForm({
    defaultValues: {
      SessionID: "",
      ExamID: "",
      TeacherID: "",
    },
  });
  const [modalSessionID, modalExamID, modalTeacherID] = modalMethods.watch([
    "SessionID",
    "ExamID",
    "TeacherID",
  ]);

  const [selectedItems, setSelectedItems] = useState([]);

  // =========================
  // MUTATIONS
  // =========================
  const [postSubjectToTeacher, { isLoading: isPostLoading }] = usePostSubjectToTeacherMutation();
  const [deleteSubjectToTeacher, { isLoading: isDeleteLoading }] = useDeleteTeacherSubjectMutation();
  const isSaving = isPostLoading || isDeleteLoading;

  // =========================
  // QUERIES
  // =========================
  const { data: teachers = [] } = useGetTeachersInfoQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  // ফেচ অল টিচার সাবজেক্ট
  const { data: teacherSubjects = [], refetch: refetchTeacherSubjects } = useGetTeacherSubjectsQuery();

  // পেজের জন্য ক্লাস সাবজেক্ট (প্রয়োজন নেই, তবে মোডালের জন্য দরকার)
  const {
    data: ExamClassSubjectsData,
    isLoading: ExamClassSubjectsLoading,
    isFetching: ExamClassSubjectsFetching,
  } = useGetExamClassSubjectsQuery(
    { SessionID: modalSessionID, ExamID: modalExamID },
    { skip: !modalSessionID || !modalExamID || !isModalOpen }
  );

  // =========================
  // SAFE REFETCH
  // =========================
  const safeRefetchTeacherSubjects = async () => {
    try {
      if (typeof refetchTeacherSubjects === "function") {
        await refetchTeacherSubjects();
      }
    } catch (err) {
      console.warn("refetchTeacherSubjects skipped:", err?.message);
    }
  };

  // =========================
  // GET ASSIGNED INFO (For Modal)
  // =========================
  const getAssignedInfo = (subClassID, subjectID) => {
    const list = teacherSubjects?.data || teacherSubjects || [];
    const found = list.find(
      (item) =>
        Number(item.SessionID) === Number(modalSessionID) &&
        Number(item.ExamID) === Number(modalExamID) &&
        Number(item.SubClassID) === Number(subClassID) &&
        Number(item.SubjectID) === Number(subjectID)
    );

    if (!found) return { assigned: false };

    const isSameTeacher = modalTeacherID && Number(found.TeacherID) === Number(modalTeacherID);

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
  // CURRENT MODAL TEACHER'S ASSIGNED SUBJECTS
  // =========================
  const currentModalTeacherAssigned = (() => {
    if (!modalTeacherID || !modalSessionID || !modalExamID) return [];
    const list = teacherSubjects?.data || teacherSubjects || [];

    return list
      .filter(
        (item) =>
          Number(item.TeacherID) === Number(modalTeacherID) &&
          Number(item.SessionID) === Number(modalSessionID) &&
          Number(item.ExamID) === Number(modalExamID)
      )
      .map((item) => ({
        ID: item.ID,
        TeacherID: item.TeacherID,
        SessionID: item.SessionID,
        ExamID: item.ExamID,
        SubClassID: item.SubClassID,
        SubClass: item.SubClass || item.SubClassName || item.SubClassID,
        SubjectID: item.SubjectID,
        SubjectName: item.SubjectName || item.SubjectID,
      }));
  })();

  // =========================
  // MODAL OPEN HANDLER
  // =========================
  const handleOpenModal = () => {
    // পেজের ফিল্টার ভ্যালু মোডালে প্রি-ফিল করা
    modalMethods.reset({
      SessionID: pageSessionID || "",
      ExamID: pageExamID || "",
      TeacherID: pageTeacherID || "", // শিক্ষক ফিল্টার থাকলে সেটাও প্রি-ফিল হবে
    });
    setSelectedItems([]);
    setIsModalOpen(true);
  };

  // মোডালে শিক্ষক পরিবর্তন হলে কারেন্ট টিচারের সাবজেক্ট সিলেক্ট করে রাখা
  useEffect(() => {
    if (modalTeacherID) {
      setSelectedItems(currentModalTeacherAssigned);
    } else {
      setSelectedItems([]);
    }
  }, [modalTeacherID, modalSessionID, modalExamID, teacherSubjects]);

  // =========================
  // MODAL HANDLERS
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

    const exists = selectedItems.some(
      (item) => item.SubClassID === subClass.SubClassID && item.SubjectID === subject.SubjectID
    );

    if (exists) {
      setSelectedItems((prev) =>
        prev.filter(
          (item) => !(item.SubClassID === subClass.SubClassID && item.SubjectID === subject.SubjectID)
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

  const isSelected = (subClassID, subjectID) => {
    return selectedItems.some(
      (item) => item.SubClassID === subClassID && item.SubjectID === subjectID
    );
  };

  // =========================
  // SUBMIT (MODAL)
  // =========================
  const onSubmitModal = async () => {
    try {
      if (!modalTeacherID || !modalSessionID || !modalExamID) {
        toast.error("দয়া করে সেশন, পরীক্ষা এবং শিক্ষক নির্বাচন করুন।");
        return;
      }

      const toAdd = selectedItems.filter((sel) => {
        return !currentModalTeacherAssigned.some(
          (curr) => curr.SubClassID === sel.SubClassID && curr.SubjectID === sel.SubjectID
        );
      });

      const toDelete = currentModalTeacherAssigned.filter((curr) => {
        return !selectedItems.some(
          (sel) => sel.SubClassID === curr.SubClassID && sel.SubjectID === curr.SubjectID
        );
      });

      if (toAdd.length === 0 && toDelete.length === 0) {
        toast.info("কোনো পরিবর্তন করা হয়নি।");
        setIsModalOpen(false);
        return;
      }

      if (toDelete.length > 0) {
        const deletePayload = toDelete.map((item) => item.ID);
        await deleteSubjectToTeacher(deletePayload).unwrap();
      }

      if (toAdd.length > 0) {
        const addPayloads = toAdd.map((item) => ({
          SessionID: Number(modalSessionID),
          SubClassID: Number(item.SubClassID),
          ExamID: Number(modalExamID),
          TeacherID: Number(modalTeacherID),
          SubjectID: Number(item.SubjectID),
        }));
        await postSubjectToTeacher(addPayloads).unwrap();
      }

      await safeRefetchTeacherSubjects();
      setIsModalOpen(false);
      setSelectedItems([]);

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: "শিক্ষকের বিষয় সফলভাবে আপডেট করা হয়েছে।",
      });
    } catch (error) {
      console.error("Error saving:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || error?.data?.message || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
    }
  };

  // =========================
  // PAGE RENDER LOGIC
  // =========================
  // পেজে সব শিক্ষক এবং তাদের অ্যাসাইন করা সাবজেক্ট দেখানোর জন্য ডেটা প্রসেসিং
  const allTeachersWithAssignments = teachers
    .filter((teacher) => !pageTeacherID || Number(teacher.UserID) === Number(pageTeacherID)) // শিক্ষক ফিল্টার লজিক
    .map((teacher) => {
      const assigned = (teacherSubjects?.data || teacherSubjects || []).filter(
        (item) =>
          Number(item.TeacherID) === Number(teacher.UserID) &&
          Number(item.SessionID) === Number(pageSessionID) &&
          Number(item.ExamID) === Number(pageExamID)
      );

      return {
        ...teacher,
        assignments: assigned.map((a) => ({
          SubClassID: a.SubClassID,
          SubClass: a.SubClass || a.SubClassName || a.SubClassID,
          SubjectID: a.SubjectID,
          SubjectName: a.SubjectName || a.SubjectID,
        })),
      };
    })
    .filter((t) => t.assignments.length > 0 || !pageSessionID || !pageExamID);

  return (
    <div className="font-SolaimanLipi h-screen overflow-hidden bg-slate-50/50 flex flex-col">
      <div className="w-full h-full flex flex-col rounded-[16px] bg-transparent overflow-hidden">

        {/* ============ HEADER ============ */}
        <div className="relative shrink-0 bg-gradient-to-r from-[#2563EB] via-[#1D4ED8] to-[#1E40AF] px-5 sm:px-7 py-5 rounded-t-2xl shadow-lg">
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r={4} />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg sm:text-[22px] font-bold text-white tracking-tight leading-tight">
                  শিক্ষক-বিষয় গ্রুপ
                </h3>
                <p className="text-blue-50/90 text-[11px] sm:text-xs mt-0.5">
                  সেশন ও পরীক্ষা অনুযায়ী শিক্ষকদের বিষয় দেখুন এবং বরাদ্দ করুন
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============ MAIN CONTENT ============ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Filters & Action Button */}
          <FormProvider {...pageMethods}>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row items-end gap-4">
              {/* ৩ কলামের গ্রিড - শিক্ষাবর্ষ, পরীক্ষা, শিক্ষক */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
                <DefaultSelect
                  label="শিক্ষাবর্ষ"
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
                <DefaultSelect
                  label="পরীক্ষার নাম"
                  options={examNameData ?? []}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                />
                {/* নতুন যোগ করা শিক্ষক ফিল্টার */}
                <DefaultSelect
                  label="শিক্ষক"
                  registerKey="TeacherID"
                  options={teachers ?? []}
                  valueField="UserID"
                  nameField="UserName"
                />
              </div>
              <div className="w-full md:w-auto shrink-0">
                <Button
                  type="button"
                  onClick={handleOpenModal}
                  className="w-full md:w-auto h-[42px] px-6 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Subject Assign
                </Button>
              </div>
            </div>
          </FormProvider>

          {/* Teachers List */}
          <div className="space-y-3">
            {allTeachersWithAssignments.length > 0 ? (
              allTeachersWithAssignments.map((teacher) => (
                <div key={teacher.UserID} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                        {teacher.UserName?.charAt(0) || "T"}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-800">{teacher.UserName}</h2>
                        <p className="text-xs text-gray-500">মোট বরাদ্দ: {teacher.assignments.length} টি</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject Badges */}
                  <div className="flex flex-wrap gap-2">
                    {teacher.assignments.length > 0 ? (
                      teacher.assignments.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm"
                        >
                          <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                            {item.SubClass}
                          </span>
                          {item.SubjectName}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">কোনো বিষয় বরাদ্দ নেই</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">শিক্ষাবর্ষ এবং পরীক্ষা নির্বাচন করুন।</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ MODAL FOR ASSIGNING ============ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Subject Assign / Update"
        subtitle="শিক্ষক, সেশন ও পরীক্ষা নির্বাচন করে বিষয় বরাদ্দ করুন"
        size="2xl"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              বাতিল
            </Button>
            <Button type="button" onClick={onSubmitModal} disabled={isSaving}>
              {isSaving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </>
        }
      >
        <FormProvider {...modalMethods}>
          <div className="space-y-5">
            {/* Modal Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <DefaultSelect
                label="শিক্ষাবর্ষ"
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
              <DefaultSelect
                label="পরীক্ষার নাম"
                options={examNameData ?? []}
                valueField="ExamID"
                nameField="ExamName"
                registerKey="ExamID"
              />
              <DefaultSelect
                label="শিক্ষক"
                registerKey="TeacherID"
                options={teachers ?? []}
                valueField="UserID"
                nameField="UserName"
              />
            </div>

            {/* Subject List */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {!modalTeacherID || !modalSessionID || !modalExamID ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">শিক্ষাবর্ষ, পরীক্ষা এবং শিক্ষক নির্বাচন করুন।</p>
                </div>
              ) : ExamClassSubjectsLoading || ExamClassSubjectsFetching ? (
                <div className="space-y-3 p-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex space-x-4">
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                          <div className="h-8 bg-gray-200 rounded-full w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : ExamClassSubjectsData?.data?.length > 0 ? (
                ExamClassSubjectsData.data.map((subClass) => (
                  <div key={subClass.SubClassID} className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
                      <h3 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1.5 h-4 rounded-full bg-emerald-500"></span>
                        {subClass.SubClass}
                      </h3>
                      <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                        {subClass.Subjects?.length || 0} বিষয়
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3">
                      {subClass.Subjects?.map((subject) => {
                        const info = getAssignedInfo(subClass.SubClassID, subject.SubjectID);
                        const selected = isSelected(subClass.SubClassID, subject.SubjectID);
                        const isOtherTeacher = info.assigned && !info.isSameTeacher;

                        return (
                          <button
                            key={subject.SubjectID}
                            type="button"
                            disabled={isOtherTeacher}
                            onClick={() => handleSubjectToggle(subClass, subject)}
                            title={isOtherTeacher ? `Assigned to ${info.teacherName}` : "Click to select"}
                            className={`relative px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 focus:outline-none ${selected
                              ? "bg-gradient-to-r from-emerald-500 to-green-600 border-transparent text-white shadow-md shadow-emerald-200/80"
                              : isOtherTeacher
                                ? "bg-rose-50 border-rose-200 text-rose-400 cursor-not-allowed opacity-80"
                                : "bg-white border-gray-300 text-gray-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                          >
                            {subject.SubjectName}

                            {selected && (
                              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-white text-emerald-600 rounded-full flex items-center justify-center text-[10px] font-bold shadow ring-2 ring-emerald-500">
                                ✓
                              </span>
                            )}

                            {isOtherTeacher && (
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
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500">কোনো বিষয় পাওয়া যায়নি।</p>
                </div>
              )}
            </div>
          </div>
        </FormProvider>
      </Modal>
    </div>
  );
};

export default TeacherSubjectsAssignPage;