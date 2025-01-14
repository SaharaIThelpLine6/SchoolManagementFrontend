import DefaultGray from "../components/Button/DefaultGray";
import DefaultInput from "../components/Forms/DefaultInput";
import DefaultSelect from "../components/Forms/DefaultSelect";


const GroupDistribution = () => {
    const saveButton = "Save";
    return (
        <div className="px-5 py-0 space-y-1 text-slate-600 text-[14px]">
            <nav className="bg-[#F0F0F0]">
                <ul className="flex gap-2 p-2">
                    <li><a href="">গ্রুপ বন্টন</a></li>
                    <li><a href="">গ্রুপ পরিবর্তন</a></li>
                </ul>
            </nav>

            {/*Form*/}
            <form className="bg-[#f8fbfd]">
                <div className="w-full gap-5 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                                { id: '3', value: "2026" },
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
                                    মারহালা/ক্লাশ:

                                </p>
                            }
                            options={[
                                { id: '1', value: "Play", },
                                { id: '2', value: "Nursery" },
                                { id: '3', value: "Nurani" },
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
                                    লিঙ্গ:

                                </p>
                            }
                            options={[
                                { id: '1', value: "Male", },
                                { id: '2', value: "Female" },
                                { id: '3', value: "Common" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>

                    <div className="">
                        <DefaultInput label={"ই-মেইল :"} type={'email'} placeholder={""} registerKey={"email"} />
                    </div>

                    <div className="">
                        <DefaultSelect
                            label={
                                <p className="text-slate-800">
                                    Class :

                                </p>
                            }
                            options={[
                                { id: '1', value: "A", },
                                { id: '2', value: "B" },
                                { id: '3', value: "C" },
                                { id: '3', value: "D" },
                            ]}
                            valueField={"id"}
                            nameField={"value"}
                            registerKey={"class"}
                        />
                    </div>
                </div>
                {/*Button start*/}
                <div className="flex">
                    <DefaultGray submitButton={saveButton} />
                </div>
                {/*Button end*/}

            </form>
        </div>
    )
}

export default GroupDistribution;