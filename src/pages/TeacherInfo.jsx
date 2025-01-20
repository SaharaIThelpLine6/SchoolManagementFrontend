import Flatpickr from "react-flatpickr";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";

import { useState } from 'react';
import Fourdots from '../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';
import DefaultGreen from "../components/Button/DefaultGreen";
import DatePickerOne from "../components/Forms/DatePicker/DatePickerOne";

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
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
    const [Data, setData] = useState(initialBrandData);

    const handleDelete = (index) => {
        const confirmDelete = window.confirm('Are you sure delete this?');
        if (confirmDelete) {
            const updatedData = Data.filter((_, i) => i !== index);
            setData(updatedData);
        }
    };

    return (
        <div>
            <h1 className="mt-[-23px] pb-[6px] pt-[10px] 2xl:py-[12px] px-[12px] text-white bg-green-600 text-center mx-auto text-[18px] 2xl:text-xl w-full font-normal font-lato block border-0">শিক্ষকদের তথ্য</h1>


            {/*Form Start*/}
            <form action="" className="text-[14px] px-2 font-lato">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-3 w-full flex-wrap lg:flex-nowrap">
                    <div className="pt-2 flex flex-nowrap relative items-center">
                        <div className="">

                            <input
                                className="block outline-none p-1.5 w-16 text-sm text-gray-900 border border-green-400 rounded-s-md "
                                placeholder="Serial"
                                required
                            />
                        </div>
                        <button
                            className="w-full items-center py-1.5 px-2 text-sm border border-green-400 border-l-0 font-medium text-center text-black rounded-e-md"
                            type="button">
                            <select
                                className="outline-none text-sm text-gray-900 bg-transparent  "
                                required
                            >
                                <option value="option1" selected disabled>পদবী</option>
                                <option value="option2">General Teacher</option>
                                <option value="option2">Senior Teacher</option>
                            </select>
                        </button>
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


                {/*Save Button start*/}
                <div className="flex gap-5 py-3">
                    <DefaultGreen submitButtonGreen={"Save"} />
                    <DefaultGreen submitButtonGreen={"New"} />
                </div>
                {/*Save Button end*/}
            </form>
            {/*Form End*/}



            {/*Database Table start*/}
            <div className="rounded-sm bg-white pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead className='bg-slate-500 text-white h-fit'>
                            <tr className="text-center">
                                {[
                                    <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" />,
                                    <img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" />,
                                    'আইডি', 'কোড', 'সিরিয়াল', 'নাম', 'পিতা', 'মোবাইল', 'যোগদানের তারিখ'
                                ].map((header, index) => (
                                    <th key={index} className="px-4 py-1 font-medium border border-white">
                                        {typeof header === 'string' ? header : <div className="flex justify-center">{header}</div>}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {Data.map((brand, key) => (
                                <tr key={key} className={`${key % 2 !== 0 ? 'bg-[#f5f3f3]' : ''} border border-white`}>
                                    {[
                                        <FaEdit key={`edit-${key}`} />,
                                        <FaTrash key={`trash-${key}`} onClick={() => handleDelete(key)} />,
                                        brand.id,
                                        brand.code,
                                        brand.serial,
                                        brand.name,
                                        brand.fatherName,
                                        brand.phone,
                                        brand.date
                                    ].map((data, index) => (
                                        <td key={index} className="py-1 px-4 border border-white dark:border-strokedark">
                                            {typeof data === 'string' ? (
                                                <p className="text-black dark:text-white">{data}</p>
                                            ) : (
                                                <button className={index === 0 ? 'text-blue-500 hover:text-blue-700' : 'text-red-500 hover:text-red-700'}>
                                                    {data}
                                                </button>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/*Database Table End*/}
        </div>
    )
}

export default TeacherInfo;