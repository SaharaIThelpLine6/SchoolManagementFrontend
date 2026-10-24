import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Buffer } from 'buffer';

// =============================================================================
// সকল পরীক্ষার্থীর পরিসংখ্যান
//
// এক পাতায় পুরো মাদরাসার হিসাব — কোন শ্রেণিতে এই পরীক্ষায় কতজন বসছে।
// সব কিছু রুট থেকে আসে (report_id = 9); কোথাও কোনো নাম বা সংখ্যা
// হার্ডকোড করা নেই।
//
// ⭐ ছাপার পাতা ভাগ করা হয় নিজেরাই।
//
// ব্রাউজারের ভরসায় রাখলে প্রথম পাতার পর মাথাটা আর বসে না — ক্রোম
// পুনরাবৃত্ত thead পাতার ২৫% এর বেশি লম্বা হলে ওটা আর প্রতি পাতায় বসায়
// না। আমাদের মাথা (লোগো + নাম + ঠিকানা + শিক্ষাবর্ষের রেখা) তার চেয়ে
// অনেক বড়, তাই দ্বিতীয় পাতা শুধু ঘরের নাম নিয়ে শুরু হত।
//
// তাই সারিগুলো আগে কাগজের আসল চওড়ায় মেপে নিয়ে পাতায় পাতায় ভাগ করা হয়,
// আর প্রতি পাতা নিজের পূর্ণ মাথা নিয়ে আলাদা টেবিল হয়ে বসে।
// =============================================================================

/** লোগো SQL Server এ varbinary, তাই বাইট হয়েই আসে */
const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    return `data:image/png;base64,${Buffer.from(img.data).toString('base64')}`;
  }
  return '';
};

/* ইংরেজি অঙ্ক → বাংলা।

   শুধু আমাদের নিজের বানানো সংখ্যায় বসে — ক্রমিক নং, শ্রেণির পরীক্ষার্থী
   সংখ্যা, সর্বমোট আর পৃষ্ঠা নম্বর। ডেটাবেস থেকে আসা লেখায় (শিক্ষাবর্ষ,
   পরীক্ষার নাম, মোবাইল) হাত দেওয়া হয় না — ওখানে যা আছে কাগজেও তাই। */
const BN = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBn = (value) =>
  value === null || value === undefined
    ? ''
    : String(value).replace(/\d/g, (d) => BN[Number(d)]);

/* ───────────────────────────────────────────────────────────────────────────
   কাগজের মাপ — A4 খাড়া, ১০mm মার্জিন বাদে
   ─────────────────────────────────────────────────────────────────────────── */
const PRINT_W = 718;    // ২১০mm − ২০mm, ৯৬dpi তে
const PRINT_H = 1046;   // ২৯৭mm − ২০mm
const SAFETY = 12;      // গোল করার ভুল শুষে নেওয়ার ছাড়

/** উচ্চতার তালিকা নিয়ে পাতায় ভাগ করে — প্রতি পাতার আইটেম-নম্বর */
const packPages = (heights, avail) => {
  const pages = [];
  let cur = [];
  let used = 0;

  heights.forEach((h, i) => {
    if (cur.length && used + h > avail) {
      pages.push(cur);
      cur = [];
      used = 0;
    }
    cur.push(i);
    used += h;
  });

  if (cur.length) pages.push(cur);
  return pages;
};

