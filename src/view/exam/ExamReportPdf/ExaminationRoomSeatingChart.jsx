import { useEffect, useRef } from "react";
import { useGetSingleSubClassQuery } from "../../../features/class/classQuerySlice";
import { useGetExamNameQuery } from "../../../features/exam/examQuerySlice";
import { useGetExamwiseSeatPlanQuery, useGetHallwiseSeatPlanQuery } from "../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetExamHallListQuery } from "../../../features/examhall/examHallQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

function HallOverviewPage({ hall, assignments, institutionInfo, examName, sessionName }) {
    const hallColumns = hall?.columns?.length || 0;

    const lookup = {};
    assignments?.forEach((item) => {
        const colIdx = hall?.columns?.findIndex((col) => col.ColumnID === item.ColumnID);
        if (colIdx === -1 || colIdx === undefined) return;
        const rowIdx = hall?.columns?.[colIdx]?.rows?.findIndex((row) => row.RowID === item.RowID);
        if (rowIdx === -1 || rowIdx === undefined) return;
        const seatNum = item.SeatNum || 1;
        const subClassLabel = item.SubClass || item.SubClassID || `SubClass ${item.SubClassID}`;

        lookup[`${colIdx}-${rowIdx}-${seatNum}`] = {
            userCode: item.User?.UserCode ?? item.UserCode,
            serial: item.User?.UserCode ?? item.UserCode,
            fullName: item.User?.UserName ?? item.UserName,
            subClass: subClassLabel,
        };
    });

    const subClassColors = {};
    const palette = [
        { bg: '#E1F5EE', border: '#9FE1CB', text: '#0F6E56' },
        { bg: '#E6F1FB', border: '#B5D4F4', text: '#0C447C' },
        { bg: '#FBEAF0', border: '#F4C0D1', text: '#72243E' },
        { bg: '#FAEEDA', border: '#FAC775', text: '#633806' },
        { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8' },
    ];
    let colorIdx = 0;
    Object.values(lookup).forEach((student) => {
        if (!subClassColors[student.subClass]) {
            subClassColors[student.subClass] = palette[colorIdx % palette.length];
            colorIdx += 1;
        }
    });

    return (
        <div className="px-1 py-2 print:break-after-page" style={{ fontFamily: "SolaimanLipiNormal, SolaimanLipi, 'Noto Sans Bengali', serif" }}>
            <div className="text-center mb-3 border-b-2 border-[#1B2A4A] pb-3">
                <div className="text-black ">
                    <h1 className="text-[26px] font-bold leading-[1.15]">{institutionInfo?.InstitutionName}</h1>
                    <p className="text-[16px]">{institutionInfo?.Address}</p>
                    
                </div>
                <div className="text-[18px] text-[#3b3b3b] mt-1">হল: {bnBijoy2Unicode(String(hall?.HallName)) || 'হল'}</div>
                {sessionName && <div className="text-[18px] text-[#3b3b3b] mt-1">শিক্ষাবর্ষ: {sessionName}</div>}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
                {hall?.columns?.map((col, ci) => (
                    <div
                        key={ci}
                        className="min-w-[210px] h-full border border-[#E4E8F0] rounded-[4px] p-1"
                    >
                        <div className="text-center text-[15px] font-bold text-[#1B2A4A] mb-2.5">
                            {col.Label}
                        </div>

                        {col?.rows?.map((row, ri) => {
                            const rowLabel = row?.RowLabel || `বেঞ্চ নং ${ri + 1}`;
                            const seats = Math.max(1, row?.Seats || 1);

                            return (
                                <div key={ri} className="mb-2.5">
                                    <div
                                        className="grid gap-1"
                                        style={{ gridTemplateColumns: `repeat(${seats}, minmax(0, 1fr))` }}
                                    >
                                        {Array.from({ length: seats }).map((_, si) => {
                                            const sn = si + 1;
                                            const key = `${ci}-${ri}-${sn}`;
                                            const student = lookup[key];
                                            const color = student ? subClassColors[student.subClass] : null;

                                            return (
                                                <div
                                                    key={sn}
                                                    className="min-h-[36px] rounded-md flex flex-col items-center justify-center text-[12px] text-center p-[4px_6px] border"
                                                    style={{ borderColor: color ? color.border : '#DDDDDD' }}
                                                >
                                                    {student ? (
                                                        <div className="font-bold">
                                                            আইডি: {bnBijoy2Unicode(String(student.userCode))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[#999999]"></span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main printable document ──────────────────────────────────────────────────
export default function ExaminationRoomSeatingChart({ queryParams }) {

    const { data: examSeatPlanData } = useGetExamwiseSeatPlanQuery({
        sessionId: queryParams?.SessionID,
        examId: queryParams?.ExamID
    });
    const { data: examHallList, isLoading: isLoadingExamHallList } = useGetExamHallListQuery();

    const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
    const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
    const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    // const printRef = useRef(null);

    const hallList = Array.isArray(examHallList) && examHallList.length > 0 ? examHallList : [];
    const hallEntries = examSeatPlanData ? Object.entries(examSeatPlanData) : Object.entries({});

    const getHallById = (hallId) => {
        return hallList.find((hall) => String(hall.HallID) === String(hallId)) || null;
    };

    return (
        <div className="print:block">
                {hallEntries.length > 0 ? (
                        hallEntries.map(([hallId, assignments], index) => {
                            const hall = getHallById(hallId);
                            if (!hall) return null;

                            return (
                                <HallOverviewPage
                                    key={hallId}
                                    hall={hall}
                                    assignments={assignments}
                                    institutionInfo={institutionInfo}
                                    examName={examNameData?.ExamName}
                                    sessionName={sessionData?.SessionName}
                                />
                            );
                        })
                    ) : (
                        <div style={{ padding: 24, color: '#556070' }}>
                            কোন হাল পাওয়া যায়নি।
                        </div>
                    )}
            <div>
                <div style={{ background: '#FFFFFF' }}>
                
                </div>
            </div>
        </div>
    );
}






