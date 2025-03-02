// import React, { useState, useEffect } from 'react';
// import { useFormContext } from 'react-hook-form';
// import useTranslate from '../../utils/Translate';

// const DefaultSelect = ({ label, type, options, registerKey, require, valueField, nameField }) => {
//   const {
//     register,
//     formState: { errors },
//   } = useFormContext();

//   const translate = useTranslate()

//   const [isOpen, setIsOpen] = useState(false);

//   const toggleDropdown = () => {
//     setIsOpen(!isOpen);
//   }

//   // Close dropdown when clicking outside start
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       const dropdown = document.getElementById(`${registerKey}-dropdown`)
//       if (dropdown && !dropdown.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [registerKey]);
//   // Close dropdown when clicking outside end
//   return (
//     <div className="w-full">
//       <label htmlFor={registerKey} className="mb-1 block text-black ">
//         {label}
//       </label>

//       <div
//         id={`${registerKey}-dropdown`}
//         className="relative z-20 bg-transparent">
//         {
//           type === 'number' ? <select
//             name={registerKey}
//             {...register(registerKey, { required: require ? require : false, valueAsNumber: true })}
//             onClick={toggleDropdown}
//             defaultValue={""}
//             className={`relative z-20  w-full appearance-none rounded border border-stroke bg-[#EDEDED] py-1 px-4 outline-none transition focus:border-primary active:border-primary`}
//           >
//             <option value="" className="text-body">{translate("Select")}</option>
//             {
//               options && options.map((option, index) => (
//                 <option key={option[valueField]} value={option[valueField]} className="text-body">
//                   {option[nameField]}
//                 </option>
//               ))
//             }
//           </select> : <select
//             name={registerKey}
//             {...register(registerKey, { required: require ? require : false })}
//             onClick={toggleDropdown}
//             className={`relative z-20 w-full appearance-none rounded border border-stroke bg-[#EDEDED] py-1 px-4 outline-none transition focus:border-primary active:border-primary`}
//             defaultValue={""}
//           >
//             <option value="" className="text-body">{translate("Select")}</option>
//             {
//               options && options.map((option, index) => (
//                 <option key={option[valueField]} value={option[valueField]} className="text-body">
//                   {option[nameField]}
//                 </option>
//               ))
//             }
//           </select>
//         }
//         {/* <select
//           name={registerKey}
//           {...register(registerKey, { required: require ? require : false })}
//           className={`relative z-20 w-full appearance-none rounded border border-stroke bg-[#EDEDED] py-1 px-4 outline-none transition focus:border-primary active:border-primary`}
//         >
//           <option  value="" className="text-body">Select</option>
//           {
//             options && options.map((option, index) => (
//               <option key={option.value} value={option[valueField]} className="text-body">
//                 {option[nameField]}
//               </option>
//             ))
//           }
//         </select> */}

//         <span className={`absolute pointer-events-none transform transition-transform duration-300 top-1/2 right-4 z-30 -translate-y-1/2 
//         ${isOpen ? "rotate-180" : "rotate-0"}`}>
//           <svg
//             className="fill-current"
//             width="20"
//             height="20"
//             viewBox="0 0 24 24"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <g opacity="0.8">
//               <path
//                 fillRule="evenodd"
//                 clipRule="evenodd"
//                 d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
//                 fill=""
//               ></path>
//             </g>
//           </svg>
//         </span>
//       </div>
//       {errors[registerKey] && errors[registerKey].message}
//     </div>
//   );
// };

// export default DefaultSelect;


import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import useTranslate from '../../utils/Translate';
import bnBijoy2Unicode from '../../utils/conveter';

const DefaultSelect = ({ label, type, options, registerKey, require, valueField, nameField, disabled, unicode = false }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById(`${registerKey}-dropdown`);
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [registerKey]);

  return (
    <div className="w-full">
      <label htmlFor={registerKey} className="mb-1 block text-black">
        {label}
      </label>

      <div id={`${registerKey}-dropdown`} className="relative z-20 bg-transparent">
        <select
          name={registerKey}
          {...register(registerKey, { required: require, valueAsNumber: type === 'number' })}
          onClick={toggleDropdown}
          defaultValue=""
          className={`relative z-20 w-full appearance-none rounded border border-stroke bg-[#EDEDED] py-1 px-4 outline-none transition focus:border-primary active:border-primary ${disabled ? 'cursor-not-allowed disabled:bg-slate-200' : ''
            }`}
          disabled={disabled}
        >
          <option value="" className="text-body">
            {translate('Select')}
          </option>
          {options &&
            options.map((option) => (
              <option key={option[valueField]} value={option[valueField]} className="text-body">
                {unicode ? bnBijoy2Unicode(option[nameField]) : option[nameField]}
              </option>
            ))}
        </select>

        <span className={`absolute pointer-events-none transform transition-transform duration-300 top-1/2 right-4 z-30 -translate-y-1/2 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              />
            </g>
          </svg>
        </span>
      </div>
      {errors[registerKey] && errors[registerKey].message}
    </div>
  );
};

export default DefaultSelect;
