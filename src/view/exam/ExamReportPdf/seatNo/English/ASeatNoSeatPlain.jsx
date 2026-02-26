
const ASeatNoSeatPlain = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {/* Outer Card */}
      <div className="w-[420px] border-2 border-black bg-white p-3">
        {/* Top Empty Header */}
        <div className="h-14 border-b-2 border-black flex items-center justify-center">
          <span className="text-sm">-</span>
        </div>

        {/* Body */}
        <div className="flex mt-2">
          {/* Left Section */}
          <div className="flex-1 px-3 space-y-2">
            <div className="flex justify-end gap-2 text-sm">
              <span>اسم الطالب :</span>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <span>اسم الوالد :</span>
            </div>

            {/* Registration Number Box */}
            <div className="mt-4 border-2 border-black rounded-xl h-14 flex items-center justify-center">
              <span className="text-lg font-semibold">رقم الإلتحاق</span>
            </div>
          </div>

          {/* Right Section (Table-like) */}
          <div className="w-[140px] border-l-2 border-black text-sm">
            <div className="grid grid-cols-2 border-b border-black">
              <div className="border-r border-black p-1"></div>
              <div className="p-1 text-right">رقم الترتيب</div>
            </div>
            <div className="grid grid-cols-2 border-b border-black">
              <div className="border-r border-black p-1"></div>
              <div className="p-1 text-right">رقم المقعد</div>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r border-black p-1"></div>
              <div className="p-1 text-right">رقم الطاولة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASeatNoSeatPlain;
