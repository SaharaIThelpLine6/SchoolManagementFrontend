import { Buffer } from 'buffer';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useGetExamFeeSettingByExamIDQuery,
  useGetExamFeeSlidQuery,
  useGetExamNamesQuery,
} from '../../../features/exam/examQuerySlice';
import {
  useGetSearchStudentsExamFeeQuery,
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
import { setStudentFeeData } from '../../../features/settings/settingsSlice';

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
      deduction: 0,
      currentDeposit: 0,
      due: 0,
    },
    shouldFocusError: false,
  });

  const { handleSubmit, reset, watch, setValue, getValues, register } =
    methods;
  const [SessionID, ExamID, deductionWatch, currentDepositWatch, dueWatch] =
    watch(['SessionID', 'ExamID', 'deduction', 'currentDeposit', 'due']);

  const translate = useTranslate();
  const { filteredSelectedPerStudentFee, monthFeeData } = useSelector(
    (state) => state.student
  );
  const { studentFeeData = [] } = useSelector((state) => state.settings);

  const shouldSkip =
    !filteredSelectedPerStudentFee?.StudentCode ||
    !filteredSelectedPerStudentFee?.ClassID ||
    !filteredSelectedPerStudentFee?.SessionID ||
    !ExamID;

  const {
    data = [],
    isLoading,
    error,
  } = useGetSearchStudentsExamFeeQuery(
    {
      search: filteredSelectedPerStudentFee?.StudentCode,
      ClassID: filteredSelectedPerStudentFee?.ClassID,
      SessionID: filteredSelectedPerStudentFee?.SessionID,
      ExamID,
    },
    {
      skip: shouldSkip,
    }
  );
  console.log(data, "data StudentExamFeeStatus")
  const StudentExamFeeStatus = data?.data?.[0].ExamFeeStatus;

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

  const { data: examFeeSLIDData = [], isLoading: examFeeSLIDLoading } = useGetExamFeeSlidQuery(
    {
      examId,
      sessionId: filteredSelectedPerStudentFee.SessionID,
      subClassId: filteredSelectedPerStudentFee.SubClassID,
    },
    {
      skip: !examId,
    }
  );
  const examSLID = examFeeSLIDData[0]?.SLID;


  // 🧾 Exam Name List
  const { data: examNames = [], isLoading: examIsLoading } =
    useGetExamNamesQuery();


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

  // 💰 Calculate Total Due (pre-deposit / already paid)
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
        deduction: 0,
        currentDeposit: 0,
        due: 0,
      };
      reset(defaultValues);
    } else {
      reset({
        StudentCode: '',
        SessionID: '',
        deduction: 0,
        currentDeposit: 0,
        due: 0,
      });
    }
  }, [filteredSelectedPerStudentFee, reset]);

  // Safe data access with defaults
  const examFee = examFeeData[0]?.Fee || 0;
  const grandTotal = examFee;
  const preDeposit = totalDue || 0;
  const allPaid = totalDue || 0;

  // 🧮 Same pattern as StudentMonthFeeAceptForm's recalcFee:
  // deposit gets capped so it never exceeds what's left after deduction + preDeposit,
  // then due = prescribedFee - deduction - preDeposit - deposit
  const recalcFee = useCallback((fee) => {
    const prescribedFee = Number(fee.amount || 0);
    const deduction = Number(fee.deduction || 0);
    const preDeposit = Number(fee.preDeposit || 0);
    let deposit = Number(fee.deposit || 0);

    // Ensure deposit does not exceed remaining fee
    const maxDeposit = prescribedFee - deduction - preDeposit;
    if (deposit > maxDeposit) deposit = maxDeposit;

    const due = prescribedFee - deduction - preDeposit - deposit;

    return { deposit, due };
  }, []);

  // Keep currentDeposit / due in sync when grandTotal / preDeposit itself changes
  // (e.g. student or exam switched). By default we assume FULL payment,
  // so currentDeposit = grandTotal - preDeposit and due = 0 on first load.
  // Due only becomes non-zero once the user manually REDUCES currentDeposit.
  useEffect(() => {
    const maxDeposit = Number(grandTotal || 0) - Number(preDeposit || 0);
    const initialDeposit = maxDeposit > 0 ? maxDeposit : 0;

    setValue('deduction', 0);
    setValue('currentDeposit', initialDeposit);
    setValue('due', 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grandTotal, preDeposit]);

  // ✏️ Deduction change: recalc deposit (capped) + due, exactly like handleDeductionChange in StudentMonthFeeAceptForm
  const handleDeductionChange = (e) => {
    const newDeduction = Number(e.target.value) || 0;
    setValue('deduction', newDeduction);

    const values = getValues();
    const { deposit, due } = recalcFee({
      amount: grandTotal,
      deduction: newDeduction,
      preDeposit,
      deposit: values.currentDeposit,
    });

    setValue('currentDeposit', deposit);
    setValue('due', due);
  };

  // ✏️ Direct currentDeposit edit: recalc deposit (capped) + due, exactly like handleDepositChange in StudentMonthFeeAceptForm
  const handleCurrentDepositChange = (e) => {
    const newDeposit = Number(e.target.value) || 0;

    const values = getValues();
    const { deposit, due } = recalcFee({
      amount: grandTotal,
      deduction: values.deduction,
      preDeposit,
      deposit: newDeposit,
    });

    setValue('currentDeposit', deposit);
    setValue('due', due);
  };

  // 📨 Submit
  const onSubmit = async (data) => {
    try {
      if (!examSLID) {
        toast.warning('শিক্ষার্থীর ফি র্নিধারণ করা হয়নি।');
        return;
      }
      if (StudentExamFeeStatus === 1) {
        toast.warning('নির্বাচিত শিক্ষার্থীর ফি গ্রহণ করা হয়েছে।');
        return;
      }
      console.log(StudentExamFeeStatus, "StudentExamFeeStatus")

      const payload = {
        studentCode: data.StudentCode,
        monthId: 20,
        deduction: data.deduction,
        currentDeposit: data.currentDeposit,
        userId: data.ID,
        admissionId: filteredSelectedPerStudentFee.AdmissionID,
        due: data.due,
        type: "exam",
        ExamID: examFeeData[0].ExamID,
        prescribedFee: examFeeData[0].Fee,
        fees: [{
          // SSFID: 287,
          SLID: examSLID,
          // SlName: "খাবার ফি",
          ExamName: examFeeData[0].ExamName,
          sessionId: filteredSelectedPerStudentFee.SessionID,
          sessionName: filteredSelectedPerStudentFee.SessionName,
          classId: filteredSelectedPerStudentFee.ClassID,
          amount: examFeeData[0].Fee,
          deduction: data.deduction,
          deposit: data.currentDeposit,
          preDeposit: 0,
          due: data.due,
        }]
      }
      console.log(payload, "payload")
      dispatch(setStudentFeeData(payload));
      hideModal();

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

  [
    {
      "fees": [
        {
          "SSFID": 287,
          "SLID": 10104,
          "SlName": "খাবার ফি",
          "sessionId": 3,
          "sessionName": "২০২৬",
          "classId": 8,
          "amount": 1500,
          "deduction": 0,
          "deposit": 1500,
          "preDeposit": 0,
          "due": 0
        },
        {
          "SSFID": 286,
          "SLID": 10105,
          "SlName": "মাসিক বেতন",
          "sessionId": 3,
          "sessionName": "২০২৬",
          "classId": 8,
          "amount": 700,
          "deduction": 0,
          "deposit": 700,
          "preDeposit": 0,
          "due": 0
        }
      ],
      "studentCode": 400033,
      "monthId": 6,
      "monthName": "জুন",
      "prescribedFee": 2200,
      "deduction": 0,
      "currentDeposit": 2200,
      "userId": 161,
      "admissionId": 93,
      "due": 0,
      "type": "month"
    }
  ]

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
                  {/* ✏️ Editable Deduction -> recalculates Due */}
                  <FeeEditableInput
                    label={translate('Deduction')}
                    registerKey="deduction"
                    register={register}
                    onChange={handleDeductionChange}
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
                  {/* ✏️ Editable Current deposit -> recalculates Due */}
                  <FeeEditableInput
                    label={translate('Current deposit')}
                    registerKey="currentDeposit"
                    register={register}
                    onChange={handleCurrentDepositChange}
                  />
                  <div className="col-span-2">
                    {/* 🔒 Due is auto-calculated, read-only */}
                    <FeeInfoItem
                      label={translate('Due')}
                      value={dueWatch ?? 0}
                    />
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
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white text-base font-semibold rounded-lg 
                 shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200"
                >
                  💾 Save
                </Button>

                {/* Reset Button */}
                <Button
                  type="button"
                  onClick={() => {
                    const maxDeposit =
                      Number(grandTotal || 0) - Number(preDeposit || 0);
                    const initialDeposit = maxDeposit > 0 ? maxDeposit : 0;

                    setValue('deduction', 0);
                    setValue('currentDeposit', initialDeposit);
                    setValue('due', 0);
                  }}
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
       ${isActive
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

// 🔹 Fee Info Item (read-only display)
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

// 🔹 Fee Editable Input (deduction / currentDeposit) — updates Due on change
const FeeEditableInput = ({ label, registerKey, register, onChange }) => (
  <div className="flex items-center text-sm">
    <span className="font-semibold text-gray-700 min-w-20 pr-2 flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-700 w-2 flex-shrink-0">:</span>
    <input
      type="number"
      {...register(registerKey)}
      onChange={onChange}
      className="ml-2 w-20 p-1 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
    />
  </div>
);

export default AccExamFeeCollector;
