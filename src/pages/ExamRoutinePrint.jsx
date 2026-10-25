import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useLazyGetAllExamRoutineQuery } from '../features/exam/examQuerySlice';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import ExamRoutineDocument from '../view/exam/ExamRouting/ExamRoutineDocument';
import './ExamRoutinePrint.css';
import { FaPrint } from 'react-icons/fa';

const STORAGE_KEY = 'examRoutinePrintSettings';
const MM_TO_PX = 96 / 25.4;
// Every routine is laid out at this width (A4 portrait minus 8mm margins), then scaled.
const DOC_WIDTH_MM = 194;
const DOC_WIDTH_PX = DOC_WIDTH_MM * MM_TO_PX;
// Gap between a routine and its cell edge when several routines share one sheet
const CELL_PAD_MM = 2;
// Small safety so a routine is never clipped at the bottom
const HEIGHT_SAFETY = 0.98;

const PAPER_SIZES = {
  a4: { label: 'A4', width: 210, height: 297 },
  a3: { label: 'A3', width: 297, height: 420 },
  letter: { label: 'Letter', width: 215.9, height: 279.4 },
  legal: { label: 'Legal', width: 215.9, height: 355.6 },
};
const PER_PAGE_OPTIONS = [1, 2, 3, 4];
const MARGIN_OPTIONS = [0, 5, 8, 12];
const DEFAULT_SETTINGS = {
  paper: 'a4',
  orientation: 'portrait',
  perPage: 1,
  margin: 8,
  cutLines: true,
};

const bn = (value) => String(value ?? '').replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[digit]);

