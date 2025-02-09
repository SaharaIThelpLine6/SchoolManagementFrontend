import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormContext, useForm, Controller } from "react-hook-form";

import "flatpickr/dist/flatpickr.css";
import DefaultInput from "./DefaultInput";
import DefaultSelect from "./DefaultSelect";
import DatePickerOne from "./DatePicker/DatePickerOne";
import { getUserType } from "../../utils/read/api";
import { fetchSettingsData, fetchDidata, fetchThanadata } from "../../features/settings/settingsSlice";
import { insertData, insertUserInfo } from "../../utils/create/api";
import { useNavigate } from "react-router-dom";
import { fetchSingleUser, setEditMode } from "../../features/userInfo/userInfoSlice";
import { updateUserInfo } from "../../utils/update/api";
import DefaultGreen from "../Button/DefaultGreen";
import { setItemsPerPage } from "../../features/pagination/paginationSlice";
import { fetchClassData } from "../../features/class/classSlice";
import useTranslate from "../../utils/Translate";
import { cssTransition, toast } from "react-toastify";
import { setReqLoading } from "../../features/requestHandeler/requestHandelerSlice";
import { hideModal } from "../../utils/ModalControlar";
import { fetchUserOnlyStudentData } from "../../features/student/studentSlice";

const AdmissionForm = ({ userId }) => {
    const { academicSession, status, error } = useSelector((state) => state.settings);
    const { classList, subClassList } = useSelector((state) => state.class);
    const { defaultFormValue, singleUserstatus } = useSelector((state) => state.userInfo);
    const { reqLoading } = useSelector((state) => state.requestHandeler);
    const translate = useTranslate();
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
    const dispatch = useDispatch()
    useEffect(() => {
        // console.log(defaultFormValue?.UserID === userId);
        if (defaultFormValue?.UserID != userId) {
            dispatch(fetchSingleUser(userId))
        }
        if (!academicSession.length) {
            dispatch(fetchSettingsData())
        }
        if (!classList.length) {
            dispatch(fetchClassData())
        }
    }, [dispatch])
    const onSubmit = async (data) => {
        if (reqLoading) {
            console.log("Request already in progress. Please wait...");
            toast.dark(translate("Request already in progress. Please wait..."), {
                type: "warn",
                className: " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
                style: {
                    boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
                },
            });
            return false;
        }
        dispatch(setReqLoading(true))
        const id = toast.dark("তথ্য যুক্ত করা হচ্ছে...", {
            type: "success",
            isLoading: true,
            className: " min-h-[50px] max-h-[50px] overflow-hidden text-[14px] font-SolaimanLipi bg-[#323232] text-[#ffffff] py-2 px-2 rounded-[4px] font-normal",
            style: {
                boxShadow: '0 3px 5px -1px rgba(0, 0, 0, .2), 0 6px 10px 0 rgba(0, 0, 0, .14), 0 1px 18px 0 rgba(0, 0, 0, .12)',
            },
        });
        try {

            const submitRes = await insertData(data, "/api/students/insert_student")
            if (submitRes.success) {
                reset();
                toast.update(id, { render: translate("Information Added Successfully"), type: "success", isLoading: false, autoClose: true });
                dispatch(setReqLoading(false))
                hideModal()
                dispatch(fetchUserOnlyStudentData())

            }
            else {
                toast.update(id, { render: submitRes.error, type: "error", isLoading: false, autoClose: true });
                dispatch(setReqLoading(false))

            }
        } catch (err) {
            console.error(err.message)
            dispatch(setReqLoading(false))

        }
    }

    const selectedClassID = watch("ClassID");
    const filteredSubClassList = subClassList.filter(sub => sub.ClassID === selectedClassID);

    useEffect(() => {
        console.log(defaultFormValue, singleUserstatus);
        console.log(defaultFormValue?.UserID == userId);


        if (singleUserstatus === "succeeded" && defaultFormValue?.UserID == userId) {
            reset(defaultFormValue);
        }
    }, [singleUserstatus, defaultFormValue, userId, reset]);

    const FinancialCondition = [
        {
            id: 1,
            name: "Poor"
        },
        {
            id: 2,
            name: "Orphan"
        },
        {
            id: 3,
            name: "Rich"
        },
        {
            id: 4,
            name: "Helpless"
        },
    ]
    const Housing = [
        {
            id: 1,
            name: "In campus"
        },
        {
            id: 2,
            name: "No Campus"
        },
        {
            id: 3,
            name: "Day-care"
        },
    ]
    const AdmissionType = [
        {
            id: 1,
            name: "New"
        },
        {
            id: 2,
            name: "Old"
        }
    ]

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi">

            <div className="text-[14px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <DefaultInput registerKey={"UserName"} placeholder={"Student Name"} require={"Student Name is require"} type={"text"} label={"Student Name"} disable={true} />
                    <DefaultInput registerKey={"FatherName"} placeholder={"Father Name"} require={"Father Name is require"} type={"text"} label={"Father Name"} disable={true} />
                    <DefaultInput registerKey={"Mobile1"} placeholder={"Mobile"} require={"Mobile is require"} type={"text"} label={"Mobile"} disable={true} />
                    <DatePickerOne registerKey={"CreateAt"} placeholder={"Entry Date"} dateCalender={"Entry Date"} require={"Entry Date is require"} disable={true} />


                    <DefaultSelect options={academicSession} require={"Session is require"} nameField={"SessionName"} valueField={"SessionID"} registerKey={"SessionID"} type={"number"} label={<span className="text-red-500">
                        {translate("Session")} *
                    </span>} />

                    <DefaultSelect options={classList} require={"Class is require"} nameField={"ClassName"} valueField={"ClassID"} registerKey={"ClassID"} type={"number"} label={<span className="text-red-500">
                        {translate("Admission Class")} *
                    </span>} />

                    {/* <Controller
                        name="ClassID"
                        control={control}
                        rules={{ required: "Class is required" }}
                        render={({ field, fieldState: { error } }) => (
                            <DefaultSelect
                                options={classList}
                                nameField="ClassName"
                                valueField="ClassID"
                                label={
                                    <span className="text-red-500">
                                        {translate("Admission Class")} *
                                    </span>
                                }
                                onChange={(value) => field.onChange(value)}
                                value={field.value}
                                error={error?.message}
                            />
                        )}
                    /> */}

                    {/* <DefaultSelect options={subClassList} require={"Sub Class is require"} nameField={"SubClass"} valueField={"SubClassID"} registerKey={"SubClassID"} type={"number"} label={<span className="text-red-500">
                        {translate("Admission Section")} *
                    </span>} /> */}
                    <DefaultSelect
                        options={filteredSubClassList}
                        require="Sub Class is required"
                        nameField="SubClass"
                        valueField="SubClassID"
                        registerKey="SubClassID"
                        type="number"
                        label={
                            <span className="text-red-500">
                                {translate("Admission Section")} *
                            </span>
                        }
                    />

                    <DefaultInput registerKey={"AdmissionSerial"} placeholder={"Admission Serial/ Roll"} type={"number"} label={<span className="text-red-500">
                        {translate("Admission Serial")} *
                    </span>} />

                    <DefaultSelect options={FinancialCondition} require={"Sub Class is require"} nameField={"name"} valueField={"id"} registerKey={"SFTID"} type={"number"} label={<span className="text-red-500">
                        {translate("Financial Condition")} *
                    </span>} />
                    <DefaultSelect options={Housing} require={"Sub Class is require"} nameField={"name"} valueField={"id"} registerKey={"ResidentialStatusId"} type={"number"} label={<span className="text-red-500">
                        {translate("Living Condition")} *
                    </span>} />
                    <DefaultSelect options={AdmissionType} require={"AdmissionType is require"} nameField={"name"} valueField={"id"} registerKey={"NewOldId"} type={"number"} label={<span className="text-red-500">
                        {translate("Admission Type")} *
                    </span>} />




                </div>
                <div className="text-center pt-6 pb-3">
                    {/* <button type="button" onClick={handleRemoveSerial}>
                        Remove Serial
                    </button> */}

                    <button type="submit" className="rounded-md inline-flex items-center bg-theme-color text-white border border-transparent py-2 px-4 text-center text-sm transition-all hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-500 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none font-semibold font-kalpurush">{translate("Complete Admission")}</button>
                </div>



            </div>
        </form >
    )
}
export default AdmissionForm