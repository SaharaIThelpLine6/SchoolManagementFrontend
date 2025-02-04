import { useSelector } from "react-redux";
import bnBijoy2Unicode from "../../utils/conveter";
import { useEffect, useState } from "react";
import { Buffer } from 'buffer';

const Marksheet = () => {
    const { resultStatus, resultError, studentResult } = useSelector((state) => state.studentResultPublicView)
    const [logo, setLogo] = useState(null)
    const [principal, setPrincipal] = useState(null)
    const [najem, setNajem] = useState(null)

    useEffect(() => {
        if (studentResult?.Logo?.data) {
            const buffer = Buffer.from(studentResult.Logo.data);
            const base64String = buffer.toString('base64');
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc)

            const signaturePrincipalBuffer = Buffer.from(studentResult.SignaturePrincipal.data);
            const base64StringPrincipalBuffer = signaturePrincipalBuffer.toString('base64');
            const PrincipalimageSrc = `data:image/png;base64,${base64StringPrincipalBuffer}`;
            setPrincipal(PrincipalimageSrc)

            const signatureNajemBuffer = Buffer.from(studentResult.SignatureNajem.data);
            const base64StringNajemBuffer = signatureNajemBuffer.toString('base64');
            const NajemimageSrc = `data:image/png;base64,${base64StringNajemBuffer}`;
            setNajem(NajemimageSrc)
        }
    }, [studentResult])
    return (
        <div className="">
            <div className=" w-[750px] h-[1000px] relative bg-white ">
                <div className="pt-4 pb-1 px-8 bg-white">
                    {/*Logo and Heading start*/}
                    <div className="flex">
                        <div className="pt-6">
                            <img src={logo} alt="Logo" className=" w-[80px] h-[80px]" />
                        </div>
                        <div className="mx-auto text-center">
                            <h2 className="text-[24px] font-medium">{bnBijoy2Unicode(studentResult?.InstitutionName)}</h2>
                            <h3 className="text-md">{bnBijoy2Unicode(studentResult?.Address)}</h3>
                            <h3 className="text-md">শিক্ষাবর্ষঃ {bnBijoy2Unicode(studentResult?.SessionName)}</h3>
                            <h3 className="text-md">পরীক্ষাঃ {bnBijoy2Unicode(studentResult?.ExamName)}</h3>
                        </div>
                    </div>
                    {/*Logo and Heading end*/}
                    {/*Students details and grade point start*/}
                    <div className="flex items-center justify-between">

                        <div className="pt-3">
                            <table>
                                <tbody className="">
                                    <tr>
                                        <td className="text-end font-semibold">পরীক্ষার্থীর নাম</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td className="text-start"> {bnBijoy2Unicode(studentResult?.UserName)} </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">{bnBijoy2Unicode(studentResult?.ClassNameLabel)}:</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> {bnBijoy2Unicode(studentResult?.SubClass)} </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">{bnBijoy2Unicode(studentResult?.StudentIDLabel)}:</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> {bnBijoy2Unicode(String(studentResult?.UserCode))} </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">পিতার নাম</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> {bnBijoy2Unicode(studentResult?.FatherName)} </td>
                                    </tr>
                                    <tr>
                                        <td className="text-end">জন্ম তারিখ</td>
                                        <td className="w-10 text-center"> : </td>
                                        <td> {bnBijoy2Unicode(studentResult?.DateOfBirth)} ইং </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-5">
                            <h1 className="bg-[#a8a6a6] text-white text-center text-[16px]">মোট বিষয় {bnBijoy2Unicode(String(studentResult?.SubSonkha))} টি - পূর্ণমান {bnBijoy2Unicode(String(studentResult?.DivisionTopNumber))}* = {bnBijoy2Unicode(String(studentResult?.DivisionTopNumber * studentResult?.SubSonkha))}</h1>
                            <table className="w-[295px]">
                                <tbody className="border border-black w-full">
                                    {Array.from({ length: studentResult.SubSonkha }).map((_, index) => (
                                        <tr key={index}>
                                            <td className="text-start pl-2">{bnBijoy2Unicode(studentResult[`Division${index + 1}`])}</td>
                                            <td className="w-12 text-end">:</td>
                                            <td className="pl-3">{bnBijoy2Unicode(String(studentResult[`DivisionNumber${index + 1}`]))} X</td>
                                            <td className="pr-2">{bnBijoy2Unicode(String(studentResult?.SubSonkha))} = {bnBijoy2Unicode(String(studentResult?.SubSonkha * studentResult[`DivisionNumber${index + 1}`]))}</td>
                                        </tr>

                                    ))}

                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/*Students details and grade point end*/}
                    {/*Subject wise number and table start*/}
                    <div className="pt-2 w-full">
                        <table className="w-full border border-collapse">
                            <thead className="border border-black">
                                <tr className="border border-b-[2px] border-t-[2px] border-black">
                                    <th className="border border-black">ক্রমিক নং</th>
                                    <th className="border border-black w-72">বিষয়</th>
                                    <th className="border border-black">পূর্ণমান</th>
                                    <th className="border border-black">পাশ নম্বর</th>
                                    <th className="border border-black">সর্বোচ্চ প্রাপ্ত নম্বর</th>
                                    <th className="border border-black">প্রাপ্ত নম্বর</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {Array.from({ length: studentResult.SubSonkha }).map((_, index) => (
                                    <tr key={studentResult[`Subject${index + 1}`]} className="border border-black">
                                        <td className="border border-black pl-2">{bnBijoy2Unicode(String(index + 1))}</td>
                                        <td className="border border-black text-left pl-2">{bnBijoy2Unicode(studentResult[`Subject${index + 1}`])}</td>
                                        <td className="border border-black pl-2">{bnBijoy2Unicode(String(studentResult?.DivisionTopNumber))}</td>
                                        <td className="border border-black pl-2">{bnBijoy2Unicode(String(studentResult[`PassNumber${index + 1}`]))}</td>
                                        <td className="border border-black pl-2">{bnBijoy2Unicode(String(studentResult[`TN${index + 1}`]))}</td>
                                        <td className="border border-black pl-2">{bnBijoy2Unicode(String(studentResult[`SubVal${index + 1}`]))}</td>
                                    </tr>

                                ))}

                            </tbody>
                        </table>
                    </div>
                    {/*Subject wise number and table end*/}
                    {/*Total Mark Start*/}
                    <div className="w-full pt-8">
                        <table className="border w-full border-black">
                            <tr>
                                <td className="pl-2">প্রাপ্তি বিভাগ  :  {bnBijoy2Unicode(studentResult?.Division)}</td>
                                <td>মেধা স্থান  :  {bnBijoy2Unicode(String(studentResult?.Positions))}</td>
                                <td>গড়  :  {bnBijoy2Unicode(String(studentResult?.Average))}</td>
                                <td>মোট নম্বর  :  {bnBijoy2Unicode(String(studentResult?.Total))}</td>
                            </tr>
                        </table>
                    </div>
                    {/*Total Mark End*/}
                    {/*Comment Part Start*/}
                    <div className=" pt-5 flex gap-2">
                        <div className="w-full h-[100px] border border-black">
                            <p className="text-[12px] pl-2 pt-1">শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর :</p>
                        </div>
                        <div className="w-full h-[100px] border border-black">
                            <p className="text-[12px] pl-2 pt-1">অভিভাবকের মন্তব্য ও স্বাক্ষর :</p>
                        </div>
                    </div>
                    {/*Comment Part End*/}
                    {/*Signature part start*/}
                    <div className="flex absolute bottom-0 w-full left-0 justify-between text-[14px] pt-[60px]">
                        <div className="text-center relative">
                            <img src={principal} alt="" className="absolute -top-[40px] left-1/2 w-[60px] -translate-x-1/2" />
                            <p>.....................................</p>
                            <p>মুহতামিম</p>
                            <p>তারিখ : </p>
                        </div>
                        <div className="text-center">
                            <img src={najem} alt="" className="absolute top-[0px] right-0 w-[60px] -translate-x-1/2" />
                            <p>.....................................</p>
                            <p>নাযেম</p>
                            <p>তারিখ : </p>
                        </div>
                    </div>
                    {/*Signature part end*/}
                </div>
            </div>
        </div>
    )
}

export default Marksheet;