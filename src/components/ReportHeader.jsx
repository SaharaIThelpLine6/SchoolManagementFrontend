import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import useTranslate from '../utils/Translate';

import { Buffer } from 'buffer';
import { useEffect, useState } from 'react';
import { hideModal } from '../utils/ModalControlar';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import bnBijoy2Unicode from '../utils/conveter';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
const API_URL = import.meta.env.VITE_SERVER_URL;
const ReportHeader = ({ query }) => {
    const { state } = useLocation();
    const [logo, setLogo] = useState(null);
    const dispatch = useDispatch();
    const translate = useTranslate();
    const { data: sessionData } = useGetSessionsQuery();
    const selectedSession = sessionData?.find(
        (item) => item.SessionID == query.session_id
    );


    useEffect(() => {

        console.log(query);

    }, [query])

    const { data: instutionInfo } = useGetInstitutionInfoQuery();

    useEffect(() => {
        console.log(instutionInfo);

        if (instutionInfo?.Logo?.data) {
            const buffer = Buffer.from(instutionInfo.Logo.data);
            const base64String = buffer.toString("base64");
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc);
        }
    }, [instutionInfo]);

    return (
        <div>
            {
                instutionInfo.ActiveReportHeader == 2 ? (
                    instutionInfo.ActiveReportTemplate == 1 ? (
                        <div className='mx-auto'>
                            <div className='flex justify-center items-center flex-col gap-4  w-[80%] mx-auto'>
                                <div className="logo">
                                    <img src={logo} alt="logo" className=' w-[100px]' />
                                </div>
                                <div className="w-full bg-white text-center">
                                    <h1 className="text-[20px] leading-[20px] font-samibold bg-white tracking-[1.6px]">
                                        {instutionInfo?.AraInstitutionName}
                                    </h1>
                                    <h1 className=" text-[20px] font-bold bg-white leading-[40px] uppercase tracking-[1.3px]">
                                        {instutionInfo?.EngInstitutionName}
                                    </h1>
                                    <h1 className="text-[20px] leading-[20px] font-samibold bg-white tracking-[1.3px]">
                                        {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
                                    </h1>
                                </div>

                            </div>
                            <p className="text-[16px] font-normal bg-white mt-[10px] text-center">
                                {bnBijoy2Unicode(instutionInfo?.Address)}
                            </p>
                        </div>
                    ) : (
                        <div className='mx-auto'>
                            <div className='flex justify-center items-center flex-col gap-4  w-[80%] mx-auto'>
                                <div className="logo">
                                    <img src={logo} alt="logo" className=' w-[100px]' />
                                </div>
                                <div className="w-full bg-white text-center">
                                    <h1 className="text-[20px] leading-[20px] font-samibold bg-white tracking-[1.6px]">
                                        {instutionInfo?.AraInstitutionName}
                                    </h1>
                                    <h1 className=" text-[20px] font-bold bg-white leading-[40px] uppercase tracking-[1.3px]">
                                        {instutionInfo?.EngInstitutionName}
                                    </h1>
                                    <h1 className="text-[20px] leading-[20px] font-samibold bg-white tracking-[1.3px]">
                                        {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
                                    </h1>
                                </div>

                            </div>
                            <p className="text-[16px] font-normal bg-white mt-[10px] text-center">
                                {bnBijoy2Unicode(instutionInfo?.Address)}
                            </p>
                        </div>
                    )
                ) : instutionInfo.ActiveReportHeader == 3 ? (
                    <div className='flex justify-end'>
                        <div className="text-center w-full bg-white">
                            <img className='w-full' src={`${API_URL}/public${instutionInfo.ReportHeaderImg}`} alt="" />
                        </div>
                    </div>
                ) : (
                    <div className='flex justify-end'>
                        <div className="text-center w-full bg-white">
                            <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
                                {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
                            </h1>
                            <p className="text-base font-semibold bg-white">
                                {bnBijoy2Unicode(instutionInfo?.Address)}
                            </p>
                            <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
                                {query.title}
                            </div>
                            <div className="grid grid-cols-3 items-center my-[20px] justify-between w-full">
                                <p className="text-[18px] text-start"> {selectedSession ? `শিক্ষাবর্ষ : ${selectedSession?.SessionName}` : null} </p>
                                <p className="text-[18px] text-center"> {new Date(query.start_date).toLocaleDateString("bn-BD")} হতে {new Date(query.end_date).toLocaleDateString("bn-BD")} পর্যন্ত </p>
                                <p className="text-end text-[18px]">প্রিন্ট তারিখ: {new Date().toLocaleDateString("bn-BD")} </p>
                            </div>
                        </div>
                    </div>
                )

            }

        </div>
    );
};

export default ReportHeader;
