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
 * জিনিসই বসে। আগের কোডে যা সমস্যা ছিল আর এখন যেভাবে ঠিক:
 *
 *   ১) আগে পাতার উচ্চতা দুই জায়গায় দুই রকম ছিল — ক্লাসে ২৯০mm, আর
 *      ছাপার CSS এ ২৮০mm। এখন একটাই: পুরো A4, ২৯৭mm। মার্জিনটা পাতার
 *      নিজের padding (১০mm), তাই Margins ড্রপডাউন যা-ই থাকুক এক।
 *      "Margins: None বাছতে হবে" — সেই শর্তটা আর নেই।
 *   ২) আগে কার্ডের উচ্চতা ছিল ভাসমান আর ভিতরের লেখা px এ। লেখা কার্ডের
 *      চেয়ে বড় হয়ে গেলে নিচের "ক্লাস নং" সারিটা কেটে যেত। এখন কার্ডের
 *      উচ্চতা স্থির (CARD_H) আর লেখা pt এ — px পর্দার DPI অনুযায়ী
 *      বদলায়, pt বদলায় না।
 *   ৩) নাম বা প্রতিষ্ঠানের নাম অনেক লম্বা হলে আগে কার্ড ফুলে উঠত। এখন
 *      কার্ডে overflow: hidden, আর লেখাগুলোর line-height বাঁধা — তাই
 *      কার্ড কখনো নিজের ঘর ছাড়িয়ে যায় না, গ্রিডও নড়ে না।
 *
 * গ্রিডের হিসাব:
 *   কার্ডের চওড়া = (২১০ − ১০×২ − ফাঁক ৪) ÷ ২        = ৯৩mm
 *   কার্ডের উচ্চতা = (২৯৭ − ১০×২ − ফাঁক ৪×৩) ÷ ৪    = ৬৬.২৫mm
 */

const CARDS_PER_PAGE = 8;

// কাগজের হিসাব (mm) — বদলাতে হলে শুধু এখানেই
const PAGE = { width: 210, height: 297, pad: 10, gap: 4 };

