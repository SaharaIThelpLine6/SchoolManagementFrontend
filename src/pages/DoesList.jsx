import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";

import { setPageName } from "../features/auth/authSlice";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useGetClassListQuery, useGetSubClassListQuery } from "../features/class/classQuerySlice";
import {
  useGetExamFeeSettingQuery,
  usePostExamFeeSettingMutation,
  useUpdateExamFeeSettingMutation,
} from "../features/exam/examQuerySlice";

import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";

import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import DefaultSelect from "../components/Forms/DefaultSelect";
import Button from "../components/Button/Button";
import RadioOption from "../components/Radio/RadioOption";
import DefaultSearchInput from "../components/Forms/DefaultSearchInput";
import { showModal } from "../utils/ModalControlar";

const PAGE_SIZE = 10;

import DefaultPagination from "../components/Pagination/DefaultPagination";
import SvgIcon from "../components/icons/SvgIcon";

const DoesList = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;

  const [currentPage, setCurrentPage] = useState(1);
  // Create an array to track visibility for each select (12 columns)



  const [postExamFeeSetting] = usePostExamFeeSettingMutation();
  const [updateExamFeeSetting] = useUpdateExamFeeSettingMutation();

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();

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



  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Update Handle
  const handleEdit = (row) => {
    showModal(
      "Accounting dues list Statement",
      "ACCOUNTING_DUES_LIST_STATEMENT"
    );

    // methods.reset({
    //   ID: row.ID,
    //   SessionID: row.SessionID,
    //   ExamID: row.ExamID,
    //   SubClassID: row.SubClassID,
    //   Fee: row.Fee,
    //   SLID: row.SLID,
    // });
  };

  // Data Create Exam Fee Setting
  const onSubmit = async (data) => {
    console.log(data);
    
    if (!data.SessionID || !data.ClassID) {
      Swal.fire({
        icon: "warning",
        title: "ফর্ম অসম্পূর্ণ",
        text: "Session, SubClass নির্বাচন করুন।",
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
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md"
            title="View"
            onClick={() => handleEdit(row)}
          >
            <SvgIcon name={"FaEye"} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={"GrDrag"} size={16} />
        </div>
      ),
      hozAlign: "center",
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("User ID"),
      hozAlign: "center",
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("Class/Jamaat"),
      hozAlign: "center",
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate("Mobile"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate("Due"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate("ID"),
      field: "SLID",
      hozAlign: "center",
    },
  ];

  const duesTypeOptions = [
    { id: "1", label: translate("Creditor") },
    { id: "2", label: translate("Debtor") },
    { id: "3", label: translate("Both") }
  ];
  const searchOptions = [
    { id: "1", label: translate("With ID") },
    { id: "2", label: translate("With Name") },
  ];
  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold">
          {translate("Dues list and dues messages of all students")}
        </h3>
        <button
          className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Settings"
          //   onClick={handleOpenModal}
        >
          <SvgIcon name={"IoMdSettings"} size={20} />
        </button>
      </div>

      <FormProvider {...methods}>
        <form
          className="w-full space-y-4 md:space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input type="hidden" {...methods.register("ID")} />

          {/* Top Section - 4 responsive columns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 my-3">
            <DefaultSelect
              label="Session"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode={true}
            />
            <DefaultSelect
              label="Class"
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
              unicode={true}
            />
            {/* Selection Fieldset */}
            <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px]">
              <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
                {translate("Dues Types")}
              </legend>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
                {duesTypeOptions.map((option) => (
                  <RadioOption
                    key={option.id}
                    option={option}
                    register={methods.register}
                    name="DueType"
                  />
                ))}
              </div>
            </fieldset>
            {/* Selection Fieldset */}
            <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px]">
              <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
                {translate("Search Type")}
              </legend>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
                {searchOptions.map((option) => (
                  <RadioOption
                    key={option.id}
                    option={option}
                    register={methods.register}
                    name="SearchType"
                  />
                ))}
              </div>
            </fieldset>
            <DefaultSearchInput
              label="অনুসন্ধান"
              placeholder="যেকোনো কীওয়ার্ড লিখুন..."
              registerKey="searchQuery"
              require={true}
              unicode={true}
              labelPosition="top"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto">
              {translate("View")}
            </Button>
          </div>
        </form>
      </FormProvider>

      {/* Table Section */}
      <div className="mt-5 overflow-x-auto">
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

      {/* Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DoesList;