const loadSettings = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
    const perPage = Number(saved.perPage);
    const margin = Number(saved.margin);
    return {
      paper: PAPER_SIZES[saved.paper] ? saved.paper : DEFAULT_SETTINGS.paper,
      orientation: ['portrait', 'landscape'].includes(saved.orientation)
        ? saved.orientation
        : DEFAULT_SETTINGS.orientation,
      perPage: PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_SETTINGS.perPage,
      margin: MARGIN_OPTIONS.includes(margin) ? margin : DEFAULT_SETTINGS.margin,
      cutLines:
        typeof saved.cutLines === 'boolean' ? saved.cutLines : DEFAULT_SETTINGS.cutLines,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

// Columns / rows of routines on one sheet
const getGrid = (perPage, orientation) => {
  if (perPage === 1) return { cols: 1, rows: 1 };
  if (perPage === 4) return { cols: 2, rows: 2 };
  return orientation === 'landscape'
    ? { cols: perPage, rows: 1 }
    : { cols: 1, rows: perPage };
};

// Printable sheet size in mm (page minus margins)
const getLayout = ({ paper, orientation, perPage, margin }) => {
  const size = PAPER_SIZES[paper];
  const landscape = orientation === 'landscape';
  const pageWidth = landscape ? size.height : size.width;
  const pageHeight = landscape ? size.width : size.height;
  return {
    // 1mm safety so the browser never adds an empty extra page
    sheetWidth: pageWidth - margin * 2,
    sheetHeight: pageHeight - margin * 2 - 1,
    ...getGrid(perPage, orientation),
  };
};

const buildCss = (settings) => {
  const { paper, orientation, perPage, margin } = settings;
  const { sheetWidth, sheetHeight, cols, rows } = getLayout(settings);

  return `
@page { size: ${paper} ${orientation}; margin: ${margin}mm; }

/* ---------- Screen layout: side panel + preview ---------- */
@media screen {
  #exam-routine-print-preview.erp-root {
    position: fixed !important; inset: 0 !important; z-index: 9999;
    display: flex !important; flex-direction: row !important;
    padding: 0 !important; margin: 0 !important;
    background: #e6eaf0 !important; overflow: hidden !important;
  }

  .erp-side {
    display: flex; flex-direction: column; flex-shrink: 0;
    width: 330px; max-width: 100%; box-sizing: border-box;
    background: #f6f8fb; border-right: 1px solid #dde3ec;
    color: #1f2937; font-family: inherit;
  }
  .erp-side__head {
    padding: 16px 16px 12px; background: #fff; border-bottom: 1px solid #e5e9f0;
  }
  .erp-side__title { margin: 0; font-size: 16px; font-weight: 700; color: #14532d; }
  .erp-side__sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
  .erp-side__body {
    flex: 1; min-height: 0; overflow-y: auto; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 14px;
  }
  .erp-card {
    background: #fff; border: 1px solid #e3e8ef; border-radius: 14px; padding: 14px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  }
  .erp-card__title { margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #374151; }
  .erp-card__title small { font-weight: 400; color: #9ca3af; }
  .erp-field + .erp-field { margin-top: 14px; }
  .erp-hint { margin: 8px 0 0; font-size: 11.5px; line-height: 1.5; color: #8791a1; }

  .erp-seg {
    display: grid; gap: 4px; padding: 4px;
    background: #eef1f6; border-radius: 12px;
  }
  .erp-seg__btn {
    height: 38px; padding: 0 6px; border: 1px solid transparent; border-radius: 9px;
    background: transparent; color: #6b7280; font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
  }
  .erp-seg__btn:hover { color: #14532d; background: rgba(255, 255, 255, 0.6); }
  .erp-seg__btn:focus-visible { outline: 2px solid #16a34a; outline-offset: 1px; }
  .erp-seg__btn.is-active {
    background: #fff; color: #0f7a55; border-color: #86e0b4;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.12);
  }

  .erp-switch-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .erp-switch-row__text { font-size: 13px; font-weight: 600; color: #374151; }
  .erp-switch-row__text small { display: block; margin-top: 2px; font-weight: 400; font-size: 11.5px; color: #8791a1; }
  .erp-switch {
    position: relative; flex-shrink: 0; width: 44px; height: 24px; padding: 0;
    border: 0; border-radius: 999px; background: #cbd2dc; cursor: pointer;
    transition: background 0.15s ease;
  }
  .erp-switch::after {
    content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
    border-radius: 50%; background: #fff; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    transition: transform 0.15s ease;
  }
  .erp-switch[aria-checked='true'] { background: #16a34a; }
  .erp-switch[aria-checked='true']::after { transform: translateX(20px); }
  .erp-switch:disabled { opacity: 0.45; cursor: not-allowed; }
  .erp-switch:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }

  .erp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .erp-stat { background: #f3f6fa; border-radius: 10px; padding: 8px 6px; text-align: center; }
  .erp-stat b { display: block; font-size: 16px; color: #0f7a55; }
  .erp-stat span { font-size: 11px; color: #6b7280; }

  .erp-side__foot {
    display: flex; flex-direction: column; gap: 8px; padding: 12px 16px 16px;
    background: #fff; border-top: 1px solid #e5e9f0;
  }
  .erp-btn {
    height: 42px; border-radius: 10px; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: all 0.15s ease;
  }
  .erp-btn--primary { border: 0; background: #0f7a55; color: #fff; }
  .erp-btn--primary:hover:not(:disabled) { background: #0b6244; }
  .erp-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .erp-btn--ghost { border: 1px solid #d5dbe5; background: #fff; color: #374151; }
  .erp-btn--ghost:hover { background: #f3f5f9; }
  .erp-btn:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }

  .erp-main { position: relative; flex: 1; min-width: 0; overflow: auto; }
  .erp-main .exam-routine-preview__status {
    margin: 24px auto; max-width: 520px; padding: 12px 16px; text-align: center;
    border-radius: 10px; background: #fff; color: #374151; font-size: 14px;
  }

  @media (max-width: 860px) {
    #exam-routine-print-preview.erp-root { flex-direction: column !important; }
    .erp-side { width: 100%; max-height: 48vh; border-right: 0; border-bottom: 1px solid #dde3ec; }
  }
}

/* ---------- Preview ---------- */
.erp-stage { width: 100%; box-sizing: border-box; padding: 16px 0 32px; }
.erp-zoom { position: relative; width: 100%; }
.erp-pages {
  position: absolute; top: 0; left: 50%;
  display: flex; flex-direction: column; gap: 16px;
  transform-origin: top center;
}
.erp-sheet {
  position: relative; box-sizing: border-box; flex-shrink: 0; background: #fff;
  width: ${sheetWidth}mm; height: ${sheetHeight}mm;
  display: grid;
  grid-template-columns: repeat(${cols}, minmax(0, 1fr));
  grid-template-rows: repeat(${rows}, minmax(0, 1fr));
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  break-after: page; page-break-after: always; break-inside: avoid;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}
.erp-sheet:last-child { break-after: auto; page-break-after: auto; }

.erp-cell {
  position: relative; box-sizing: border-box; min-width: 0; min-height: 0; overflow: hidden;
  --erp-pad: ${perPage > 1 ? `${CELL_PAD_MM}mm` : '0mm'};
}
.erp-cell--cut-r { border-right: 1px dashed #9a9a9a; }
.erp-cell--cut-b { border-bottom: 1px dashed #9a9a9a; }
.erp-cell__box { position: absolute; inset: var(--erp-pad); overflow: hidden; }

/* The routine is laid out at a fixed width, then scaled (transform) with one shared scale */
.erp-doc {
  position: absolute; top: 0; left: 0;
  width: ${DOC_WIDTH_MM}mm; transform-origin: 0 0;
}
/* Neutralise any fixed page size / margin / shadow of ExamRoutineDocument's root element */
.erp-doc > * {
  box-sizing: border-box;
  width: 100% !important; max-width: none !important;
  height: auto !important; min-height: 0 !important;
  margin: 0 !important; box-shadow: none !important;
}
/* Keep date / day / time on one line so every routine has the same height */
.erp-doc .routine-document__serial,
.erp-doc .routine-document__date,
.erp-doc .routine-document__day,
.erp-doc .routine-document__time,
.erp-doc .routine-document__time-range {
  white-space: nowrap !important;
}
.erp-doc .routine-document__time-range { flex-wrap: nowrap !important; }

/* ---------- Print ---------- */
@media print {
  body.exam-routine-print-active > *:not(#exam-routine-print-preview) { display: none !important; }
  body.exam-routine-print-active {
    margin: 0 !important; padding: 0 !important; overflow: visible !important; background: #fff !important;
  }
  #exam-routine-print-preview {
    position: static !important; inset: auto !important; display: block !important;
    height: auto !important; overflow: visible !important; background: #fff !important;
  }
  .erp-side,
  .exam-routine-preview__toolbar,
  .exam-routine-preview__status { display: none !important; }
  .erp-main { display: block !important; overflow: visible !important; height: auto !important; }
  .erp-stage { padding: 0 !important; }
  .erp-zoom { height: auto !important; }
  .erp-pages {
    position: static !important; display: block !important;
    width: auto !important; margin: 0 !important; transform: none !important;
  }
  .erp-sheet { box-shadow: none !important; margin: 0 !important; }
}`;
};

// A routine is printable if it has at least one visible row or a message
const hasVisibleRows = (details) => {
  const rows = Array.isArray(details?.routine) ? details.routine : [];
  return rows.some((row) => {
    const hidden = row.hidden === true || Number(row.hidden ?? row.IsHidden) === 1;
    return !hidden || String(row.message ?? row.Message ?? '').trim();
  });
};

const chunk = (list, size) => {
  const pages = [];
  for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size));
  return pages;
};

