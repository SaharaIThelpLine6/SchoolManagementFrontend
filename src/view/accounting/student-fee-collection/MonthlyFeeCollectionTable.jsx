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
  console.log('filteredSelectedPerStudentFee:', filteredSelectedPerStudentFee);
  const admissionId = filteredSelectedPerStudentFee?.AdmissionID;

  // All hooks called unconditionally
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);

  // API query hook
  const { data, error, isLoading } = useGetFeeLandByAdmissionQuery(
    { id: admissionId },
    { skip: !admissionId }
  );

  // Log API response for debugging
  useEffect(() => {
    console.log('useGetFeeLandByAdmissionQuery response:', {
      data,
      error,
      isLoading,
    });
  }, [data, error, isLoading]);

  // Compute monthFeeList
  const monthFeeList = useMemo(() => {
    if (!data?.feeDetails || !data?.monthDetails) return [];

    const { feeDetails, monthDetails } = data;

    return Array.from({ length: 12 }, (_, i) => {
      const index = i + 1;
      const fee = feeDetails[`Fee${index}`] ?? 0;
      const less = feeDetails[`Less${index}`] ?? 0;
      const paid = feeDetails[`M${index}`] ?? 0;

      const untouched = paid === 0 && less === 0;
      const isFree =
        !untouched && (paid === 0 || paid === null) && less === fee && fee > 0;
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
      };
    });
  }, [data]);

  // Initialize form state with monthFeeList
  useEffect(() => {
    if (monthFeeList.length > 0) {
      const defaultValues = {
        monthFeeList: monthFeeList.map((item) => ({
          ...item,
          comment: '',
          status: false,
        })),
      };
      methods.reset(defaultValues, { keepDirty: false, keepTouched: false });
      console.log(
        'Form state initialized with monthFeeList:',
        methods.getValues()
      );
    }
  }, [monthFeeList, methods]);

  // Compute paginated data
  const totalPages = Math.ceil(monthFeeList.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monthFeeList.slice(start, start + PAGE_SIZE);
  }, [monthFeeList, currentPage]);

  const handleOpenModal = useCallback(
    (item) => {
      console.log(item, 'item');
      dispatch(setMonthFeeData(item)); // ✅ Correct way
      showModal('Student Month Fee Accept', 'STUDENT_MONTH_FEE_ACCEPT_FORM');
    },
    [dispatch, showModal]
  );

  // Early returns after all hooks
  if (!admissionId) {
    return <p>{translate('Please select a student first.')}</p>;
  }

  // Render loading, error, or no data states
  if (isLoading) {
    return <p>{translate('Loading...')}</p>;
  }

  if (error) {
    console.error('API error:', error);
    return (
      <p>
        {translate('Error loading data:')} {error.message || 'Unknown error'}
      </p>
    );
  }

  if (!data || !data.feeDetails || !data.monthDetails) {
    console.log('Incomplete data:', data);
    return <p>{translate('No valid fee data found for this student.')}</p>;
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
                      className={`w-full rounded border-[1.5px] px-2 h-[38px] text-black outline-none text-[14px] transition
    focus:border-custom-focus active:border-custom-focus
    disabled:cursor-not-allowed disabled:bg-slate-200
    ${
      item.isFree
        ? 'bg-blue-100 border-blue-400'
        : item.isFullPaid
        ? 'bg-green-100 border-green-400'
        : item.due > 0
        ? 'bg-red-100 border-red-400 cursor-pointer'
        : 'cursor-pointer'
    }`}
                      value={
                        item.isFree
                          ? `Free Student (${item.prescribedFee})`
                          : item.isFullPaid
                          ? `Full Payment Done (${item.prescribedFee})`
                          : item.due > 0
                          ? `${item.acceptedFees} (Due: ${item.due})`
                          : item.acceptedFees
                      }
                      onClick={() => {
                        if (!item.isFullPaid && !item.isFree) {
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
