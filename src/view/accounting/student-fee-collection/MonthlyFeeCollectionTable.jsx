import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { useGetFeeLandByAdmissionQuery } from '../../../features/feeCollection/feeCollectionSlice';
import { setMonthFeeData } from '../../../features/student/studentSlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const PAGE_SIZE = 12;

const MonthlyFeeCollectionTable = () => {
  const translate = useTranslate();
  const dispatch = useDispatch();

  // Selector hook - always call at the top level
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );
  // Selector hook - always call at the top level
  const { studentMonthFeeListsData = [] } = useSelector(
    (state) => state.settings
  );

  const admissionId = filteredSelectedPerStudentFee?.AdmissionID;

  // All hooks called unconditionally at the top level
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);

  // API query hook with proper error handling
  const { data, error, isLoading, isError, isSuccess } =
    useGetFeeLandByAdmissionQuery(
      { id: admissionId },
      {
        skip: !admissionId,
        refetchOnMountOrArgChange: true,
      }
    );

  // Compute monthFeeList with proper error handling
  const monthFeeList = useMemo(() => {
    if (!data?.feeDetails || !data?.monthDetails) {
      return [];
    }

    try {
      const { feeDetails, monthDetails } = data;

      return Array.from({ length: 12 }, (_, i) => {
        const index = i + 1;
        const fee = Number(feeDetails[`Fee${index}`]) || 0;
        const less = Number(feeDetails[`Less${index}`]) || 0;
        const paid = Number(feeDetails[`M${index}`]) || 0;

        const untouched = paid === 0 && less === 0;
        const closeMonth = Number(fee) === 0 && Number(paid) === 0;

        const isFree =
          !untouched &&
          (paid === 0 || paid === null) &&
          less === fee &&
          fee > 0;
        const isFullPaid = !isFree && fee > 0 && paid + less === fee;
        const due =
          !isFree && !isFullPaid && !untouched ? fee - (paid + less) : 0;

        return {
          monthId: index,
          monthName: monthDetails[`Month${index}`] || 'N/A',
          prescribedFee: fee,
          acceptedFees: paid,
          discount: less,
          due,
          isFree,
          isFullPaid,
          untouched,
          closeMonth,
          originalData: {
            // Keep original data for reference
            feeDetails: feeDetails,
            monthDetails: monthDetails,
          },
        };
      });
    } catch (error) {
      return [];
    }
  }, [data]);

  // Check if month is paid from studentMonthFeeListsData
  const isMonthPaid = useCallback(
    (monthId) => {
      return studentMonthFeeListsData.some((item) => item.MonthId === monthId);
    },
    [studentMonthFeeListsData]
  );

  // Get paid month data
  const getPaidMonthData = useCallback(
    (monthId) => {
      return studentMonthFeeListsData.find((item) => item.MonthId === monthId);
    },
    [studentMonthFeeListsData]
  );

  // Initialize form state with monthFeeList
  useEffect(() => {
    if (monthFeeList.length > 0 && isSuccess) {
      try {
        const defaultValues = {
          monthFeeList: monthFeeList.map((item) => ({
            ...item,
            comment: '',
            status: false,
          })),
        };
        methods.reset(defaultValues, {
          keepDirty: false,
          keepTouched: false,
          keepDefaultValues: false,
        });
        console.log('Form state initialized with monthFeeList:', defaultValues);
      } catch (error) {
        console.error('Error initializing form:', error);
      }
    }
  }, [monthFeeList, methods, isSuccess]);

  // Compute paginated data
  const totalPages = Math.ceil(monthFeeList.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monthFeeList.slice(start, start + PAGE_SIZE);
  }, [monthFeeList, currentPage]);

  const handleOpenModal = useCallback(
    (item) => {
      // Don't open modal if month is already fully paid
      if (isMonthPaid(item.monthId)) return;

      // Compute duePermission dynamically for this item
      const duePermission = item.due > 0;

      console.log(
        'Opening modal for item:',
        item,
        'duePermission:',
        duePermission
      );

      try {
        dispatch(setMonthFeeData(item));
        showModal(
          duePermission
            ? 'Student Month Due Fee Accept'
            : 'Student Month Fee Accept Form',
          duePermission
            ? 'STUDENT_MONTH_DUE_FEE_ACCEPT_FORM'
            : 'STUDENT_MONTH_FEE_ACCEPT_FORM'
        );
      } catch (error) {
        console.error('Error opening modal:', error);
      }
    },
    [dispatch, isMonthPaid]
  );

  // Get display value for paid months
  const getDisplayValue = useCallback(
    (item) => {
      // If month is paid, show data from studentMonthFeeListsData
      if (isMonthPaid(item.monthId)) {
        const paidData = getPaidMonthData(item.monthId);
        if (paidData) {
          return `Paid: ${paidData.CurrentPaid} (Discount: ${paidData.InvoiceDiscount})`;
        }
      }

      // Otherwise show original logic
      if (item.isFree) {
        return `Free Student (${item.prescribedFee})`;
      } else if (item.isFullPaid) {
        return `Full Payment Done (${item.prescribedFee})`;
      } else if (item.closeMonth == true) {
        return `Close Month (${0})`;
      } else if (item.due > 0) {
        return `${item.acceptedFees} (Due: ${item.due})`;
      } else {
        return item.acceptedFees;
      }
    },
    [isMonthPaid, getPaidMonthData]
  );

  // Get input class based on status
  const getInputClass = useCallback(
    (item) => {
      const baseClass = `w-full rounded border-[1.5px] px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-custom-focus active:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200`;

      // If month is paid, show different styling
      if (isMonthPaid(item.monthId)) {
        return `${baseClass} bg-purple-100 border-purple-400 cursor-default`;
      }

      // Original logic for non-paid months
      if (item.isFree) {
        return `${baseClass} bg-blue-100 border-blue-400`;
      } else if (item.isFullPaid) {
        return `${baseClass} bg-green-100 border-green-400`;
      } else if (item.due > 0) {
        return `${baseClass} bg-red-100 border-red-400 cursor-pointer`;
      } else {
        return `${baseClass} cursor-pointer`;
      }
    },
    [isMonthPaid]
  );

  // Early returns after all hooks
  if (!admissionId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">
          {translate('Please select a student first.')}
        </p>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg">{translate('Loading fee data...')}</span>
      </div>
    );
  }

  // Render error state
  if (isError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-600 text-center">
          <p className="text-lg font-semibold">
            {translate('Error loading data')}
          </p>
          <p className="text-sm mt-2">
            {error?.data?.message ||
              error?.message ||
              translate('Unknown error occurred')}
          </p>
        </div>
      </div>
    );
  }

  // Render no data state
  if (!data || monthFeeList.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <p className="text-lg text-gray-600">
          {translate('No valid fee data found for this student.')}
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
        <table className="min-w-full table-auto text-sm md:text-base">
          <thead className="bg-[#e9ebee] text-black">
            <tr>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate('Month Name')}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate('Prescribed Fee')}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate('Accepted Fees')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 text-center whitespace-nowrap">
                    {bnBijoy2Unicode(item.monthName)}
                  </td>
                  <td className="px-4 text-center whitespace-nowrap">
                    {item.prescribedFee}
                  </td>

                  <td className="px-2 text-center whitespace-nowrap min-w-[120px]">
                    <input
                      type="text"
                      className={getInputClass(item)}
                      value={getDisplayValue(item)}
                      onClick={() => {
                        if (!item.isFullPaid && !item.isFree && !item.closeMonth) {
                          handleOpenModal(item);
                        }
                      }}
                      readOnly
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-2 text-center">
                  {translate('No data available')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FormProvider>
  );
};

export default MonthlyFeeCollectionTable;










