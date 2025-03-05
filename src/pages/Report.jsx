import DefaultGreen from "../components/Button/DefaultGreen"
import DefaultSelect from "../components/Forms/DefaultSelect"

const Report = () => {
    return (
        <div className="font-lato">
            {/*Find form Start*/}
            <div className="px-5">

                <div className="text-sm gap-5 w-full grid grid-cols-3 text-black font-normal">
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

                <div className='py-3'>
                    <DefaultGreen submitButtonGreen={"Preview"}/>
                </div>

            </div>
            {/*Find form End*/}

        </div>
    )
}

export default Report