import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import bnBijoy2Unicode from '../../utils/conveter';
import { useGetClassQuery, useGetFormQuery, useGetResidentialQuery } from '../../features/onlineAdmission/onlineAdmissionSlice';
import { fetchDidata, fetchSettingsFieldData, fetchThanadata } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import convertBijoyToBengali from '../../utils/uniconveter';

const StudentAdmissionForm = () => {
    const { usercode, schoolid } = useParams();
    const { schoolData } = useSelector((state) => state.studentResultPublicView)
    const dispatch = useDispatch();
    const { gender, divition, district, thana, studentRelation, status, error } = useSelector((state) => state.studentResultPublicView);
    const { data: residentialData, error: residentialError, isLoading: residentialDataLoading } = useGetResidentialQuery({ id: schoolid });

    const { data: applicationData, error: applicationError, isLoading: applicationLoading } = useGetFormQuery({ id: schoolid, usercode })

    const { data: classData, error: classError, isLoading: classLoading } = useGetClassQuery({ id: schoolid })

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `ভর্তির ফরম ${usercode}`;
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };

    const permanentId = String(applicationData?.permanentPoliceStationID || '').slice(0, 3);
    const permanentDivitionId = String(applicationData?.permanentPoliceStationID || '').slice(0, 1);
    const transientId = String(applicationData?.TransientPoliceStationID || '').slice(0, 3);
    const transientDivitionId = String(applicationData?.TransientPoliceStationID || '').slice(0, 1);
    useEffect(() => {
        if (!applicationData) return;
        dispatch(fetchSettingsFieldData(schoolid));
        dispatch(fetchDidata({ madrasaId: schoolid, id: permanentDivitionId }));
        dispatch(fetchThanadata({ madrasaId: schoolid, id: permanentId }));
        dispatch(fetchDidata({ madrasaId: schoolid, id: transientDivitionId }));
        dispatch(fetchThanadata({ madrasaId: schoolid, id: transientId }));
    }, [dispatch, applicationData, schoolid]);

    if (residentialDataLoading || applicationLoading || classLoading) {
        return <p>Loading...</p>
    }
    if (applicationError || classError) {
        return (<div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50">
            কোন তথ্য পাওয়া যায়নি।
        </div>);
    }



    const className = classData?.find((val) => val.ClassID === applicationData?.ClassID)?.ClassName ?? "Not Found";
    const jilaP = district[permanentDivitionId]?.find((val) => val.DistrictID == permanentId)?.DistrictName ?? "Not Found";
    const thanaP = thana[permanentId]?.find((val) => val.PoliceStationID == applicationData?.permanentPoliceStationID)?.PoliceStationName ?? "Not Found";

    const jilaT = district[transientDivitionId]?.find((val) => val.DistrictID == transientId)?.DistrictName ?? "Not Found";
    const thanaT = thana[transientId]?.find((val) => val.PoliceStationID == applicationData?.TransientPoliceStationID)?.PoliceStationName ?? "Not Found";

    // console.log(convertBijoyToBengali("iÂ¨ some other text Â° KÂ¡"));
    // console.log(convertBijoyToBengali(" ইমন "));
    
    return (
        <div>
            <div className=" max-w-[750px] pt-[100px] lg:pt-0 px-2 lg:px-0 relative mx-auto hidden_in_print">
                <div className="pt-4 pb-1 px-0">
                    <div className="header text-center border-b-2 border-black">
                        <div className="lg:text-end relative hidden_in_print">
                            <button className="print absolute top-0 md:top-4 right-5 inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi z-20" onClick={handlePrint}>
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                                <span className="pt-1">প্রিন্ট</span>
                            </button>
                        </div>

                        <h1 className='text-[24px]'>{bnBijoy2Unicode(schoolData?.InstitutionName)}</h1>
                        <p className='text-[14px] my-[4px]'>{bnBijoy2Unicode(schoolData?.Address)}</p>
                        <p className='text-[14px]'>{bnBijoy2Unicode(schoolData?.ContactNumber)}</p>
                    </div>
                    <div className="body pt-3">
                        <div className='flex justify-between gap-[40px] items-center mb-6 flex-wrap lg:flex-nowrap'>
                            <div className="card border border-black w-full pt-5 px-2 pb-3 relative" style={{ alignSelf: "start" }}>
                                <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                    <p className='text-[12px] py-1 px-4'>বিগত তথ্য</p>
                                </div>
                                <p className='text-[14px] mt-1'>জামাত:</p>
                                <p className='text-[14px] mt-1'>আইডি: </p>
                                {/* <ul>
                                    <li>AvevwmK </li>
                                    <li>AbvevwmK </li>
                                    <li>†W ‡Kqvi</li>
                                </ul> */}

                            </div>
                            <div className='px-4 border-2 border-black bg-white mx-auto' style={{ boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)" }}>
                                <p className='text-[20px] text-nowrap'>ভর্তির ফরম</p>
                            </div>
                            <div className="card border border-black w-full pt-5 px-2 pb-3 relative">
                                <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                    <p className='text-[12px] py-1 px-4'>বর্তমান তথ্য</p>
                                </div>
                                <p className='text-[14px] mt-1'>জামাত: {bnBijoy2Unicode(className)}</p>
                                <p className='text-[14px] mt-1'>আইডি: {bnBijoy2Unicode(usercode)}</p>
                                {/* {JSON.stringify(residentialData)} */}
                                <ul className='flex gap-4 mt-1'>
                                    {
                                        residentialData.map((residential) => {
                                            if (residential.RDID === 4) {
                                                return null;
                                            }
                                            return <li key={residential.RDID} className='text-[12px] flex gap-[5px] items-center'>{residential.ResidentialName} <input checked={applicationData.ResidentialStatusId === residential.RDID ? true : false} readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />
                                            </li>
                                        })
                                    }
                                    {/* <li className='text-[12px]'>AvevwmK :</li>
                                    <li className='text-[12px]'>AbvevwmK: </li>
                                    <li className='text-[12px]'>†W ‡Kqvi:</li> */}
                                </ul>

                            </div>
                        </div>

                        <p className='text-[14px] mb-2'> বিস্তারিত তথ্যদি:</p>
                        <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                            <div className="box border border-black w-full  md:w-[40%] px-4 py-2 ">
                                <p>নাম: {bnBijoy2Unicode(applicationData.UserName)}</p>
                                <p>পিতার নাম: {bnBijoy2Unicode(applicationData.FatherName)}</p>
                                <p>মাতার নাম: {bnBijoy2Unicode(applicationData.MotherName)}</p>
                                <p>জন্ম তারিখ: {bnBijoy2Unicode(applicationData.DateOfBirth)}</p>
                                <p>জন্ম নিবন্ধন নং: {applicationData.NIDNO}</p>
                                <p>অভিভাবকের মোবাইল : {applicationData.Mobile1}</p>
                            </div>
                            <div className="box border border-black w-full md:w-[60%] px-4 py-2">
                                <div className="header_text border-b-2 border-black text-center">
                                    <p>স্থায়ী ঠিকানা</p>
                                </div>
                                <div className="body_text mt-1 flex justify-between">
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>গ্রাম/মহল্লা: {bnBijoy2Unicode(applicationData.permanentVill)}</p>
                                        <p className='text-[14px]'>ডাক: {bnBijoy2Unicode(applicationData.permanentPost)}</p>
                                    </div>
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>থানা: {thanaP}</p>
                                        <p className='text-[14px]'>জেলা: {jilaP}</p>
                                    </div>
                                </div>
                                <div className="header_text border-b-2 border-black text-center mt-2">
                                    <p>অস্থায়ী ঠিকানা</p>
                                </div>
                                <div className="body_text mt-1 flex justify-between">
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>গ্রাম/মহল্লা: {bnBijoy2Unicode(applicationData.TransientVill)}</p>
                                        <p className='text-[14px]'>ডাক: {bnBijoy2Unicode(applicationData.TransientPost)}</p>
                                    </div>
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>থানা: {thanaT}</p>
                                        <p className='text-[14px]'>জেলা: {jilaT}</p>
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


            <div className=" w-[750px] h-[1000px] relative mx-auto print_canvas">
                <div className="pt-4 pb-1 px-0">
                    <div className="header text-center border-b-2 border-black">
                        <div className="lg:text-end relative hidden_in_print">
                            <button className="print absolute top-4 right-5 inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi z-30" onClick={handlePrint}>
                                <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                                <span className="pt-1">প্রিন্ট</span>
                            </button>
                        </div>

                        <h1 className='text-[24px]'>{bnBijoy2Unicode(schoolData?.InstitutionName)}</h1>
                        <p className='text-[14px] my-[4px]'>{bnBijoy2Unicode(schoolData?.Address)}</p>
                        <p className='text-[14px]'>{bnBijoy2Unicode(schoolData?.ContactNumber)}</p>
                    </div>
                    <div className="body pt-3">
                        <div className='flex justify-between gap-[40px] items-center mb-6'>
                            <div className="card border border-black w-full pt-5 px-2 pb-3 relative" style={{ alignSelf: "start" }}>
                                <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                    <p className='text-[12px] py-1 px-4'>বিগত তথ্য</p>
                                </div>
                                <p className='text-[14px] mt-1'>জামাত:</p>
                                <p className='text-[14px] mt-1'>আইডি: </p>
                                {/* <ul>
                                    <li>AvevwmK </li>
                                    <li>AbvevwmK </li>
                                    <li>†W ‡Kqvi</li>
                                </ul> */}

                            </div>
                            <div className='px-4 border-2 border-black bg-white' style={{ boxShadow: "5px 5px 0px 0px rgba(0,0,0,1)" }}>
                                <p className='text-[20px] text-nowrap'>ভর্তির ফরম</p>
                            </div>
                            <div className="card border border-black w-full pt-5 px-2 pb-3 relative">
                                <div className="label absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-black bg-white">
                                    <p className='text-[12px] py-1 px-4'>বর্তমান তথ্য</p>
                                </div>
                                <p className='text-[14px] mt-1'>জামাত: {bnBijoy2Unicode(className)}</p>
                                <p className='text-[14px] mt-1'>আইডি: {bnBijoy2Unicode(usercode)}</p>
                                {/* {JSON.stringify(residentialData)} */}
                                <ul className='flex gap-4 mt-1'>
                                    {
                                        residentialData.map((residential) => {
                                            if (residential.RDID === 4) {
                                                return null;
                                            }
                                            return <li key={residential.RDID} className='text-[12px] flex gap-[5px] items-center'>{residential.ResidentialName} <input checked={applicationData.ResidentialStatusId === residential.RDID ? true : false} readOnly type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2" />
                                            </li>
                                        })
                                    }
                                    {/* <li className='text-[12px]'>AvevwmK :</li>
                                    <li className='text-[12px]'>AbvevwmK: </li>
                                    <li className='text-[12px]'>†W ‡Kqvi:</li> */}
                                </ul>

                            </div>
                        </div>

                        <p className='text-[14px] mb-2'>আমার বিস্তারিত তথ্যদি নিম্নে প্রদান করা হলো:</p>
                        <div className="flex gap-3">
                            <div className="box border border-black w-[40%] px-4 py-2">
                                <p>নাম: {bnBijoy2Unicode(applicationData.UserName)}</p>
                                <p>পিতার নাম: {bnBijoy2Unicode(applicationData.FatherName)}</p>
                                <p>মাতার নাম: {bnBijoy2Unicode(applicationData.MotherName)}</p>
                                <p>জন্ম তারিখ: {bnBijoy2Unicode(applicationData.DateOfBirth)}</p>
                                <p>জন্ম নিবন্ধন নং: {applicationData.NIDNO}</p>
                                <p>অভিভাবকের মোবাইল : {applicationData.Mobile1}</p>
                            </div>
                            <div className="box border border-black w-[60%] px-4 py-2">
                                <div className="header_text border-b-2 border-black text-center">
                                    <p>স্থায়ী ঠিকানা</p>
                                </div>
                                <div className="body_text mt-1 flex justify-between">
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>গ্রাম/মহল্লা: {applicationData.permanentVill}</p>
                                        <p className='text-[14px]'>ডাক: {applicationData.permanentPost}</p>
                                    </div>
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>থানা: {thanaP}</p>
                                        <p className='text-[14px]'>জেলা: {jilaP}</p>
                                    </div>
                                </div>
                                <div className="header_text border-b-2 border-black text-center mt-2">
                                    <p>অস্থায়ী ঠিকানা</p>
                                </div>
                                <div className="body_text mt-1 flex justify-between">
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>গ্রাম/মহল্লা: {applicationData.TransientVill}</p>
                                        <p className='text-[14px]'>ডাক: {applicationData.TransientPost}</p>
                                    </div>
                                    <div className='w-1/2'>
                                        <p className='text-[14px]'>থানা: {thanaT}</p>
                                        <p className='text-[14px]'>জেলা: {jilaT}</p>
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
        </div>
    );
};

export default StudentAdmissionForm;