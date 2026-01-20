import { useGetHomeWorkQuery } from '../../features/student/studentQuerySlice';

const HomeWorkView = ({ id }) => {
  const { data: homeWorks = [], isLoading: isHomeWorkLoading } =
    useGetHomeWorkQuery(id, { skip: !id });

  const data = homeWorks ?? {};

  if (isHomeWorkLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!data.HWID) {
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
        <p className="text-gray-600">No homework found</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          Homework for {data.SubClass?.SubClass || 'Unknown Class'}
        </h1>
        <p className="text-sm text-gray-500">
          Subject: {data.Subject?.SubjectName || 'Unknown'} | Session:{' '}
          {data.Session?.SessionName || 'Unknown'}
        </p>
      </div>

      {/* Homework and Classwork */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Homework</div>
          <div className="text-gray-800 leading-relaxed whitespace-pre-line">
            {data.HomeWork || 'No homework provided'}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Classwork</div>
          <div className="text-gray-800 leading-relaxed whitespace-pre-line">
            {data.ClassWork || 'No classwork provided'}
          </div>
        </div>
      </div>

      {/* Teacher Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500 mb-1">Teacher</div>
          <div className="font-medium text-gray-800">
            {data?.User?.UserName || 'Unknown'}
          </div>
          {/* <div className="text-sm text-gray-600">
            Mobile: {data?.User?.Mobile1 || 'N/A'}{' '}
            {data?.User?.Mobile2 && `, ${data.User.Mobile2}`}
          </div>
          <div className="text-sm text-gray-600">
            Email: {data?.User?.Email || 'N/A'}
          </div> */}
        </div>
        <div className="text-sm text-gray-500">
          Created: {new Date(data.CreateAt).toLocaleDateString()}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Active Homework</span>
        </div>
        <div className="text-sm text-gray-500">
          {data.HomeWork?.split(' ').length || 0} words
        </div>
      </div>
    </div>
  );
};

export default HomeWorkView;
