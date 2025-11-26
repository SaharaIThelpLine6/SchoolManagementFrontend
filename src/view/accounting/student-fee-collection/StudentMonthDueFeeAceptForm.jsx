import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../../../components/Button/Button';
import DeleteButton from '../../../components/Button/DeleteButton';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { useGetMonthDuePerStudentFeeQuery } from '../../../features/feeCollection/feeCollectionSlice';
import {
  setStudentFeeData,
  setStudentMonthFeeListsData,
} from '../../../features/settings/settingsSlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import DefaultKeyDownInput from './DefaultKeyDownInput';

const PAGE_SIZE = 10;

const StudentMonthDueFeeAceptForm = () => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [defaultFees, setDefaultFees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const methods = useForm({
    defaultValues: {
      fees: [],
      prescribedFee: 0,
      deduction: 0,
      currentDeposit: 0,
      eastCut: 0,
      preDeposit: 0,
    },
  });

  const { watch, setValue, handleSubmit, getValues, reset } = methods;

  const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
    (state) => state.student
  );

  // ---------------- API FETCH ----------------
  const { data: monthDuePerStudent } = useGetMonthDuePerStudentFeeQuery(
    {
      admissionId: filteredSelectedPerStudentFee?.AdmissionID,
      monthId: monthFeeData?.monthId,
    },
    {
      skip:
        !filteredSelectedPerStudentFee?.AdmissionID || !monthFeeData?.monthId,
    }
  );
