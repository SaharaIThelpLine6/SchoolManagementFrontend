import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Buffer } from 'buffer';
import bnBijoy2Unicode from "../../utils/conveter";
const MaritListResultPrint = () => {
    const { maritList, schoolData: studentResult } = useSelector((state) => state.studentResultPublicView);
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)

    useEffect(() => {
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
        <div className="portrait-page">
            <div className=" w-full h-[1000px] relative bg-white ">
                <div className="pt-4 pb-1 px-8 bg-white">
                    <div className=" bg-white font-SolaimanLipi relative w-[1000px] max-w-full mx-auto pr-[0px]">
                        <div className="w-full block bg-white">
                            <div className="flex-1">
                                <div className="flex items-center flex-col md:bg-white md:flex-row">
                                    <div className="w-[80px] h-[80px] md:w-[140px] md:h-[140px] mt-6 md:mt-0  flex items-center justify-center bg-white rounded-full overflow-hidden absolute">
                                        {logo ? <img src={logo} alt="Logo" className="max-w-full max-h-full" /> : null}
                                    </div>

                                    <div className="flex-1 w-full">
                                        <div className="flex justify-end">
                                            <div className="w-full text-center">
                                                <h1 className="text-[32px] pb-2">
                                                    {bnBijoy2Unicode(studentResult?.InstitutionName)}
                                                </h1>
                                            </div>
                                        </div>
                                        <div className=" text-center">
                                            <p>{bnBijoy2Unicode(studentResult?.Address)}</p>
                                        </div>
                                        <p className="text-center text-[18px] mt-1">{maritList.length > 0 ? bnBijoy2Unicode(maritList[0]["ExamName"]) : null}</p>
                                    </div>
                                </div>
                                {
                                    maritList.map(classWiseMaritList => (
                                        <div key={classWiseMaritList.SubClassID} className="mb-4 pt-6">
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
                                    ))
                                }



                            </div>


                        </div>


                    </div>
                </div>
            </div>
        </div>

    );
};

export default MaritListResultPrint;