const StatisticsOfAllStudents = ({
  reportData,
  queryParams,
  // রুট লোগো না পাঠালে পেজ থেকে পাঠানো লোগোটাই বসে
  instituteLogo,
  language = 1,
}) => {
  const isArabic = Number(language) === 2;

  const header = reportData?.header || {};
  const rows = useMemo(
    () => (Array.isArray(reportData?.data) ? reportData.data : []),
    [reportData]
  );

  // রুটের header এ InstitutionLogo আসে; না পেলে প্রপেরটা
  const logo = toImageSrc(header.InstitutionLogo) || instituteLogo || '';

  const institution =
    (isArabic ? header.AraInstitutionName || header.InstitutionName : header.InstitutionName) ||
    queryParams?.InstitutionName ||
    '';
  const address =
    (isArabic ? header.AraAddress || header.Address : header.Address) ||
    queryParams?.Address ||
    '';

  const sessionName = isArabic
    ? header.SessionAraName || header.SessionName
    : header.SessionName;
  const examName = isArabic ? header.ExamAraName || header.ExamName : header.ExamName;

  const className = (row) =>
    (isArabic ? row.SubClassAra || row.SubClass : row.SubClass) || '';

  const grandTotal =
    reportData?.grandTotal ??
    rows.reduce((sum, r) => sum + (Number(r.Total) || 0), 0);

  /* সর্বমোটের সারিটাও পাতায় জায়গা নেয়, তাই সেও একটা আইটেম — শেষ পাতায়
     জায়গা না থাকলে নিজেই পরের পাতায় চলে যায়, অর্ধেক কাটা পড়ে না */
  const itemCount = rows.length + 1;
  const allItems = useMemo(
    () => Array.from({ length: itemCount }, (_, i) => i),
    [itemCount]
  );

  const measureRef = useRef(null);
  const [plan, setPlan] = useState(null);
  const pages = plan && plan.length ? plan : [allItems];

  /* ─── কাগজের মাপে পাতা ভাগ ─────────────────────────────────────────
     আড়ালের টেবিলটা থেকে মাথা, ঘরের নামের সারি, পাদটীকা আর প্রতিটা
     সারির আসল উচ্চতা নিয়ে হিসাব। */
  const measureStamp = [
    itemCount,
    institution,
    address,
    sessionName,
    examName,
    Boolean(logo),
    language,
  ].join('|');

  useLayoutEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;

      const colHead = box.querySelector('thead');
      const trs = Array.from(box.querySelectorAll('tbody tr'));
      if (!colHead || !trs.length) return;

      const outside = ['head', 'foot'].reduce((sum, name) => {
        const el = box.querySelector(`[data-m="${name}"]`);
        return sum + (el ? el.offsetHeight : 0);
      }, 0);

      const avail = PRINT_H - outside - colHead.offsetHeight - SAFETY;
      if (avail <= 0) return;

      const next = packPages(trs.map((tr) => tr.offsetHeight || 1), avail);

      setPlan((prev) =>
        prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next
      );
    };

    measure();

    // ফন্ট বা লোগোর ছবি দেরিতে এলে মাপ বদলায় — এসে গেলে আরেকবার
    let alive = true;
    const again = () => { if (alive) measure(); };

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(again).catch(() => {});
    }
    const imgs = measureRef.current
      ? Array.from(measureRef.current.querySelectorAll('img'))
      : [];
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', again, { once: true });
    });

    return () => {
      alive = false;
      imgs.forEach((img) => img.removeEventListener('load', again));
    };
    // rows বদলালেও আবার মাপা দরকার — লম্বা নাম সারি লম্বা করে দেয়
  }, [measureStamp, rows]);

  /* ─── পাতার টুকরোগুলো ──────────────────────────────────────────────
     মাথা ও পাদটীকা দুই জায়গায় লাগে — একবার মাপার টেবিলে, একবার আসল
     পাতায় — তাই আলাদা করে রাখা। */

  const renderHead = (pageIndex, pageCount) => (
    <div className="pb-4">
      <div className="flex items-center gap-4">
        {logo ? (
          <img src={logo} alt="" className="h-16 w-16 shrink-0 object-contain" />
        ) : null}

        <div className="flex-1 min-w-0 text-center">
          <h1 className="text-2xl font-bold leading-tight">{institution}</h1>
          {address ? <p className="text-base mt-0.5 text-gray-700">{address}</p> : null}
          {header.ContactNumber ? (
            <p className="text-xs mt-0.5 text-gray-600">
              মোবাইল: {header.ContactNumber}
            </p>
          ) : null}
        </div>

        {/* লোগোর সমান ফাঁকা ঘর — নামটা যেন মাঝখানেই থাকে */}
        {logo ? <span className="h-16 w-16 shrink-0" aria-hidden="true" /> : null}
      </div>

      {/* মাঝ বরাবর রেখা, তার উপরে শিক্ষাবর্ষ ও পরীক্ষার নাম */}
      <div className="relative my-3">
        <div className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-black" />
        <div className="relative mx-auto w-fit">
          <span className="text-base font-semibold bg-white px-5">
            {sessionName ? `শিক্ষাবর্ষ : ${sessionName}` : ''}
            {sessionName && examName ? ', ' : ''}
            {examName || ''}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm font-semibold text-gray-800">
        <span>সকল পরীক্ষার্থীর পরিসংখ্যান</span>
        {pageCount > 1 ? (
          <span className="font-normal text-gray-600">
            পৃষ্ঠা: {toBn(pageIndex + 1)} / {toBn(pageCount)}
          </span>
        ) : null}
      </div>
    </div>
  );

  const renderFoot = () => (
    <p className="pt-2 text-center text-xs text-gray-600">
      মোট শ্রেণি: {toBn(rows.length)} টি &nbsp;•&nbsp; মোট পরীক্ষার্থী: {toBn(grandTotal)} জন
    </p>
  );

  const renderTable = (items) => (
    <div className="border-[1.5px] border-black">
      {/* ⭐ লেখার আকার ১৪px — টেবিলের সব ঘর এটাই পায় */}
      <table className="w-full border-collapse text-[14px]" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '16%' }} />
          <col style={{ width: '56%' }} />
          <col style={{ width: '28%' }} />
        </colgroup>

        <thead>
          {/* হালকা পট্টি, গাঢ় লেখা — ছাপায় ব্যাকগ্রাউন্ড বাদ পড়লেও
              ঘরের নামগুলো পড়া যায় */}
          <tr className="bg-gray-200">
            <th className="border border-gray-500 px-3 py-1.5 text-center font-bold">
              ক্রমিক নং
            </th>
            <th className="border border-gray-500 px-3 py-1.5 text-center font-bold">
              শ্রেণি/জামাত
            </th>
            <th className="border border-gray-500 px-3 py-1.5 text-center font-bold">
              মোট পরীক্ষার্থী
            </th>
          </tr>
        </thead>

        <tbody>
          {items
            .filter((idx) => idx < rows.length)
            .map((idx) => {
              const row = rows[idx];
              return (
                <tr
                  key={row.SubClassID ?? idx}
                  className={idx % 2 ? 'bg-gray-50/60' : 'bg-white'}
                >
                  <td className="border border-gray-300 px-3 py-1.5 text-center font-medium">
                    {/* ক্রমিক পুরো তালিকা জুড়ে চলে, প্রতি পাতায় ১ থেকে নয় */}
                    {toBn(idx + 1)}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center break-words">
                    {className(row)}
                  </td>
                  <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">
                    {toBn(row.Total)}
                  </td>
                </tr>
              );
            })}

          {/* সর্বমোট — যে পাতায় জায়গা হয়েছে সেখানে, যোগফল পুরো তালিকার */}
          {items.includes(rows.length) && (
            <tr className="bg-gray-200 font-bold">
              <td className="border border-gray-400 px-3 py-1.5 text-center" colSpan={2}>
                মোট
              </td>
              <td className="border border-gray-400 px-3 py-1.5 text-center text-red-600">
                {toBn(grandTotal)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (!rows.length) {
    return (
      <div className="py-16 text-center print:hidden">
        <p className="text-slate-500 text-sm">
          এই শিক্ষাবর্ষ ও পরীক্ষায় কোনো পরীক্ষার্থী পাওয়া যায়নি
        </p>
        <p className="text-slate-400 text-xs mt-1">উপরের ফিল্টার বদলে দেখুন</p>
      </div>
    );
  }

  return (
    <div className="stat-root py-8 print:py-0 w-full">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }

          /* মাপার টেবিলটা কাগজে দরকার নেই */
          .stat-measure { display: none !important; }

          /* ⭐ এক পাতা = একটা সম্পূর্ণ ব্লক।
             প্রতিটার শেষে জোর করে পাতা ভাঙি, শেষটা বাদে। এতে প্রতি পাতা
             নিজের মাথা ও ঘরের নাম নিয়েই ছাপা হয়। */
          .stat-page {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 2px !important;
            width: 100% !important;
            max-width: 100% !important;

            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .stat-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          /* ঘরের রঙগুলো কাগজেও যাক — নইলে "মোট" সারিটা সাদা হয়ে
             বাকি সারির সাথে মিশে যায় */
          .stat-page th,
          .stat-page td {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .stat-page tr { page-break-inside: avoid; break-inside: avoid; }
        }
      `}</style>

      {/* ── পাতাগুলো — প্রতিটা নিজের মাথা নিয়ে ───────────────── */}
      {pages.map((items, pageIndex) => (
        <div
          key={pageIndex}
          className={`stat-page max-w-[900px] mx-auto bg-white px-8 py-6 text-black font-SolaimanLipi shadow-lg print:shadow-none ${
            pageIndex === 0 ? '' : 'mt-6 print:mt-0'
          }`}
        >
          {renderHead(pageIndex, pages.length)}
          {renderTable(items)}
          {renderFoot()}
        </div>
      ))}

      {/* ── মাপার টেবিল ──────────────────────────────────────────
           পর্দায়ও নেই, কাগজেও নেই — শুধু মাপার জন্য। কাগজের আসল চওড়ায়
           বসানো, তাই লেখা যেভাবে ভেঙে ছাপা হবে ঠিক সেভাবেই এখানে ভাঙে।

           মাথায় "পৃষ্ঠা ১/২" লাইনটা থাকে বলে pageCount এখানে ২ — একের
           বেশি পাতা হলে মাথা যতটুকু লম্বা হয়, সেটাও ধরা থাকে। */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="stat-measure font-SolaimanLipi"
        style={{
          position: 'fixed',
          left: '-10000px',
          top: 0,
          width: `${PRINT_W}px`,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        <div style={{ padding: '0 2px' }}>
          <div data-m="head">{renderHead(0, 2)}</div>
          {renderTable(allItems)}
          <div data-m="foot">{renderFoot()}</div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsOfAllStudents;
