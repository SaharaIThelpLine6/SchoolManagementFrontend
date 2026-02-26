import { useGetSubClassListQuery } from '../../../features/class/classQuerySlice';
import { useGetInstitutionInfoQuery } from '../../../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../../../utils/conveter';
import { formatToDDMMYYYY } from '../../../utils/dateFormat';
import PdfHeader from '../../general-information/user-reports/PdfHeader';

const AdmissionFormA4 = ({ data }) => {
  const { data: subClassListData } = useGetSubClassListQuery();
  const {
    data: institutionInfo,
    error: institutionInfoError,
    isLoading: institutionInfoLoading,
  } = useGetInstitutionInfoQuery();


  return (
    <div
      className="admission-a5-portrait-page"
      style={{
        width: '210mm', // ✅ A5 portrait width
        // height: '225mm', // 🔥 extended height (safe)
        margin: '0 auto',
        padding: '6mm',
        boxSizing: 'border-box',
        fontFamily: "'SolaimanLipi', 'Bangla', sans-serif",
        fontSize: '11px',
        lineHeight: '1.35',
        pageBreakAfter: 'always',
        breakAfter: 'page',
      }}
    >
      <div className="bg-white text-black">
        {/* Header */}
        <PdfHeader compact={true} admissionFormImage={data.Image} />

        {/* Top Info - Made more compact */}
        <div className="grid grid-cols-5 items-stretch mb-2">
          {/* Left Box - Past Data */}
          <div className="col-span-2 border border-black p-2 flex flex-col">
            <div className="w-full flex justify-center mb-1">
              <h2 className="border border-black px-1 text-xs">বিগত তথ্য</h2>
            </div>
            <div className="flex-grow">
              <p className="text-2xs mb-0">জামায়াত :{data?.ClassName ?? ''}</p>
              <p className="text-2xs mb-0">
                শিক্ষাবর্ষ : {data?.SessionName ?? ''}
              </p>
              <p className="text-2xs">
                {data?.StudentIDLabel ?? 'আইডি নং'} : {data?.UserCode ?? ''}{' '}
              </p>
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
              <p className="text-2xs mb-0">শিক্ষাবর্ষ :</p>
              <p className="text-2xs">আইডি নং : </p>
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
        <div className="grid grid-cols-2 mb-1 text-2xs gap-4">
          <div className="flex justify-between items-center mb-4 gap-2">
            {/* gap কমিয়ে দিন */}
            <div className="flex items-center flex-1">
              {/* flex-1 ব্যবহার করুন */}
              <h2 className="font-normal text-gray-700 whitespace-nowrap mr-2">
                ফরম নং:
              </h2>
              <div className="w-full p-3 border border-gray-300"></div>
            </div>
            <div className="flex items-center flex-1 ml-2">
              {/* flex-1 এবং ml-2 */}
              <h2 className="font-normal text-gray-700 whitespace-nowrap mr-2">
                দাখেলা নং:
              </h2>
              <div className="w-full p-3 border border-gray-300"></div>
            </div>
          </div>
          <div className="">
            <div className="grid grid-cols-4 gap-1 items-center pt-1">
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
        </div>
        {/* Pledge Section - Made more compact */}
        <div className="mb-2">
          <p className="text-2xs">মুহতারাম,</p>
          <p className="ml-8 text-2xs">হযরত মুহতামিম সাহেব (দা. বা.)</p>

          <p className="mt-2 ml-20 text-2xs">
            আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ
          </p>

          <p className="mt-2 text-2xs">
            বিনীত নিবেদন এই যে, আমি{' '}
            {bnBijoy2Unicode(institutionInfo?.InstitutionName)} এর যাবতীয় কানুন
            ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য বিনীত
            আবেদন করছি।
          </p>

          <p className=" text-2xs">
            হুজুরের খেলমতে আরজ এই যে, আমার আবেদন মঞ্জুর করতঃ অত্র মাদরাসা হতে
            দ্বীন হাসিল করার সুযোগ প্রদানের জন্য আপনার মর্জি হয়।
          </p>
        </div>

        {/* Student Details - Made more compact */}

        <div className="flex gap-2 mb-2 text-black">
          {/* Left Box */}
          <div className="w-1/2 border border-black p-2 h-[175px] text-xs">
            <div className="grid grid-cols-[90px_10px_1fr] gap-y-1">
              <p className="font-bold">নাম</p>
              <p>:</p>
              <p className="font-bold">{data?.UserName}</p>

              <p className="font-bold">পিতার নাম</p>
              <p>:</p>
              <p className="font-bold">{data?.FatherName}</p>

              <p className="font-bold">মাতার নাম</p>
              <p>:</p>
              <p className="font-bold">{data?.MotherName}</p>

              <p className="font-bold">জন্ম তারিখ</p>
              <p>:</p>
              <p className="font-bold">
                {bnBijoy2Unicode(formatToDDMMYYYY(data?.DateOfBirth))}
              </p>

              <p className="font-bold">NID/জন্ম নিবন্ধন নং</p>
              <p>:</p>
              <p className="font-bold">{data?.NIDNO}</p>

              <p className="font-bold">অভিভাবকের মোবাইল</p>
              <p>:</p>
              <p className="font-bold">{data?.Mobile1 || data?.Mobile2}</p>
            </div>
          </div>

          {/* Right Box */}
          <div className="w-1/2 border border-black p-2 text-xs">
            {/* Permanent Address */}
            <div className="text-center font-bold border-b border-black pb-0.5 mb-1">
              স্থায়ী ঠিকানা
            </div>

            <div className="grid grid-cols-[80px_1fr_70px_1fr] gap-y-1">
              <p className="font-bold">গ্রাম</p>
              <p>: {data?.PermanentVill}</p>

              <p className="font-bold">থানা</p>
              <p>: {data?.PoliceStationName}</p>

              <p className="font-bold">ডাক</p>
              <p>: {data?.PermanentPost}</p>

              <p className="font-bold">জেলা</p>
              <p>: {data?.DistrictName}</p>
            </div>

            {/* Temporary Address */}
            <div className="text-center font-bold border-b border-black pb-0.5 mt-2 mb-1">
              অস্থায়ী ঠিকানা
            </div>

            <div className="grid grid-cols-[80px_1fr_70px_1fr] gap-y-1">
              <p className="font-bold">গ্রাম</p>
              <p>: {data?.TransientVill}</p>

              <p className="font-bold">থানা</p>
              <p>: {data?.TransientPoliceName}</p>

              <p className="font-bold">ডাক</p>
              <p>: {data?.TransientPost}</p>

              <p className="font-bold">জেলা</p>
              <p>: {data?.TransientDistrict}</p>
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
        <div className="flex justify-between mb-2 text-2xs">
          <div>
            <span>তালিমী মুরব্বীর নাম: ________________</span>
          </div>
          <div>
            <span>স্বাক্ষর: ________________</span>
          </div>
          <div>
            <span>তারিখ: ________________</span>
          </div>
        </div>

        {/* Office Section */}
        <div className="text-center border border-black p-0.5 text-xs mb-1">
          <h2 className="font-bold">১ম মাসিক পরীক্ষা ফলাফল</h2>
        </div>
        {/* Table Wrapper */}
        <div className="border">
          <div className="grid grid-cols-2 gap-3">
            {/* Left Table */}
            <table className="w-full border-collapse border">
              <thead>
                <tr className="bg-white">
                  <th className="border border-black p-1 w-[40px]">ক্রঃ</th>
                  <th className="border border-black p-1">বিষয়সমূহ</th>
                  <th className="border border-black p-1 w-[70px]">পূর্ণমান</th>
                  <th className="border border-black p-1 w-[70px]">
                    প্রাপ্তমান
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, i) => i + 1).map((index) => {
                  const subjectKey = `Subject${index}`;
                  const subValKey = `SubVal${index}`;
                  const passNumberKey = `PassNumber${index}`;

                  const subject = data[subjectKey];
                  const obtainedMarks = data[subValKey];
                  const fullMarks = data[passNumberKey];

                  // শুধুমাত্র যেসব বিষয়ে ডেটা আছে সেগুলো দেখাবে
                  if (!subject) {
                    return (
                      <tr key={index} className="bg-white">
                        <td className="border border-black p-1 h-7 text-center bg-white">
                          {index}
                        </td>
                        <td className="border border-black p-1 h-7 text-center bg-white">
                          {index === 4
                            ? 'বিজ্ঞান'
                            : index === 5
                            ? 'ইংরেজি'
                            : index === 6
                            ? 'ইসলাম শিক্ষা'
                            : ''}
                        </td>
                        <td className="border border-black p-1 h-7 text-center bg-white"></td>
                        <td className="border border-black p-1 h-7 text-center bg-white"></td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={index} className="bg-white">
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {index}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {subject}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {fullMarks}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {obtainedMarks}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Right Table */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="border border-black p-1 w-[40px]">ক্রঃ</th>
                  <th className="border border-black p-1">বিষয়সমূহ</th>
                  <th className="border border-black p-1 w-[70px]">পূর্ণমান</th>
                  <th className="border border-black p-1 w-[70px]">
                    প্রাপ্তমান
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, i) => i + 7).map((index) => {
                  const subjectKey = `Subject${index}`;
                  const subValKey = `SubVal${index}`;
                  const passNumberKey = `PassNumber${index}`;

                  const subject = data[subjectKey];
                  const obtainedMarks = data[subValKey];
                  const fullMarks = data[passNumberKey];

                  return (
                    <tr key={index} className="bg-white">
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {index}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {subject ||
                          (index === 7
                            ? 'সাধারণ জ্ঞান'
                            : index === 8
                            ? 'চারু ও কারুকলা'
                            : index === 9
                            ? 'শারীরিক শিক্ষা'
                            : '')}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {fullMarks || ''}
                      </td>
                      <td className="border border-black p-1 h-7 text-center bg-white">
                        {obtainedMarks || ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-start my-4 px-4">
          <p className="text-2xs text-center">সর্বমোট প্রাপ্ত নম্বর : </p>
          <p className="text-2xs text-center">জিপিএ : 1.67 </p>
          <p className="text-2xs text-center">প্রাপ্ত গ্রেড : Abs </p>
          <p className="text-2xs text-center">মেধাস্থান : 0 </p>
        </div>

        {/* Teacher Comments */}
        <div className="mb-1 text-2xs">
          <p>দারুল ইকামা/শ্রেণী শিক্ষকের মতামত :</p>
          <div className="flex justify-between mt-1">
            <span>
              যে জামাতে/বিভাগে ভর্তি হবে ইচ্ছুক : ________________________
            </span>
            <span>স্বাক্ষর ও তারিখ: ________________________</span>
          </div>
        </div>

        {/* Financial Status */}

        {/* Payment Section */}
        <div className="text-center border border-black p-0.5 text-xs mb-1">
          <h2 className="font-bold">অফিসের অংশ</h2>
        </div>
        <div className="mb-1 text-2xs my-3">
          <div className="flex justify-between mt-1">
            <span>নিরীক্ষকের মন্তব্য..........</span>
            <span>স্বাক্ষর ও তারিখ: ________________________</span>
            <span>আবেদনকারীর স্বাক্ষর: ________________________</span>
          </div>
        </div>

        {/* Approval Section */}
        <div className="mb-1 text-2xs">
          <h2 className="font-bold">* নাযিমে তালিমাতের মন্তব্য:</h2>
          <p className="">
            আমি আবেদনকরীকে
            .................................................................
            জামাতের ভর্তির উপযুক্ত মনে করছি/করছি না। তাহাকে
            ................................................................
            জামাতরে ভর্তি ভর্তি হওয়ার পরামর্শ দিতেছি।
          </p>
        </div>

        {/* Final Signature */}
        <div className="text-right text-2xs">
          <p className="font-bold">নাযিমে তালীমাতের স্বাক্ষর/সীল</p>
          <p>_______________________________________</p>
          <div className="flex justify-end pt-3">
            <span className="mr-2">তারিখ</span>
            <span>________________________</span>
          </div>
        </div>
        {/* Approval Section */}
        <div className="mb-1 text-2xs">
          <h2 className="font-bold">* মুহতামিমের মঞ্জুরী :</h2>
          <p className="">
            আবেদনকারীকে
            .......................................................................
            জামাআতে ভির্তির আবেদন মঞ্জুর করা হল। ভর্তি ফি.................টাকা,
            মাসিক খোরাকি.................টাকা, বেতন................টাকা, আবাসিক
            চার্জ/অন্যান্য.................টাকা নির্ধারণ করা হল।
          </p>
        </div>

        {/* Final Signature */}
        <div className="text-right text-2xs">
          <p className="font-bold">মুহতামিমে জামিয়ার স্বাক্ষর/সীল</p>
          <p>_______________________________________</p>
          <div className="flex justify-end pt-3">
            <span className="mr-2">তারিখ</span>
            <span>________________________</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionFormA4;
