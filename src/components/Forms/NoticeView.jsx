import { useGetUserNoticeForUserPanelQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';
import useTranslate from '../../utils/Translate';

const NoticeView = ({ id }) => {
  const translate = useTranslate()
  const { data: notices = [], isLoading } = useGetUserNoticeForUserPanelQuery(id, { skip: !id });

  // Use first notice if array has elements
  const notice = notices?.data;

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="p-8 text-center">
        <svg
          className="w-12 h-12 text-gray-400 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600">Notice not found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="text-sm text-gray-500">
          {translate("Created At")}: {new Date(notice.CreatedAt).toLocaleDateString('en-GB')}
        </div>
      </div>

      {/* Notice Message */}
      <div className="text-sm text-gray-500 mb-1 font-bold">{translate("Notice")}:</div>
      <div className="bg-white border border-gray-200 rounded-lg p-4 pt-0 max-h-64 overflow-y-auto break-words">
        <div className="text-gray-800 leading-relaxed whitespace-pre-line break-words">
          {notice.NoticeMessage || 'No notice message provided.'}
        </div>
      </div>
    </div>
  );
};

export default NoticeView;