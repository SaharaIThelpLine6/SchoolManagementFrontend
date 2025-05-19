import React, { useEffect } from 'react';
import { setPageName } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import DefaultInput from '../components/Forms/DefaultInput';
import { useGetStudentReportCetsQuery, useGetStudentReportsMutation, useGetStudentReportTypeQuery, usePostStudentCharacterReportMutation } from '../features/student/studentQuerySlice';
import { fetchSingleStudentDataByStudentCode } from '../features/student/studentSlice';
import { toast } from 'react-toastify';
import SortableTable from '../components/Tables/SortableTable';

const StudentReportList = ({ pageTitle }) => {
    const dispatch = useDispatch();
    const { academicSession } = useSelector((state) => state.settings);
    const methods = useForm()
    const { data: studentReportCet, error: studentReportCetError } = useGetStudentReportCetsQuery();
    const { data: studentReportType, error: studentReportTypeError } = useGetStudentReportTypeQuery();
    const [studentReports, { isLoading, isError, isSuccess, data: reportsResponse }] = useGetStudentReportsMutation();
    useEffect(() => {
        if (!academicSession.length) {
            dispatch(fetchSettingsData())
        }
        dispatch(setPageName(pageTitle))
    }, [])

    const onSubmit = async (data) => {

        const studentCode = methods.getValues("filterStudentCode");
        const toastId = toast.loading('Fetching data...');
        if (studentCode) {
            try {

                const response = await studentReports(studentCode).unwrap();
                console.log(response);

                toast.update(toastId, {
                    render: 'Submitted successfully!',
                    type: 'success',
                    isLoading: false,
                    autoClose: 3000,
                    closeOnClick: true
                });

            } catch (err) {
                toast.update(toastId, {
                    render: err?.data?.message || 'Submission failed!',
                    type: 'error',
                    isLoading: false,
                    autoClose: 3000,
                    closeOnClick: true
                });
                console.error('Error submitting data:', err);
            }
        }
    };

    if (reportsResponse && reportsResponse.length > 0) {

    }




    return (
        <div>
            <div className="py-8 px-6">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="mx-auto">
                        <div className='relative max-w-[400px]'>
                            <DefaultInput registerKey={"filterStudentCode"} require={"Student code is require"} type={"text"} label={"User Code:"} disable={false} />
                            <button type='submit' className='absolute bottom-[8px] right-[4px] text-[#999]'><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg></button>
                        </div>
                    </form>
                </FormProvider>
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-theme-dark font-SolaimanLipi uppercase bg-gray-50">
                        <tr>
                            <th className={`px-3 py-3 text-nowrap`}>
                                No.
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Code
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Student Name
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Category
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Type
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Date
                            </th>
                            <th className={`px-3 py-3 text-nowrap`}>
                                Remark
                            </th>
                            

                           
                        </tr>
                      

                    </thead>
                    <tbody>

                        {reportsResponse && reportsResponse.map((item, index) => (
                            <tr key={index} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-3 py-4 text-nowrap">{index + 1}</td>
                                <td className="px-3 py-4 text-nowrap">{item.StudentCode}</td>
                                <td className="px-3 py-4 text-nowrap">{item.StudentName}</td>
                                <td className="px-3 py-4 text-nowrap">{item.ReportCet}</td>
                                <td className="px-3 py-4 text-nowrap">{item.ReportType}</td>
                                <td className="px-3 py-4 text-nowrap">{item.dataValues.CreateDate}</td>
                                <td className="px-3 py-4 text-nowrap w-[200px] whitespace-pre-wrap">{item.dataValues.Remark}</td>

                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

           
        </div>
    );
};

export default StudentReportList;