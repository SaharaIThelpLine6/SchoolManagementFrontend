import { useEffect, useRef, useState } from "react";
import { useGetInstitutionInfoQuery } from "../../../../features/settings/settingsQuerySlice";
import { useGetSessionsQuery } from "../../../../features/session/sessionSlice";
import { useGetSubClasssQuery } from "../../../../features/class/classQuerySlice";
import bnBijoy2Unicode from "../../../../utils/conveter";
import { useGetExamListQuery } from "../../../../features/result/resultSilce";

const PAGE_HEIGHT = 790;
const HEADER_ROW_HEIGHT = 30;



const BanglaTwoColumn = ({ reportData, queryParams }) => {
  const { data: institutionInfo } = useGetInstitutionInfoQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassList } = useGetSubClasssQuery();
  const {data: examListData, isLoading, error} = useGetExamListQuery({ session_id: queryParams?.session_id, exam_id: queryParams?.exam_id, subClass_id: queryParams?.subClass_id });

  const selectedSession = sessionData?.find((i) => i.SessionID == queryParams?.session_id);
  const selectedSubClassDetails = subClassList?.find((i) => i.SubClassID == queryParams?.subClass_id);

  const measureRef = useRef(null);
  const [pages, setPages] = useState([]);

  useEffect(() => {
    console.log("============= Report Data ====================");
    console.log(reportData);
    
    if (!measureRef.current || !reportData?.data.length) return;

    const trs = Array.from(measureRef.current.querySelectorAll("tr[data-idx]"));
    const colHeight = PAGE_HEIGHT - HEADER_ROW_HEIGHT;

    const newPages = [];
    let pageRows = [];
    let colUsed = 0;
    let colCount = 0;

    trs.forEach((tr, i) => {
      const rh = tr.getBoundingClientRect().height;

      if (colUsed + rh > colHeight) {
        colCount += 1;
        if (colCount >= 2) {
          newPages.push(pageRows);
          pageRows = [];
          colCount = 0;
        }
        colUsed = 0;
      }

      pageRows.push(reportData?.data[i]);
      colUsed += rh;
    });

    if (pageRows.length) newPages.push(pageRows);
    setPages(newPages);
  }, [reportData]);


  useEffect(() => {
    console.log("===============sgdfgdgdf==================");
    console.log(queryParams);

    console.log(selectedSession);


  }, [selectedSession])



  // useEffect(()=>{
  //   console.log("===============---------=====================");
  //   console.log(reportData);

  // }, [reportData])

  // Single column header â€” reused twice side by side 
  const ColHeader = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 76px 1fr 48px",
        background: "#f3f4f6",
        borderTop: "1px solid #000000",
        borderBottom: "2px solid #374151",
        fontWeight: "600",
        fontSize: "16px",
        color: "#111827",
      }}
    >
      <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #000000", borderLeft: "1px solid #000000" }}> ক্র: </span>
      <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #d1d5db" }}> আইডি নং </span>
      <span style={{ padding: "5px 6px", borderRight: "1px solid #d1d5db" }}> পরীক্ষার্থীর নাম </span>
      <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #000000" }}> ফি </span>
    </div>
  );

  const PageHeader = () => (
    <div className="text-center mb-3 border-b border-gray-200 pb-3">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {institutionInfo?.InstitutionName}
      </h1>
      <p className="text-black text-[16px] leading-snug">{institutionInfo?.Address}</p>
      <p className="text-black text-[16px] leading-snug">
        {bnBijoy2Unicode(institutionInfo?.ContactNumber)}
      </p>
      <div className="py-1 px-4 mx-auto max-w-2xl mt-1">
        <h2 className="text-[18px] font-semibold">
          শিক্ষার্থীর ফি উত্তোলন তালিকা, শিক্ষাবর্ষ:({selectedSession?.SessionName}), সাব ক্লাস বাংলা:({selectedSubClassDetails?.SubClass})
        </h2>
      </div>
      <div className="flex justify-between mt-1">
        <p className="text-[15px] font-semibold">পরীক্ষার নাম= {examListData[0]["Exam"]["ExamName"]} </p>
        <p className="text-[15px] font-semibold">নির্ধারিত ফির পরিমান = {bnBijoy2Unicode(String(reportData?.data[0]['Fee']))}</p>
        <p className="text-[14px]">প্রিন্ট তারিখ : {new Date().toLocaleDateString("bn-BD")}</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10px; }
          body  { margin: 0; }
          .print-page {
            border: none !important;
            box-shadow: none !important;
            margin-bottom: 0 !important;
            page-break-after: always;
          }
          .print-page:last-child { page-break-after: auto; }
          #measure-container { display: none !important; }
        }
        .flow-row { break-inside: avoid; }
      `}</style>


      <div
        id="measure-container"
        ref={measureRef}
        style={{
          position: "fixed",
          top: "-9999px",
          left: 0,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }} className="border border-black">
          <tbody>
            {reportData?.data.map((row, i) => (
              <tr key={i} data-idx={i}>
                <td style={{ padding: "5px 6px", width: "36px", border: "1px solid #000" }}>{bnBijoy2Unicode(String(row.sl))}</td>
                <td style={{ padding: "5px 6px", width: "76px" }}>{bnBijoy2Unicode(String(row.roll))}</td>
                <td style={{ padding: "5px 6px" }}>{row.name}</td>
                <td style={{ padding: "5px 6px", width: "48px" }}>{row.fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-10 text-gray-400">কোন তথ্য পাওয়া যায়নি</div>
      ) : (
        pages.map((pageData, pageIndex) => (
          <div
            key={pageIndex}
            className=" print-page bg-white text-gray-800 font-[kalpurush] p-5 max-w-4xl mx-auto border border-gray-200 shadow-sm rounded-lg mb-6"
          >
            <PageHeader />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <ColHeader />
              <ColHeader />
            </div>

            {/* âœ… FIX 2: ONE css columns div â€” only data rows inside, no nested columns */}
            <div
              style={{
                columns: 2,
                columnGap: "14px",
                columnFill: "auto",
                height: `${PAGE_HEIGHT}px`,
                overflow: "hidden",
                columnRule: "0px solid #d1d5db",
              }}
            >
              {pageData.map((row, i) => (
                <div
                  key={i}
                  className="flow-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 76px 1fr 48px",
                    borderBottom: "1px solid #000000",
                    fontSize: "13px",
                    color: "#1f2937",
                    background: i % 2 === 0 ? "#ffffff" : "#ffffff",
                  }}
                >
                  <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #000000", borderLeft: "1px solid #000000" }}>
                    {bnBijoy2Unicode(String(i + 1))}
                  </span>
                  <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #000000" }}>
                    {bnBijoy2Unicode(String(row.UserCode))}
                  </span>
                  <span style={{ padding: "5px 6px", borderRight: "1px solid #000000" }}>
                    {row?.UserName}
                  </span>
                  <span style={{ padding: "5px 6px", textAlign: "center", borderRight: "1px solid #000000", fontSize: "16px" }}>
                    {bnBijoy2Unicode(String(row?.Fee))}
                  </span>
                </div>
              ))}
            </div>

            {/* {pageIndex === pages.length - 1 && (
              <div className="mt-4 flex justify-end">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2 font-medium">à¦¸à§à¦¬à¦¾à¦•à§à¦·à¦°</p>
                  <div className="border-t border-gray-400 w-40 mx-auto" />
                  <p className="text-xs text-gray-500 mt-1">à¦ªà§à¦°à¦§à¦¾à¦¨ à¦¶à¦¿à¦•à§à¦·à¦•</p>
                </div>
              </div>
            )} */}
          </div>
        ))
      )}
    </>
  );
};

export default BanglaTwoColumn;
//   