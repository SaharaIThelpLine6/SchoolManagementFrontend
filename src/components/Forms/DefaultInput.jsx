import React from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';

const DefaultInput = ({ label, type, placeholder, registerKey, require = false, disable = false }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const translate = useTranslate()
    const validateNumber = (value) => {
        return type === 'number' && isNaN(Number(value)) ? 'Please enter a valid number' : true;
    };

    return (
        <div className="w-full">
            <label htmlFor={registerKey} className="mb-1 block text-black">
                {translate(label)}
            </label>

            <input
                type={type === 'number' ? 'text' : type}
                placeholder={translate(placeholder)}
                className={`w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] py-1 px-1 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200`}
                {...register(registerKey, {
                    required: require ? `${label} is required` : false,
                    ...(type === 'number' && { validate: validateNumber }),
                })}
                disabled={disable}
            />

            {errors[registerKey] && <p className="text-red-500 text-sm mt-1">{errors[registerKey].message}</p>}
        </div>
    );
};

export default DefaultInput;
