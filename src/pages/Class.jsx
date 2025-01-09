import { FaEdit, FaTrash } from 'react-icons/fa';

const Class = () => {
    return (
        <div className="grid grid-cols-3 px-5 py-2 gap-2">
            {/*First Column Start*/}
            <div className="col-span-1 border-b border-slate-200 p-2">
                <h1 className="font-semibold text-lg text-slate-500">Add Class</h1>
                <div className="mb-2">
                    <label>
                        <p className="text-slate-500 pb-1">
                            Class {" "}
                            <span className="text-red-700">*</span>
                        </p>
                        <input
                            type={'text'}
                            placeholder={""}
                            className="border border-slate-300 w-full"
                        />
                    </label>
                </div>



                <div className=" py-5">
                    <p className="text-slate-500 pb-3">
                        Sections {" "}
                        <span className="text-red-700">*</span>
                    </p>
                    <div className="flex items-center">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name=""
                                value=""
                                className="h-4 w-4"
                            />
                        </label>
                        <p className=" text-sm font-medium px-3 text-slate-600">A</p>
                    </div>
                    <div className="flex items-center py-1">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name=""
                                value=""
                                className="h-4 w-4"
                            />
                        </label>
                        <p className=" text-sm font-medium px-3 text-slate-600">B</p>
                    </div>
                    <div className="flex items-center">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name=""
                                value=""
                                className="h-4 w-4"
                            />
                        </label>
                        <p className=" text-sm font-medium px-3 text-slate-600">C</p>
                    </div>
                    <div className="flex items-center py-1">
                        <label className="inline-flex items-center">
                            <input
                                type="checkbox"
                                name=""
                                value=""
                                className="h-4 w-4"
                            />
                        </label>
                        <p className=" text-sm font-medium px-3 text-slate-600">D</p>
                    </div>

                </div>



                <button className='bg-slate-600 px-3 py-1 text-white rounded-sm mt-32 float-end mr-2 text-[14px]'>
                    Save
                </button>
            </div>
            {/*First Column End*/}

            {/*Second Column Start*/}
            <div className="col-span-2 border-b border-slate-200 p-2">
                <h1 className="font-semibold text-lg text-slate-500">Class List</h1>

                <table className='w-full mt-5'>
                    <thead className="text-left">
                        <tr className="font-normal text-sm text-slate-500 ">
                            <th className=''>Class</th>
                            <th>Sections</th>
                            <th>Bangla</th>
                            <th>Arabic</th>
                            <th className='w-[10%]'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='text-left'>
                        <tr className="font-normal text-sm text-slate-500">
                            <td>Class 1</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 2</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 3</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 4</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 5</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 6</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 7</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 8</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
                            <td> إبراهيم</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-500 ">
                            <td>Class 9</td>
                            <td>A <br /> B <br /> C <br /> D</td>
                            <td>Ibrahim</td>
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

export default Class;