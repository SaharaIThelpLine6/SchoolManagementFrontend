

const GroupDistribution = () => {
    return (
        <div className="px-5 py-0 space-y-1 text-slate-500 text-[14px]">
            <nav className="bg-[#F0F0F0]">
                <ul className="flex gap-2 p-2">
                    <li><a href="">গ্রুপ বন্টন</a></li>
                    <li><a href="">গ্রুপ পরিবর্তন</a></li>
                </ul>
            </nav>

            {/*Form*/}
            <div className="bg-[#f8fbfd] py-1 px-1 grid grid-cols-2 gap-5">
                {/*First Column Start*/}
                <div className="space-y-2 w-full">
                    <div className=" flex w-full gap-2 justify-between">
                        <label>শিক্ষাবর্ষ :</label>

                        <select className="bg-slate-200 py-0 px-2 w-[80%]">
                            <option value="">2025</option>
                            <option value="">2025-2026</option>
                            <option value="">2026</option>
                            <option value="" selected>2026-2027</option>
                        </select>
                    </div>

                    <div className=" flex gap-2 justify-between">
                        <label>মারহালা/ক্লাশ:</label>

                        <select className="bg-slate-200 py-0 px-2 w-[80%]">
                            <option value="">Play</option>
                            <option value="">Nursery</option>
                            <option value="">Nurani</option>
                            <option value="" selected>Kitab</option>
                        </select>
                    </div>
                    <div className=" flex gap-2 justify-between">
                        <label>লিঙ্গ:</label>

                        <select className="bg-slate-200 py-0 px-2 w-[80%]">
                            <option value="">Male</option>
                            <option value="">Female</option>
                            <option value="">Common</option>
                        </select>
                    </div>
                </div>
                {/*First Column End*/}

                {/*Second Column Start*/}
                <div className="space-y-2">

                    <div className="flex gap-2 justify-between ">
                        <label> ই-মেইল :</label>
                        <div className="w-[80%]">
                            <input type="text" className="w-full border border-slate-200 rounded-sm"/>
                        </div>
                    </div>

                    <div className=" flex gap-2 justify-between">
                        <label>Class :</label>

                        <select className="bg-slate-200 py-0 px-2 w-[80%]">
                            <option value="volvo">A</option>
                            <option value="saab">B</option>
                            <option value="vw">C</option>
                            <option value="audi" selected>D</option>
                        </select>
                    </div>

                    <div className="bg-[#3A5ECA] float-end  text-center mt-2 w-[80%] cursor-pointer text-white">
                        <button type="button">Save</button>
                    </div>
                </div>
                {/*Second Column End*/}
            </div>
        </div>
    )
}

export default GroupDistribution;