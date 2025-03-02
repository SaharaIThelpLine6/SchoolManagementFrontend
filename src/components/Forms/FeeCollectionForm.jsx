import React, { useEffect, useState } from 'react';
import DefaultInput from './DefaultInput';
import DatePickerOne from './DatePicker/DatePickerOne';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import UserOne from '../../images/user/checking.jpeg'
import DefaultSelect from './DefaultSelect';
import SwitcherThree from '../Switchers/SwitcherThree';
import useTranslate from '../../utils/Translate';
import SortableTable from '../Tables/SortableTable';
import { fetchSingleUser } from '../../features/userInfo/userInfoSlice';
import { fetchSingleStudentData } from '../../features/student/studentSlice';
import LoadingComponent from '../LoadingComponent';
import { fetchSettingsData } from '../../features/settings/settingsSlice';
import { useAddFeeMutation, useGetDueFeeQuery, useGetFeeQuery, useGetFeesQuery, useGetPaymentTypeQuery, useGetSubLedgerQuery } from '../../features/feeCollection/feeCollectionSlice';
const FeeCollectionForm = ({ userId }) => {
    const dispatch = useDispatch()
    const translate = useTranslate()
    const { singleStudent } = useSelector((state) => state.student);
    const { studentFinancialStatus, academicSession } = useSelector((state) => state.settings);
    const { data: fees, error: feesError, isLoading: feesLoading } = useGetFeesQuery();
    const { data: paymentType, error: paymentError, isLoading: paymentLoading } = useGetPaymentTypeQuery();
    const [addFee, { isLoading, isError, isSuccess }] = useAddFeeMutation();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        control,
        formState: { errors },
    } = useFormContext();
    //     useEffect(()=>{
    // reset({"SFGNID": 1})
    //     }, [])

    useEffect(() => {
        if (!studentFinancialStatus.length || !academicSession.length) {
            dispatch(fetchSettingsData())
        }
        if (singleStudent?.UserID != userId) {
            dispatch(fetchSingleStudentData(userId))
        }
        // if (!academicSession.length) {
        //     dispatch(fetchSettingsData())
        // }
        // if (!classList.length) {
        //     dispatch(fetchClassData())
        // }
    }, [dispatch])

    useEffect(() => {
        if (fees) {
            reset({ invoiceId: fees.length + 1, SFGNID: 1, SessionID: '' });
        }
    }, [fees, reset]);

    const { GLID, SFGNID, SessionID, CreateAt, invoiceId } = watch();

    const { data: subLedger, error: subLedgerError } = useGetSubLedgerQuery(GLID, {
        skip: !GLID,
    });
    const { data: feeData, error: feeError } = useGetFeeQuery(
        { sessionID: SessionID, classID: singleStudent?.ClassID, SFGNID },
        {
            skip: !SessionID || !singleStudent?.ClassID || !SFGNID || singleStudent?.UserID !== userId
        }
    );
    const [subladger, setSubLadger] = useState([]);

    useEffect(() => {
        if (feeData) {
            const subLadgerIds = feeData.map(row => row.SLID);
            setSubLadger(subLadgerIds);
        }
    }, [feeData]);

    
    const { data: feeDueData, error: feedueError } = useGetDueFeeQuery(
        { sessionID: SessionID, classID: singleStudent?.ClassID, SFGNID, AdmissionID: singleStudent?.AdmissionID },
        {
            skip: !SessionID || !singleStudent?.ClassID || !SFGNID || singleStudent?.UserID !== userId || !singleStudent?.AdmissionID
        }
    );

    const [errorShown, setErrorShown] = useState(false);

    useEffect(() => {
        if (feeError && !errorShown) {
            alert(feeError.data?.error || "An error occurred");
            setErrorShown(true);
        }
    }, [feeError, errorShown]);
    // if(feeError){
    //     console.log(feeError);
    //     alert(feeError.data?.error)
    // }

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
    const AdmissionType = { 1: "New", 2: "Old" }
    const [feeDueState, setFeeDueState] = useState(0);
    // useEffect(() => {
    //     if (feeDueData) {
    //         setFeeDueState(feeDueData);
    //     }
    // }, [feeDueData]);
    const columnForFee = [
        { title: "Fee Name", field: "SlName" },
        { title: "Fee Amount", field: `${genderMap[singleStudent?.GenderID]}${ResidentialStatusMap[singleStudent?.ResidentialStatusId]}${AdmissionType[singleStudent?.NewOldId]}` },
        {
            title: "Past Discount", render: (row) => {
                if (!feeDueData) {
                    return <p>0</p>
                }
                const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
                return <p>{dueEntry ? dueEntry.PreviousDeposite - dueEntry.ABC : 0}</p>;

            }
        },
        { title: "Subtract", field: "UserID", render: (row) => {
            return <DefaultInput registerKey={`InvoiceDiscount_${row.SLID}`} type={"number"} /> } },
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
        // {
        //     title: "Receivable", render: (row) => {
        //         if(!feeDueData){
        //             return <p>0</p>
        //         }
        //         const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
        //         return <p>{dueEntry ? dueEntry.Fee - dueEntry.PreviousDeposite : JSON.stringify(row[`${genderMap[singleStudent?.GenderID]}${ResidentialStatusMap[singleStudent?.ResidentialStatusId]}${AdmissionType[singleStudent?.NewOldId]}`])}</p>;
        //     }
        // },
        {
            title: "Receivable",
            render: (row) => {
                if (!feeDueData) {
                    return <p>0</p>;
                }

                const dueEntry = feeDueData.find((due) => due?.SLID === row?.SLID);
                const subtractRegisterKey = `subtract_${row.SLID}`;
                const entryRegisterKey = `entry_${row.SLID}`;
                const subtractValue = watch(subtractRegisterKey) || 0;
                const entryValue = watch(entryRegisterKey) || 0;
                const receivableValue = dueEntry
                    ? dueEntry.Fee - dueEntry.PreviousDeposite - Number(subtractValue) - Number(entryValue)
                    : row[`${genderMap[singleStudent?.GenderID]}${ResidentialStatusMap[singleStudent?.ResidentialStatusId]}${AdmissionType[singleStudent?.NewOldId]}`] - Number(subtractValue) - Number(entryValue);

                return <p>{receivableValue}</p>;
            }
        }


    ]

    // const columnData = ]

    const columnForRecord = [
        { title: "Entry Date", field: "UserID" },
        { title: "Insert By", field: "UserID" },
        { title: "Student Class", field: "UserID" },
        { title: "Student Session", field: "UserID" },
        { title: "Action", field: "UserID" },
    ]
    const onSubmit = async (data) => {
        const isConfirmed = window.confirm("Are you sure you want to submit the form?");
        const submitableData = { ...data, SLID: subladger, UserID: singleStudent.UserID }
        if (isConfirmed) {
            await addFee(submitableData).unwrap()
            // User clicked "Yes" or "OK"
            console.log("Form submitted:", submitableData);
            // Add your form submission logic here
        } else {
            // User clicked "No" or "Cancel"
            console.log("Form submission canceled.");
        }
    };
    // if (singleStudent?.UserID !== userId || isLoading || error) {
    //     return <LoadingComponent />
    // }

    // if (isLoading){
    //     console.log("Loading...");
    // };

    // if (error){
    //     console.log("Error...");

    // };


    if (feesLoading || paymentLoading) return <LoadingComponent />;
    if (feesError || paymentError) return <p>Error loading data.</p>;


    return (
        <div>
            <div className="text-[14px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 bg-[#f8fafc] p-3 rounded-[5px] font-SolaimanLipi">
                    <div className='flex items-center gap-2'>
                        <div className="image h-8 w-8 rounded-[5px] overflow-hidden">
                            <img src={UserOne} alt="stiudent" className='object-cover h-full w-full' />
                        </div>
                        <div className='name text-black'>
                            <h3>{singleStudent?.StudentName}</h3>
                            <h4 className='text-[13px]'>{singleStudent?.ClassName}, {singleStudent?.SubClass}</h4>
                        </div>


                    </div>
                    <div>
                        <h3 className='text-black text-[14px] '> <span className='text-[#6a7287]'>{translate("Father Name")}:</span> {singleStudent?.FatherName}</h3>
                        <h3 className='text-black text-[14px]'><span className='text-[#6a7287]'>{translate("Mobile")}:</span> {singleStudent?.Mobile1}</h3>
                    </div>
                    <div>
                        <h3 className='text-black text-[14px] '><span className='text-[#6a7287]'>{translate("Entry Date")}:</span> {new Date(singleStudent.CreateAt).toLocaleDateString('en-GB')}</h3>
                        <h3 className='text-black text-[14px] '><span className='text-[#6a7287]'>{translate("Financial Condition")}:</span> {singleStudent.SFTID}</h3>
                    </div>
                    <div>
                        <h3 className='text-black text-[14px]'><span className='text-[#6a7287]'>{translate("Student Condition")}:</span> </h3>
                        {
                            singleStudent?.AdmissionStatus === 0 ? (
                                <h3 className="text-warning text-[14px] pl-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                    </svg>
                                    Pending
                                </h3>
                            ) : singleStudent?.AdmissionStatus === 1 ? (
                                <h3 className="text-success text-[14px] pl-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                    </svg>
                                    Paid
                                </h3>
                            ) : singleStudent?.AdmissionStatus === 2 ? (
                                <h3 className="text-info text-[14px] pl-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                    </svg>
                                    Free
                                </h3>
                            ) : singleStudent?.AdmissionStatus === 3 ? (
                                <h3 className="text-danger text-[14px] pl-1 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                    </svg>
                                    Unpaid
                                </h3>
                            ) : null
                        }


                        {/* <h3 className='text-warning text-[14px] pl-1 flex items-center gap-1'>
                            <svg xmlns="http://www.w3.org/2000/svg" width={10} height={10} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-circle"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>
                            Pending
                        </h3> */}
                    </div>


                </div>
            </div>
            {/* <div className="flex items-center justify-center gap-4 p-3 rounded-[5px] ">
                <button
                    type="button"
                    class="text-white bg-gradient-to-r from-blue-500 to-gray-700 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-lime-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 transition-all duration-300 ease-linear"
                >
                    Free Admission
                </button>

                <button type="button" className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Take Payment</button>

            </div> */}
            <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi pt-4">
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 text-[13px] font-SolaimanLipi'>
                    <DefaultInput registerKey={"invoiceId"} require={"Student Name is require"} type={"text"} label={"Payment Reference No:"} disable={true} />
                    {/* <DefaultInput registerKey={"SFGNID"} require={"Payment Type is require"} type={"text"} label={"Payment Type No:"} disable={true} /> */}


                    <DefaultSelect label={"Fee Type"} nameField={"SFGName"} registerKey={"SFGNID"} valueField={"SFGNID"} options={feeType} type={"number"} require={"This Field is require"} disabled={false} />



                    {/* <DefaultInput registerKey={"recept"} require={"Recept Number is require"} type={"text"} label={"Recept No:"} disable={true} /> */}

                    <DefaultSelect label={"Session"} nameField={"SessionName"} registerKey={"SessionID"} valueField={"SessionID"} options={academicSession} type={"number"} require={"This Field is require"} disabled={false} />

                    {/* <DefaultSelect label={"Month"} nameField={"SFGName"} registerKey={"SFGNID"} valueField={"SFGNID"} options={feeType} type={"number"} require={"This Field is require"} /> */}
                    <DefaultSelect label={"Payment Type"} nameField={"GlName"} registerKey={"GLID"} valueField={"GLID"} options={paymentType} type={"number"} require={"This Field is require"} />

                    <DefaultSelect label={"Account"} nameField={"SlName"} registerKey={"cashier"} valueField={"SLID"} options={subLedger} type={"number"} require={"This Field is require"} />

                    <DatePickerOne registerKey={"CreateAt"} dateCalender={"Entry Date"} require={"Entry Date is require"} placeholder={"Entry Date"} disable={false} />

                    {/* <DefaultInput registerKey={"recept"} require={"Recept Number is require"} type={"text"} label={"Account"} disable={true} /> */}
                </div>
                {
                    !feeError && feeData && feeData.length > 0 && (
                        <div>
                            <div className='block mt-4 input-table'>
                                <SortableTable columns={columnForFee} data={feeData} isFilterColumn={false} />
                            </div>
                            <div className="flex justify-between">
                                <div className='text-[14px] mt-2'>
                                    <p className=''>Print Invoice</p>
                                    <div className='mt-1'>
                                        <SwitcherThree />
                                    </div>
                                </div>
                                {/* <table className='w-full max-w-[200px] font-SolaimanLipi text-[14px]  mt-4'>
                                    <tbody>
                                        <tr>
                                            <td className='border-b py-1 pl-2 bg-theme-color text-white'>Total Collectable Fee:</td>
                                            <td className='border-b py-1 pl-2 bg-theme-color text-white'>600</td>
                                        </tr>
                                        <tr>
                                            <td className='border-b py-1 pl-2 bg-warning text-white'>Old Discount:</td>
                                            <td className='border-b py-1 pl-2 bg-warning text-white'>200</td>
                                        </tr>
                                        <tr>
                                            <td className='border-b py-1 pl-2 bg-success text-white'>Old Insert:</td>
                                            <td className='border-b py-1 pl-2 bg-success text-white'>0</td>
                                        </tr>
                                        <tr>
                                            <td className='border-b py-1 pl-2'>Current Discount:</td>
                                            <td className='border-b py-1 pl-2'>200</td>
                                        </tr>
                                        <tr>
                                            <td className='border-b py-1 pl-2'>Current Entry:</td>
                                            <td className='border-b py-1 pl-2'>1200</td>
                                        </tr>
                                    </tbody>
                                </table> */}

                            </div>
                            <div className="text-center">
                                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white p-2 rounded w-full">
                                    {isLoading ? "Submitting..." : translate("Save")}
                                </button>
                                {isSuccess && <p className="text-green-500">Fee added successfully!</p>}
                                {isError && <p className="text-red-500">Error adding fee.</p>}
                                {/* <button type="submit" className="rounded-md inline-flex items-center bg-theme-color text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush text-center mt-0">{translate("Save")}</button> */}
                            </div>

                        </div>
                    )
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

export default FeeCollectionForm;