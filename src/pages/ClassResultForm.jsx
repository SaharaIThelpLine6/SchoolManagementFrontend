const ClassResultForm = () => {
    return (
        <div className=" lg:pt-10 text-center place-items-center font-SolaimanLipi">
            <form className="w-[60%] bg-white shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md">
                <div className="bg-[#307847] font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 ">ক্লাশ/মারহালা ভিত্তিক ফলাফল</h1>
                </div>
                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                    {/* <div className="w-full mb-2">
                        <div className="relative z-20 bg-transparent">
                            <fieldset className="border border-stroke rounded">
                                <legend className="text-left text-[12px]">
                                    শিক্ষাবর্ষ
                                </legend>
                                <select
                                    className={`relative z-20 w-full appearance-none bg-transparent py-2 px-4 outline-none `}
                                >
                                    <option className="text-body">
                                        শিক্ষাবর্ষ
                                    </option>
                                    <option className="text-body">
                                        abc
                                    </option>
                                    <option className="text-body">
                                        lmn
                                    </option>
                                </select>
                                <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                                    <svg
                                        className="fill-current"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <g opacity="0.8">
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                                fill=""
                                            ></path>
                                        </g>
                                    </svg>
                                </span>
                            </fieldset>
                        </div>
                    </div> */}

                    <div className="w-full relative group border border-stroke rounded-[5px] hover:border-[#2a394f] hover:outline hover:outline-[1px] hover:rounded-[5px]">
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
                            শিক্ষাবর্ষ
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

                    <div className="w-full relative group border border-stroke rounded-[5px] hover:border-[#2a394f] hover:outline hover:outline-[1px] hover:rounded-[5px]">
                        <select type="" id="username" required
                            className="appearance-none w-full h-12 px-4 text-sm peer bg-transparent outline-none"
                        >

                            <option value="" className="text-body disabled"></option>
                            <option className="text-body">
                                abc
                            </option>
                            <option className="text-body">
                                lmn
                            </option>
                        </select>
                        <label
                            className=" transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-sm text-[rgb(0,0,0,0.50)] group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-full peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                        >
                            পরীক্ষা
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


                    <div className="w-full relative group border border-stroke rounded-[5px] hover:border-[#2a394f] hover:outline hover:outline-[1px] hover:rounded-[5px]">
                        <select type="" id="username" required
                            className="appearance-none w-full h-12 px-4 text-sm peer bg-transparent outline-none"
                        >
                            <option value="" className="text-body disabled"></option>
                            <option className="text-body">
                                abc
                            </option>
                            <option className="text-body">
                                lmn
                            </option>
                        </select>
                        <label
                            className=" transform transition-all absolute top-0 left-0 h-full flex items-center pl-2 text-sm text-[rgb(0,0,0,0.50)] group-focus-within:text-xs peer-valid:text-xs group-focus-within:h-1/2 peer-valid:h-1/2 group-focus-within:-translate-y-full peer-valid:-translate-y-full group-focus-within:pl-0 peer-valid:pl-0"
                        >
                            মারহালা
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

export default ClassResultForm;