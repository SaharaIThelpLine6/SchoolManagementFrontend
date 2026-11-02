import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import {
  cellValue,
  clampBlankRows,
  clampFont,
  clampWatermark,
  columnCount,
  defaultNumberSheetSettings,
  fieldPercents,
  paperSize,
  resolveFields,
  rowHeightMm,
  signText,
  sortRows,
  titleText,
  toBn,
  toLogoSrc,
} from '../../../../Data/numberSheetColumns';

const SAFETY = 6;
const COL_GAP = 5;
const MM = 96 / 25.4;

const RULE = '#1f2937';
const HEAD_BG = '#f1f5f9';

const sameName = (a, b) =>
  String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

const findSubjectTeacher = (subjects, kitabName) => {
  if (!Array.isArray(subjects) || !String(kitabName ?? '').trim()) return '';

  const hit = subjects.find(
    (sub) =>
      sameName(sub?.SubjectName, kitabName) ||
      sameName(sub?.SubjectNameAra, kitabName) ||
      sameName(sub?.SubjectNameEng, kitabName)
  );

  return String(hit?.TeacherName ?? '').trim();
};

const NumberSheetPaper = ({
  reportData,
  header,
  settings,
  subClassName = '',
  kitabName = '',
  examinerName = '',
  instituteLogo = '',
  watermarkLogo = '',
  onTitleChange = null,
}) => {
  const cfg = settings || defaultNumberSheetSettings();

  const page = paperSize(cfg);
  const cols = columnCount(cfg.columns);
  const font = clampFont(cfg.fontSize);
  const rowH = rowHeightMm(cfg);

  const fields = useMemo(() => resolveFields(cfg), [cfg]);
  const widths = useMemo(() => fieldPercents(fields), [fields]);

  const rows = useMemo(() => {
    const list = Array.isArray(reportData) ? reportData : reportData?.data ?? [];
    return sortRows(list, cfg.sortBy, cfg.sortOrder);
  }, [reportData, cfg.sortBy, cfg.sortOrder]);

  const first = rows[0] || {};

  const printRows = useMemo(() => {
    const blanks = clampBlankRows(cfg.blankRows);
    return blanks > 0 ? [...rows, ...Array.from({ length: blanks }, () => null)] : rows;
  }, [rows, cfg.blankRows]);

  const info = useMemo(() => {
    const contactRaw = header?.ContactNumber || first.ContactNumber || '';

    return {
      institutionName: header?.InstitutionName || first.InstitutionName || '',
      address: header?.Address || first.Address || '',
      contact: String(contactRaw).split('#')[0].trim(),
      examName: header?.ExamName || first.ExamName || '',
      sessionName: header?.SessionName || first.SessionName || '',
      sessionAraName: header?.SessionAraName || first.SessionAraName || '',
      subClassName:
        subClassName || header?.SubClass || first.SubClassName || first.SubClass || '',
      kitabName,
      examinerName:
        String(examinerName ?? '').trim() ||
        findSubjectTeacher(header?.Subjects, kitabName),
      logo:
        toLogoSrc(header?.InstitutionLogo) ||
        toLogoSrc(header?.Logo) ||
        toLogoSrc(instituteLogo) ||
        toLogoSrc(first.InstitutionLogo) ||
        toLogoSrc(first.Logo),
      stamp: toLogoSrc(watermarkLogo),
      printDate: new Date().toLocaleDateString('bn-BD').replace(/\//g, '-'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [header, first, subClassName, kitabName, examinerName, instituteLogo, watermarkLogo]);

  const stampSrc = info.stamp || info.logo;
  const wmAlpha = clampWatermark(cfg.watermarkOpacity) / 100;
  const showStamp = cfg.showWatermark === true && !!stampSrc;

  const [fadedStamp, setFadedStamp] = useState('');

  useEffect(() => {
    if (!showStamp || typeof document === 'undefined') {
      setFadedStamp('');
      return undefined;
    }

    let dead = false;
    const img = new Image();

    img.onload = () => {
      if (dead) return;

      try {
        const w = img.naturalWidth || 0;
        const h = img.naturalHeight || 0;
        if (!w || !h) {
          setFadedStamp('');
          return;
        }

        const work = document.createElement('canvas');
        work.width = w;
        work.height = h;
        const wctx = work.getContext('2d');
        wctx.drawImage(img, 0, 0);

        let x0 = 0;
        let y0 = 0;
        let x1 = w;
        let y1 = h;

        try {
          const d = wctx.getImageData(0, 0, w, h).data;
          let minX = w;
          let minY = h;
          let maxX = -1;
          let maxY = -1;

          for (let y = 0; y < h; y += 1) {
            for (let x = 0; x < w; x += 1) {
              if (d[(y * w + x) * 4 + 3] > 8) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
            }
          }

          if (maxX >= minX && maxY >= minY) {
            x0 = minX;
            y0 = minY;
            x1 = maxX + 1;
            y1 = maxY + 1;
          }
        } catch {
          // ignore
        }

        const cw = x1 - x0;
        const ch = y1 - y0;

        const out = document.createElement('canvas');
        out.width = cw;
        out.height = ch;

        const octx = out.getContext('2d');
        octx.globalAlpha = wmAlpha;
        octx.drawImage(work, x0, y0, cw, ch, 0, 0, cw, ch);

        setFadedStamp(out.toDataURL('image/png'));
      } catch {
        setFadedStamp('');
      }
    };

    img.onerror = () => {
      if (!dead) setFadedStamp('');
    };

    img.src = stampSrc;

    return () => {
      dead = true;
    };
  }, [showStamp, stampSrc, wmAlpha]);

  const wmSize = Math.round(Math.min(page.width, page.height) * 0.55);
  const wmLeft = Math.round(((page.width - wmSize) / 2) * 10) / 10;
  const wmTop = Math.round(((page.height - wmSize) / 2) * 10) / 10;

  const measureRef = useRef(null);
  const [rowsPerColumn, setRowsPerColumn] = useState(null);

  const stamp = [
    page.id, page.orientation, cols, font, rowH,
    fields.map((f) => f.key).join(','),
    cfg.showHeader, cfg.showLogo, cfg.showExamBand, cfg.showMeta,
    cfg.showExaminer, cfg.showFooterSign,
    info.institutionName, info.address, info.examName, info.subClassName,
    titleText(cfg), info.examinerName,
    printRows.length,
  ].join('|');

  useLayoutEffect(() => {
    const measure = () => {
      const box = measureRef.current;
      if (!box) return;

      const headH = box.querySelector('[data-m="head"]')?.offsetHeight ?? 0;
      const footH = box.querySelector('[data-m="foot"]')?.offsetHeight ?? 0;
      const tableHead = box.querySelector('thead')?.offsetHeight ?? 0;
      const sampleRow = box.querySelector('tbody tr')?.offsetHeight ?? 0;

      if (!sampleRow) return;

      const contentH = (page.height - page.pad * 2) * MM;
      const avail = contentH - headH - footH - tableHead - SAFETY;

      const fit = Math.max(1, Math.floor(avail / sampleRow));
      setRowsPerColumn((prev) => (prev === fit ? prev : fit));
    };

    measure();

    let alive = true;
    const again = () => alive && measure();

    document.fonts?.ready?.then(again).catch(() => {});

    const imgs = Array.from(measureRef.current?.querySelectorAll('img') ?? []);
    imgs.forEach((img) => img.addEventListener('load', again));

    return () => {
      alive = false;
      imgs.forEach((img) => img.removeEventListener('load', again));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamp]);

  const pages = useMemo(() => {
    if (!printRows.length) return [];

    const per = (rowsPerColumn || printRows.length) * cols;

    const out = [];
    for (let i = 0; i < printRows.length; i += per) {
      out.push(printRows.slice(i, i + per));
    }
    return out;
  }, [printRows, rowsPerColumn, cols]);

  const perColumn = rowsPerColumn || printRows.length;

  const renderHead = () => (
    <div className="ns-head">
      {cfg.showHeader !== false && (
        <div className="ns-inst-row">
          {cfg.showLogo !== false && info.logo && (
            <img className="ns-logo" src={info.logo} alt="" />
          )}

          <div className="ns-inst-txt">
            {info.institutionName && <div className="ns-inst">{info.institutionName}</div>}
            {info.address && <div className="ns-addr">{info.address}</div>}
            {info.contact && <div className="ns-contact">মোবাইল: {info.contact}</div>}
          </div>
        </div>
      )}

      {cfg.showExamBand !== false && (
        <div className="ns-band-row">
          {onTitleChange ? (
            <>
              <input
                type="text"
                className="ns-band ns-band-edit"
                value={cfg.title ?? ''}
                placeholder={titleText(cfg)}
                onChange={(e) => onTitleChange(e.target.value)}
                title="চাপ দিয়ে কাগজের শিরোনাম লিখুন"
                style={{ width: `${Math.max(14, titleText(cfg).length + 4)}ch` }}
              />
              <span className="ns-band ns-band-print">{titleText(cfg)}</span>
            </>
          ) : (
            <span className="ns-band">{titleText(cfg)}</span>
          )}
        </div>
      )}

      {cfg.showMeta !== false && (
        <div className="ns-meta">
          {(info.examName || info.sessionName || info.sessionAraName) && (
            <div className="ns-meta-cell">
              <span className="ns-meta-lbl">শ্রেণি/জামাত: </span>
              {info.subClassName}
            </div>
          )}
          {(info.examName || info.sessionName || info.sessionAraName) && (
            <div className="ns-meta-cell">
              <span className="ns-meta-lbl">শিক্ষাবর্ষ: </span>
              {info.sessionAraName}
              {info.sessionAraName && info.sessionName ? ' / ' : ''}
              {info.sessionName}
            </div>
          )}
          <div className="ns-meta-cell">
            <span className="ns-meta-lbl">কিতাব: </span>
            {info.kitabName}
          </div>
          <div className="ns-meta-cell ns-meta-total">
            <span className="ns-meta-lbl">মোট: </span>
            {toBn(rows.length)}
          </div>
        </div>
      )}

      {cfg.showExaminer !== false && (
        <div className="ns-examiner">
          <span>
            পরীক্ষকের নাম:{' '}
            <span className="ns-dotted ns-dotted-wide">{info.examinerName}</span>
          </span>
          
          <span>
            তারিখ: <span className="ns-dotted">{info.printDate}</span>
          </span>

          {/* ⭐ নতুন যোগ করা হলো - জমার তারিখ (হাতে লেখার জন্য) */}
          {cfg.showSubmissionDate && (
            <span>
              {cfg.submissionDateText || 'জমার তারিখ'}: <span className="ns-dotted" style={{ minWidth: '30mm' }}></span>
            </span>
          )}
          
        </div>
      )}
    </div>
  );

  const renderColumn = (colRows, startSerial) => (
    <table className="ns-table">
      <colgroup>
        {fields.map((f, i) => (
          <col key={f.key} style={{ width: widths[i] }} />
        ))}
      </colgroup>

      <thead>
        <tr>
          {fields.map((f) => (
            <th key={f.key} style={{ textAlign: f.align }}>
              {f.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {colRows.map((row, i) => (
          <tr key={i}>
            {fields.map((f) => {
              if (f.key === 'SL') {
                return (
                  <td key={f.key} style={{ textAlign: f.align }}>
                    {row ? toBn(startSerial + i) : '\u00A0'}
                  </td>
                );
              }

              return (
                <td
                  key={f.key}
                  className={f.align === 'left' ? 'ns-txt' : ''}
                  style={{ textAlign: f.align }}
                >
                  {(row ? cellValue(f, row) : '') || '\u00A0'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderFoot = (pageIndex, pageCount) => (
    <div className="ns-foot">
      {cfg.showFooterSign !== false && (
        <div className="ns-signs">
          <div className="ns-sign">{signText(cfg, 'signLeft')}</div>
          <div className="ns-sign">{signText(cfg, 'signRight')}</div>
        </div>
      )}

      {pageCount > 1 && (
        <div className="ns-pageno">
          পৃষ্ঠা {toBn(pageIndex + 1)} / {toBn(pageCount)}
        </div>
      )}
    </div>
  );

  if (!rows.length) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center print:hidden">
        <p className="text-slate-500 font-medium">এই শর্তে কোনো পরীক্ষার্থী পাওয়া যায়নি</p>
        <p className="text-slate-400 text-sm mt-1">
          শিক্ষাবর্ষ, পরীক্ষা, শ্রেণি বা অবস্থান বদলে দেখুন
        </p>
      </div>
    );
  }

  const colWidthMm = (page.width - page.pad * 2 - (cols - 1) * COL_GAP) / cols;

  return (
    <div className="ns-wrap bg-gray-100 print:bg-transparent w-full">
      <style>{`
        @page { size: ${page.id.toUpperCase()} ${page.orientation}; margin: 0; }

        .ns-page {
          box-sizing: border-box;
          width: ${page.width}mm;
          height: ${page.height}mm;
          padding: ${page.pad}mm;
          background: #ffffff;
          color: #0f172a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .ns-page { position: relative; }
        .ns-watermark {
          position: absolute;
          left: ${wmLeft}mm;
          top: ${wmTop}mm;
          width: ${wmSize}mm;
          height: ${wmSize}mm;
          object-fit: contain;
          pointer-events: none;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        .ns-page > *:not(.ns-watermark) { position: relative; }

        .ns-inst-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: ${font > 10 ? 16 : 13}mm;
          border-bottom: 0.4mm solid ${RULE};
          padding-bottom: 1.5mm;
        }
        .ns-logo {
          position: absolute; left: 0; top: 50%;
          transform: translateY(-50%);
          height: ${font > 10 ? 14 : 11}mm; width: auto; max-width: 26mm;
          object-fit: contain;
        }
        .ns-inst-txt { text-align: center; max-width: 100%; }
        .ns-inst { font-size: ${font + 6}pt; font-weight: 700; line-height: 1.2; }
        .ns-addr { font-size: ${font}pt; line-height: 1.3; }
        .ns-contact { font-size: ${font - 1}pt; color: #475569; line-height: 1.3; }

        .ns-band-row { text-align: center; margin-top: 2mm; }

        .ns-band.ns-band-print { display: none; }
        .ns-band-edit {
          background: transparent;
          text-align: center;
          outline: none;
          cursor: text;
          border-style: dashed;
        }
        .ns-band-edit:hover { background: #f8fafc; }
        .ns-band-edit:focus {
          border-style: solid;
          box-shadow: 0 0 0 0.6mm #ddd6fe;
        }
        .ns-band-edit::placeholder { color: inherit; opacity: 0.55; }

        .ns-band {
          display: inline-block;
          border: 0.3mm solid ${RULE};
          border-radius: 99mm;
          padding: 0.8mm 5mm;
          font-size: ${font + 1}pt;
          font-weight: 700;
          line-height: 1.25;
        }

        .ns-meta {
          display: flex;
          border: 0.3mm solid ${RULE};
          margin-top: 2mm;
          font-size: ${font}pt;
          font-weight: 700;
          overflow: hidden;
        }
        .ns-meta-cell {
          flex: 1.3; min-width: 0;
          padding: 1mm 2mm;
          border-right: 0.3mm solid ${RULE};
          background: ${HEAD_BG};
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ns-meta-cell:last-child { border-right: 0; }
        .ns-meta-total { flex: 0.6; text-align: center; }
        .ns-meta-lbl { color: #475569; font-weight: 600; }

        .ns-examiner {
          display: flex; justify-content: space-between;
          font-size: ${font}pt; font-weight: 600;
          margin-top: 1.6mm;
        }
        .ns-dotted {
          display: inline-block; min-width: 24mm;
          border-bottom: 0.25mm dotted ${RULE};
          text-align: center;
          padding: 0 1mm;
        }
        .ns-dotted-wide { min-width: 34mm; }

        .ns-cols {
          display: flex;
          gap: ${COL_GAP}mm;
          margin-top: 2mm;
          align-items: flex-start;
        }
        .ns-col { flex: 1 1 0; min-width: 0; }

        .ns-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: ${font}pt;
        }
        .ns-table th, .ns-table td {
          border: 0.25mm solid ${RULE};
          padding: 0 1mm;
          line-height: 1.25;
          height: ${rowH}mm;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ns-table th {
          background: ${HEAD_BG};
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
          font-weight: 700;
        }
        .ns-table .ns-txt { padding-left: 1.5mm; }

        .ns-head,
        .ns-cols,
        .ns-col,
        .ns-table,
        .ns-table tbody,
        .ns-table tr,
        .ns-table td,
        .ns-foot { background: transparent; }

        .ns-foot { margin-top: auto; padding-top: 2mm; }
        .ns-signs { display: flex; justify-content: space-between; gap: 8mm; }
        .ns-sign {
          width: 40mm; text-align: center;
          border-top: 0.35mm solid ${RULE};
          padding-top: 0.8mm;
          font-size: ${font - 1}pt; font-weight: 700;
        }
        .ns-pageno {
          text-align: center; margin-top: 1.5mm;
          font-size: ${font - 2}pt; color: #64748b;
        }

        .ns-measure {
          position: fixed; top: -10000px; left: 0;
          visibility: hidden; pointer-events: none; z-index: -1;
        }

        @media screen {
          .ns-page { margin: 6mm auto; box-shadow: 0 1mm 4mm rgba(0,0,0,0.18); }
        }

        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          .ns-wrap { background: transparent !important; }
          .ns-measure { display: none !important; }

          .ns-band.ns-band-edit { display: none !important; }
          .ns-band.ns-band-print { display: inline-block !important; }
          .ns-page {
            margin: 0 !important; box-shadow: none !important;
            break-after: page; page-break-after: always;
          }
          .ns-page.ns-last { break-after: auto; page-break-after: auto; }

          .ns-wrap > *:not(.ns-page) { display: none !important; }

          .ns-page > .ns-watermark {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .ns-page .ns-head,
          .ns-page .ns-cols,
          .ns-page .ns-col,
          .ns-page .ns-table,
          .ns-page .ns-table tbody,
          .ns-page .ns-table tr,
          .ns-page .ns-table td,
          .ns-page .ns-foot { background: transparent !important; }

          .ns-page, .ns-page * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {pages.map((pageRows, pageIndex) => (
        <div
          key={pageIndex}
          className={`ns-page ${pageIndex === pages.length - 1 ? 'ns-last' : ''}`}
        >
          {showStamp && (
            <img
              className="ns-watermark"
              src={fadedStamp || stampSrc}
              alt=""
              aria-hidden="true"
              style={fadedStamp ? undefined : { opacity: wmAlpha }}
            />
          )}

          {renderHead()}

          <div className="ns-cols">
            {Array.from({ length: cols }).map((_, c) => {
              const slice = pageRows.slice(c * perColumn, (c + 1) * perColumn);

              return (
                <div key={c} className="ns-col">
                  {renderColumn(slice, pageIndex * perColumn * cols + c * perColumn + 1)}
                </div>
              );
            })}
          </div>

          {renderFoot(pageIndex, pages.length)}
        </div>
      ))}

      <div
        ref={measureRef}
        className="ns-measure"
        style={{ width: `${page.width - page.pad * 2}mm` }}
      >
        <div data-m="head">{renderHead()}</div>

        <div style={{ width: `${colWidthMm}mm` }}>
          {renderColumn([first], 1)}
        </div>

        <div data-m="foot">{renderFoot(0, 2)}</div>
      </div>
    </div>
  );
};

export default NumberSheetPaper;
