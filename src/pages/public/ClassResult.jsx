import React, { useEffect } from 'react';
import { getPublicData } from '../../utils/read/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClassResult, fetchResult } from '../../features/studentResultPublicView/studentResultPublicViewSlice';
import ResultTable from '../../components/ResultTable';
import Marksheet from '../../components/Document/Marksheet';
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
        dispatch(fetchClassResult({schoolId: schoolid, resultUrl: `${seassonid}/${examid}/${classid}`}))
        // dispatch(fetchClassResult(`/${schoolid}/result_statistics/${seassonid}/${examid}/${classid}`))
    }, [dispatch])
    if (resultStatus === 'failed') {
        console.log(resultError);
        // navigate(`/${schoolid}/page_not_found`);
    }

    const bufferConveter = (bufferData) => {
        const buffer = Buffer.from(bufferData);
        const base64String = buffer.toString('base64');
        const imageSrc = `data:image/png;base64,${base64String}`;
        return imageSrc
    }

    return (
        <div>
            {classResult?.length > 0 ? (
                <div>
                    <div className="hidden_in_print">
                        <div className="mx-auto relative bg-white font-SolaimanLipi">
                            <div className=" pt-0 pb-1 px-2 bg-white">
                                <div className="bg-[#307847]">
                                    {/*Logo*/}
                                    <div className="absolute pt-5 pl-5">
                                        <img src={bufferConveter(schoolData?.Logo?.data)} alt="logo" width={100} height={100} className="" />
                                    </div>

                                    {/*Heading Title Start*/}
                                    <div className="mx-auto text-center py-3 text-white">
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
                                                                Array.from({ length: studentResult.SubSonkha }).map((_, index) => (<td className="border border-black min-w-[100px]">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>))

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
            ) : null}
        </div>
    );
};

export default ClassResult;