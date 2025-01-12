import Keyword from "../components/Keywords/Keywords"

const Query = () => {
    return (
        <div>
            <div className="border border-blue-400 p-3 mt-10 mx-auto w-[50%]">
                <h1 className="text-center text-3xl font-semibold mb-2">Query Table</h1>
                <div>
                    <form action="" className="grid grid-cols-1 space-y-1">
                        <label htmlFor="" className="">DB_HOST</label>
                        <input type="text" name="" id="" className="border border-slate-300"/>

                        <label htmlFor="">DB_USER</label>
                        <input type="text" name="" id="" className="border border-slate-300"/>

                        <label htmlFor="">DB_PASSWORD</label>
                        <input type="text" name="" id="" className="border border-slate-300"/>

                        <label htmlFor="">DB_NAME</label>
                        <input type="text" name="" id="" className="border border-slate-300"/>

                        <div className="flex gap-3">
                        <label htmlFor="">TABLE_NAME</label>
                        <input type="text" name="" id="" className="border border-slate-300"/>

                        {/* <label htmlFor="">TAG_NAMES</label>
                        <input type="text" name="" id="" className="border border-slate-300"/> */}

                        <Keyword title={"COLUMN NAMES"} field_prefix={"COLUMN"}/>

                        <button className="border border-slate-300 p-2 w-[10%] h-8 bg-black text-white items-center">+</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Query