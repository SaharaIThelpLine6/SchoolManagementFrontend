import React from 'react'

const DailyFeeCollectionList = () => {
  return (
    <div className="p-6 text-sm text-black font-sans w-[794px] border border-black mx-auto">
      {/* Header */}
      <div className="text-center text-base font-bold border border-black inline-block px-6 py-1 mb-4">
        দৈনিক ফি গ্রহণ তালিকা
      </div>

      {/* Info row */}
      <div className="flex justify-between mb-2">
        <div>
          <span className="font-bold">শিক্ষকঃ</span> <span className="ml-2">________________</span>
        </div>
        <div>
          <span className="font-bold">ছাত্র সংখ্যাঃ</span> <span className="ml-2">______ জন</span>
        </div>
        <div>
          <span className="font-bold">প্রিন্ট তারিখঃ</span> <span className="ml-2">২৯/০৪/২০২৫</span>
        </div>
      </div>

      {/* Table */}
      <div className="border border-black">
        {/* Table Head */}
        <div className="grid grid-cols-7 border-b border-black text-center font-bold">
          <div className="border-r border-black py-1">ক্রম.</div>
          <div className="border-r border-black py-1">রশিদ</div>
          <div className="border-r border-black py-1 col-span-2">শিক্ষার্থীর নাম</div>
          <div className="border-r border-black py-1">তারিখ</div>
          <div className="border-r border-black py-1">নির্ধারিত</div>
          <div className="border-r border-black py-1">কর্তন</div>
          <div className="py-1">পরিশোধ</div>
        </div>

        {/* Table Row (example) */}
        <div className="grid grid-cols-7 text-center h-10">
          <div className="border-t border-r border-black py-1">১</div>
          <div className="border-t border-r border-black py-1">১২৩৪</div>
          <div className="border-t border-r border-black py-1 col-span-2">মোঃ করিম</div>
          <div className="border-t border-r border-black py-1">২৯/০৪/২৫</div>
          <div className="border-t border-r border-black py-1">৩০০</div>
          <div className="border-t border-r border-black py-1">০</div>
          <div className="border-t border-black py-1">৩০০</div>
        </div>
      </div>

      {/* Footer total */}
      <div className="text-right font-bold mt-4 pr-4">
        মোট = <span className="ml-4">________</span>
      </div>
    </div>
  )
}

export default DailyFeeCollectionList
