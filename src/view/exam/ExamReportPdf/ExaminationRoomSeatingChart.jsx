import { useLayoutEffect, useRef, useState } from "react";
import { useGetSingleSubClassQuery } from "../../../features/class/classQuerySlice";
import { useGetExamNameQuery } from "../../../features/exam/examQuerySlice";
import { useGetExamwiseSeatPlanQuery } from "../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../features/session/sessionSlice";
import { useGetInstitutionInfoQuery } from "../../../features/settings/settingsQuerySlice";
import { useGetExamHallListQuery } from "../../../features/examhall/examHallQuerySlice";
import bnBijoy2Unicode from "../../../utils/conveter";

/**
 * পরীক্ষার হলের আসন বিন্যাস — এক হল = এক পাতা (A4 পোর্ট্রেট)।
 *
 * ছাপার হিসাব কোডে বাঁধা, তাই সব কম্পিউটারে এক। আগে যা সমস্যা ছিল আর
 * এখন যেভাবে ঠিক:
 *
 *   ১) আগে `@page` বলাই ছিল না — মার্জিন বসত ব্রাউজার ও প্রিন্টারের
 *      নিজের ডিফল্ট থেকে, তাই এক কম্পিউটারে এক রকম আসত। এখন
 *      `@page { size: A4; margin: 0 }` আর মার্জিনটা প্রতিটা পাতার নিজের
 *      padding (১২mm) — Margins ড্রপডাউনে Default বা None, দুটোতেই এক।
 *
 *   ২) আগে কলামের গ্রিড স্থির `grid-cols-3` ছিল। হলে ৪টা কলাম থাকলে
 *      চতুর্থটা নিচে নেমে যেত, ২টা থাকলে অযথা টেনে চওড়া হতো। এখন গ্রিড
 *      হলের আসল কলাম সংখ্যা অনুযায়ী বসে।
 *
 *   ৩) আগে হল বড় হলে (অনেক বেঞ্চ) লেখা পাতা ছাড়িয়ে যেত আর মাঝখান থেকে
 *      কেটে পরের পাতায় চলে যেত। এখন পাতাটা মেপে দেখা হয় — না আঁটলে পুরো
 *      বিন্যাসটা সমানুপাতে ছোট করে এক পাতাতেই বসিয়ে দেওয়া হয় (FitToPage)।
 *      কখনো বড় করা হয় না, তাই ছোট হল আগের মতোই স্বাভাবিক মাপে থাকে।
 */

// কাগজের হিসাব (mm) — বদলাতে হলে শুধু এখানেই
const PAGE = { width: 210, height: 297, pad: 12 };

/** শ্রেণিভিত্তিক রঙ — আপনার মূল কোডের তালিকাটাই, অপরিবর্তিত */
const PALETTE = [
  { bg: '#E1F5EE', border: '#9FE1CB', text: '#0F6E56' },
  { bg: '#E6F1FB', border: '#B5D4F4', text: '#0C447C' },
  { bg: '#FBEAF0', border: '#F4C0D1', text: '#72243E' },
  { bg: '#FAEEDA', border: '#FAC775', text: '#633806' },
  { bg: '#F3E8FF', border: '#D8B4FE', text: '#6B21A8' },
];

const BN_FONT =
  "SolaimanLipiNormal, SolaimanLipi, 'Noto Sans Bengali', serif";

/**
 * এক পাতায় পাশাপাশি কতগুলো আসন পড়ছে, তার উপর আসনের ঘরের চওড়া নির্ভর
 * করে — আর তার উপর লেখার মাপ। স্থির মাপ দিলে ৫ কলামের হলে আইডি নম্বরটা
 * ঘরের বাইরে গিয়ে কেটে যেত ("আইডি: 1000")।
 *
 * হিসাবটা আসল mm এ: পাতার ভিতরের চওড়া থেকে কলামের ফাঁক ও ভিতরের padding
 * বাদ দিয়ে প্রতিটা আসনের ঘর কত mm পড়ছে বের করা হয়, তারপর ওই ঘরে কত pt
 * এর লেখা আঁটে সেটা। সরু হয়ে গেলে "আইডি:" কথাটা বাদ যায় — সংখ্যাটাই
 * আসল, আর ওটুকু বাদ দিলে নম্বরটা পুরোটা পড়া যায়।
 */
