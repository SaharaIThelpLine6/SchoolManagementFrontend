import React from 'react';
import { useFormContext } from 'react-hook-form';

const DefaultInput = ({ label, type, placeholder, registerKey, require }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className="w-full">
            <label htmlFor={registerKey} className="mb-2.5 block text-black">
                {label}
            </label>
            <input
                name={registerKey}

                type={type}
                placeholder={placeholder}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter"
                {...register(registerKey, {required: require ? require : false})}

            />
            {errors[registerKey] && errors[registerKey].message}
        </div>

    );
};

export default DefaultInput;