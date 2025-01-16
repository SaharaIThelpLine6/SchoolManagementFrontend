import DefaultGray from "../components/Button/DefaultGray"
import DefaultSelect from "../components/Forms/DefaultSelect"

const Report = () => {
    return (
        <div>
            {/*Find form Start*/}
            <div className="px-5">

                <div className="text-[12px] gap-5 w-full grid grid-cols-3 text-slate-800 font-semibold">
                    <div className="">
                        <DefaultSelect
                            type={""}
                            label={"রিপোর্ট সমূহ :"}
                            registerKey={"Reports"}
                        />
                    </div>
                    <div className="">
                        <DefaultSelect 
                        type={""}
                        label={"অর্থ বছর :"}
                        registerKey={"financialYear"}
                        />
                    </div>

                    <div className="">
                        <DefaultSelect 
                        type={""}
                        label={"মাসের নাম :"}
                        registerKey={"Months"}
                        />
                    </div>
                   
                </div>

                <div className='text-center flex gap-10'>
                    <DefaultGray submitButton={"Preview"}/>
                </div>

            </div>
            {/*Find form End*/}

        </div>
    )
}

export default Report