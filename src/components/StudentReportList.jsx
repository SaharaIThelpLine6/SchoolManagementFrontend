import React, { useEffect, useRef, useState } from 'react';
import { setPageName } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, set, useForm, useFormContext } from 'react-hook-form';
import DefaultSelect from './Forms/DefaultSelect';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import DefaultInput from './Forms/DefaultInput';
import { useGetStudentBySearchQuery, useGetStudentReportCetsQuery, useGetStudentReportsQuery, useGetStudentReportTypeQuery, usePostStudentCharacterReportMutation } from '../features/student/studentQuerySlice';
import { fetchSingleStudentDataByStudentCode, setCharacterReportEditMode } from '../features/student/studentSlice';
import { toast } from 'react-toastify';
import SortableTable from './Tables/SortableTable';
import convertBijoyToBengali from '../utils/uniconveter';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import CharacterReport from './Document/characterReport';

const StudentReportList = ({ reportParams  }) => {
   const dispatch = useDispatch();
    const { academicSession } = useSelector((state) => state.settings);
    const { setValue } = useFormContext();

    const { data: studentReportCet, error: studentReportCetError } = useGetStudentReportCetsQuery();
    const { data: studentReportType, error: studentReportTypeError } = useGetStudentReportTypeQuery();

    // const [studentReports, { isLoading, isError, isSuccess, data: reportsResponse }] = useGetStudentReportsMutation();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userTyping, setUserTyping] = useState(true);
    const translate = useTranslate();
    const printRef = useRef();

    // useEffect(() => {
    //     const fetchReports = async () => {
    //         if (reportParams?.userCode) {
    //             const toastId = toast.loading('Fetching student report...');
    //             try {
    //                 await studentReports({
    //                     StudentCode: reportParams.userCode,
    //                     SubClassID: reportParams.classID || undefined,
    //                     SessionID: reportParams.SessionID || undefined,
    //                 }).unwrap();

    //                 toast.update(toastId, {
    //                     render: 'Student report fetched successfully!',
    //                     type: 'success',
    //                     isLoading: false,
    //                     autoClose: 3000,
    //                     closeOnClick: true
    //                 });

    //             } catch (err) {
    //                 toast.update(toastId, {
    //                     render: err?.data?.message || 'Failed to fetch report!',
    //                     type: 'error',
    //                     isLoading: false,
    //                     autoClose: 3000,
    //                     closeOnClick: true
    //                 });
    //                 console.error('Error fetching student reports:', err);
    //             }
    //         }
    //     };

    //     fetchReports();
    // }, [reportParams]);

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
                            {/* <th className={`px-3 py-3 text-nowrap  text-[16px]`}>
                                {translate("Actions")}
                            </th> */}
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
                                {/* <td>
                                    <button type='button' className="text-blue-500 hover:text-blue-700" onClick={()=>{
                                        dispatch(setCharacterReportEditMode(item));
                                    }}>
                                        <svg  xmlns="http://www.w3.org/2000/svg"  width={24}  height={24}  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth={2}  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-edit"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" /><path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" /><path d="M16 5l3 3" /></svg>
                                    </button>
                                </td> */}
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