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
                    {/* <div className="header_content flex justify-space-between">
                        <label htmlFor="bg_image" className="flex items-center border-2 border-violet-700	pr-2 pl-1 rounded-l-lg gap-5 font-bold font-SolaimanLipi">
                            <div>
                                <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                </svg>
                            </div>
                            <div>
                                {props.tableTitle}     
                            </div> 
                        </label>
                        <button type="button" className="border-r-2 border-y-2 border-violet-700 px-2 group">
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-settings ease-in duration-500  group-hover:rotate-90 "><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                        </button>
                        <input type="file" name="bg_image" id="bg_image" className="hidden" />

                    </div> */}
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