import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

const divisionLabels = {
    1: "মুমতাজ",
    2: "জায়েদ জিদ্দান",
    3: "জায়েদ",
    4: "মাকবুল",
    5: "রাসিব",
};

const getFirstValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== "");

const getSubjectLabel = (subject) =>
    getFirstValue(
        subject.SubjectName,
        subject.EngSubjectName,
        subject.ArabicSubject,
        subject.Subject?.SubjectName,
        subject.Subject?.EngSubjectName,
        subject.Subject?.ArabicSubject,
        `বিষয় ${subject.SubjectSL}`
    );

export default function AttendanceSheet({ reportData, query, }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();

    const { conditionAverage, subjectPassNumbers } = reportData

    const apiSubjects = Array.isArray(subjectPassNumbers)
        ? [...subjectPassNumbers].sort(
            (first, second) => (first.SubjectSL ?? 0) - (second.SubjectSL ?? 0)
        )
        : [];
    const studentResultsDetails = Array.isArray(reportData?.studentResults) ? reportData.studentResults : [];
    const resolvedSubjectColumns = apiSubjects.map(getSubjectLabel);
    const maxMark = apiSubjects.reduce(
        (total, subject) => total + (Number(subject.MaxNumber) || 0),
        0
    );
    const resolvedRightSummary = {
        totalSubjectsLabel: `মোট বিষয় ${apiSubjects.length}টি পূর্ণমান ${maxMark}`,
        grades: [],
    };
    const totalMarkColumns = resolvedSubjectColumns.length;
    const getTotals = (marks) => {
        const validMarks = marks.filter(
            (mark) => typeof mark === "number" && !Number.isNaN(mark)
        );
        const total = validMarks.reduce((sum, mark) => sum + mark, 0);
        const average = resolvedSubjectColumns.length
            ? (total / resolvedSubjectColumns.length).toFixed(2)
            : "0.00";
        return { total, average };
    };

    return (
        <div className="w-full bg-white text-black">
            <table className="w-full border-collapse text-[11px] result-report-table">
                <thead
                    className="table-header-group result-report-header border-black"
                    style={{ display: "table-header-group" }}
                >
                    <tr>
                        <th colSpan={36} className="p-0 font-normal">
                            <div className="flex items-start justify-between gap-2 p-2 border-b border-black">
                
                                <div className="flex-1 text-center px-2">
                                    <h1 className="text-[20px] font-bold leading-tight py-1">
                                        {institutionInfo?.InstitutionName}
                                    </h1>
                                    <p className="text-[16px] font-bold">
                                        {institutionInfo?.Address}
                                    </p>
                                    <h2 className="text-[18px] leading-tight py-1">দৈনন্দিন শিক্ষার্থীর হাজিরা খাতা - {conditionAverage.Session.SessionName}</h2>
                                    <div className="inline-block border border-black px-4 py-1 my-1 font-bold text-[18px] text-[#1f2937] rounded-[4px]">
                                         শ্রেণি/জামাত : {conditionAverage.SubClass.SubClass}
                                    </div>
                               
                                </div>
                            </div>

                        </th>
                    </tr>
                    <tr>
                        <th className="border border-black px-1 py-1 w-10 text-[16px] text-[#1f2937]">ক্রমিক</th>
                        <th className="border border-black px-1 py-1 w-16 text-[16px] text-[#1f2937]">আইডি নং</th>
                        <th className="border border-black px-2 py-1 min-w-[140px] text-left text-[16px] text-[#1f2937]">
                            শিক্ষার্থীর নাম
                        </th>
                        {Array.from({ length: 31 }).map((_, index) => (
                            <th
                                key={index}
                                className="border border-black px-0.5 py-1 w-8 align-bottom"
                            >
                                <span className="inline-block whitespace-nowrap [writing-mode:vertical-rl] rotate-180 text-[16px] text-[#1f2937] font-bold">
                                    {bnBijoy2Unicode(String(index + 1))}
                                </span>
                            </th>
                        ))}
                        <th className="border border-black px-1 py-1 w-12 text-[16px] text-[#1f2937] font-bold [writing-mode:vertical-rl]">উপ :</th>
                        <th className="border border-black px-1 py-1 w-14 text-[16px] text-[#1f2937] font-bold [writing-mode:vertical-rl]">অনু :</th>
                    
                    </tr>
                </thead>

                <tbody>
                    {studentResultsDetails.map((studentResult, index) => {
                        // const { total, average } = getTotals(student.marks || []);
                        return (
                            <tr key={studentResult.ID ?? index} className="break-inside-avoid">
                                <td className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937] ">
                                    {bnBijoy2Unicode(String(index + 1))}
                                </td>
                                <td className="border border-black px-1 py-1 text-center  text-[16px] text-[#1f2937]">
                                    {bnBijoy2Unicode(String(studentResult.AdmissionID))}
                                </td>
                                <td className="border border-black px-2 py-1 text-left  text-[16px] text-[#1f2937]">
                                    {studentResult.User.UserName}
                                </td>
                                {Array.from({ length: 31 }).map((_, markIndex) => (
                                    <td key={markIndex} className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937]">
                                       
                                    </td>
                                ))}
                                <td className="border border-black px-1 py-1 text-center font-normal text-[16px] text-[#1f2937]">
                                    
                                </td>
                                <td className="border border-black px-1 py-1 text-center text-[16px] text-[#1f2937]">
                                    
                                </td>

                       
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
