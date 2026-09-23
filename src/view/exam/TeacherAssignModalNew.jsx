import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import useTranslate from "../../utils/Translate";
import Button from "../../components/Button/Button";
import DefaultSelect from "../../components/Forms/DefaultSelect";

import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetExamClassSubjectsQuery } from "../../features/class/classQuerySlice";
import {
  useGetTeachersInfoQuery,
  useGetTeacherSubjectsQuery,
  usePostSubjectToTeacherMutation,
  useUpdateTeacherSubjectMutation,
  useDeleteTeacherSubjectMutation,
} from "../../features/teachers/teachersSlice";
import { useGetExamNamesQuery } from "../../features/exam/examQuerySlice";

const TeacherAssignModalNew = ({ id }) => {
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
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
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

          {/* ============================
              ALREADY ASSIGNED SUBJECTS (TOP BAR - DIRECT DELETE)
          ============================ */}
          {currentTeacherAssigned.length > 0 && (
            <div className="sticky top-0 z-10 bg-white border border-green-200 rounded-lg p-2 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-600">
                    ✓
                  </div>
                  <h1 className="text-sm font-semibold text-gray-700">
                    এই শিক্ষকের বরাদ্দকৃত বিষয়সমূহ
                  </h1>
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-green-500 text-white text-xs font-bold">
                    {currentTeacherAssigned.length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  ডিলিট করতে ✕ চাপুন
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {currentTeacherAssigned.map((item, idx) => (
                  <span
                    key={`${item.SubClassID}-${item.SubjectID}-${idx}`}
                    className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    <span>
                      {item.SubClass} - {item.SubjectName}
                    </span>
                    <button
                      type="button"
                      title="Delete assignment"
                      disabled={isDeleteLoading}
                      onClick={() => handleDeleteAssigned(item)}
                      className="ml-1 w-4 h-4 inline-flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold focus:outline-none disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ============================
              SELECTED ITEMS TOP BAR (NEW SELECTIONS)
          ============================ */}
          {selectedItems.length > 0 && (
            <div className="sticky top-0 z-10 bg-white border border-blue-200 rounded-lg p-2 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600">
                    +
                  </div>
                  <h1 className="text-sm font-semibold text-gray-700">
                    নতুন নির্বাচিত বিষয়সমূহ
                  </h1>
                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-blue-500 text-white text-xs font-bold">
                    {selectedItems.length}
                  </span>
                </div>
                <span className="text-xs text-gray-400">মোট নির্বাচিত</span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {selectedItems.map((item, idx) => (
                  <span
                    key={`${item.SubClassID}-${item.SubjectID}-${idx}`}
                    className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    <span>
                      {item.SubClass} - {item.SubjectName}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveSelected(item.SubClassID, item.SubjectID)
                      }
                      className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CLASS & SUBJECT LIST */}
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {ExamClassSubjectsLoading || ExamClassSubjectsFetching ? (
              <div className="text-center py-4 text-gray-500">
                Loading subjects...
              </div>
            ) : ExamClassSubjectsError ? (
              <div className="text-center py-4 text-red-500">
                Failed to load subjects.
              </div>
            ) : ExamClassSubjectsData?.data?.length > 0 ? (
              ExamClassSubjectsData.data.map((subClass) => (
                <div
                  key={subClass.SubClassID}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {subClass.SubClass}
                  </h3>
                  <div className="flex flex-wrap gap-2">
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
                          className={`relative px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${selected
                            ? "bg-green-100 border-green-500 text-green-800 cursor-not-allowed"
                            : disabled
                              ? "bg-red-50 border-red-300 text-red-500 cursor-not-allowed opacity-70"
                              : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          {subject.SubjectName}

                          {selected && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
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
              <div className="text-center py-4 text-gray-500">
                No subjects found.
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="w-full flex gap-2 pt-2">
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
  );
};

export default TeacherAssignModalNew;