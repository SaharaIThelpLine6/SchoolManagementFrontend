import React from "react";
import { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";
import Input from "../../../components/Input/Input";
import SvgIcon from "../../../components/icons/SvgIcon";
import DefaultPagination from "../../../components/Pagination/DefaultPagination";

const PAGE_SIZE = 5; // Reduced page size for better demonstration

const OthersTable = ({ pageTitle, setMobileNumbers, mobileNumbers }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  // State for mobile numbers
  const [errors, setErrors] = useState({});

  // Check if a number is a valid Bangladeshi mobile prefix
  const isValidPrefix = (num) => {
    if (!num) return false;
    const prefix = num.substring(0, 3);
    return ["013", "014", "015", "016", "017", "018", "019"].includes(prefix);
  };

  // Check if a number is complete (11 digits)
  const isCompleteNumber = (num) => {
    return num && num.length === 11 && /^\d+$/.test(num);
  };

  // Check for duplicate numbers
  const hasDuplicates = (numbers, currentIndex) => {
    const currentNumber = numbers[currentIndex];
    if (!currentNumber) return false;

    return numbers.some(
      (num, index) => index !== currentIndex && num === currentNumber
    );
  };

  // Handle mobile number input change
  const handleMobileChange = (index, value) => {
    // Allow only numbers and limit to 11 characters
    const cleanedValue = value.replace(/\D/g, "").substring(0, 11);

    const newNumbers = [...mobileNumbers];
    newNumbers[index] = cleanedValue;
    setMobileNumbers(newNumbers);

    // Validate the input
    const newErrors = { ...errors };

    if (cleanedValue && !isValidPrefix(cleanedValue)) {
      newErrors[index] = translate("Invalid Bangladeshi mobile prefix");
    } else if (cleanedValue && !isCompleteNumber(cleanedValue)) {
      newErrors[index] = translate("Mobile number must be 11 digits");
    } else if (hasDuplicates(newNumbers, index)) {
      newErrors[index] = translate("This number already exists");
    } else {
      delete newErrors[index];
    }
    setErrors(newErrors);

    // Add new field if current field has valid prefix and is complete
    if (isValidPrefix(cleanedValue)) {
      if (isCompleteNumber(cleanedValue)) {
        // Check if this is the last field and it's not empty
        if (index === mobileNumbers.length - 1 && cleanedValue) {
          setMobileNumbers([...newNumbers, ""]);
        }
      }
    }
  };

  // Handle delete mobile number
  const handleDeleteMobile = (index) => {
    // Don't allow deletion if there's only one empty field
    if (mobileNumbers.length === 1 && mobileNumbers[0] === "") {
      return;
    }

    const newNumbers = [...mobileNumbers];
    newNumbers.splice(index, 1);
    setMobileNumbers(newNumbers);

    // Remove corresponding error if exists
    const newErrors = { ...errors };
    delete newErrors[index];

    // Revalidate remaining numbers for duplicates
    newNumbers.forEach((num, i) => {
      if (num && hasDuplicates(newNumbers, i)) {
        newErrors[i] = translate("This number already exists");
      } else if (newErrors[i] === translate("This number already exists")) {
        delete newErrors[i];
      }
    });

    setErrors(newErrors);
  };

  // Check if delete button should be disabled
  const isDeleteDisabled = (index) => {
    // Disable if it's the only field
    if (mobileNumbers.length === 1) return true;

    // Disable if it's the last field and empty, and there are other non-empty fields
    if (
      index === mobileNumbers.length - 1 &&
      mobileNumbers[index] === "" &&
      mobileNumbers.some((num, i) => i !== index && num !== "")
    ) {
      return true;
    }

    return false;
  };

  // Generate paginated table data from mobile numbers
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(mobileNumbers.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return mobileNumbers
      .map((number, index) => ({ id: index, mobile: number }))
      .slice(start, start + PAGE_SIZE);
  }, [mobileNumbers, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className={`p-2 text-white rounded-md ${
              isDeleteDisabled(row.id)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
            title="Delete"
            onClick={() =>
              !isDeleteDisabled(row.id) && handleDeleteMobile(row.id)
            }
            disabled={isDeleteDisabled(row.id)}
          >
            <SvgIcon name={"FaTrash"} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate("Mobile Number"),
      field: "mobile",
      hozAlign: "center",
      render: (row) => (
        <div className="flex flex-col justify-center items-center gap-1">
          <Input
            value={row.mobile}
            onChange={(e) => handleMobileChange(row.id, e.target.value)}
            placeholder="017XXXXXXXX"
            error={!!errors[row.id]}
            helperText={errors[row.id]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-center items-center mb-4 border-b border-[#e9edf4] py-5 pt-0">
        <h3 className="text-base md:text-lg font-bold">
          {translate("To create a list of mobile numbers by typing")}
        </h3>
      </div>
      <SortableTable
        columns={columns}
        data={paginatedData}
        isFilterColumn={false}
      />
      {/* Pagination Controls */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default OthersTable;