const BSeatNoWhite = ({ queryParams, documentLogo, logoIsActive }) => {
  const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
    sessionId: queryParams?.SessionID,
    examId: queryParams?.ExamID,
    subClassId: queryParams?.SubClassID,
  });

  const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
  const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
  const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const allSeats = examSeatPlanData ? Object.values(examSeatPlanData).flat() : [];

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
        .seat-card .sc-id     { font-size: 12pt; line-height: 1.1; margin-top: 1.5mm;
                                border: 0.3mm solid #000000; border-radius: 1.5mm;
                                padding: 1mm 2mm; width: 100%; }
        .seat-card .sc-seat   { display: flex; width: 100%; margin-top: 1.2mm;
                                border: 0.3mm solid #000000; border-radius: 1.5mm;
                                font-size: 9pt; line-height: 1.1; }
        .seat-card .sc-seat > span { width: 50%; padding: 1mm 1mm; }
        .seat-card .sc-seat > span + span { border-left: 0.3mm solid #000000; }

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
            <div key={assignment.AssignmentID} className="seat-card">
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
              <div className="sc-seat">
                <span>ক্লাস নং</span>
                <span>{assignment.SeatNum}</span>
              </div>
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































// import { useEffect } from "react";
// import { useGetHallwiseSeatPlanQuery } from "../../../../../features/exam/examSitPlanQuerySlice";
// import { useGetSessionQuery } from "../../../../../features/session/sessionSlice";
// import { useGetExamNameQuery } from "../../../../../features/exam/examQuerySlice";
// import { useGetSingleSubClassQuery } from "../../../../../features/class/classQuerySlice";
// import { useGetInstitutionInfoQuery } from "../../../../../features/settings/settingsQuerySlice";
// import SeatCardWatermark from "../../../../../pages/userpanel/SeatCard/SeatCardWatermark";

// const CARDS_PER_PAGE = 8;

// const BSeatNoWhite = ({ queryParams, documentLogo, logoIsActive }) => {
//   const { data: examSeatPlanData } = useGetHallwiseSeatPlanQuery({
//     sessionId: queryParams?.SessionID,
//     examId: queryParams?.ExamID,
//     subClassId: queryParams?.SubClassID,
//   });

//   const { data: sessionData } = useGetSessionQuery(queryParams?.SessionID);
//   const { data: examNameData } = useGetExamNameQuery(queryParams?.ExamID);
//   const { data: subClassData } = useGetSingleSubClassQuery(queryParams?.SubClassID);
//   const { data: institutionInfo } = useGetInstitutionInfoQuery();

//   useEffect(() => {
//     console.log(examSeatPlanData);
//   }, [examSeatPlanData]);

//   const allSeats = examSeatPlanData
//     ? Object.values(examSeatPlanData).flat()
//     : [];

//   const pages = [];
//   for (let i = 0; i < allSeats.length; i += CARDS_PER_PAGE) {
//     pages.push(allSeats.slice(i, i + CARDS_PER_PAGE));
//   }

//   return (
//     <div className="bg-gray-100 print:bg-transparent w-full">
//       <style>{`
//         @page {
//           size: A4 portrait;
//           margin: 0;
//         }
//         @media print {
//           /* গুরুত্বপূর্ণ: প্রিন্টের সময় "Margins: None" সিলেক্ট থাকতে হবে,
//              নাহলে Chrome এর নিজস্ব ~10mm মার্জিন শেষে একটা ফাঁকা পেজ তৈরি করে।
//              height 290mm রাখা হয়েছে যাতে padding 5mm বাদ দিয়ে content area
//              আগের কাজ-করা 280mm এর সমান থাকে */
//           .seat-page {
//             width: 210mm !important;
//             height: 280mm !important;
//             padding: 5mm !important;
//             margin: 0 !important;
//             box-sizing: border-box !important;
//             overflow: hidden !important;
//             page-break-after: always !important;
//             break-after: page !important;
//           }
//           .seat-page.is-last-page {
//             page-break-after: avoid !important;
//             break-after: avoid !important;
//           }
//           .seat-card {
//             border: 2px solid #000 !important;
//             page-break-inside: avoid !important;
//             break-inside: avoid !important;
//             -webkit-print-color-adjust: exact !important;
//             print-color-adjust: exact !important;
//           }
//         }
//       `}</style>

//       {pages.map((pageSeats, pageIndex) => {
//         const isLastPage = pageIndex === pages.length - 1;
//         return (
//           <div
//             key={pageIndex}
//             className={`seat-page ${isLastPage ? 'is-last-page' : ''} grid grid-cols-2 grid-rows-4 gap-2 w-[210mm] h-[290mm] mx-auto p-2 bg-white`}
//           >
//             {pageSeats.map((assignment) => (
//               <div
//                 key={assignment.AssignmentID}
//                 className="seat-card relative border-2 border-black p-3 text-center flex flex-col justify-center bg-white"
//               >
//                 <SeatCardWatermark documentLogo={documentLogo} logoIsActive={logoIsActive} />

//                 <h1 className="text-[28px] font-bold leading-tight">
//                   {institutionInfo?.InstitutionName}
//                 </h1>
//                 <p className="text-[18px]">{institutionInfo?.Address}</p>
//                 <p className="text-[18px]">
//                   {examNameData?.ExamName} - {sessionData?.SessionName}
//                 </p>
//                 <h2 className="text-[26px] mb-1">{subClassData?.SubClass}</h2>
//                 <h2 className="text-[22px] mb-1">
//                   পরীক্ষার্থী : {assignment.User?.UserName}
//                 </h2>
//                 <h1 className="text-[26px] border border-black rounded-[8px] mb-2 px-2 py-1 leading-none">
//                   আইডি নং : {assignment.User?.UserCode}
//                 </h1>
//                 <div className="flex items-center border border-black rounded-[6px] px-2 py-1 leading-none">
//                   <h2 className="w-1/2 text-[16px] text-center">ক্লাস নং</h2>
//                   <h2 className="w-1/2 text-[16px] text-center border-l border-black">
//                     {assignment.SeatNum}
//                   </h2>
//                 </div>
//               </div>
//             ))}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default BSeatNoWhite;
