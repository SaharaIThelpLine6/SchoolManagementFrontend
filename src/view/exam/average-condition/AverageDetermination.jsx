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
import { useGetClassListQuery } from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";

import SortableTable from "../../../components/Tables/SortableTable";
import { useGetDesignationQuery } from "../../../features/teachers/teachersSlice";
import { FiEdit } from "react-icons/fi";
import StudentFeeGroup from "../../../view/exam/StudentFeeGroup";

const PAGE_SIZE = 10;

const AverageDetermination = ({ pageTitle, title }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showStudentFeeGroup, setShowStudentFeeGroup] = useState(false); // State to toggle components

  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];

  const {
    data: designation = [],
    isLoading: isdLoading,
    isError: isdError,
  } = useGetDesignationQuery();
  const { data: classListData } = useGetClassListQuery();




  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    try {
      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      // const response = await postChnageStudentGroup({
      //   id: data.SubClassID,
      //   body: { admissionIds: selectedRows },
      // }).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
      }).then(() => {
        refetch();
        setSelectedRows([]);
        methods.reset();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
      console.error("Error updating student group:", error);
    }
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
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    { title: "SL", field: "SL", hozAlign: "center" },
    {
      title: translate("Session"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Exam Name"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Class/Jamaat"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Fee Name"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Fee"),
      field: "Designation",
      hozAlign: "center",
    },
  ];

  if (showStudentFeeGroup) {
    return <StudentFeeGroup onBack={setShowStudentFeeGroup} />;
  }

  return (
    <div>
      {/* <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate(title)}
        </h3>
      </div> */}

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col sm:flex-row my-5 gap-5">
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />

            <DefaultSelect
              label={
                <p className="text-gray-700 font-medium">
                  {translate("Class/Jamaat")}:
                </p>
              }
              options={genderOptions}
              valueField="id"
              nameField="value"
              registerKey="gender"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-base font-semibold text-gray-800">
                  {translate("Average Condition")}
                </h2>
              </div>

              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("Highest score")}`}
                type={"text"}
                labelPosition="left"
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("If >=")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("Or If >=")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("Or If >=")}`}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("Or If >=")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("Or If >=")}`}
                labelPosition="left"
                type={"text"}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-base font-semibold text-gray-800">
                  {translate("Bangla")}
                </h2>
              </div>
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")} `}
                type={"text"}
                labelPosition="left"
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")} `}
                labelPosition="left"
                type={"text"}
              />
              <DefaultInput
                registerKey={"StudentName"}
                label={`${translate("তাহলে ডিভিশন")}`}
                labelPosition="left"
                type={"text"}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-base font-semibold text-gray-800">
                  {translate("Arabic")}
                </h2>
              </div>
              <DefaultInput registerKey={"StudentName"} type={"text"} />
              <DefaultInput registerKey={"StudentName"} type={"text"} />
              <DefaultInput registerKey={"StudentName"} type={"text"} />
              <DefaultInput registerKey={"StudentName"} type={"text"} />
              <DefaultInput registerKey={"StudentName"} type={"text"} />
              <DefaultInput registerKey={"StudentName"} type={"text"} />
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {translate("Highest recitation score")}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Checkbox-Input Pair 1 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="silverColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="silverColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"StudentName"}
                      type={"text"}
                      label=""
                      placeholder="Student name"
                    />
                  </div>
                </div>

                {/* Checkbox-Input Pair 2 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="goldColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="goldColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"Score1"}
                      type={"number"}
                      label=""
                      placeholder="Score value"
                    />
                  </div>
                </div>

                {/* Checkbox-Input Pair 3 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="bronzeColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="bronzeColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"Score2"}
                      type={"number"}
                      label=""
                      placeholder="Score value"
                    />
                  </div>
                </div>

                {/* Checkbox-Input Pair 4 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="platinumColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="platinumColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"Score3"}
                      type={"number"}
                      label=""
                      placeholder="Score value"
                    />
                  </div>
                </div>

                {/* Checkbox-Input Pair 5 */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="diamondColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="diamondColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"Score4"}
                      type={"number"}
                      label=""
                      placeholder="Score value"
                    />
                  </div>
                </div>
                {/* Checkbox-Input Pair 6*/}
                <div className="flex items-center gap-2">
                  <div className="flex items-center w-1/4 min-w-[110px]">
                    <input
                      type="checkbox"
                      id="diamondColor"
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="diamondColor"
                      className="ml-2 block text-base text-gray-700"
                    >
                      {translate("Silver color")}
                    </label>
                  </div>
                  <div className="flex-1">
                    <DefaultInput
                      registerKey={"Score4"}
                      type={"number"}
                      label=""
                      placeholder="Score value"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <Button type="submit" className="w-full md:w-auto">
              {translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className="mt-5">
        <SortableTable columns={columns} data={paginatedData} />
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


export default AverageDetermination