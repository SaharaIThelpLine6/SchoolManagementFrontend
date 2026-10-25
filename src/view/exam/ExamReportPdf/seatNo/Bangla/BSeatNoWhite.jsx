import { Buffer } from "buffer";
import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
import SeatCardFace, {
  seatCardFaceCss,
} from "../../../../../pages/userpanel/SeatCard/Seatcardface";
import {
  cardsPerPageCount,
  defaultSeatCardSettings,
  hasValue,
} from "../../../../../Data/seatCardFields";

/**
 * সিট নং — সাদা-কালো, কেটে নেওয়ার মতো কার্ড।
 *
 * কার্ডের গড়ন তিন ভাগে, আর কোন ঘরটা বসবে সেটা সেটিংস থেকে আসে
 * (উপরের বারের সেটিংস বোতাম → সিট কার্ড সেটিংস):
 *
 *   মাথা   → প্রতিষ্ঠানের নাম, ঠিকানা, পরীক্ষা — মাঝখানে
 *   বড় ঘর → কলাম / বেঞ্চ নং / আসন নং — বড় অঙ্কে, বাঁধানো ঘরে
 *   তথ্য   → নাম, আইডি, জামাত, হল, পাশ — বাঁ দিকে লাইন ধরে
 *
 * ছাপার হিসাব কোডে বাঁধা, তাই যে কম্পিউটার থেকেই ছাপা হোক কাগজে একই
 * জিনিস বসে: পাতার উচ্চতা পুরো A4 (২৯৭mm), মার্জিনটা পাতার নিজের
 * padding, আর লেখা pt এ (px পর্দার DPI অনুযায়ী বদলায়, pt বদলায় না)।
 *
 * ────────────────────────────────────────────────────────────────────
 * ডেটা কোথা থেকে আসে — দুই উৎস, একটাই তালিকা
 * ────────────────────────────────────────────────────────────────────
 *   studentList (exam_report, report 7) → Student_Result এর সারিগুলো,
 *                                         সাথে কলাম ও বেঞ্চের নাম
 *   hallwise সিট প্ল্যান API            → যাদের আসন বরাদ্দ হয়েছে
 *
 * দুইটা সবসময় মেলে না, তাই UserCode ধরে মিলিয়ে একটাই তালিকা বানানো
 * হয় — কেউ বাদ পড়ে না, আর কলাম/বেঞ্চের ঘরও ভরে। ক্রমটা সিট প্ল্যানের,
 * কারণ কাগজগুলো হল ও আসনের ক্রমেই বিলি হয়।
 *
 * ────────────────────────────────────────────────────────────────────
 * দুইটা মোড
 * ────────────────────────────────────────────────────────────────────
 *   ক) আসন নং সহ  (showSeatNo = true, ডিফল্ট)
 *      বড় ঘরগুলো বসে। কারো জন্যই বরাদ্দ না থাকলে কাগজ ছাপা হয় না —
 *      পর্দায় বার্তা: আগে শ্রেণিবিন্যাসের কাজ করে আসুন।
 *
 *   খ) আসন নং ছাড়া (showSeatNo = false)
 *      বড় ঘরগুলো একেবারেই বসে না, বরাদ্দের শর্তটাও দেখা হয় না।
 *
 * ────────────────────────────────────────────────────────────────────
 * ⭐ ডিজাইন টেমপ্লেট — চেহারাটা সেটিংস থেকে আসে
 * ────────────────────────────────────────────────────────────────────
 * কার্ডের সাজ এই ফাইলে বাঁধা নেই। সেটিংসে বাছা টেমপ্লেট থেকে কিছু মান
 * (CSS ভেরিয়েবল) আসে, নিচের CSS শুধু var(--sc-…) পড়ে। তাই নতুন ডিজাইন
 * যোগ করতে এই ফাইলে হাত দিতে হয় না — seatCardTemplates.js এর তালিকায়
 * একটা লাইন বসালেই চলে।
 *
 * টেমপ্লেট যা যা বদলায়: বাইরের রেখা, মাথায় রঙিন পট্টি ও লোগোর দিক,
 * শিরোনামের পট্টি, বড় ঘরগুলোর সাজ (একসাথে/আলাদা/ডান পাশে/ঘর নেই),
 * নিচের লাইনে বিন্দু বা রেখা, আর স্বাক্ষরের ঘর।
 *
 * ⭐ কার্ডটা নিজে আঁকা হয় SeatCardFace এ — এই ফাইল শুধু কাগজ, পাতা আর
 * কোন সারি কোন পাতায় সেটা সামলায়। সেটিংসের নমুনাও ওই একই কম্পোনেন্ট
 * থেকে আঁকে, তাই সেটিংসে যা দেখবেন কাগজে হুবহু তাই ছাপা হবে।
 *
 * ⚠️ কোনো টেমপ্লেটেই তথ্য হারায় না। ডেমো ডিজাইনে যে ঘরগুলো নেই সেগুলোও
 * এখানে বসে — "বড় ঘর নেই" ধাঁচে (boxes: 'none') কলাম/বেঞ্চ/আসন নিচের
 * লাইনেই নেমে আসে, মুছে যায় না।
 *
 * ⭐ "অনেক ফাঁকা" লাগার দুইটা কারণ, দুইটাই এখানে সারানো:
 *    ১. সব লেখা উপর থেকে শুরু হত, বাড়তি জায়গা নিচে জমত — এখন টেমপ্লেটে
 *       density: 'spread' দিলে উপর-মাঝ-নিচে ছড়িয়ে বসে (--sc-justify)।
 *    ২. আসন নং ছাড়া কাগজে বড় ঘর তিনটাই উঠে যায়, তাই আরো ফাঁকা পড়ত —
 *       এখন ওই কাগজে নিচের লাইনগুলো একটু ছড়িয়ে বসে (.sc-airy)।
 */

