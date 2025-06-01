import React from "react";
import PdfHeader from "./PdfHeader";

const AdmissionFormPdf = () => {

  return (
    <div
      className="w-full"
      style={{
        width: "210mm",
        height: "250mm", // Fixed height for one page
        margin: "0 auto",
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        fontSize: "12px", // Reduced font size
        lineHeight: "1.4", // Tighter line height
        padding: "5mm", // Reduced padding
      }}
    >
      <div className="bg-white text-black">
        {/* Header */}
        <PdfHeader compact={true} />

        {/* Top Info - Made more compact */}
        <div className="grid grid-cols-5 items-stretch mb-2">
          {/* Left Box - Past Data */}
          <div className="col-span-2 border border-black p-2 flex flex-col">
            <div className="w-full flex justify-center mb-1">
              <h2 className="border border-black px-1 text-xs">বিগত তথ্য</h2>
            </div>
            <div className="flex-grow">
              <p className="text-2xs mb-0">জামায়াত : </p>
              <p className="text-2xs mb-0">শিক্ষাবর্ষ : </p>
              <p className="text-2xs">আইডি : </p>
            </div>
          </div>

          {/* Middle Title */}
          <div className="col-span-1 flex justify-center items-center">
            <h2 className="text-sm font-semibold border-b border-black px-2">
              ভর্তি ফরম
            </h2>
          </div>

          {/* Right Box - Current Data */}
          <div className="col-span-2 border border-black p-2 flex flex-col">
            <div className="w-full flex justify-center mb-1">
              <h2 className="border border-black px-1 text-xs">বর্তমান তথ্য</h2>
            </div>
            <div className="flex-grow">
              <p className="text-2xs mb-0">জামায়াত : </p>
              <p className="text-2xs mb-0">
                শিক্ষাবর্ষ : 
              </p>
              <p className="text-2xs">আইডি :</p>
              <div className="flex flex-row gap-1 mt-1 text-2xs">
                <div className="flex gap-1 items-center">
                  <span>আবাসিক:</span>
                  <input type="checkbox" className="h-2 w-2" />
                </div>
                <div className="flex gap-1 items-center">
                  <span>অনাবাসিক</span>
                  <input type="checkbox" className="h-2 w-2" />
                </div>
                <div className="flex gap-1 items-center">
                  <span>ডে কেয়ার</span>
                  <input type="checkbox" className="h-2 w-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pledge Section - Made more compact */}
        <div className="mb-2">
          <p className="text-2xs leading-4 text-justify">
            মুহাতারাম,
            <br />
            <p className="ml-10">আসসালামু আলাইকুম,</p>
            <p className="ml-30"> হযরত মুহাতামিম সাহেব (দা. বা.),</p>
            ওয়ারাহমাতুল্লাহ আমি নিজের নামে, আমার পিতা ও মাতা এবং আমার
            পূর্বপুরুষদের নামে গ্রহণকৃত সকল ধরনের কঠিন শপথ ও প্রতিজ্ঞা সত্ত্বেও
            আমি এই প্রতিশ্রুতি গ্রহণ করছি যে, আমি জীবনের শেষ দিন পর্যন্ত জামাতে
            থাকব এবং জামাতের নির্দেশনা মেনে চলব।
          </p>
        </div>

        {/* Student Details - Made more compact */}
        <div className="text-start">
          <h2>আমার বিস্তারিত নিম্নে প্রদান করা হলো-</h2>
        </div>
        <div className="flex gap-2 mb-2">
          {/* Left Box */}
          <div className="w-1/2 border border-black p-2 h-40">
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-20">নাম</p>
              <p className="text-2xs">: </p>
            </div>
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-20">পিতার নাম</p>
              <p className="text-2xs">: </p>
            </div>
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-20">মাতার নাম</p>
              <p className="text-2xs">: </p>
            </div>
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-20">জন্ম তারিখ</p>
              <p className="text-2xs">: </p>
            </div>
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-24">NID/জন্ম নিবন্ধন নং</p>
              <p className="text-2xs">: </p>
            </div>
            <div className="mb-0 flex">
              <p className="text-xs font-bold w-26">অভিভাবকের মোবাইল</p>
              <p className="text-2xs">: </p>
            </div>
          </div>

          {/* Right Box */}
          <div className="w-1/2 border border-black p-2 h-40">
            <div className="text-center border-b border-black text-xs mb-1">
              <h2 className="font-bold">স্থায়ী ঠিকানা</h2>
            </div>
            <div className="grid grid-cols-2 text-2xs">
              <p className="font-bold">গ্রাম/মহল্লা: </p>
              <p className="font-bold">থানা: </p>
              <p className="font-bold">ডাক: </p>
              <p className="font-bold">জেলা: </p>
            </div>
            <div className="text-center border-b border-black text-xs mb-1 mt-1">
              <h2 className="font-bold">অস্থায়ী ঠিকানা</h2>
            </div>
            <div className="grid grid-cols-2 text-2xs">
              <p className="font-bold">গ্রাম/মহল্লা: </p>
              <p className="font-bold">থানা: </p>
              <p className="font-bold">ডাক: </p>
              <p className="font-bold">জেলা: </p>
            </div>
          </div>
        </div>

        {/* Guardian Info */}
        <div className="flex justify-between mb-2 text-2xs">
          <div>
            <span>অভিভাবকের নাম: ________________</span>
          </div>
          <div>
            <span>সম্পর্ক: ________________</span>
          </div>
          <div>
            <span>স্বাক্ষর: ________________</span>
          </div>
        </div>

        {/* Office Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-1/2">
            <div className="text-center border border-black p-1 text-xs">
              <h2 className="font-bold">অফিসের অংশ</h2>
            </div>
          </div>
          <div className="w-1/2 text-right">
            <p className="text-2xs">__________________________</p>
            <p className="text-2xs text-center">আবেদনকারীর স্বাক্ষর</p>
          </div>
        </div>

        {/* Talimi Murubbi Info */}
        <div className="flex justify-between mb-2 text-2xs">
          <div>
            <span>তালিমি মুরুব্বির নাম: ________________________</span>
          </div>
          <div>
            <span>সম্পর্ক: ________________________</span>
          </div>
          <div>
            <span>স্বাক্ষর: ________________________</span>
          </div>
        </div>

        {/* Teacher Comments */}
        <div className="mb-1 text-2xs">
          <p>দারুল ইকামা শ্রেণী শিক্ষকের মতামত:</p>
          <div className="flex justify-between mt-1">
            <span>নিরক্ষরের মন্তব্য: ________________________</span>
            <span>স্বাক্ষর ও তারিখ: ________________________</span>
          </div>
        </div>

        {/* Results Section */}
        <div className="text-center border border-black p-0.5 text-xs mb-1">
          <h2 className="font-bold">ফলাফল</h2>
        </div>
        <div className="grid grid-cols-5 gap-1 text-2xs mb-1">
          <span className="font-bold">বিগত তালিমাতের মন্তব্য:</span>
          <span className="border border-black text-center">মোট:</span>
          <span className="border border-black text-center">গড়:</span>
          <span className="border border-black text-center">বিভাগ:</span>
          <span className="border border-black text-center">স্থান:</span>
        </div>

        {/* Nazim Comments */}
        <div className="mb-1 text-2xs">
          <h2 className="font-bold">নাযিমরে তালিমাতের মন্তব্য:</h2>
          <p className="text-justify">
            আমি আবেদনকারীকে _________________________________________________
            জামা'আতে ভর্তি উপযুক্ত মনে করতেছি/করছি না। তাহাকে ________________
            জামা'আতে ভর্তি হওয়ার পরামর্শ দিতেছি।
          </p>
        </div>

        {/* Financial Status */}
        <div className="grid grid-cols-6 gap-1 mb-1 text-2xs">
          <div className="col-span-1">
            <h2 className="font-bold">আর্থিক অবস্থা:</h2>
          </div>
          <div className="col-span-3">
            <div className="grid grid-cols-4 gap-1">
              <label className="flex items-center">
                <input type="checkbox" className="h-2 w-2 mr-1" /> সচ্ছল
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-2 w-2 mr-1" /> এতিম
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-2 w-2 mr-1" /> গরিব
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="h-2 w-2 mr-1" /> অসহায়
              </label>
            </div>
          </div>
          <div className="col-span-2 text-right">
            <p>নাযিমের আলী'মাতের স্বাক্ষর/সীল</p>
            <p>________________________</p>
            <p>স্বাক্ষর</p>
            <p>________________________</p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="text-center border border-black p-0.5 text-xs mb-1">
          <h2 className="font-bold">প্রদেয় টাকার পরিমান</h2>
        </div>
        <div className="grid grid-cols-4 gap-1 text-2xs mb-1">
          <span className="border border-black text-center">ভর্তি ফ্রি:</span>
          <span className="border border-black text-center">মাসিক বেতন:</span>
          <span className="border border-black text-center">আবাসিক ফি:</span>
          <span className="border border-black text-center">অন্যান্য ফি:</span>
        </div>

        {/* Approval Section */}
        <div className="mb-1 text-2xs">
          <h2 className="font-bold">মুহতামীমির মঞ্জুরি:</h2>
          <p className="text-justify">
            আবেদনকারীর ______________________________________________________
            জামা'আতে ভর্তির আবেদন মঞ্জুরি করা হলো
          </p>
        </div>

        {/* Final Signature */}
        <div className="text-right text-2xs">
          <p>মুহতামীমির জামিয়ার স্বাক্ষর/সীল</p>
          <p>_______________________________________</p>
          <div className="flex justify-end">
            <span className="mr-2">তারিখ</span>
            <span>________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormPdf;
