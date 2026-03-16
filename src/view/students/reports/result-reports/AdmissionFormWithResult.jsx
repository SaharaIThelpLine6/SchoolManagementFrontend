import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery, useGetResidentialQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
import parse from 'html-react-parser';

import 'quill/dist/quill.snow.css';
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
                        <div className="w-full relative px-[30px] pb-[30px] pt-2">
                            <div className="pt-4 pb-1 px-0">
                                <div className="relative header text-center border-b-2 border-black min-h-[90px] pb-2">
                                    <img className="absolute left-0 top-0 h-[80px] w-[80px]" src={logo} alt="logo" />
                                    <h1 className='text-[24px]'>{instutionInfo?.InstitutionName}</h1>
                                    <p className='text-[14px] my-[4px]'>{instutionInfo?.Address}</p>
                                    <p className='text-[14px]'>{instutionInfo?.ContactNumber}</p>
                                </div>
                                <div className="body pt-3">
                                    <div className='flex justify-between gap-[40px] items-center mb-6 flex-nowrap'>
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
                                            <p className='text-[14px] mt-1'>শ্রেণি/জামাত: : </p>
                                            <p className='text-[14px] mt-1'>শিক্ষাবর্ষ: </p>
                                            <p className='text-[14px] mt-1'>আইডি নং: </p>
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
                                        {/* মুহতারাম,<br />
                                        <p className="ml-[30px]">হযরত মুহতামিম সাহেব (দা. বা.)</p>
                                        আসসালামু আলাইকুম ওয়া রহমাতুল্লাহ
                                        বিনীত নিবেদন এই যে, আমি রাহাতুল জান্নাত মহিলা মাদরাসা এর যাবতীয় কানুন ও নীতিমালা মেনে চলার অঙ্গীকারে আবদ্ধ হয়ে ভর্তি হওয়ার জন্য বিনীত আবেদন করছি। */}

                                        {parse(String(reportData?.formSettings?.Description1))}
                                    </p>
                                    
                                    <div className="flex gap-3 flex-nowrap font-bold">
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
                                        <h3 className='font-bold text-[20px] border-[3px] border-black inline-block px-4 py-2'>{reportData.ExamName}</h3>
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
                                                                    {maritData[`SubVal${subIndex + 1}`] ? String(maritData[`SubVal${subIndex + 1}`]) : ""}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {maritData[`SubName${subIndex + 1}`] ? String(maritData[`SubName${subIndex + 1}`]) : ''}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    {maritData[`SubPass${subIndex + 1}`] ? String(maritData[`SubPass${subIndex + 1}`]) : ''}
                                                                </td>
                                                                <td className="border border-black pl-2 text-[20px]">
                                                                    { maritData[`SubObtained${subIndex + 1}`] ? String(maritData[`SubObtained${subIndex + 1}`]) : ''}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="grid grid-cols-4 pt-4">
                                        <p className="text-[18px] font-bold">সর্বমোট প্রাপ্ত নম্বর : 569</p>
                                        <p className="text-[18px] font-bold">গড় নম্বর : 94.83</p>
                                        <p className="text-[18px] font-bold">বিভাগ : মুমতাজ</p>
                                        <p className="text-[18px] font-bold">মেধাস্থান : 0</p>
                                    </div>
                                    <div className="grid grid-cols-4 mt-[20px]">
                                        <p className="text-[18px] col-span-3">যে বিভাগে/জামাতে ভর্তি হবে ইচ্ছুক :............................................................ </p>
                                        <p className="text-[18px]">স্বাক্ষর :.............</p>
                                    </div>
                                    <p className="text-[18px] mt-4">দারুল ইকামা/শ্রেণী শিক্ষকের মতামত :</p>

                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black inline-block text-[16px]'>অভিভাবকের স্বাক্ষর</p>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-[20px] border-[2px] border-black font-bold inline-block py-2 px-2 rounded-[4px]">অফিসের অংশ</h3>
                                    </div>
                                    <div className="mt-4 text-[18px]">
                                        <p dangerouslySetInnerHTML={{ __html: reportData?.formSettings?.Description2 }} />
                                        {/* {parse(String(reportData?.formSettings?.Description2))} */}
                                    </div>
{/*                                     
                                    <div className="grid grid-cols-4">
                                        <p className="text-[18px] col-span-3">নিরীক্ষকের মন্তব্য ..........................................................................................................  </p>
                                        <p className="text-[18px]">স্বাক্ষর ও তাং :................................</p>
                                    </div>
                                    <h4 className="text-[18px] font-bold mt-2">* নাযিমে তালিমাতের মন্তব্য :</h4>
                                    <p className="text-[16px] mt-[16px] leading-[28px]">আমি আবেদনকারীকে ................................................................. জামাতে ভর্তির উপযুক্ত মনে করছি/করছি না, তাকে ................................................................ জামাতে ভর্তি হওয়ার পরামর্শ দিচ্ছি।</p>
                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black border-dotted inline-block text-[16px] font-bold'>নাযিমে তালীমাতের স্বাক্ষর/সীল</p>
                                    </div>
                                    <h4 className="text-[18px] font-bold mt-2">* মুহতামিমের মঞ্জুরী :</h4>
                                    <p className="text-[16px] mt-[16px] leading-[28px]">
                                        আবেদনকারীকে ....................................................................... জামাতে ভর্তির আবেদন মঞ্জুর করা হল।
                                        ভর্তি ফি.......................টাকা, মাসিক খোরাকি.......................টাকা, বেতন.......................টাকা,
                                        আবাসিক চার্জ/অন্যান্য.......................টাকা নির্ধারণ করা হল।
                                    </p>
                                    <div className="text-end mt-6">
                                        <p className='border-t-2 border-black border-dotted inline-block text-[16px] font-bold'>মুহতামিম সাহেবের স্বাক্ষর/সীল</p>
                                    </div> */}

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