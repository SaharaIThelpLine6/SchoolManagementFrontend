import React from "react";

const PrintTwo = () => {
  return (
    <div className="w-full h-auto mx-auto px-12 py-10 font-[kalpurush] text-[16px] leading-[32px] text-black border border-black">
      {/* Top Section: Serial & Date */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2 items-center">
          <span>ক্রমিক:</span>
          <div className="border border-black w-12 text-center">১</div>
        </div>
        <div>তারিখ: ০৩/০৩/২০২৫</div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <span className="border border-black px-6 py-1 text-[18px] font-bold">
          প্রত্যয়নপত্র
        </span>
      </div>

      {/* Body Content */}
      <div className="space-y-4">
        <p>
          এই মর্মে প্রত্যয়ন করা যাইতেছে যে,
          <span className="inline-block border-b border-black w-64 ml-2">
            সাকিব আল হাসান
          </span>
        </p>

        <div className="grid grid-cols-2 gap-y-2 gap-x-10">
          <p>
            পিতা:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
          <p>
            মাতা:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
          <p>
            গ্রাম:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
          <p>
            ডাক:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
          <p>
            থানা:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
          <p>
            জেলা:
            <span className="inline-block border-b border-black w-60 ml-2"></span>
          </p>
        </div>

        <p>
          তাহার প্রাথমিক শিক্ষাবৃত্তি রোল:
          <span className="inline-block border-b border-black w-28 mx-2 text-center">
            ২০০০৫
          </span>
          এবং জন্ম তারিখ:
          <span className="inline-block border-b border-black w-40 ml-2 text-center">
            ০১/০১/২০১০
          </span>
        </p>

        <p>
          সে অত্র বিদ্যালয়ে
          <span className="inline-block border-b border-black w-28 mx-2 text-center">
            ২০২৩-২৪
          </span>
          ইং শিক্ষাবর্ষে
          <span className="inline-block border-b border-black w-28 mx-2 text-center">
            পঞ্চম
          </span>
          শ্রেণিতে অধ্যয়নরত ছিল।
        </p>

        <p>
          তাহার উপস্থিতির হার
          <span className="inline-block border-b border-black w-20 mx-2 text-center">
            ৮৫%
          </span>
          তার রোল নম্বর
          <span className="inline-block border-b border-black w-12 mx-2 text-center">
            ৫
          </span>
          ।
        </p>

        <p>আমি তাহার উজ্জ্বল ভবিষ্যৎ কামনা করি।</p>

        <p className="mt-4 text-justify">
          অত্র প্রত্যয়নপত্রটি যেকোনো শিক্ষা বোর্ডে ডাটা-চেকের জন্য ব্যবহারযোগ্য। আমাদের
          প্রদত্ত তথ্যাদির ভিত্তিতে প্রয়োজনীয় ব্যবস্থা গ্রহণের জন্য অনুরোধ করা হইল। বিদ্যালয়
          প্রদত্ত তথ্যই চূড়ান্ত ও সর্বশেষ বলিয়া গণ্য করিবেন।
        </p>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-black my-10"></div>

      {/* Footer Signature */}
      <div className="flex justify-between text-center">
        <div className="w-1/3">
          <div className="border-t border-black w-40 mx-auto"></div>
          প্রধান
        </div>
        <div className="w-1/3">
          <div className="border-t border-black w-40 mx-auto"></div>
          সীল
        </div>
        <div className="w-1/3">
          <div className="border-t border-black w-40 mx-auto"></div>
          স্বাক্ষর
        </div>
      </div>
    </div>
  );
};

export default PrintTwo;
