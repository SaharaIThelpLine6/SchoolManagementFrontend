import { useGetUserSingleReportQuery } from '../../../features/userPanel/userInfo/userInfoQuerySlice';
import { formatToDDMMYYYY } from '../../../utils/dateFormat';
import useTranslate from '../../../utils/Translate';

const StudentSingleReport = (id) => {
  const translate = useTranslate();
  const SRID = Number(id.id);

  const {
    data: reportData,
    isLoading,
    isError,
  } = useGetUserSingleReportQuery({ SRID });

  if (isLoading)
    return <p className="text-center py-6 text-gray-500 text-sm">Loading...</p>;
  if (isError)
    return (
      <p className="text-center py-6 text-red-500 text-sm">
        Error fetching report
      </p>
    );
  if (!reportData?.success)
    return (
      <p className="text-center py-6 text-gray-500 text-sm">
        {reportData?.error || 'No report found'}
      </p>
    );

  const data = reportData.data;
  if (!data)
    return (
      <p className="text-center py-6 text-gray-500 text-sm">
        No data available
      </p>
    );

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md border border-gray-200 rounded-lg text-gray-800 font-SolaimanLipi">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold mb-1 flex items-center justify-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zM12 14c-4 0-6 2-6 6h12c0-4-2-6-6-6z"
            />
          </svg>
          শিক্ষার্থী রিপোর্ট
        </h1>
        <p className="text-gray-500 text-xs">
          তারিখ: {translate(formatToDDMMYYYY(data?.CreateDate))}
        </p>
      </div>

      {/* Info Sections */}
      <div className="space-y-3">
        {/* Report Type */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h6m2 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 text-sm font-semibold">রিপোর্ট প্রকার:</p>
          <p className="text-gray-900 text-sm ml-auto">
            {data.ReportType?.ReportTypeName || '—'}
          </p>
        </div>

        {/* Report Certificate */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zM12 14c-4 0-6 2-6 6h12c0-4-2-6-6-6z"
            />
          </svg>
          <p className="text-gray-700 text-sm font-semibold">রিপোর্ট সনদ:</p>
          <p className="text-gray-900 text-sm ml-auto">
            {data.ReportCet?.ReportCetName || '—'}
          </p>
        </div>

        {/* Session */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-gray-700 text-sm font-semibold">সেশন:</p>
          <p className="text-gray-900 text-sm ml-auto">
            {data.Session.SessionName}
          </p>
        </div>

        {/* Subclass */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-pink-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7h18M3 12h18M3 17h18"
            />
          </svg>
          <p className="text-gray-700 text-sm font-semibold">সাবক্লাস:</p>
          <p className="text-gray-900 text-sm ml-auto">
            {data.SubClassData.SubClass}
          </p>
        </div>

        {/* Remark */}
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-2 text-gray-700 text-sm font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-500 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8h10M7 12h6m-6 4h4"
              />
            </svg>
            মন্তব্য:
          </p>
          <p className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-900 text-sm whitespace-pre-wrap">
            {data.Remark || '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSingleReport;
