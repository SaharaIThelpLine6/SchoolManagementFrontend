import { useGetExamRuleQuery } from '../../features/exam/examQuerySlice';

const ExamRuleView = ({ id }) => {
  const { data: examRules = [], isLoading: isExamRuleLoading } =
    useGetExamRuleQuery(id, {
      skip: !id,
    });

  const data = examRules ?? {};

  if (isExamRuleLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!data.ERID) {
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-gray-600">No exam rule found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
              clipRule="evenodd"
            />
          </svg>
          <h1 className="text-xl font-bold text-gray-800">
            Exam Rule #{data.ERID}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          View and manage examination rules
        </div>
      </div>

      {/* Rule Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="text-sm text-gray-500 mb-2">Rule Description</div>
        <div className="text-gray-800 leading-relaxed whitespace-pre-line">
          {data.ExamRule || 'No description provided'}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Created</div>
          <div className="font-medium">
            {new Date(data.CreateAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            by User #{data.CreateUserID}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Updated</div>
          <div className="font-medium">
            {new Date(data.UpdateAt).toLocaleDateString()}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            by User #{data.UpdateUserID}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Active Rule</span>
        </div>
        <div className="text-sm text-gray-500">
          {data.ExamRule?.split(' ').length || 0} words
        </div>
      </div>
    </div>
  );
};

export default ExamRuleView;
