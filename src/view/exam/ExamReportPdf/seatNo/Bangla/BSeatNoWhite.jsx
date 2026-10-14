import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
import SeatCardWatermark from "../../../../../pages/userpanel/SeatCard/SeatCardWatermark";

/**
 * সিট নং — সাদা-কালো (A4 পোর্ট্রেট, প্রতি পাতায় ২ × ৪ = ৮টি কার্ড)।
 *
 * ছাপার হিসাব পুরোপুরি কোডে বাঁধা, তাই যে কম্পিউটার থেকেই ছাপা হোক আর
 * Chrome এর Margins ড্রপডাউনে Default থাকুক বা None — কাগজে হুবহু এক
 * জিনিসই বসে।
 *
 *   ১) পাতার উচ্চতা একটাই: পুরো A4, ২৯৭mm। মার্জিনটা পাতার নিজের
 *      padding (১০mm), তাই Margins ড্রপডাউন যা-ই থাকুক এক।
 *   ২) কার্ডের উচ্চতা স্থির (গ্রিডে বাঁধা) আর লেখা pt এ — px পর্দার DPI
 *      অনুযায়ী বদলায়, pt বদলায় না।
 *   ৩) কার্ডে overflow: hidden, লেখাগুলোর line-height বাঁধা — তাই কার্ড
 *      কখনো নিজের ঘর ছাড়িয়ে যায় না, গ্রিডও নড়ে না।
 *
 * ────────────────────────────────────────────────────────────────────
 * ডেটা কোথা থেকে আসে
 * ────────────────────────────────────────────────────────────────────
 * প্যারেন্ট `studentList` দিলে সেটাই একমাত্র উৎস — exam_report (report 7)
 * এখন প্রতিটি শিক্ষার্থীর সাথেই কলাম, বেঞ্চ ও আসন নং পাঠায়:
 *
 *   ColumnNo → Exam_HallColumns.Label   (কলাম)
 *   BenchNo  → Exam_Hall_Rows.RowLabel  (বেঞ্চ = সারি)
 *   SeatNum  → Exam_SitAllocation.SeatNum
 *
 * আগে hallwise সিট প্ল্যান API থেকে নেওয়া হত, কিন্তু ওই রেসপন্সে কলাম ও
 * বেঞ্চ থাকে না — তাই ঘর দুইটা সবসময় ফাঁকা পড়ত। `studentList` না এলে
 * পুরোনো পথটা fallback হিসেবে রয়ে গেছে, তাই কিছু ভাঙে না।
 *
 * ────────────────────────────────────────────────────────────────────
 * দুইটা মোড
 * ────────────────────────────────────────────────────────────────────
 *   ক) আসন নং সহ  (showSeatNo = true, ডিফল্ট)
 *      কার্ডের নিচে কলাম | বেঞ্চ | আসন নং এর সারি বসে। কারো জন্যই কোনো
 *      বরাদ্দ না থাকলে কার্ড ছাপা হয় না — পর্দায় বার্তা: আগে
 *      শ্রেণিবিন্যাসের কাজ করে আসুন।
 *
 *   খ) আসন নং ছাড়া (showSeatNo = false)
 *      যারা শ্রেণিবিন্যাসই করেননি তাদের জন্য। সারিটা কার্ডে একেবারেই বসে
 *      না — কার্ড শেষ হয় আইডি নং এর ঘরে, আর বরাদ্দের শর্তটাও দেখা হয় না।
 *
 * গ্রিডের হিসাব:
 *   কার্ডের চওড়া = (২১০ − ১০×২ − ফাঁক ৪) ÷ ২        = ৯৩mm
 *   কার্ডের উচ্চতা = (২৯৭ − ১০×২ − ফাঁক ৪×৩) ÷ ৪    = ৬৬.২৫mm
 */

const CARDS_PER_PAGE = 8;

// কাগজের হিসাব (mm) — বদলাতে হলে শুধু এখানেই
const PAGE = { width: 210, height: 297, pad: 10, gap: 4 };

