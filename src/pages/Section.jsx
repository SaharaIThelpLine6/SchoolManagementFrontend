import { FaEdit, FaTrash } from 'react-icons/fa';

const Section = () => {
    return (
        <div className="grid grid-cols-3 px-5 py-2 gap-2">
            {/*First Column Start*/}
            <div className=" p-2">
                <h1 className="font-semibold text-lg pb-2 text-slate-500">Add Section</h1>
                <div className="mb-2">
                    <label>
                        <p className="text-slate-500 text-[14px]">
                            Section {" "}
                            <span className="text-red-700">*</span>
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-200 bg-[#EDEDED] w-full mb-2"
                        />
                    </label>
                    <label>
                        <p className="text-slate-500 text-[14px]">
                            বাংলা {" "}
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-200 bg-[#EDEDED] w-full mb-2"
                        />
                    </label>
                    <label>
                        <p className="text-slate-500 text-[14px]">
                            عربي   {" "}
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-200 bg-[#EDEDED] w-full"
                        />
                    </label>
                </div>

                <div className='text-center'>
                    <button className='bg-slate-600  px-3 py-1 text-white rounded-sm mt-4 text-[14px]'>
                        Save
                    </button>
                </div>
            </div>
            {/*First Column End*/}

            {/*Second Column Start*/}
            <div className="col-span-2 p-2">
                <h1 className="font-semibold text-lg text-slate-500">Section List</h1>

                <table className='w-full mt-5'>
                    <thead className="text-left">
                        <tr className="font-normal text-sm text-slate-500 ">
                            <th className=''>Section</th>
                            <th>বাংলা</th>
                            <th> عربي </th>
                            <th className='w-[10%]'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='text-left'>
                        <tr className="font-normal text-sm text-slate-500">
                            <td>A</td>
                            <td>ইব্রাহীম</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>B</td>
                            <td>ইব্রাহীম</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>C</td>
                            <td>ইব্রাহীম</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
            {/*Second Column End*/}
        </div>
    )
}

export default Section