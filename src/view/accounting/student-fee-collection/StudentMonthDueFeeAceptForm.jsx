import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import DeleteButton from '../../../components/Button/DeleteButton';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { setPageName } from '../../../features/auth/authSlice';
import { useGetMonthPerStudentsFeeQuery } from '../../../features/feeCollection/feeCollectionSlice';
import {
  setStudentFeeData,
  setStudentMonthFeeListsData,
} from '../../../features/settings/settingsSlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import DefaultKeyDownInput from './DefaultKeyDownInput';

const PAGE_SIZE = 10;

const StudentMonthDueFeeAceptForm = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [defaultFees, setDefaultFees] = useState([]);

  const methods = useForm({
    defaultValues: {
      studentCode: '',
      monthId: '',
      monthName: '',
      fees: [],
      prescribedFee: 0,
      deduction: 0,
      currentDeposit: 0,
      eastCut: 0,
      preDeposit: 0,
    },
  });

  const { watch, setValue, handleSubmit, getValues } = methods;
  const [currentPage, setCurrentPage] = useState(1);

  const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
    (state) => state.student
  );
  const { studentMonthFeeDueData } = useSelector((state) => state.settings);

  const { data: studentFeeAdmissionData } = useGetMonthPerStudentsFeeQuery(
    filteredSelectedPerStudentFee?.AdmissionID,
    { skip: !filteredSelectedPerStudentFee?.AdmissionID }
  );

  const monthDuePerStudent = studentMonthFeeDueData;

  // Initialize default fees using setValue instead of reset
  useEffect(() => {
    const studentCode = filteredSelectedPerStudentFee?.StudentCode || '';
    const monthId = monthFeeData?.monthId || '';
    const monthName = monthFeeData?.monthName || '';

    let fees = [];
    if (
      monthDuePerStudent?.data &&
      Array.isArray(monthDuePerStudent.data) &&
      monthDuePerStudent.data.length > 0
    ) {
      fees = monthDuePerStudent.data.map((item) => ({
        SSFID: item.SSFID,
        SLID: item.SLID,
        SlName: item.SlName,
        sessionId: item.SessionID,
        sessionName: item.SessionName,
        classId: item.ClassID,
        amount: item.Amount || item.Fee || 0,
        deduction: 0,
        deposit: item.Fee - item.PreviousDeposite || 0,
        depositUpdate: item.Fee - item.PreviousDeposite || 0,
        preDeposit: item.PreDeposite || 0,
        due: 0,
      }));
    }

    const totalPrescribed = fees.reduce((sum, f) => sum + Number(f.amount), 0);
    const totalDeduction = fees.reduce(
      (sum, f) => sum + Number(f.deduction),
      0
    );
    const totalDeposit = fees.reduce((sum, f) => sum + Number(f.deposit), 0);

    setDefaultFees(fees);

    // Set values individually instead of reset
    setValue('studentCode', studentCode);
    setValue('monthId', monthId);
    setValue('monthName', monthName);
    setValue('fees', fees);
    console.log(fees, 'fees');
    setValue('prescribedFee', totalPrescribed);
    setValue('deduction', totalDeduction);
    setValue('currentDeposit', totalDeposit);
    setValue('eastCut', monthDuePerStudent?.totals?.totalLess || 0);
    setValue('preDeposit', monthDuePerStudent?.totals?.totalPreDeposite || 0);
  }, [
    monthDuePerStudent,
    setValue,
    filteredSelectedPerStudentFee,
    monthFeeData,
  ]);

  const feesData = watch('fees');
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (!feesData || feesData.length === 0) return;

    const timer = setTimeout(() => {
      setFees(feesData);
      console.log('fees delayed', feesData);
    }, 500);

    return () => clearTimeout(timer);
  }, [feesData]);

  useEffect(() => {
    if (!fees || fees.length === 0) return; // prevents empty console logs
    console.log('fees delayed (state)', fees);
  }, [fees]);

  const recalcFee = useCallback((fee) => {
    const prescribedFee = Number(fee.amount || 0);
    const deduction = Number(fee.deduction || 0);
    const preDeposit = Number(fee.preDeposit || 0);
    let deposit = Number(fee.deposit || 0);

    const maxDeposit = prescribedFee - deduction - preDeposit;
    if (deposit > maxDeposit) deposit = maxDeposit;

    const due = prescribedFee - deduction - preDeposit - deposit;
    return { deposit, due };
  }, []);

  const recalculateTotals = useCallback(() => {
    if (!fees || fees.length === 0) {
      setValue('prescribedFee', 0);
      setValue('deduction', 0);
      setValue('currentDeposit', 0);
      return;
    }

    let totalPrescribed = 0;
    let totalDeduction = 0;
    let totalDeposit = 0;

    const updatedFees = fees.map((fee) => {
      const { deposit, due } = recalcFee(fee);
      totalPrescribed += Number(fee.amount || 0);
      totalDeduction += Number(fee.deduction || 0);
      totalDeposit += deposit;
      return { ...fee, deposit, due };
    });

    setDefaultFees(updatedFees);
    setValue('fees', updatedFees);
    console.log(updatedFees, 'fees');
    setValue('prescribedFee', totalPrescribed);
    setValue('deduction', totalDeduction);
    setValue('currentDeposit', totalDeposit);
  }, [fees, recalcFee, setValue]);

  const handleDeductionChange = useCallback(
    (index) => {
      const fee = getValues(`fees.${index}`);
      if (!fee) return;

      const { deposit, due } = recalcFee(fee);
      setValue(`fees.${index}.deposit`, deposit);
      setValue(`fees.${index}.due`, due);

      setDefaultFees((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, deduction: fee.deduction, deposit, due } : f
        )
      );

      setTimeout(recalculateTotals, 0);
    },
    [getValues, setValue, recalcFee, recalculateTotals]
  );

  const handleDepositChange = useCallback(
    (index) => {
      const fee = getValues(`fees.${index}`);
      if (!fee) return;

      const { deposit, due } = recalcFee(fee);
      setValue(`fees.${index}.deposit`, deposit);
      setValue(`fees.${index}.due`, due);

      setDefaultFees((prev) =>
        prev.map((f, i) => (i === index ? { ...f, deposit, due } : f))
      );

      setTimeout(recalculateTotals, 0);
    },
    [getValues, setValue, recalcFee, recalculateTotals]
  );

  const handleDeleteFee = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const updatedFees = currentFees.filter((_, i) => i !== index);
      setValue('fees', updatedFees);
      setDefaultFees((prev) => prev.filter((_, i) => i !== index));

      setTimeout(recalculateTotals, 0);
    },
    [getValues, setValue, recalculateTotals]
  );

  const handleResetForm = useCallback(() => {
    const currentValues = getValues();
    setValue('fees', defaultFees);
    setValue('prescribedFee', currentValues.prescribedFee);
    setValue('deduction', currentValues.deduction);
    setValue('currentDeposit', currentValues.currentDeposit);
    setTimeout(recalculateTotals, 0);
  }, [getValues, setValue, defaultFees, recalculateTotals]);

  const totalPages = Math.ceil((fees?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return fees?.slice(start, start + PAGE_SIZE) || [];
  }, [fees, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const onSubmit = (data) => {
    const totalDue = data?.fees?.reduce((sum, fee) => sum + (fee.due || 0), 0);
    const monthFeeDueRequest =
      monthDuePerStudent?.data && monthDuePerStudent.data.length > 0;

    const payload = {
      ...data,
      userId:
        studentFeeAdmissionData?.[0]?.UserID ||
        filteredSelectedPerStudentFee?.UserID,
      admissionId:
        studentFeeAdmissionData?.[0]?.AdmissionID ||
        filteredSelectedPerStudentFee?.AdmissionID,
      due: totalDue,
      monthFeeDueRequest,
      type: 'month',
    };
    dispatch(setStudentFeeData(payload));

    const monthPayload = {
      CurrentInvoice: payload.prescribedFee,
      InvoiceDiscount: payload.deduction,
      CurrentPaid: payload.currentDeposit,
      MonthId: payload.monthId,
      Due: totalDue,
    };
    dispatch(setStudentMonthFeeListsData(monthPayload));

    hideModal();
  };

  const handleKeyDown = (e, index, fieldType) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldType === 'deduction') handleDeductionChange(index);
      else if (fieldType === 'deposit') handleDepositChange(index);
    }
  };

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:px-6 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <DefaultInput
              registerKey="studentCode"
              label="Student Code"
              disable
            />
            <DefaultInput registerKey="monthId" label="Month ID" disable />
            <DefaultInput registerKey="monthName" label="Month Name" disable />
          </div>

          {/* summary section */}
          <div className="flex flex-col md:flex-row-reverse gap-4 mb-5">
            <div className="md:col-span-3 grid grid-cols-3 md:grid-cols-5 gap-3 items-center">
              <DefaultInput
                registerKey="prescribedFee"
                label="Prescribed Fee"
                disable
              />
              <DefaultInput registerKey="eastCut" label="East cut" disable />
              <DefaultInput
                registerKey="preDeposit"
                label="Pre-deposit"
                disable
              />
              <DefaultInput registerKey="deduction" label="Deduction" disable />
              <DefaultInput
                registerKey="currentDeposit"
                label="Deposit"
                disable
              />
            </div>

            <div className="flex justify-start md:justify-center items-center gap-2 mt-5">
              <Button
                type="button"
                className="px-6 py-2 rounded-lg bg-gray-400 text-white"
                onClick={handleResetForm}
              >
                Reset
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </form>

        {/* table */}
        <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
          <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
            <thead className="bg-[#e9ebee] text-black">
              <tr>
                <th className="px-4 py-3 text-center">{translate('Action')}</th>
                <th className="px-4 py-3 text-center">{translate('ID')}</th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Fee Name')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Prescribed Fee')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Deduction')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Pre-deposit')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Deposit')}
                </th>
                <th className="px-4 py-3 text-center">{translate('Due')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                  return (
                    <tr
                      key={`${item.SSFID}-${item.SLID}-${globalIndex}`}
                      className="border-t"
                    >
                      <td className="px-4 text-center">
                        <DeleteButton
                          onClick={() => handleDeleteFee(globalIndex)}
                        />
                      </td>
                      <td className="text-center">{item.SLID}</td>
                      <td className="text-center">
                        {bnBijoy2Unicode(item.SlName)}
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.amount`}
                          type="number"
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deduction`}
                          type="number"
                          onChange={() => handleDeductionChange(globalIndex)}
                          max={item.preDeposit ? item.deposit : item.amount}
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.preDeposit`}
                          type="number"
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deposit`}
                          type="number"
                          onChange={() => handleDepositChange(globalIndex)}
                          max={
                            item.preDeposit ? item.depositUpdate : item.amount
                          }
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.due`}
                          type="number"
                          disable
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination */}
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
    </div>
  );
};

export default StudentMonthDueFeeAceptForm;
