import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery, useGetResidentialQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
const DailyAttendenceList = ({ reportData, query }) => {
    const [logo, setLogo] = useState(null);
    const { data: instutionInfo } = useGetInstitutionInfoQuery();
    const { data: sessionData } = useGetSessionsQuery();
    const { data: residentialData, error: residentialError, isLoading: residentialDataLoading } = useGetResidentialQuery();
    useEffect(() => {
        console.log(query);

        if (instutionInfo?.Logo?.data) {
            const buffer = Buffer.from(instutionInfo.Logo.data);
            const base64String = buffer.toString("base64");
            const imageSrc = `data:image/png;base64,${base64String}`;
            setLogo(imageSrc);
        }
    }, [instutionInfo]);


    const selectedSession = sessionData?.find(
        (item) => item.SessionID == query.session_id
    );

    return (
        <div>
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
                            Array.from({ length: 31 }).map((_, index) => (
                                <td
                                    className="border border-black p-2 text-[20px] [writing-mode:vertical-rl] text-center"
                                    key={index}
                                >
                                    {index + 1}
                                </td>
                            ))
                        }

                        <th className="border border-black p-2 text-[20px]">উপ :</th>
                        <th className="border border-black p-2 text-[20px]">অনু :</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.result.map((maritData, index) => (
                        <tr className="" key={maritData.ID}>
                            <td className="p-3 border border-black text-[20px] bg-white">{index + 1}</td>
                            <td className="p-3 border border-black text-[20px] bg-white text-center">{bnBijoy2Unicode(String(maritData.UserCode))}</td>
                            <td className="p-3 border border-black text-[20px] bg-white">{bnBijoy2Unicode(maritData.UserName)}</td>
                            {Array.from({ length: 31 }).map((_, index) => (
                                <React.Fragment>
                                    <td className="border border-black pl-2 text-[20px]">
                                        
                                    </td>
                                </React.Fragment>
                            ))}

                            <td className="p-3 border border-black text-[20px] bg-white text-center text-[20px]"></td>
                            <td className="p-3 border border-black text-[20px] bg-white text-center font-bold"></td>

                        </tr>
                    ))}
                </tbody>


            </table>
        </div>
    );
};

export default DailyAttendenceList;