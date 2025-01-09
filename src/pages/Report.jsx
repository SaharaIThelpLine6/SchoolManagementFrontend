const Report = () => {
    return (
        <div>
            {/*Find form Start*/}
            <div className="px-5">

                <div className="text-[12px] gap-5 w-full grid grid-cols-3 text-slate-800 font-semibold">
                    <div className="">
                        <p className="">রিপোর্ট সমূহ :</p>

                        <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                            <option value="" selected>১.বেতনশীট সকলের একত্রে</option>
                            <option value="">২.বেতনশীট ব্যক্তি আলাদা</option>
                        </select>
                    </div>
                    <div className="">
                        <p className="text-slate-800 ">অর্থ বছর :</p>

                        <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                            <option value="" selected>২০২৪-২০২৫</option>
                            <option value="">২০২৫</option>
                        </select>
                    </div>
                    <div className="">
                        <p className="text-slate-800 ">মাসের নাম :</p>

                        <select className="border border-slate-200 bg-[#EDEDED] w-full py-0.5 text-slate-600 font-normal text-[12px]">
                            <option value="">জানুয়ারি </option>
                            <option value="">ফেব্রুয়ারি </option>
                            <option value="">মার্চ </option>
                        </select>
                    </div>
                </div>

                <div className='text-center flex gap-10'>
                    <button className='bg-slate-500  px-5 py-2 text-white rounded-sm mt-4 text-[14px]'>
                        Pre View
                    </button>   
                </div>

            </div>
            {/*Find form End*/}

        </div>
    )
}

export default Report