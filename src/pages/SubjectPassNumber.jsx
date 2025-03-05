import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGreen from "../components/Button/DefaultGreen";
import AverageResultNav from "../components/AverageResultNav/AverageResultNav";
import Fourdots from '../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";

const SubjectPassNumber = () => {
    const [rows, setRows] = useState([
        ["2024", "বার্ষিক পরীক্ষা", "প্লে (ক)", "১","কায়েদা","كتاب", "১০০", "৩৫", "১"],
        ["2025", "বার্ষিক পরীক্ষা", "প্লে (ক)", "১","কায়েদা","كتاب", "১০০", "৩৫", "১"],
    ]);

    const handleInputChange = (rowIndex, colIndex, value) => {
        const updatedRows = rows.map((row, rIdx) =>
            rIdx === rowIndex
                ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
                : row
        );
        setRows(updatedRows);
    };
    return (
        <div className="px-2 -mt-[25px] text-slate-800  text-[14px] xl:text-[16px] font-SolaimanLipi">
            {/*Navbar Link*/}
            <AverageResultNav />

            {/*Form Start*/}
            <form action="">
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    শিক্ষাবর্ষ :

                                </p>
                            }
                            options={[
                                { id: '1', value: "2025", },
                                { id: '2', value: "2025-2026" },
                                { id: '3', value: "2026" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    বার্ষিক পরীক্ষা :

                                </p>
                            }
                            options={[
                                { id: '1', value: "১ম সাময়িক পরীক্ষা", },
                                { id: '2', value: "২য় সাময়িক পরীক্ষা" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    জামাত/মারহালা :

                                </p>
                            }
                            options={[
                                { id: '1', value: "প্লে(ক)", },
                                { id: '2', value: "প্লে(খ)" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    কিতাব :

                                </p>
                            }
                            options={[
                                { id: '1', value: "বাংলা", },
                                { id: '2', value: "ইংরেজী" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultInput
                            label={
                                <p className="text-slate-700">
                                    বিষয় আরবী {" "}
                                </p>
                            }
                            type={'text'}
                            placeholder={""}
                            registerKey={"bookName"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    মিয়ারী :

                                </p>
                            }
                            options={[
                                { id: '1', value: "গড় মি'ইয়ারী", },
                                { id: '2', value: "মি'ইয়ারী" },
                                { id: '3', value: "অধিকতর মিয়ারী" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="flex gap-3 pt-[18px] items-center w-full">
                        <input
                            type={'checkbox'}
                            placeholder={""}
                        />
                        <span className="">কেরাত কন্ডিশন (যদি থাকে)</span>
                    </div>
                    <div className="">
                        <DefaultInput
                            label={
                                <p className="text-slate-700">
                                    পাশ নাম্বার {" "}
                                </p>
                            }
                            type={'text'}
                            placeholder={""}
                            registerKey={"bookName"}
                        />
                    </div>
                </div>
                <div className="flex gap-3 mt-2">
                    <DefaultGreen submitButtonGreen={"Edit"} />
                    <DefaultGreen submitButtonGreen={"New"} />
                </div>
            </form>
            {/*Form End*/}
            {/* Table Start */}
            <div className="mt-2 overflow-x-scroll text-[14px]">
                <table className="w-full table-auto border-collapse">
                    <thead className="bg-[#3F4885] text-white text-center">
                        <tr>
                            <td className="border border-white px-2">
                                <img key="icon1" src={Fourdots} alt="Fourdots" className="w-4 h-4" />
                            </td>
                            <td className="border border-white px-2">
                                <img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" />
                            </td>
                            <td className="border border-white min-w-[80px] py-1">শিক্ষাবর্ষ</td>
                            <td className="border border-white min-w-[190px]">পরীক্ষার নাম</td>
                            <td className="border border-white px-2">মারহালা</td>
                            <td className="border border-white px-2">সিরিয়াল</td>
                            <td className="border border-white px-2">কিতাব</td>
                            <td className="border border-white px-2">আরবী কিতাব</td>
                            <td className="border border-white px-2">পূর্ণমান</td>
                            <td className="border border-white px-2">পাশ নাম্বার</td>
                            <td className="border border-white px-2">কেরাত</td>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                <td className="border border-slate-500 px-2 hover:bg-red-300">
                                    <FaEdit />
                                </td>
                                <td className="border border-slate-500 px-2 hover:bg-red-300">
                                    <FaTrash />
                                </td>
                                {row.map((cell, colIndex) => (
                                    <td className="border border-slate-500" key={colIndex}>
                                        {colIndex === 0 ? (
                                            cell
                                        ) : (
                                            <input
                                                className="w-full p-1 focus:outline-none focus:bg-green-200"
                                                type="text"
                                                value={cell}
                                                onChange={(e) =>
                                                    handleInputChange(rowIndex, colIndex, e.target.value)
                                                }
                                            />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Table End */}
        </div>
    )
}

export default SubjectPassNumber;