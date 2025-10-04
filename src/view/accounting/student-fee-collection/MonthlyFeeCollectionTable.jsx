import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';

import DefaultInput from '../../../components/Forms/DefaultInput';
import { useGetFeeLandByAdmissionQuery } from '../../../features/feeCollection/feeCollectionSlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import useTranslate from '../../../utils/Translate';

const PAGE_SIZE = 6;

const MonthlyFeeCollectionTable = () => {
  const translate = useTranslate();
  const methods = useForm();
  const [currentPage, setCurrentPage] = useState(1);

  // Selector and query hooks
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );
  console.log('filteredSelectedPerStudentFee:', filteredSelectedPerStudentFee);
  const admissionId = filteredSelectedPerStudentFee?.AdmissionID;
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
    if (!data || !data.feeDetails || !data.monthDetails) {
      console.log('Data missing or incomplete:', data);
      return [];
    }
    const { feeDetails, monthDetails } = data;
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = `Month${i + 1}`;
      const feeKey = `Fee${i + 1}`;
      const lessKey = `Less${i + 1}`;
      const mKey = `M${i + 1}`;

      return {
        monthName: monthDetails[monthKey] || 'N/A',
        prescribedFee: feeDetails[feeKey] || 0,
        acceptedFees: feeDetails[mKey] || 0,
        discount: feeDetails[lessKey] || 0,
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

  // Render loading, error, or no data states
  if (!admissionId) {
    return;
    // return <p>{translate('Please select a student first.')}</p>;
  }

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
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {bnBijoy2Unicode(item.monthName)}
                  </td>
                  <td className="px-4 py-2 text-center whitespace-nowrap">
                    {item.prescribedFee}
                  </td>

                  <td className="px-2 py-2 text-center whitespace-nowrap min-w-[120px]">
                    <DefaultInput
                      registerKey={`monthFeeList.${index}.comment`}
                      type="text"
                      className="w-full min-w-[100px] max-w-[150px] mx-auto"
                      defaultValue={item.acceptedFees}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </FormProvider>
  );
};

export default MonthlyFeeCollectionTable;
