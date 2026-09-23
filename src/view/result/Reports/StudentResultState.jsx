import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

export default function StudentResultState({ reportData, query, }) {
    const { data: institutionInfo } = useGetInstitutionInfoQuery();
    const { conditionAverage, divisionStatistics } = reportData
    const studentResultsDetails = Array.isArray(reportData?.studentResults) ? reportData.studentResults : [];

    return (
        <div className="w-full bg-white text-black">
            <table className="w-full border-collapse text-[11px] result-report-table">
                <thead className="table-header-group result-report-header border-black" style={{ display: "table-header-group" }}>
                    <tr>
                        <th colSpan={36} className="p-0 font-normal">
                            <div className="flex items-start justify-between gap-2 p-2">
                                <div className="flex-1 text-center px-2">
                                    <h1 className="text-[20px] font-bold leading-tight py-1">
                                        {institutionInfo?.InstitutionName}
                                    </h1>
                                    <p className="text-[16px] font-bold">
                                        {institutionInfo?.Address}
                                    </p>
                                    <h2 className="text-[18px] leading-tight py-1">{conditionAverage.Exam.ExamName} - {conditionAverage.Session.SessionName}</h2>
                                </div>
                            </div>

                        </th>
                    </tr>
                </thead>
            </table>
            {divisionStatistics.map((divisionStatistic) => {

                const divisions = [
                    ...new Map(
                        divisionStatistic.divisionStatistics
                            .flatMap(subClass => subClass.divisions)
                            .map(division => [
                                division.DivisionID,
                                division
                            ])
                    ).values()
                ];

                return (
                    <div key={divisionStatistic.ExamType}>

                        <h2 className="text-[18px] font-bold py-3 text-center ">
                            {
                                divisionStatistic.ExamType == 1
                                    ? "দরসিয়াত"
                                    : divisionStatistic.ExamType == 2
                                        ? "হিফজ কন্ডিশন ভিত্তিক"
                                        : divisionStatistic.ExamType == 3
                                            ? "গড়ে যা আসবে তাই"
                                            : "পয়েন্ট ভিত্তিক"
                            }
                        </h2>

                        <table className="w-full border-collapse text-[11px] result-report-table">

                            <thead
                                className="table-header-group result-report-header border-black"
                                style={{ display: "table-header-group" }}
                            >
                                <tr>
                                    <th className="border border-black px-1 py-1 w-10 text-[16px]">
                                        ক্রমিক
                                    </th>

                                    <th className="border border-black px-1 py-1 w-16 text-[16px]">
                                        সাব ক্লাস বাংলা
                                    </th>

                                    <th className="border border-black px-2 py-1 min-w-[140px] text-left text-[16px]">
                                        শিক্ষকের নাম
                                    </th>

                                    {divisions.map((division) => (
                                        <th
                                            key={division.DivisionID}
                                            className="border border-black px-1 py-1 text-center text-[16px]"
                                        >
                                            {division.DivisionName}
                                        </th>
                                    ))}

                                    <th className="border border-black px-1 py-1 w-12 text-[16px] font-bold">
                                        মোট :
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {divisionStatistic.divisionStatistics.map(
                                    (subClass, index) => (
                                        <tr
                                            key={subClass.SubClassID}
                                            className="break-inside-avoid"
                                        >
                                            <td className="border border-black px-1 py-1 text-center text-[16px]">
                                                {bnBijoy2Unicode(String(index + 1))}
                                            </td>

                                            <td className="border border-black px-1 py-1 text-center text-[16px]">
                                                {subClass.SubClassName}
                                            </td>

                                            <td className="border border-black px-2 py-1 text-left text-[16px]">
                                                {/* teacher name */}
                                            </td>

                                            {divisions.map((division) => {

                                                const divisionData =
                                                    subClass.divisions.find(
                                                        item =>
                                                            item.DivisionID ===
                                                            division.DivisionID
                                                    );

                                                return (
                                                    <td
                                                        key={division.DivisionID}
                                                        className="border border-black px-1 py-1 text-center text-[16px]"
                                                    >
                                                        {bnBijoy2Unicode(String(divisionData?.count ?? 0))}
                                                    </td>
                                                );
                                            })}

                                            <td className="border border-black px-1 py-1 text-center text-[16px] font-bold">
                                                {bnBijoy2Unicode(String(subClass.divisions.reduce(
                                                    (total, division) =>
                                                        total +
                                                        Number(division.count || 0),
                                                    0
                                                )))}
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>

                        </table>
                    </div>
                );
            })}




        </div>
    );
}
