const AdmissionRegistration = () => {
    return (
        <div className="pt-10 text-center place-items-center font-SolaimanLipi">

            <form className="w-[60%] shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md">
                <div className="bg-[#307847] font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 ">ব্যক্তিগত ফলাফল</h1>
                </div>

                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                    <div className="w-full">
                        {
                            <input
                                name="ID"
                                value="ID"
                                type="number"
                                placeholder="আইডি"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-4 px-4 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" />
                        }
                    </div>

                    <div className="">
                        <button type="button" className="bg-[#E0E0E0] text-slate-400 py-[10px] px-16 rounded-md">দাখিল করুন</button>
                    </div>

                </div>


            </form>
        </div>
    )
}

export default AdmissionRegistration;