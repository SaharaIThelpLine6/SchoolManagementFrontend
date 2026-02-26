import { useMemo, useState } from "react";
import { useGetUserTypesQuery } from "../features/userType/userTypeSlice";
import { useGetExamFeeSettingQuery } from "../features/exam/examQuerySlice";
import DefaultSelect from "../components/Forms/DefaultSelect";
import SortableTable from "../components/Tables/SortableTable";
import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";
import Loading from "./Loading/Loading";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "./Forms/DefaultInput";
import DefaultPagination from "./Pagination/DefaultPagination";
import SvgIcon from "./icons/SvgIcon";

const PAGE_SIZE = 10;

const UserSearch = () => {
  const translate = useTranslate();
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: UserTypeData } = useGetUserTypesQuery();

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
  } = useGetExamFeeSettingQuery();

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);



  const handleEdit = (row) => {
    console.log("Edit clicked for row:", row);
  };

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
             <SvgIcon
              name={"FaEye"}
              size={14}
            />
          </button>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
            <SvgIcon
              name={"GrDrag"}
              size={14}
            />
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

  const SearchTypes = [
    { ID: "1", Name: translate("User Code") },
    { ID: "2", Name: translate("User Name") },
    { ID: "3", Name: translate("Mobile 1") },
  ];

  return (
    <div>
      <FormProvider {...methods}>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DefaultSelect
            label="User Types"
            options={UserTypeData ?? []}
            valueField="ID"
            nameField="TypeName"
            registerKey={`ID`}
            unicode={true}
          />{" "}
          <DefaultSelect
            label="Search Type"
            options={SearchTypes ?? []}
            valueField="ID"
            nameField="Name"
            registerKey={`ID`}
          />
          <DefaultInput
            label="User Code"
            valueField="SessionID"
            nameField="SessionName"
            registerKey={`SessionID`}
          />
        </div>
      </FormProvider>

      {/* Table */}
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
      {totalPages > 1 && (
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default UserSearch;
