const Result = () => {
    return (
        <div className=" pt-20 lg:pt-10 px-8 lg:px-0 mx-auto w-full lg:w-[60%] text-center place-items-center font-SolaimanLipi">

            <form className="w-full  shadow-[rgba(0,0,0,0.5)_0px_1px_0px_0px] rounded-md">
                <div className="bg-[#307847] font-semibold rounded-t-md">
                    <h1 className="text-white text-2xl py-4 ">ব্যক্তিগত ফলাফল</h1>
                </div>

                <div className=" px-[14px] text-[14px] text-slate-600 border border-slate-200 space-y-8 pt-[26px] pb-[24px]">

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">
                            {
                                <select
                                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary`}
                                >
                                    <option value="" className="text-body">শিক্ষাবর্ষ</option>

                                    <option className="text-body">
                                        abc
                                    </option>
                                    <option className="text-body">
                                        lmn
                                    </option>
                                </select>
                            }
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
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">
                            {
                                <select
                                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary`}
                                >
                                    <option value="" className="text-body">পরীক্ষা</option>

                                    <option className="text-body">
                                        abc
                                    </option>
                                    <option className="text-body">
                                        lmn
                                    </option>
                                </select>
                            }
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
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="relative z-20 bg-transparent">
                            {
                                <select
                                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-4 px-4 outline-none transition focus:border-primary active:border-primary`}
                                >
                                    <option value="" className="text-body">মারহালা</option>

                                    <option className="text-body">
                                        abc
                                    </option>
                                    <option className="text-body">
                                        lmn
                                    </option>
                                </select>
                            }
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
                        </div>
                    </div>

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

export default Result;