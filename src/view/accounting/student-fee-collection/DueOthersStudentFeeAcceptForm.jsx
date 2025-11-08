import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Button from '../../../components/Button/Button';
import DeleteButton from '../../../components/Button/DeleteButton';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { setPageName } from '../../../features/auth/authSlice';
import { useGetOthersDueStudentFeeQuery } from '../../../features/feeCollection/feeCollectionSlice';
import { setStudentFeeData } from '../../../features/settings/settingsSlice';
import { setMonthFeeData } from '../../../features/student/studentSlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import DefaultKeyDownInput from './DefaultKeyDownInput';

const PAGE_SIZE = 10;

const DueOthersStudentFeeAcceptForm = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [defaultFees, setDefaultFees] = useState([]);
  const [feeTotals, setFeeTotals] = useState(null);
  console.log(feeTotals, 'feeTotals');

  const methods = useForm({
    defaultValues: {
      fees: [],
      prescribedFee: 0,
      deduction: 0,
      currentDeposit: 0,
    },
  });

  const { watch, setValue, handleSubmit, getValues, reset } = methods;
  const [currentPage, setCurrentPage] = useState(1);

  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  const { data: studentFeeAdmissionData } = useGetOthersDueStudentFeeQuery(
    filteredSelectedPerStudentFee?.AdmissionID,
    {
      skip: !filteredSelectedPerStudentFee?.AdmissionID,
    }
  );

  console.log(studentFeeAdmissionData, 'studentFeeAdmissionsData');

  // Initialize default fees from API
  useEffect(() => {
    if (studentFeeAdmissionData?.fees) {
      const fees = studentFeeAdmissionData.fees.map((item) => ({
        SFSID: item.SFSID,
        SLID: item.SLID,
        SlName: item.SlName,
        sessionName: studentFeeAdmissionData?.sessionName,
        amount: item.Fee ? item.Fee : item.amount,
        deduction: item.BlankField ? item.BlankField : 0,
        preDeposit: item.PreviousDeposite
          ? item.PreviousDeposite
          : item.preDeposit || 0,
        deposit: item.PreviousDeposite ? item.Fee - item.PreviousDeposite : 0,
        depositFee: item.PreviousDeposite
          ? item.Fee - item.PreviousDeposite
          : 0,
        due: item.BlankField ? item.BlankField : 0,
        GPID: item.GPID,
      }));

      // Calculate totals after mapping
      const totalPreviousDeposite = fees.reduce(
        (sum, item) => sum + (item.preDeposit || 0),
        0
      );
      const totalDeduction = fees.reduce(
        (sum, item) => sum + item.deduction,
        0
      );
      const totalAmount = fees.reduce((sum, item) => sum + item.amount, 0);
      const netPayable = totalAmount - totalPreviousDeposite - totalDeduction;
      // Set fee totals
      const calculatedTotals = {
        totalPreviousDeposite,
        netPayable,
      };
      // Set totals
      setFeeTotals(calculatedTotals);
      setDefaultFees(fees);
      reset({ fees });
    }
  }, [studentFeeAdmissionData, reset]);

  const fees = watch('fees');

  // Recalculate totals whenever fees change
  useEffect(() => {
    if (!fees || fees.length === 0) return;

    const totalPrescribed = fees.reduce(
      (acc, f) => acc + Number(f.amount || 0),
      0
    );
    const totalDeduction = fees.reduce(
      (acc, f) => acc + Number(f.deduction || 0),
      0
    );
    const totalDeposit = fees.reduce(
      (acc, f) => acc + Number(f.deposit || 0),
      0
    );

    setValue('prescribedFee', totalPrescribed);
    setValue('deduction', totalDeduction);
    setValue('currentDeposit', totalDeposit);
  }, [fees, setValue]);

  // Handle Deduction change
  // Handle Deduction change
  const handleDeductionChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const depositFee = Number(fee.depositFee) || 0;
      const deduction = Number(fee.deduction) || 0;
      const currentDeposit = Number(fee.deposit) || 0;

      // 👉 নতুন deposit হবে totalFee - deduction (কিন্তু manual deposit থাকলে তা preserve করতে হবে)
      const newDeposit = Math.min(currentDeposit, depositFee - deduction);

      // 👉 due = depositFee - deduction - newDeposit
      const newDue = depositFee - deduction - newDeposit;

      setValue(`fees.${index}.deposit`, newDeposit);
      setValue(`fees.${index}.due`, newDue);

      setDefaultFees((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, deduction, deposit: newDeposit, due: newDue }
            : f
        )
      );

      // ✅ মোট হিসাব আপডেট
      const updatedFees = getValues('fees');
      const totalDeduction = updatedFees.reduce(
        (acc, f) => acc + Number(f.deduction || 0),
        0
      );
      const totalDeposit = updatedFees.reduce(
        (acc, f) => acc + Number(f.deposit || 0),
        0
      );

      setValue('deduction', totalDeduction);
      setValue('currentDeposit', totalDeposit);
    },
    [getValues, setValue]
  );

  // Handle Deposit change
  const handleDepositChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const depositFee = Number(fee.depositFee) || 0;
      const deduction = Number(fee.deduction) || 0;
      const deposit = Number(fee.deposit) || 0;

      // 👉 depositFee - deduction থেকে বেশি deposit দেওয়া যাবে না
      const maxAllowedDeposit = depositFee - deduction;
      const actualDeposit = Math.min(deposit, maxAllowedDeposit);

      // 👉 due = (depositFee - deduction) - actualDeposit
      const newDue = maxAllowedDeposit - actualDeposit;

      // যদি বেশি deposit দেওয়া হয়, তাহলে actualDeposit set করুন
      if (deposit !== actualDeposit) {
        setValue(`fees.${index}.deposit`, actualDeposit);
      }

      setValue(`fees.${index}.due`, newDue);

      setDefaultFees((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                deposit: actualDeposit,
                due: newDue,
              }
            : f
        )
      );

      // ✅ মোট deposit আপডেট
      const updatedFees = getValues('fees');
      const totalDeposit = updatedFees.reduce(
        (acc, f) => acc + Number(f.deposit || 0),
        0
      );

      setValue('currentDeposit', totalDeposit);
    },
    [getValues, setValue]
  );

  // Delete a fee row
  const handleDeleteFee = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const updatedFees = currentFees.filter((_, i) => i !== index);
      setValue('fees', updatedFees);
      setDefaultFees((prev) => prev.filter((_, i) => i !== index));
    },
    [getValues, setValue]
  );

  // Reset form to default values
  const handleResetForm = useCallback(() => {
    reset({ fees: defaultFees });
  }, [reset, defaultFees]);

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

    const payload = {
      ...data,
      userId: studentFeeAdmissionData.userId,
      admissionId: studentFeeAdmissionData.admissionId,
      due:totalDue,
      type:"others_due"
    };
    dispatch(setStudentFeeData(payload));
    hideModal();
  };

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:px-6 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col md:flex-row-reverse gap-4 mb-5">
            <div className="md:col-span-3 grid grid-cols-3 md:grid-cols-5 gap-3 items-center">
              <DefaultInput
                type="text"
                registerKey="prescribedFee"
                label="Prescribed Fee"
                disable
              />
              <DefaultInput
                type="text"
                registerKey="OldDeduction"
                label="East cut"
                defaultValue={feeTotals?.netPayable || 0}
                disable
              />
              <DefaultInput
                type="text"
                registerKey="OldPreDeposit"
                label="Pre-deposit"
                defaultValue={feeTotals?.totalPreviousDeposite || 0}
                disable
              />
              <DefaultInput
                type="text"
                registerKey="deduction"
                label="Deduction"
                disable
              />
              <DefaultInput
                type="text"
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

        <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
          <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
            <thead className="bg-[#e9ebee] text-black">
              <tr>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Action')}
                </th>
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('ID')}
                </th>
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
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  {translate('Due')}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                  return (
                    <tr key={item.SFSID || index} className="border-t">
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
                          defaultValue={item.amount}
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deduction`}
                          type="number"
                          defaultValue={item.deduction || 0}
                          onChange={() => handleDeductionChange(globalIndex)}
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.preDeposit`}
                          type="number"
                          defaultValue={item.preDeposit || 0}
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deposit`}
                          type="number"
                          defaultValue={item.deposit}
                          onChange={() => handleDepositChange(globalIndex)}
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.due`}
                          type="number"
                          defaultValue={item.due || 0}
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

export default DueOthersStudentFeeAcceptForm;
