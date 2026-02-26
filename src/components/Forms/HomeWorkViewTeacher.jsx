import { useGetHomeWorkQuery } from '../../features/student/studentQuerySlice';

const HomeWorkViewTeacher = ({ id }) => {
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
      {/* Teacher Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        {/* Left Info */}
        <div className="space-y-2">
          {/* Teacher Name */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <div>
              <div className="font-semibold text-gray-800">
                {data?.User?.UserName || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Mobile */}
          {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"
              />
            </svg>
            <span>
              {data.Teacher?.User?.Mobile1 || 'N/A'}
              {data.Teacher?.User?.Mobile2 && `, ${data.Teacher.User.Mobile2}`}
            </span>
          </div> */}

          {/* Email */}
          {/* <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              className="w-4 h-4 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>

            <span>{data?.User?.Email || 'N/A'}</span>
          </div> */}
        </div>

        {/* Right Date */}
        {/* <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>
            {data?.CreateAt
              ? new Date(data.CreateAt).toLocaleDateString()
              : '—'}
          </span>
        </div> */}
      </div>
    </div>
  );
};

export default HomeWorkViewTeacher;
