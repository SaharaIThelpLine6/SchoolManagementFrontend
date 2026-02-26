import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import DefaultInput from '../../../components/Forms/DefaultInput';
import { setPageName } from '../../../features/auth/authSlice';
import { useGetStudentFeeIncreaseDecreaseQuery } from '../../../features/feeCollection/feeCollectionSlice';
import useTranslate from '../../../utils/Translate';
import SelectedPerStudentFeeTable from '../../../view/accounting/SelectedPerStudentFeeTable';
import MonthDetermineFeeTable from '../MonthDetermineFeeTable';

const MonthStudentFeeForm = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const { filteredSelectedPerStudentFee } = useSelector(
    (state) => state.student
  );

  console.log(filteredSelectedPerStudentFee, 'filteredSelectedPerStudentFee');

  const methods = useForm();
  const { handleSubmit, reset, watch, setValue } = methods;

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

  const data = studentMonthFeeData?.data[0];
  const totalAmount =
    studentMonthFeeData?.data[0].landFeeWithMonths?.totalAmount;

  // ✅ Set values when filteredSelectedPerStudentFee changes
  useEffect(() => {
    if (data) {
      setValue('StudentCode', data.StudentCode || '');
      setValue('StudentName', data.StudentName || '');
      setValue('ClassName', data.ClassName || '');
      setValue('SessionName', data.SessionName || '');
      setValue('Comment', '');
      setValue(
        'AmountTotal',
        totalAmount ? totalAmount : data.TotalAmount || 0
      );
      setValue('LessTotal', data.TotalLess || 0);
      setValue('Total', totalAmount ? totalAmount : data.TotalFinalAmount || 0);
    } else {
      // ✅ Clear form when no student selected
      reset({
        StudentCode: '',
        StudentName: '',
        ClassName: '',
        SessionName: '',
        Comment: '',
        AmountTotal: '0',
        LessTotal: '0',
        Total: '0',
      });
    }
  }, [data, setValue, reset]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const onSubmit = () => {};

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="col-span-2 ">
          <FormProvider {...methods}>
            {/* Student Info Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-2 mb-6"
            >
              <DefaultInput
                type="text"
                registerKey="StudentCode"
                label="Student Code"
                labelPosition="left"
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="StudentName"
                label="Name"
                labelPosition="left"
                unicode={true}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="ClassName"
                label="Class"
                labelPosition="left"
                unicode={true}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="SessionName"
                label="Session"
                labelPosition="left"
                unicode={true}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="Comment"
                label="Comment"
                labelPosition="left"
                unicode={true}
              />
              <DefaultInput
                type="text"
                registerKey="AmountTotal"
                label="Total Fee"
                labelPosition="left"
                defaultValue={data.TotalAmount}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="LessTotal"
                label="Deduction"
                labelPosition="left"
                defaultValue={data.TotalLess}
                disable={true}
              />
              <DefaultInput
                type="text"
                registerKey="Total"
                label="Total Deposits"
                labelPosition="left"
                defaultValue={data.TotalFinalAmount}
                disable={true}
              />
            </form>
          </FormProvider>
        </div>
        <div className="col-span-3 rounded-xl">
          <MonthDetermineFeeTable />
        </div>
      </div>
      <div className="bg-gray-50 p-3 md:p-4 rounded-xl border mt-5">
        <SelectedPerStudentFeeTable />
      </div>
    </div>
  );
};

export default MonthStudentFeeForm;
