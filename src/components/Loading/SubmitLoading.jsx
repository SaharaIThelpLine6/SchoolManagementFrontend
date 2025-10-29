
const SubmitLoading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-100/70 backdrop-blur-sm z-50">
      <svg
        className="w-10 h-10 animate-spin text-blue-600 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
        role="status"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        ></path>
      </svg>
      <p className="text-sm text-gray-700 font-medium">লোড হচ্ছে...</p>
    </div>
  );
}

export default SubmitLoading
