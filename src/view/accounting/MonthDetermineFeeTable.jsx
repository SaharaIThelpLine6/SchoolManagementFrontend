import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import SingleCheckbox from '../../components/Checkboxes/SingleCheckbox';
import DefaultInput from '../../components/Forms/DefaultInput';
import { useGetStudentFeeIncreaseDecreaseQuery } from '../../features/feeCollection/feeCollectionSlice';
import bnBijoy2Unicode from '../../utils/conveter';
import useTranslate from '../../utils/Translate';

const PAGE_SIZE = 12;

const MonthDetermineFeeTable = () => {
  const translate = useTranslate();
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);

  // Selector and query hooks
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );
  // console.log('filteredSelectedPerStudentFee:', filteredSelectedPerStudentFee);
  const admissionId = filteredSelectedPerStudentFee?.AdmissionID;

  const shouldSkip =
    !filteredSelectedPerStudentFee?.AdmissionID ||
    !filteredSelectedPerStudentFee?.StudentCode;

  const {
    data: studentMonthFeeData,
    isLoading: isLoadingMfd,
    error: errorMfd,
    isError: isErrorMfd,
  } = useGetStudentFeeIncreaseDecreaseQuery(
    {
      AdmissionID: filteredSelectedPerStudentFee?.AdmissionID,
      UserID: filteredSelectedPerStudentFee?.UserID,
      search: filteredSelectedPerStudentFee?.StudentCode,
      ClassID: filteredSelectedPerStudentFee?.ClassID,
      SessionID: filteredSelectedPerStudentFee?.SessionID,
    },
    {
      skip: shouldSkip,
    }
  );

  const landFeeWithMonths = studentMonthFeeData?.data[0]?.landFeeWithMonths;
  const subledgerData = studentMonthFeeData?.data[0]?.subLedgerFee[0];

  // console.log(landFeeWithMonths, 'landFeeWithMonths');

  // Log API response for debugging
  // useEffect(() => {
  //   console.log('useGetStudentFeeIncreaseDecreaseQuery response:', {
  //     data: studentMonthFeeData,
  //     error: errorMfd,
  //     isLoading: isLoadingMfd,
  //   });
  // }, [studentMonthFeeData, errorMfd, isLoadingMfd]);

  // Compute monthFeeList
  const monthFeeList = useMemo(() => {
    if (!landFeeWithMonths || !landFeeWithMonths.months) return [];

    return landFeeWithMonths.months.map((month) => {
      const fee = month.fee || 0;
      const less = month.less || 0;
      const paid = month.paid || 0;

      let isDisabled = false;
      let statusText = '';

      // Case 1: Fee == Less → Free Student
      if (fee && fee === less) {
        isDisabled = true;
        statusText = 'Free Student';
      }
      // Case 2: Paid == Fee → Full Payment Done
      else if (paid && paid === fee) {
        isDisabled = true;
        statusText = 'Full Payment Done';
      }

      return {
        monthName: month.monthName,
        prescribedFee: fee,
        acceptedFees: paid,
        discount: less,
        statusText,
        isDisabled,
        defaultChecked: !isDisabled,
      };
    });
  }, [landFeeWithMonths]);

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
      // console.log(
      //   'Form state initialized with monthFeeList:',
      //   methods.getValues()
      // );
    }
  }, [monthFeeList, methods]);

  // Compute paginated data
  const totalPages = Math.ceil(monthFeeList.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monthFeeList.slice(start, start + PAGE_SIZE);
  }, [monthFeeList, currentPage]);

  // Render loading, error, or no data states
  if (!admissionId) {
    return <p>{translate('Please select a student first.')}</p>;
  }

  if (isLoadingMfd) {
    return <p>{translate('Loading...')}</p>;
  }

  if (errorMfd) {
    // console.error('API error:', errorMfd);
    return (
      <p>
        {translate('Error loading data:')} {errorMfd.message || 'Unknown error'}
      </p>
    );
  }

  if (!landFeeWithMonths || !landFeeWithMonths.months > 0) {
    // console.log('Incomplete data:', landFeeWithMonths);
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
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate('Comment')}
              </th>
              <th className="px-4 py-3 text-center whitespace-nowrap">
                {translate('Status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {bnBijoy2Unicode(item.monthName)}
                  </td>

                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {item.prescribedFee}
                  </td>

                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {item.acceptedFees}
                  </td>

                  <td className="px-2 text-center whitespace-nowrap min-w-[120px]">
                    <DefaultInput
                      registerKey={`monthFeeList.${index}.comment`}
                      type="text"
                      className="w-full min-w-[100px] max-w-[150px] mx-auto"
                    />
                  </td>

                  <td className="px-4 py-2 text-center flex justify-center items-center whitespace-nowrap">
                    <div className="flex flex-col items-center">
                      <SingleCheckbox
                        registerKey={`monthFeeList.${index}.status`}
                        dcn="mb-0 mt-1"
                        disabled={item.isDisabled}
                        checked={item.defaultChecked}
                      />
                    </div>
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

export default MonthDetermineFeeTable;
