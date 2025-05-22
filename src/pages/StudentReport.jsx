import React, { useEffect } from 'react';
import { setPageName } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import DefaultInput from '../components/Forms/DefaultInput';
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import { useGetStudentBySearchQuery, useGetStudentReportCetsQuery, useGetStudentReportTypeQuery, usePostStudentCharacterReportMutation } from '../features/student/studentQuerySlice';
import { fetchSingleStudentDataByStudentCode } from '../features/student/studentSlice';
import { toast } from 'react-toastify';
import LoadingComponent from '../components/LoadingComponent';
import convertBijoyToBengali from '../utils/uniconveter';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';

const StudentReport = ({ pageTitle }) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { academicSession, status } = useSelector((state) => state.settings);
    const { admittedStudent } = useSelector((state) => state.student);
    const methods = useForm()
    const { data: studentReportCet, error: studentReportCetError } = useGetStudentReportCetsQuery();
    const { data: studentReportType, error: studentReportTypeError } = useGetStudentReportTypeQuery();
    const [addCharacterStudent, { isLoading, isError, isSuccess, data: newReportResponse }] = usePostStudentCharacterReportMutation();
    const translate = useTranslate();
    useEffect(() => {
        if (!academicSession.length) {
            dispatch(fetchSettingsData())
        }
        dispatch(setPageName(pageTitle))
    }, [])

    useEffect(() => {
        if (admittedStudent) {

            methods.reset({
                StudentName: bnBijoy2Unicode(admittedStudent.StudentName),
                FatherName: bnBijoy2Unicode(admittedStudent.FatherName),
                Mobile1: admittedStudent.Mobile1,
                ClassName: bnBijoy2Unicode(admittedStudent.ClassName),
                SubClassID: admittedStudent.SubClassID,
            });
        }
    }, [admittedStudent])

    const onSubmit = async (data) => {
        const toastId = toast.loading('Submitting...');

        try {
            const convertedData = Object.fromEntries(
                Object.entries(data).map(([key, value]) =>
                    typeof value === "string" ? [key, convertBijoyToBengali(value)] : [key, value]
                )
            );
            const response = await addCharacterStudent(convertedData).unwrap();
            toast.update(toastId, {
                render: 'Submitted successfully!',
                type: 'success',
                isLoading: false,
                autoClose: 3000,
                closeOnClick: true
            });

            methods.reset();
            methods.reset({
                StudentCode: '',
                StudentName: '',
                FatherName: '',
                Mobile1: '',
                ClassName: '',
                SubClassID: ''
            });
        } catch (err) {
            console.log(err);
            
            toast.update(toastId, {
                render: err?.data?.error || 'Submission failed!',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
                closeOnClick: true
            });
            console.error('Error submitting data:', err);
        }
    };

    const studentCodeOrName = methods.watch("StudentCode");
    const { data, error, isLoading: studentInfoLoading } = useGetStudentBySearchQuery(studentCodeOrName, {
        skip: !studentCodeOrName,
    });

    const handleUserCode = () => {
        const studentCode = methods.getValues("StudentCode");
        if (studentCode) {
            dispatch(fetchSingleStudentDataByStudentCode(studentCode));
        }
    };
    if (status === 'succeeded') {
        if (academicSession.length > 0) {
            const today = new Date();
            methods.setValue("SessionID", academicSession[0].SessionID);
            methods.setValue("Date", today);
        }
    }
    if (status === 'loading') {
        return <LoadingComponent />;
    }



    return (
        <div>
            <div className="lg:py-8 lg:px-6">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className=" mx-auto bg-white p-6 md:p-8 rounded-xl shadow-lg ">
                        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600 uppercase font-SolaimanLipi">{translate("Character Report")}</h1>

                        {/* Institution Name */}

                        {/* Address Section */}
                        <div className="grid xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                            <input {...methods.register("SubClassID", { required: "Short address is required" })} className='hidden' />
                            <div className='relative'>
                                <DefaultInput registerKey={"StudentCode"} require={" "} type={"text"} placeholder={"EX: 1001"} label={<span className="text-red-500">
                                    {translate("User Code")} * :
                                </span>} disable={false} />

                                <button type='button' onClick={handleUserCode} className='absolute bottom-[8px] right-[4px] text-[#999]'><svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg></button>

                            </div>
                            <DefaultSelect label={<span className="text-red-500">
                                {translate("Session")} * :
                            </span>} nameField={"SessionName"} registerKey={"SessionID"} valueField={"SessionID"} options={academicSession} type={"number"} require={"This Field is require"} disabled={false} defaultSelect={false} unicode={true} />
                            <DefaultInput registerKey={"StudentName"} label={`${translate("Student Name")}: `} disable={true} />
                            <DefaultInput registerKey={"FatherName"} label={`${translate("Father Name")}:`} disable={true} />
                            <DefaultInput registerKey={"Mobile1"} label={`${translate("Mobile")}:`} disable={true} />
                            <DefaultInput registerKey={"ClassName"} label={`${translate("Class")}:`} disable={true} />
                            <DatePickerOne dateCalender={`${translate("Date")}: `} placeholder={""} registerKey={"Date"} require={"Date Require"} />
                            <DefaultSelect label={`${translate("Varient")}:`} nameField={"ReportCetName"} registerKey={"ReportCetID"} valueField={"ReportCetID"} options={studentReportCet} type={"number"} require={"This Field is require"} disabled={false} defaultSelect={false} unicode={true} />
                            <DefaultSelect label={`${translate("Type")}:`} nameField={"ReportTypeName"} registerKey={"ReportTypID"} valueField={"ReportTypID"} options={studentReportType} type={"number"} require={"This Field is require"} disabled={false} defaultSelect={false} unicode={true} />

                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 mb-6">
                            <div>
                                <label className="block text-[16px] font-400 font-normal text-gray-700 mb-1 md:mb-2 font-SolaimanLipi">
                                    {translate("Remark")}:
                                </label>
                                <textarea
                                    {...methods.register("Remark", { required: "Short address is required" })}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                />
                                {errors.shortAddress && (
                                    <span className="text-red-500 text-sm mt-1 block">{errors.shortAddress.message}</span>
                                )}
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="mx-auto block lg:inline-block text-center bg-blue-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
                        >
                            Submit
                        </button>
                    </form>
                </FormProvider>
            </div>


        </div>
    );
};

export default StudentReport;