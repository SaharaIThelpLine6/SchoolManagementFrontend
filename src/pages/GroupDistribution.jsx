import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../utils/Translate";
import { showModal } from "../utils/ModalControlar";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import Button from "../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";

const PAGE_SIZE = 10;

const GroupDistribution = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

  const academicYearOptions = [];
  const classOptions = [];
  const genderOptions = [];
  const subClassOptions = [];
  // Sample data
  const groupDistributionData = [
    {
      ID: "S001",
      StudentName: "আহমেদ রহমান",
      CurrentGroup: "A",
      NewGroup: "B",
    },
    {
      ID: "S002",
      StudentName: "ফাতেমা আক্তার",
      CurrentGroup: "B",
      NewGroup: "A",
    },
    {
      ID: "S003",
      StudentName: "করিম উদ্দিন",
      CurrentGroup: "C",
      NewGroup: "D",
    },
    {
      ID: "S004",
      StudentName: "সুমাইয়া ইসলাম",
      CurrentGroup: "D",
      NewGroup: "C",
    },
    { ID: "S005", StudentName: "আজিজুল হক", CurrentGroup: "E", NewGroup: "F" },
    {
      ID: "S006",
      StudentName: "হাসান মাহমুদ",
      CurrentGroup: "F",
      NewGroup: "E",
    },
    {
      ID: "S007",
      StudentName: "ফারজানা খাতুন",
      CurrentGroup: "G",
      NewGroup: "H",
    },
    { ID: "S008", StudentName: "ইমরান", CurrentName: "H", NewGroup: "G" },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(groupDistributionData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return groupDistributionData.slice(start, start + PAGE_SIZE);
  }, [groupDistributionData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleOpenModal = useCallback(() => {
    showModal(translate("Group Distribution Create"), "ADD_GROUP_DISTRIBUTION");
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate("Group Distribution Update"),
        "EDIT_GROUP_DISTRIBUTION",
        id
      );
    },
    [translate]
  );

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(paginatedData.map((row) => row.ID));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (e, id) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSave = () => {
    // Logic to save selected rows
    console.log("Saving selected rows:", selectedRows);
  };

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Group Distribution List")}
        </h3>
        {/* <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          SAVE
        </button> */}
      </div>
      <FormProvider {...methods}>
        <form className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            {/* Left Column */}
            <div className="flex flex-col space-y-4">
              <DefaultSelect
                label={
                  <p className="text-gray-700 font-medium">শিক্ষাবর্ষ :</p>
                }
                options={academicYearOptions}
                valueField="id"
                nameField="value"
                registerKey="academicYear"
              />

              <DefaultSelect
                label={
                  <p className="text-gray-700 font-medium">মারহালা/ক্লাশ:</p>
                }
                options={classOptions}
                valueField="id"
                nameField="value"
                registerKey="class"
              />

              <DefaultSelect
                label={<p className="text-gray-700 font-medium">লিঙ্গ:</p>}
                options={genderOptions}
                valueField="id"
                nameField="value"
                registerKey="gender"
              />
            </div>

            {/* Right Column */}
            <div className="flex flex-col space-y-4">
              <DefaultInput
                label={
                  <p className="text-gray-700 font-medium">সাব ক্লাস আইডি :</p>
                }
                type="number"
                placeholder="সাব ক্লাস আইডি লিখুন"
                registerKey="subClassId"
              />

              <DefaultSelect
                label={<p className="text-gray-700 font-medium">সাব ক্লাস :</p>}
                options={subClassOptions}
                valueField="id"
                nameField="value"
                registerKey="subClass"
              />

              {/* Button */}
              <div className="pt-7 w-full">
                <Button type="submit" className="w-full md:w-auto">
                  সংরক্ষণ করুন
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="w-full overflow-x-auto mt-4">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-center border">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.length === paginatedData.length}
                />
              </th>
              <th className="p-2 text-center border">আইডি</th>
              <th className="p-2 text-center border">শিক্ষার্থীর নাম</th>
              <th className="p-2 text-center border">সাব ক্লাস</th>
              <th className="p-2 text-center border">অবস্থান</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row.ID}
                className={`${
                  selectedRows.includes(row.ID)
                    ? "bg-purple-200"
                    : index % 2 === 0
                    ? "bg-gray-50"
                    : ""
                }`}
              >
                <td className="p-2 text-center border">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.ID)}
                    onChange={(e) => handleRowSelect(e, row.ID)}
                  />
                </td>
                <td className="p-2 text-center border">{row.ID}</td>
                <td className="p-2 text-center border">{row.StudentName}</td>
                <td className="p-2 text-center border">{row.CurrentGroup}</td>
                <td className="p-2 text-center border">{row.NewGroup}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
        >
          <MdKeyboardArrowLeft className="text-lg" />
          {translate("Prev")}
        </button>

        <span className="text-sm font-medium text-gray-700">
          {translate("Page")} {currentPage} {translate("of")} {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
        >
          {translate("Next")}
          <MdKeyboardArrowRight className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default GroupDistribution;
