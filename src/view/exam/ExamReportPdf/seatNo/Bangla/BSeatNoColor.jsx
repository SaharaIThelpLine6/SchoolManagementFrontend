
const BSeatNoColor = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Card */}
      <div className="w-[360px] rounded-xl overflow-hidden shadow-lg border border-gray-300 bg-white">
        {/* Colored Header */}
        <div className="h-14 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Dashed Divider */}
          <div className="border-t border-dashed border-gray-400"></div>

          {/* Title */}
          <p className="text-center text-lg font-semibold text-gray-800">
            পরীক্ষার্থী :
          </p>

          {/* Name Field */}
          <div className="border-2 border-blue-500 rounded-lg h-11 flex items-center justify-center bg-blue-50">
            <span className="text-sm text-gray-700">:</span>
          </div>

          {/* Seat / Roll No Field */}
          <div className="border-2 border-indigo-500 rounded-lg h-11 flex items-center justify-center bg-indigo-50">
            <span className="text-sm text-gray-700">|</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BSeatNoColor;
