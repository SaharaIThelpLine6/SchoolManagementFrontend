import { useMemo, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../features/auth/authSlice";
import SortableTable from "../../components/Tables/SortableTable";
import useTranslate from "../../utils/Translate";
import DefaultPagination from "../../components/Pagination/DefaultPagination";

const PAGE_SIZE = 10;

// Custom 20 designation data
const monthData = [
  { MonthID: 1, MonthName: "January" },
  { MonthID: 2, MonthName: "February" },
  { MonthID: 3, MonthName: "March" },
  { MonthID: 4, MonthName: "April" },
  { MonthID: 5, MonthName: "May" },
];

const MonthTable = ({ pageTitle = "Designation List" }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(monthData.length / PAGE_SIZE);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monthData.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const columns = [
    { title: "Month No", field: "MonthID", hozAlign: "center" },
    {
      title: translate("Month Name"),
      field: "MonthName",
      hozAlign: "center",
    },
  ];

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      {/* Designation Table */}
      <SortableTable columns={columns} data={paginatedData} className="mt-6" />

      {/* Pagination Controls */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default MonthTable;
