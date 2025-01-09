import { FaEdit, FaTrash } from "react-icons/fa";

const PayRoleName = () => {
    return (
        <div className="flex w-full px-5 py-2 gap-5">
                    {/*Input form Start*/}
                    <div className="w-[25%]">
                        <div className="text-[12px] space-y-2 text-slate-800 font-semibold">
        
                            <div className="">
                                <p className="">ফান্ড :</p>
        
                                <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                                    <option value="" selected>ট্রেনিং ফান্ড</option>
                                    <option value="">সাধারণ ফান্ড</option>
                                </select>
                            </div>
                            <div className="">
                                <p className="text-slate-800 ">জে-লেজার :</p>
        
                                <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                                    <option value="" selected>লেজার</option>
                                    <option value="">লেজার</option>
                                </select>
                            </div>
                            <div className="">
                                <p className="text-slate-800 ">সাব-লেজার :</p>
        
                                <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                                    <option value="">লেজার </option>
                                    <option value="">লেজার </option>
                                </select>
                            </div>
                            <div>
                                <p className="text-slate-800">
                                    পে-খাতের নাম {" "}
                                </p>
                                <input
                                    type={'text'}
                                    placeholder={""}
                                    className="border border-slate-200 bg-[#EDEDED] w-full"
                                />
                            </div>
                            <div>
                                <p className="text-slate-800">
                                    সিরিয়াল  {" "}
                                </p>
                                <input
                                    type={'text'}
                                    placeholder={""}
                                    className="border border-slate-200 bg-[#EDEDED] w-full"
                                />
                            </div>
                        </div>
        
                        <div className='text-center flex gap-10'>
                            <button className='bg-slate-600  px-3 py-1 text-white rounded-sm mt-4 text-[14px]'>
                                Save
                            </button>
                            <button className='bg-slate-600  px-3 py-1 text-white rounded-sm mt-4 text-[14px]'>
                                New
                            </button>
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