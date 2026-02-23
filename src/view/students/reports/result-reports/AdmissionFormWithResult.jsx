import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
const AdmissionFormWithResult = ({ reportData, query }) => {
    const [logo, setLogo] = useState(null);
    const { data: instutionInfo } = useGetInstitutionInfoQuery();
    const { data: sessionData } = useGetSessionsQuery();

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
                        <div className=" max-w-[750px] pt-[100px] lg:pt-0 px-2 lg:px-0 relative mx-auto hidden_in_print">
                            <div className="pt-4 pb-1 px-0">
                                <div className="header text-center border-b-2 border-black">
                                    <h1 className='text-[24px]'>{instutionInfo?.InstitutionName}</h1>
                                    <p className='text-[14px] my-[4px]'>{instutionInfo?.Address}</p>
                                    <p className='text-[14px]'>{instutionInfo?.ContactNumber}</p>
                                </div>
                                <div className="body pt-3">
                                    <div className='flex justify-between gap-[40px] items-center mb-6 flex-wrap lg:flex-nowrap'>
                                        <div className="card border border-black w-full pt-5 px-2 pb-3 relative" style={{ alignSelf: "start" }}>
                                            <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                                <p className='text-[12px] py-1 px-4'>বিগত তথ্য</p>
                                            </div>
                                            <p className='text-[14px] mt-1'>জামাত:</p>
                                            <p className='text-[14px] mt-1'>আইডি: </p>


                                        </div>
                                        <div className='px-4 border-2 border-black bg-white mx-auto' style={{ boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)" }}>
                                            <p className='text-[20px] text-nowrap'>ভর্তির ফরম</p>
                                        </div>
                                        <div className="card border border-black w-full pt-5 px-2 pb-3 relative">
                                            <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                                <p className='text-[12px] py-1 px-4'>বর্তমান তথ্য</p>
                                            </div>
                                            <p className='text-[14px] mt-1'>জামাত: {reportData.SubClass}</p>
                                            <p className='text-[14px] mt-1'>আইডি: {maritData.usercode}</p>
                                            {/* {JSON.stringify(residentialData)} */}
                                            <ul className='flex gap-4 mt-1'>
                                                {
                                                   
                                                }
                                            </ul>

                                        </div>
                                    </div>

                                    <p className='text-[14px] mb-2'> বিস্তারিত তথ্যদি:</p>
                                    <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                                        <div className="box border border-black w-full  md:w-[40%] px-4 py-2 ">
                                            <p>নাম: {maritData.UserName}</p>
                                            <p>পিতার নাম: {maritData.FatherName}</p>
                                            <p>মাতার নাম: {maritData.MotherName}</p>
                                            <p>জন্ম তারিখ: {maritData.DateOfBirth}</p>
                                            <p>জন্ম নিবন্ধন নং: {maritData.NIDNO}</p>
                                            <p>অভিভাবকের মোবাইল : {maritData.Mobile1}</p>
                                        </div>
                                        <div className="box border border-black w-full md:w-[60%] px-4 py-2">
                                            <div className="header_text border-b-2 border-black text-center">
                                                <p>স্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                <div className='w-1/2'>
                                                    <p className='text-[14px]'>গ্রাম/মহল্লা: {maritData.permanentVill}</p>
                                                    <p className='text-[14px]'>ডাক: {maritData.permanentPost}</p>
                                                </div>
                                                <div className='w-1/2'>
                                                    {/* <p className='text-[14px]'>থানা: {thanaP}</p>
                                                    <p className='text-[14px]'>জেলা: {jilaP}</p> */}
                                                </div>
                                            </div>
                                            <div className="header_text border-b-2 border-black text-center mt-2">
                                                <p>অস্থায়ী ঠিকানা</p>
                                            </div>
                                            <div className="body_text mt-1 flex justify-between">
                                                {/* <div className='w-1/2'>
                                                    <p className='text-[14px]'>গ্রাম/মহল্লা: {bnBijoy2Unicode(applicationData.TransientVill)}</p>
                                                    <p className='text-[14px]'>ডাক: {bnBijoy2Unicode(applicationData.TransientPost)}</p>
                                                </div> */}
                                                <div className='w-1/2'>
                                                    {/* <p className='text-[14px]'>থানা: {thanaT}</p>
                                                    <p className='text-[14px]'>জেলা: {jilaT}</p> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-2">
                                        <p className='relative w-[33%]'>অভিভাবকের নাম: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative w-[33%]'>সম্পর্ক: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
                                        <p className='relative w-[33%]'>স্বাক্ষর: <span className='text border-t border-black border-dotted w-[110px] inline-block absolute top-[8px]'>&nbsp;</span> </p>
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