import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

const ROWS_PER_COLUMN = 20; // fixed capacity per column
const ROWS_PER_PAGE = ROWS_PER_COLUMN * 2; // 40 per A4 page (2 columns)

export default function StudentResultSheetTwoColumn({ reportData, query }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const { conditionAverage, subjectPassNumbers } = reportData;

    const studentResultsDetails = Array.isArray(reportData?.studentResults)
        ? reportData.studentResults
        : [];

    // --- split into pages of 40, then each page into 2 fixed columns of 20 ---
    const pages = [];
    for (let i = 0; i < studentResultsDetails.length; i += ROWS_PER_PAGE) {
        pages.push(studentResultsDetails.slice(i, i + ROWS_PER_PAGE));
    }
    if (pages.length === 0) pages.push([]); // still render header/table if no data

    const renderRow = (studentResult, index) => (
        <tr key={studentResult.ID ?? index} className="break-inside-avoid">
            <td className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937]">
                {bnBijoy2Unicode(String(studentResult.AdmissionID))}
            </td>
            <td className="border border-black px-2 py-1 text-left text-[16px] text-[#1f2937]">
                {studentResult.User.UserName}
            </td>
            <td className="border border-black px-2 py-1 text-left text-[16px] text-[#1f2937]">
                {studentResult.User.FatherName}
            </td>
            <td className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937]">
                {bnBijoy2Unicode(String(studentResult.Total / conditionAverage.AverageSubsonkha || 1))}
            </td>
            <td className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937]">
                {studentResult.Division.DivisionNames}
            </td>
        </tr>
    );

    // empty filler row so short columns still show the full 20-row grid (optional — remove if you don't want blank rows)
    const renderEmptyRow = (key) => (
        <tr key={key}>
            <td className="border border-black px-1 py-1 h-[22px]">&nbsp;</td>
            <td className="border border-black px-1 py-1">&nbsp;</td>
            <td className="border border-black px-1 py-1">&nbsp;</td>
            <td className="border border-black px-2 py-1">&nbsp;</td>
            <td className="border border-black px-1 py-1">&nbsp;</td>
    
        </tr>
    );

    const renderColumnTable = (data, indexOffset) => {
        const filler = ROWS_PER_COLUMN - data.length;
        return (
            <table className="w-full border-collapse text-[11px] result-report-table">
                <thead className="table-header-group result-report-header" style={{ display: "table-header-group" }}>
                    <tr>
                 
                        <th className="border border-black px-1 py-1 w-16 text-[14px] text-[#1f2937]">আইডি নং</th>
                        <th className="border border-black px-2 py-1 min-w-[100px] text-left text-[14px] text-[#1f2937]">
                            শিক্ষার্থীর নাম
                        </th>
                        <th className="border border-black px-2 py-1 min-w-[100px] text-left text-[14px] text-[#1f2937]">
                            পিতার নাম
                        </th>
                        <th className="border border-black px-1 py-1 w-14 text-[14px] text-[#1f2937] font-bold">গড়</th>
                        <th className="border border-black px-2 py-1 w-20 text-[14px] text-[#1f2937] font-bold">বিভাগ</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((studentResult, i) => renderRow(studentResult, indexOffset + i))}
                    {filler > 0 && Array.from({ length: filler }).map((_, i) => renderEmptyRow(`filler-${indexOffset}-${i}`))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="w-full bg-white text-black">

            {pages.map((pageData, pageIndex) => {
                const leftData = pageData.slice(0, ROWS_PER_COLUMN);
                const rightData = pageData.slice(ROWS_PER_COLUMN, ROWS_PER_PAGE);
                const globalOffset = pageIndex * ROWS_PER_PAGE;

                return (
                    <div
                        key={pageIndex}
                        className={pageIndex > 0 ? "print:break-before-page" : ""}
                        style={pageIndex > 0 ? { breakBefore: "page" } : undefined}
                    >
                        <div className="flex items-start justify-between gap-2 p-2 border-b border-black">
                            <div className="flex-1 text-center px-2">
                                <h1 className="text-[20px] font-bold leading-tight py-1">
                                    {institutionInfo?.InstitutionName}
                                </h1>
                                <p className="text-[16px] font-bold">{institutionInfo?.Address}</p>
                                <h2 className="text-[18px] leading-tight py-1">
                                    {conditionAverage.Exam.ExamName} - {conditionAverage.Session.SessionName}
                                </h2>
                                <div className="inline-block border border-black px-4 py-1 my-1 font-bold text-[18px] text-[#1f2937] rounded-[4px]">
                                    ফলাফল (নম্বরপত্র)
                                </div>
                                <p className="text-[16px] mt-2">
                                    শ্রেণি/জামাত : {conditionAverage.SubClass.SubClass}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 print:grid print:grid-cols-2 print:gap-3">
                            <div>{renderColumnTable(leftData, globalOffset)}</div>
                            <div>{renderColumnTable(rightData, globalOffset + ROWS_PER_COLUMN)}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}