// কাগজের হিসাব (mm) — বদলাতে হলে শুধু এখানেই
const PAGE = { width: 210, height: 297, pad: 10, gap: 4 };

/**
 * লোগো SQL Server এ varbinary, তাই বাইট হয়েই আসে — { type: 'Buffer',
 * data: [...] }। সরাসরি <img src> এ বসালে কিছুই দেখা যায় না।
 * ExamReportList এর toImageSrc এর হুবহু একই।
 */
const toImageSrc = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (img?.data) {
    return `data:image/png;base64,${Buffer.from(img.data).toString("base64")}`;
  }
  return "";
};

/**
 * দুই উৎসের শিক্ষার্থী মেলানোর চাবি।
 *
 * UserCode ই সবচেয়ে ভরসার — দুই উৎসেই থাকে। কিন্তু একটায় '00135' আর
 * অন্যটায় 135 হয়ে আসতে পারে, তাই সংখ্যায় এনে মেলানো হয়।
 */
const matchKey = (row) => {
  const code = row?.User?.UserCode ?? row?.UserCode;
  if (hasValue(code)) {
    const n = Number(String(code).trim());
    return `c:${Number.isFinite(n) ? n : String(code).trim()}`;
  }

  const uid = row?.User?.UserID ?? row?.UserID;
  return hasValue(uid) ? `u:${uid}` : null;
};

