import Flatpickr from "react-flatpickr";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";

import { useState } from 'react';
import Fourdots from '../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
            {/*Form Start*/}
            <form action="" className="grid px-3 text-[14px] md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 font-lato">
                <div className="flex gap-3">
                    <div className=" w-14">
                        <DefaultInput label={"সিরিয়াল"} type={'text'} placeholder={"1"} registerKey={"student_email"} />
                    </div>
                    <div className="w-full">
                        <DefaultSelect
                            label={
                                <span className="">
                                    পদবী :
                                </span>
                            }
                            options={[
                                { id: '1', value: "প্রিন্সিপাল / মুহতামিম" },
                                { id: '2', value: "প্রধান শিক্ষক" },
                                { id: '3', value: "সহকারী শিক্ষক " },
                            ]}
                            registerKey={"user_type"}
                        />
                    </div>
                </div>
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
            </form>
            {/*Form End*/}

            {/*Image add start*/}
            <div className="flex gap-2 mt-1 font-lato text-[12px] px-2">
                <p>ছবি সংযুক্ত করুন</p>
                <input
                    type="file"
                    className="file-input"
                    onChange={handleImageChange}
                />
                {selectedImage && <img src={selectedImage} alt="uploaded" className="uploaded-image h-20 w-20 border-4 border-slate-300" />}
            </div>
            {/*Image add end*/}

            {/*SSave, New, Close Button start*/}
            <div className="flex gap-3 px-2">
                <button
                    className="
          mega-button positive
           text-white 
           bg-gradient-to-r
          from-green-400
             via-green-500
              to-green-600
               hover:bg-gradient-to-br
                focus:ring-4
                 focus:outline-none
                  focus:ring-green-300
                   font-medium
                    rounded-lg
                     text-sm
                      px-0 py-0
                       text-center
                        me-2 mb-2 mt-2
                        w-24
                        h-8
              "
                    type="submit">
                    Save
                </button>

                <button className="mega-button positive text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-0 py-0 text-center me-2 mb-2 mt-2 w-24 h-8" type="submit">
                    New
                </button>
                <button className="mega-button positive text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-0 py-0 text-center me-2 mb-2 mt-2 w-24 h-8" type="submit">
                    Close
                </button>

            </div>
            {/*Save, New, Close Button end*/}

            {/*Database Table start*/}
            <div className="rounded-sm bg-white pt-1 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
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