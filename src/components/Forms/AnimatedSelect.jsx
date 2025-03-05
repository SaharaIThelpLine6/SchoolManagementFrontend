import React from 'react';
import { useFormContext } from 'react-hook-form';
import bnBijoy2Unicode from '../../utils/conveter';

const AnimatedSelect = ({ registerKey, required, options, valueField, nameField, title }) => {
      const {
        register,
        watch,
        formState: { errors },
      } = useFormContext();
      const registerField = watch(registerKey)
    return (
        <div className="w-full relative group border border-stroke rounded-[5px] hover:border-theme-color hover:outline hover:outline-[0px] hover:rounded-[5px]">
            <select
                id={registerKey}
                required
                className={`animation_label relative z-20 w-full appearance-none rounded border-2 bg-transparent py-3 px-4 outline-none transition ease-linear duration-300
                    ${errors[registerKey] ? 'border-red-500 focus:border-[#f44336]' : 'border-stroke focus:border-primary'}`}
                {...register(registerKey, { required: required ? required : false })}
            >
                <option value="" className="text-body disabled:"></option>
                {
                    options && options.map((option, index) => (
                        <option key={option[valueField]} value={option[valueField]} className="text-body">
                            {bnBijoy2Unicode(option[nameField])}
                        </option>
                    ))
                }

            </select>
            <label
                htmlFor={registerKey}
                className={`transition-all absolute top-0 left-0 flex items-center pl-3 text-sm text-[rgb(0,0,0,0.50)] group-focus-within:text-xs peer-valid:text-xs group-focus-within:pl-0 peer-valid:pl-0 ${registerField ? 'text-xs pl-0 active' : ''}`}
            >
                {title}
            </label>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M6 10l6 6l6 -6h-12" />
            </svg>
        </div>
    );
};

export default AnimatedSelect;