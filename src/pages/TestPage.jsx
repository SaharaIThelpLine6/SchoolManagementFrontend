import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";

const TestPage = () => {
    const options1 = {
        option2A: [
            { value: "option1A", label: "Option 1A" },
            { value: "option1B", label: "Option 1B" },
        ],
        option2B: [
            { value: "option1C", label: "Option 1C" },
            { value: "option1D", label: "Option 1D" },
        ],
        option2C: [
            { value: "option1E", label: "Option 1E" },
            { value: "option1F", label: "Option 1F" },
        ],
        option2D: [
            { value: "option1G", label: "Option 1G" },
            { value: "option1H", label: "Option 1H" },
        ]
    }

    const options2 = {
        option3A: [
            { value: "option2A", label: "Option 2A" },
            { value: "option2B", label: "Option 2B" },
        ],
        option3B: [
            { value: "option2C", label: "Option 2C" },
            { value: "option2D", label: "Option 2D" },
        ]

    }
   

    const options3 = [
        { value: "option3A", label: "Option 3A" },
        { value: "option3B", label: "Option 3B" },
    ];
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        resetField,
        formState: { errors },
    } = useFormContext();

    const field1Value = watch("DivisionID");
    const field2Value = watch("DivisionID2");
    // Reset logic
    useEffect(() => {
        setValue("DivisionID2", "");
        setValue("DivisionID3", "");
    }, [field1Value, setValue]);

    useEffect(() => {
        setValue("DivisionID3", "");
    }, [field2Value, setValue]);

    const onSubmit = (data) =>{
        console.log(data);
        
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="font-lato">
                <DefaultSelect label={"বিভাগ"} options={options3} registerKey={"DivisionID"} valueField={"value"} nameField={"label"} />

                <DefaultSelect label={"বিভাগ"} options={options2[field1Value]} registerKey={"DivisionID2"} valueField={"value"} nameField={"label"} />

                <DefaultSelect label={"বিভাগ"} options={options1[field2Value]} registerKey={"DivisionID3"} valueField={"value"} nameField={"label"} />
            </form>
        </div>
    )
}

export default TestPage