import DefaultGray from "../components/Button/DefaultGray";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";
import AverageResultNav from "../components/AverageResultNav/AverageResultNav";
import Fourdots from '../images/brand/four-dots-square.svg';
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";

const AverageResult = () => {
    // Add items/todo list start
    const [items, setItems] = useState([{ id: Date.now(), text: "", }]);

    const addItem = () => {
        if (items.length < 6) {
            setItems([...items, { id: Date.now(), text: "" }]);
        }
    };
    // Add items/todo list end

    // Variable and value for Table start
    const [rows, setRows] = useState([
        ["2024", "১ম সাময়িক পরীক্ষা", "প্লে (ক)", 80, 1, 1, 70, 2, 2, 60, 3, 3, 50, 4, 4, 40, 5, 5, 33, 6, 6, 9],
        ["202৫", "২য় সাময়িক পরীক্ষা", "প্লে (খ)", 80, 1, 1, 70, 2, 2, 60, 3, 3, 50, 4, 4, 40, 5, 5, 33, 6, 6, 9],
    ]);
    const handleInputChange = (rowIndex, colIndex, value) => {
        const updatedRows = rows.map((row, rIdx) =>
            rIdx === rowIndex
                ? row.map((cell, cIdx) => (cIdx === colIndex ? value : cell))
                : row
        );
        setRows(updatedRows);
    };
    // Variable and value for Table end
    return (
        <div className="px-2 -mt-[25px] text-slate-800  text-[14px] xl:text-[16px] font-SolaimanLipi">
            {/*Navbar Link*/}
            <AverageResultNav />

            {/*Form start*/}
            <form className="bg-[#f8fbfd] mt-0.5">
                <div className=" gap-2 grid lg:grid-cols-3">
                    {/*First column Start*/}
                    <div className="">
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
                                        পরীক্ষার নাম:

                                    </p>
                                }
                                options={[
                                    { id: '1', value: "১ম সাময়িক", },
                                    { id: '2', value: "২য় সাময়িক" },
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
                                        জামাত/মারহালা:

                                    </p>
                                }
                                options={[
                                    { id: '1', value: "প্লে (ক)", },
                                    { id: '2', value: "প্লে (খ)" },
                                ]}
                                valueField={"id"}
                                nameField={"value"}
                                registerKey={"class"}
                            />
                        </div>

                    </div>
                    {/*First column End*/}

                    {/*Second Column Start*/}
                    <div className="flex gap-2">
                        {/*Average Number start*/}
                        <div className="">
                            <p className="text-center">গড় নাম্বার</p>
                            <div className="flex items-center">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"সর্বোচ্চ"}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center ">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center ">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"অথবা যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center ">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"অথবা যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center ">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"অথবা যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"অথবা যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                            <div className="flex items-center">
                                <DefaultInput
                                    type={'text'}
                                    placeholder={"অথবা যদি >="}
                                    registerKey={"Average"}
                                />
                            </div>
                        </div>
                        {/*Average Number End*/}
                        <div className="flex gap-2">
                            <div className="mt-[35px] ">
                                <p className="text-center">বাংলা</p>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center gap-0.5 2xl:gap-3">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={"তাহলে ডিভিশন"}
                                        registerKey={"Average"}
                                    />
                                </div>
                            </div>
                            {/*Arabic Column*/}
                            <div className=" mt-[35px]">
                                <p className="text-center">আরবী</p>
                                <div className="flex items-center ">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <DefaultInput
                                        type={'text'}
                                        placeholder={""}
                                        registerKey={"Average"}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>
                    {/*Second column end*/}

                    {/*Last Column*/}
                    <div className="mt-[60px] flex">

                        <div className="w-full">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-1">
                                    <DefaultInput
                                        type="text"
                                        placeholder="তেলাওয়াতে সর্বোচ্চ নাম্বার"
                                        registerKey={"Average"}
                                        className="w-full"
                                    />
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        id="silver-color-checkbox"
                                    />
                                    
                                </div>
                            ))}
                        </div>

                        <div className="">
                            <button
                                onClick={addItem}
                                disabled={items.length >= 6}
                                type="button"
                                className="bg-slate-800 mt-1 ml-1 text-white px-4 py-1 rounded-lg disabled:hidden"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
                {/* Button start*/}
                <div className=" flex gap-2">
                    <DefaultGray submitButton={"Save"} />
                    <DefaultGray submitButton={"New"} />
                </div>
                {/*Button end */}
            </form>
            {/*Form end*/}
            {/* Table Start */}
            <div className="mt-2 ">
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
                            <td className="border border-white px-2">মারহালা/ক্লাশ</td>
                            <td className="border border-white px-2">{">=১"}</td>
                            <td className="border border-white px-2">ডিভিশন-১</td>
                            <td className="border border-white px-2">ডিভিশন আরবী-১</td>
                            <td className="border border-white px-2">{">=২"}</td>
                            <td className="border border-white px-2">ডিভিশন-২</td>
                            <td className="border border-white px-2">ডিভিশন আরবী-২</td>
                            <td className="border border-white px-2">{">=৩"}</td>
                            <td className="border border-white px-2">ডিভিশন-৩</td>
                            <td className="border border-white px-2">ডিভিশন আরবী-৩</td>
                            <td className="border border-white px-2">{">=৪"}</td>
                            <td className="border border-white px-2">ডিভিশন-৪</td>
                            <td className="border border-white px-2">ডিভিশন আরবী-৪</td>
                            <td className="border border-white px-2">{">=৫"}</td>
                            <td className="border border-white px-2">ডিভিশন-৫</td>
                            <td className="border border-white px-2">ডিভিশন আরবী-৫</td>
                            <td className="border border-white px-2 min-w-[80px]">{">=৬"}</td>
                            <td className="border border-white px-2 min-w-[80px]">ডিভিশন-৬</td>
                            <td className="border border-white px-2 min-w-[80px]">ডিভিশন আরবী-৬</td>
                            <td className="border border-white px-3 min-w-[40px] ">
                                <img key="icon2" src={Fourdots} alt="Fourdots" className="w-4 h-4" />
                            </td>
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
export default AverageResult;