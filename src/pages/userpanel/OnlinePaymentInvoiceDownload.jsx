import React from 'react';

const OnlinePaymentInvoiceDownload = () => {
  const handleDownload = () => {
    // PDF ডাউনলোড সিমুলেট করবে
    alert('চালান PDF ডাউনলোড হচ্ছে...');
  };

  const handleShare = () => {
    // শেয়ার ফাংশনালিটি সিমুলেট করবে
    alert('চালান শেয়ার করার অপশন');
  };

  const handlePrint = () => {
    // প্রিন্ট ফাংশনালিটি সিমুলেট করবে
    alert('চালান প্রিন্ট করার জন্য প্রস্তুত');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* হেডার */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            নেক্স অনলাইন পেমেন্ট
          </h1>
          <p className="text-gray-600">নিরাপদ ও দ্রুত পেমেন্ট সলিউশন</p>
        </div>

        {/* চালান কার্ড */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* চালান হেডার */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-1">চালান বিবরণ</h2>
                <p className="text-blue-100">আপনার পেমেন্ট কনফার্মেশন</p>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-100">চালান নম্বর</p>
                  <p className="font-mono font-bold">IFA-ML39IYXU-R270</p>
                </div>
              </div>
            </div>
          </div>

          {/* চালান কন্টেন্ট */}
          <div className="p-6 md:p-8">
            {/* চালান ডিটেইলস গ্রিড */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      কর্ম বিবরণ
                    </h3>
                  </div>
                  <div className="ml-13 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">কার্য</p>
                      <p className="font-medium text-gray-800">
                        নাজওয়া ইউক্রেন ভিসা (WAH-4)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">আবেদনকারী</p>
                      <p className="font-medium text-gray-800">সালমান</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">মোবাইল নম্বর</p>
                      <p className="font-medium text-gray-800">01609496694</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      তারিখ ও সময়
                    </h3>
                  </div>
                  <div className="ml-13">
                    <p className="font-medium text-gray-800">
                      ১০ কার্তিক, ১৪৩২ | সকাল ১০:৫০
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mr-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      পেমেন্ট বিবরণ
                    </h3>
                  </div>
                  <div className="ml-13">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">মোট পরিশোধিত</p>
                      <div className="flex items-center mt-1">
                        <span className="text-3xl font-bold text-gray-900">
                          ₹৮০০
                        </span>
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          সম্পূর্ণ পরিশোধ
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500">পেমেন্ট স্ট্যাটাস</p>
                      <div className="flex items-center mt-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <p className="font-medium text-gray-800">
                          সফলভাবে সম্পন্ন
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* অ্যাকশন বাটন */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    চালান অ্যাকশন
                  </h3>
                  <p className="text-gray-600 text-sm">
                    আপনার চালান ডাউনলোড, শেয়ার বা প্রিন্ট করুন
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-700 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="font-medium">শেয়ার করুন</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center px-5 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-700 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <span className="font-medium">প্রিন্ট করুন</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="font-bold">PDF চালান ডাউনলোড</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* অতিরিক্ত তথ্য */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 md:mb-0 md:mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">
                চালান সম্পর্কিত গুরুত্বপূর্ণ তথ্য
              </h4>
              <p className="text-gray-600 text-sm">
                এই চালানটি আপনার পেমেন্টের অফিসিয়াল রসিদ। এটিকে নিরাপদে রাখুন
                এবং ভবিষ্যত রেফারেন্সের জন্য ডাউনলোড করে নিন। কোনো প্রশ্ন বা
                সহায়তার জন্য, অনুগ্রহ করে আমাদের কাস্টমার সাপোর্টে যোগাযোগ করুন।
              </p>
            </div>
          </div>
        </div>

        {/* চালান স্ট্যাটাস বার */}
        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-700">চালান স্ট্যাটাস:</span>
              <span className="ml-2 font-medium text-green-600">
                পেমেন্ট সম্পূর্ণ
              </span>
            </div>
            <div className="text-sm text-gray-500">
              <span>আপডেট:</span>
              <span className="ml-1">আজ, সকাল ১১:৩০</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlinePaymentInvoiceDownload;
