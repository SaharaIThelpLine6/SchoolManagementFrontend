const AdmissionRegistration = () => {
    return (
        <div className="pt-10 text-center place-items-center font-SolaimanLipi">

            <form className="w-[60%] shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md">
                <div className="bg-[#307847] font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 ">ভর্তি রেজিস্ট্রেশন</h1>
                </div>

                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                <div className="w-full relative group border-2 border-stroke rounded-[5px] hover:border-[#2a394f] hover:border-[2px] hover:rounded-[5px]">
                        <select type="" id="username" required
                            className="appearance-none w-full h-12 block relative cursor-pointer px-4 text-sm peer bg-transparent outline-none"
                        >
                            <option value="" className=" text-body disabled"></option>
                            <option className="text-body bg-slate-300 hover:bg-slate-200">
                                abc
                            </option>
                            <option className="text-body">
                                lmn
                            </option>
                        </select>
                        <label
                            className=" transform transition-all absolute top-0 left-0 h-full flex items-center pl-3 text-sm text-[rgb(0,0,0,0.50)] group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-full peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                        >
                            আইডি
                        </label>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
                        >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M6 10l6 6l6 -6h-12" />
                        </svg>
                    </div>

                    <div className="">
                        <button type="submit" className="bg-[#E0E0E0] text-slate-400 py-[10px] px-16 rounded-md">দাখিল করুন</button>
                    </div>

                </div>


            </form>
        </div>
    )
}

export default AdmissionRegistration;