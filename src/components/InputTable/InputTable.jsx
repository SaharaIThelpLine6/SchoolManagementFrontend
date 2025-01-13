import { FaEdit, FaTrash } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const InputTable = (props) => {
    const tokenDux = useSelector((state) => state.auth.token)

    const data = 10;
    const [rowsInTable, setRowsInTable] = useState();

    const inputSectionRef = useRef(null);

    useEffect(() => {
        // Function to adjust the number of rows based on input section height
        // data fetcher

        const updateRowsInTable = () => {
            const inputHeight = inputSectionRef.current?.offsetHeight;
            if (inputHeight) {
                const rows = Math.floor(inputHeight / 40); // 60px is a rough height per row (adjust based on content size)
                /**Emon's code start */
                console.log(rows);

                if (data > rows) {
                    setRowsInTable(rows < 1 ? 1 : rows);
                }
                else {
                    setRowsInTable(data);
                }
                /**Emon's code End */
                // Ensures at least 1 row
            }
        };


        // Call the function initially and whenever window is resized
        updateRowsInTable();
        window.addEventListener("resize", updateRowsInTable);

        return () => {
            window.removeEventListener("resize", updateRowsInTable);
        };
    }, []);

    return (
        <div className="p-4">
            {/* Flex container for Input and Table sections */}
            <div className="flex gap-3">
                {/* Input Form Section */}
                <div
                    ref={inputSectionRef}
                    className="w-[40%] border rounded-lg p-4 bg-white shadow-sm"
                >
                    <h1 className="font-semibold text-lg text-slate-600 mb-4">{props.tableTitle}</h1>
                    <div className="">
                        <label className="block">
                            <span className="text-slate-500 pb-1 block">
                                {props.field} <span className="text-red-700">*</span>
                            </span>
                            <input
                                type="text"
                                className="border border-slate-300 w-full px-2 py-1 rounded-md focus:ring focus:ring-slate-300 focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="">
                        <label className="block">
                            <span className="text-slate-500 pb-1 block">
                                বাংলা <span className="text-red-700">*</span>
                            </span>
                            <input
                                type="text"
                                className="border border-slate-300 w-full px-2 py-1 rounded-md focus:ring focus:ring-slate-300 focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="">
                        <label className="block">
                            <span className="text-slate-500 pb-1 block">
                                عربي <span className="text-red-700">*</span>
                            </span>
                            <input
                                type="text"
                                className="border border-slate-300 w-full px-2 py-1 rounded-md focus:ring focus:ring-slate-300 focus:outline-none"
                            />
                        </label>
                    </div>
                    <div className="mb-4">
                        <p className="text-slate-500 pb-2">
                            Sections <span className="text-red-700">*</span>
                        </p>
                        {["A", "B", "C", "D"].map((section) => (
                            <div key={section} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`section-${section}`}
                                    value={section}
                                    className="h-4 w-4 text-slate-600 border-gray-300 rounded"
                                />
                                <label
                                    htmlFor={`section-${section}`}
                                    className="ml-2 text-slate-600 text-sm"
                                >
                                    {section}
                                </label>
                            </div>
                        ))}
                    </div>
                    <button className="bg-slate-600 px-4 py-2 text-white rounded-md mt-4 w-full hover:bg-slate-700">
                        Save
                    </button>
                </div>

                {/* Table Section */}
                <div className="flex-1 border rounded-lg bg-white shadow-sm">
                    <table className="w-full h-fit border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-left text-sm text-slate-600">
                                {props.tableHeaders.map((title) => (
                                    <th key={title} className="py-2 px-3">{title}</th>
                                ))}                             
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: rowsInTable }, (_, index) => (
                                <tr key={index} className="text-sm text-slate-600 border-t">
                                    {props.tableRows.map((tableRow) => (
                                        <td key={tableRow} className="py-2 px-3">{tableRow}</td>
                                    ))}                                   
                                    <td className="pt-3 flex gap-2">
                                        <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                                        <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Remaining Rows Full-Width */}
            <div className="mt-4 border rounded-lg bg-white shadow-sm">
                <table className="w-full border-collapse">
                    <tbody>
                        {Array.from({ length: data - rowsInTable }, (_, index) => (
                            <tr key={index + rowsInTable} className="text-sm text-slate-600 border-t">
                                <td className="py-2 px-3">Class {index + rowsInTable + 1}</td>
                                <td className="py-2 px-3">A, B, C, D</td>
                                <td className="py-2 px-3">Ibrahim</td>
                                <td className="py-2 px-3">إبراهيم</td>
                                <td className="py-2 px-3 flex gap-2">
                                    <FaEdit className="text-blue-500 cursor-pointer hover:text-blue-700" />
                                    <FaTrash className="text-red-500 cursor-pointer hover:text-red-700" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InputTable;