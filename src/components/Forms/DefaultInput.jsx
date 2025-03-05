import React from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';

const DefaultInput = ({ label, type, placeholder, registerKey, require = false, disable = false }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    const translate = useTranslate();

    const validateNumber = (value) => {
        return type === 'number' && isNaN(Number(value)) ? 'Please enter a valid number' : true;
    };

    return (
        <div className="w-full">
            <label htmlFor={registerKey} className="mb-1 block text-black font-SolaimanLipi">
                {translate(label)}
            </label>

            <input
                type={type === 'number' || type === 'phone' ? 'number' : 'text'}
                placeholder={translate(placeholder)}
                className={`w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-1 text-black outline-none text-[20px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200 ${errors[registerKey] && 'placeholder:text-red-400 border-red-400'}`}
                {...register(registerKey, {
                    required: require ? require : false,
                    ...(type === 'number' && { validate: validateNumber }),
                    ...(type === 'phone' && {
                        pattern: {
                            value: /^\d{11}$/, // Ensures exactly 11 digits
                            message: 'Phone number must be exactly 11 digits',
                        },
                    }),
                })}
                disabled={disable}
            />

            {errors[registerKey] && <p className="text-red-500 text-sm mt-1">{errors[registerKey].message}</p>}
        </div>
    );
};

export default DefaultInput;
