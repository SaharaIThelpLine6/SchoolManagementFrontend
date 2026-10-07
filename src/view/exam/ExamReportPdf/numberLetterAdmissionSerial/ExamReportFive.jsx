import React from 'react';

/**
 * ExamReportFive — A5 Portrait (148mm × 210mm) print-ready mark sheet
 * - প্রতি পৃষ্ঠায় ২ কলাম × ২৬ সারি = ৫২ জন
 * - ৫২ জনের বেশি হলে নিজে থেকেই পরের A5 পৃষ্ঠা তৈরি হবে
 * - "PDF / Print" বাটন চাপুন → Destination: Save as PDF, Paper size: A5, Margins: None
 */

const ROWS_PER_COLUMN = 26;
const PER_PAGE = ROWS_PER_COLUMN * 2;

const INK = '#1b2420';
const GREEN = '#1f4d3a';
const RULE = '#9aa8a0';
const ZEBRA = '#f1f5f2';

const toBn = (v) =>
  String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);

const FONT =
  "'Noto Serif Bengali','Hind Siliguri','SolaimanLipi','Kalpurush','Nikosh',system-ui,sans-serif";

const COLS = [
  { w: '8%', label: 'ক্রম', align: 'center' },
  { w: '12%', label: 'রোল নং', align: 'center' },
  { w: '19%', label: 'পরীক্ষার্থী নং', align: 'center' },
  { w: 'auto', label: 'পরীক্ষার্থীর নাম', align: 'left' },
  { w: '14%', label: 'নম্বর', align: 'center' },
];

const Column = ({ rows, startSerial }) => (
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
      {COLS.map((c, i) => (
        <col key={i} style={{ width: c.w }} />
      ))}
    </colgroup>
    <thead>
      <tr>
        {COLS.map((c, i) => (
          <th
            key={i}
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
              paddingLeft: c.align === 'left' ? '1.2mm' : undefined,
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
          <td style={cell('center', true, idx)}>{toBn(startSerial + idx)}</td>
          <td style={cell('center', false, idx)}>{s?.AdmissionSerial ?? ''}</td>
          <td style={cell('center', false, idx)}>{s?.UserCode ?? ''}</td>
          <td
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
          <td style={cell('center', false, idx)}>{s?.Subject ?? ''}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

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

const Sign = ({ label }) => (
  <div style={{ textAlign: 'center', width: '40mm' }}>
    <div style={{ borderTop: `0.35mm solid ${INK}`, paddingTop: '0.8mm', fontSize: '7pt', fontWeight: 700 }}>
      {label}
    </div>
  </div>
);

const Page = ({ chunk, pageIndex, pageCount, total, first }) => {
  const pad = (arr) => {
    const a = [...arr];
    while (a.length < ROWS_PER_COLUMN) a.push(null);
    return a;
  };
  const left = pad(chunk.slice(0, ROWS_PER_COLUMN));
  const right = pad(chunk.slice(ROWS_PER_COLUMN, PER_PAGE));
  const offset = pageIndex * PER_PAGE;
  const contact = (first.ContactNumber || '').split('#');

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
      {/* Institution header */}
      <header style={{ textAlign: 'center', paddingBottom: '2mm', borderBottom: `0.9mm double ${GREEN}` }}>
        <h1 style={{ margin: 0, fontSize: '15pt', fontWeight: 800, color: GREEN, lineHeight: 1.2 }}>
          {first.InstitutionName || 'জামিয়া রুকাইয়্যাহ রা.(ক্বওমী মহিলা মাদ্রাসা)'}
        </h1>
        <div style={{ fontSize: '8pt', fontWeight: 600, marginTop: '0.8mm' }}>
          {first.Address || 'সুতারপাড়া-২২৫০, ফুলপুর, ময়মনসিংহ'}
        </div>
        <div style={{ fontSize: '6.8pt', color: '#55635b', marginTop: '0.5mm' }}>
          মোবাইল: {contact[0] || '০১৯১১০৯৪৯২৭'} | ইমেইল: {contact[1] || 'qmmsoft.com/1585'}
        </div>
      </header>

      {/* Report title */}
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
          }}
        >
          ২য় সাময়িক পরীক্ষা — ১৪৪৭-৪৮হি: / ২০২৬-২৭ইং
        </span>
      </div>

      {/* Exam info */}
      <div
        style={{
          display: 'flex',
          border: `0.3mm solid ${GREEN}`,
          borderRadius: '1mm',
          fontSize: '7.6pt',
          fontWeight: 700,
          marginBottom: '2mm',
        }}
      >
        <div style={{ flex: 1.35, padding: '1.3mm 2mm', borderRight: `0.3mm solid ${GREEN}`, background: ZEBRA }}>
          <span style={{ color: '#55635b', fontWeight: 600 }}>শ্রেণি/জামাত: </span>
          {first.ExamName || '১ম মডেল টেস্ট'} / {first.SubClass || 'দাওরা(তাকমীল)/মাস্টার্স'}
        </div>
        <div style={{ flex: 1, padding: '1.3mm 2mm', background: ZEBRA, display: 'flex', justifyContent: 'space-between' }}>
          <span>
            <span style={{ color: '#55635b', fontWeight: 600 }}>বিভাগ: </span>
            {first.SubClass || '—'}
          </span>
          <span>
            <span style={{ color: '#55635b', fontWeight: 600 }}>মোট: </span>
            {toBn(total)}
          </span>
        </div>
      </div>

      {/* Examiner / date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.2pt', fontWeight: 600, marginBottom: '1.6mm' }}>
        <span>
          পরীক্ষকের নাম:{' '}
          <span style={{ display: 'inline-block', width: '34mm', borderBottom: `0.25mm dotted ${INK}` }} />
        </span>
        <span>
          তারিখ:{' '}
          <span style={{ display: 'inline-block', width: '24mm', borderBottom: `0.25mm dotted ${INK}` }} />
        </span>
      </div>

      {/* Two tables */}
      <div style={{ display: 'flex', gap: '2.5mm' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Column rows={left} startSerial={offset + 1} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Column rows={right} startSerial={offset + ROWS_PER_COLUMN + 1} />
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Sign label="প্রধান পরীক্ষকের স্বাক্ষর" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '6.6pt', fontWeight: 600, marginBottom: '0.8mm' }}>মোট পরীক্ষার্থী</div>
          <div
            style={{
              border: `0.4mm solid ${GREEN}`,
              borderRadius: '1mm',
              width: '22mm',
              height: '6.5mm',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10pt',
              fontWeight: 800,
              color: GREEN,
            }}
          >
            {toBn(total)}
          </div>
        </div>
        <Sign label="হল পরিদর্শকের স্বাক্ষর" />
      </footer>

      {pageCount > 1 && (
        <div style={{ position: 'absolute', bottom: '2mm', left: 0, right: 0, textAlign: 'center', fontSize: '6pt', color: '#7a877f' }}>
          পৃষ্ঠা {toBn(pageIndex + 1)} / {toBn(pageCount)}
        </div>
      )}
    </section>
  );
};

const ExamReportFive = ({ data }) => {
  const students = React.useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const first = students[0] || {};

  const pages = React.useMemo(() => {
    if (!students.length) return [[]];
    const out = [];
    for (let i = 0; i < students.length; i += PER_PAGE) out.push(students.slice(i, i + PER_PAGE));
    return out;
  }, [students]);

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
      </div>

      {pages.map((chunk, i) => (
        <Page
          key={i}
          chunk={chunk}
          pageIndex={i}
          pageCount={pages.length}
          total={students.length}
          first={first}
        />
      ))}
    </div>
  );
};

export default ExamReportFive;