// ঘর ফাঁকা থাকলে যা বসবে
const DASH = "-";

/** মান আছে কি না — 0 ও "0" যেন ফাঁকা হিসেবে না ধরা পড়ে */
const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== "";

const BSeatNoWhite = ({
  queryParams,
  documentLogo,
  logoIsActive,
  showSeatNo,
  studentList,
}) => {
  // আসন নং সহ না ছাড়া — prop এ না এলে queryParams থেকেও নেওয়া যায়,
  // কিছুই না এলে আগের আচরণ (আসন নং সহ) বহাল থাকে।
  const withSeat =
    showSeatNo !== undefined && showSeatNo !== null
      ? Boolean(Number(showSeatNo))
      : queryParams?.ShowSeatNo !== undefined && queryParams?.ShowSeatNo !== null
      ? Boolean(Number(queryParams.ShowSeatNo))
      : true;

  const listRows = Array.isArray(studentList) ? studentList : [];
  const hasList = listRows.length > 0;

  // তালিকা হাতে থাকলে hallwise API ছোঁয়ার দরকারই নেই। আসন নং ছাড়া মোডেও
  // ছোঁয়া হয় না — তাই শ্রেণিবিন্যাস না থাকলেও ছাপা আটকায় না।
  const { data: examSeatPlanData, isFetching: seatPlanFetching } =
    useGetHallwiseSeatPlanQuery(
      {
        sessionId: queryParams?.SessionID,
        examId: queryParams?.ExamID,
        subClassId: queryParams?.SubClassID,
      },
      { skip: !withSeat || hasList }
    );

  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  /**
   * দুই উৎসের গড়ন আলাদা, তাই এক জায়গাতেই মিলিয়ে নেওয়া হয়:
   *   exam_report → ColumnNo / BenchNo / SeatNum, নাম User এর ভিতরে
   *   hallwise    → SeatNum, কলাম ও বেঞ্চ সাধারণত থাকেই না
   * নাম না পেলে আইডি (ColumnID / RowID) বসে, ফাঁকা রাখার চেয়ে ভালো।
   */
  const normalize = (row, index) => ({
    __key:
      row?.AssignmentID ?? row?.ID ?? row?.UserID ?? row?.AdmissionID ?? `row-${index}`,
    User: row?.User ?? {
      UserName: row?.UserName,
      UserCode: row?.UserCode,
    },
    // ব্যাকএন্ড ColumnNo / BenchNo পাঠায় — ওই দুইটাই আগে, তারপর টেবিলের
    // নিজের নামের কলাম। আইডি (ColumnID / RowID) ইচ্ছে করেই রাখা হয়নি —
    // নাম না পেলে ঘরটা ফাঁকা (-) যাবে, আইডি কাগজে যাবে না।
    __column: row?.ColumnNo ?? row?.Label ?? "",
    __bench: row?.BenchNo ?? row?.RowLabel ?? "",
    __seatNum: row?.SeatNum ?? row?.SeatNo ?? "",
  });

  // hallwise API হল ধরে গ্রুপ করে পাঠায়, তাই গ্রুপগুলো এক তালিকায় মেলানো হয়
  const fallbackRows = examSeatPlanData
    ? Object.values(examSeatPlanData).flatMap((seats) =>
        Array.isArray(seats) ? seats : []
      )
    : [];

  const allSeats = (hasList ? listRows : fallbackRows).map(normalize);

  // তালিকাই নেই — ফাঁকা পর্দার বদলে কারণটা দেখাই
  if (allSeats.length === 0 && !seatPlanFetching) {
    return (
      <div className="w-full flex justify-center py-10 px-4">
        <div className="max-w-xl w-full border border-amber-300 bg-amber-50 rounded-md p-5 text-center">
          <h3 className="text-lg font-semibold text-amber-800">
            কোনো শিক্ষার্থী পাওয়া যায়নি
          </h3>
          <p className="mt-2 text-sm text-amber-800 leading-6">
            এই শিক্ষাবর্ষ, পরীক্ষা, সাব ক্লাস ও অবস্থান অনুযায়ী ফলাফল তালিকায়
            কোনো পরীক্ষার্থী নেই। নির্বাচনগুলো একবার মিলিয়ে দেখুন।
          </p>
        </div>
      </div>
    );
  }

  // শ্রেণিবিন্যাস হয়েছে কি না — আসন নং সহ ছাপতে চাইলে এটাই শর্ত।
  // একজনেরও কলাম/বেঞ্চ/আসন না থাকলে বরাদ্দ হয়নি ধরে নেওয়া হয়।
  // (আসন নং ছাড়া মোডে এই শর্ত আদৌ দেখা হয় না।)
  const anyAllocation = allSeats.some(
    (s) => hasValue(s.__seatNum) || hasValue(s.__column) || hasValue(s.__bench)
  );

  if (withSeat && !seatPlanFetching && allSeats.length > 0 && !anyAllocation) {
    return (
      <div className="w-full flex justify-center py-10 px-4">
        <div className="max-w-xl w-full border border-red-300 bg-red-50 rounded-md p-5 text-center">
          <h3 className="text-lg font-semibold text-red-700">
            আগে শ্রেণিবিন্যাসের কাজ করে আসুন
          </h3>
          <p className="mt-2 text-sm text-red-700 leading-6">
            এই শ্রেণি/পরীক্ষার শ্রেণিবিন্যাস (সিট প্ল্যান) এখনো করা হয়নি, তাই
            কলাম, বেঞ্চ ও আসন নং বসানো সম্ভব হচ্ছে না।
          </p>
          <p className="mt-2 text-sm text-red-700 leading-6">
            শ্রেণিবিন্যাস ছাড়াই ছাপতে চাইলে{" "}
            <span className="font-semibold">“আসন নং ছাড়া”</span> অপশনটি বেছে
            নিন — তখন ঘর তিনটি কার্ডে থাকবেই না।
          </p>
        </div>
      </div>
    );
  }

  const pages = [];
  for (let i = 0; i < allSeats.length; i += CARDS_PER_PAGE) {
    pages.push(allSeats.slice(i, i + CARDS_PER_PAGE));
  }

  return (
    <div className="seat-wrap bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        /* ---- পাতা: পর্দা ও কাগজ, দুই জায়গাতেই একই মাপ ---- */
        .seat-page {
          box-sizing: border-box;
          width: ${PAGE.width}mm;
          height: ${PAGE.height}mm;
          padding: ${PAGE.pad}mm;
          background: #ffffff;
          display: grid;
          /* minmax(0, 1fr) — শুধু 1fr দিলে ভিতরের লেখা বড় হলে ঘরটাও
             বড় হয়ে যায় (1fr আসলে minmax(auto, 1fr)), তখন নিচের কার্ড
             পাতার কিনারায় নেমে গিয়ে কেটে যেত। 0 দিলে ঘর কখনো নিজের
             ভাগের চেয়ে বড় হয় না — তাই ৮টা কার্ড সবসময় হুবহু এক পাতায়। */
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(4, minmax(0, 1fr));
          gap: ${PAGE.gap}mm;
          overflow: hidden;
        }

        /* ---- কার্ড ---- */
        .seat-card {
          box-sizing: border-box;
          position: relative;
          border: 0.5mm solid #000000;
          border-radius: 1mm;
          padding: 2mm 3mm;
          background: #ffffff;
          overflow: hidden;              /* লেখা বড় হলেও কার্ড ফুলে ওঠে না */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        /* লেখাগুলো — সব pt এ, line-height বাঁধা */
        .seat-card .sc-inst   { font-size: 13pt; font-weight: 700; line-height: 1.15; }
        .seat-card .sc-addr   { font-size: 8.5pt; line-height: 1.3; margin-top: 0.8mm; }
        .seat-card .sc-exam   { font-size: 8.5pt; line-height: 1.3; }
        .seat-card .sc-class  { font-size: 12pt; line-height: 1.2; margin-top: 1mm; }
        .seat-card .sc-name   { font-size: 10.5pt; line-height: 1.25; margin-top: 1mm; }
        .seat-card .sc-id     { font-size: 12pt; line-height: 1.1; margin-top: 1.2mm;
                                border: 0.3mm solid #000000; border-radius: 1.5mm;
                                padding: 1mm 2mm; width: 100%; }

        /* ---- কলাম | বেঞ্চ | আসন নং ---- */
        .seat-card .sc-seat   { display: flex; width: 100%; margin-top: 1.2mm;
                                border: 0.3mm solid #000000; border-radius: 1.5mm;
                                overflow: hidden; }
        .seat-card .sc-seat > span { width: 33.3333%; padding: 1mm 0.8mm; min-width: 0; }
        .seat-card .sc-seat > span + span { border-left: 0.3mm solid #000000; }
        .seat-card .sc-seat .sc-lbl { display: block; font-size: 7.5pt; line-height: 1.1; }
        .seat-card .sc-seat .sc-val { display: block; font-size: 9.5pt; font-weight: 700;
                                      line-height: 1.2; margin-top: 0.4mm;
                                      /* মান লম্বা হলে ঘরটা যেন না ফুলে ওঠে —
                                         এক লাইনেই কেটে যাবে */
                                      overflow: hidden;
                                      text-overflow: ellipsis;
                                      white-space: nowrap; }

        /* দুই লাইনের বেশি হলে কেটে দেওয়া — কার্ডের মাপ তাতে ঠিক থাকে */
        .seat-card .sc-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media screen {
          .seat-page {
            margin: 6mm auto;
            box-shadow: 0 1mm 4mm rgba(0, 0, 0, 0.18);
          }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }

          .seat-wrap { background: transparent !important; }

          .seat-page {
            margin: 0 !important;
            box-shadow: none !important;
            break-after: page;
            page-break-after: always;
          }

          /* শেষ পাতার পর বাড়তি খালি পাতা যেন না আসে */
          .seat-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .seat-card, .seat-card * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageSeats, pageIndex) => (
        <div key={pageIndex} className="seat-page">
          {pageSeats.map((assignment) => (
            <div key={assignment.__key} className="seat-card">
              <SeatCardWatermark
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />

              <h1 className="sc-inst sc-clamp">
                {institutionInfo?.InstitutionName}
              </h1>
              <p className="sc-addr sc-clamp">{institutionInfo?.Address}</p>
              <p className="sc-exam sc-clamp">
                {examNameData?.ExamName} - {sessionData?.SessionName}
              </p>
              <h2 className="sc-class">{subClassData?.SubClass}</h2>
              <h2 className="sc-name sc-clamp">
                পরীক্ষার্থী : {assignment.User?.UserName}
              </h2>
              <h1 className="sc-id">আইডি নং : {assignment.User?.UserCode}</h1>

              {/* আসন নং ছাড়া মোডে সারিটা একেবারেই বসে না — কার্ড এখানেই শেষ */}
              {withSeat && (
                <div className="sc-seat">
                  <span>
                    <span className="sc-lbl">কলাম</span>
                    <span className="sc-val">
                      {hasValue(assignment.__column) ? assignment.__column : DASH}
                    </span>
                  </span>
                  <span>
                    <span className="sc-lbl">বেঞ্চ</span>
                    <span className="sc-val">
                      {hasValue(assignment.__bench) ? assignment.__bench : DASH}
                    </span>
                  </span>
                  <span>
                    <span className="sc-lbl">আসন নং</span>
                    <span className="sc-val">
                      {hasValue(assignment.__seatNum) ? assignment.__seatNum : DASH}
                    </span>
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* শেষ পাতা অর্ধেক ভরা থাকলে বাকি ঘরগুলো খালি — তাতে ভরা
              কার্ডগুলো নিজের জায়গাতেই থাকে, টেনে বড় হয়ে যায় না */}
          {Array.from({ length: CARDS_PER_PAGE - pageSeats.length }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BSeatNoWhite;
