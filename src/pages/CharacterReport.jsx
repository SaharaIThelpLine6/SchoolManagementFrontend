import React, { useCallback, useEffect, useState } from 'react';
import { setPageName } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import DefaultInput from '../components/Forms/DefaultInput';
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import { useGetStudentBySearchQuery, useGetStudentReportCetsQuery, useGetStudentReportTypeQuery, usePostStudentCharacterReportMutation } from '../features/student/studentQuerySlice';
import { fetchSingleStudentDataByStudentCode, fetchSingleStudentDataByStudentCodeAndSession, setCharacterReportEditMode, setFilteredStudent } from '../features/student/studentSlice';
import { toast } from 'react-toastify';
import LoadingComponent from '../components/LoadingComponent';
import convertBijoyToBengali from '../utils/uniconveter';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import { showModal } from '../utils/ModalControlar';
import StudentReportList from '../components/StudentReportList';

const CharacterReport = ({ pageTitle }) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { academicSession, status } = useSelector((state) => state.settings);
    const { admittedStudent, academicClassStudentError, filteredStudent, characterReportEditMode } = useSelector((state) => state.student);
    const methods = useForm()
    const { data: studentReportCet, error: studentReportCetError } = useGetStudentReportCetsQuery();
    const { data: studentReportType, error: studentReportTypeError } = useGetStudentReportTypeQuery();
    const [addCharacterStudent, { isLoading, isError, isSuccess, data: newReportResponse }] = usePostStudentCharacterReportMutation();
    const translate = useTranslate();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [userTyping, setUserTyping] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const studentCodeOrName = methods.watch("StudentCode");
    const classID = methods.watch("SubClassID");

    const { data: searchStudentInfo, error: searchStudentError, isLoading: studentInfoLoading } = useGetStudentBySearchQuery({ search: studentCodeOrName, ClassID: null, SessionID: null }, {
        skip: !userTyping,
        refetchOnFocus: false,

    });
    useEffect(() => {
        if (!academicSession.length) {
            dispatch(fetchSettingsData())
        }
        dispatch(setPageName(pageTitle))
        dispatch(setFilteredStudent(null))
        dispatch(setCharacterReportEditMode(null));
    }, [])

    useEffect(() => {
        if (Object.keys(admittedStudent) > 0) {
            dispatch(setCharacterReportEditMode(null));
            methods.reset({
                StudentName: bnBijoy2Unicode(admittedStudent.StudentName),
                FatherName: bnBijoy2Unicode(admittedStudent.FatherName),
                ClassName: bnBijoy2Unicode(admittedStudent.ClassName),
                SubClassID: admittedStudent.SubClassID,
                SessionID: admittedStudent.SessionID,
                Date: new Date(),
            });
        }
    }, [admittedStudent])

    useEffect(() => {
        if (filteredStudent) {
            setUserTyping(false);
            dispatch(setCharacterReportEditMode(null));
            methods.reset({
                StudentCode: filteredStudent.StudentCode,
                StudentName: bnBijoy2Unicode(filteredStudent.StudentName),
                FatherName: bnBijoy2Unicode(filteredStudent.FatherName),
                ClassName: bnBijoy2Unicode(filteredStudent.ClassName),
                SubClassID: filteredStudent.SubClassID,
                SessionID: filteredStudent.SessionID,
                Date: new Date(),
            });
        }
    }, [filteredStudent])

    useEffect(() => {
        if (studentCodeOrName && searchStudentInfo?.length > 0 && !searchStudentError) {
            setShowSuggestions(true);
        }
        else {
            setShowSuggestions(false);
        }
    }, [searchStudentInfo, searchStudentError]);
    useEffect(() => {
        if (status === 'succeeded' && academicSession.length > 0) {
            const today = new Date();
            methods.setValue("SessionID", academicSession[0].SessionID);
            methods.setValue("Date", today);
        }
    }, [status, academicSession]);

    useEffect(() => {
        if (academicClassStudentError) {
            methods.setValue("StudentName", "");
            methods.setValue("FatherName", "");
            methods.setValue("ClassName", "");
            methods.setValue("SubClassID", "");
            toast.error(academicClassStudentError || "Something went wrong");
        }
    }, [academicClassStudentError]);

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
            // methods.reset({
            //     Remark: '',
            // });
            setShowReport({ userCode: methods.getValues("StudentCode"), classID: methods.getValues("SubClassID"), SessionID: methods.getValues("SessionID") })
        } catch (err) {
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
    const handleSuggestionClick = (item) => {

        setUserTyping(false);
        methods.setValue("StudentCode", item.StudentCode);
        methods.setValue("StudentName", bnBijoy2Unicode(item.StudentName));
        methods.setValue("FatherName", bnBijoy2Unicode(item.FatherName));
        methods.setValue("ClassName", bnBijoy2Unicode(item.ClassName));
        methods.setValue("SubClassID", item.SubClassID);
        methods.setValue("SessionID", item.SessionID);

        dispatch(setCharacterReportEditMode(null));
        dispatch(setFilteredStudent(null));
        setShowSuggestions(false);
    };
    const handleOpenModal = useCallback((id) => {
        dispatch(setFilteredStudent(null));
        setShowSuggestions(false)
        showModal("Filter Student", "STUDENT_FILTER");
    }, []);
    if (status === 'loading') {
        return <LoadingComponent />;
    }

    return (
        <div>
            <div className=" print:p-0">
                <div className="bg-white p-2 md:p-8 rounded-xl shadow-lg print:p-0 print:shadow-none">
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className=" mx-auto print:hidden">
                            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600 uppercase font-SolaimanLipi">{translate("Character Report")}</h1>
                            <div className="grid xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                                <input {...methods.register("SubClassID", { required: "Short address is required" })} className='hidden' />

                                <div className='relative'>
                                    <div className="w-full">
                                        <label htmlFor={"StudentCode"} className="mb-1 block text-black font-SolaimanLipi">
                                            <span className="text-red-500">
                                                {translate("User Code")} * :
                                            </span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input type="text" {...methods.register("StudentCode", { required: " " })} className='w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200' onInput={() => { setUserTyping(true); dispatch(setCharacterReportEditMode(null)); }} autoComplete='false' />
                                            <button type='button' onClick={handleOpenModal} className='text-gray-500 hover:text-gray-700 transition'>
                                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-filter-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 20l-3 1v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v3" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>
                                            </button>
                                        </div>
                                    </div>



                                    {showSuggestions && (
                                        <div className='search_suggetion h-[200px] overflow-y-auto absolute bottom-[0px] translate-y-full left-0 w-full bg-white shadow-lg z-30'>
                                            {searchStudentInfo.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className='p-2 hover:bg-blue-100 cursor-pointer'
                                                    onClick={() => handleSuggestionClick(item)}
                                                >
                                                    {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)} - {bnBijoy2Unicode(item.SubClass)}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                                <DefaultSelect label={<span className="text-red-500">
                                    {translate("Session")} * :
                                </span>} nameField={"SessionName"} registerKey={"SessionID"} valueField={"SessionID"} options={academicSession} type={"number"} require={"This Field is require"} disabled={false} defaultSelect={false} unicode={true} />
                                <DefaultInput registerKey={"StudentName"} label={`${translate("Student Name")}: `} disable={true} />
                                <DefaultInput registerKey={"FatherName"} label={`${translate("Father Name")}:`} disable={true} />
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

                            <div className="flex">
                                <button
                                    type="submit"
                                    className=" lg:inline-block text-center bg-blue-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
                                >
                                    Submit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReport({ userCode: methods.getValues("StudentCode"), classID: methods.getValues("SubClassID"), SessionID: methods.getValues("SessionID") });
                                    }}
                                    className="lg:inline-block text-center bg-blue-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base ml-4"
                                >
                                    View Report
                                </button>
                            </div>
                        </form>
                    </FormProvider>

                    <StudentReportList reportParams={showReport} />
                    

                </div>
            </div>

        </div>
    );
};

export default CharacterReport;