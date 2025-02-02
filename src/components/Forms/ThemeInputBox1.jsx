import { useFormContext } from 'react-hook-form';
import Translate from '../../utils/Translate';

const ThemeInputBox1 = ({ label, type, placeholder, registerKey, require }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className='w-full'>
            <label className="block">
                <span className="text-theme-dark pb-1 block font-noto text-[14px] font-bold">
                    {Translate(label)} {require ? <span className="text-rose-500 text-[18px]">*</span> : null}
                </span>
                <input
                    type={type}
                    placeholder={placeholder ? placeholder : ""}
                    className="border bg-theme-offwhite border-theme-offwhite w-full px-2 py-1 rounded-md focus:ring focus:ring-theme-offwhite focus:outline-none transition-all duration-300"
                    {...register(registerKey, { required: require ? require : false })}
                />
            </label>
        </div>
    )
}
export default ThemeInputBox1