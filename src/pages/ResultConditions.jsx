import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultGreen from "../components/Button/DefaultGreen";
import AverageResultNav from "../components/AverageResultNav/AverageResultNav";

const ResultConditions = () => {
    return (
        <div className="px-2 -mt-[25px] text-slate-800 text-[14px] xl:text-[16px] font-SolaimanLipi">
            {/*Navbar Link*/}
            <AverageResultNav />

            {/* Form*/}
            {/*Heading Form Start*/}
            <form action="">
                <div className="gap-3 mt-1 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    শিক্ষাবর্ষ :

                                </p>
                            }
                            options={[
                                { id: '1', value: "2025", },
                                { id: '2', value: "2025-2026" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    পরীক্ষা :

                                </p>
                            }
                            options={[
                                { id: '1', value: "১ম সাময়িক পরীক্ষা", },
                                { id: '2', value: "২য় সাময়িক পরীক্ষা" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    মারহালা/ক্লাস :

                                </p>
                            }
                            options={[
                                { id: '1', value: "প্লে(ক)", },
                                { id: '2', value: "প্লে(খ)" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    ক্লাসের ধরণ :

                                </p>
                            }
                            options={[
                                { id: '1', value: "দরসিয়াত", },
                                { id: '2', value: "হিফয" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                </div>
            </form>
            {/*Heading Form End*/}

            {/*Condition 1st Start*/}
            <form action="" className="">
                {/*Condition-1 row start*/}
                <div className="my-5 px-1">
                    <div className="flex gap-2 pt-2 items-center justify-center w-full">
                        <input
                            type={'checkbox'}
                            placeholder={""}
                        />
                        <span className="text-slate-800 font-semibold">কন্ডিশন-১ : গর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত</span>
                    </div>
                    <div className="grid xl:grid-cols-2">
                        <div className="flex items-center gap-1 ">
                            <span className="">গড় মিয়ারীর যে কোন </span>
                            <input
                                type={'text'}
                                placeholder={""}
                                className="border border-slate-500 max-w-[60px] outline-none"
                            />
                            <span className="">কিতাবে অথবার এর চেয়ে কম ফেল করে তাহলে </span>
                        </div>
                        <div className="">
                            <div className="flex gap-2">
                                <div>
                                    <p className="text-center">বাংলা</p>
                                    <div className="flex items-center gap-1 ">
                                        <DefaultInput
                                            type={'text'}
                                            placeholder={""}
                                            registerKey={"Average"}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="pl-16">আরবী</p>
                                    <div className="flex items-center gap-1 ">
                                        <DefaultInput
                                            type={'text'}
                                            placeholder={""}
                                            registerKey={"Average"}
                                        />
                                        <span className="">হবে।</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            id="silver-color-checkbox"
                                        />
                                        <label htmlFor="silver-color-checkbox" className="min-w-[80px] xl:min-w-[100px]">
                                            Silver Color
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-2">
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                            <span className="">হবে।</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                id="silver-color-checkbox"
                                            />
                                            <label htmlFor="silver-color-checkbox" className="min-w-[80px] xl:min-w-[100px]">
                                                Silver Color
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Condition-1 row end*/}
                {/*Condition-2 row start*/}
                <div className="bg-slate-100 py-2 my-5 px-1">
                    <div className="flex gap-2 pt-2 items-center justify-center w-full">
                        <input
                            type={'checkbox'}
                            placeholder={""}
                        />
                        <span className="text-slate-800 font-semibold">কন্ডিশন-২ : মি'ইয়ারী কিতাবে ফেল সংক্রান্ত</span>
                    </div>
                    <div className="grid xl:grid-cols-2">
                        <div className="flex items-center gap-1 ">
                            <span className="">মি'ইয়ারী যে কোন</span>
                            <input
                                type={'text'}
                                placeholder={""}
                                className="border border-slate-500 max-w-[60px] outline-none"
                            />
                            <span className="">কিতাবে ফেল করে তাহলে </span>
                        </div>
                        <div className="">
                            <div className="flex gap-2">
                                <div>
                                    <div className="flex items-center gap-1 ">
                                        <DefaultInput
                                            type={'text'}
                                            placeholder={""}
                                            registerKey={"Average"}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 ">
                                        <DefaultInput
                                            type={'text'}
                                            placeholder={""}
                                            registerKey={"Average"}
                                        />
                                        <span className="">হবে।</span>
                                        <div className="min-w-[117px]"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex gap-2">
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                            <span className="">হবে।</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                id="silver-color-checkbox"
                                            />
                                            <label htmlFor="silver-color-checkbox" className="min-w-[80px] xl:min-w-[100px]">
                                                Silver Color
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Condition-2 row end*/}
                {/*Condition-3 row start*/}
                <div className="my-5 px-1">
                    <div className="flex gap-2 pt-2 items-center justify-center w-full">
                        <input
                            type={'checkbox'}
                            placeholder={""}
                        />
                        <span className="text-slate-800 font-semibold">কন্ডিশন-৩ : অধিকতর মি'ইয়ারী কিতাবে ফেল সংক্রান্ত</span>
                    </div>
                    <div className="grid xl:grid-cols-2">
                        <div className="flex items-center gap-1 ">
                            <span className="">যে কোন</span>
                            <input
                                type={'text'}
                                placeholder={""}
                                className="border border-slate-500 max-w-[60px] outline-none"
                            />
                            <span className="">টি কিতাবে ফেল করে তাহলে </span>
                        </div>
                        <div className="">
                            <div>
                                <div className="flex gap-2">
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                            <span className="">হবে।</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                id="silver-color-checkbox"
                                            />
                                            <label htmlFor="silver-color-checkbox" className="min-w-[80px] xl:min-w-[100px]">
                                                Silver Color
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Condition-3 row end*/}
                {/*Condition-4 row start*/}
                <div className="bg-slate-100 py-2 px-1 my-5">
                    <div className="flex gap-2 pt-2 items-center justify-center w-full">
                        <input
                            type={'checkbox'}
                            placeholder={""}
                        />
                        <span className="text-slate-800 font-semibold">কন্ডিশন-৪ : (যদি কোন এক বিষয়ে নাম্বার এন্ট্রি না হয়)</span>
                    </div>
                    <div className="grid xl:grid-cols-2">
                        <div className="items-center">
                            <span className="">যদি কোন এক বিষয়ে নাম্বার এন্ট্রি বাকি থাকে তাহলে ডিভিশন হবে</span>
                        </div>
                        <div className="">
                            <div>
                                <div className="flex gap-2">
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                            <span className="">হবে।</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                id="silver-color-checkbox"
                                            />
                                            <label htmlFor="silver-color-checkbox" className="min-w-[80px] xl:min-w-[100px]">
                                                Silver Color
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Condition-4 row end*/}
                {/*Last condition start*/}
                <div className="bg-slate-100 py-2 px-1 my-5">
                    <div className="grid xl:grid-cols-2">
                        <div className="items-center">
                            <span className="">মেধার সংখ্যা কত হবে তা উল্লেখ করুন।</span>
                        </div>
                        <div className="">
                            <div>
                                <div className="flex gap-2">
                                    <div>
                                        <div className="flex items-center gap-1 ">
                                            <DefaultInput
                                                type={'text'}
                                                placeholder={""}
                                                registerKey={"Average"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*Last condition end*/}
                {/*Button Start*/}
                <div className="flex gap-3 my-2 justify-center">
                    <DefaultGreen submitButtonGreen={"Save All"} />
                    <DefaultGreen submitButtonGreen={"New"} />
                </div>
                {/*Button End*/}
            </form>
            {/*Condition 1st End*/}
            {/*All Form End*/}


        </div>
    );
};

export default ResultConditions;
