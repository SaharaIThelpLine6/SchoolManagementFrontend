import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Buffer } from 'buffer';
import bnBijoy2Unicode from "../utils/conveter";

const ResultTable = () => {
    const { resultStatus, resultError, studentResult } = useSelector((state) => state.studentResultPublicView)
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)

    useEffect(() => {
        if (studentResult?.Logo?.data) {
            const buffer = Buffer.from(studentResult.Logo.data);
            const base64String = buffer.toString('base64');
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc)
            // console.log(imageSrc);
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

            <div className=" bg-white font-SolaimanLipi relative w-[750px] max-w-full mx-auto pr-[0px]">
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
                <div className="bg-white px-[5px]">
                    <div className="flex flex-col items-center">
                        <div className="w-full flex justify-between my-5 px-2">

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">
                                        {bnBijoy2Unicode(studentResult?.StudentIDLabel)}:
                                    </p>
                                    <p>{studentResult?.UserCode}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">
                                        {bnBijoy2Unicode(studentResult?.ClassNameLabel)}:
                                    </p>
                                    <p className="text-[16px]">{bnBijoy2Unicode(studentResult?.SubClass)}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">প্রাপ্তি বিভাগ:</p>
                                    <p className="text-[16px]">{bnBijoy2Unicode(studentResult?.Division)}</p>
                                </div>


                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">নাম:</p>
                                    <p className="text-[16px]">{bnBijoy2Unicode(studentResult?.UserName)}</p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">পিতার নাম:</p>
                                    <p className="text-[16px]">{bnBijoy2Unicode(studentResult?.FatherName)}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <p className="font-semibold text-[16px]">জন্ম তারিখ:</p>
                                    <p className="text-[16px]">{bnBijoy2Unicode(studentResult?.DateOfBirth)}</p>
                                </div>
                            </div>


                        </div>
                    </div>
                    <table
                        width="100%"
                        border={0}
                        cellSpacing={0}
                        cellPadding={0}
                        className="border-collapse border border-black">
                        <thead>
                            <tr>
                                <th className="text-semibold text-[16px] border border-black h- " bgcolor="#ffffff">ক্রমিক নং</th>
                                <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">বিষয়</th>
                                <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">পূর্ণমান</th>
                                <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">পাশ নম্বর</th>
                                <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">সর্বোচ্চ প্রাপ্ত নম্বর</th>
                                <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">প্রাপ্ত নম্বর</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: studentResult.SubSonkha }).map((_, index) => (
                                <tr>
                                    <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(index + 1))}</td>
                                    <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(studentResult[`Subject${index + 1}`])}</td>
                                    <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult?.DivisionTopNumber))}</td>
                                    <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`PassNumber${index + 1}`]))}</td>
                                    <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`TN${index + 1}`]))}</td>
                                    <td className="text-[16px] border border-black h-[36px] pl-4 " bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>
                                </tr>
                            ))}

                        </tbody>
                    </table>

                    <div className="flex justify-center mt-[25px]">
                        <div className="w-full">
                            <div className="flex justify-between items-center border border-black p-4 font-bold">
                                <div className="flex items-center space-x-2 ">
                                    <p className="text-[16px]">মেধা স্থান:</p>
                                    <p>{bnBijoy2Unicode(String(studentResult?.Positions))}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <p className="text-[16px]">গড়:</p>
                                    <p>{bnBijoy2Unicode(String(studentResult?.Average))}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <p className="text-[16px]">মোট নম্বর:</p>
                                    <p>{bnBijoy2Unicode(String(studentResult?.Total))}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* <table className="mx-auto" width={750} border={0} align="center" cellPadding={0} cellSpacing={0}>
                <tbody>
                    <tr>
                        <td>
                            <table cellSpacing={0} cellPadding={0} width={"100%"} border={0}>
                                <tbody>
                                    <tr>
                                        <td bgcolor="#ffffff" height={10}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table
                                width={750}
                                border={0}
                                align="center"
                                cellPadding={0}
                                cellSpacing={0}
                                bgcolor="#ffffff"
                            >
                                <tbody>
                                    <tr>
                                        <td align="left" valign="top" background="images/back_left.gif">
                                            &nbsp;
                                        </td>
                                        <td valign="top">
                                            <table width="100%" border={0} cellSpacing={0} cellPadding={0}>
                                                <tbody>
                                                    <tr>
                                                        <td
                                                            width={130}
                                                            height={130}
                                                            align="center"
                                                            valign="middle"
                                                            bgcolor="#ffffff"
                                                            className="left_round"
                                                        >
                                                            {
                                                                logo ? <img src={logo} /> : null
                                                            }

                                                        </td>

                                                        <td valign="top" className="bg-theme-color">
                                                            <table
                                                                width="100%"
                                                                border={0}
                                                                cellSpacing={0}
                                                                cellPadding={0}
                                                            >
                                                                <tbody>
                                                                    <tr>
                                                                        <td align="right">
                                                                            <table
                                                                                width="100%"
                                                                                border={0}
                                                                                cellSpacing={0}
                                                                                cellPadding={0}
                                                                            >
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td align="center" valign="center" height={60}>
                                                                                            <h1 className="text-white text-[32px]">
                                                                                                {bnBijoy2Unicode(studentResult?.InstitutionName)}
                                                                                            </h1>
                                                                                        </td>

                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td align="center" height={40} className="bg-theme-color">
                                                                            <p className="text-white">{bnBijoy2Unicode(studentResult?.Address)}</p>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td height={30} align="center" valign="center">
                                                                            <h1 className="text-white mb-0">
                                                                                <p>{bnBijoy2Unicode(studentResult?.ExamName)}</p>
                                                                            </h1>
                                                                        </td>
                                                                    </tr>

                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td align="right" valign="top" background="images/back_right.gif">
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" valign="center" bgcolor="#ffffff" height={10}>
                            &nbsp;
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table
                                width={750}
                                border={0}
                                align="center"
                                cellPadding={0}
                                cellSpacing={0}
                                bgcolor="#FFFFFF"
                            >
                                <tbody>
                                    <tr>
                                        <td align="center" valign="middle">
                                            <table
                                                width="100%"
                                                border={0}
                                                cellSpacing={0}
                                                cellPadding={0}
                                                className=""
                                            >
                                                <tbody>

                                                    <tr>
                                                        <td align="left" valign="top" bgcolor="#ffffff">
                                                            &nbsp;
                                                        </td>
                                                        <td align="center" valign="middle">
                                                            <table
                                                                width="100%"
                                                                border={0}
                                                                cellPadding={0}
                                                                cellSpacing={0}
                                                                className="font-noto"
                                                                bgcolor="#ffffff"
                                                            >
                                                                <tbody>
                                                                    <tr>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="font-semibold text-[16px]"
                                                                        >
                                                                            <p>{bnBijoy2Unicode(studentResult?.StudentIDLabel)}:</p>
                                                                        </td>
                                                                        <td
                                                                            width="27%"
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                        >
                                                                            {studentResult?.UserCode}
                                                                        </td>
                                                                        <td
                                                                            width="22%"
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="text-[16px] font-semibold"
                                                                        >
                                                                            নাম:
                                                                        </td>
                                                                        <td
                                                                            width="27%"
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="text-[16px]"
                                                                        >
                                                                            {bnBijoy2Unicode(studentResult?.UserName)}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td height={10} bgcolor="#ffffff"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="font-semibold text-[16px]"

                                                                        >
                                                                            {bnBijoy2Unicode(studentResult?.ClassNameLabel)}:
                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="text-[16px]"
                                                                        >
                                                                            {bnBijoy2Unicode(studentResult?.SubClass)}
                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="font-semibold text-[16px]"
                                                                        >
                                                                            পিতার নাম:
                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="text-[16px]"
                                                                        >
                                                                            {bnBijoy2Unicode(studentResult?.FatherName)}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td height={10} bgcolor="#ffffff"></td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="font-semibold text-[16px]"
                                                                        >
                                                                            প্রাপ্তি বিভাগ:
                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className=" text-[16px]">
                                                                            {bnBijoy2Unicode(studentResult?.Division)}

                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="font-semibold text-[16px]"
                                                                        >
                                                                            জম্ন তারিখ:
                                                                        </td>
                                                                        <td
                                                                            align="left"
                                                                            valign="middle"
                                                                            bgcolor="#ffffff"
                                                                            className="text-[16px]"
                                                                        >
                                                                            {bnBijoy2Unicode(studentResult?.DateOfBirth)}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td height={40} bgcolor="#ffffff"></td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>

                                    <tr>
                                        <td align="center" valign="middle">
                                            <table
                                                width="100%"
                                                border={0}
                                                cellSpacing={0}
                                                cellPadding={0}
                                                className=""
                                            >
                                                <tbody>

                                                    <tr>
                                                        <td align="left" valign="top" bgcolor="#ffffff">
                                                            &nbsp;
                                                        </td>
                                                        <td>
                                                            <table
                                                                width="100%"
                                                                border={0}
                                                                cellSpacing={0}
                                                                cellPadding={0}
                                                                className="border-collapse border border-black">
                                                                <thead>
                                                                    <tr>
                                                                        <th className="text-semibold text-[16px] border border-black h- " bgcolor="#ffffff">ক্রমিক নং</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">বিষয়</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">পূর্ণমান</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">পাশ নম্বর</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">সর্বোচ্চ প্রাপ্ত নম্বর</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 " bgcolor="#ffffff">প্রাপ্ত নম্বর</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {Array.from({ length: studentResult.SubSonkha }).map((_, index) => (
                                                                        <tr>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(index + 1))}</td>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(studentResult[`Subject${index + 1}`])}</td>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult?.DivisionTopNumber))}</td>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`PassNumber${index + 1}`]))}</td>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4" bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`TN${index + 1}`]))}</td>
                                                                            <td className="text-[16px] border border-black h-[36px] pl-4 " bgcolor="#ffffff">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>
                                                                        </tr>
                                                                    ))}

                                                                </tbody>
                                                            </table>
                                                        </td>

                                                        <td align="left" valign="top" bgcolor="#ffffff">
                                                            &nbsp;
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" valign="top" bgcolor="#ffffff" height={20}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                    <tr>

                                        <td>
                                            <table width="100%"
                                                border={0}
                                                cellSpacing={0}
                                                cellPadding={0}
                                            >
                                                <tr>
                                                    <td>
                                                        <table width="100%"
                                                            border={0}
                                                            cellSpacing={0}
                                                            cellPadding={0}>
                                                            <tr>
                                                                <td align="left" valign="top" bgcolor="#ffffff" width={10}>
                                                                    &nbsp;
                                                                </td>
                                                                <td align="left" valign="top" bgcolor="#ffffff">
                                                                    <table width="100%"
                                                                        border={0}
                                                                        cellSpacing={0}
                                                                        cellPadding={0} className="border border-black">
                                                                        <tr>
                                                                            <td className="pl-6 font-bold" height={40}> <span className="text-[16px] font-bold">মেধা স্থান:</span> {bnBijoy2Unicode(String(studentResult?.Positions))}</td>
                                                                            <td className="font-bold"> <span className="text-[16px] font-bold">গড়:</span>  {bnBijoy2Unicode(String(studentResult?.Average))}</td>
                                                                            <td className="font-semibold"> <span className="text-[16px] font-bold">মোট নম্বর:</span> {bnBijoy2Unicode(String(studentResult?.Total))} </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                                <td align="left" valign="top" bgcolor="#ffffff" width={10}>
                                                                    &nbsp;
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>

                                            </table>
                                        </td>

                                    </tr>
                                    <tr>
                                        <td align="left" valign="top" bgcolor="#ffffff" width={20}>
                                            &nbsp;
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>



                </tbody>
            </table> */}
        </div>
    );
};

export default ResultTable;
