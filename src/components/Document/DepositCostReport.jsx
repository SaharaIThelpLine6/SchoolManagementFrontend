import React, { useEffect } from 'react'
import { Buffer } from 'buffer';
export default function DepositCostReport({ orderDetails }) {
    useEffect(() => {
        console.log(orderDetails);

    }, [orderDetails])
    const bufferConveter = (bufferData) => {
        const buffer = Buffer.from(bufferData);
        const base64String = buffer.toString('base64');
        const imageSrc = `data:image/png;base64,${base64String}`;
        return imageSrc
    }
    return (
        <div className='w-[1076px] h-[750px] mx-auto relative bg-white font-SolaimanLipi landscape-page bg-[#f8f8f8] p-4 show_in_print'>
            <div className="flex items-end w-full justify-start">
                <div className="logo w-[70px] absolute left-[40px]">
                    <img src={bufferConveter(orderDetails[0].Logo.data)} alt="logo" />
                </div>
                <div className='text-center w-full'>
                    <h2 className='text-[24px] text-[#ffc080]'>{orderDetails[0].InstitutionName}</h2>
                    <p className='text-[16px] leading-[38px]'>{orderDetails[0].Address}</p>
                    <p>{orderDetails[0].ContactNumber}</p>
                </div>

            </div>
            {orderDetails[0].CAID == 1 ?  <div className="text-center relative mt-4 before:content-['']  before:absolute before:top-1/2 before:left-0 before:bg-[#ffc080] before:h-[2px]  before:w-full">
                <h3 className='text-center text-[20px] font-bold rounded-[50px] border-[#ffc080] border-2 border-solid inline-block px-3 bg-[#fff] relative z-10'>ক্রেডিট ভাউচার</h3>
            </div> : <div className="text-center relative mt-4 before:content-['']  before:absolute before:top-1/2 before:left-0 before:bg-[#ffc080] before:h-[2px]  before:w-full">
                <h3 className='text-center text-[20px] font-bold rounded-[50px] border-[#ffc080] border-2 border-solid inline-block px-3 bg-[#fff] relative z-10'>ডেবিট ভাউচার</h3>
            </div>}
           
            <div className="flex justify-between w-full pt-2 pb-2">
                <p className='text-[18px] font-bold'>রসিদ নং : {orderDetails[0].VoucherNo}</p>
                <p className='text-[18px] font-bold'>বই নং : {orderDetails[0].BookNo}</p>
                <p className='text-[18px] font-bold'>তারিখ : {orderDetails[0].TransactionDateEng}</p>
            </div>
            <table className='w-full'>
                <thead>
                    <tr className='text-start'>
                        <th className='text-left border px-1 py-2 text-xl border-[#ffc008]'>ক্র:</th>
                        <th className='text-left border px-1 py-2 text-xl border-[#ffc008]'>জেনারেল লেজার</th>
                        <th className='text-left border px-1 py-2 text-xl border-[#ffc008]'>সাব লেজার</th>
                        <th className='text-left border px-1 py-2 text-xl border-[#ffc008]'>বিবরণ</th>
                        <th className='text-left border px-1 py-2 text-xl border-[#ffc008]'>পরিমান</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        orderDetails.map((orderdetail, index) => (
                            <tr key={index}>
                                <td className='text-[16px] px-1 py-2 border-x border-b border-[#999]'>{index + 1}</td>
                                <td className='text-[16px] px-1 py-2 border-x border-b border-[#999]'>{orderdetail.GlName}</td>
                                <td className='text-[16px] px-1 py-2 border-x border-b border-[#999]'>{orderdetail.SlName}</td>
                                <td className='text-[16px] px-1 py-2 border-x border-b border-[#999]'>{orderdetail.Particulars}</td>
                                <td className='text-[16px] px-1 py-2 border-x border-b border-[#999]'>{orderdetail.Amount}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <div className="flex items-start justify-between pr-4">
                <div className='border border-[#999] rounded-[6px] mt-4 w-[70%] py-2 px-2 h-auto min-h-[100px]'>
                        {orderDetails[0].Comment}
                </div>
                <h4 className='pt-[30px] text-[20px] font-bold'>মোট = <span className='ml-[30px] inline-block'>{orderDetails.reduce((sum, item) => sum + Number(item.Amount || 0), 0).toFixed(2)}</span></h4>
            </div>
            <h3 className='font-bold text-[20px] pt-4'>কথায় : <span className='font-normal'>{orderDetails[0].InWord}</span></h3>
{orderDetails[0].CAID == 1 ? <div className="flex justify-between pt-[70px]">
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Dr_Value1}</p>
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Dr_Value2}</p>
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Dr_Value3}</p>
            </div> : <div className="flex justify-between pt-[70px]">
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Cr_Value1}</p>
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Cr_Value2}</p>
                <p className='border-t border-[#ffc008] pl-[20px] pr-[20px]'>{orderDetails[0].Cr_Value3}</p>
            </div>}
            
        </div>
    )
}
