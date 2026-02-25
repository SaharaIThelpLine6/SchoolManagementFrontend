import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery, useGetResidentialQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
const AdmissionFormWithResult = ({ reportData, query }) => {
    const [logo, setLogo] = useState(null);
    const { data: instutionInfo } = useGetInstitutionInfoQuery();
    const { data: sessionData } = useGetSessionsQuery();
    const { data: residentialData, error: residentialError, isLoading: residentialDataLoading } = useGetResidentialQuery();
    useEffect(() => {
        console.log(query);

        if (instutionInfo?.Logo?.data) {
            const buffer = Buffer.from(instutionInfo.Logo.data);
            const base64String = buffer.toString("base64");
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc);
        }
    }, [instutionInfo]);


    const selectedSession = sessionData?.find(
        (item) => item.SessionID == query.session_id
    );

    return (
        <div>
            {
                reportData?.result.length > 0 && reportData.result.map(maritData => (
                    <React.Fragment>
                        <div className="max-w-[750px] pt-[100px] lg:pt-0 px-2 lg:px-0 relative mx-auto">
                            <div className="pt-4 pb-1 px-0">
                                <div className="header text-center border-b-2 border-black">
                                    <h1 className='text-[24px]'>{instutionInfo?.InstitutionName}</h1>
                                    <p className='text-[14px] my-[4px]'>{instutionInfo?.Address}</p>
                                    <p className='text-[14px]'>{instutionInfo?.ContactNumber}</p>
                                </div>
                                <div className="body pt-3">
                                    <div className='flex justify-between gap-[40px] items-center mb-6 flex-wrap lg:flex-nowrap'>
                                        <div className="card border border-black w-full pt-5 px-2 pb-3 relative" style={{ alignSelf: "start" }}>
                                            <div className="label absolute top-[1px] left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                                <p className='text-[12px] py-1 px-4'>বিগত তথ্য</p>
                                            </div>

                                            <p className='text-[14px] mt-1 mb-[16px]'>শ্রেণি/জামাত: {reportData.SubClass}</p>
                                            <p className='text-[14px] mt-1 mb-[16px]'>শিক্ষাবর্ষ: {maritData.SessionName}</p>
                                            <p className='text-[14px] mt-1'>আইডি নং: {maritData.UserCode}</p>


                                        </div>
                                        <div className='px-4 border-2 border-black bg-white mx-auto' style={{ boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)" }}>
                                            <p className='text-[20px] text-nowrap'>ভর্তির ফরম</p>
                                        </div>
                                        <div className="card border border-black w-full pt-5 px-2 pb-3 relative">
                                            <div className="label absolute top-[1px] left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                                <p className='text-[12px] py-1 px-4'>বর্তমান তথ্য</p>
                                            </div>
                                            <p className='text-[14px] mt-1'>শ্রেণি/জামাত: : {reportData.SubClass}</p>
                                            <p className='text-[14px] mt-1'>শিক্ষাবর্ষ: {maritData.usercode}</p>
                                            <p className='text-[14px] mt-1'>আইডি নং: {maritData.usercode}</p>
                                            {/* {JSON.stringify(residentialData)} */}
                                            <ul className='flex gap-4 mt-1'>
                                                {
                                                    residentialData.map((residential) => {
                                                        if (residential.RDID === 4) {
                                                            return null;
                                                        }
                                                        return <li key={residential.RDID} className='text-[12px] flex gap-[5px] items-center'>{residential.ResidentialName} <input checked={maritData.ResidentialStatusId === residential.RDID ? true : false} readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />
                                                        </li>
                                                    })
                                                }
                                            </ul>

                                        </div>
                                    </div>

                                    <div className="form_details flex items-center justify-between">
                                        <div className="form_no flex items-center gap-2">
                                            <p className="text-[18px]">ফরম নং :</p>
                                            <div className="area h-[40px] w-[100px] border border-black"></div>
                                        </div>
                                        <div className="form_no flex items-center gap-2">
                                            <p className="text-[18px]">ভর্তি নং :</p>
                                            <div className="area h-[40px] w-[100px] border border-black"></div>
                                        </div>

                                        <div className="form_no flex items-center gap-[20px]">
                                            <div className="flex gap-2 items-center">
                                                <p className="text-[18px]"> সচ্ছল</p>
                                                <input readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />

                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <p className="text-[18px]">এতিম</p>
                                                <input readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />

                                            </div>
                                            <div className="flex gap-2 items-center">
                                                <p className="text-[18px]">গরিব</p>
                                                <input readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />

                                            </div>

                                            <div className="flex gap-2 items-center">
                                                <p className="text-[18px]">অসহায়</p>
                                                <input readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />

                                            </div>
                                        </div>
                                    </div>

                                    <p className='text-[18px] mb-2 mt-4 leading-[32px]'>
                                        মুহতারাম,<br />
                                        <p className="ml-[30px]">হযরত মুহতামিম সাহেব (দা. বা.)</p>
                                        আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ
                                        বিনীত নিবেদন এই যে, আমি রাহাতুল জান্নাত মহিলা মাদরাসা এর যাবতীয় কানুন ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য বিনীত আবেদন করছি।

                                    </p>
                                    <div className="flex gap-3 flex-wrap lg:flex-nowrap font-bold">
                                        <div className="box border border-black w-full  md:w-[45%] px-4 py-2 ">
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">নাম: {maritData.UserName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">পিতার নাম: {maritData.FatherName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">মাতার নাম: {maritData.MotherName}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">জন্ম তারিখ: {maritData.DateOfBirth}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">জন্ম নিবন্ধন নং: {maritData.NIDNO}</p>
                                            <p className="text-[18px] leading-[20px] whitespace-nowrap mb-3">অভিভাবকের মোবাইল : {maritData.Mobile1}</p>
                                        </div>
                                        <div className="box border border-black w-full md:w-[55%] px-4 py-2">
                                            <div className="header_text border-b-2 border-black text-center mb-2">
                                                <p className="text-[18px] mb-2">স্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                <div className='w-full grid grid-cols-2'>
                                                    <p className='text-[18px] mb-3 font-bold'>গ্রাম/মহল্লা: {maritData.permanentVill}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>ডাক: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>থানা: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>জেলা:  {maritData.permanentPost}</p>
                                                </div>
                                            </div>

                                            <div className="header_text border-b-2 border-black text-center mt-2">
                                                <p className="text-[18px]">অস্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                <div className='w-full grid grid-cols-2'>
                                                    <p className='text-[18px] mb-3 font-bold'>গ্রাম/মহল্লা: {maritData.permanentVill}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>ডাক: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>থানা: {maritData.permanentPost}</p>
                                                    <p className='text-[18px] mb-3 font-bold'>জেলা:  {maritData.permanentPost}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-y-[20px] justify-between mt-2">
                                        <p className='relative text-[18px]'>অভিভাবকের নাম: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>সম্পর্ক: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>স্বাক্ষর: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>

                                        <p className='relative text-[18px]'>তালিমী মুরব্বীর নাম: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>স্বাক্ষর: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative text-[18px]'>তারিখ: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>

                                    </div>
                                    <div className="text-center pt-[20px]">
                                        <h3 className='font-bold text-[20px] border-[3px] border-black inline-block px-4 py-2'>প্রথম সাময়িক পরীক্ষার ফলাফল</h3>
                                    </div>
                                    <div className="grid grid-cols-2 pt-4 gap-5">
                                        {/* First table */}
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">ক্র:</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">কিতাবের নাম</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">পাশ নম্বর</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">প্রাপ্ত নম্বর</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: Math.min(maritData.SubSonkha, 6) }).map((_, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-black pl-2 text-[16px] text-center ">
                                                            {index + 1}
                                                        </td>
                                                        <td className="border border-black pl-2 text-[16px]">
                                                            {maritData[`Subject${index + 1}`]}
                                                        </td>
                                                        <td className="border border-black pl-2 text-[16px] text-center">
                                                            {maritData[`PassNumber${index + 1}`]}
                                                        </td>
                                                        <td className="border border-black pl-2 text-[16px] text-center">
                                                            {maritData[`DivisionNumber${index + 1}`]}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <table className="w-full">
                                            <thead>
                                                <tr>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">ক্র:</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">কিতাবের নাম</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">পাশ নম্বর</th>
                                                    <th className="font-bold text-[16px] text-center border border-black p-2">প্রাপ্ত নম্বর</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                
                                                {maritData.SubSonkha > 6 &&
                                                    Array.from({ length: maritData.SubSonkha - 6 }).map((_, index) => {
                                                        const subIndex = index + 6; 
                                                        return (
                                                            <tr key={subIndex}>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {bnBijoy2Unicode(String(maritData[`SubVal${subIndex + 1}`]))}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {bnBijoy2Unicode(String(maritData[`SubName${subIndex + 1}`]))}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {bnBijoy2Unicode(String(maritData[`SubPass${subIndex + 1}`]))}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {bnBijoy2Unicode(String(maritData[`SubObtained${subIndex + 1}`]))}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black inline-block'>অভিভাবকের স্বাক্ষর</p>
                                    </div>
                                </div>
                            </div>
                        </div>



                    </React.Fragment>
                ))
            }
        </div>
    );
};

export default AdmissionFormWithResult;