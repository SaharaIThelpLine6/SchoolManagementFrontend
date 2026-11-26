// হাজিরা রিপোর্টের কাগজ — পৃষ্ঠা ভাগ করা প্রিভিউ এবং সেই পৃষ্ঠাগুলো থেকেই PDF।
// প্রতিটি সারির উচ্চতা মেপে পৃষ্ঠা ভাগ হয়: প্রথম পৃষ্ঠায় প্রতিষ্ঠানের নাম ও শিরোনাম, প্রতি পৃষ্ঠায় টেবিলের হেডার,
// শেষ পৃষ্ঠায় স্বাক্ষর। PDF ব্রাউজারের আঁকা পৃষ্ঠার ছবি — তাই বাংলা যুক্তাক্ষর ঠিক থাকে।
import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { STATUS_META, cellText, digits, statText } from './reportEngine';
import { MARGIN, pageSizeOf } from './paper';
import StatusIcon from './StatusIcon';

// ---------------------------------------------------------------- কাগজের অংশগুলো
function Header({ meta, settings, institution }) {
  return (
    <div className="pb-3">
      {settings.showHeader && (institution.name || institution.address) && (
        <div className="mb-2 flex items-center justify-center gap-3 border-b-2 border-double border-slate-700 pb-2">
          {settings.showLogo && institution.logo && <img src={institution.logo} alt="" className="h-14 w-14 object-contain" />}
          <div className="text-center">
            {institution.name && <div className="text-[20px] font-bold leading-tight">{institution.name}</div>}
            {institution.address && <div className="text-[12px] leading-snug text-slate-700">{institution.address}</div>}
          </div>
        </div>
      )}
      <div className="text-center">
        <div className="inline-block rounded border border-slate-700 px-4 py-[2px] text-[16px] font-bold">{meta.title}</div>
        {meta.subtitle && <div className="mt-1 text-[12px] text-slate-700">{meta.subtitle}</div>}
      </div>
      {meta.info && (
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-[2px] rounded border border-slate-300 px-3 py-2 text-[12px]">
          {meta.info.map(([label, value, isCode]) => (
            <div key={label} className="flex gap-1">
              <span className="shrink-0 text-slate-600">{label}:</span>
              <span className="font-semibold">{isCode ? digits(value, settings) : value}</span>
            </div>
          ))}
        </div>
      )}
      {settings.showStats && meta.stats.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-[6px] text-[11px]">
          {meta.stats.map((s) => (
            <span key={s.label} className="rounded border border-slate-300 bg-slate-50 px-2 py-[1px]">
              {s.label}: <b>{statText(s, settings)}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Footer({ meta, settings }) {
  const signatures = settings.showSignature
    ? String(settings.signatures || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  if (!meta.legend && !signatures.length) return null;
  return (
    <div className="pt-2">
      {meta.legend && (
        <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 rounded border border-slate-500 px-3 py-[5px] text-[11px]">
          <span className="font-bold">সংকেত:</span>
          {meta.legend.map((k) => (
            <span key={k} className="inline-flex items-center gap-1">
              <StatusIcon status={k} size={13} mono={!settings.colorStatus} />
              <span className={settings.colorStatus ? STATUS_META[k].tone : ''}>{STATUS_META[k].label}</span>
            </span>
          ))}
        </div>
      )}
      {signatures.length > 0 && (
        <div className="flex justify-between gap-6 pt-14 text-[12px]">
          {signatures.map((s) => (
            <div key={s} className="min-w-[110px] border-t border-slate-700 pt-1 text-center">
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const metaShape = PropTypes.shape({
  title: PropTypes.string,
  subtitle: PropTypes.string,
  generatedAt: PropTypes.string,
  info: PropTypes.array,
  stats: PropTypes.array,
  legend: PropTypes.arrayOf(PropTypes.string),
});
const institutionShape = PropTypes.shape({ name: PropTypes.string, address: PropTypes.string, logo: PropTypes.string });
Header.propTypes = { meta: metaShape.isRequired, settings: PropTypes.object.isRequired, institution: institutionShape.isRequired };
Footer.propTypes = { meta: metaShape.isRequired, settings: PropTypes.object.isRequired };

const thClass = 'border border-slate-500 bg-slate-100 px-1 py-[3px] font-bold leading-tight';
const tdClass = 'border border-slate-400 px-1 py-[2px] leading-snug break-words';

// কলামের প্রস্থ (px): সংখ্যা/তারিখ/আইডি জাতীয় কলাম লেখার মাপে (ভাঙে না), বাকি জায়গা নাম জাতীয় কলামে।
// সব কলাম না ধরলে আগের মতো অনুপাতে ভাগ (তখন লেখা ভেঙে পরের লাইনে যায়)।
const FIXED_KINDS = new Set(['code', 'number', 'date', 'time', 'duration', 'percent', 'mark']);
const MIN_TEXT = 60;
function columnWidths(columns, rows, settings, total) {
  const fs = Number(settings.fontSize) || 11;
  const step = Math.max(1, Math.ceil(rows.length / 1500));
  const fixed = columns.map((c) => {
    if (!FIXED_KINDS.has(c.kind)) return null;
    if (c.dayCol) return Math.ceil(fs + 9); // চিহ্ন + তারিখের ২ অঙ্ক
    let chars = c.iconOnly ? 2 : Math.max(...String(c.label).split(/[\s-]+/).map((w) => w.length));
    for (let i = 0; i < rows.length; i += step) {
      if (rows[i].kind !== 'group') chars = Math.max(chars, cellText(c, rows[i][c.key], settings).length);
    }
    return Math.ceil(chars * fs * 0.62 + 10);
  });
  const fixedSum = fixed.reduce((s, w) => s + (w || 0), 0);
  const flexWeight = columns.reduce((s, c, i) => s + (fixed[i] == null ? c.w : 0), 0);
  const flexCount = fixed.filter((w) => w == null).length;
  if (columns.length && fixedSum + flexCount * MIN_TEXT <= total) {
    const rest = total - fixedSum;
    if (!flexCount) return { widths: fixed.map((w) => (w * total) / fixedSum), nowrap: true };
    return { widths: columns.map((c, i) => fixed[i] ?? (rest * c.w) / flexWeight), nowrap: true };
  }
  // জায়গা কম: নাম জাতীয় কলাম ন্যূনতম মাপে, বাকি কলাম অনুপাতে ছোট (লেখা দরকারে ভাঙবে)
  const shrink = Math.max(0.3, (total - flexCount * MIN_TEXT) / (fixedSum || 1));
  const widths = columns.map((c, i) => (fixed[i] != null ? fixed[i] * shrink : MIN_TEXT));
  const sum = widths.reduce((s, w) => s + w, 0) || 1;
  return { widths: widths.map((w) => (w * total) / sum), nowrap: false };
}

function ColGroup({ columns, widths }) {
  return (
    <colgroup>
      {columns.map((c, i) => (
        <col key={c.key} style={{ width: widths[i] }} />
      ))}
    </colgroup>
  );
}

function Head({ columns, settings }) {
  return (
    <thead>
      <tr>
        {columns.map((c) => (
          <th key={c.key} className={`${thClass} ${c.align === 'left' ? 'text-left' : 'text-center'}`}>
            {c.dayCol ? (
              <>
                <div>{digits(c.label, settings)}</div>
                <div className="text-[0.8em] font-normal text-slate-600">{c.sub}</div>
              </>
            ) : c.iconOnly ? (
              // শুধু মাসিক রেজিস্টারে — গণনার কলামের হেডারে চিহ্ন (নিচে সংকেত থাকে)
              <div className="flex justify-center">
                <StatusIcon status={c.status} size={Number(settings.fontSize) + 2} mono={!settings.colorStatus} />
              </div>
            ) : (
              c.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function Row({ row, columns, settings, nowrap }) {
  if (row.kind === 'group') {
    return (
      <tr>
        <td colSpan={columns.length} className={`${tdClass} bg-slate-200 font-bold`}>
          {row.dateLabel ? digits(row.label, settings) : row.label} <span className="font-normal">({digits(row.count, settings)} টি)</span>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      {columns.map((c) => {
        const value = row[c.key];
        const status = c.kind === 'status' || c.kind === 'mark' ? value : null;
        const tone = settings.colorStatus && status ? STATUS_META[status]?.tone : '';
        return (
          <td
            key={c.key}
            className={`${tdClass} ${c.align === 'left' ? 'text-left' : 'text-center'} ${tone} ${status ? 'font-semibold' : ''} ${
              nowrap && FIXED_KINDS.has(c.kind) ? 'whitespace-nowrap' : ''
            }`}
          >
            {c.kind === 'mark' ? (
              <StatusIcon status={value} size={Number(settings.fontSize) + 3} mono={!settings.colorStatus} />
            ) : c.kind === 'status' && STATUS_META[value]?.symbol ? (
              <span className="inline-flex items-center gap-1">
                <StatusIcon status={value} size={Number(settings.fontSize) + 2} mono={!settings.colorStatus} />
                {cellText(c, value, settings)}
              </span>
            ) : (
              cellText(c, value, settings)
            )}
          </td>
        );
      })}
    </tr>
  );
}

const columnsShape = PropTypes.arrayOf(PropTypes.object).isRequired;
ColGroup.propTypes = { columns: columnsShape, widths: PropTypes.arrayOf(PropTypes.number).isRequired };
Head.propTypes = { columns: columnsShape, settings: PropTypes.object.isRequired };
Row.propTypes = { row: PropTypes.object.isRequired, columns: columnsShape, settings: PropTypes.object.isRequired, nowrap: PropTypes.bool };

function Table({ report, settings, layout, from, to }) {
  return (
    <table className="w-full table-fixed border-collapse" style={{ fontSize: `${settings.fontSize}px` }}>
      <ColGroup columns={report.columns} widths={layout.widths} />
      <Head columns={report.columns} settings={settings} />
      <tbody>
        {report.rows.slice(from, to).map((row, i) => (
          <Row key={from + i} row={row} columns={report.columns} settings={settings} nowrap={layout.nowrap} />
        ))}
      </tbody>
    </table>
  );
}
Table.propTypes = {
  report: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  layout: PropTypes.shape({ widths: PropTypes.array, nowrap: PropTypes.bool }).isRequired,
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
};

// ---------------------------------------------------------------- পৃষ্ঠা ভাগ
// rows[] এর উচ্চতা থেকে পৃষ্ঠা: [{ from, to, first, last }]
function paginate({ avail, headerH, theadH, footerH, rowH, isGroup }) {
  const pages = [];
  let page = { from: 0, to: 0, first: true };
  let used = headerH + (rowH.length ? theadH : 0);
  for (let i = 0; i < rowH.length; i += 1) {
    // ভাগের শিরোনাম পৃষ্ঠার একদম শেষে একা থাকবে না
    const need = rowH[i] + (isGroup[i] && i + 1 < rowH.length ? rowH[i + 1] : 0);
    if (page.to > page.from && used + need > avail) {
      pages.push(page);
      page = { from: i, to: i, first: false };
      used = theadH;
    }
    page.to = i + 1;
    used += rowH[i];
  }
  if (footerH && used + footerH > avail && (page.to > page.from || !page.first)) {
    pages.push(page);
    page = { from: rowH.length, to: rowH.length, first: false };
  }
  pages.push(page);
  pages[pages.length - 1].last = true;
  return pages;
}

// html2canvas বাংলা ফন্টের লেখা ব্রাউজারের চেয়ে ~০.৩৫em নিচে আঁকে (ঘরের নিচের দাগে লেগে যায়)।
// শুধু PDF এর কপিতে প্রতিটি লেখা সেই পরিমাণ উপরে তোলা হয় — লেআউট বা প্রিভিউ বদলায় না।
const TEXT_LIFT = '-0.35em';
function liftText(page) {
  const doc = page.ownerDocument;
  const walker = doc.createTreeWalker(page, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) texts.push(walker.currentNode);
  for (const node of texts) {
    const span = doc.createElement('span');
    span.style.position = 'relative';
    span.style.top = TEXT_LIFT;
    node.parentNode.insertBefore(span, node);
    span.appendChild(node);
  }
}

// ---------------------------------------------------------------- মূল কম্পোনেন্ট
const ReportDocument = forwardRef(function ReportDocument({ report, meta, settings, institution, onPageCount }, ref) {
  const size = pageSizeOf(settings);
  const measureRef = useRef(null);
  const previewRef = useRef(null);
  const exportRef = useRef(null);
  const exportReady = useRef(null);
  const [pages, setPages] = useState([{ from: 0, to: 0, first: true, last: true }]);
  const [fontTick, setFontTick] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [exporting, setExporting] = useState(false);
  const layout = useMemo(
    () => columnWidths(report.columns, report.rows, settings, size.w - 2 * MARGIN),
    [report, settings, size.w]
  );

  // বাংলা ফন্ট লোড হলে আবার মাপা
  useEffect(() => {
    let alive = true;
    document.fonts?.ready?.then(() => alive && setFontTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, []);

  // প্রিভিউর জায়গা অনুযায়ী ছোট-বড়
  useEffect(() => {
    const el = previewRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setBoxWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const h = (sel) => root.querySelector(sel)?.getBoundingClientRect().height || 0;
    const rowEls = [...root.querySelectorAll('tbody > tr')];
    const next = paginate({
      avail: size.h - 2 * MARGIN - 4,
      headerH: h('[data-part="header"]'),
      theadH: h('thead'),
      footerH: h('[data-part="footer"]'),
      rowH: rowEls.map((el) => el.getBoundingClientRect().height),
      isGroup: report.rows.map((r) => r.kind === 'group'),
    });
    setPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [report, meta, settings, institution, layout, size.h, size.w, fontTick]);

  useEffect(() => {
    onPageCount?.(pages.length);
  }, [pages.length, onPageCount]);

  useEffect(() => {
    if (exporting && exportReady.current) {
      exportReady.current();
      exportReady.current = null;
    }
  }, [exporting]);

  const renderPage = useCallback(
    (page, index) => (
      <div
        className="relative overflow-hidden bg-white font-SolaimanLipi text-black"
        style={{ width: size.w, height: size.h, padding: MARGIN }}
      >
        {page.first && <Header meta={meta} settings={settings} institution={institution} />}
        {page.to > page.from && <Table report={report} settings={settings} layout={layout} from={page.from} to={page.to} />}
        {page.first && report.rows.length === 0 && (
          <div className="rounded border border-dashed border-slate-400 py-8 text-center text-[13px] text-slate-500">
            {report.notice || 'এই ফিল্টারে দেখানোর মতো কোনো তথ্য নেই।'}
          </div>
        )}
        {page.last && <Footer meta={meta} settings={settings} />}
        <div
          className="absolute inset-x-0 flex justify-between text-[10px] text-slate-500"
          style={{ bottom: Math.round(MARGIN / 3), paddingLeft: MARGIN, paddingRight: MARGIN }}
        >
          <span>{settings.showGeneratedAt ? digits(meta.generatedAt, settings) : ''}</span>
          <span>{digits(`পৃষ্ঠা ${index + 1} / ${pages.length}`, settings)}</span>
        </div>
      </div>
    ),
    [size.w, size.h, meta, settings, institution, report, layout, pages.length]
  );

  // PDF: প্রতিটি পৃষ্ঠা আসল মাপে (স্ক্রিনের বাইরে) এঁকে ছবি করে PDF এ বসানো হয়
  useImperativeHandle(
    ref,
    () => ({
      pageCount: pages.length,
      async exportPdf(fileName, onProgress) {
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
        await new Promise((resolve) => {
          exportReady.current = resolve;
          setExporting(true);
        });
        try {
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const nodes = [...(exportRef.current?.children || [])].map((wrap) => wrap.firstElementChild);
          const pdf = new jsPDF({
            orientation: settings.orientation === 'landscape' ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [Math.min(size.wMm, size.hMm), Math.max(size.wMm, size.hMm)],
            compress: true,
          });
          for (let i = 0; i < nodes.length; i += 1) {
            onProgress?.(i + 1, nodes.length);
            const canvas = await html2canvas(nodes[i], {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true,
              onclone: (_doc, page) => liftText(page),
            });
            if (i > 0) pdf.addPage();
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, size.wMm, size.hMm, undefined, 'FAST');
          }
          pdf.save(fileName);
        } finally {
          setExporting(false);
        }
      },
    }),
    [pages.length, settings.orientation, size.wMm, size.hMm]
  );

  const scale = boxWidth ? Math.min(1, boxWidth / size.w) : 1;

  return (
    <>
      {/* মাপার জন্য — দেখা যায় না */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed left-[-100000px] top-0 font-SolaimanLipi text-black"
        style={{ width: size.w - 2 * MARGIN }}
      >
        <div data-part="header">
          <Header meta={meta} settings={settings} institution={institution} />
        </div>
        <Table report={report} settings={settings} layout={layout} from={0} to={report.rows.length} />
        <div data-part="footer">
          <Footer meta={meta} settings={settings} />
        </div>
      </div>

      {/* প্রিভিউ */}
      <div ref={previewRef} className="w-full space-y-4">
        {pages.map((page, i) => (
          <div
            key={`${i}-${page.from}`}
            className="mx-auto overflow-hidden rounded-sm shadow-[0_4px_18px_rgba(15,23,42,0.18)] ring-1 ring-slate-200"
            style={{ width: size.w * scale, height: size.h * scale }}
          >
            <div style={{ width: size.w, height: size.h, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              {renderPage(page, i)}
            </div>
          </div>
        ))}
      </div>

      {/* PDF তৈরির সময় আসল মাপের পৃষ্ঠা */}
      {exporting && (
        <div ref={exportRef} aria-hidden="true" className="pointer-events-none fixed left-[-100000px] top-0">
          {pages.map((page, i) => (
            <div key={`${i}-${page.from}`}>{renderPage(page, i)}</div>
          ))}
        </div>
      )}
    </>
  );
});

ReportDocument.propTypes = {
  report: PropTypes.shape({
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    notice: PropTypes.string,
  }).isRequired,
  meta: metaShape.isRequired,
  settings: PropTypes.object.isRequired,
  institution: institutionShape.isRequired,
  onPageCount: PropTypes.func,
};

export default ReportDocument;
