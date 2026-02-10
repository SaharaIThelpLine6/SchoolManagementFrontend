import { useGetStudentComplaintReportQuery } from '../../../features/userPanel/userInfo/userInfoQuerySlice';
import { formatToDDMMYYYY } from '../../../utils/dateFormat';
import useTranslate from '../../../utils/Translate';

const StudentSingleComplaint = ({ id }) => {
  const translate = useTranslate();
  const SCID = Number(id);

  const {
    data: reportData,
    isLoading,
    isError,
  } = useGetStudentComplaintReportQuery(
    { SCID, refetchOnMountOrArgChange: true },
    { skip: !SCID }
  );

  if (isLoading)
    return <p className="text-center py-6 text-gray-500 text-sm">Loading...</p>;

  if (isError)
    return (
      <p className="text-center py-6 text-red-500 text-sm">
        Error fetching complaint
      </p>
    );

  if (!reportData?.success)
    return (
      <p className="text-center py-6 text-gray-500 text-sm">
        No complaint found
      </p>
    );

  const data = reportData.data;
  const user = data?.CreatedBy;

  return (
    <div className="max-w-md mx-auto p-4 bg-white border border-gray-200 rounded-xl shadow-sm font-SolaimanLipi text-gray-800">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold flex justify-center items-center gap-2">
          📝 শিক্ষার্থীর অভিযোগ
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          তারিখ: {translate(formatToDDMMYYYY(data?.CreateAt))}
        </p>
      </div>

      {/* User Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">নাম:</span>
          <span className="font-semibold">{user?.UserName || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">মোবাইল:</span>
          <span>{user?.Mobile1 || '—'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">স্ট্যাটাস:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              Number(data?.SeeUnSee) === 1
                ? 'bg-green-100 text-green-600'
                : Number(data?.SeeUnSee) === 3
                  ? 'bg-yellow-100 text-yellow-600'
                  : 'bg-red-100 text-red-600'
            }`}
          >
            {Number(data?.SeeUnSee) === 1
              ? translate('সমাধান')
              : Number(data?.SeeUnSee) === 3
                ? translate('প্রক্রিয়াধীন')
                : translate('অপেক্ষমান')}
          </span>
        </div>
      </div>

      {/* Complaint Details */}
      <div className="mt-5">
        <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
          <span className="text-base">📌</span>
          অভিযোগের বিস্তারিত
        </p>

        <div
          className="
      bg-gradient-to-br from-gray-50 to-white
      border border-gray-200
      rounded-xl
      p-4
      text-sm
      leading-relaxed
      text-gray-800
      whitespace-pre-wrap
      break-words
      max-h-60
      overflow-y-auto
      shadow-inner
    "
        >
          {data?.ComplaintDetails || 'কোনো অভিযোগ লেখা নেই'}
        </div>
      </div>
      {/* Complaint Details */}
      {Number(data?.SeeUnSee) === 1 && (
        <div className="mt-5">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
            <span className="text-base">✅</span>
            সমাধানের বিস্তারিত
          </p>

          <div
            className="
      bg-gradient-to-br from-gray-50 to-white
      border border-gray-200
      rounded-xl
      p-4
      text-sm
      leading-relaxed
      text-gray-800
      whitespace-pre-wrap
      break-words
      max-h-60
      overflow-y-auto
      shadow-inner
    "
          >
            {data?.ConfirmMessage || 'কোনো অভিযোগ লেখা নেই'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSingleComplaint;
