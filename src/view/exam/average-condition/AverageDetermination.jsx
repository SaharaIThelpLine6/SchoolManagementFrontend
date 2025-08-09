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
import DefaultInput from "../../../components/Forms/DefaultInput";
import Swal from "sweetalert2";
import SortableTable from "../../../components/Tables/SortableTable";
import { FiEdit } from "react-icons/fi";
import FormColumn from "./FormColumn";
import SingleCheckbox from "../../../components/Checkboxes/SingleCheckbox";
import {
  useGetAverageExamConditionAllQuery,
  usePostAverageExamConditionSettingMutation,
  useUpdateAverageExamConditionSettingMutation,
} from "../../../features/exam/examQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";
import PointConditionFilteringForm from "../point-condition/PointConditionFilteringForm";
import { skipToken } from "@reduxjs/toolkit/query";
import Loading from "../../../components/Loading/Loading";

const PAGE_SIZE = 10;

const AverageDetermination = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const methods = useForm({
    defaultValues: {
      SessionID: null,
      ExamID: null,
      SubClassID: null,
      DivisionTopNumber: "",
      ...Object.fromEntries(
        Array.from({ length: 6 }).flatMap((_, i) => {
          const index = i + 1;
          return [
            [`DivisionNumber${index}`, ""],
            [`Division${index}`, ""],
            [`DivisionAra${index}`, ""],
            [`Color${index}`, false],
            [`TopNum${index}`, ""],
          ];
        })
      ),
    },
  });

  const { watch, handleSubmit, setValue, reset, getValues } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [averageDetermineFilter, setAverageDetermineFilter] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [postAverageExamConditionSetting] =
    usePostAverageExamConditionSettingMutation();
  const [updateAverageExamConditionSetting] =
    useUpdateAverageExamConditionSettingMutation();

  const {
    data: averageExamConditionAllData = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetAverageExamConditionAllQuery(
    averageDetermineFilter?.SessionID &&
      averageDetermineFilter?.ExamID &&
      averageDetermineFilter?.SubClassID
      ? {
          SessionID: averageDetermineFilter?.SessionID,
          ExamID: averageDetermineFilter?.ExamID,
          SubClassID: averageDetermineFilter?.SubClassID,
        }
      : skipToken
  );

  console.log(averageExamConditionAllData, "averageExamConditionAllData");
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  useEffect(() => {
    if (
      averageDetermineFilter?.SessionID &&
      averageDetermineFilter?.ExamID &&
      averageDetermineFilter?.SubClassID
    ) {
      reset({
        SessionID: averageDetermineFilter.SessionID,
        ExamID: averageDetermineFilter.ExamID,
        SubClassID: averageDetermineFilter.SubClassID,
      });
      setEditingId(null);
    }
  }, [averageDetermineFilter, reset]);

  const examConditionData = useMemo(() => {
    if (!averageExamConditionAllData) return [];
    return Array.isArray(averageExamConditionAllData)
      ? averageExamConditionAllData
      : [averageExamConditionAllData];
  }, [averageExamConditionAllData]);

  const totalPages = Math.ceil(examConditionData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examConditionData.slice(start, start + PAGE_SIZE);
  }, [examConditionData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleEdit = (row) => {
    setEditingId(row.ID);
    setValue("DivisionTopNumber", row.DivisionTopNumber);

    Array.from({ length: 6 }).forEach((_, i) => {
      const index = i + 1;
      setValue(`DivisionNumber${index}`, row[`DivisionNumber${index}`]);
      setValue(`Division${index}`, row[`Division${index}`]);
      setValue(`DivisionAra${index}`, row[`DivisionAra${index}`]);
      setValue(`Color${index}`, row[`Color${index}`] || false);
      setValue(`TopNum${index}`, row.HifzCondition[`TopNum${index}`]);
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        SessionID: averageDetermineFilter.SessionID,
        ExamID: averageDetermineFilter.ExamID,
        SubClassID: averageDetermineFilter.SubClassID,
      };

      let response;

      if (!editingId) {
        response = await postAverageExamConditionSetting(payload).unwrap();
      } else {
        response = await updateAverageExamConditionSetting(payload).unwrap();
      }

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
      }).then(() => {
        refetch();
        setSelectedRows([]);
        reset({
          SessionID: averageDetermineFilter.SessionID,
          ExamID: averageDetermineFilter.ExamID,
          SubClassID: averageDetermineFilter.SubClassID,
        });
        setEditingId(null);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি সৃজিত!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
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
    { title: translate("SL"), field: "ID", hozAlign: "center" },
    {
      title: translate("Session"),
      field: "SessionName",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Session.SessionName),
    },
    {
      title: translate("Exam"),
      field: "ExamID",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.Exam.ExamName),
    },
    {
      title: translate("Class/Jamaat"),
      field: "SubClass",
      hozAlign: "center",
      render: (row) => bnBijoy2Unicode(row.SubClass.SubClass),
    },
    {
      title: translate(">=1"),
      field: "DivisionNumber1",
      hozAlign: "center",
    },
    {
      title: translate("Division-1"),
      field: "Division1",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-1"),
      field: "DivisionAra1",
      hozAlign: "center",
    },
    {
      title: translate(">=2"),
      field: "DivisionNumber2",
      hozAlign: "center",
    },
    {
      title: translate("Division-2"),
      field: "Division2",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-2"),
      field: "DivisionAra2",
      hozAlign: "center",
    },
    {
      title: translate(">=3"),
      field: "DivisionNumber3",
      hozAlign: "center",
    },
    {
      title: translate("Division-3"),
      field: "Division3",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-3"),
      field: "DivisionAra3",
      hozAlign: "center",
    },
    {
      title: translate(">=4"),
      field: "DivisionNumber4",
      hozAlign: "center",
    },
    {
      title: translate("Division-4"),
      field: "Division4",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-4"),
      field: "DivisionAra4",
      hozAlign: "center",
    },
    {
      title: translate(">=5"),
      field: "DivisionNumber5",
      hozAlign: "center",
    },
    {
      title: translate("Division-5"),
      field: "Division5",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-5"),
      field: "DivisionAra5",
      hozAlign: "center",
    },
    {
      title: translate(">=6"),
      field: "DivisionNumber6",
      hozAlign: "center",
    },
    {
      title: translate("Division-6"),
      field: "Division6",
      hozAlign: "center",
    },
    {
      title: translate("Division Arabic-6"),
      field: "DivisionAra6",
      hozAlign: "center",
    },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <PointConditionFilteringForm onFilter={setAverageDetermineFilter} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
            <div className="flex flex-col space-y-3">
              <DefaultInput
                registerKey="DivisionTopNumber"
                label={translate("Highest score")}
                type="number"
                labelPosition="left"
                require={"This is required!"}
              />
              {[...Array(6)].map((_, i) => (
                <DefaultInput
                  key={`score-threshold-${i + 1}`}
                  registerKey={`DivisionNumber${i + 1}`}
                  label={`${translate(i + 1 === 1 ? "If >=" : "Or If >=")}`}
                  type="number"
                  labelPosition="left"
                  require={"This is required!"}
                />
              ))}
            </div>

            <FormColumn
              title="Bangla"
              inputs={Array(6)
                .fill()
                .map((_, i) => ({
                  registerKey: `Division${i + 1}`,
                  label: "তাহলে ডিভিশন",
                  type: "text",
                }))}
            />

            <FormColumn
              title="Arabic"
              inputs={Array(6)
                .fill()
                .map((_, i) => ({
                  registerKey: `DivisionAra${i + 1}`,
                  type: "text",
                }))}
            />

            <div className="flex flex-col space-y-2">
              <div className="flex justify-center items-center my-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  {translate("Highest recitation score")}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {Array(6)
                  .fill()
                  .map((_, i) => (
                    <div key={i + 1} className="flex items-center gap-2">
                      <SingleCheckbox
                        label={translate("Silver Color")}
                        registerKey={`Color${i + 1}`}
                      />
                      <div className="flex-1">
                        <DefaultInput
                          registerKey={`TopNum${i + 1}`}
                          type="number"
                          placeholder={translate("Score value")}
                          require={true}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="w-full flex gap-2 flex-wrap">
            <Button type="submit" className="w-full md:w-auto">
              {translate("Save")}
            </Button>
            {editingId && (
              <Button
                type="button"
                className="w-full md:w-auto !bg-[#ddd] !text-black"
                onClick={() => {
                  const { SessionID, ExamID, SubClassID } = getValues();
                  reset({ SessionID, ExamID, SubClassID });
                  setEditingId(null);
                }}
              >
                {translate("Reset")}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>

      {/* Table Section */}
      <div className="mt-5">
        {isLoading || isFetching ? (
              <Loading/>
         
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg">
            <div className="text-center py-8 text-red-500">
              {translate("Data Not Found")} {isError.message}
            </div>
          </div>
        ) : averageExamConditionAllData?.length > 0 ||
          paginatedData?.length > 0 ? (
          <>
            <SortableTable
              columns={columns}
              data={paginatedData || averageExamConditionAllData}
              isLoading={isLoading || isFetching}
              isFilterColumn={false}
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
              {averageDetermineFilter ||
              (averageDetermineFilter?.SessionID &&
                averageDetermineFilter?.ExamID &&
                averageDetermineFilter?.SubClassID)
                ? translate("No data available for the selected filters")
                : translate("Please select all filters to view data")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AverageDetermination;
