import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
const ReportByIDSerial = ({ reportData, query }) => {
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

    // const totals = reportData?.reduce(
    //     (acc, item) => {
    //         acc.currentInvoice += Number(item.CurrentInvoice || 0);
    //         acc.invoiceDiscount += Number(item.InvoiceDiscount || 0);
    //         acc.total += Number(item.Total || 0);
    //         return acc;
    //     },
    //     {
    //         currentInvoice: 0,
    //         invoiceDiscount: 0,
    //         total: 0,
    //     }
    // );
    const selectedSession = sessionData?.find(
        (item) => item.SessionID == query.session_id
    );

    return (
        <div className="font-bangla  p-4 bg-white text-xs">
            <div className="bg-white">
                {/* Title Section */}
                {/* {JSON.stringify(sessionData)} */}
                <ReportHeader query={{ ...query, title: "ফলাফল (নম্বরপত্র)" }} />

                <table

                    className="w-full border-collapse border border-black bg-white mb-8"
                >
                    <thead>
                        <tr className="bg-white text-black">
                            <th className="border border-black p-2 text-[20px]">ক্র:</th>
                            <th className="border border-black p-2 text-[20px]">আইডি</th>
                            <th className="border border-black p-2 text-[20px]">শিক্ষার্থীর নাম</th>
                            {
                                Array.from({ length: reportData?.result?.[0]?.SubSonkha || 0 }).map((_, index) => (
                                    <td
                                        className="border border-black p-2 text-[20px] [writing-mode:vertical-rl] text-center"
                                        key={index}
                                    >
                                        {reportData.result[0]?.[`Subject${index + 1}`] || ""}
                                    </td>
                                ))
                            }

                            <th className="border border-black p-2 text-[20px]">মোট</th>
                            <th className="border border-black p-2 text-[20px]">গড়</th>
                            <th className="border border-black p-2 text-[20px]">বিভাগ</th>
                            <th className="border border-black p-2 text-[20px]">স্থান</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.result.map((maritData, index) => (
                            <tr className="" key={maritData.ID}>
                                <td className="p-3 border border-black text-[20px] bg-white">{index + 1}</td>
                                <td className="p-3 border border-black text-[20px] bg-white text-center">{bnBijoy2Unicode(String(maritData.UserCode))}</td>
                                <td className="p-3 border border-black text-[20px] bg-white">{bnBijoy2Unicode(maritData.UserName)}</td>
                                {Array.from({ length: maritData.SubSonkha }).map((_, index) => (
                                    <React.Fragment>
                                        <td className="border border-black pl-2 text-[20px]">
                                            {bnBijoy2Unicode(String(maritData[`SubVal${index + 1}`]))}
                                        </td>
                                    </React.Fragment>
                                ))}

                                <td className="p-3 border border-black text-[20px] bg-white text-center text-[20px]">{bnBijoy2Unicode(String(maritData.Total))}</td>
                                <td className="p-3 border border-black text-[20px] bg-white text-center font-bold">{bnBijoy2Unicode(maritData.Division)}</td>
                                <td className="p-3 border border-black text-[20px] bg-white text-center text-[20px]">{maritData.Positions}</td>

                            </tr>
                        ))}
                    </tbody>


                </table>



            </div>

        </div>
    );
};

export default ReportByIDSerial;