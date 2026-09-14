import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";

import useTranslate from "../../utils/Translate";
import Button from "../../components/Button/Button";
import DefaultSelect from "../../components/Forms/DefaultSelect";

import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import {
  useGetAcademicSubjectsQuery,
  useGetSubClassListQuery,
} from "../../features/class/classQuerySlice";

import {
  useGetTeachersInfoQuery,
  usePostSubjectToTeacherMutation,
  useGetTeacherSubjectsQuery,
  useUpdateTeacherSubjectMutation,
} from "../../features/teachers/teachersSlice";

import SortableTable from "../../components/Tables/SortableTable";
import EditButton from "../../components/Button/EditButton";

const TeacherAssignModal = ({ examDetails }) => {
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

  const { setValue, handleSubmit, reset } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  // =========================
  // EDIT STATE
  // =========================
  const [editingId, setEditingId] = useState(null);
  const isEditMode = editingId !== null;

  // =========================
  // MUTATIONS
  // =========================
  const [postSubjectToTeacher, { isLoading: isPostLoading }] =
    usePostSubjectToTeacherMutation();

  const [updateSubjectToTeacher, { isLoading: isUpdateLoading }] =
    useUpdateTeacherSubjectMutation();

  const isSaving = isPostLoading || isUpdateLoading;

  // =========================
  // QUERIES
  // =========================
  const { data: teachers = [] } = useGetTeachersInfoQuery();

  const {
    data: teacherSubjects = [],
    refetch: refetchTeacherSubjects,
  } = useGetTeacherSubjectsQuery();


  const { data: subjectList = [] } = useGetAcademicSubjectsQuery();
  const { data: sessionData = [] } = useGetSessionsQuery();
  const { data: subClassList = [] } = useGetSubClassListQuery();

  // =========================
  // SET EXAM DEFAULT VALUES
  // =========================
  useEffect(() => {
    if (!examDetails) return;

    setValue("SessionID", examDetails?.SessionID ?? "");
    setValue("SubClassID", examDetails?.SubClassID ?? "");
    setValue("ExamID", examDetails?.ExamID ?? "");
  }, [
    examDetails?.SessionID,
    examDetails?.SubClassID,
    examDetails?.ExamID,
    setValue,
  ]);

  // =========================
  // FILTER SUBJECTS
  // =========================
  const filterSubjectList = useMemo(() => {
    if (!examDetails || !Array.isArray(subjectList)) return [];

    const subjects = [];
    const subjectCount = Number(examDetails?.SubSonkha || 0);

    for (let index = 0; index < subjectCount; index++) {
      const subjectId = examDetails?.[`SubjectID${index + 1}`];
      if (!subjectId) continue;

      const subject = subjectList.find(
        (item) => Number(item?.SubjectID) === Number(subjectId)
      );
      if (subject) subjects.push(subject);
    }

    return subjects;
  }, [subjectList, examDetails]);

  // =========================
  // FILTER TEACHER SUBJECTS
  // =========================
  const filteredTeacherSubjects = useMemo(() => {
    const rawData = Array.isArray(teacherSubjects)
      ? teacherSubjects
      : teacherSubjects?.data ?? [];

    if (!Array.isArray(rawData)) return [];
    if (!examDetails) return rawData;

    return rawData.filter(
      (row) =>
        Number(row.SubClassID) === Number(examDetails?.SubClassID) &&
        Number(row.SessionID) === Number(examDetails?.SessionID) &&
        Number(row.ExamID) === Number(examDetails?.ExamID)
    );
  }, [teacherSubjects, examDetails]);

  // =========================
  // HANDLE EDIT
  // =========================
  const handleEdit = (row) => {
    if (!row) return;

    console.log("Editing row:", row);

    setEditingId(row.ID);

    setValue("SessionID", row.SessionID ?? "");
    setValue("SubClassID", row.SubClassID ?? "");
    setValue("ExamID", row.ExamID ?? "");
    setValue("TeacherID", row.TeacherID ?? "");
    setValue("SubjectID", row.SubjectID ?? "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =========================
  // HANDLE CANCEL EDIT
  // =========================
  const handleCancelEdit = () => {
    setEditingId(null);
    reset({
      SessionID: examDetails?.SessionID ?? "",
      SubClassID: examDetails?.SubClassID ?? "",
      ExamID: examDetails?.ExamID ?? "",
      TeacherID: "",
      SubjectID: "",
    });
  };

  // =========================
  // COLUMNS (with edit button inside)
  // =========================
  const columns = useMemo(() => {
    if (
      !Array.isArray(filteredTeacherSubjects) ||
      filteredTeacherSubjects.length === 0
    ) {
      return [];
    }

    // Data columns
    const dataColumns = [
      {
        field: "TeacherCode",
        title: translate("Teacher Code"),
        hozAlign: "center",
      },
      {
        field: "TeacherName",
        title: translate("Teacher Name"),
        hozAlign: "left",
      },
      {
        field: "SubClass",
        title: translate("Sub Class"),
        hozAlign: "left",
      },
      {
        field: "SubjectName",
        title: translate("Subject Name"),
        hozAlign: "left",
      },
      {
        field: "SessionName",
        title: translate("Session"),
        hozAlign: "center",
      },
    ];

    // Action column (edit button)
    const actionColumn = {
      field: "action",
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center">
          <EditButton onClick={() => handleEdit(row)} />
        </div>
      ),
    };

    return [...dataColumns, actionColumn];
  }, [filteredTeacherSubjects, translate, handleEdit]);

  // =========================
  // PAGINATION
  // =========================
  const rowsPerPage = 10;

  const totalPages = Math.max(
    1,
    Math.ceil((filteredTeacherSubjects?.length || 0) / rowsPerPage)
  );

  const paginatedData = useMemo(() => {
    if (!Array.isArray(filteredTeacherSubjects)) return [];
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTeacherSubjects.slice(start, start + rowsPerPage);
  }, [filteredTeacherSubjects, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  // =========================
  // SUBMIT (POST or PUT)
  // =========================
  const onSubmit = async (data) => {
    console.log("Submit Data:", data, "EditMode:", isEditMode);

    try {
      // VALIDATION
      if (
        !data?.SubClassID ||
        !data?.SessionID ||
        !data?.SubjectID ||
        !data?.TeacherID
      ) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে শিক্ষক এবং বিষয় নির্বাচন করুন।",
        });
        return;
      }

      // PAYLOAD
      const payload = {
        ...data,
        SessionID: Number(data.SessionID),
        SubClassID: Number(data.SubClassID),
        ExamID: Number(data.ExamID),
        TeacherID: Number(data.TeacherID),
        SubjectID: Number(data.SubjectID),
      };

      let response;

      if (isEditMode) {
        // ============ UPDATE ============
        response = await updateSubjectToTeacher({
          id: editingId,
          ...payload,
        }).unwrap();

        await Swal.fire({
          icon: "success",
          title: "সফলভাবে আপডেট হয়েছে",
          text:
            response?.message ||
            "Teacher subject updated successfully.",
        });

        setEditingId(null);
      } else {
        // ============ CREATE ============
        response = await postSubjectToTeacher(payload).unwrap();

        await Swal.fire({
          icon: "success",
          title: "সফলভাবে সংরক্ষণ হয়েছে",
          text:
            response?.message ||
            "Teacher subject successfully assigned.",
        });
      }

      // REFRESH
      try {
        await refetchTeacherSubjects();
      } catch (refetchError) {
        console.error("Refetch error:", refetchError);
      }

      // RESET
      setSelectedRows([]);
      reset({
        SessionID: examDetails?.SessionID ?? "",
        SubClassID: examDetails?.SubClassID ?? "",
        ExamID: examDetails?.ExamID ?? "",
        TeacherID: "",
        SubjectID: "",
      });
    } catch (error) {
      console.error("Error saving teacher subject:", error);

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
        <form
          className="w-full space-y-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* EDIT MODE BANNER */}
          {/* {isEditMode && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded">
              {translate("Edit mode")} — ID: {editingId}
            </div>
          )} */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            {/* SESSION */}
            <DefaultSelect
              label="Session"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              disabled={true}
            />

            {/* SUB CLASS */}
            <DefaultSelect
              label="Sub Class"
              options={subClassList ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              disabled={true}
            />

            {/* TEACHER */}
            <DefaultSelect
              label={translate("Teacher")}
              registerKey="TeacherID"
              options={teachers ?? []}
              valueField="UserID"
              nameField="UserName"
              require={translate("Teacher is required")}
            />

            {/* SUBJECT */}
            <DefaultSelect
              label={translate("Subject")}
              registerKey="SubjectID"
              options={filterSubjectList ?? []}
              valueField="SubjectID"
              nameField="SubjectName"
              require={translate("Subject is required")}
            />

            {/* BUTTONS */}
            <div className="w-full md:col-span-4 flex gap-2">
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
          </div>

          {/* TABLE */}
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                type="button"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                {translate("Previous")}
              </Button>

              <span className="text-sm font-medium">
                {translate("Page")} {currentPage} / {totalPages}
              </span>

              <Button
                type="button"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                {translate("Next")}
              </Button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
};

export default TeacherAssignModal;