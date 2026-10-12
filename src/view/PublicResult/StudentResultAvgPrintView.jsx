import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../utils/conveter";
import { Buffer } from "buffer";
import convertBijoyToBengali from "../../utils/uniconveter";
const StudentResultAvgPrintView = ({ studentResult }) => {
  const [logo, setLogo] = useState(null);
  const [principal, setPrincipal] = useState(null);
  const [najem, setNajem] = useState(null);

  const user = studentResult?.User || {};
  const averageCondition = studentResult?.averageCondition || {};
  const subjectCount = averageCondition?.SubSonkha || studentResult?.SubSonkha || 0;
  console.log(studentResult);
  
  useEffect(() => {
    const logoData = studentResult?.institutionInfo?.Logo?.data ?? studentResult?.Logo?.data;
    if (logoData) {
      const buffer = Buffer.from(logoData);
      const base64String = buffer.toString("base64");
      setLogo(`data:image/png;base64,${base64String}`);
    }

    const principalSignatureData = studentResult?.SignaturePrincipal?.data ?? studentResult?.institutionInfo?.SignaturePrincipal?.data;
    if (principalSignatureData) {
      const signaturePrincipalBuffer = Buffer.from(principalSignatureData);
      const base64StringPrincipalBuffer = signaturePrincipalBuffer.toString("base64");
      setPrincipal(`data:image/png;base64,${base64StringPrincipalBuffer}`);
    }

    const najemSignatureData = studentResult?.SignatureNajem?.data ?? studentResult?.institutionInfo?.SignatureNajem?.data;
    if (najemSignatureData) {
      const signatureNajemBuffer = Buffer.from(najemSignatureData);
      const base64StringNajemBuffer = signatureNajemBuffer.toString("base64");
      setNajem(`data:image/png;base64,${base64StringNajemBuffer}`);
    }
  }, [studentResult]);
  return (
    <div>
      <div className="flex">
        <div className="pt-6">
          <img src={logo} alt="Logo" className=" w-[80px] h-[80px]" />
        </div>
        <div className="mx-auto text-center">
          <h2 className="text-[24px] font-medium">
            {studentResult?.institutionInfo?.InstitutionName || studentResult?.InstitutionName}
          </h2>
          <h3 className="text-md">{studentResult?.institutionInfo?.Address || studentResult?.Address}</h3>
          <h3 className="text-md">
            শিক্ষাবর্ষঃ {studentResult?.SessionName || studentResult?.Session?.SessionName}
          </h3>
          <h3 className="text-md">
            পরীক্ষাঃ {studentResult?.ExamName || studentResult?.Exam?.ExamName}
          </h3>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="pt-3">
          <table>
            <tbody className="">
              <tr>
                <td className="text-end font-semibold">পরীক্ষার্থীর নাম</td>
                <td className="w-10 text-center"> : </td>
                <td className="text-start">
                  {user?.UserName || studentResult?.UserName}
                </td>
              </tr>
              <tr>
                <td className="text-end">
                  শ্রেণি:
                </td>
                <td className="w-10 text-center"> : </td>
                <td> {studentResult?.SubClass || studentResult?.Class?.SubClass} </td>
              </tr>
              <tr>
                <td className="text-end">
                  {bnBijoy2Unicode(studentResult?.StudentIDLabel || "শিক্ষার্থী আইডি")}:
                </td>
                <td className="w-10 text-center"> : </td>
                <td> {bnBijoy2Unicode(String(user?.UserCode ?? studentResult?.UserCode ?? ""))} </td>
              </tr>
              <tr>
                <td className="text-end">পিতার নাম</td>
                <td className="w-10 text-center"> : </td>
                <td> {String(user?.FatherName ?? studentResult?.FatherName ?? "")} </td>
              </tr>
              <tr>
                <td className="text-end">জন্ম তারিখ</td>
                <td className="w-10 text-center"> : </td>
                <td>
                  {(user?.DateOfBirth || studentResult?.DateOfBirth)
                    ? bnBijoy2Unicode((user?.DateOfBirth || studentResult?.DateOfBirth).split("T")[0])
                    : ""}{" "}
                  ইং{" "}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-5">
          <h1 className="bg-[#a8a6a6] text-white text-center text-[16px]">
            মোট বিষয় {bnBijoy2Unicode(String(subjectCount))} টি
          </h1>
          <table className="w-[295px]">
            <tbody className="border border-black w-full">
              {
                studentResult?.averageCondition?.divitionlist && studentResult?.averageCondition?.divitionlist.map((divitionDetails, index) => {
                  const divisionNumber = studentResult?.[`DivisionNumber${index + 1}`] || studentResult?.averageCondition?.[`DivisionNumber${index + 1}`];
                  return (
                    <tr key={`division_row_${index}`}>
                      <td className="text-start pl-2">{divitionDetails?.DivisionNames}</td>
                      <td className="w-12 text-end">:</td>
                      <td className="pl-3">{bnBijoy2Unicode(String(divisionNumber))} X</td>
                      <td className="pr-2">{bnBijoy2Unicode(String(subjectCount))} = {bnBijoy2Unicode(String(subjectCount * divisionNumber))}</td>
                    </tr>
                  );
                })
              }
            
            </tbody>
          </table>
        </div>
      </div>
      <div className="pt-2 w-full">
        <table className="w-full border border-collapse">
          <thead className="border border-black">
            <tr className="border border-b-[2px] border-t-[2px] border-black">
              <th className="border border-black">ক্রমিক নং</th>
              <th className="border border-black w-72">বিষয়</th>
              <th className="border border-black">পূর্ণমান</th>
              <th className="border border-black">পাশ নম্বর</th>
              <th className="border border-black">প্রাপ্ত নম্বর</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {Array.from({ length: subjectCount }).map((_, index) => {
              const subjectName =
                studentResult?.[`Subject${index + 1}`] ||
                studentResult?.averageCondition?.subjects?.[index]?.SubjectName ||
                "";

              return (
                <tr
                  key={`${subjectName || "subject"}${index}`}
                  className="border border-black"
                >
                  <td className="border border-black pl-2">
                    {bnBijoy2Unicode(String(index + 1))}
                  </td>
                  <td className="border border-black text-left pl-2">
                    {subjectName}
                  </td>
                  <td className="border border-black pl-2">
                    {bnBijoy2Unicode(
                      String(studentResult?.averageCondition?.[`MaxNumber${index + 1}`] ?? studentResult?.[`MaxNumber${index + 1}`] ?? "")
                    )}
                  </td>
                  <td className="border border-black pl-2">
                    {bnBijoy2Unicode(
                      String(studentResult?.averageCondition?.[`PassNumber${index + 1}`] ?? studentResult?.[`PassNumber${index + 1}`] ?? "")
                    )}
                  </td>
                  <td className="border border-black pl-2">
                    {bnBijoy2Unicode(String(studentResult?.[`SubVal${index + 1}`] ?? ""))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/*Subject wise number and table end*/}
      {/*Total Mark Start*/}
      <div className="w-full pt-8">
        <table className="border w-full border-black">
          <tbody>
            <tr>
              <td className="pl-2">
                প্রাপ্তি বিভাগ : {studentResult?.Division?.DivisionNames}
              </td>
              <td>
                মেধা স্থান : {bnBijoy2Unicode(String(studentResult?.Positions ?? studentResult?.Position ?? 0))}
              </td>
              <td>
                গড় : {bnBijoy2Unicode(
                  String(
                    (
                      Number(studentResult?.Total || 0) /
                      Number(averageCondition?.AverageSubsonkha || subjectCount || 1)
                    ).toFixed(2)
                  )
                )}
              </td>
              <td>
                মোট নম্বর : {bnBijoy2Unicode(String(studentResult?.Total))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/*Total Mark End*/}
      {/*Comment Part Start*/}
      <div className=" pt-5 flex gap-2">
        <div className="w-full h-[100px] border border-black">
          <p className="text-[12px] pl-2 pt-1">
            শ্রেণী শিক্ষক/শিক্ষিকার মন্তব্য ও স্বাক্ষর : {studentResult?.Division?.Note}
          </p>
        </div>
        <div className="w-full h-[100px] border border-black">
          <p className="text-[12px] pl-2 pt-1">
            অভিভাবকের মন্তব্য ও স্বাক্ষর :
          </p>
        </div>
      </div>
      {/*Comment Part End*/}
      {/*Signature part start*/}
      <div className="flex absolute bottom-0 w-full left-0 justify-between text-[14px] pt-[60px]">
        <div className="text-center relative">
          <img
            src={principal}
            alt=""
            className="absolute -top-[40px] left-1/2 w-[60px] -translate-x-1/2"
          />
          <p>.....................................</p>
          <p>{studentResult?.PrincipalName}</p>
          <p>তারিখ : </p>
        </div>
        <div className="text-center">
          <img
            src={najem}
            alt=""
            className="absolute top-[0px] right-0 w-[60px] -translate-x-1/2"
          />
          <p>.....................................</p>
          <p>{studentResult?.NajemName}</p>
          <p>তারিখ : </p>
        </div>
      </div>
      {/*Signature part end*/}
    </div>
  );
};

export default StudentResultAvgPrintView;
