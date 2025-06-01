import React from "react";
import PdfHeader from "./PdfHeader";
const AdmissionFormPdf = () => {
  // Sample past data
  const pastData = {
    date: "১৫/০৫/২০২৫",
    student: "রহিমুল ইসলাম",
    signature: "রহিমুল স্বাক্ষর",
    serialNo: "০০১",
    feeSlipNo: "০০১২৩",
    name: "রহিমুল ইসলাম",
    father: "মোঃ আলী আকবর",
    mother: "মোছাঃ জাহানারা",
    nid: "১৯৮৫২৩৫২০২৭",
    id: "০৫৮৩৫২০২০২৭",
    village: "মিরপুর - ১",
    thana: "মিরপুর",
    district: "ঢাকা",
    previousAddress: "গাজীপুর",
    mobile: "০১৭২২২২২২২২",
  };

  // Current data (with today's date)
  const currentDate = new Date()
    .toLocaleString("bn-BD", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Dhaka",
    })
    .replace(" PM", " রাত্রি")
    .replace(" AM", " সকাল");

  const currentData = {
    date: currentDate,
    student: "করিমুল ইসলাম",
    signature: "করিমুল স্বাক্ষর",
    serialNo: "০০২",
    feeSlipNo: "০০১২৪",
    name: "করিমুল ইসলাম",
    father: "মোঃ আব্দুল খালেক",
    mother: "মোছাঃ রুবিনা খাতুন",
    nid: "১৯৮৫২৩৫২০২৮",
    id: "০৫৮৩৫২০২০২৮",
    village: "উত্তরা - ১",
    thana: "উত্তরা",
    district: "ঢাকা",
    previousAddress: "নারায়ণগঞ্জ",
    mobile: "০১৭১১১১১১১১",
  };

  return (
    <div className="w-full">
      <div className="p-6 bg-white text-black print:text-sm print:p-0 font-sans">
        {/* Header */}
        <PdfHeader />

        {/* Top Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3 border border-black p-5 pt-0">
            <div className="w-full flex justify-center mb-2 items-center">
              <h2 className="border border-black p-1">বিগত তথ্য</h2>
            </div>
            <p className="text-xs mb-1">জামায়াত : {pastData.date}</p>
            <p className="text-xs mb-1">শিক্ষাবর্ষ : {pastData.student}</p>
            <p className="text-xs">আইডি : {pastData.signature}</p>
          </div>
          <div className="text-center flex-1 flex justify-center items-center">
            <h2 className="text-lg font-semibold mb-2 border-b-2 border-black text-center">
              ভর্তি ফরম
            </h2>
          </div>
          <div className="w-1/3 border border-black p-5 pt-0">
            <div className="w-full flex justify-center mb-2 items-center">
              <h2 className="border border-black p-1">বর্তমান তথ্য</h2>
            </div>
            <p className="text-xs mb-1">জামায়াত : {pastData.date}</p>
            <p className="text-xs mb-1">শিক্ষাবর্ষ : {pastData.student}</p>
            <p className="text-xs">আইডি : {pastData.signature}</p>
            <div className="flex flex-row gap-2">
              <div className="flex gap-2">
                <p>আবাসিক:</p> <input type="checkbox" name="" id="" />
              </div>
              <div className="flex gap-2">
                <p>অনাবাসিক</p> <input type="checkbox" name="" id="" />
              </div>
              <div className="flex gap-2">
                <p>ডে কেয়ার</p> <input type="checkbox" name="" id="" />
              </div>
            </div>
          </div>
        </div>

        {/* Pledge Section */}
        <div className="mb-4 w-full space-y-2">
          <p className="text-sm">মুহাতারাম,</p>
          <p className="text-sm md:ml-20">হযরত মুহাতামিম সাহেব (দা. বা.),</p>
          <p className="text-sm md:ml-64">আসসালামু আলাইকুম ওয়ারাহমাতুল্লাহ</p>
          <p className="text-xs leading-6 text-justify">
            আমি নিজের নামে, আমার পিতা ও মাতা এবং আমার পূর্বপুরুষদের নামে
            গ্রহণকৃত সকল ধরনের কঠিন শপথ ও প্রতিজ্ঞা সত্ত্বেও আমি এই প্রতিশ্রুতি
            গ্রহণ করছি যে, আমি জীবনের শেষ দিন পর্যন্ত জামাতে থাকব এবং জামাতের
            নির্দেশনা মেনে চলব।
          </p>
        </div>

        <div className="w-full overflow-x-auto">
          <h2>আমার বিস্তারিত তথ্য নির্ণয় প্রদান করা হলো-</h2>
          <div className="min-w-[768px] flex items-start justify-between gap-4 mb-4">
            {/* Left Box */}
            <div className="w-full lg:w-1/2">
              <div className="border border-black p-4">
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[120px]">নাম</p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[120px]">পিতার নাম</p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[120px]">মাতার নাম</p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[120px]">জন্ম তারিখ</p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[120px]">
                    জন্ম নিবন্ধন সনদ
                  </p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
                <div className="mb-1 flex">
                  <p className="text-md font-bold mb-1 w-[150px]">
                    অভিভাবকের মোবাইল
                  </p>
                  <p className="text-xs">:{pastData.date}</p>
                </div>
              </div>
            </div>

            {/* Right Box */}
            <div className="w-full lg:w-1/2">
              <div className="border border-black p-4">
                <div className="flex justify-center my-5 mt-0 border-black border-b">
                  <h2 className="">স্থায়ী ঠিকানা</h2>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-xs mb-1">
                    গ্রাম/মহল্লা : {currentData.date}
                  </p>
                  <p className="text-xs mb-1">থানা : {currentData.student}</p>
                  <p className="text-xs">ডাক : {currentData.signature}</p>
                  <p className="text-xs">জেলা : {currentData.signature}</p>
                </div>
                <div className="flex justify-center my-4 border-black border-b">
                  <h2 className="">অস্থায়ী ঠিকানা</h2>
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-xs mb-1">
                    গ্রাম/মহল্লা : {currentData.date}
                  </p>
                  <p className="text-xs mb-1">থানা : {currentData.student}</p>
                  <p className="text-xs">ডাক : {currentData.signature}</p>
                  <p className="text-xs">জেলা : {currentData.signature}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white text-black print:text-sm print:p-0 font-sans">
          {/* Form Header Fields */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3">
              <p className="text-xs mb-1">অভিভাবকের নাম : ________________</p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-xs mb-1">সম্পর্ক : ________________</p>
            </div>
            <div className="w-1/3 text-right">
              <p className="text-xs mb-1">স্বাক্ষর : ________________</p>
            </div>
          </div>
        </div>

        <div className="flex  justify-between  mt-4">
          <div className=""></div>
          <div className="p-2 ml-40">
            <h2 className="text-sm font-semibold py-2 px-10 border-2 border-black">
              অফিসের অংশ
            </h2>
          </div>

          <div className="p-2">
            <p>__________________________</p>
            <h3 className="text-sm font-semibold text-center">
              আবেদনকারীর স্বাক্ষর
            </h3>
          </div>
        </div>

        <div className="bg-white text-black print:text-sm print:p-0 font-sans">
          {/* Form Header Fields */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3">
              <p className="text-xs mb-1">
                তালিমি মুরুব্বির নাম : __________________________________
              </p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-xs mb-1">
                সম্পর্ক : __________________________________
              </p>
            </div>
            <div className="w-1/3 text-right">
              <p className="text-xs mb-1">
                স্বাক্ষর : __________________________________
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-start items-start mb-4">
          <div className="w-1/3 text-left">
            <p className="text-xs mb-1">দারুল ইকামা শ্রেণী শিক্ষকের মতামত :</p>
          </div>
        </div>
        <div className="bg-white text-black print:text-sm print:p-0 font-sans">
          {/* Form Header Fields */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-1/3">
              <p className="text-xs mb-1">
                নিরক্ষরের মন্তব্য
                :......................................................
              </p>
            </div>
            <div className="w-1/3 text-center">
              <p className="text-xs mb-1">
                স্বাক্ষর ও তারিখ :.................................
              </p>
            </div>
          </div>
        </div>

        <div className="flex  justify-center mt-4">
          <div className=""></div>
          <div className="p-2">
            <h2 className="text-sm font-semibold py-2 px-10 border-2 border-black">
              ফলাফল
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-5 text-start">
          <h2 className="mt-1">বিগত তালিমাতের মন্তব্য :</h2>
          <p className="border p-1 border-black">মোট:</p>
          <p className="border p-1 border-black">গড়:</p>
          <p className="border p-1 border-black">বিভাগ:</p>
          <p className="border p-1 border-black">স্থান:</p>
        </div>
        <div className="flex flex-col text-start my-5">
          <h2 className="mt-1">নাযিমরে তালিমাতের মন্তব্য :</h2>
          <p className="">
            আমি
            আবেদনকারীকে.....................................................................................................................................................................................জামা’আতে
            ভর্তি উপযুক্ত মনে করতেছি/করছি না।
            তাহাকে............................................................জামা’আতে
            ভর্তি হওয়ার পরামর্শ দিতেছি।{" "}
          </p>
        </div>
        <div className="grid grid-cols-6 gap-4 w-full items-start p-4">
          {/* অর্থনৈতিক অবস্থা টেক্সট */}
          <div className="col-span-1 mt-1">
            <h2 className="text-sm font-semibold">আর্থিক অবস্থা :</h2>
          </div>

          {/* চেকবক্স গুলো */}
          <div className="col-span-3 mt-10">
            <div className="grid grid-cols-4 gap-2">
              <label className="text-sm flex items-center gap-1">
                <input type="checkbox" /> সচ্ছল
              </label>
              <label className="text-sm flex items-center gap-1">
                <input type="checkbox" /> এতিম
              </label>
              <label className="text-sm flex items-center gap-1">
                <input type="checkbox" /> গরিব
              </label>
              <label className="text-sm flex items-center gap-1">
                <input type="checkbox" /> অসহায়
              </label>
            </div>
          </div>

          {/* তারিখ ও স্বাক্ষর */}
          <div className="col-span-2 ml-20 space-y-4 text-sm">
            <div>
              <h2 className="font-semibold">নাযিমের আলী’মাতের স্বাক্ষর/সীল</h2>
              <p>______________________________</p>
            </div>
            <div>
              <h2 className="font-semibold">স্বাক্ষর</h2>
              <p>______________________________</p>
            </div>
          </div>
        </div>
        <div className="flex  justify-center mt-4">
          <div className=""></div>
          <div className="p-2">
            <h2 className="text-sm font-semibold py-2 px-10 border-2 border-black">
              প্রদেয় টাকার পরিমান
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-4 text-start">
          <p className="border p-1 border-black">ভর্তি ফ্রি:</p>
          <p className="border p-1 border-black">মাসিক বেতন:</p>
          <p className="border p-1 border-black">আবাসিক ফি:</p>
          <p className="border p-1 border-black">অন্যান্য ফি:</p>
        </div>
        <div className="flex flex-col text-start my-5">
          <h2 className="mt-1">মুহতামীমির মঞ্জুরি :</h2>
          <p className="">
            আবেদনকারীর.....................................................................................................................................জামা’আতে
            ভর্তির আবেদন মঞ্জুরি করা হলো
          </p>
        </div>
        {/* তারিখ ও স্বাক্ষর */}
        <div className="flex justify-end items-end flex-col text-sm">
          <div>
            <h2 className="font-semibold">মুহতামীমির জামিয়ার স্বাক্ষর/সীল</h2>
            <p>_______________________________________</p>
          </div>
          <div className="flex flex-row py-3">
            <h2 className="font-semibold">তারিখ</h2>
            <p>__________________________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormPdf;
