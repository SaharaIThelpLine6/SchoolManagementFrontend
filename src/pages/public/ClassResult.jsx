import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClassResult, fetchResult, setResultError } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import bnBijoy2Unicode from '../../utils/conveter';
import { Buffer } from 'buffer';
import MarksheetClassWise from '../../components/Document/MarksheetClassWise';

// import ClassResultTable from '../../components/ClassResultTable';

const ClassResult = () => {
    const { schoolid, seassonid, examid, classid, userid } = useParams();
    const { resultStatus, resultError, classResult, schoolData, resultStatistics } = useSelector((state) => state.studentResultPublicView)

    const dispatch = useDispatch()
    const navigate = useNavigate();
    useEffect(() => {
        dispatch(fetchClassResult({ schoolId: schoolid, resultUrl: `${seassonid}/${examid}/${classid}` }))
    }, [dispatch])
    if (resultStatus === 'failed') {
        navigate(`/${schoolid}/classes`);
    }
    const bufferConveter = (bufferData) => {
        const buffer = Buffer.from(bufferData);
        const base64String = buffer.toString('base64');
        const imageSrc = `data:image/png;base64,${base64String}`;
        return imageSrc
    }
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `${bnBijoy2Unicode(classResult[0]?.ExamName)} - ${bnBijoy2Unicode(classResult[0]?.SessionName)}`;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };
    if(resultStatus === 'succeeded'){
        document.title = `${bnBijoy2Unicode(classResult[0]?.ExamName)} - ${bnBijoy2Unicode(classResult[0]?.SessionName)}`;
    }

    return (
        <div>
            {classResult?.length > 0 ? (
                <div>
                    <div className="hidden_in_print">
                        <div className="mx-auto relative bg-white font-SolaimanLipi pt-[80px] lg:pt-0">

                            <div className="lg:text-end relative">
                                <button className="print absolute top-4 right-5 inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi z-30" onClick={handlePrint}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                                    <span className="pt-1">প্রিন্ট</span>
                                </button>
                            </div>

                            <div className=" pt-0 pb-1 px-2 bg-white">
                                <div className="bg-theme-color lg:flex">
                                    {/*Logo*/}
                                    <div className="pt-5 lg:pl-5">
                                        <img src={bufferConveter(schoolData?.Logo?.data)} alt="logo" className="rounded-full lg:rounded-sm  w-[80px] h-[80px] lg:h-[100px] lg:w-[100px] mx-auto" />
                                    </div>

                                    {/*Heading Title Start*/}
                                    <div className="mx-auto text-center py-3 text-white relative z-10">
                                        <h2 className="text-[22px] font-medium">{bnBijoy2Unicode(schoolData?.InstitutionName)}</h2>
                                        <h3 className="">{bnBijoy2Unicode(schoolData?.Address)}</h3>
                                        <h3 className="">{bnBijoy2Unicode(classResult[0]?.ExamName)} - {bnBijoy2Unicode(classResult[0]?.SessionName)}</h3>
                                        <h3 className="border-2 border-white rounded-md p-1 w-fit mx-auto">ফলাফল(নম্বরপত্র)</h3>
                                        <h3 className="">শ্রেনী/জামাত : {bnBijoy2Unicode(classResult[0]?.SubClass)}</h3>
                                    </div>
                                </div>
                                {/*Heading Title End*/}
                                {/*Marksheet Body Start*/}
                                <div className="pt-2 w-full overflow-x-scroll ">
                                    <table className="min-w-full w-fit text-center text-[16px]">
                                        <thead className="border border-black">
                                            <tr>
                                                <td className="border border-black px-1 min-w-[35px]">ক্র:</td>
                                                <td className="border border-black min-w-[70px]">আইডি নং</td>
                                                <td className="border border-black min-w-[180px]">শিক্ষার্থীর নাম</td>
                                                {
                                                    Array.from({ length: classResult[0].SubSonkha }).map((_, index) => (<td key={`view_subject_${index}`} className="border border-black min-w-[100px]">{bnBijoy2Unicode(classResult[0][`Subject${index + 1}`])}</td>))

                                                }
                                                <td className="border border-black px-1 min-w-[50px]">মোট</td>
                                                <td className="border border-black px-1 min-w-[60px]">গড়</td>
                                                <td className="border border-black px-1 min-w-[60px]">বিভাগ</td>
                                                <td className="border border-black px-1 min-w-[20px]">স্থান</td>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                classResult.map((studentResult, index) => {
                                                    return (
                                                        <tr key={`view_user${studentResult.UserCode}`}>
                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(index + 1))}</td>
                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(studentResult.UserCode))}</td>
                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(studentResult.UserName)}</td>
                                                            {
                                                                Array.from({ length: studentResult.SubSonkha }).map((_, index) => (<td key={`subind_${index}`} className="border border-black min-w-[100px]">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>))

                                                            }
                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(studentResult?.Total))}</td>

                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(studentResult?.Average))}</td>
                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(studentResult?.Division))}</td>

                                                            <td className="border border-black px-1 min-w-[20px]">{bnBijoy2Unicode(String(studentResult?.Positions))}</td>


                                                        </tr>
                                                    )
                                                })
                                            }
                                            {/* <tr>
                                        <td className="border border-black">১</td>
                                        <td className="border border-black">৪১৭১৩</td>
                                        <td className="border border-black pl-1 text-left">খাজিদা আক্তার সাজিয়া</td>

                                        <td className="border border-black">৯৫.৮৮</td>
                                        <td className="border border-black">মুমতায</td>
                                        <td className="border border-black">১</td>
                                    </tr> */}

                                        </tbody>
                                    </table>
                                </div>
                                {/*Marksheet Body End*/}

                            </div>
                        </div>
                    </div>
                    <div className='print_canvas'>
                        <MarksheetClassWise classResult={classResult} schoolData={schoolData} resultStatices={resultStatistics} />
                    </div>
                </div>
            ) : <>Loading...</>}
        </div>
    );
};

export default ClassResult;