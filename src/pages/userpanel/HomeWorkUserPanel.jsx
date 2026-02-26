import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import SvgIcon from '../../components/icons/SvgIcon';
import {
  useGetHomeWorksUserPanelQuery,
  useGetSessionUserPanelQuery
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import { showModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const SubjectIcon = ({ index }) => {
  const colors = [
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
  ];
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
        colors[index % colors.length]
      }`}
    >
      {index + 1}
    </div>
  );
};

const HomeworkItem = ({
  homework,
  index,
  isOpen,
  onToggle,
  handleViewTeacherDetials,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <SubjectIcon index={index} />

        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {homework.Subject?.SubjectName || 'বিষয়'}
          </h3>
        </div>

        {/* ✅ Homework status checkbox (centered vertically) */}
        {/* <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={homework?.IsDone}
            readOnly
            className="sr-only"
          />
          <span
            className={`w-5 h-5 flex items-center justify-center rounded border-2
        ${
          homework?.IsDone
            ? 'bg-green-500 border-green-600'
            : 'bg-red-500 border-red-600'
        }
        text-white font-bold text-sm`}
          >
            {homework?.IsDone ? '✓' : '✕'}
          </span>
        </label> */}

        <div className="rounded-full p-3 bg-[#aac5e6] flex items-center justify-center cursor-pointer hover:bg-[#92b4d4] transition-colors">
          <svg
            className={`w-5 h-5 text-gray-700 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Class Work */}
          {homework.ClassWork && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-semibold text-green-700 mb-1">
                📘 ক্লাসের কাজ
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {homework.ClassWork}
              </p>
            </div>
          )}

          {/* Home Work */}
          {homework.HomeWork && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-semibold text-blue-700 mb-1">🏠 বাড়ির কাজ</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {homework.HomeWork}
              </p>
            </div>
          )}

          {/* Note / Instruction (image bottom red marked area) */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">ক্লাস নিয়েছেন:</span>{' '}
                {homework.User.UserName}
              </p>

              <Button onClick={() => handleViewTeacherDetials(homework?.HWID)}>
                <SvgIcon name={'FaEye'} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HomeWorkUserPanel = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const translate = useTranslate();
  const methods = useForm();
  const { schoolid } = useParams();

  const { setValue, watch } = methods;
  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  // console.log(sessionData, 'sessionData');
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const handleViewTeacherDetials = useCallback(
    (id) => {
      showModal(translate('View homework'), 'TEACHER_VIEW_HOME_WORK', id);
    },
    [translate]
  );
  const [SessionID, DateValue] = watch(['SessionID', 'DateValue']);

  // Convert to ISO string if DateValue is a Date object
  const dateOnly = DateValue
  ? new Date(DateValue).toLocaleDateString('en-CA')
  : null;


const { data = [], isLoading } = useGetHomeWorksUserPanelQuery(
  { SessionID, DateValue: dateOnly },
  { skip: !SessionID }
);



  const homeWorkData = Array.isArray(data) ? data : data?.data || [];

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-md mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="max-w-md mx-auto p-4 space-y-2 mb-20">
        <div className="flex justify-center items-center">
          <Link to={`/${schoolid}/dashboard/home-work-history`}>
            <Button>History</Button>
          </Link>
        </div>
        {/* Header */}
        <div className="flex flex-col justify-between items-center gap-2 mb-4">
          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            defaultSelect={false}
            unicode
          />

          <DatePickerOne
            dateCalender={`${translate('Date')}`}
            placeholder={''}
            registerKey={'DateValue'}
            require={'Date Require'}
          />
        </div>

        {/* Homework List */}
        {homeWorkData.length === 0 ? (
          <p className="text-center text-gray-500">
            কোনো হোমওয়ার্ক পাওয়া যায়নি
          </p>
        ) : (
          homeWorkData?.map((hw, index) => (
            <HomeworkItem
              key={hw.HWID || index}
              homework={hw}
              index={index}
              handleViewTeacherDetials={handleViewTeacherDetials}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))
        )}
      </div>
    </FormProvider>
  );
};

export default HomeWorkUserPanel;
