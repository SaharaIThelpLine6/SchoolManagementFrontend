import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import useTranslate from "../../../utils/Translate";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import Button from "../../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { useGetAcademicSubjectsQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";
import SortableTable from "../../../components/Tables/SortableTable";
import { FiEdit } from "react-icons/fi";
import FilteringForm from "./FilteringForm";
import {
  useGetAverageSubjectPassNumberQuery,
  usePostAverageSubjectPassNumberMutation,
  useUpdateAverageSubjectPassNumberMutation,
} from "../../../features/exam/examQuerySlice";
import { examAveragePasNumberStatus } from "../../../Data/userReportsData";
import ExamRoutingCheckbox from "../../../components/Checkboxes/ExamRoutingCheckbox";
import { skipToken } from "@reduxjs/toolkit/query";
import bnBijoy2Unicode from "../../../utils/conveter";

const PAGE_SIZE = 10;

const SubjectPassNumber = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: null,
      ExamID: null,
      SubClassID: null,
      SubjectID: "",
      PassNumber: "",
      MeariAction: false,
      MaxNumber: "",
      KeratAction: false,
    },
  });

  const { watch, handleSubmit, reset, setValue } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const [subjectAndPassNumberFilter, setSubjectAndPassNumberFilter] =
    useState(null);

  const {
    data: averageSubjectPassNumberData = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAverageSubjectPassNumberQuery(
    subjectAndPassNumberFilter?.SessionId &&
      subjectAndPassNumberFilter?.ExamId &&
      subjectAndPassNumberFilter?.SubClassId
      ? {
          SessionID: subjectAndPassNumberFilter?.SessionId,
          ExamID: subjectAndPassNumberFilter?.ExamId,
          SubClassID: subjectAndPassNumberFilter?.SubClassId,
        }
      : skipToken
  );

  const { data: subjectsData } = useGetAcademicSubjectsQuery();
  const [postAverageSubjectPassNumber] =
    usePostAverageSubjectPassNumberMutation();
  const [updateAverageSubjectPassNumber] =
    useUpdateAverageSubjectPassNumberMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Reset form when filters change
  useEffect(() => {
    if (
      subjectAndPassNumberFilter?.SessionId &&
      subjectAndPassNumberFilter?.ExamId &&
      subjectAndPassNumberFilter?.SubClassId
    ) {
      reset({
        SessionID: subjectAndPassNumberFilter.SessionId,
        ExamID: subjectAndPassNumberFilter.ExamId,
        SubClassID: subjectAndPassNumberFilter.SubClassId,
        SubjectID: "",
        PassNumber: "",
        MeariAction: false,
        MaxNumber: "",
        KeratAction: false,
        SubjectArabic: "",
      });
      setEditingId(null);
    }
  }, [subjectAndPassNumberFilter, reset]);

  const totalPages = Math.ceil(averageSubjectPassNumberData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return averageSubjectPassNumberData.slice(start, start + PAGE_SIZE);
  }, [averageSubjectPassNumberData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleEdit = (row) => {
    setEditingId(row.ID);
    setValue("SubjectID", row.BookID);
    setValue("PassNumber", row.PassNumber);
    setValue("MeariAction", row.MeariAction);
    setValue("MaxNumber", row.MaxNumber);
    setValue("KeratAction", row.KeratAction);
    setValue("SubjectArabic", row.SubjectArabic);
  };

  const handleCancelEdit = () => {
    reset({
      SessionID: subjectAndPassNumberFilter?.SessionId,
      ExamID: subjectAndPassNumberFilter?.ExamId,
      SubClassID: subjectAndPassNumberFilter?.SubClassId,
      SubjectID: "",
      PassNumber: "",
      MeariAction: false,
      MaxNumber: "",
      KeratAction: false,
      SubjectArabic: "",
    });
    setEditingId(null);
  };

  const onSubmit = async (data) => {
    try {
      // Validate required fields
      if (
        !subjectAndPassNumberFilter?.SessionId ||
        !subjectAndPassNumberFilter?.ExamId ||
        !subjectAndPassNumberFilter?.SubClassId
      ) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Form",
          text: "Please select Session, Exam, and Class/Jamaat first",
        });
        return;
      }

      if (!data.SubjectID) {
        Swal.fire({
          icon: "warning",
          title: "Subject Required",
          text: "Please select a subject",
        });
        return;
      }

      if (!data.PassNumber) {
        Swal.fire({
          icon: "warning",
          title: "Pass Number Required",
          text: "Please enter pass number",
        });
        return;
      }

      const payload = {
        SessionID: subjectAndPassNumberFilter.SessionId,
        ExamID: subjectAndPassNumberFilter.ExamId,
        SubClassID: subjectAndPassNumberFilter.SubClassId,
        BookID: data.SubjectID,
        PassNumber: data.PassNumber,
        MeariAction: data.MeariAction || false,
        MaxNumber: data.MaxNumber || 0,
        KeratAction: data.KeratAction || false,
        SubjectArabic: data.SubjectArabic,
      };

      let response;
      if (editingId) {
        // Update existing record
        response = await updateAverageSubjectPassNumber(payload).unwrap();
      } else {
        // Create new record
        response = await postAverageSubjectPassNumber(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: editingId ? "Updated Successfully" : "Successfully Saved",
        text: response?.message || "Data saved successfully",
      });

      // Refresh data and reset form
      await refetch();
      handleCancelEdit();
    } catch (error) {
      console.error("Submission error:", error);

      let errorMessage = "Failed to save data";
      if (error.status === 409) {
        errorMessage = "This record already exists for the selected criteria";
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleDelete = async (id) => {
    // const result = await Swal.fire({
    //   title: "Are you sure?",
    //   text: "This record will be deleted!",
    //   icon: "warning",
    //   showCancelButton: true,
    //   confirmButtonColor: "#3085d6",
    //   cancelButtonColor: "#d33",
    //   confirmButtonText: "Yes, delete it!",
    //   cancelButtonText: "Cancel",
    // });
    // if (result.isConfirmed) {
    //   try {
    //     // You'll need to implement the delete mutation in your API slice
    //     // await deleteAverageSubjectPassNumber(id).unwrap();
    //     await refetch();
    //     Swal.fire("Deleted!", "The record has been deleted.", "success");
    //   } catch (error) {
    //     Swal.fire("Error!", "Failed to delete the record.", "error");
    //   }
    // }
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEdit(row)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.ID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    { title: "SL", field: "ID", hozAlign: "center" },
    {
      title: translate("Session"),
      field: "SessionName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Session?.SessionName || ""),
    },
    {
      title: translate("Exam Name"),
      field: "ExamName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Exam?.ExamName || ""),
    },
    {
      title: translate("Class/Jamaat"),
      field: "ClassName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.SubClass?.ClassName || ""),
    },
    {
      title: translate("Book"),
      field: "SubjectName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Subject?.SubjectName || ""),
    },
    {
      title: translate("Arobi Book"),
      field: "SubjectArabic",
      hozAlign: "center",
      render: (row) => row.ArabicSubject || "",
    },
    {
      title: translate("Full-Size"),
      field: "MaxNumber",
      hozAlign: "center",
    },
    {
      title: translate("Pass Number"),
      field: "PassNumber",
      hozAlign: "center",
    },
    {
      title: translate("Meari Action"),
      field: "MeariAction",
      hozAlign: "center",
      render: (row) => (row.MeariAction ? "✔️" : "❌"),
    },
    {
      title: translate("Kerat Action"),
      field: "KeratAction",
      hozAlign: "center",
      render: (row) => (row.KeratAction ? "✔️" : "❌"),
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <form
          className="w-full space-y-10 bg-white p-6 rounded-xl shadow-md"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FilteringForm onFilter={setSubjectAndPassNumberFilter} />

          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Left Column - Exam & Class Selects */}
            <DefaultSelect
              options={subjectsData ?? []}
              registerKey="SubjectID"
              placeholder="বছর নির্বাচন করুন"
              nameField="SubjectName"
              valueField={"SubjectID"}
              label={translate("Subject") + " :"}
              unicode={true}
            />
            <DefaultInput
              registerKey="SubjectArabic"
              label={translate("Subject Arabic")}
              disable
            />
            <DefaultInput
              registerKey="PassNumber"
              label={translate("Pass Number")}
              type="number"
            />
            <div className="flex flex-col py-1 gap-4">
              <ExamRoutingCheckbox
                label={translate("Point Condition Status") + " :"}
                options={examAveragePasNumberStatus}
                registerKey="MeariAction"
                value={watch("MeariAction")}
              />
            </div>
            {/* Checkbox Group - কেরাত কন্ডিশন */}
            <div className="flex flex-col py-1 gap-4">
              <label className="text-sm font-semibold text-start text-gray-700 w-32 shrink-0">
                {translate("কেরাত কন্ডিশন টাইপ")}
              </label>
              <fieldset className="flex-1">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    id="KeratAction"
                    type="checkbox"
                    {...methods.register("KeratAction")}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500 rounded"
                  />
                  <label htmlFor="KeratAction">
                    {translate("কেরাত কন্ডিশন")}
                  </label>
                </div>
              </fieldset>
            </div>
          </div>

          {/* Submit and Reset Buttons */}
          <div className="flex justify-start gap-4">
            <Button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow transition"
            >
              {editingId ? translate("Update") : translate("Save")}
            </Button>
            {editingId && (
              <Button
                type="button"
                className="w-full md:w-auto !bg-[#22c55e] text-white"
                onClick={handleCancelEdit}
              >
                {translate("Reset")}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-3">
        <h2 className="text-xl font-semibold text-green-500 mb-3 font-SolaimanLipi">
          মোট বিষয় {averageSubjectPassNumberData.length} টি
        </h2>

        <p className="text-gray-600 mb-4 font-SolaimanLipi">
          উল্লেখিত সংখ্যা ব্যতীত অন্য কোনো সংখ্যা দ্বারা যদি মোট নাম্বার ভাগ
          দেওয়ার প্রয়োজন হয়, তাহলে নিচের বক্সে তা লিখে সেইভ বাটনে ক্লিক করুন।
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="সংখ্যা লিখুন"
          />

          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors whitespace-nowrap">
            সেইভ করুন
          </button>
        </div>
      </div>

      {/* Table section */}
    {/* Table Section */}
      <div className="mt-5">
        {isLoading || isFetching ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-700">Loading data...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg">
            <div className="text-center py-8 text-red-500">
              Error loading table data: {( isError).message}
            </div>
          </div>
        ) : averageSubjectPassNumberData?.length > 0 ||
          paginatedData?.length > 0 ? (
          <>
            <SortableTable
              columns={columns}
              data={paginatedData || averageSubjectPassNumberData}
              isLoading={isLoading || isFetching}
            />

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4">
                <div className="flex items-center space-x-2">
                  <button
                    className="p-1 border rounded disabled:opacity-50"
                    onClick={handlePrev}
                    disabled={currentPage === 1 || isLoading || isFetching}
                  >
                    <MdKeyboardArrowLeft size={24} />
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="p-1 border rounded disabled:opacity-50"
                    onClick={handleNext}
                    disabled={
                      currentPage === totalPages || isLoading || isFetching
                    }
                  >
                    <MdKeyboardArrowRight size={24} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg">
            <div className="text-gray-500 text-xl">
              {subjectAndPassNumberFilter ||
              (subjectAndPassNumberFilter?.SessionID &&
                subjectAndPassNumberFilter?.ExamID &&
                subjectAndPassNumberFilter?.SubClassID)
                ? "No data available for the selected filters"
                : "Please select all filters to view data"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectPassNumber;