/** Pill-style option picker (replaces <select>) */
const SegmentedControl = ({ label, value, options, onChange }) => (
  <div
    className="erp-seg"
    role="radiogroup"
    aria-label={label}
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((option) => {
      const active = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={active}
          className={`erp-seg__btn${active ? ' is-active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

SegmentedControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
    })
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * One routine inside its cell. The scale/position are decided by the parent,
 * so every routine on every sheet is exactly the same size.
 */
const RoutineCell = ({ children, fit }) => (
  <div className="erp-cell__box">
    <div
      className="erp-doc"
      style={{
        transform: `translate(${fit.left}px, ${fit.top}px) scale(${fit.scale})`,
        visibility: fit.ready ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  </div>
);

RoutineCell.propTypes = {
  children: PropTypes.node.isRequired,
  fit: PropTypes.shape({
    ready: PropTypes.bool,
    scale: PropTypes.number,
    left: PropTypes.number,
    top: PropTypes.number,
  }).isRequired,
};

/** Scales the whole preview down to the available width (screen only, print is untouched) */
const ScaledPreview = ({ sheetPx, children }) => {
  const stageRef = useRef(null);
  const pagesRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pages = pagesRef.current;
    if (!stage || !pages) return undefined;

    const update = () => {
      const available = stage.clientWidth - 32;
      setZoom(available > 0 ? Math.min(1, available / sheetPx) : 1);
      setHeight(pages.offsetHeight);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    observer.observe(pages);
    return () => observer.disconnect();
  }, [sheetPx]);

  return (
    <div className="erp-stage" ref={stageRef}>
      <div className="erp-zoom" style={{ height: height === null ? undefined : height * zoom }}>
        <div
          className="erp-pages"
          ref={pagesRef}
          style={{
            width: sheetPx,
            marginLeft: -sheetPx / 2,
            transform: `scale(${zoom})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

ScaledPreview.propTypes = {
  sheetPx: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

const ExamRoutinePrint = ({ items, onClose }) => {
  const previewRef = useRef(null);
  const closeRef = useRef(null);
  const [settings, setSettings] = useState(loadSettings);
  const [results, setResults] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [readyToPrint, setReadyToPrint] = useState(false);
  // Height (px, at the fixed layout width) of the tallest routine
  const [tallestDoc, setTallestDoc] = useState(0);
  const [fetchRoutine] = useLazyGetAllExamRoutineQuery();
  const { data: institution, isLoading: loadingInstitution } = useGetInstitutionInfoQuery();

  const itemsKey = JSON.stringify(items);
  const loading = loadingRoutines || loadingInstitution;
  const validRoutines = results.filter((result) => result.details && hasVisibleRows(result.details));
  const failedCount = results.length - validRoutines.length;
  const pages = chunk(validRoutines, settings.perPage);
  const { cols, rows, sheetWidth, sheetHeight } = getLayout(settings);
  const sheetPx = sheetWidth * MM_TO_PX;
  const singleDetails = validRoutines.length === 1 ? validRoutines[0].details : null;
  const examName = singleDetails?.examName?.ExamName ?? '';
  const className = singleDetails?.classGroup?.SubClass ?? '';
  const multiPerPage = settings.perPage > 1;
  const showCutLines = multiPerPage && settings.cutLines;

  // One shared scale for every routine: fits the widest/tallest one, so all look identical
  const padPx = multiPerPage ? CELL_PAD_MM * MM_TO_PX : 0;
  const cellWidth = (sheetWidth * MM_TO_PX) / cols - padPx * 2 - 1;
  const cellHeight = (sheetHeight * MM_TO_PX) / rows - padPx * 2 - 1;
  const fit = (() => {
    if (!tallestDoc || cellWidth <= 0 || cellHeight <= 0) {
      return { ready: false, scale: 1, left: 0, top: 0 };
    }
    const scale = Math.min(cellWidth / DOC_WIDTH_PX, (cellHeight * HEIGHT_SAFETY) / tallestDoc);
    return {
      ready: true,
      scale,
      left: (cellWidth - DOC_WIDTH_PX * scale) / 2,
      top: multiPerPage ? (cellHeight - tallestDoc * scale) / 2 : 0,
    };
  })();

  const updateSetting = (key, value) => {
    setSettings((current) => {
      const next = { ...current, [key]: value };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const paperOptions = Object.entries(PAPER_SIZES).map(([value, { label }]) => ({ value, label }));
  const perPageOptions = PER_PAGE_OPTIONS.map((count) => ({ value: count, label: bn(count) }));
  const marginOptions = MARGIN_OPTIONS.map((value) => ({ value, label: bn(value) }));

  // Body class + focus handling
  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add('exam-routine-print-active');
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove('exam-routine-print-active');
      previousFocus?.focus();
    };
  }, []);

  // PDF file name = document title
  useEffect(() => {
    const previousTitle = document.title;
    document.title = singleDetails
      ? [examName, className, 'Exam Routine'].filter(Boolean).join(' - ')
      : 'Exam Routine';
    return () => { document.title = previousTitle; };
  }, [singleDetails, examName, className]);

  // Esc closes the preview
  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Load every selected routine
  useEffect(() => {
    let cancelled = false;
    setLoadingRoutines(true);
    setResults([]);
    const loadAll = async () => {
      const list = JSON.parse(itemsKey);
      const settled = await Promise.all(
        list.map(async (item) => {
          const key = `${item.sessionID}-${item.examID}-${item.subClassID}`;
          try {
            const details = await fetchRoutine(
              {
                sessionID: item.sessionID,
                examID: item.examID,
                subClassId: item.subClassID,
              },
              false
            ).unwrap();
            return { key, details };
          } catch {
            return { key, error: true };
          }
        })
      );
      if (!cancelled) {
        setResults(settled);
        setLoadingRoutines(false);
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, [itemsKey, fetchRoutine]);

  // Measure the tallest routine (re-measures when fonts / signature images change its height)
  useLayoutEffect(() => {
    const root = previewRef.current;
    if (!root || loading) return undefined;
    const docs = Array.from(root.querySelectorAll('.erp-doc'));
    if (docs.length === 0) {
      setTallestDoc(0);
      return undefined;
    }

    const measure = () => {
      const tallest = Math.max(
        ...docs.map((doc) => Math.max(doc.offsetHeight, doc.scrollHeight))
      );
      setTallestDoc((previous) => (Math.abs(previous - tallest) < 0.5 ? previous : tallest));
    };

    measure();
    const observer = new ResizeObserver(measure);
    docs.forEach((doc) => observer.observe(doc));
    return () => observer.disconnect();
  }, [loading, results, institution, settings.perPage]);

  // Wait for fonts + images before enabling the print button
  useEffect(() => {
    setReadyToPrint(false);
    if (loading || validRoutines.length === 0) return undefined;
    let cancelled = false;
    const preparePrint = async () => {
      await document.fonts.load('14px ExamRoutineBangla').catch(() => { });
      await document.fonts.ready;
      await Promise.all(
        Array.from(previewRef.current?.querySelectorAll('img') ?? []).map(
          (image) => image.decode().catch(() => { })
        )
      );
      if (!cancelled) setReadyToPrint(true);
    };
    preparePrint();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, results, institution]);

  return createPortal(
    <main
      ref={previewRef}
      id="exam-routine-print-preview"
      className="exam-routine-preview erp-root"
      role="dialog"
      aria-modal="true"
      aria-label="Exam routine print preview"
    >
      <style>{buildCss(settings)}</style>

      <aside className="erp-side" aria-label="প্রিন্ট সেটিং">
        <div className="erp-side__head">
          <h2 className="erp-side__title">প্রিন্ট সেটিং</h2>
          <p className="erp-side__sub">
            {PAPER_SIZES[settings.paper].label} ·{' '}
            {settings.orientation === 'portrait' ? 'Portrait' : 'Landscape'} · প্রতি পেজে {bn(settings.perPage)}টি
          </p>
        </div>

        <div className="erp-side__foot">

          <button
            ref={closeRef}
            type="button"
            className="erp-btn erp-btn--ghost inline-flex items-center justify-center gap-2"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            <span>ফিরে যান</span>
          </button>
        </div>
        <div className="erp-side__body">
          <section className="erp-card">
            <div className="erp-field">
              <h3 className="erp-card__title">১. পেজ দিক <small>(Orientation)</small></h3>
              <SegmentedControl
                label="Orientation"
                value={settings.orientation}
                onChange={(value) => updateSetting('orientation', value)}
                options={[
                  { value: 'portrait', label: 'Portrait' },
                  { value: 'landscape', label: 'Landscape' },
                ]}
              />
            </div>

            <div className="erp-field">
              <h3 className="erp-card__title">২. পেজ সাইজ <small>(Paper)</small></h3>
              <SegmentedControl
                label="Paper size"
                value={settings.paper}
                onChange={(value) => updateSetting('paper', value)}
                options={paperOptions}
              />
            </div>

            <div className="erp-field">
              <h3 className="erp-card__title">৩. প্রতি পেজে রুটিন <small>(Per page)</small></h3>
              <SegmentedControl
                label="Routines per page"
                value={settings.perPage}
                onChange={(value) => updateSetting('perPage', value)}
                options={perPageOptions}
              />
              <p className="erp-hint">
                {multiPerPage
                  ? `এক পেজে ${bn(cols)} কলাম × ${bn(rows)} সারিতে সাজানো হবে।`
                  : 'প্রতি পেজে একটি করে রুটিন ছাপা হবে।'}
              </p>
            </div>

            <div className="erp-field">
              <h3 className="erp-card__title">৪. মার্জিন <small>(মিমি)</small></h3>
              <SegmentedControl
                label="Margin in millimetres"
                value={settings.margin}
                onChange={(value) => updateSetting('margin', value)}
                options={marginOptions}
              />
              <p className="erp-hint">মার্জিন ০ দিলে কিছু প্রিন্টার কিনারা কেটে দিতে পারে।</p>
            </div>
          </section>

          <section className="erp-card">
            <div className="erp-switch-row">
              <div className="erp-switch-row__text">
                কাটার দাগ
                <small>
                  {multiPerPage
                    ? 'রুটিনের মাঝে ডটেড লাইন দেখাবে'
                    : 'একাধিক রুটিন প্রতি পেজে হলে কাজ করবে'}
                </small>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showCutLines}
                aria-label="Cut lines"
                className="erp-switch"
                disabled={!multiPerPage}
                onClick={() => updateSetting('cutLines', !settings.cutLines)}
              />
            </div>
          </section>

          <section className="erp-card">
            <div className="erp-stats">
              <div className="erp-stat"><b>{bn(validRoutines.length)}</b><span>রুটিন</span></div>
              <div className="erp-stat"><b>{bn(pages.length)}</b><span>পেজ</span></div>
              <div className="erp-stat">
                <b>{fit.ready ? `${bn(Math.round(fit.scale * 100))}%` : '—'}</b>
                <span>স্কেল</span>
              </div>
            </div>
            <p className="erp-hint">
              প্রিন্ট ডায়ালগে <b>Scale 100%</b> ও <b>Background graphics</b> চালু রাখুন, না হলে সারির রঙ উঠবে না।
            </p>
          </section>
        </div>
        <div className="erp-side__foot">
          <button
            type="button"
            className="erp-btn erp-btn--primary inline-flex items-center justify-center gap-2"
            onClick={() => window.print()}
            disabled={!readyToPrint}
          >
            <FaPrint size={16} aria-hidden="true" />
            <span>সব প্রিন্ট করুন</span>
          </button>

        </div>
      </aside>

      <section className="erp-main">
        {loading ? (
          <p className="exam-routine-preview__status" role="status">Preparing exam routine…</p>
        ) : validRoutines.length === 0 ? (
          <p className="exam-routine-preview__status" role="alert">
            The exam routine could not be loaded. Please close this preview and try again.
          </p>
        ) : (
          <>
            {failedCount > 0 && (
              <p className="exam-routine-preview__status" role="alert">
                {failedCount} routine(s) could not be loaded and are skipped.
              </p>
            )}
            <ScaledPreview sheetPx={sheetPx}>
              {pages.map((pageItems, pageIndex) => (
                <section className="erp-sheet" key={pageIndex}>
                  {pageItems.map((routine, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    const classes = ['erp-cell'];
                    if (showCutLines && col < cols - 1) classes.push('erp-cell--cut-r');
                    if (showCutLines && row < rows - 1) classes.push('erp-cell--cut-b');
                    return (
                      <div className={classes.join(' ')} key={routine.key}>
                        <RoutineCell fit={fit}>
                          <ExamRoutineDocument details={routine.details} institution={institution} />
                        </RoutineCell>
                      </div>
                    );
                  })}
                </section>
              ))}
            </ScaledPreview>
          </>
        )}
      </section>
    </main>,
    document.body
  );
};

ExamRoutinePrint.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      sessionID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      examID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      subClassID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ExamRoutinePrint;
