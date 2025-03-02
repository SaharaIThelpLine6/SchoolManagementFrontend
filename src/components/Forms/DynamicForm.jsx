import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
// import { button } from "@/components/ui/button";

const OptionValue = [
    { id: 1, fieldid: 2, title: "Book Name", value: "book_name" },
    { id: 2, fieldid: 2, title: "Class ID", value: "class_id" },
    { id: 3, fieldid: 3, title: "Book Name", value: "book_name_list" },
    { id: 4, fieldid: 3, title: "Class ID", value: "class_id_list" },
    { id: 5, fieldid: 4, title: "File 1", value: "File_1" },
    { id: 6, fieldid: 4, title: "File 1", value: "File_2" },
    { id: 7, fieldid: 4, title: "File 3", value: "File_3" },
    { id: 8, fieldid: 5, title: "name", value: "username" },
    { id: 9, fieldid: 5, title: "Class ID", value: "class_id" },
    { id: 10, fieldid: 5, title: "Section ID", value: "section_Id" },
    { id: 11, fieldid: 6, title: "student name", value: "username" },
    { id: 12, fieldid: 6, title: "Class ID", value: "class_id" },
];

const FieldValue = [
    {
        id: 1,
        formid: 1,
        serial: 1,
        type: "input",
        title: "User Name",
        key: "username",
        options: 0,
        required: "true",
    },
    {
        id: 2,
        formid: 1,
        serial: 2,
        type: "select",
        title: "User Req",
        key: "user_req",
        options: 1,
        required: "true",
    },
    {
        id: 4,
        formid: 1,
        serial: 4,
        type: "select",
        title: "file List",
        key: "file_list",
        options: 1,
        required: "true",
    },
    {
        id: 3,
        formid: 1,
        type: "list",
        serial: 3,
        title: "User Req List",
        key: "user_req_list",
        options: 1,
        required: "true",
    },
    {
        id: 5,
        formid: 1,
        type: "list",
        serial: 5,
        title: "User doubt List",
        key: "user_doubt_list",
        options: 1,
        required: "true",
    },
    {
        id: 6,
        formid: 1,
        type: "list",
        serial: 6,
        title: "User forward List",
        key: "user_forward_list",
        options: 1,
        required: "true",
    },
];
/**
 * 
 * @returns 
 * INSERT INTO [QMMSoftV10ForDevelopers].[dbo].[Fields] 
      ([formid], [type], [title], [key], [options], [required], [CreateAt], [UpdateAt])
VALUES 
      (9, 'input', 'User Name', 'username', 0, 1, GETDATE(), GETDATE()),
      (9, 'select', 'User Req', 'user_req', 1, 1, GETDATE(), GETDATE()),
	  (9, 'select', 'file List', 'file_list', 1, 0, GETDATE(), GETDATE()),
	  (9, 'list', 'User Req List', 'user_req_list', 1, 0, GETDATE(), GETDATE()),
	  (9, 'list', 'User doubt List', 'user_doubt_list', 1, 0, GETDATE(), GETDATE()),
	  (9, 'list', 'User forward List', 'user_forward_list', 1, 0, GETDATE(), GETDATE());
 */
const DynamicForm = () => {
    const { control, handleSubmit } = useForm();
    const getOptionsForField = (fieldid) => {
        return OptionValue.filter(option => option.fieldid === fieldid);
    };
    const onSubmit = (data) => {
        console.log(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {FieldValue.map((field) => {
                const options = getOptionsForField(field.id);

                // Handle list type field using useFieldArray
                if (field.type === 'list') {
                    const { fields, append } = useFieldArray({
                        control,
                        name: field.key, // Name should correspond to the field key in the form
                    });

                    return (
                        <div key={field.id}>
                            <label>{field.title}</label>
                            {/* Render a list of input rows */}
                            <div className="space-y-4">
                                {fields.map((item, index) => (
                                    <div className="flex space-x-2" key={item.id}>
                                        {options.map((option) => (
                                            <Controller
                                                key={option.id}
                                                name={`${field.key}[${index}].${option.value}`}
                                                control={control}
                                                defaultValue=""
                                                rules={{required: field.required === 'true' }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        className="border border-gray-300 p-2 rounded w-full"
                                                        placeholder={option.title}
                                                    />
                                                )}
                                            />
                                        ))}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => append({})}
                                    className="mt-2 text-blue-500 hover:text-blue-700"
                                >
                                    + Add more
                                </button>
                            </div>
                        </div>
                    );
                }

                // Handle other types (input, select, etc.)
                switch (field.type) {
                    case 'input':
                        return (
                            <div key={field.id}>
                                <label>{field.title}</label>
                                <Controller
                                    name={field.key}
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: field.required === 'true' }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="border border-gray-300 p-2 rounded w-full"
                                            placeholder={field.title}
                                        />
                                    )}
                                />
                            </div>
                        );

                    case 'select':
                        return (
                            <div key={field.id}>
                                <label>{field.title}</label>
                                <Controller
                                    name={field.key}
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: field.required === 'true' }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="border border-gray-300 p-2 rounded w-full"
                                        >
                                            <option value="">Select an option</option>
                                            {options.map((option) => (
                                                <option key={option.id} value={option.value}>
                                                    {option.title}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            </div>
                        );

                    default:
                        return null;
                }
            })}
            <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Submit
            </button>
        </form>
    );
};

export default DynamicForm;
