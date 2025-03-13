import Flatpickr from "react-flatpickr";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";

import { useEffect, useState } from 'react';
import Fourdots from '../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DefaultGreen from "../components/Button/DefaultGreen";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";
import { useGetDesignationQuery, useGetTeacherInfoQuery } from "../features/teachers/teachersSlice";
import SortableTable from "../components/Tables/SortableTable";
import { useDispatch } from "react-redux";
import { fetchSingleUser } from "../features/userInfo/userInfoSlice";

const initialBrandData = [
    {
        id: 1,
        code: 1001,
        serial: 1,
        name: "Khan",
        fatherName: "Khan Senior",
        phone: "01742095986",
        date: "01/01/2025"
    },
    {
        id: 1,
        code: 1001,
        serial: 1,
        name: "Khan",
        fatherName: "Khan Senior",
        phone: "01742095986",
        date: "01/01/2025"
    },
    {
        id: 1,
        code: 1001,
        serial: 1,
        name: "Khan",
        fatherName: "Khan Senior",
        phone: "01742095986",
        date: "01/01/2025"
    },
];

const TeacherInfo = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const dispatch = useDispatch()
    const { data: designation, isLoading: designationLoading, isError: designationError } = useGetDesignationQuery()
    const { data: teacherInfo, isLoading: teacherInfoLoading, isError: teacherInfoError } = useGetTeacherInfoQuery()

    const [Data, setData] = useState(initialBrandData);

    useEffect(() => {
        dispatch(fetchSingleUser(13))
    }, [dispatch])
    if (designation) {
        console.log(designation);
    }
    const employeeColumn = [
        { title: "User Id", field: "UserID", hozAlign: 'center' },
        { title: "Code", field: "DNID", hozAlign: 'center' },
        { title: "Serial", field: "Serial", hozAlign: 'center' },
        { title: "Name", field: "StudentName", render: (row) => {
            return row.UserID
        }},
        // { title: "Father", field: "ClassName", hozAlign: 'center' },
        // { title: "Mobile", field: "SubClass", hozAlign: "center" },
        {
            title: "Entry Date", field: "JoiningDate", hozAlign: "center", render: (row) => {
                return new Date(row.JoiningDate).toLocaleDateString('en-GB');
            }
        },

    ];

    return (
        <div>
            <h1 className="mt-[10px] pb-[6px] pt-[10px] px-[12px] text-center mx-auto text-[26px] w-full font-normal font-SolaimanLipi block border-0">শিক্ষকদের তথ্য</h1>

            <form action="" className="text-[14px] px-2 font-lato">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
                    <div className="pt-2 flex flex-nowrap relative items-center">
                        {
                            designation && designation.length > 0 ? <DefaultSelect registerKey={"designation"} nameField={"Designation"} valueField={"DNID"} options={designation} /> : null
                        }
                        {/* <div className="">
                            <input
                                className="block outline-none p-1.5 w-16 text-sm text-gray-900 border rounded-s-md "
                                placeholder="Serial"
                                required
                            />
                        </div>
                        <button
                            className="w-full items-center py-1.5 px-2 text-sm border border-l-0 font-medium text-center text-black rounded-e-md"
                            type="button">
                            <select className="outline-none text-sm text-gray-900 bg-transparent" required>
                                <option value="option1" selected disabled>পদবী</option>
                                <option value="option2">General Teacher</option>
                                <option value="option2">Senior Teacher</option>
                            </select>
                        </button> */}
                    </div>
                </div>

                <div className="pt-2 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">

                    <div>
                        <label className="mb-1 block text-sm font-medium text-black dark:text-white">
                            যোগদানের তারিখ :
                        </label>
                        <div className="relative">
                            <Flatpickr options={{ minDate: "2017-01-01" }} className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" />
                        </div>
                    </div>
                    <div className="">
                        <DefaultInput label={"পাশের বিভাগ :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"নাম :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"পাসের সন ও তারিখ :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"যোগ্যতা :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"পিতা :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"সমাপনী বোর্ড/মাদরাসা :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"অভিজ্ঞতা :"} type={'text'} placeholder={""} registerKey={"student_email"} />
                    </div>
                </div>

                <div className="flex gap-5 py-3">
                    <DefaultGreen submitButtonGreen={"Save"} />
                    <DefaultGreen submitButtonGreen={"New"} />
                </div>

            </form>

            <div className="rounded-sm bg-white pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    {teacherInfo ? <SortableTable columns={employeeColumn} data={teacherInfo} isFilterColumn={false} /> : null}
                </div>
            </div>
        </div>
    )
}

export default TeacherInfo;