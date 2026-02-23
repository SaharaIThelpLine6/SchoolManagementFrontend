import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import ReportHeader from "../../../../components/ReportHeader";
import bnBijoy2Unicode from "../../../../utils/conveter";
const ShortFormatReport = ({ reportData, query }) => {
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
                            <th className="border border-black p-2 text-[20px]">পিতার নাম</th>
                            <th className="border border-black p-2 text-[20px]">গড়</th>
                            <th className="border border-black p-2 text-[20px]">বিভাগ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportData.result.map((maritData, index) => (
                            <tr className="" key={maritData.ID}>
                                <td className="p-3 border border-black text-[20px] bg-white">{index + 1}</td>
                                <td className="p-3 border border-black text-[20px] bg-white text-center">{bnBijoy2Unicode(String(maritData.UserCode))}</td>
                                <td className="p-3 border border-black text-[20px] bg-white">{maritData.UserName}</td>
                                <td className="p-3 border border-black text-[20px] bg-white">{maritData.FatherName}</td>
                                <td className="p-3 border border-black text-[20px] bg-white">{maritData.Average}</td>
                                <td className="p-3 border border-black text-[20px] bg-white">{maritData.Division}</td>
                               


                            </tr>
                        ))}
                    </tbody>


                </table>



            </div>

        </div>
    );
};

export default ShortFormatReport;