const seatTextPlan = (columns = []) => {
  const colCount = Math.max(columns.length, 1);

  // এক সারিতে সবচেয়ে বেশি যত আসন, সব কলাম মিলিয়ে
  const seatsAcross = columns.reduce((sum, col) => {
    const most = (col?.rows || []).reduce(
      (m, r) => Math.max(m, Math.max(1, r?.Seats || 1)),
      1
    );
    return sum + most;
  }, 0) || colCount;

  const inner = PAGE.width - PAGE.pad * 2;        // ১৮৬mm
  const used =
    3 * (colCount - 1) +                          // কলামের মাঝের ফাঁক
    colCount * 3 +                                // কলামের ভিতরের padding
    (seatsAcross - colCount);                     // আসনের মাঝের ফাঁক
  const seatW = Math.max((inner - used) / seatsAcross, 5);

  // ঘরের ভিতরে ২mm padding বাদ দিয়ে যতটুকু থাকে তাতে ৬ অঙ্কের সংখ্যা
  const usable = seatW - 2;
  const withLabel = usable / 1.95;                // "আইডি: ১২৩৪৫৬"
  const bare = usable / 1.16;                     // শুধু "১২৩৪৫৬"

  const showLabel = withLabel >= 6.5;
  const size = Math.min(Math.max(showLabel ? withLabel : bare, 5), 9.5);

  return { showLabel, size: Number(size.toFixed(1)), seatW };
};

/**
 * ভিতরের লেখাগুলো পাতার ঘরে না আঁটলে সমানুপাতে ছোট করে বসায়।
 *
 * মাপাটা useLayoutEffect এ — আঁকার পর, কিন্তু পর্দায় দেখানোর আগে। তাই
 * বড় হয়ে একবার ঝিলিক দিয়ে তারপর ছোট হয় না।
 */
