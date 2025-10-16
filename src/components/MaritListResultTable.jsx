import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Buffer } from 'buffer';
import bnBijoy2Unicode from "../utils/conveter";
import PointWiseResult from "../view/PublicResult/PointWiseResult";
import AvgNumberResult from "../view/PublicResult/AvgNumberResult";
import Loader from "./Loader";

const MaritListResultTable = () => {
    const { maritList, schoolData: studentResult, maritListStatus: maritlistStatus } = useSelector((state) => state.studentResultPublicView);
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)

    useEffect(() => {
        console.log(studentResult);

        if (studentResult?.Logo?.data) {
            const buffer = Buffer.from(studentResult.Logo.data);
            const base64String = buffer.toString('base64');
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc)
            // document.title = `${studentResult?.UserCode}-${bnBijoy2Unicode(studentResult?.ExamName)}-${bnBijoy2Unicode(studentResult?.SessionName)}`;
        }
    }, [studentResult])
    const handlePrint = () => {
        const originalTitle = document.title;
        // document.title = `${studentResult?.UserCode}-${bnBijoy2Unicode(studentResult?.ExamName)}-${bnBijoy2Unicode(studentResult?.SessionName)}`;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };
    return (

        maritlistStatus == 'loading' ? <div> <Loader /> </div> : (
            <div className="pt-[80px] lg:pt-5 pb-[80px] hidden_in_print w-full min-h-screen bg-[#f9f9f9]">
                <div className=" bg-white font-SolaimanLipi relative w-[1000px] max-w-full mx-auto pr-[0px]">
                    <div className="lg:mb-4 lg:text-end">
                        <button className="print absolute lg:relative top-4 right-2 inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi" onClick={handlePrint}>
                            <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                            <span className="pt-1">প্রিন্ট</span>
                        </button>
                    </div>


                    <div className="w-full block bg-white">
                        <div className="flex-1">
                            <div className="flex items-center flex-col bg-theme-color md:bg-white md:flex-row">
                                <div className="w-[80px] h-[80px] md:w-[140px] md:h-[140px] mt-6 md:mt-0  flex items-center justify-center bg-white rounded-full overflow-hidden">
                                    {logo ? <img src={logo} alt="Logo" className="max-w-full max-h-full" /> : null}
                                </div>

                                <div className="flex-1 bg-theme-color w-full py-[15px]">
                                    <div className="flex justify-end">
                                        <div className="w-full text-center">
                                            <h1 className="text-white text-[32px] pb-2">
                                                {bnBijoy2Unicode(studentResult?.InstitutionName)}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="bg-theme-color text-center">
                                        <p className="text-white">{bnBijoy2Unicode(studentResult?.Address)}</p>
                                    </div>
                                    <p className="text-center text-[18px] text-white mt-1">{maritList.length > 0 ? bnBijoy2Unicode(maritList[0]["ExamName"]) : null}</p>
                                </div>
                            </div>
                            {
                                maritList.map(classWiseMaritList => (
                                    <div key={classWiseMaritList.SubClassID} className="mb-4 pt-6">
                                        <div className="w-full overflow-scroll">
                                            <table className="w-full">
                                                <thead>
                                                    <tr>
                                                        <th className="text-[20px] font-bold mb-2 pl-0 text-start pb-2" colSpan={6}>শ্রেনী/জামাত: {bnBijoy2Unicode(classWiseMaritList.SubClass)}</th>
                                                    </tr>
                                                    <tr>
                                                        <th className="p-3 border border-r border-black">ক্রমিক</th>
                                                        <th className="p-3 border border-r border-black">কোড</th>
                                                        <th className="p-3 border border-r border-black">নাম</th>
                                                        <th className="p-3 border border-r border-black">পিতা</th>
                                                        <th className="p-3 border border-r border-black">মোট নাম্বার</th>
                                                        <th className="p-3 border border-r border-black">বিভাগ</th>
                                                        <th className="p-3 border border-r border-black">মেধাস্থান</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classWiseMaritList.result.map((maritData, index) => (
                                                        <tr className="" key={maritData.ID}>
                                                            <td className="p-3 border border-black text-[14px] bg-white">{index + 1}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white text-center">{bnBijoy2Unicode(String(maritData.UserCode))}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white">{bnBijoy2Unicode(maritData.UserName)}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white">{bnBijoy2Unicode(maritData.FatherName)}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white text-center">{bnBijoy2Unicode(String(maritData.Total))}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white text-center font-bold">{bnBijoy2Unicode(maritData.Division)}</td>
                                                            <td className="p-3 border border-black text-[14px] bg-white text-center">{maritData.Positions}</td>

                                                        </tr>
                                                    ))}


                                                </tbody>
                                            </table>

                                        </div>

                                    </div>
                                ))
                            }



                        </div>


                    </div>


                </div>

            </div>
        )


    );
};

export default MaritListResultTable;
