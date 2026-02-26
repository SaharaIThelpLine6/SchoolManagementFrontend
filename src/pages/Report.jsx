import { FormProvider, useForm } from "react-hook-form"
import DefaultGreen from "../components/Button/DefaultGreen"
import DefaultSelect from "../components/Forms/DefaultSelect"

const Report = () => {
    const methods = useForm()
    return (
        <FormProvider {...methods}>

      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-SolaimanLipi">

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
        </FormProvider>
    )
}

export default Report