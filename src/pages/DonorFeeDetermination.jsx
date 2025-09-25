import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { setPageName } from "../features/auth/authSlice";
import { useGetExamFeeSettingQuery } from "../features/exam/examQuerySlice";
import useTranslate from "../utils/Translate";
import bnBijoy2Unicode from "../utils/conveter";
import SortableTable from "../components/Tables/SortableTable";
import Loading from "../components/Loading/Loading";
import AddNewDonation from "../view/donation/AddNewDonation";
import DefaultSelect from "../components/Forms/DefaultSelect";
import EditButton from "../components/Button/EditButton";
import DeleteButton from "../components/Button/DeleteButton";
import SvgIcon from "../components/icons/SvgIcon";
import DefaultPagination from "../components/Pagination/DefaultPagination";

const PAGE_SIZE = 10;

const DonorFeeDetermination = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

  const [currentPage, setCurrentPage] = useState(1);

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
  // const handleOpenModal = (row) => {
  //   showModal("Add New Donation", "ADD_NEW_DONATION");
  // };
  //   const handleEdit = (row) => {
  //     showModal(
  //       "Accounting dues list Statement",
  //       "ACCOUNTING_DUES_LIST_STATEMENT"
  //     );
  //   };

  // Table Data Columns
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEdit(row)} />
          <DeleteButton onClick={() => handleDelete(row)} />
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
      title: translate("Code"),
      hozAlign: "center",
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate("Donor Name"),
      hozAlign: "center",
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate("Sectors"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate("Start"),
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate("End"),
      field: "SLID",
      hozAlign: "center",
    },
    {
      title: translate("Total"),
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
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold">
          {translate("Donation")}
        </h3>
        {/* <Button onClick={handleOpenModal}>{translate("Add New Donation")}</Button> */}
      </div>
      <AddNewDonation />
      <FormProvider {...methods}>
        <div className="flex justify-center gap-3 items-center h-full">
          <h2 className="text-lg font-semibold text-gray-700">
            {translate("Filter")}
          </h2>

          <DefaultSelect
            label="Search Type"
            options={SearchTypes ?? []}
            valueField="ID"
            nameField="Name"
            registerKey="searchType1"
          />

          <DefaultSelect
            label="Search Type"
            options={SearchTypes ?? []}
            valueField="ID"
            nameField="Name"
            registerKey="searchType2"
          />
        </div>
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

export default DonorFeeDetermination;
