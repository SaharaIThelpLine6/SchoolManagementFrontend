import React, { useEffect, useState } from 'react';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultInput from '../components/Forms/DefaultInput';
import FeeCollectionForm from '../components/Forms/FeeCollectionForm';
import { useDispatch, useSelector } from 'react-redux';
import useTranslate from '../utils/Translate';
import UserOne from '../images/user/checking.jpeg'
import { useAddFeeMutation, useGetDueFeeQuery, useGetFeeByIdQuery, useGetFeeQuery, useGetFeesQuery, useGetPaymentTypeQuery, useGetSubLedgerQuery } from '../features/feeCollection/feeCollectionSlice';
import { useNavigate } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import LoadingComponent from '../components/LoadingComponent';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import { fetchSingleStudentData, fetchSingleStudentDataByStudentCode } from '../features/student/studentSlice';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import SortableTable from '../components/Tables/SortableTable';
import toBengaliWords from '../utils/numberToBanglaWords';
import { useGetMonthListQuery } from '../features/month/monthSlice';

const StudentFeeSetup = () => {
    const dispatch = useDispatch()
    const translate = useTranslate()
    const { singleStudent, admittedStudent } = useSelector((state) => state.student);
    const { studentFinancialStatus, academicSession } = useSelector((state) => state.settings);
    const { data: fees, error: feesError, isLoading: feesLoading } = useGetFeesQuery();
    const { data: paymentType, error: paymentError, isLoading: paymentLoading } = useGetPaymentTypeQuery();
    const [addFee, { isLoading, isError, isSuccess }] = useAddFeeMutation();
    const [userId, setUserID] = useState(23)
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useFormContext();

    const [StudentCode, GLID, SFGNID, SessionID, CreateAt, invoiceId, MonthID] = watch(["StudentCode", "GLID", "SFGNID", "SessionID", "CreateAt", "invoiceId", "MonthID"]);

    useEffect(() => {
        if (!studentFinancialStatus.length || !academicSession.length) {
            dispatch(fetchSettingsData())
        }

    }, [dispatch])
    const handleBlur = () => {
        if (admittedStudent?.UserCode !== StudentCode) {
            console.log("======user==========");
            dispatch(fetchSingleStudentDataByStudentCode(StudentCode));
        }
    };
    // useEffect(() => {
    //     if (admittedStudent?.UserCode != StudentCode) {
    //         console.log("======user==========");
    //         dispatch(fetchSingleStudentDataByStudentCode(StudentCode))
    //     }
    // }, [StudentCode])

    useEffect(() => {
        if (fees) {
            reset({ invoiceId: fees.length + 1, SFGNID: 1, SessionID: '' });
        }
    }, [fees, reset]);

    const { data: subLedger, error: subLedgerError } = useGetSubLedgerQuery(GLID, {
        skip: !GLID,
    });
    const [subladger, setSubLadger] = useState([]);
    // const { data: feeData, error: feeError } = useGetFeeQuery(
    //     { sessionID: SessionID, classID: singleStudent?.ClassID, SFGNID },
    //     {
    //         skip: !SessionID || !singleStudent?.ClassID || !SFGNID || singleStudent?.UserID !== userId
    //     }
    // );
    // console.log(StudentCode, SessionID, SFGNID);
    const shouldFetch = Boolean(StudentCode && SessionID && SFGNID);

    const { data: feeData, error: feeError } = useGetFeeByIdQuery(
        { studentCode: StudentCode, sessionID: SessionID, SFGNID, monthID: MonthID || 0 },
        { skip: !shouldFetch }
    );

    const shouldMonthFetch = Boolean(SessionID && SFGNID === 2 && admittedStudent?.ClassID);

    const { data: feeMonthData, error: feeMonthError } = useGetMonthListQuery(
        `SessionID=${SessionID}&ClassID=${admittedStudent?.ClassID}`,
        { skip: !shouldMonthFetch }
    );
    // console.log(feeMonthData);

    useEffect(() => {
        if (feeData) {
            const subLadgerIds = feeData.map(row => row.SLID);
            setSubLadger(subLadgerIds);
        }
    }, [feeData]);
    const shouldFetchDueData = Boolean(SessionID && admittedStudent?.ClassID && SFGNID && admittedStudent?.AdmissionID && (SFGNID !== 1 ? MonthID : true));


    const { data: feeDueData, error: feedueError } = useGetDueFeeQuery(
        { sessionID: SessionID, classID: admittedStudent?.ClassID, SFGNID, AdmissionID: admittedStudent?.AdmissionID, monthID: MonthID},
        { skip: !shouldFetchDueData }
        // {
        //     skip: !SessionID || !admittedStudent?.ClassID || !SFGNID || admittedStudent?.UserID !== userId || !admittedStudent?.AdmissionID
        // }
    );
    // console.log(SessionID, admittedStudent?.ClassID, SFGNID, admittedStudent?.UserID, admittedStudent?.AdmissionID);
    // console.log(feeDueData);
    useEffect(() => {
        console.log("Updated SessionID:", SessionID);
    }, [SessionID]);

    const [errorShown, setErrorShown] = useState(false);

    useEffect(() => {
        if (feeError && !errorShown) {
            console.log(feeError.status);
            if (feeError?.status !== 404) {
                alert(feeError.data?.error || "An error occurred");
            }
            else {
                if (SFGNID == 1) {
                    // navigate("/setup_asmissionfee")
                }
            }
            setErrorShown(true);



        }
    }, [feeError, errorShown]);


    if (feeData && feeData.length) {
        const entryKeys = feeData.map((row) => `entry_${row.SLID}`);
        const watchedEntries = watch(entryKeys);
        const subtotal = watchedEntries.reduce((acc, curr) => acc + (+curr || 0), 0);
        if (subtotal) {
            const takaBangla = `${toBengaliWords(subtotal)} টাকা। `
            setValue("AmountInWord", takaBangla)
        }

    }

    const feeType = [
        {
            SFGNID: 1,
            SFGName: "Admission"
        },
        {
            SFGNID: 2,
            SFGName: "Monthly"
        },
        {
            SFGNID: 3,
            SFGName: "Others"
        },
    ]
    const genderMap = {
        1: "Male",
        2: "Female",
        3: "Other"
    };
    const ResidentialStatusMap = {
        1: "Aba",
        2: "Ona",
        3: "Day",
    }
    console.log(admittedStudent);

    const AdmissionType = { 1: "New", 2: "Old" }
    const [feeDueState, setFeeDueState] = useState(0);
    const columnForFee = [
        { title: "Fee Name", field: "SlName" },
        { title: "Fee Amount", field: `${genderMap[admittedStudent?.GenderID]}${ResidentialStatusMap[admittedStudent?.ResidentialStatusId]}${AdmissionType[admittedStudent?.NewOldId]}` },
        {
            title: "Past Discount", render: (row) => {
                if (!feeDueData) {
                    return <p>0</p>
                }
                const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
                return <p>{dueEntry ? dueEntry.PreviousDeposite - dueEntry.ABC : 0}</p>;

            }
        },
        {
            title: "Subtract", field: "UserID", render: (row) => {
                return <DefaultInput registerKey={`InvoiceDiscount_${row.SLID}`} type={"number"} />
            }
        },
        {
            title: "Past Entry",
            render: (row) => {
                if (!feeDueData) {
                    return <p>0</p>
                }
                if (!Array.isArray(feeDueData) || feeDueData.length === 0 || !feeDueData) return <p>0</p>;

                const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
                return <p>{dueEntry ? dueEntry.ABC : 0}</p>;
            }
        },
        { title: "Main Entry", field: "UserID", render: (row) => { return <DefaultInput registerKey={`entry_${row.SLID}`} type={"number"} /> } },
        {
            title: "Receivable",
            render: (row) => {
                if (!feeDueData) {
                    return <p>0</p>;
                }

                const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
                console.log(dueEntry);

                const subtractRegisterKey = `InvoiceDiscount_${row.SLID}`;
                const entryRegisterKey = `entry_${row.SLID}`;
                const subtractValue = watch(subtractRegisterKey) || 0;
                const entryValue = watch(entryRegisterKey) || 0;
                const receivableValue = dueEntry
                    ? dueEntry.Fee - dueEntry.PreviousDeposite - Number(subtractValue) - Number(entryValue)
                    : row[`${genderMap[admittedStudent?.GenderID]}${ResidentialStatusMap[admittedStudent?.ResidentialStatusId]}${AdmissionType[admittedStudent?.NewOldId]}`] - Number(subtractValue) - Number(entryValue);

                return <p>{receivableValue}</p>;
            }
        }
    ]
    const columnForRecord = [
        { title: "Entry Date", field: "UserID" },
        { title: "Insert By", field: "UserID" },
        { title: "Student Class", field: "UserID" },
        { title: "Student Session", field: "UserID" },
        { title: "Action", field: "UserID" },
    ]
    const onSubmit = async (data) => {
        const isConfirmed = window.confirm("Are you sure you want to submit the form?");

        const submitableData = { ...data, SLID: subladger, UserID: admittedStudent.UserID }
        if (submitableData.SFGNID == 1) {
            submitableData.MonthID = 0
        }
        else {
            submitableData.MonthID = MonthID
        }
        if (isConfirmed) {
            // await addFee(submitableData).unwrap()
            console.log("Form submitted:", submitableData);
        } else {
            console.log("Form submission canceled.");
        }
    };



    if (feesLoading || paymentLoading) return <LoadingComponent />;
    if (feesError || paymentError) return <p>Error loading data.</p>;


    return (
        <div>
            <div className="text-[14px]">

            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi pt-4 px-4 flex gap-4">
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 text-[13px] font-SolaimanLipi w-1/2 h-fit'>
                    <DefaultInput registerKey={"invoiceId"} require={"Student Name is require"} type={"text"} label={"Payment Reference No:"} disable={true} />
                    <div className="w-full">
                        <label htmlFor={"StudentCode"} className="mb-1 block text-black font-SolaimanLipi">
                            Student Id:
                        </label>

                        <input
                            type="number"
                            placeholder={"Student Id:"}
                            className={`w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-2 h-[30px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200 ${errors["StudentCode"] ? 'placeholder:text-red-400 border-red-400' : ''}`}
                            {...register("StudentCode")}
                            onBlur={handleBlur}
                        />

                        {errors["StudentCode"] && <p className="text-red-500 text-sm mt-1">{errors["StudentCode"].message}</p>}
                    </div>
                    {/* <DefaultInput registerKey={"StudentCode"} require={"Student Id is require"} type={"text"} label={"Student Id:"} /> */}


                    <DefaultSelect label={"Fee Type"} nameField={"SFGName"} registerKey={"SFGNID"} valueField={"SFGNID"} options={feeType} type={"number"} require={"This Field is require"} />



                    {/* <DefaultInput registerKey={"recept"} require={"Recept Number is require"} type={"text"} label={"Recept No:"} disable={true} /> */}

                    <DefaultSelect label={"Session"} nameField={"SessionName"} registerKey={"SessionID"} valueField={"SessionID"} options={academicSession} require={"This Field is require"} disabled={false} />
                    {
                        feeMonthData && feeMonthData.length > 0 ? (<DefaultSelect label={"Month"} nameField={"MonthName"} registerKey={"MonthID"} valueField={"MonthID"} options={feeMonthData} type={"number"} require={"This Field is require"} />) : null
                    }
                    
                    <DefaultSelect label={"Payment Type"} nameField={"GlName"} registerKey={"GLID"} valueField={"GLID"} options={paymentType} type={"number"} require={"This Field is require"} />

                    <DefaultSelect label={"Account"} nameField={"SlName"} registerKey={"cashier"} valueField={"SLID"} options={subLedger} type={"number"} require={"This Field is require"} />

                    <DatePickerOne registerKey={"CreateAt"} dateCalender={"Entry Date"} require={"Entry Date is require"} placeholder={"Entry Date"} disable={false} />

                    {/* <DefaultInput registerKey={"recept"} require={"Recept Number is require"} type={"text"} label={"Account"} disable={true} /> */}
                </div>
                {
                    !feeError && feeData && feeData.length > 0 ? (
                        <div className='w-1/2'>
                            <div className='block mt-4 input-table'>
                                <SortableTable columns={columnForFee} data={feeData} isFilterColumn={false} />
                            </div>
                            <div className="flex justify-between gap-4 py-3">
                                {/* <div className='text-[14px] mt-2'>
                                    <p className=''>Print Invoice</p>
                                    <div className='mt-1'>
                                        <SwitcherThree />
                                    </div>
                                </div> */}
                                <DefaultInput registerKey={"AmountInWord"} type={"text"} placeholder={"In Words"} />
                                <DefaultInput registerKey={"Remark"} type={"text"} placeholder={"Remark"} />


                            </div>
                            <div className="text-center">
                                <button type="submit" disabled={isLoading} className="bg-blue-500 inline-block text-white p-2 rounded">
                                    {isLoading ? "Submitting..." : translate("Save")}
                                </button>
                                {isSuccess && <p className="text-green-500">Fee added successfully!</p>}
                                {isError && <p className="text-red-500">Error adding fee.</p>}
                                {/* <button type="submit" className="rounded-md inline-flex items-center bg-theme-color text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush text-center mt-0">{translate("Save")}</button> */}
                            </div>

                        </div>
                    ) : null
                }

                {/* <DefaultInput registerKey={"FatherName"} require={"Father Name is require"} type={"text"} label={"Father Name"} disable={true} />
                    <DefaultInput registerKey={"Mobile1"} require={"Mobile is require"} type={"text"} label={"Mobile"} disable={true} /> */}
                {/* <DatePickerOne registerKey={"CreateAt"} dateCalender={"Entry Date"} require={"Entry Date is require"} disable={true} /> */}


            </form>

            {/* <div className='block mt-4 input-table'>
                <SortableTable columns={columnForRecord} data={columnData} />
            </div> */}
        </div>

    );
};

export default StudentFeeSetup;