console.log(filteredSelectedPerStudentFee, 'filteredSelectedPerStudentFee');
  const feesData = monthDuePerStudent?.data || [];

  // ---------------- INITIALIZE FEES ----------------
  // INITIALIZE FEES
  useEffect(() => {
    if (feesData.length > 0) {
      const fees = feesData.map((item) => ({
        SSFID: item.SSFID || null,
        SLID: item.SLID,
        SlName: item.SlName,
        sessionId: item.SessionID,
        sessionName: item.SessionName,
        classId: item.ClassID,
        amount: item.Fee || 0,
        deduction: item.Less || 0,
        deposit: item.PreDeposite || 0,
        preDeposit: item.PreDeposite || 0,
        due: (item.Fee || 0) - (item.Less || 0) - (item.PreDeposite || 0),
      }));

      setDefaultFees(fees);
      reset({ fees }); // <-- only reset once on mount
      recalculateTotals(fees); // <-- call with initial fees, avoid loop
    }

    setValue('studentCode', filteredSelectedPerStudentFee?.StudentCode);

    if (monthFeeData) {
      setValue('monthId', monthFeeData?.monthId);
      setValue('monthName', monthFeeData?.monthName);
    }
  }, [feesData, reset, setValue, filteredSelectedPerStudentFee, monthFeeData]);

  const fees = watch('fees');

  // ---------------- RECALCULATION ----------------
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
const recalculateTotals = useCallback(
  (currentFees = fees) => {
    if (!currentFees || currentFees.length === 0) {
      setValue('prescribedFee', 0);
      setValue('deduction', 0);
      setValue('currentDeposit', 0);
      setValue('eastCut', monthDuePerStudent?.totals?.totalLess || 0);
      setValue('preDeposit', monthDuePerStudent?.totals?.totalPreDeposite || 0);
      return;
    }

    let totalPrescribed = 0;
    let totalDeduction = 0;
    let totalDeposit = 0;

    const updatedFees = currentFees.map((fee) => {
      const { deposit, due } = recalcFee(fee);
      totalPrescribed += Number(fee.amount || 0);
      totalDeduction += Number(fee.deduction || 0);
      totalDeposit += deposit;
      return { ...fee, deposit, due };
    });

    setDefaultFees(updatedFees);
    setValue('fees', updatedFees);
    setValue('prescribedFee', totalPrescribed);
    setValue('deduction', totalDeduction);
    setValue('currentDeposit', totalDeposit);
    setValue('eastCut', monthDuePerStudent?.totals?.totalLess || 0);
    setValue('preDeposit', monthDuePerStudent?.totals?.totalPreDeposite || 0);
  },
  [fees, recalcFee, setValue, monthDuePerStudent]
);
  useEffect(() => {
    recalculateTotals();
  }, [fees?.length]);

  // ---------------- HANDLE CHANGES ----------------
  const handleDeductionChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const { deposit, due } = recalcFee(fee);

      setValue(`fees.${index}.deposit`, deposit);
      setValue(`fees.${index}.due`, due);

      setDefaultFees((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, deduction: fee.deduction, deposit, due } : f
        )
      );

      setTimeout(() => recalculateTotals(), 0);
    },
    [getValues, setValue, recalcFee, recalculateTotals]
  );

  const handleDepositChange = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const fee = currentFees[index];
      if (!fee) return;

      const { deposit, due } = recalcFee(fee);

      setValue(`fees.${index}.deposit`, deposit);
      setValue(`fees.${index}.due`, due);

      setDefaultFees((prev) =>
        prev.map((f, i) => (i === index ? { ...f, deposit, due } : f))
      );

      setTimeout(() => recalculateTotals(), 0);
    },
    [getValues, setValue, recalcFee, recalculateTotals]
  );

  const handleDeleteFee = useCallback(
    (index) => {
      const currentFees = getValues('fees');
      const updatedFees = currentFees.filter((_, i) => i !== index);
      setValue('fees', updatedFees);
      setDefaultFees((prev) => prev.filter((_, i) => i !== index));
      setTimeout(() => recalculateTotals(), 0);
    },
    [getValues, setValue, recalculateTotals]
  );

  const handleResetForm = useCallback(() => {
    reset({ fees: defaultFees });
    setTimeout(() => recalculateTotals(), 0);
  }, [reset, defaultFees, recalculateTotals]);

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil((fees?.length || 0) / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return fees?.slice(start, start + PAGE_SIZE) || [];
  }, [fees, currentPage]);

  // ---------------- SUBMIT ----------------
  const onSubmit = (data) => {
    const totalDue = data?.fees?.reduce((sum, fee) => sum + (fee.due || 0), 0);

    const payload = {
      ...data,
      userId: filteredSelectedPerStudentFee?.UserID,
      admissionId: filteredSelectedPerStudentFee?.AdmissionID,
      due: totalDue,
      type: 'month',
    };
    dispatch(setStudentFeeData(payload));

    const monthPayload = {
      CurrentInvoice: payload?.prescribedFee,
      InvoiceDiscount: payload?.deduction,
      CurrentPaid: payload?.currentDeposit,
      MonthId: payload?.monthId,
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

          {/* summary */}
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
                <th className="px-4 py-3 text-center">Action</th>
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-center">Fee Name</th>
                <th className="px-4 py-3 text-center">Prescribed Fee</th>
                <th className="px-4 py-3 text-center">Deduction</th>
                <th className="px-4 py-3 text-center">Pre-deposit</th>
                <th className="px-4 py-3 text-center">Deposit</th>
                <th className="px-4 py-3 text-center">Due</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
                  return (
                    <tr
                      key={`${item.SLID}-${globalIndex}`}
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
                          defaultValue={item.amount}
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deduction`}
                          type="number"
                          defaultValue={item.deduction}
                          onChange={() => handleDeductionChange(globalIndex)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, globalIndex, 'deduction')
                          }
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.preDeposit`}
                          type="number"
                          defaultValue={item.preDeposit}
                          disable
                        />
                      </td>
                      <td className="text-center">
                        <DefaultKeyDownInput
                          registerKey={`fees.${globalIndex}.deposit`}
                          type="number"
                          defaultValue={item.deposit}
                          onChange={() => handleDepositChange(globalIndex)}
                          onKeyDown={(e) =>
                            handleKeyDown(e, globalIndex, 'deposit')
                          }
                        />
                      </td>
                      <td className="text-center">
                        <DefaultInput
                          registerKey={`fees.${globalIndex}.due`}
                          type="number"
                          defaultValue={item.due}
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

// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { useDispatch, useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
// import Button from '../../../components/Button/Button';
// import DeleteButton from '../../../components/Button/DeleteButton';
// import DefaultInput from '../../../components/Forms/DefaultInput';
// import { setPageName } from '../../../features/auth/authSlice';
// import {
//   useGetMonthDuePerStudentFeeQuery,
//   useGetMonthPerStudentsFeeQuery,
// } from '../../../features/feeCollection/feeCollectionSlice';
// import {
//   setStudentFeeData,
//   setStudentMonthFeeListsData,
// } from '../../../features/settings/settingsSlice';
// import bnBijoy2Unicode from '../../../utils/conveter';
// import { hideModal } from '../../../utils/ModalControlar';
// import useTranslate from '../../../utils/Translate';
// import DefaultKeyDownInput from './DefaultKeyDownInput';

// const PAGE_SIZE = 10;

// const StudentMonthDueFeeAceptForm = ({ pageTitle }) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const translate = useTranslate();

//   const methods = useForm({
//     defaultValues: {
//       studentCode: '',
//       monthId: '',
//       monthName: '',
//       fees: [],
//       prescribedFee: 0,
//       deduction: 0,
//       currentDeposit: 0,
//       eastCut: 0,
//       preDeposit: 0,
//     },
//   });

//   const { watch, setValue, handleSubmit, getValues } = methods;
//   const [currentPage, setCurrentPage] = useState(1);

//   const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
//     (state) => state.student
//   );
//   const { data: studentFeeAdmissionData } = useGetMonthPerStudentsFeeQuery(
//     filteredSelectedPerStudentFee?.AdmissionID,
//     { skip: !filteredSelectedPerStudentFee?.AdmissionID }
//   );

//   // Month due API
//   const monthId = Number(monthFeeData?.monthId);
//   const { data: monthDuePerStudent } = useGetMonthDuePerStudentFeeQuery(
//     {
//       admissionId: filteredSelectedPerStudentFee?.AdmissionID,
//       monthId,
//     },
//     { skip: !filteredSelectedPerStudentFee?.AdmissionID || !monthId }
//   );

//   // Initialize form values
//   useEffect(() => {
//     if (!filteredSelectedPerStudentFee || !monthFeeData || !monthDuePerStudent)
//       return;

//     const studentCode = filteredSelectedPerStudentFee.StudentCode || '';
//     const monthName = monthFeeData.monthName || '';
//     const monthId = monthFeeData.monthId || '';

//     const fees = Array.isArray(monthDuePerStudent.data)
//       ? monthDuePerStudent.data.map((item) => ({
//           SSFID: item.SSFID,
//           SLID: item.SLID,
//           SlName: item.SlName,
//           sessionId: item.SessionID,
//           sessionName: item.SessionName,
//           classId: item.ClassID,
//           amount: item.Amount || item.Fee || 0,
//           deduction: 0,
//           deposit: item.Fee - item.PreviousDeposite || 0,
//           depositUpdate: item.Fee - item.PreviousDeposite || 0,
//           preDeposit: item.PreDeposite || 0,
//           due: 0,
//         }))
//       : [];

//     const totalPrescribed = fees.reduce((sum, f) => sum + Number(f.amount), 0);
//     const totalDeduction = fees.reduce(
//       (sum, f) => sum + Number(f.deduction),
//       0
//     );
//     const totalDeposit = fees.reduce((sum, f) => sum + Number(f.deposit), 0);

//     setValue('studentCode', studentCode);
//     setValue('monthId', monthId);
//     setValue('monthName', monthName);
//     setValue('fees', fees);
//     setValue('prescribedFee', totalPrescribed);
//     setValue('deduction', totalDeduction);
//     setValue('currentDeposit', totalDeposit);
//     setValue('eastCut', monthDuePerStudent.totals?.totalLess || 0);
//     setValue('preDeposit', monthDuePerStudent.totals?.totalPreDeposite || 0);
//   }, [
//     monthDuePerStudent,
//     filteredSelectedPerStudentFee,
//     monthFeeData,
//     setValue,
//   ]);

//   const feesData = watch('fees') || [];

//   // Recalculate deposit and due
//   const recalcFee = useCallback((fee) => {
//     const prescribedFee = Number(fee.amount || 0);
//     const deduction = Number(fee.deduction || 0);
//     const preDeposit = Number(fee.preDeposit || 0);
//     let deposit = Number(fee.deposit || 0);
//     const maxDeposit = prescribedFee - deduction - preDeposit;
//     if (deposit > maxDeposit) deposit = maxDeposit;
//     const due = prescribedFee - deduction - preDeposit - deposit;
//     return { deposit, due };
//   }, []);

//   const recalculateTotals = useCallback(() => {
//     if (!feesData || feesData.length === 0) {
//       setValue('prescribedFee', 0);
//       setValue('deduction', 0);
//       setValue('currentDeposit', 0);
//       return;
//     }

//     let totalPrescribed = 0;
//     let totalDeduction = 0;
//     let totalDeposit = 0;

//     const updatedFees = feesData.map((fee) => {
//       const { deposit, due } = recalcFee(fee);
//       totalPrescribed += Number(fee.amount || 0);
//       totalDeduction += Number(fee.deduction || 0);
//       totalDeposit += deposit;
//       return { ...fee, deposit, due };
//     });
//     setValue('fees', updatedFees);
//     setValue('prescribedFee', totalPrescribed);
//     setValue('deduction', totalDeduction);
//     setValue('currentDeposit', totalDeposit);
//   }, [feesData, recalcFee, setValue]);

//   const handleDeductionChange = useCallback(
//     (index) => {
//       const fee = getValues(`fees.${index}`);
//       if (!fee) return;
//       const { deposit, due } = recalcFee(fee);
//       setValue(`fees.${index}.deposit`, deposit);
//       setValue(`fees.${index}.due`, due);
//       setTimeout(recalculateTotals, 0);
//     },
//     [getValues, setValue, recalcFee, recalculateTotals]
//   );

//   const handleDepositChange = useCallback(
//     (index) => {
//       const fee = getValues(`fees.${index}`);
//       if (!fee) return;
//       const { deposit, due } = recalcFee(fee);
//       setValue(`fees.${index}.deposit`, deposit);
//       setValue(`fees.${index}.due`, due);
//       setTimeout(recalculateTotals, 0);
//     },
//     [getValues, setValue, recalcFee, recalculateTotals]
//   );

//   const handleDeleteFee = useCallback(
//     (index) => {
//       const currentFees = getValues('fees');
//       const updatedFees = currentFees.filter((_, i) => i !== index);
//       setValue('fees', updatedFees);
//       setTimeout(recalculateTotals, 0);
//     },
//     [getValues, setValue, recalculateTotals]
//   );

//   const handleResetForm = useCallback(() => {
//     const currentValues = getValues();
//     setValue('fees', feesData);
//     setValue('prescribedFee', currentValues.prescribedFee);
//     setValue('deduction', currentValues.deduction);
//     setValue('currentDeposit', currentValues.currentDeposit);
//     setTimeout(recalculateTotals, 0);
//   }, [getValues, setValue, feesData, recalculateTotals]);

//   const totalPages = Math.ceil(feesData.length / PAGE_SIZE);
//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return feesData.slice(start, start + PAGE_SIZE);
//   }, [feesData, currentPage]);

//   useEffect(() => {
//     if (pageTitle) dispatch(setPageName(pageTitle));
//   }, [dispatch, pageTitle]);

//   const onSubmit = (data) => {
//     const totalDue = data.fees.reduce((sum, fee) => sum + (fee.due || 0), 0);
//     const monthFeeDueRequest = monthDuePerStudent?.data?.length > 0;

//     const payload = {
//       ...data,
//       userId:
//         studentFeeAdmissionData?.[0]?.UserID ||
//         filteredSelectedPerStudentFee?.UserID,
//       admissionId:
//         studentFeeAdmissionData?.[0]?.AdmissionID ||
//         filteredSelectedPerStudentFee?.AdmissionID,
//       due: totalDue,
//       monthFeeDueRequest,
//       type: 'month',
//     };

//     dispatch(setStudentFeeData(payload));

//     const monthPayload = {
//       CurrentInvoice: payload.prescribedFee,
//       InvoiceDiscount: payload.deduction,
//       CurrentPaid: payload.currentDeposit,
//       MonthId: payload.monthId,
//       Due: totalDue,
//     };

//     dispatch(setStudentMonthFeeListsData(monthPayload));
//     hideModal();
//   };

//   console.log(feesData, 'feesData');
//   return (
//     <div className="font-SolaimanLipi bg-white p-4 md:px-6 rounded-xl shadow-lg">
//       <FormProvider {...methods}>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           {/* Header inputs */}
//           <div className="grid grid-cols-3 gap-4 mb-5">
//             <DefaultInput
//               registerKey="studentCode"
//               label="Student Code"
//               disable
//             />
//             <DefaultInput registerKey="monthId" label="Month ID" disable />
//             <DefaultInput registerKey="monthName" label="Month Name" disable />
//           </div>

//           {/* Summary */}
//           <div className="flex flex-col md:flex-row-reverse gap-4 mb-5">
//             <div className="md:col-span-3 grid grid-cols-3 md:grid-cols-5 gap-3 items-center">
//               <DefaultInput
//                 registerKey="prescribedFee"
//                 label="Prescribed Fee"
//                 disable
//               />
//               <DefaultInput registerKey="eastCut" label="East cut" disable />
//               <DefaultInput
//                 registerKey="preDeposit"
//                 label="Pre-deposit"
//                 disable
//               />
//               <DefaultInput registerKey="deduction" label="Deduction" disable />
//               <DefaultInput
//                 registerKey="currentDeposit"
//                 label="Deposit"
//                 disable
//               />
//             </div>
//             <div className="flex justify-start md:justify-center items-center gap-2 mt-5">
//               <Button
//                 type="button"
//                 className="px-6 py-2 rounded-lg bg-gray-400 text-white"
//                 onClick={handleResetForm}
//               >
//                 Reset
//               </Button>
//               <Button
//                 type="submit"
//                 className="px-6 py-2 rounded-lg bg-blue-600 text-white"
//               >
//                 Save
//               </Button>
//             </div>
//           </div>
//         </form>

//         {/* Table */}
//         <div className="overflow-x-auto rounded-md border w-full max-w-6xl mx-auto">
//           <table className="min-w-full sm:text-sm table-auto text-sm md:text-base">
//             <thead className="bg-[#e9ebee] text-black">
//               <tr>
//                 <th className="px-4 py-3 text-center">Action</th>
//                 <th className="px-4 py-3 text-center">ID</th>
//                 <th className="px-4 py-3 text-center">Fee Name</th>
//                 <th className="px-4 py-3 text-center">Prescribed Fee</th>
//                 <th className="px-4 py-3 text-center">Deduction</th>
//                 <th className="px-4 py-3 text-center">Pre-deposit</th>
//                 <th className="px-4 py-3 text-center">Deposit</th>
//                 <th className="px-4 py-3 text-center">Due</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedData.length > 0 ? (
//                 paginatedData.map((item, index) => {
//                   const globalIndex = (currentPage - 1) * PAGE_SIZE + index;
//                   return (
//                     <tr
//                       key={`${item.SSFID}-${item.SLID}-${globalIndex}`}
//                       className="border-t"
//                     >
//                       <td className="px-4 text-center">
//                         <DeleteButton
//                           onClick={() => handleDeleteFee(globalIndex)}
//                         />
//                       </td>
//                       <td className="text-center">{item.SLID}</td>
//                       <td className="text-center">
//                         {bnBijoy2Unicode(item.SlName)}
//                       </td>
//                       <td className="text-center">
//                         <DefaultInput
//                           registerKey={`fees.${globalIndex}.amount`}
//                           type="number"
//                           disable
//                         />
//                       </td>
//                       <td className="text-center">
//                         <DefaultKeyDownInput
//                           registerKey={`fees.${globalIndex}.deduction`}
//                           type="number"
//                           onChange={() => handleDeductionChange(globalIndex)}
//                           max={item.preDeposit ? item.deposit : item.amount}
//                         />
//                       </td>
//                       <td className="text-center">
//                         <DefaultInput
//                           registerKey={`fees.${globalIndex}.preDeposit`}
//                           type="number"
//                           disable
//                         />
//                       </td>
//                       <td className="text-center">
//                         <DefaultKeyDownInput
//                           registerKey={`fees.${globalIndex}.deposit`}
//                           type="number"
//                           onChange={() => handleDepositChange(globalIndex)}
//                           max={
//                             item.preDeposit ? item.depositUpdate : item.amount
//                           }
//                         />
//                       </td>
//                       <td className="text-center">
//                         <DefaultInput
//                           registerKey={`fees.${globalIndex}.due`}
//                           type="number"
//                           disable
//                         />
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="text-center">
//                     No data available
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Previous
//             </button>
//             <span className="px-4 py-2">
//               Page {currentPage} of {totalPages}
//             </span>
//             <button
//               onClick={() =>
//                 setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//               }
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         )}
//       </FormProvider>
//     </div>
//   );
// };

// export default StudentMonthDueFeeAceptForm;
