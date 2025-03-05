import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useTranslate from '../../../utils/Translate';

const FilterSelectGroup = ({defaultSelect, options, valueField, nameField}) => {
    const [selectedOption, setSelectedOption] = useState(defaultSelect);
    const [isOptionSelected, setIsOptionSelected] = useState(false);
    const translate = useTranslate();

    const navigate = useNavigate();
    const location = useLocation();

    const handleFilterChange = (e) => {
        const value = e.target.value;
        setSelectedOption(value);
        setIsOptionSelected(true);
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('filter');
        searchParams.append('filter', value);
        navigate(`${location.pathname}?${searchParams.toString()}`);
    };

    const changeTextColor = () => {
        setIsOptionSelected(true);
    };

    return (
        <div>
            <div className="relative z-20 bg-white">
                <span className="absolute top-1/2 left-2 z-30 -translate-y-1/2 pointer-event-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon pointer-event-none icon-tabler icons-tabler-outline icon-tabler-filter"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" /></svg>
                </span>

                <select
                    value={selectedOption ? selectedOption : ''}
                    onChange={(e) => {
                        handleFilterChange(e)
                    }}
                    className={`relative z-20 w-full appearance-none rounded-[8px] border border-stroke bg-transparent pointer py-2 pt-[10px] pl-8 pr-6 text-start text-[14px] font-kalpurush   outline-none transition  ${isOptionSelected ? 'text-black dark:text-white' : ''
                        }`}
                >
                    {/* {
                        defaultSelect ? null : <option value="" className="">{translate("Filter")}</option>
                    } */}
                    {
                        options &&
                        options.map((option) => (
                            <option key={option[valueField]} value={option[valueField]}>
                                {option[nameField]}
                            </option>
                        ))
                    }
                    
                    {/* <option value="0" className="">
                        {translate("Admitted students")}
                    </option>
                    <option value="2" className="">
                        {translate("Not Admitted students")}
                    </option> */}
                </select>

                <span className="absolute top-1/2 right-2 z-10 -translate-y-1/2 pointer-event-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icons-tabler-outline icon-tabler-chevron-down"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 9l6 6l6 -6" /></svg>
                </span>
            </div>
        </div>
    );
};

export default FilterSelectGroup;
