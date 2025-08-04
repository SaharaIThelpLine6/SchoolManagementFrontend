import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { FiEdit } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

import { setPageName } from "../features/auth/authSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import {
  useDeleteExamFeeSettingMutation,
  useGetExamFeeSettingQuery,
  useGetExamNamesQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../features/exam/examQuerySlice";

import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";

import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import StudentFeeGroup from "../view/exam/StudentFeeGroup";
import { useGetNameOFExamFeeQuery } from "../features/feeCollection/feeCollectionSlice";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";

const PAGE_SIZE = 10;

const PointBasedResultEntry = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const navigate = useNavigate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false);

  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();
  const [deleteExamFeeSetting] = useDeleteExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: nameOfExamFeeData } = useGetNameOFExamFeeQuery();
  const { data: residentialData } = useGetResidentialQuery();

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery();

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleShowStudentFeeGroup = () => {
    setShowStudentFeeGroup(true);
  };

  // Update Handle
  const handleEdit = (row) => {
    methods.reset({
      ID: row.ID,
      SessionID: row.SessionID,
      ExamID: row.ExamID,
      SubClassID: row.SubClassID,
      Fee: row.Fee,
      SLID: row.SLID,
    });
  };

  // Delete Exam Feee Setting data
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "একবার মুছে ফেলা হলে পুনরুদ্ধার করা যাবে না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteExamFeeSetting(id).unwrap();

        Swal.fire({
          icon: "success",
          title: "সফলভাবে মুছে ফেলা হয়েছে",
          text: response?.message || "ডেটা সফলভাবে মুছে ফেলা হয়েছে।",
        });

        refetch(); // Reload table
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "ত্রুটি ঘটেছে!",
          text:
            error?.data?.message ||
            error?.data?.error ||
            "ডেটা মুছে ফেলতে ব্যর্থ হয়েছে।",
        });
        console.error("Delete error:", error);
      }
    }
  };

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    if (!data.SessionID || !data.SubClassID || !data.ExamID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass এবং Exam নির্বাচন করুন।",
      });
      return;
    }

    const payload = {
      SessionID: Number(data.SessionID),
      ExamID: Number(data.ExamID),
      SubClassID: Number(data.SubClassID),
      Fee: Number(data.Fee),
      SLID: data.SLID,
    };

    try {
      let response;
      if (data.ID) {
        response = await updateExamFeeSetting({
          id: data.ID,
          body: payload,
        }).unwrap();
      } else {
        response = await postExamFeeSetting(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "Exam Fee Setting সফলভাবে সংরক্ষিত হয়েছে।",
      }).then(() => {
        refetch();
        methods.reset();
      });
    } catch (error) {
      const errMsg =
        error?.data?.message ||
        error?.data?.error ||
        "অজানা একটি ত্রুটি ঘটেছে।";
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: errMsg,
      });
      console.error("Exam Fee Setting Error:", error);
    }
  };

  // Table Data Columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => navigate(`/result/${row?.ID}`)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          {/* <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            onClick={() => handleDelete(row.ID)}
          >
            <MdDelete className="w-5 h-5" />
          </button> */}
        </div>
      ),
    },
    {
      title: translate("ID"),
      hozAlign: "center",
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("Session"),
      hozAlign: "center",
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate("Exam Name"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate("Class/Jamaat"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate("Fee Name"),
      field: "SLID",
      hozAlign: "center",
    },
    {
      title: translate("Fee"),
      field: "Fee",
      hozAlign: "center",
    },
    {
      title: translate("Status"),
      field: "status",
      hozAlign: "center",
      headerHozAlign: "center",
      width: 150,
      render: (row) => {
        const status = 1;
        const isPublished = status === 1;

        return (
          <button
            className={`px-3 py-1 rounded text-sm font-medium ${
              isPublished ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}
          >
            {isPublished ? "প্রকাশিত" : "প্রকাশিত হয়নি"}
          </button>
        );
      },
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between pt-5">
        <h3 className="text-base sm:text-[20px] font-bold">
          {translate("Point Result Entry")}
        </h3>{" "}
        <Button onClick={() => navigate("/result/create")}>
          {translate("New Result Create")}
        </Button>
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...methods.register("ID")} />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <DefaultSelect
              label={translate("Session") + ":"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode={true}
            />
            <DefaultSelect
              label={translate("Exam Name") + ":"}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode={true}
            />
            <DefaultSelect
              label={translate("Class/Jamaat") + ":"}
              options={subClassListData ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
            />
          </div>
        </form>
      </FormProvider>

      <div className="mt-5">
        {isExamFeeSettingLoading ? (
          <Loading />
        ) : isExamFeeSettingError ? (
          <div className="text-red-500 text-center py-4">
            {translate("Failed to load exam fee settings. Please try again.")}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handlePrev}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={24} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="p-1 border rounded disabled:opacity-50"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointBasedResultEntry;
