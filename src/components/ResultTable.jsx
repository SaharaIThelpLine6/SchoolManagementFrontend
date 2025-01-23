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

        }
    }, [studentResult])

    return (
        <div className="pt-[80px] hidden_in_print">
            <table width={750} border={0} align="center" cellPadding={0} cellSpacing={0}>
                <tbody>
                    <tr>
                        <td>
                            <table cellSpacing={0} cellPadding={0} width={"100%"} border={0}>
                                <tr>
                                    <td bgcolor="#ffffff" height={10}></td>
                                </tr>
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

                                                        <td valign="top" bgcolor="#007814">
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
                                                                        <td align="center" height={40} bgcolor="#479e55">
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
                                                                        <th className="text-semibold text-[16px] border border-black h- "  bgcolor="#ffffff">ক্রমিক নং</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 "  bgcolor="#ffffff">বিষয়</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 "  bgcolor="#ffffff">পূর্ণমান</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 "  bgcolor="#ffffff">পাশ নম্বর</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 "  bgcolor="#ffffff">সর্বোচ্চ প্রাপ্ত নম্বর</th>
                                                                        <th className="text-semibold text-[16px] border border-black h-12 "  bgcolor="#ffffff">প্রাপ্ত নম্বর</th>
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
                                        {/* <td align="left" valign="top" bgcolor="#ffffff" height={40}>
                                            &nbsp;
                                        </td> */}
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
                                                {/* <tr>
                                                    <td className="pl-6">মেধা স্থান:</td>
                                                    <td>গড়:</td>
                                                    <td>মোট নম্বর:</td>
                                                </tr> */}
                                            </table>
                                        </td>
                                        {/* <td align="left" valign="top" bgcolor="#ffffff" height={40}>
                                            &nbsp;
                                        </td> */}
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
            </table>
        </div>
    );
};

export default ResultTable;