const BSeatNoWhite = ({
  queryParams,
  documentLogo,
  logoIsActive,
  showSeatNo,
  studentList,
  settings,
  instituteLogo = "",
}) => {
  const cardSettings = settings || defaultSeatCardSettings();

  const withSeat =
    showSeatNo !== undefined && showSeatNo !== null
      ? Boolean(Number(showSeatNo))
      : queryParams?.ShowSeatNo !== undefined && queryParams?.ShowSeatNo !== null
      ? Boolean(Number(queryParams.ShowSeatNo))
      : true;

  const listRows = Array.isArray(studentList) ? studentList : [];

  const { data: examSeatPlanData, isFetching: seatPlanFetching } =
    useGetHallwiseSeatPlanQuery({
      sessionId: queryParams?.SessionID,
      examId: queryParams?.ExamID,
      subClassId: queryParams?.SubClassID,
    });

  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  /* ⭐ জলছাপে মাদরাসার নিজের লোগো।
   *
   * আগে শুধু documentLogo যেত — ওটা document_settings এর আলাদা একটা ছবি,
   * প্রতিষ্ঠানের লোগো নয়। বেশিরভাগ মাদরাসায় ওটা বসানোই থাকে না, তাই
   * জলছাপ কিছুই দেখাত না।
   *
   * এখন আগে প্রপে আসা instituteLogo (ExamReportList এর খোঁজার ফল), না
   * পেলে settings API এর লোগো (varbinary হয়ে আসে, তাই base64 এ বদলে
   * নেওয়া হয়), শেষে পুরোনো documentLogo। */
  const watermarkSrc =
    instituteLogo ||
    toImageSrc(institutionInfo?.Logo ?? institutionInfo?.InstitutionLogo) ||
    documentLogo;

  // hallwise API হল ধরে গ্রুপ করে পাঠায়, তাই গ্রুপগুলো এক তালিকায় মেলানো হয়
  const seatPlanRows = examSeatPlanData
    ? Object.values(examSeatPlanData).flatMap((seats) =>
        Array.isArray(seats) ? seats : []
      )
    : [];

  /* ---- দুই তালিকা জোড়া লাগানো */
  const reportByKey = new Map();
  listRows.forEach((row) => {
    const k = matchKey(row);
    if (k && !reportByKey.has(k)) reportByKey.set(k, row);
  });

  const usedKeys = new Set();

  const mergedRows = [
    ...seatPlanRows.map((planRow) => {
      const k = matchKey(planRow);
      const reportRow = k ? reportByKey.get(k) : null;
      if (k) usedKeys.add(k);

      if (!reportRow) return planRow;

      return {
        ...planRow,
        User: planRow?.User ?? reportRow?.User ?? {
          UserName: reportRow?.UserName,
          UserCode: reportRow?.UserCode,
        },
        // ⭐ কলাম ও বেঞ্চের নাম শুধু exam_report এর সারিতেই থাকে
        ColumnNo: reportRow?.ColumnNo ?? planRow?.ColumnNo ?? null,
        BenchNo: reportRow?.BenchNo ?? planRow?.BenchNo ?? null,
        HallName: reportRow?.HallName ?? planRow?.HallName ?? null,
        SeatNum: hasValue(planRow?.SeatNum) ? planRow.SeatNum : reportRow?.SeatNum ?? null,
      };
    }),

    // সিট প্ল্যানে ওঠেনি এমন শিক্ষার্থীরা — "আসন নং ছাড়া" কাগজটা তো
    // ঠিক তাদের জন্যই
    ...listRows.filter((row) => {
      const k = matchKey(row);
      return !k || !usedKeys.has(k);
    }),
  ];

  /**
   * সারিটাকে কার্ডের ঘরগুলোর চেহারায় আনা।
   *
   * প্রতিষ্ঠান, পরীক্ষা আর জামাতের নাম সারিতে থাকে না — ওগুলো ফিল্টারের
   * কোয়েরি থেকেই আসে, তাই এখানেই বসিয়ে দেওয়া হয়।
   */
  const normalize = (row, index) => ({
    __key:
      row?.AssignmentID ?? row?.ID ?? row?.UserID ?? row?.AdmissionID ?? `row-${index}`,

    InstitutionName: institutionInfo?.InstitutionName ?? "",
    Address: institutionInfo?.Address ?? "",
    ExamName: [examNameData?.ExamName, sessionData?.SessionName]
      .filter(Boolean)
      .join(" - "),

    ColumnNo: row?.ColumnNo ?? row?.Label ?? "",
    BenchNo: row?.BenchNo ?? row?.RowLabel ?? "",
    SeatNum: row?.SeatNum ?? row?.SeatNo ?? "",

    UserName: row?.User?.UserName ?? row?.UserName ?? "",
    UserCode: row?.User?.UserCode ?? row?.UserCode ?? "",
    SubClass: subClassData?.SubClass ?? row?.SubClassName ?? row?.SubClass ?? "",
    HallName: row?.HallName ?? "",
  });

  const allSeats = mergedRows.map(normalize);

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

  // শ্রেণিবিন্যাস হয়েছে কি না — আসন নং সহ ছাপতে চাইলে এটাই শর্ত
  const anyAllocation = allSeats.some(
    (s) => hasValue(s.SeatNum) || hasValue(s.ColumnNo) || hasValue(s.BenchNo)
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
            নিন — তখন বড় ঘরগুলো কার্ডে থাকবেই না।
          </p>
        </div>
      </div>
    );
  }

  const perPage = cardsPerPageCount(cardSettings.cardsPerPage);
  const rowsPerPage = perPage / 2;

  const pages = [];
  for (let i = 0; i < allSeats.length; i += perPage) {
    pages.push(allSeats.slice(i, i + perPage));
  }

  return (
    <div className="seat-wrap bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page { size: A4 portrait; margin: 0; }

        /* ---- পাতা: পর্দা ও কাগজ, দুই জায়গাতেই একই মাপ ---- */
        .seat-page {
          box-sizing: border-box;
          width: ${PAGE.width}mm;
          height: ${PAGE.height}mm;
          padding: ${PAGE.pad}mm;
          background: #ffffff;
          display: grid;
          /* minmax(0, 1fr) — শুধু 1fr দিলে ভিতরের লেখা বড় হলে ঘরটাও বড়
             হয়ে যায়, তখন নিচের কার্ড পাতার কিনারায় নেমে কেটে যেত */
          grid-template-columns: repeat(2, minmax(0, 1fr));
          grid-template-rows: repeat(${rowsPerPage}, minmax(0, 1fr));
          gap: ${PAGE.gap}mm;
          overflow: hidden;
        }

        /* কার্ডের নিজের CSS — SeatCardFace থেকে, একবারই বসে */
        ${seatCardFaceCss}

        @media screen {
          .seat-page { margin: 6mm auto; box-shadow: 0 1mm 4mm rgba(0,0,0,0.18); }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .seat-wrap { background: transparent !important; }
          .seat-page {
            margin: 0 !important; box-shadow: none !important;
            break-after: page; page-break-after: always;
          }
          /* শেষ পাতার পর বাড়তি খালি পাতা যেন না আসে */
          .seat-page:last-child { break-after: auto; page-break-after: auto; }
          .seat-card, .seat-card * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageSeats, pageIndex) => (
        <div key={pageIndex} className="seat-page">
          {pageSeats.map((row, cardIndex) => (
            <SeatCardFace
              key={`${row.__key}-${pageIndex}-${cardIndex}`}
              row={row}
              settings={cardSettings}
              logo={watermarkSrc}
              withSeat={withSeat}
            />
          ))}

          {/* শেষ পাতা অর্ধেক ভরা থাকলে বাকি ঘরগুলো খালি — তাতে ভরা
              কার্ডগুলো নিজের জায়গাতেই থাকে, টেনে বড় হয়ে যায় না */}
          {Array.from({ length: perPage - pageSeats.length }).map((_, i) => (
            <div key={`blank-${i}`} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default BSeatNoWhite;
