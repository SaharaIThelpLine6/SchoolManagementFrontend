import React, { useEffect, useState } from "react";
import bnBijoy2Unicode from "../../../utils/conveter";
import { formatDate } from "../../../helper/formatTime";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import ReportHeader from "../../../components/ReportHeader";

const DailyFeeCollectionSessonWise = ({ reportData, query }) => {
    const [logo, setLogo] = useState(null);
    const { data: instutionInfo } = useGetInstitutionInfoQuery();
    const { data: sessionData } = useGetSessionsQuery();

    useEffect(() => {
        console.log(query);

        if (instutionInfo?.Logo?.data) {
            const buffer = Buffer.from(instutionInfo.Logo.data);
            const base64String = buffer.toString("base64");
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc);
        }
    }, [instutionInfo]);


    // useEffect(() => {
    //     console.log(sessionData);
    // }, [])

    const totals = reportData?.reduce(
        (acc, item) => {
            acc.currentInvoice += Number(item.CurrentInvoice || 0);
            acc.invoiceDiscount += Number(item.InvoiceDiscount || 0);
            acc.total += Number(item.Total || 0);
            return acc;
        },
        {
            currentInvoice: 0,
            invoiceDiscount: 0,
            total: 0,
        }
    );
    const selectedSession = sessionData?.find(
    (item) => item.SessionID == query.session_id
    );

    return (
        <div className="font-bangla  p-4 bg-white text-xs">
            <div className="bg-white">
                {/* Title Section */}
                {/* {JSON.stringify(sessionData)} */}
                {/* <div className="text-center w-full bg-white">
                    <h1 className="text-xl sm:text-2xl font-extrabold bg-white">
                        {bnBijoy2Unicode(instutionInfo?.InstitutionName)}
                    </h1>
                    <p className="text-base font-semibold bg-white">
                        {bnBijoy2Unicode(instutionInfo?.Address)}
                    </p>
                    <div className="text-black border border-black px-4 py-1 inline-block mt-2 sm:mt-3 rounded tracking-widest bg-white text-base font-bold sm:text-lg">
                        দৈনিক ফি গ্রহণ তালিকা
                    </div>
                    <div className="grid grid-cols-3 items-center my-[20px] justify-between w-full">
                        <p className="text-[18px] text-start">শিক্ষাবর্ষ : {selectedSession?.SessionName}</p>
                        <p className="text-[18px] text-center"> {new Date(query.start_id).toLocaleDateString("bn-BD")} হতে {new Date(query.end_id).toLocaleDateString("bn-BD")} পর্যন্ত </p>
                        <p className="text-end text-[18px]">প্রিন্ট তারিখ: {new Date().toLocaleDateString("bn-BD")} </p>
                    </div>
                </div> */}
                

                <ReportHeader query={{...query, title: "দৈনিক ফি গ্রহণ তালিকা"}} />
                {/* Optional right-aligned blank space */}


                <table

                    className="w-full border-collapse border border-black bg-white mb-8"
                >
                    <thead>
                        <tr className="bg-white text-black">
                            <th className="border border-black p-2 text-[20px]">ক্র:</th>
                            <th className="border border-black p-2 text-[20px]">রশিদ</th>
                            <th className="border border-black p-2 text-[20px]">আইডি</th>
                            <th className="border border-black p-2 text-[20px]">শিক্ষার্থীর নাম</th>
                            <th className="border border-black p-2 text-[20px]">ক্লাশ</th>
                            <th className="border border-black p-2 text-[20px]">তারিখ</th>
                            <th className="border border-black p-2 text-[20px]">নির্ধারিত</th>
                            <th className="border border-black p-2 text-[20px]">কর্তন</th>
                            <th className="border border-black p-2 text-[20px]">পরিমাণ</th>
                        </tr>
                    </thead>

                    <tbody>
                        {reportData && reportData.length > 0 && reportData.map((userData, UserIndex) => (
                            <React.Fragment key={`user_${userData.UFOID}`}>
                                <tr>
                                    <td className="border border-black text-center text-[16px] py-4">{UserIndex + 1}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.CurrentInvoice}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.UserCode}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.UserName}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.ClassName}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.CreateAt}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.CurrentInvoice}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.InvoiceDiscount}</td>
                                    <td className="border border-black text-[16px] py-4 px-2">{userData.Total}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                        {/* Grand Total */}
                        <tr>
                            <td colSpan={6} className="border border-black text-end font-bold py-2 px-2">
                                মোট:
                            </td>

                            <td className="border border-black text-[16px] py-2 px-2 font-bold">
                                {totals?.currentInvoice}
                            </td>

                            <td className="border border-black text-[16px] py-2 px-2 font-bold">
                                {totals?.invoiceDiscount}
                            </td>

                            <td className="border border-black text-[16px] py-2 px-2 font-bold">
                                {totals?.total}
                            </td>
                        </tr>

                    </tbody>

                </table>

            </div>


            {/* 213114194 */}
        </div>
    );
};

export default DailyFeeCollectionSessonWise;