import React from 'react';

/**
 * নম্বর পত্র — ভর্তি সিরিয়াল অনুযায়ী (A5 Portrait, ১৪৮mm × ২১০mm)
 *
 * প্রতি পৃষ্ঠায় ২ কলাম × ২৬ সারি = ৫২ জন। বেশি হলে নিজে থেকেই পরের পাতা।
 *
 * ⭐ কাগজের মাথা এখন পুরোটাই গতিশীল
 *
 *    আগে এখানে ডেমো লেখাগুলো ফলব্যাক হিসেবে বসানো ছিল — প্রতিষ্ঠানের নাম,
 *    ঠিকানা, মোবাইল, "২য় সাময়িক পরীক্ষা — ১৪৪৭-৪৮হি:", "১ম মডেল টেস্ট /
 *    দাওরা(তাকমীল)" সবই। আসল মান না পেলে ওগুলোই ছাপা হত, তাই দেখে মনে হত
 *    পাতা ভরা আছে অথচ কোনো তথ্যই আসল ছিল না।
 *
 *    এখন সব মান header প্রপ থেকে আসে (রুটের loadReportHeader + শিক্ষাবর্ষ,
 *    পরীক্ষা, শ্রেণি), না পেলে প্রথম সারি থেকে। কোনোটাই না পেলে ঘরটা
 *    ফাঁকা যায় — ভুল নাম ছাপার চেয়ে ফাঁকা ঘর ঢের ভালো।
 */

const ROWS_PER_COLUMN = 26;
const PER_PAGE = ROWS_PER_COLUMN * 2;

const INK = '#1b2420';
const GREEN = '#1f4d3a';
const RULE = '#9aa8a0';
const ZEBRA = '#f1f5f2';

/**
 * শুধু নিজেরা বানানো সংখ্যার জন্য — ক্রমিক নং, মোট, পৃষ্ঠা নং।
 *
 * ডেটাবেসের কোনো মানে এটা বসে না। আইডি নং, ভর্তি নং, মোবাইল, হিজরি সন —
 * এগুলো যে ভাষায় সেভ করা হয়েছে কাগজেও ঠিক সেভাবেই যাবে, বদলানো হবে না।
 */
const toBn = (v) =>
  v === null || v === undefined || v === ''
    ? ''
    : String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const FONT =
  "'Noto Serif Bengali','Hind Siliguri','SolaimanLipi','Kalpurush','Nikosh',system-ui,sans-serif";

/**
 * কাগজের ঘরগুলো — নাম দেখাবে কি না তার উপর নির্ভর করে।
 *
 * নাম বাদ দিলে ওই জায়গাটুকু বাকি ঘরগুলোয় ভাগ হয়ে যায়, বিশেষ করে নম্বরের
 * ঘরে — হাতে নম্বর লিখতে চওড়া ঘরই সুবিধার।
 */
const columnsFor = (showName) =>
  showName
    ? [
        { key: 'sl', w: '8%', label: 'ক্রম', align: 'center' },
        { key: 'serial', w: '12%', label: 'রোল নং', align: 'center' },
        { key: 'code', w: '19%', label: 'আইডি নং', align: 'center' },
        { key: 'name', w: 'auto', label: 'পরীক্ষার্থীর নাম', align: 'center' },
        { key: 'mark', w: '14%', label: 'নম্বর', align: 'center' },
      ]
    : [
        { key: 'sl', w: '12%', label: 'ক্রম', align: 'center' },
        { key: 'serial', w: '24%', label: 'রোল নং', align: 'center' },
        { key: 'code', w: '30%', label: 'আইডি নং', align: 'center' },
        { key: 'mark', w: 'auto', label: 'নম্বর', align: 'center' },
      ];

const cell = (align, muted = false, idx = 0) => ({
  background: idx % 2 ? ZEBRA : '#fff',
  WebkitPrintColorAdjust: 'exact',
  printColorAdjust: 'exact',
  border: `0.2mm solid ${RULE}`,
  height: '4.55mm',
  padding: '0 0.6mm',
  textAlign: align,
  fontWeight: muted ? 500 : 400,
  color: muted ? '#4a5750' : INK,
  lineHeight: 1,
});

