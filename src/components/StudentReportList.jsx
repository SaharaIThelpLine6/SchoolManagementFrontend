import React, { useEffect, useRef } from 'react';
import {useGetStudentReportsQuery } from '../features/student/studentQuerySlice';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import CharacterReport from './Document/characterReport';

const StudentReportList = ({ reportParams  }) => {
    const translate = useTranslate();
    const printRef = useRef();
    const { data: reportsResponse, error, isLoading } = useGetStudentReportsQuery({
        userCode: reportParams.userCode,
        classID: reportParams.classID || undefined,       
        SessionID: reportParams.SessionID || undefined,   
    });
    const handlePrint = () => {
        window.print();
    };

    return (
        <div>
            <div className="py-8 hidden_in_print">
                <button type='button' className="print inline-flex items-center px-4 py-1 gap-2  bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-[4px] font-SolaimanLipi" onClick={handlePrint}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-printer"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
                    <span className="pt-1">প্রিন্ট</span>
                </button>
            </div>
            <div className="relative overflow-x-auto hidden_in_print">
                <table className="w-full text-sm text-left text-gray-500 shadow-md sm:rounded-lg hidden_in_print">
                    <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
                        <tr>
                            <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                                {translate("No.")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                                {translate("User Code")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                                {translate("Student Name")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                                {translate("Varient")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap text-[16px] `}>
                                {translate("Type")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap text-[16px]`}>
                                {translate("Date")}
                            </th>
                            <th className={`px-3 py-3 text-nowrap  text-[16px]  w-[300px]`}>
                                {translate("Remark")}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportsResponse && reportsResponse.map((item, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50 text-black">
                                <td className="px-3 py-4 text-nowrap">{index + 1}</td>
                                <td className="px-3 py-4 text-nowrap">{item.StudentCode}</td>
                                <td className="px-3 py-4 text-nowrap">{bnBijoy2Unicode(item.StudentName)}</td>
                                <td className="px-3 py-4 text-nowrap">{bnBijoy2Unicode(item.ReportCet)}</td>
                                <td className="px-3 py-4 text-nowrap">{bnBijoy2Unicode(item.ReportType)}</td>
                                <td className="px-3 py-4 text-nowrap">{item.CreateDate}</td>
                                <td className="px-3 py-4 text-nowrap w-[300px]" style={{ whiteSpace: "normal" }}>{bnBijoy2Unicode(item.Remark)}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>
            <div ref={printRef}>
                {reportsResponse && <CharacterReport report={reportsResponse} />}
            </div>
        </div>
    );
};

export default StudentReportList;