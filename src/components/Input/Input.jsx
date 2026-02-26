import { forwardRef } from "react";
import useTranslate from "../../utils/Translate";

const Input = forwardRef(
  ({ label,disabled = false, placeholder, type, error, helperText, ...rest }, ref) => {
    const translate = useTranslate()
    return (
      <div className="flex flex-col gap-1">

        <label className="text-sm font-medium">{translate(label)} {label? ":" : ""}</label>
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`p-2 w-full rounded border-[1.5px] px-2 h-[38px] text-black outline-none text-[14px] transition
            ${
              error
                ? 'border-red-500 focus:border-red-500'
                : 'border-stroke focus:border-custom-focus'
            }
            disabled:cursor-not-allowed disabled:bg-slate-200`}
          {...rest}
          disabled={disabled}
        />
        {error && (
          <span className="text-red-500 text-xs font-medium">{helperText}</span>
        )}
      </div>
    );
  }
);

export default Input;
