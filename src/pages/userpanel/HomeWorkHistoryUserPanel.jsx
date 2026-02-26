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

const HomeWorkHistoryUserPanel = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { setValue, watch } = methods;
  const { schoolid } = useParams();
  const [range, setRange] = useState('1M'); // Default range

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

  return (
    <FormProvider {...methods}>
      <div className="py-6 px-3 bg-gray-100 min-h-screen mb-20">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {translate('Homework History')}
        </h1>
        {/* <div className="flex my-3 justify-end">
          <Link to={`/${schoolid}/dashboard/home-work`}>
            <Button>Back</Button>
          </Link>
        </div> */}
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
        <div className="">
          <HomeworkAreaChart data={responseData} />
        </div>

        {/* Homework History Grid */}
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading homework history...</p>
          </div>
        ) : subjects.length > 0 && dates.length > 0 ? (
          <div className="bg-sky-100 rounded-xl overflow-x-auto w-full max-w-screen">
            <div className="grid grid-flow-col auto-cols-[24px] sm:auto-cols-[28px] md:auto-cols-[36px] lg:auto-cols-[44px] w-fit text-center">
              {/* Date Column */}
              <div className="sticky left-0 z-10 bg-sky-100 min-w-[24px] sm:min-w-[28px] md:min-w-[36px] lg:min-w-[44px]">
                <div className="overflow-hidden w-full flex items-center justify-center bg-white h-[110px] sm:h-[130px] md:h-[150px] border">
                  <span className="text-black text-[10px] sm:text-[11px] md:text-[12px] font-semibold [writing-mode:vertical-rl] rotate-180">
                    তারিখ-মাস
                  </span>
                </div>
                {dates.map((d) => (
                  <div
                    key={d}
                    className="h-8 sm:h-9 md:h-10 w-full flex items-center justify-center text-xs font-semibold text-gray-700 border border-white"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Subject Columns */}
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="min-w-[24px] sm:min-w-[28px] md:min-w-[36px] lg:min-w-[44px] text-center"
                >
                  {/* Header */}
                  <div className="group block rounded-xl border hover:shadow-md">
                    <div className="overflow-hidden w-full flex items-center justify-center bg-white h-[110px] sm:h-[130px] md:h-[150px] border">
                      <span className="text-black text-[10px] sm:text-[11px] md:text-[12px] font-semibold [writing-mode:vertical-rl] rotate-180">
                        {subject.name}
                      </span>
                    </div>
                  </div>

                  {/* Cells */}
                  {historyData[subject.name]?.map((status, i) => {
                    let bgColor = '';
                    let symbol = '';

                    if (status === 1) {
                      bgColor = 'bg-green-500';
                      symbol = '✓';
                    } else if (status === 2) {
                      bgColor = 'bg-red-500';
                      symbol = '✕';
                    } else if (status === 3) {
                      bgColor = 'bg-blue-400';
                      symbol = '●';
                    } else if (status === 4) {
                      bgColor = 'bg-yellow-400';
                      symbol = '✕';
                    }

                    return (
                      <div
                        key={i}
                        className="h-8 sm:h-9 md:h-10 w-full flex items-center justify-center border border-white"
                      >
                        {status ? (
                          <div
                            className={`
                      w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5
                      ${bgColor} rounded flex items-center justify-center
                      text-[8px] sm:text-[10px] md:text-[12px]
                      text-white font-bold
                    `}
                          >
                            {symbol}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600">No homework history found</p>
            <p className="text-gray-400 text-sm mt-1">
              Select a different session or range
            </p>
          </div>
        )}

        {/* {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading homework history...</p>
          </div>
        ) : subjects.length > 0 && dates.length > 0 ? (
          <div className="bg-sky-100 rounded-xl overflow-x-auto max-w-full">
            <div className="grid grid-flow-col auto-cols-[28px] w-fit">

              <div className="min-w-[28px]">
                <div
                  className={`
        overflow-hidden w-full flex items-center justify-center bg-white h-[150px] border
      `}
                >
                  <span
                    className="text-black text-[12px] font-semibold
               [writing-mode:vertical-rl] rotate-180"
                  >
                    তারিখ-মাস
                  </span>
                </div>
                {dates.map((d) => (
                  <div
                    key={d}
                    className="h-10 w-full flex items-center justify-center
                     text-xs font-semibold text-gray-700 border border-white "
                  >
                    {d}
                  </div>
                ))}
              </div>

              {subjects.map((subject, index) => (
                <div key={subject.id} className="min-w-[28px] text-center">

                  <div
                    className="group block rounded-xl border
  hover:shadow-md"
                  >
                    <div
                      className="
      overflow-hidden w-full flex items-center justify-center
      bg-white h-[150px] border
    "
                    >
                      <span
                        className="
        text-black text-[12px] font-semibold
        [writing-mode:vertical-rl] rotate-180
      "
                      >
                        {subject.name}
                      </span>
                    </div>
                  </div>



                  {historyData[subject.name]?.map((status, i) => {
                    let bgColor = '';
                    let symbol = '';

                    if (status === 1) {
                      bgColor = 'bg-green-500';
                      symbol = '✓';
                    } else if (status === 2) {
                      bgColor = 'bg-red-500';
                      symbol = '✕';
                    } else if (status === 3) {
                      bgColor = 'bg-blue-400';
                      symbol = '●';
                    } else if (status === 4) {
                      bgColor = 'bg-yellow-400';
                      symbol = '✕';
                    }

                    return (
                      <div
                        key={i}
                        className="h-10 w-full flex items-center justify-center border border-white"
                      >
                        {status ? (
                          <div
                            className={`w-4 h-4 ${bgColor} rounded flex items-center justify-center text-[10px] text-white font-bold`}
                          >
                            {symbol}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600">No homework history found</p>
            <p className="text-gray-400 text-sm mt-1">
              Select a different session or range
            </p>
          </div>
        )} */}
      </div>
    </FormProvider>
  );
};

export default HomeWorkHistoryUserPanel;
