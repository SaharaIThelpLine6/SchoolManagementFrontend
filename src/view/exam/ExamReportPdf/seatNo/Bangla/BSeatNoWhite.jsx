
const BSeatNoWhite = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Card */}
      <div className="w-[360px] border-2 border-black bg-white p-4">

        {/* Top Empty Header */}
        <div className="h-12 border-b border-dashed border-black mb-6"></div>

        {/* Center Content */}
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">পরীক্ষার্থী :</p>

          {/* Name / Roll Field */}
          <div className="border border-black rounded-lg h-10 flex items-center justify-center">
            <span className="text-sm text-gray-700">:</span>
          </div>

          {/* Seat / Roll No Field */}
          <div className="border border-black rounded-lg h-10 flex items-center justify-center">
            <span className="text-sm text-gray-700">|</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BSeatNoWhite;