function FitToPage({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return undefined;

    const measure = () => {
      // স্কেল সরিয়ে আসল উচ্চতাটা মাপি, নইলে আগের স্কেল করা মাপই পেতাম।
      // মাপা শেষে সাথে সাথেই আগের অবস্থায় ফিরিয়ে দিই — নইলে হিসাবটা
      // আগেরবারের সমান হলে React নতুন করে আঁকে না, আর হাতে বসানো
      // 'none' টাই রয়ে যায়। (এই ভুলেই বড় হল ছোট হচ্ছিল না।)
      const prevTransform = inner.style.transform;
      const prevWidth = inner.style.width;

      inner.style.transform = 'none';
      inner.style.width = '100%';

      const need = inner.scrollHeight;     // যতটুকু লাগে
      const have = outer.clientHeight;     // যতটুকু আছে

      inner.style.transform = prevTransform;
      inner.style.width = prevWidth;

      // ছোট করা হয়, বড় কখনো নয় — তাই ছোট হল আগের মতোই স্বাভাবিক মাপে
      const next = need > have && have > 0 ? Math.max(have / need, 0.35) : 1;
      setScale(Number(next.toFixed(4)));
    };

    measure();

    // ফন্ট দেরিতে এলে মাপ বদলায় — এলে আরেকবার মেপে নিই
    let alive = true;
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { if (alive) measure(); });
    }
    const id = requestAnimationFrame(measure);

    return () => { alive = false; cancelAnimationFrame(id); };
  }, [children]);

  return (
    // outer নিজেই পাতার flex item। আগে এর উচ্চতা ছিল height: 100%, কিন্তু
    // বাবার উচ্চতা auto থাকায় শতাংশটা content এর সমান হয়ে যেত — তাই
    // "লাগে" আর "আছে" সবসময় সমান আসত, আর ছোট করার দরকারই ধরা পড়ত না।
    <div
      ref={outerRef}
      style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}
    >
      <div
        ref={innerRef}
        style={{
          transformOrigin: 'top left',
          transform: scale === 1 ? 'none' : `scale(${scale})`,
          // ছোট করার পর যেন পুরো চওড়াটাই ভরে — তাই আগে ততটাই চওড়া করে নিই
          width: scale === 1 ? '100%' : `${(100 / scale).toFixed(4)}%`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function HallOverviewPage({ hall, assignments, institutionInfo, sessionName, isLast }) {
  const columns = hall?.columns || [];
  const plan = seatTextPlan(columns);

  const lookup = {};
  assignments?.forEach((item) => {
    const colIdx = columns.findIndex((col) => col.ColumnID === item.ColumnID);
    if (colIdx === -1) return;
    const rowIdx = columns[colIdx]?.rows?.findIndex((row) => row.RowID === item.RowID);
    if (rowIdx === -1 || rowIdx === undefined) return;
    const seatNum = item.SeatNum || 1;

    const subClassLabel =
      item.SubClass || item.SubClassID || `SubClass ${item.SubClassID}`;

    lookup[`${colIdx}-${rowIdx}-${seatNum}`] = {
      userCode: item.User?.UserCode ?? item.UserCode,
      fullName: item.User?.UserName ?? item.UserName,
      subClass: subClassLabel,
    };
  });

  // প্রতিটি শ্রেণির জন্য আলাদা রঙ — যে শ্রেণি আগে পড়ে সে আগের রঙ পায়,
  // তাই একই হলে একাধিক শ্রেণি বসলে চোখে আলাদা করা যায়
  const subClassColors = {};
  let colorIdx = 0;
  Object.values(lookup).forEach((student) => {
    if (!subClassColors[student.subClass]) {
      subClassColors[student.subClass] = PALETTE[colorIdx % PALETTE.length];
      colorIdx += 1;
    }
  });

  return (
    <div
      className={`chart-page ${isLast ? 'is-last' : ''}`}
      style={{ fontFamily: BN_FONT }}
    >
      {/* ------------------------------------------------------ শিরোনাম */}
      <div className="chart-head">
        <h1 className="ch-inst">{institutionInfo?.InstitutionName}</h1>
        <p className="ch-addr">{institutionInfo?.Address}</p>
        <div className="ch-meta">
          হল: {bnBijoy2Unicode(String(hall?.HallName || '')) || 'হল'}
        </div>
        {sessionName ? <div className="ch-meta">শিক্ষাবর্ষ: {sessionName}</div> : null}
      </div>

      {/* ------------------------------------------------- আসন বিন্যাস */}
      <FitToPage>
          <div
            className="ch-cols"
            style={{
              // কলামের সংখ্যা হলের আসল সংখ্যা অনুযায়ী — স্থির ৩ নয়
              gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((col, ci) => (
              <div key={ci} className="ch-col">
                <div className="ch-col-head">{col.Label}</div>

                {col?.rows?.map((row, ri) => {
                  const seats = Math.max(1, row?.Seats || 1);

                  return (
                    <div key={ri} className="ch-row">
                      <div
                        className="ch-seats"
                        style={{
                          gridTemplateColumns: `repeat(${seats}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({ length: seats }).map((_, si) => {
                          const student = lookup[`${ci}-${ri}-${si + 1}`];

                          return (
                            <div
                              key={si}
                              className="ch-seat"
                              style={
                                student && subClassColors[student.subClass]
                                  ? {
                                      borderColor:
                                        subClassColors[student.subClass].border,
                                      background:
                                        subClassColors[student.subClass].bg,
                                      color: subClassColors[student.subClass].text,
                                    }
                                  : undefined
                              }
                            >
                              {student ? (
                                <span
                                  className="ch-id"
                                  style={{ fontSize: `${plan.size}pt` }}
                                >
                                  {plan.showLabel ? 'আইডি: ' : ''}
                                  {bnBijoy2Unicode(String(student.userCode))}
                                </span>
                              ) : null}
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
      </FitToPage>
    </div>
  );
}

// ─── Main printable document ─────────────────────────────────────────────────
export default function ExaminationRoomSeatingChart({ queryParams }) {
  const { data: examSeatPlanData } = useGetExamwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
  });
  const { data: examHallList } = useGetExamHallListQuery();
  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const hallList = Array.isArray(examHallList) ? examHallList : [];
  const hallEntries = examSeatPlanData ? Object.entries(examSeatPlanData) : [];

  const getHallById = (hallId) =>
    hallList.find((hall) => String(hall.HallID) === String(hallId)) || null;

  const visible = hallEntries
    .map(([hallId, assignments]) => ({ hall: getHallById(hallId), assignments, hallId }))
    .filter((x) => x.hall);

  return (
    <div className="chart-wrap print:block">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        /* ---- পাতা ---- */
        .chart-page {
          box-sizing: border-box;
          width: ${PAGE.width}mm;
          height: ${PAGE.height}mm;
          padding: ${PAGE.pad}mm;
          background: #ffffff;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .chart-head {
          text-align: center;
          border-bottom: 0.5mm solid #1B2A4A;
          padding-bottom: 3mm;
          margin-bottom: 4mm;
          flex: none;
        }
        .chart-head .ch-inst { font-size: 16pt; font-weight: 700; line-height: 1.15; color: #000; }
        .chart-head .ch-addr { font-size: 10pt; line-height: 1.3; color: #000; }
        .chart-head .ch-meta { font-size: 11pt; line-height: 1.35; color: #3b3b3b; margin-top: 1mm; }

        .ch-cols { display: grid; gap: 3mm; }

        .ch-col {
          border: 0.25mm solid #E4E8F0;
          border-radius: 1mm;
          padding: 1.5mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .ch-col-head {
          text-align: center;
          font-size: 9.5pt;
          font-weight: 700;
          color: #1B2A4A;
          margin-bottom: 2mm;
        }

        .ch-row { margin-bottom: 2mm; }
        .ch-seats { display: grid; gap: 1mm; }

        .ch-seat {
          min-height: 8mm;
          border: 0.25mm solid #DDDDDD;
          border-radius: 1mm;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0.8mm 1mm;
          overflow: hidden;
        }
        /* মাপটা বসে seatTextPlan() থেকে, inline style এ — এখানে শুধু বাকিটা।
           nowrap নেই: খুব সরু ঘরে সংখ্যাটা কেটে যাওয়ার বদলে দুই লাইনে যাক */
        .ch-id {
          font-weight: 700;
          line-height: 1.05;
          word-break: break-all;
          text-align: center;
        }

        @media screen {
          .chart-page {
            margin: 6mm auto;
            box-shadow: 0 1mm 4mm rgba(0, 0, 0, 0.18);
          }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }

          .chart-page {
            margin: 0 !important;
            box-shadow: none !important;
            break-after: page;
            page-break-after: always;
          }

          /* শেষ হলের পর বাড়তি খালি পাতা যেন না আসে */
          .chart-page.is-last, .chart-page:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .chart-page, .chart-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {visible.length ? (
        visible.map(({ hall, assignments, hallId }, index) => (
          <HallOverviewPage
            key={hallId}
            hall={hall}
            assignments={assignments}
            institutionInfo={institutionInfo}
            examName={examNameData?.ExamName}
            sessionName={sessionData?.SessionName}
            isLast={index === visible.length - 1}
          />
        ))
      ) : (
        <div style={{ padding: 24, color: '#556070' }}>কোন হল পাওয়া যায়নি।</div>
      )}
    </div>
  );
}
