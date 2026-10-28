import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { useLazyGetAllExamRoutineQuery } from '../features/exam/examQuerySlice';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import ExamRoutineDocument from '../view/exam/ExamRouting/ExamRoutineDocument';
import './ExamRoutinePrint.css';
import { FaPrint } from 'react-icons/fa';

const STORAGE_KEY = 'examRoutinePrintSettings';
const FONT_STORAGE_KEY = 'examRoutinePrintFontScale';
const MM_TO_PX = 96 / 25.4;

// Base document width (A4 portrait minus 8mm margins)
const DOC_WIDTH_MM = 194;
const DOC_WIDTH_PX = DOC_WIDTH_MM * MM_TO_PX;

const CELL_PAD_MM = 2;
const HEIGHT_SAFETY = 0.98;

// Font size control (percent)
const FONT_MIN = 70;
const FONT_MAX = 120;
const FONT_STEP = 5;
const FONT_DEFAULT = 100;
const BASE_FONT_ATTR = 'data-erp-base-font';

const PAPER_SIZES = {
  a4: { label: 'A4', width: 210, height: 297 },
  a5: { label: 'A5', width: 148, height: 210 },
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

const clampFont = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return FONT_DEFAULT;
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(number / FONT_STEP) * FONT_STEP));
};

const loadFontScale = () => {
  try {
    const saved = window.localStorage.getItem(FONT_STORAGE_KEY);
    return saved === null ? FONT_DEFAULT : clampFont(saved);
  } catch {
    return FONT_DEFAULT;
  }
};

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
    color: #1f2937; font-family: inherit; overflow-y: auto;
  }
  .erp-side__head {
    padding: 16px 16px 12px; background: #fff; border-bottom: 1px solid #e5e9f0;
  }
  .erp-side__title { margin: 0; font-size: 16px; font-weight: 700; color: #14532d; }
  .erp-side__sub { margin: 2px 0 0; font-size: 12px; color: #6b7280; }
  .erp-side__body {
    flex: 1; min-height: 0; padding: 14px 16px;
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
  .erp-hint--tip { color: #0f7a55; font-weight: 600; }

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

  .erp-main-wrap { position: relative; display: flex; flex: 1; min-width: 0; min-height: 0; }
  .erp-main { position: relative; flex: 1; min-width: 0; overflow: auto; padding-bottom: 84px; }
  .erp-main .exam-routine-preview__status {
    margin: 24px auto; max-width: 520px; padding: 12px 16px; text-align: center;
    border-radius: 10px; background: #fff; color: #374151; font-size: 14px;
  }

  /* ---------- Floating font-size bar ---------- */
  .erp-fontbar {
    position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%);
    z-index: 30; display: flex; align-items: center; gap: 10px;
    max-width: calc(100% - 24px); padding: 8px 12px; box-sizing: border-box;
    background: #fff; border: 1px solid #e3e8ef; border-radius: 16px;
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.18);
    color: #1f2937; font-size: 14px; flex-wrap: wrap; justify-content: center;
  }
  .erp-fontbar__label {
    display: inline-flex; align-items: center; gap: 6px; font-weight: 600; white-space: nowrap;
  }
  .erp-fontbar__label i { font-style: normal; font-weight: 800; font-size: 17px; color: #0f7a55; font-family: Georgia, serif; }
  .erp-fontbar__step {
    min-width: 44px; height: 36px; padding: 0 10px; border: 1px solid #d5dbe5; border-radius: 10px;
    background: #fff; color: #374151; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.15s ease; white-space: nowrap;
  }
  .erp-fontbar__step:hover:not(:disabled) { background: #f3f5f9; border-color: #b8c1cf; }
  .erp-fontbar__step:disabled { opacity: 0.45; cursor: not-allowed; }
  .erp-fontbar__step:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }
  .erp-fontbar__range { width: 150px; accent-color: #0f7a55; cursor: pointer; }
  .erp-fontbar__value { min-width: 48px; text-align: center; font-weight: 700; color: #0f7a55; }
  .erp-fontbar__save {
    height: 36px; padding: 0 14px; border: 0; border-radius: 10px;
    background: #0f7a55; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer;
    transition: all 0.15s ease; white-space: nowrap;
  }
  .erp-fontbar__save:hover:not(:disabled) { background: #0b6244; }
  .erp-fontbar__save:disabled { background: #cfd6e0; color: #7b8494; cursor: default; }
  .erp-fontbar__save:focus-visible { outline: 2px solid #16a34a; outline-offset: 2px; }

  @media (max-width: 860px) {
    #exam-routine-print-preview.erp-root { flex-direction: column !important; }
    .erp-side { width: 100%; max-height: 48vh; border-right: 0; border-bottom: 1px solid #dde3ec; }
    .erp-fontbar__range { width: 110px; }
  }
}

/* ---------- Preview & Print ---------- */
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

/* Position wrapper (plain offsets, no scaling) */
.erp-pos { position: absolute; top: 0; left: 0; }

/*
  The routine is laid out at a computed width and shrunk with CSS "zoom".
  Unlike transform: scale(), zoom shrinks the real layout box too, so the
  browser's print fragmentation no longer cuts off the lower cells.
  The width is set inline (px) so the table always fills the whole cell.
*/
.erp-doc { box-sizing: border-box; }

/* Neutralise any fixed page size / margin / shadow of ExamRoutineDocument's root element */
.erp-doc > * {
  box-sizing: border-box;
  width: 100% !important; max-width: none !important;
  height: auto !important; min-height: 0 !important;
  margin: 0 !important; box-shadow: none !important;
  border-color: transparent !important; /* Removing unwanted borders */
}
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
  .erp-fontbar,
  .exam-routine-preview__toolbar,
  .exam-routine-preview__status { display: none !important; }
  .erp-main-wrap { display: block !important; position: static !important; overflow: visible !important; }
  .erp-main { display: block !important; overflow: visible !important; height: auto !important; padding: 0 !important; }
  .erp-stage { padding: 0 !important; }
  .erp-zoom { height: auto !important; }
  .erp-pages {
    position: static !important; display: block !important;
    width: auto !important; margin: 0 !important; transform: none !important;
  }
  .erp-sheet {
    box-shadow: none !important;
    margin: 0 !important;
    border: none !important;
  }
}`;
};

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

const applyFontScale = (root, percent) => {
  if (!root) return;
  root.querySelectorAll('.erp-doc *').forEach((element) => {
    let base = parseFloat(element.getAttribute(BASE_FONT_ATTR));
    if (!Number.isFinite(base)) {
      base = parseFloat(window.getComputedStyle(element).fontSize);
      if (!Number.isFinite(base) || base <= 0) return;
      element.setAttribute(BASE_FONT_ATTR, String(base));
    }
    if (percent === FONT_DEFAULT) {
      element.style.removeProperty('font-size');
    } else {
      element.style.setProperty('font-size', `${(base * percent / 100).toFixed(3)}px`, 'important');
    }
  });
};

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

const FontSizeBar = ({ value, saved, justSaved, onChange, onReset, onSave }) => {
  const dirty = value !== saved;
  return (
    <div className="erp-fontbar" role="group" aria-label="ফন্ট সাইজ">
      <span className="erp-fontbar__label">
        <i aria-hidden="true">Aa</i>
        ফন্ট সাইজ
      </span>
      <button
        type="button"
        className="erp-fontbar__step"
        onClick={() => onChange(value - FONT_STEP)}
        disabled={value <= FONT_MIN}
        aria-label="ফন্ট ছোট করুন"
      >
        A−
      </button>
      <input
        type="range"
        className="erp-fontbar__range"
        min={FONT_MIN}
        max={FONT_MAX}
        step={FONT_STEP}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="ফন্ট সাইজ স্লাইডার"
        aria-valuetext={`${value}%`}
      />
      <button
        type="button"
        className="erp-fontbar__step"
        onClick={() => onChange(value + FONT_STEP)}
        disabled={value >= FONT_MAX}
        aria-label="ফন্ট বড় করুন"
      >
        A+
      </button>
      <span className="erp-fontbar__value" aria-live="polite">{bn(value)}%</span>
      <button
        type="button"
        className="erp-fontbar__step"
        onClick={onReset}
        disabled={value === FONT_DEFAULT}
        title="১০০% এ ফিরে যান"
        aria-label="ফন্ট সাইজ রিসেট"
      >
        ↺
      </button>
      <button
        type="button"
        className="erp-fontbar__save"
        onClick={onSave}
        disabled={!dirty}
      >
        {justSaved && !dirty ? 'সংরক্ষিত ✓' : 'সংরক্ষণ'}
      </button>
    </div>
  );
};

FontSizeBar.propTypes = {
  value: PropTypes.number.isRequired,
  saved: PropTypes.number.isRequired,
  justSaved: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

/*
  Layout:  .erp-pos (absolute, left/top)  >  .erp-doc (width = docWidth px, zoom = scale)
  docWidth = cellWidth / scale, so after zoom the document is exactly as wide as the cell.
*/
const RoutineCell = ({ children, fit }) => (
  <div className="erp-cell__box">
    <div
      className="erp-pos"
      style={{
        left: `${fit.left}px`,
        top: `${fit.top}px`,
        visibility: fit.ready ? 'visible' : 'hidden',
      }}
    >
      <div
        className="erp-doc"
        style={{ width: `${fit.docWidth}px`, zoom: fit.scale }}
      >
        {children}
      </div>
    </div>
  </div>
);

RoutineCell.propTypes = {
  children: PropTypes.node.isRequired,
  fit: PropTypes.shape({
    ready: PropTypes.bool,
    scale: PropTypes.number,
    docWidth: PropTypes.number,
    left: PropTypes.number,
    top: PropTypes.number,
  }).isRequired,
};

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

// Remove everything fitInner() forced on the document, so it can be measured naturally
function resetInner(doc) {
  const root = doc.firstElementChild;
  if (!root) return;
  ['height', 'overflow', 'display', 'flex-direction'].forEach((prop) => root.style.removeProperty(prop));
  Array.from(root.children).forEach((child) => {
    child.style.removeProperty('zoom');
    child.style.removeProperty('flex-shrink');
  });
}

// Keep the document inside baseHeight (matters when the font size is increased)
function fitInner(doc, baseHeight) {
  const root = doc.firstElementChild;
  if (!root || !baseHeight) return;

  root.style.setProperty('height', `${baseHeight}px`, 'important');
  root.style.setProperty('overflow', 'hidden', 'important');
  root.style.setProperty('display', 'flex', 'important');
  root.style.setProperty('flex-direction', 'column', 'important');

  const children = Array.from(root.children);
  children.forEach((child) => {
    child.style.removeProperty('zoom');
    child.style.setProperty('flex-shrink', '0', 'important');
  });

  const styles = window.getComputedStyle(root);
  const padding = (parseFloat(styles.paddingTop) || 0) + (parseFloat(styles.paddingBottom) || 0);
  const border = (parseFloat(styles.borderTopWidth) || 0) + (parseFloat(styles.borderBottomWidth) || 0);
  const available = baseHeight - padding - border;
  const used = children.reduce((sum, child) => {
    const childStyles = window.getComputedStyle(child);
    const margin = (parseFloat(childStyles.marginTop) || 0) + (parseFloat(childStyles.marginBottom) || 0);
    return sum + child.offsetHeight + margin;
  }, 0);

  if (used > available && used > 0) {
    const ratio = Math.max(0.6, available / used);
    children.forEach((child) => child.style.setProperty('zoom', String(ratio)));
  }
}

const ExamRoutinePrint = ({ items, onClose }) => {
  const previewRef = useRef(null);
  const closeRef = useRef(null);
  const savedTimer = useRef(null);
  const [settings, setSettings] = useState(loadSettings);
  const [fontScale, setFontScale] = useState(loadFontScale);
  const [savedFontScale, setSavedFontScale] = useState(loadFontScale);
  const [justSaved, setJustSaved] = useState(false);
  const [results, setResults] = useState([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [readyToPrint, setReadyToPrint] = useState(false);
  const [baseHeight, setBaseHeight] = useState(0);
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
  const landscapeFour = settings.perPage === 4 && settings.orientation === 'landscape';

  const padPx = multiPerPage ? CELL_PAD_MM * MM_TO_PX : 0;
  const cellWidth = (sheetWidth * MM_TO_PX) / cols - padPx * 2 - 1;
  const cellHeight = (sheetHeight * MM_TO_PX) / rows - padPx * 2 - 1;

  const fit = (() => {
    if (!baseHeight || cellWidth <= 0 || cellHeight <= 0) {
      return { ready: false, scale: 1, docWidth: DOC_WIDTH_PX, left: 0, top: 0 };
    }
    // Scale is limited by whichever side is tighter
    const scale = Math.min(cellWidth / DOC_WIDTH_PX, (cellHeight * HEIGHT_SAFETY) / baseHeight);
    // When height is the limit, lay the document out WIDER so that after
    // scaling it still fills the full cell width (no empty side columns).
    const docWidth = Math.floor(cellWidth / scale);
    return {
      ready: true,
      scale,
      docWidth,
      left: 0,
      top: 0, // always start from the top of the cell
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

  const changeFont = (value) => {
    setJustSaved(false);
    setFontScale(clampFont(value));
  };

  const saveFont = () => {
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, String(fontScale));
    } catch {
      /* ignore */
    }
    setSavedFontScale(fontScale);
    setJustSaved(true);
    window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setJustSaved(false), 2000);
  };

  const paperOptions = Object.entries(PAPER_SIZES).map(([value, { label }]) => ({ value, label }));
  const perPageOptions = PER_PAGE_OPTIONS.map((count) => ({ value: count, label: bn(count) }));
  const marginOptions = MARGIN_OPTIONS.map((value) => ({ value, label: bn(value) }));

  useEffect(() => {
    const previousFocus = document.activeElement;
    document.body.classList.add('exam-routine-print-active');
    closeRef.current?.focus();
    return () => {
      document.body.classList.remove('exam-routine-print-active');
      window.clearTimeout(savedTimer.current);
      previousFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = singleDetails
      ? [examName, className, 'Exam Routine'].filter(Boolean).join(' - ')
      : 'Exam Routine';
    return () => { document.title = previousTitle; };
  }, [singleDetails, examName, className]);

  useEffect(() => {
    const handleEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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

  const fontScaleRef = useRef(fontScale);
  fontScaleRef.current = fontScale;

  // Measure the natural (unscaled, 100% font) height of the tallest routine
  useLayoutEffect(() => {
    const root = previewRef.current;
    if (!root || loading) return undefined;
    const docs = Array.from(root.querySelectorAll('.erp-doc'));
    if (docs.length === 0) {
      setBaseHeight(0);
      return undefined;
    }

    const measure = () => {
      // Temporarily undo zoom + custom width so we measure at the natural base size
      const saved = docs.map((doc) => ({ zoom: doc.style.zoom, width: doc.style.width }));
      docs.forEach((doc) => {
        doc.style.zoom = '1';
        doc.style.width = `${DOC_WIDTH_PX}px`;
        resetInner(doc);
      });

      applyFontScale(root, FONT_DEFAULT);
      const tallest = Math.max(
        ...docs.map((doc) => Math.max(doc.offsetHeight, doc.scrollHeight))
      );
      applyFontScale(root, fontScaleRef.current);

      docs.forEach((doc, index) => {
        fitInner(doc, tallest);
        doc.style.zoom = saved[index].zoom;
        doc.style.width = saved[index].width;
      });

      setBaseHeight((previous) => (Math.abs(previous - tallest) < 0.5 ? previous : tallest));
    };

    measure();
    const observer = new ResizeObserver(() => {
      if (fontScaleRef.current === FONT_DEFAULT) measure();
    });
    docs.forEach((doc) => observer.observe(doc));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, results, institution, settings.perPage, settings.paper, settings.orientation]);

  // Re-apply font scale + inner fitting after every render (zoom is lifted while measuring)
  useLayoutEffect(() => {
    const root = previewRef.current;
    if (!root || !fit.ready) return;
    applyFontScale(root, fontScale);
    root.querySelectorAll('.erp-doc').forEach((doc) => {
      const currentZoom = doc.style.zoom;
      doc.style.zoom = '1';
      fitInner(doc, baseHeight);
      doc.style.zoom = currentZoom;
    });
  });

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
              {landscapeFour && (
                <p className="erp-hint erp-hint--tip">
                  টিপস: ৪টি রুটিনের জন্য Portrait দিলে সবচেয়ে বেশি জায়গা কাজে লাগে।
                </p>
              )}
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

      <div className="erp-main-wrap">
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

        {!loading && validRoutines.length > 0 && (
          <FontSizeBar
            value={fontScale}
            saved={savedFontScale}
            justSaved={justSaved}
            onChange={changeFont}
            onReset={() => changeFont(FONT_DEFAULT)}
            onSave={saveFont}
          />
        )}
      </div>
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
