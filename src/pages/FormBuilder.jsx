import React, { useEffect } from 'react';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';
import DynamicForm from '../components/Forms/DynamicForm';
const API_URL = import.meta.env.VITE_SERVER_URL;
const FormBuilder = () => {
    const items = [{ id: 1, formname: "Form 1", formpath: "/admition-form" }, { id: 2, name: "Form 2", formpath: "/salary-form" }];
    const { control, handleSubmit, watch, register, setValue, reset } = useForm({
        defaultValues: {
            fields: [
                {
                    serial: 1,
                    type: "input",
                    title: "User Name",
                    key: "username",
                    options: [],
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({ control, name: "fields" });
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_URL}/get_fields/kom`) // Replace with your actual API endpoint
            .then((response) => response.json())
            .then((data) => {
                console.log("Fetched Data:", data);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            });
    }, []);

    // const { data: fieldsData = [], isLoading, isError, error } = useQuery({
    //     queryKey: ["usersData"],
    //     queryFn: () => fetchField(),
    // })
    // useEffect(() => {
    //     // reset(fieldsData)
    //     console.log(fieldsData);
    //     if (fieldsData.length) {
    //         reset({ fields: fieldsData })
    //     }

    // }, [fieldsData])
    // const mutation = useMutation({
    //     mutationFn: ({ formData }) => insertNewField(formData),
    //     onSuccess: (response) => {
    //         console.log('Registration successful:', response);
    //         navigate("/admin/users");
    //     },
    //     onError: (error) => {
    //         console.error('Registration failed:', error.response?.data || error.message);
    //     },
    // });

    const onSubmit = async (formData) => {
        try {
            const response = await fetch(`${API_URL}/create-form`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Form submitted successfully:", result);
                navigate(0)
            } else {
                alert(result.message);
                console.error("Error submitting form:", result);
            }
        } catch (error) {
            alert(error.message);
            console.error("Request failed:", error);
        }
    };


    const handleAddOption = (fieldIndex) => {
        const currentOptions = watch(`fields.${fieldIndex}.options`);
        setValue(`fields.${fieldIndex}.options`, [...currentOptions, { title: "", value: "" }]);
    };

    const handleRemoveOption = (fieldIndex, optionIndex) => {
        const currentOptions = watch(`fields.${fieldIndex}.options`);
        const updatedOptions = currentOptions.filter((_, i) => i !== optionIndex);
        setValue(`fields.${fieldIndex}.options`, updatedOptions);
    };
    const moveComponent = (index, direction) => {
        const currentFields = watch("fields");

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentFields.length) return;

        // Swap the fields
        const updatedFields = [...currentFields];
        [updatedFields[index], updatedFields[targetIndex]] = [updatedFields[targetIndex], updatedFields[index]];
        // console.log(updatedFields);
        updatedFields.forEach((field, i) => (field.serial = i + 1));
        // Update the fields state with the swapped array
        setValue("fields", updatedFields);
    };


    // if (isLoading) {
    //     return <div>Loading...</div>
    // }
    // if (fieldsData) {
    //     console.log(fieldsData);
    //     reset(fieldsData)

    // }
    return (
        <div className="pb-[100px]">
            <form onSubmit={handleSubmit(onSubmit)} className="max-w-[800px] mx-auto">
                <div className="px-[10px] pt-[50px] min-h-screen overflow-hidden m-0 bg-cover bg-no-repeat bg-center flex flex-col justify-between">
                    <div className="w-full">
                        <div className="mb-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Form Name
                                </label>
                                <input
                                    {...register(`formname`)}
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Form path
                                </label>
                                <input
                                    {...register(`formpath`)}
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                />
                            </div>

                        </div>
                        <main className="flex-grow flex flex-col items-center justify-center gap-6 px-4">


                            {fields.map((field, index) => (
                                <div key={field.id} className="w-full">
                                    <div className="flex gap-4 justify-start">
                                        <div className="flex items-center gap-2">
                                            <div onClick={() => { moveComponent(index, "down") }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 64 64">
                                                    <rect width="64" height="64" fill="none" />
                                                    <path d="M32 2C15.432 2 2 15.432 2 32s13.432 30 30 30s30-13.432 30-30S48.568 2 32 2m0 47L16 33.695h10.857V15h10.285v18.695H48z" />
                                                </svg>
                                            </div>
                                            <div onClick={() => { moveComponent(index, "up") }}>
                                                <svg className="rotate-180" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 64 64">
                                                    <rect width="64" height="64" fill="none" />
                                                    <path d="M32 2C15.432 2 2 15.432 2 32s13.432 30 30 30s30-13.432 30-30S48.568 2 32 2m0 47L16 33.695h10.857V15h10.285v18.695H48z" />
                                                </svg>
                                            </div>
                                        </div>
                                        {/* Field Type */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                                Field Type
                                            </label>
                                            <select
                                                {...register(`fields.${index}.type`)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[100px]"
                                            >
                                                <option value="input">Input</option>
                                                <option value="email">Email</option>
                                                <option value="file">File</option>
                                                <option value="list">List</option>
                                                <option value="select">Select</option>
                                            </select>
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                                Title
                                            </label>
                                            <input
                                                {...register(`fields.${index}.title`)}
                                                type="text"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            />
                                        </div>

                                        {/* Key */}
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                                Key
                                            </label>
                                            <input
                                                {...register(`fields.${index}.key`)}
                                                type="text"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block mb-2 text-sm font-medium text-gray-900">
                                                Data Require
                                            </label>
                                            <select
                                                {...register(`fields.${index}.required`)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 min-w-[100px]"
                                            >
                                                <option value={true}>Require</option>
                                                <option value={false}>Not Require</option>
                                            </select>
                                        </div>

                                        {/* Remove Field */}
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-[30px]"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                        </button>
                                    </div>

                                    {/* Options for Select Type */}
                                    {watch(`fields.${index}.type`) === "select" && (
                                        <div className="mt-5 ml-[80px]">
                                            <h4 className="mb-2 text-sm font-medium text-gray-900">
                                                Selectable Options
                                            </h4>
                                            {watch(`fields.${index}.options`)?.map((option, optIndex) => (
                                                <div key={optIndex} className="flex gap-4 items-center justify-start mb-2">
                                                    <div className="w-[260px]">
                                                        <label className="block mb-2 text-sm font-medium text-gray-900">
                                                            Title
                                                        </label>
                                                        <input
                                                            {...register(`fields.${index}.options.${optIndex}.title`)}
                                                            type="text"
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        />
                                                    </div>

                                                    <div className="w-[260px]">
                                                        <label className="block mb-2 text-sm font-medium text-gray-900">
                                                            Value
                                                        </label>
                                                        <input
                                                            {...register(`fields.${index}.options.${optIndex}.value`)}
                                                            type="text"
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(index, optIndex)}
                                                        className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-[30px]"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(index)}
                                                className="relative inline-flex items-center justify-center p-3 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path d="M12 5l0 14" />
                                                    <path d="M5 12l14 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}

                                    {watch(`fields.${index}.type`) === "list" && (
                                        <div className="mt-5 ml-[80px]">
                                            <h4 className="mb-2 text-sm font-medium text-gray-900">
                                                Selectable Options
                                            </h4>
                                            {watch(`fields.${index}.options`)?.map((option, optIndex) => (
                                                <div key={optIndex} className="flex gap-4 items-center justify-start mb-2">
                                                    <div className="w-[260px]">
                                                        <label className="block mb-2 text-sm font-medium text-gray-900">
                                                            Title
                                                        </label>
                                                        <input
                                                            {...register(`fields.${index}.options.${optIndex}.title`)}
                                                            type="text"
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        />
                                                    </div>

                                                    <div className="w-[260px]">
                                                        <label className="block mb-2 text-sm font-medium text-gray-900">
                                                            Value
                                                        </label>
                                                        <input
                                                            {...register(`fields.${index}.options.${optIndex}.value`)}
                                                            type="text"
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveOption(index, optIndex)}
                                                        className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-[30px]"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(index)}
                                                className="relative inline-flex items-center justify-center p-3 mb-2 me-2 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-plus">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                    <path d="M12 5l0 14" />
                                                    <path d="M5 12l14 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Add New Field */}
                            <div className="flex gap-5">
                                <button
                                    type="button"
                                    onClick={() =>
                                        append({ type: "input", title: "", key: "", options: [] })
                                    }
                                    className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                >
                                    Add New Field
                                </button>
                                <div className="text-center">
                                    <button
                                        type="submit"
                                        className="text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>


            </form>
            <DynamicForm />
            {/* <Footer /> */}
        </div>
    )
};

export default FormBuilder;