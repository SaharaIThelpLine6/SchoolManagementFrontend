import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import HomeworkAreaChart from '../../components/HomeworkAreaChart';
import {
  useGetHomeWorkStudyTracksHistoryUserPanelQuery,
  useGetSessionUserPanelQuery,
} from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const SubjectHistoryUserPanel = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { setValue, watch } = methods;
const { subjectName } = useParams();
  const [range, setRange] = useState('10D'); // Default range

  const { data: sessionData = [] } = useGetSessionUserPanelQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);

  const [SessionID] = watch(['SessionID']);

  const { data: homeWorkStudyTrackData, isLoading } =
    useGetHomeWorkStudyTracksHistoryUserPanelQuery(
      { SessionID, range },
      { skip: !SessionID }
    );

  // Extract data from response
  const responseData = homeWorkStudyTrackData?.data || {};
  const subjects = responseData.subjects || [];
  const dates = responseData.dates || [];
  const historyData = responseData.historyData || {};
  const stats = responseData.stats || [];
  const rawData = responseData.rawData || {};

  // Range buttons configuration
  const rangeButtons = [
    { key: '1D', label: '1D' },
    { key: '10D', label: '10D' },
    { key: '1M', label: '1M' },
    { key: '6M', label: '6M' },
    { key: '1Y', label: '1Y' },
  ];

  useEffect(() => {
    setValue('SessionID', activeSession?.SessionID || '');
  }, [activeSession, setValue]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
  };

  // utils/buildSingleSubjectApexData.js
  const buildSingleSubjectApexData = (
    dates = [],
    historyData = {},
    subjectName,
    year = new Date().getFullYear()
  ) => {
    if (!subjectName || !historyData[subjectName]) return [];

    return dates.map((d, index) => {
      const [month, day] = d.split('.').map(Number);

      return {
        x: new Date(year, month - 1, day).getTime(),
        value: historyData[subjectName][index] ? 1 : 0,
      };
    });
  };
  const chartData = buildSingleSubjectApexData(dates, historyData, subjectName);

  return (
    <FormProvider {...methods}>
      <div className="py-6 px-3 bg-gray-100 min-h-screen mb-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {translate('Homework Subject History')}
        </h1>

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
        </div>

        {/* Range Filters */}
        <div className="flex justify-center gap-2 mb-6 shadow-md rounded-sm p-2 bg-white">
          {rangeButtons.map((button) => (
            <button
              key={button.key}
              onClick={() => handleRangeChange(button.key)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-semibold
                transition border
                ${
                  range === button.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {button.label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-2 my-5">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`
                rounded-xl shadow-sm p-2 flex flex-col items-center justify-center
                text-white ${item.bgColor}  md:text-gray-800
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

        {/* Chart */}
        <HomeworkAreaChart chartData={chartData} subjectName={subjectName} />
      </div>
    </FormProvider>
  );
};

export default SubjectHistoryUserPanel;
