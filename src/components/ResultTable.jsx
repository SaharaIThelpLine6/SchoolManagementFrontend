import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Buffer } from 'buffer';
import bnBijoy2Unicode from "../utils/conveter";
import PointWiseResult from "../view/PublicResult/PointWiseResult";
import AvgNumberResult from "../view/PublicResult/AvgNumberResult";

const ResultTable = () => {
    const { resultStatus, resultError, studentResult, resultSubGroupInfo } = useSelector((state) => state.studentResultPublicView)
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)

    useEffect(() => {
        if (studentResult?.Logo?.data) {
            const buffer = Buffer.from(studentResult.Logo.data);
            const base64String = buffer.toString('base64');
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc)
            document.title = `${studentResult?.UserCode}-${bnBijoy2Unicode(studentResult?.ExamName)}-${bnBijoy2Unicode(studentResult?.SessionName)}`;
        }
    }, [studentResult])
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `${studentResult?.UserCode}-${bnBijoy2Unicode(studentResult?.ExamName)}-${bnBijoy2Unicode(studentResult?.SessionName)}`;

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
        }, 1000);
    };
    return (
        <div className="pt-[80px] lg:pt-5 pb-[80px] hidden_in_print w-full min-h-screen bg-[#f9f9f9]">
            {/* flex justify-center */}

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

                            <div className="flex-1 bg-theme-color w-full">
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

                                <div className="text-center pt-2 pb-4">
                                    <p className="text-white mb-0">{bnBijoy2Unicode(studentResult?.ExamName)} - {bnBijoy2Unicode(studentResult?.SessionName)}</p>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                {
                    resultSubGroupInfo?.ExamStatus == 2 ? (<PointWiseResult studentResult={studentResult} />) : <AvgNumberResult studentResult={studentResult} />
                }


            </div>

        </div>
    );
};

export default ResultTable;
