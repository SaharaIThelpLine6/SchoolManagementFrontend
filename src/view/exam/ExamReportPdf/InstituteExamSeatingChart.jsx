import { useGetSingleSubClassQuery } from "../../../features/class/classQuerySlice";
import { useGetExamNameQuery } from "../../../features/exam/examQuerySlice";
import { useGetExamwiseSeatPlanQuery } from "../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetExamHallListQuery } from "../../../features/examhall/examHallQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

const getColumnLabel = (hall, columnId) => {
    return hall?.columns?.find((col) => String(col.ColumnID) === String(columnId))?.Label || columnId || "—";
};

const getRowLabel = (hall, columnId, rowId) => {
    const column = hall?.columns?.find((col) => String(col.ColumnID) === String(columnId));
    return column?.rows?.find((row) => String(row.RowID) === String(rowId))?.RowLabel || rowId || "—";
};

const formatValue = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    return value;
};

const columns = [
    { key: "sl", label: "ক্রমিক", width: "w-[6%]" },
    { key: "id", label: "আইডি", width: "w-[8%]" },
    { key: "name", label: "পরীক্ষার্থীর নাম", width: "w-[24%]" },
    { key: "hall", label: "হল", width: "w-[20%]" },
    { key: "side", label: "টেবিল সারি", width: "w-[14%]" },
    { key: "bench", label: "বেঞ্চ", width: "w-[7%]" },
    { key: "seat", label: "আসন", width: "w-[7%]" },
];

function GroupTable({ title, rows, crossedOut }) {
    return (
        <div className="relative mb-6 break-inside-avoid">
            <div className="flex items-center justify-between border border-gray-800 border-b-0 bg-gray-100 px-3 py-1.5">
                <h2 className="text-[13px] font-bold text-gray-900">{title}</h2>

            </div>

            <table className="w-full table-fixed border-collapse text-[15px]">
                <thead>
                    <tr className="bg-gray-50">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`${col.width} border border-gray-800 px-1.5 py-1 text-center font-bold text-gray-900`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : "bg-white"}>
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className={`${col.width} border border-gray-800 px-1.5 py-1 text-center text-gray-800 ${col.key === "name" ? "text-left" : ""
                                        }`}
                                >
                                    {row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>


        </div>
    );
}
// ─── Main printable document ──────────────────────────────────────────────────
export default function InstituteExamSeatingChart({ queryParams }) {

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


            <div className="min-h-screen bg-gray-200 py-6 print:bg-white print:py-0">
                {/* A4 page */}
                <div className="mx-auto w-[210mm] min-h-[297mm] bg-white p-[10mm] shadow-lg print:w-auto print:min-h-0 print:p-0 print:shadow-none">

                    <div className="text-center mb-3 border-b-2 border-[#1B2A4A] pb-3">
                        <div className="text-black ">
                            <h1 className="text-[26px] font-bold leading-[1.15]">{institutionInfo?.InstitutionName}</h1>
                            <p className="text-[16px]">{institutionInfo?.Address}</p>
                            <p className="text-[16px]">{examNameData?.ExamName}</p>

                        </div>
                
            
                    </div>

                    {hallEntries.length > 0 ? (
                        hallEntries.map(([hallId, assignments], index) => {
                            const hall = getHallById(hallId);
                            const hallName = bnBijoy2Unicode(String(hall?.HallName || hallId || "—"));
                            const rows = assignments.map((item, idx) => ({
                                sl: idx + 1,
                                id: bnBijoy2Unicode(String(item.User?.UserCode ?? item.UserCode ?? "—")),
                                name: bnBijoy2Unicode(String(item.User?.UserName ?? item.UserName ?? "—")),
                                hall: hallName,
                                side: bnBijoy2Unicode(String(getColumnLabel(hall, item.ColumnID) || "—")),
                                bench: bnBijoy2Unicode(String(getRowLabel(hall, item.ColumnID, item.RowID) || "—")),
                                seat: formatValue(item.SeatNum),
                            }));

                            return (
                                <GroupTable
                                    key={hallId || index}
                                    title={hallName}
                                    rows={rows}
                                    crossedOut={false}
                                />
                            );
                        })
                    ) : (
                        <div className="rounded-lg border border-slate-300 bg-white p-6 text-center text-slate-700">
                            কোন সিট প্ল্যান পাওয়া যায়নি।
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}



























