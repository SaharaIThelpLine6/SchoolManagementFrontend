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
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden p-6 relative h-screen">
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
      {institution.ContactNumber ? (
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
      ) : (
        <></>
      )}
      {/* Email with envelope icon */}
      {institution.Email ? (
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
      ) : (
        <></>
      )}
      {/* Website with globe icon */}
      {institution.Website ? (
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
          <Link
            to={institution.Website || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            {institution.Website || ''}
          </Link>
        </div>
      ) : (
        <></>
      )}

      {/* YouTube with video icon */}
      {institution.Youtube ? (
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
          <Link
            to={institution.Youtube || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            YouTube
          </Link>
        </div>
      ) : (
        <></>
      )}

      {/* Facebook with link icon (or specific FB icon) */}
      {institution.Facebook ? (
        <div className="flex items-center mb-3">
          <svg
            className="w-5 h-5 text-gray-600 mr-3"
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 320 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
          </svg>
          <Link
            to={institution.Facebook || ''}
            className="text-blue-500 hover:underline"
            target="_blank"
          >
            Facebook
          </Link>
        </div>
      ) : (
        <></>
      )}

      {/* WhatsApp with link icon (or specific FB icon) */}
      {institution.WhatsApp && (
        <div className="flex items-center mb-3">
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            className="w-5 h-5 text-gray-600 mr-3"
            viewBox="0 0 448 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
          </svg>

          <a
            href={`https://wa.me/${institution.WhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:underline"
          >
            {institution.WhatsApp}
          </a>
        </div>
      )}
      {/* Telegram with link icon (or specific Telegram icon) */}
      {institution.Telegram ? (
        <div className="flex items-center mb-3">
          <svg
            stroke="currentColor"
            fill="currentColor"
            className="w-5 h-5 text-gray-600 mr-3"
            stroke-width="0"
            viewBox="0 0 496 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm121.8 169.9l-40.7 191.8c-3 13.6-11.1 16.9-22.4 10.5l-62-45.7-29.9 28.8c-3.3 3.3-6.1 6.1-12.5 6.1l4.4-63.1 114.9-103.8c5-4.4-1.1-6.9-7.7-2.5l-142 89.4-61.2-19.1c-13.3-4.2-13.6-13.3 2.8-19.7l239.1-92.2c11.1-4 20.8 2.7 17.2 19.5z"></path>
          </svg>
          {institution.Telegram && (
            <a
              href={
                institution.Telegram.startsWith('+')
                  ? `https://t.me/${institution.Telegram}`
                  : institution.Telegram.match(/^\d+$/)
                    ? `https://t.me/+${institution.Telegram}`
                    : `https://t.me/${institution.Telegram.replace('@', '')}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {institution.Telegram}
            </a>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InstitutionInfoUserPanel;
