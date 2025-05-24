import React from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import { FaUser, FaLock, FaRegUser } from "react-icons/fa"; // Example icons
const LoginInput = ({
  label,
  type,
  placeholder,
  registerKey,
  require = false,
  disable = false,
  icon, // New prop to specify the icon
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const validateNumber = (value) => {
    return type === "number" && isNaN(Number(value))
      ? "Please enter a valid number"
      : true;
  };

  // Map icon based on type or custom icon prop
  const getIcon = () => {
    switch (icon || type) {
      case "text":
      case "email":
        return <FaUser className="text-gray-500" />;
      case "number":
        return <FaRegUser className="text-gray-500" />;
      case "password":
        return <FaLock className="text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <label
        htmlFor={registerKey}
        className="mb-1 block text-black font-SolaimanLipi"
      >
        {translate(label)}
      </label>

      <div className="relative w-full">
        <input
          type={type === "number" || type === "phone" ? "number" : type}
          placeholder={translate(placeholder)}
          className={`w-full rounded border-[1.5px] border-stroke bg-white pl-10 pr-2 h-[38px] text-black outline-none text-[14px] transition
                      focus:border-custom-focus active:border-custom-focus
                      disabled:cursor-not-allowed disabled:bg-slate-200
                      ${
                        errors[registerKey]
                          ? "placeholder:text-red-400 border-red-400"
                          : ""
                      }`}
          {...register(registerKey, {
            required: require ? require : false,
            ...(type === "number" && { validate: validateNumber }),
            ...(type === "phone" && {
              pattern: {
                value: /^\d{11}$/, // Ensures exactly 11 digits
                message: "Phone number must be exactly 11 digits",
              },
            }),
          })}
          disabled={disable}
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          {getIcon()}
        </div>
      </div>

      {errors[registerKey] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[registerKey].message}
        </p>
      )}
    </div>
  );
};

export default LoginInput;
