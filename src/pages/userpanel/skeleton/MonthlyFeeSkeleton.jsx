const MonthlyFeeSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-7 w-32 bg-gray-300 rounded-md" />
      </div>

      <div className="space-y-4">
        {/* Session Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-orange-200 rounded-md" />
            <div className="h-6 bg-gray-300 rounded-md w-24 self-center" />
          </div>
        </div>

        {/* Month Select Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="h-4 w-24 bg-gray-300 rounded mb-3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Fee Table Skeleton */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-blue-200 shadow-md overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-blue-100 p-3 gap-2">
            <div className="col-span-2 h-4 bg-blue-300 rounded" />
            <div className="col-span-7 h-4 bg-blue-300 rounded" />
            <div className="col-span-3 h-4 bg-blue-300 rounded" />
          </div>

          {/* Rows */}
          <div className="divide-y">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="grid grid-cols-12 p-3 gap-2">
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
                <div className="col-span-7 h-4 bg-gray-200 rounded" />
                <div className="col-span-3 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Total Section Skeleton */}
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex justify-between items-center">
            <div className="h-4 w-24 bg-orange-200 rounded" />
            <div className="h-6 w-32 bg-orange-300 rounded" />
          </div>
        </div>

        {/* Pay Button Skeleton */}
        <div className="w-full">
          <div className="h-11 bg-gray-300 rounded-lg" />
        </div>
      </div>

      <div className="h-20" />
    </div>
  );
};

export default MonthlyFeeSkeleton;
