import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useGetExamFeeSettingByExamIDQuery,
  useGetExamNamesQuery,
} from '../../../features/exam/examQuerySlice';
import {
  useGetSearchStudentsQuery,
  usePostStudentFeeCollectionMutation,
} from '../../../features/feeCollection/feeCollectionSlice';
import {
  setFilteredSelectedPerStudentFee,
  setMonthFeeData,
} from '../../../features/student/studentSlice';
import { useDefaultSession } from '../../../hooks/useDefaultSession';
import bnBijoy2Unicode from '../../../utils/conveter';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import AccExamFeeCollectorTable from '../student-fee-collection/AccExamFeeCollectorTable';

const AccExamFeeCollector = () => {
  const defaultSessionId = useDefaultSession();
  const location = useLocation();
  const dispatch = useDispatch();
  const methods = useForm({
    defaultValues: {
      StudentCode: '',
      SessionID: defaultSessionId || '',
      IsActive: 1,
      EntryDate: new Date(),
    },
    shouldFocusError: false,
  });
  const { handleSubmit, reset, watch, setValue } = methods;
  const [SessionID, ExamID] = watch(['SessionID', 'ExamID']);

  const translate = useTranslate();
  const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
    (state) => state.student
  );

  const { studentFeeData = [] } = useSelector((state) => state.settings);

  const [studentFeeDataAll, setstudentFeeDataAll] = useState(null);
  const [totalDue, setTotalDue] = useState(null);
  const [logo, setLogo] = useState(null);
  const [filterData, setFilterData] = useState(null);

  const userCode = filteredSelectedPerStudentFee?.StudentCode;
  const sessionId = filteredSelectedPerStudentFee?.SessionID;
  const examId = ExamID;

  // 🧾 Exam Fee Query
  const {
    data: examFeeData = [],
    isLoading: isExamFeeLoading,
    error: examFeeError,
  } = useGetExamFeeSettingByExamIDQuery(
    { examId, userCode, sessionId },
    { skip: !examId || !userCode || !sessionId }
  );

  useEffect(() => {
    if (examFeeError) toast.error('Exam fee data load failed!');
  }, [examFeeError]);

  // 🧾 Exam Name List
  const { data: examNames = [], isLoading: examIsLoading } =
    useGetExamNamesQuery();

  const [postStudentFee] = usePostStudentFeeCollectionMutation();

  // 🧠 Default session set
  useEffect(() => {
    if (defaultSessionId) {
      setValue('SessionID', defaultSessionId, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [defaultSessionId, setValue]);

  // 🧍‍♂️ Search Students Query
  const { data: searchUserInfo = { data: [] }, isLoading: userInfoLoading } =
    useGetSearchStudentsQuery(filterData, {
      skip: !filterData,
      refetchOnFocus: false,
    });

  // 👉 Search result handling
  useEffect(() => {
    if (searchUserInfo) {
      if (
        Array.isArray(searchUserInfo.data) &&
        searchUserInfo.data.length > 0
      ) {
        dispatch(setFilteredSelectedPerStudentFee(searchUserInfo.data[0]));
      } else if (searchUserInfo.message) {
        toast.info(searchUserInfo.message);
      }
    }
  }, [searchUserInfo, dispatch]);

  // 🖼️ Student Image Convert
  useEffect(() => {
    if (filteredSelectedPerStudentFee?.Image?.data) {
      const buffer = Buffer.from(filteredSelectedPerStudentFee.Image.data);
      const base64String = buffer.toString('base64');
      const imageSrc = `data:image/png;base64,${base64String}`;
      setLogo(imageSrc);
    }
  }, [filteredSelectedPerStudentFee]);

  // 💰 Calculate Total Due
  useEffect(() => {
    if (studentFeeData?.fees) {
      const feesDue = studentFeeData.fees.reduce(
        (sum, fee) => sum + (fee.due || 0),
        0
      );
      setTotalDue(feesDue);
    }
  }, [studentFeeData]);

  useEffect(() => {
    setstudentFeeDataAll(studentFeeData);
  }, [studentFeeData]);

  // 🔁 Reset form when student changes
  useEffect(() => {
    if (filteredSelectedPerStudentFee) {
      const defaultValues = {
        ID: filteredSelectedPerStudentFee.UserID ?? '',
        StudentCode: filteredSelectedPerStudentFee.StudentCode ?? '',
        SessionID: filteredSelectedPerStudentFee.SessionID ?? '',
      };
      reset(defaultValues);
    } else {
      reset({
        StudentCode: '',
        SessionID: '',
      });
    }
  }, [filteredSelectedPerStudentFee, reset]);

  // 📨 Submit
  const onSubmit = async (data) => {
    try {
      if (!studentFeeData?.fees || studentFeeData.fees.length === 0) {
        toast.warning('ফি এর খাত নির্বাচন করুন।');
        return;
      }

      const payload = {
        UserID: studentFeeData.userId,
        AdmissionID: studentFeeData.admissionId,
        CurrentInvoice: studentFeeData.prescribedFee,
        InvoiceDiscount: studentFeeData.deduction,
        CurrentPaid: studentFeeData.currentDeposit,
        Due: totalDue,
        AmountInWord: data.speakCurrentDeposit,
        CreateAt: data.EntryDate,
        Remark: data.Remark,
        AccountType: data.GLID,
        Account: data.SLID,
        fees: studentFeeData.fees,
        MonthId: monthFeeData?.monthId || '',
      };

      await postStudentFee(payload).unwrap();
      toast.success('ডেটা সফলভাবে সাবমিট হয়েছে ✅');

      dispatch(setMonthFeeData(null));
      dispatch(setFilteredSelectedPerStudentFee(null));
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('ডেটা সাবমিট করতে সমস্যা হয়েছে ❌');
    }
  };

  const handleEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const studentCode = methods.getValues('StudentCode');
      setFilterData({ search: studentCode, SessionID });
    }
  };

  // Safe data access with defaults
  const examFee = examFeeData[0]?.Fee || 0;
  const deduction = studentFeeDataAll?.deduction || 0;
  const grandTotal = examFee;
  const preDeposit = totalDue || 0;
  const allPaid = totalDue || 0;
  const currentDeposit = totalDue || 0;

  return (
    <div className="font-SolaimanLipi">
      <FormProvider {...methods}>
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg border">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <h3 className="text-lg md:text-xl font-bold text-gray-800">
              {translate('Student admission completed.')}
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Photo and Student Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-28 h-28 md:w-40 md:h-36 border-2 border-dashed border-gray-400 flex items-center justify-center rounded-lg overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Photo</span>
                  )}
                </div>

                <div className="w-full">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    {translate('Student Code')}:
                  </label>
                  <input
                    {...methods.register('StudentCode', { required: true })}
                    className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100
                         focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    onKeyDown={handleEnter}
                    required
                  />
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-4">
                <DefaultSelect
                  label="Exam Name"
                  options={examNames}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                  labelPosition="left"
                  unicode
                />

                <div className="bg-white space-y-3">
                  <InfoRow
                    label={translate('নাম')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.StudentName
                    )}
                    valueClassName="text-green-600 font-bold"
                  />
                  <InfoRow
                    label={translate('পিতার নাম')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.FatherName
                    )}
                  />
                  <InfoRow
                    label={translate('মোবাইল')}
                    value={filteredSelectedPerStudentFee?.Mobile1}
                  />
                  <InfoRow
                    label={translate('শ্রেণি/জামাত')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.ClassName
                    )}
                  />
                  <InfoRow
                    label={translate('Session')}
                    value={bnBijoy2Unicode(
                      filteredSelectedPerStudentFee?.SessionName
                    )}
                  />
                </div>
              </div>

              {/* Fee Info */}
              <div className="bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <FeeInfoItem
                    label={translate('Prescribed Fee')}
                    value={examFee}
                  />
                  <FeeInfoItem
                    label={translate('Deduction')}
                    value={deduction}
                  />
                  <FeeInfoItem
                    label={translate('Grand Total')}
                    value={grandTotal}
                  />
                  <FeeInfoItem
                    label={translate('Pre-deposit')}
                    value={preDeposit}
                  />
                  <FeeInfoItem label={translate('All paid')} value={allPaid} />
                  <FeeInfoItem
                    label={translate('Current deposit')}
                    value={currentDeposit}
                  />
                  <div className="col-span-2">
                    <FeeInputItem label={translate('Due')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 md:mt-8">
              {/* ✅ Left Side Buttons */}
              <div className="flex flex-row gap-3">
                {/* Save Button */}
                <Button
                  disabled
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white text-base font-semibold rounded-lg 
                 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
                >
                  💾 Save
                </Button>

                {/* Reset Button */}
                <Button
                  disabled
                  type="button"
                  className="px-6 py-3 bg-red-500 text-white text-base font-semibold rounded-lg 
                 shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-200"
                >
                  🔁 Reset
                </Button>
              </div>

              {/* 📘 Right Side NavLink */}
              <NavLink
                to="/exam/fee-determine"
                onClick={() => hideModal()}
                className={({ isActive }) =>
                  `px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 
       flex items-center justify-center gap-2 shadow-md
       ${
         isActive
           ? 'bg-blue-600 text-white shadow-lg scale-105'
           : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-[1.03]'
       }`
                }
              >
                📘 পরীক্ষার ফি নির্ধারণ
              </NavLink>
            </div>
          </form>
        </div>
      </FormProvider>
      <AccExamFeeCollectorTable />
    </div>
  );
};

// 🔹 Reusable Info Row
const InfoRow = ({ label, value, valueClassName = '' }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 max-w-36 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <span className={`ml-2 flex-1 truncate ${valueClassName}`}>
      {value || 'N/A'}
    </span>
  </div>
);

// 🔹 Fee Info Item
const FeeInfoItem = ({ label, value }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <span className="ml-2 w-20 p-1 border border-gray-300 rounded min-h-[1.5rem] bg-gray-50">
      {value}
    </span>
  </div>
);

// 🔹 Fee Input Item
const FeeInputItem = ({ label }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <input
      type="text"
      className="ml-2 w-20 p-1 border border-gray-300 rounded bg-gray-50"
      placeholder="::"
      readOnly
    />
  </div>
);

export default AccExamFeeCollector;
