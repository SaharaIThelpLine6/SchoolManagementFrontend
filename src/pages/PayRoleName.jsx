import { FaEdit, FaTrash } from "react-icons/fa";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGray from "../components/Button/DefaultGray";

const PayRoleName = () => {
    return (
        <div className="flex w-full px-5 py-2 gap-5">
            {/*Input form Start*/}
            <div className="w-[25%]">
                <div className="text-[12px] space-y-2 text-slate-800 font-semibold">

                    <div className="">
                        <DefaultSelect
                            type=""
                            label={
                                <span>ফান্ড :</span>
                            }
                            registerKey={"fund"}
                            valueField={"value"}
                            nameField={"name"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            type=""
                            label={
                                <span>জে-লেজার :</span>
                            }
                            registerKey={"jledger"}
                            valueField={"jledger"}
                            nameField={"name"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            type={""}
                            label={
                                <span>সাব-লেজার :</span>
                            }
                            registerKey={"sub-Ledger"}
                            valueField={"sub-Ledger"}
                            nameField={"name"}
                        />
                    </div>
                    <div className="">
                        <DefaultInput
                        type={"text"}
                        label={"পে-খাতের নাম"}
                        registerKey={"PayName"}
                        />
                    </div>
                    
                    
                    <div className="">
                        <DefaultInput
                        type={"text"}
                        label={"সিরিয়াল"}
                        registerKey={"Serial"}
                        />
                    </div>
                </div>

                <div className='text-center flex gap-10'>
                    <DefaultGray submitButton = {"Save"} />
                    <DefaultGray submitButton={"New"} />
                </div>
            </div>
            {/*Input form End*/}

            {/*Table start*/}
            <div className="w-[75%]">
                <table className='w-full mt-5'>
                    <thead className="text-left">
                        <tr className="font-normal text-sm text-slate-800 ">
                            <th className=''>সিরিয়াল</th>
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

export default PayRoleName;