const Column = ({ rows, startSerial, cols }) => (
  <table
    style={{
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
      fontSize: '6.8pt',
      color: INK,
    }}
  >
    <colgroup>
      {cols.map((c) => (
        <col key={c.key} style={{ width: c.w }} />
      ))}
    </colgroup>
    <thead>
      <tr>
        {cols.map((c) => (
          <th
            key={c.key}
            style={{
              border: `0.25mm solid ${GREEN}`,
              background: GREEN,
              color: '#fff',
              boxShadow: `inset 0 0 0 10mm ${GREEN}`,
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              height: '5.2mm',
              padding: '0 0.6mm',
              fontSize: '6.2pt',
              fontWeight: 700,
              textAlign: c.align,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {c.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((s, idx) => (
        <tr key={idx}>
          {cols.map((c) => {
            if (c.key === 'sl') {
              return (
                <td key={c.key} style={cell('center', true, idx)}>
                  {s ? toBn(startSerial + idx) : ''}
                </td>
              );
            }
            if (c.key === 'serial') {
              return (
                <td key={c.key} style={cell('center', false, idx)}>
                  {s?.AdmissionSerial ?? ''}
                </td>
              );
            }
            if (c.key === 'code') {
              return (
                <td key={c.key} style={cell('center', false, idx)}>
                  {s?.UserCode ?? ''}
                </td>
              );
            }
            if (c.key === 'name') {
              return (
                <td
                  key={c.key}
                  style={{
                    ...cell('left', false, idx),
                    paddingLeft: '1.2mm',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {s?.UserName?.trim() ?? ''}
                </td>
              );
            }
            // নম্বরের ঘর — হাতে লেখার জন্য ফাঁকা
            return <td key={c.key} style={cell('center', false, idx)} />;
          })}
        </tr>
      ))}
    </tbody>
  </table>
);

const Sign = ({ label }) => (
  <div style={{ textAlign: 'center', width: '40mm' }}>
    <div style={{ borderTop: `0.35mm solid ${INK}`, paddingTop: '0.8mm', fontSize: '7pt', fontWeight: 700 }}>
      {label}
    </div>
  </div>
);

const Page = ({ chunk, pageIndex, pageCount, total, info, cols }) => {
  const pad = (arr) => {
    const a = [...arr];
    while (a.length < ROWS_PER_COLUMN) a.push(null);
    return a;
  };
  const left = pad(chunk.slice(0, ROWS_PER_COLUMN));
  const right = pad(chunk.slice(ROWS_PER_COLUMN, PER_PAGE));
  const offset = pageIndex * PER_PAGE;

  return (
    <section
      className="a5-page"
      style={{
        width: '148mm',
        height: '210mm',
        boxSizing: 'border-box',
        padding: '7mm 7mm 6mm',
        background: '#fff',
        color: INK,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── প্রতিষ্ঠানের মাথা ─────────────────────────── */}
      <header style={{ textAlign: 'center', paddingBottom: '2mm', borderBottom: `0.9mm double ${GREEN}` }}>
        {info.institutionName && (
          <h1 style={{ margin: 0, fontSize: '15pt', fontWeight: 800, color: GREEN, lineHeight: 1.2 }}>
            {info.institutionName}
          </h1>
        )}
        {info.address && (
          <div style={{ fontSize: '8pt', fontWeight: 600, marginTop: '0.8mm' }}>{info.address}</div>
        )}
        {info.contact && (
          <div style={{ fontSize: '6.8pt', color: '#55635b', marginTop: '0.5mm' }}>
            মোবাইল: {info.contact}
          </div>
        )}
      </header>

      {/* ── পরীক্ষার নাম ও শিক্ষাবর্ষ ─────────────────── */}
      {(info.examName || info.sessionName || info.sessionAraName) && (
        <div style={{ textAlign: 'center', margin: '3mm 0 2.5mm' }}>
          <span
            style={{
              display: 'inline-block',
              background: GREEN,
              color: '#fff',
              fontSize: '9pt',
              fontWeight: 700,
              padding: '1mm 6mm',
              borderRadius: '1mm',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {info.examName}
            {info.examName && (info.sessionAraName || info.sessionName) ? ' — ' : ''}
            {info.sessionAraName}
            {info.sessionAraName && info.sessionName ? ' / ' : ''}
            {info.sessionName}
          </span>
        </div>
      )}

      {/* ── শ্রেণি/জামাত | কিতাব | মোট ─────────────────── */}
      <div
        style={{
          display: 'flex',
          border: `0.3mm solid ${GREEN}`,
          borderRadius: '1mm',
          fontSize: '7.6pt',
          fontWeight: 700,
          marginBottom: '2mm',
          overflow: 'hidden',
        }}
      >
        {/* শুধু শ্রেণি — আগে এই ঘরে "পরীক্ষার নাম / শ্রেণি" দুইটা জোড়া
            লাগানো থাকত, অথচ লেবেল ছিল শুধু "শ্রেণি/জামাত"। পরীক্ষার নামটা
            উপরের পট্টিতেই আছে, তাই এখানে আর দরকার নেই। */}
        <div style={{ flex: 1.3, padding: '1.3mm 2mm', borderRight: `0.3mm solid ${GREEN}`, background: ZEBRA, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <span style={{ color: '#55635b', fontWeight: 600 }}>শ্রেণি/জামাত: </span>
          {info.subClassName}
        </div>
        <div style={{ flex: 1.3, padding: '1.3mm 2mm', borderRight: `0.3mm solid ${GREEN}`, background: ZEBRA, WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <span style={{ color: '#55635b', fontWeight: 600 }}>কিতাব: </span>
          {info.kitabName}
        </div>
        <div style={{ flex: 0.6, padding: '1.3mm 2mm', background: ZEBRA, textAlign: 'center', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <span style={{ color: '#55635b', fontWeight: 600 }}>মোট: </span>
          {toBn(total)}
        </div>
      </div>

      {/* ── পরীক্ষক ও তারিখ ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.2pt', fontWeight: 600, marginBottom: '1.6mm' }}>
        <span>
          পরীক্ষকের নাম:{' '}
          <span style={{ display: 'inline-block', width: '34mm', borderBottom: `0.25mm dotted ${INK}` }} />
        </span>
        <span>
          তারিখ:{' '}
          <span style={{ display: 'inline-block', width: '24mm', borderBottom: `0.25mm dotted ${INK}`, textAlign: 'center' }}>
            {info.printDate}
          </span>
        </span>
      </div>

      {/* ── দুই কলাম ──────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '2.5mm' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Column rows={left} startSerial={offset + 1} cols={cols} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Column rows={right} startSerial={offset + ROWS_PER_COLUMN + 1} cols={cols} />
        </div>
      </div>

      <footer style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Sign label="প্রধান পরীক্ষকের স্বাক্ষর" />
        <Sign label={info.principalName || 'হল পরিদর্শকের স্বাক্ষর'} />
      </footer>

      {pageCount > 1 && (
        <div style={{ position: 'absolute', bottom: '2mm', left: 0, right: 0, textAlign: 'center', fontSize: '6pt', color: '#7a877f' }}>
          পৃষ্ঠা {toBn(pageIndex + 1)} / {toBn(pageCount)}
        </div>
      )}
    </section>
  );
};

const ExamReportFive = ({
  data,
  header,
  subClassName = '',
  kitabName = '',
  // ⭐ পরীক্ষার্থীর নামের ঘরটা থাকবে কি না। না দিলে আগের মতোই নামসহ।
  showName = true,
}) => {
  const students = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const first = students[0] || {};

  /* কাগজের মাথার সব মান — header প্রপ আগে, না পেলে প্রথম সারি।
     কোনোটাই না থাকলে ফাঁকা, ডেমো লেখা নয়। */
  const info = React.useMemo(() => {
    const contactRaw = header?.ContactNumber || first.ContactNumber || '';

    return {
      institutionName: header?.InstitutionName || first.InstitutionName || '',
      address: header?.Address || first.Address || '',
      // ফোন নম্বর একাধিক হলে '#' দিয়ে আলাদা করা থাকে — প্রথমটাই যথেষ্ট
      contact: String(contactRaw).split('#')[0].trim(),
      examName: header?.ExamName || first.ExamName || '',
      sessionName: header?.SessionName || first.SessionName || '',
      /* হিজরি সন — পট্টিতে "১৪৪৭-৪৮হি:" অংশটা এখান থেকে আসে।
         আগে ওটা হার্ডকোড লেখার ভেতরে ছিল, তাই শিক্ষাবর্ষ বদলালেও
         একই সন ছাপা হত। শিক্ষাবর্ষের আরবি নামটা না থাকলে অংশটা
         বসেই না — ভুল সন ছাপার চেয়ে না ছাপা ভালো। */
      sessionAraName: header?.SessionAraName || first.SessionAraName || '',
      subClassName: subClassName || header?.SubClass || first.SubClassName || first.SubClass || '',
      kitabName,
      principalName: header?.PrincipalName || first.PrincipalName || '',
      printDate: new Date().toLocaleDateString('bn-BD').replace(/\//g, '-'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header, first, subClassName, kitabName]);

  const cols = React.useMemo(() => columnsFor(showName), [showName]);

  const pages = React.useMemo(() => {
    if (!students.length) return [];
    const out = [];
    for (let i = 0; i < students.length; i += PER_PAGE) out.push(students.slice(i, i + PER_PAGE));
    return out;
  }, [students]);

  if (!students.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
        <p className="text-slate-500 font-medium">এই শর্তে কোনো পরীক্ষার্থী পাওয়া যায়নি</p>
        <p className="text-slate-400 text-sm mt-1">শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন</p>
      </div>
    );
  }

  return (
    <div className="exam-report-root">
      <style>{`
        @page { size: A5 portrait; margin: 0; }
        .exam-report-root, .exam-report-root * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        .exam-report-root .a5-page { margin: 0 auto 8mm; box-shadow: 0 1px 8px rgba(0,0,0,.25); }
        @media print {
          .exam-report-root .no-print { display: none !important; }
          .exam-report-root .a5-page {
            margin: 0; box-shadow: none;
            break-after: page; page-break-after: always;
          }
          .exam-report-root .a5-page:last-child { break-after: auto; page-break-after: auto; }
        }
      `}</style>

      <div className="no-print" style={{ textAlign: 'center', padding: '8px' }}>
        <button
          onClick={() => window.print()}
          style={{
            background: GREEN,
            color: '#fff',
            border: 0,
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          PDF / Print (A5)
        </button>
        {!kitabName && (
          <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: '#92400e' }}>
            কিতাব বাছা হয়নি — ঘরটা ফাঁকা ছাপা হবে
          </span>
        )}
      </div>

      {pages.map((chunk, i) => (
        <Page
          key={i}
          chunk={chunk}
          pageIndex={i}
          pageCount={pages.length}
          total={students.length}
          info={info}
          cols={cols}
        />
      ))}
    </div>
  );
};

export default ExamReportFive;
