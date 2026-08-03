
const PageNotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <svg
          viewBox="0 0 800 500"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-72 w-full max-w-md"
        >
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          <circle cx="400" cy="250" r="180" fill="#EEF2FF" />

          <text
            x="400"
            y="230"
            textAnchor="middle"
            fontSize="120"
            fontWeight="bold"
            fill="url(#grad)"
          >
            404
          </text>

          <circle cx="340" cy="290" r="10" fill="#4B5563" />
          <circle cx="460" cy="290" r="10" fill="#4B5563" />

          <path
            d="M350 345 Q400 310 450 345"
            stroke="#4B5563"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          <path
            d="M230 120 L260 90"
            stroke="#C7D2FE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M570 120 L540 90"
            stroke="#C7D2FE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M190 250 L150 250"
            stroke="#C7D2FE"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M650 250 L610 250"
            stroke="#C7D2FE"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        <h1 className="mt-6 text-3xl font-bold text-gray-800">
          Oops! Page Not Found
        </h1>

        <p className="mt-2 text-gray-500">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
};

export default PageNotFound;