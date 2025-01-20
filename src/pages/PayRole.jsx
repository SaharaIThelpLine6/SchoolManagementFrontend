
import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGreen from "../components/Button/DefaultGreen";

const PayRole = () => {
    return (
        <div className="md:flex w-full px-3 gap-3 font-lato">
            {/*Input form Start*/}
            <div className="md:w-[50%]">
                <div className="text-sm font-medium space-y-1 text-black items-center gap-2 grid grid-cols-1 lg:grid-cols-2">

                    <div className="">
                        <DefaultSelect
                            type="number"
                            label={
                                <span>
                                    ফান্ড :
                                </span>
                            }
                            registerKey={"UserTypeID"}
                            valueField={"id"}
                            nameField={"value"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            type="number"
                            label={
                                <span>
                                    জে-লেজার :
                                </span>
                            }
                            registerKey={"UserTypeID"}
                            valueField={"id"}
                            nameField={"value"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            type="number"
                            label={
                                <span>
                                    সাব-লেজার :
                                </span>
                            }
                            registerKey={"UserTypeID"}
                            valueField={"id"}
                            nameField={"value"}
                        />
                    </div>
                    <div className="">
                        <DefaultInput label={"পে-খাতের নাম :"} type={'text'} placeholder={""} registerKey={"FatherName"} />
                    </div>
                    <div className="">
                        <DefaultInput label={"সিরিয়াল :"} type={'text'} placeholder={""} registerKey={"FatherName"} />
                    </div>

                </div>
                <div className='text-center flex py-3 gap-3'>
                    <DefaultGreen submitButtonGreen = {"Save"} />
                    <DefaultGreen submitButtonGreen ={"New"} />
                </div>
            </div>
            {/*Input form End*/}

            {/*Table start*/}
            <div className="md:w-[50%] font-lato">
                <table className='w-full'>
                    <thead className="text-left bg-slate-700 ">
                        <tr className="font-normal text-sm text-white">
                            <th className='px-2 py-1'>সিরিয়াল</th>
                            <th>পে-রোলের নাম</th>
                            <th className='w-[10%]'>Action</th>
                        </tr>
                    </thead>
                    <tbody className='text-left'>
                        <tr className="font-normal text-sm text-slate-800">
                            <td>১</td>
                            <td>মূল বেতন</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                        <tr className="font-normal text-sm text-slate-800 ">
                            <td>২</td>
                            <td>চিকিৎসা ভাতা</td>
                            <td className='flex gap-2 w-8 h-8'>
                                <FaEdit /><FaTrash />
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
            {/*Table End*/}
        </div>
    )
}

export default PayRole;