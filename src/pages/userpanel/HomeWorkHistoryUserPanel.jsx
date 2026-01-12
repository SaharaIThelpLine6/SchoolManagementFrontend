import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useGetHomeWorkStudyTracksHistoryUserPanelQuery,
  useGetSessionUserPanelQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';
import HomeWorkHistory from './HomeWorkHistory';

const HomeWorkHistoryUserPanel = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { setValue, watch } = methods;
  const { schoolid } = useParams();

  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const [SessionID, DateValue] = watch(['SessionID', 'DateValue']);

  // Convert to ISO string if DateValue is a Date object
  const dateString =
    DateValue instanceof Date ? DateValue.toISOString() : DateValue;
  const dateOnly = dateString ? dateString.split('T')[0] : null;

  const { data: homeWorkStudyTrackData = [] } =
    useGetHomeWorkStudyTracksHistoryUserPanelQuery(
      { SessionID, DateValue: dateOnly },
      { skip: !SessionID }
    );

  const homeWorkData = Array.isArray(homeWorkStudyTrackData)
    ? homeWorkStudyTrackData
    : homeWorkStudyTrackData?.data || [];

  console.log(homeWorkData, 'homeWorkData');

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);
  const stats = [
    {
      value: 50,
      label: 'মোট বিষয়',
      color: 'bg-purple-400',
      circle: 'bg-purple-500',
    },
    {
      value: 32,
      label: 'উপস্থিত হয়েছে',
      color: 'bg-blue-400',
      circle: 'bg-blue-500',
    },
    {
      value: 18,
      label: 'পড়া দিয়েছে',
      color: 'bg-green-400',
      circle: 'bg-green-500',
    },
    {
      value: 7,
      label: 'পড়া দেয়নি',
      color: 'bg-red-400',
      circle: 'bg-red-500',
    },
  ];

  return (
    <FormProvider {...methods}>
      <div className="py-6 px-3 bg-gray-100 min-h-screen mb-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          Homework History
        </h1>
        <div className="flex my-3 justify-end">
          <Link to={`/${schoolid}/dashboard/home-work`}>
            <Button>Back</Button>
          </Link>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-start items-center gap-4 mb-6">
          <DefaultSelect
            label={translate('Session')}
            nameField="SessionName"
            registerKey="SessionID"
            valueField="SessionID"
            options={sessionData}
            defaultSelect={false}
            unicode
          />

          {/* <DatePickerOne
            dateCalender={`${translate('Date')}`}
            placeholder={translate('Select Date')}
            registerKey={'DateValue'}
            require={'Date Require'}
          /> */}
        </div>

        {/* Homework Cards */}
        {/* {homeWorkData.length === 0 ? (
          <p className="text-gray-500">No homework found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homeWorkData.map((hw) => (
              <div
                key={hw.HSTID}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {hw.Subject?.SubjectName || 'Unknown Subject'}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {new Date(hw.CreateAt).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Class: </span>
                  {hw.SubClass?.SubClass || 'Unknown Class'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Session: </span>
                  {hw.Session?.SessionName || 'Unknown Session'}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-semibold">Teacher: </span>
                  {hw.User?.UserName || 'Unknown'}
                </p>

                <div className="mt-3">
                  <h3 className="font-semibold text-gray-700 mb-1">Homework</h3>
                  {hw.HomeWork?.HomeWork ? (
                    <p className="text-gray-600">{hw.HomeWork.HomeWork}</p>
                  ) : (
                    <p className="text-gray-500 italic">No homework assigned</p>
                  )}

                  {hw.HomeWork?.ClassWork && (
                    <>
                      <h3 className="font-semibold text-gray-700 mt-2 mb-1">
                        Classwork
                      </h3>
                      <p className="text-gray-600">{hw.HomeWork.ClassWork}</p>
                    </>
                  )}
                </div>


                <div className="mt-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    Homework ID: {hw.HSTID}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )} */}
        {/* Header Filters */}

        <div className="flex justify-center gap-2 mb-6 shadow-md rounded-sm p-2 bg-white">
          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold
               text-gray-600 hover:bg-gray-100 transition border"
          >
            1D
          </button>

          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold
               text-gray-600 hover:bg-gray-100 transition border"
          >
            10D
          </button>

          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold
               bg-blue-600 text-white shadow-sm border"
          >
            1M
          </button>

          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold
               text-gray-600 hover:bg-gray-100 transition border"
          >
            6M
          </button>

          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold
               text-gray-600 hover:bg-gray-100 transition border"
          >
            1Y
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 my-5">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`
        rounded-xl shadow-sm p-2 flex flex-col items-center justify-center
        text-white ${item.color} md:bg-white md:text-gray-800 md:shadow-md /* Desktop white */
      `}
            >
              {/* Circle */}
              <span
                className={`
        h-12 w-12 flex items-center justify-center rounded-full
        ${item.circle} text-white font-semibold
      `}
              >
                {item.value}
              </span>

              {/* Label */}
              <span
                className="
        mt-2 text-xs font-medium text-white
        md:text-gray-700
        text-center
      "
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <HomeWorkHistory />
      </div>
    </FormProvider>
  );
};

export default HomeWorkHistoryUserPanel;
