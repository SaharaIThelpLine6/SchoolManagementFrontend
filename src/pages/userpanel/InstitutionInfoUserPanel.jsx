import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetInstitutionInfoUserPanelQuery } from '../../features/userPanel/userInfo/userInfoQuerySlice';

/* 🔹 Skeleton Row */
const SkeletonRow = () => (
  <div className="flex items-center mb-3 animate-pulse">
    <div className="w-5 h-5 bg-gray-300 rounded mr-3" />
    <div className="h-4 bg-gray-300 rounded w-full" />
  </div>
);

const InstitutionInfoUserPanel = () => {
  const { data, isLoading } = useGetInstitutionInfoUserPanelQuery();
  const institution = data?.data?.[0] || {};
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (institution?.Logo?.data) {
      const buffer = Buffer.from(institution.Logo.data);
      const base64 = buffer.toString('base64');
      setLogo(`data:image/png;base64,${base64}`);
    } else {
      setLogo(null);
    }
  }, [institution]);

  /* 🔹 Skeleton UI */
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 animate-pulse">
        {/* Logo Skeleton */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-gray-300 rounded-full" />
        </div>

        <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-6" />

        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 relative">
      {/* Logo at top center */}
      <div className="flex justify-center mb-6">
        <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300 shadow-md mx-auto">
          {/* Placeholder SVG for logo - replace with actual logo if available */}
          {logo ? (
            <img
              src={logo}
              alt="Institution Logo"
              className="w-28 h-28 object-contain rounded-full"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l6.16-3.422A12.083 12.083 0 0112 21.5a12.083 12.083 0 01-6.16-10.922L12 14z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Institution Name */}
      <h2 className="text-2xl font-bold text-center mb-4">
        {institution.InstitutionName || ''}
      </h2>

      {/* Address with location icon */}
      <div className="flex items-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <p className="text-gray-700">{institution.Address || ''}</p>
      </div>

      {/* Contact Number with phone icon */}
      <div className="flex items-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          ></path>
        </svg>
        <p className="text-gray-700">{institution.ContactNumber || ''}</p>
      </div>

      {/* Email with envelope icon */}
      <div className="flex items-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          ></path>
        </svg>
        <p className="text-gray-700">{institution.Email || ''}</p>
      </div>

      {/* Website with globe icon */}
      <div className="flex items-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          ></path>
        </svg>
        {institution.Website ? (
          <Link
            href={institution.Website || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            {institution.Website || ''}
          </Link>
        ) : (
          <>
            <p>-</p>
          </>
        )}
      </div>

      {/* YouTube with video icon */}
      <div className="flex items-center mb-3">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          ></path>
        </svg>
        {institution.YouTube ? (
          <Link
            href={institution.YouTube || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            YouTube
          </Link>
        ) : (
          <>
            <p>-</p>
          </>
        )}
      </div>

      {/* Facebook with link icon (or specific FB icon) */}
      <div className="flex items-center">
        <svg
          className="w-5 h-5 text-gray-600 mr-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101"
          ></path>
        </svg>
        {institution.Facebook ? (
          <Link
            href={institution.Facebook || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            Facebook
          </Link>
        ) : (
          <>
            <p>-</p>
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionInfoUserPanel;
