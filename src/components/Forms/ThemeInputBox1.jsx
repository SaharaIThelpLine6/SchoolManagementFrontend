import { useFormContext } from 'react-hook-form';

const ThemeInputBox1 = ({ label, type, placeholder, registerKey, require }) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    return (
        <div className='w-full'>
            <label className="block">
                <span className="text-slate-700 pb-1 block">
                    {label} {require ? <span className="text-red-700">*</span> : null}
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