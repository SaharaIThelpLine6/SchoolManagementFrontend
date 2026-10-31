import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { skipToken } from '@reduxjs/toolkit/query';

import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';

import { setPageName } from '../features/auth/authSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/student/studentQuerySlice';
import {
  useGetStudentAdmitCardsQuery,
  useGetAdmitCardSettingsQuery,
  useSaveAdmitCardSettingsMutation,
  useGetExamRoutineCardQuery,
  useGetAdmitCardTemplatesQuery,
  useUploadAdmitCardTemplateMutation,
  useDeleteAdmitCardTemplateMutation,
  useUpdateAdmitCardTemplateMutation,
} from '../features/exam/examQuerySlice';
import {
  useGetInstitutionInfoQuery,
  useGetResidentialQuery,
} from '../features/settings/settingsQuerySlice';

import AdmitCardGenerate, { AdmitCardFace } from '../components/AdmitCardGenerate';
import AdmitCardRoutinegenerate, { RoutineCardFace } from '../components/AdmitCardRoutinegenerate';
import AdmitTemplateUpload from '../components/Admittemplateupload';
import {
  ADMIT_FIELDS,
  ADMIT_LANGS,
  ADMIT_TEMPLATES,
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_FIELDS,
  DEFAULT_ADMIT_LANG,
  DEFAULT_ADMIT_MODE,
  ADMIT_MODES,
  MAX_FIELD_SELECT,
  PLAIN_LAYOUT_ORDER,
  getAdmitDir,
  getFieldDemo,
  getFieldName,
  getFieldValue,
  getInstituteAddress,
  getInstituteName,
  getLayoutLabel,
  getTemplate,
  getUIText,
  isFieldAllowedForTemplate,
  isRoutineMode,
  normalizeAdmitRow,
  resolveFieldLabels,
  toLangDigit,
} from '../Data/admitCardConfig';
import {
  DEFAULT_ROUTINE_COLUMNS,
  ROUTINE_CARD_H,
  ROUTINE_CARD_W,
  ROUTINE_COLUMNS,
  ROUTINE_CARD_TEMPLATES,
  ROUTINE_COLOR_PRESETS,
  ROUTINE_LAYOUTS,
  buildHallGrid,
  formatSeatLine,
  getRoutineColumnLabel,
  getRoutineDemoRows,
  getRoutineLayoutLabel,
  getRoutineTemplate,
  getRoutineUIText,
  mapAllocatedSeats,
  normalizeRoutineRows,
} from '../Data/admitCardRoutineconfig';
import {
  buildUploadedTemplates,
  formatBytes,
  formatSize,
  getUploadSpec,
  getUploadUIText,
  isUploadedTemplateId,
} from '../Data/Admitcarduploadconfig';

const PAGE_SIZE = 10;
const API_URL = import.meta.env.VITE_SERVER_URL;

const buildAssetUrl = (value) => {
  const raw = value == null ? '' : String(value).trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = String(API_URL || '').replace(/\/+$/, '');
  return `${base}/public/${raw.replace(/^\/+/, '')}`;
};

const EXTRA_UI = {
  bn: {
    sizeBox: 'লেখার মাপ',
    sizeHint: 'তথ্য, দুই স্বাক্ষর ও QR — চারটাই একসাথে',
    seatBox: 'আসনের পট্টি উপর-নিচ',
    seatHint: 'মাইনাস = উপরে, প্লাস = নিচে',
    seatOffNote: '"কার্ডে আসন দেখাও" চালু থাকলেই কাজ করবে।',
    signBox: 'স্বাক্ষর উপর-নিচ',
    signHint: 'দুই পাশের স্বাক্ষর, নাম ও তারিখ একসাথে',
    qrBox: 'QR কোড উপর-নিচ',
    qrHint: 'মাঝ বরাবরই থাকে, শুধু উপরে-নিচে সরে',
    auto: 'স্বয়ংক্রিয়',
    tplDefault: 'ডিফল্ট',
    tplCustom: 'নিজের',
    noCustom: 'নিজের কোনো ডিজাইন আপলোড করা হয়নি।',
    printFullNote:
      'এই ডিজাইনে "ছাপা কাগজের উপর ছাপা" নেই — পুরো কার্ডটাই ছাপা হবে, কিছুই বাদ যাবে না।',
  },
  en: {
    sizeBox: 'Content size',
    sizeHint: 'Fields, both signatures & QR — all together',
    seatBox: 'Seat line up/down',
    seatHint: 'Minus = up, plus = down',
    seatOffNote: 'Works only when "Show seat on card" is on.',
    signBox: 'Signature up/down',
    signHint: 'Both signatures, names & dates together',
    qrBox: 'QR code up/down',
    qrHint: 'Stays centred, moves up or down only',
    auto: 'Auto',
    tplDefault: 'Default',
    tplCustom: 'Custom',
    noCustom: 'No custom design uploaded yet.',
    printFullNote:
      'This design is not an overprint design — the whole card is printed, nothing is left out.',
  },
  ar: {
    sizeBox: 'حجم المحتوى',
    sizeHint: 'الحقول والتوقيعان ورمز QR معًا',
    seatBox: 'موضع شريط المقعد',
    seatHint: 'سالب = للأعلى، موجب = للأسفل',
    seatOffNote: 'يعمل فقط عند تفعيل "إظهار المقعد على البطاقة".',
    signBox: 'موضع التوقيع',
    signHint: 'التوقيعان والاسمان والتاريخ معًا',
    qrBox: 'موضع رمز QR',
    qrHint: 'يبقى في الوسط، يتحرك للأعلى أو الأسفل',
    auto: 'تلقائي',
    tplDefault: 'افتراضي',
    tplCustom: 'مخصص',
    noCustom: 'لم يتم رفع أي تصميم مخصص.',
    printFullNote:
      'هذا التصميم ليس طباعة فوق ورق مطبوع — تُطبع البطاقة كاملة ولا يُحذف شيء.',
  },
};

const ZOOM_MIN = 70;
const ZOOM_MAX = 140;
const ZOOM_STEP = 5;
const SEAT_OFF_MIN = -60;
const SEAT_OFF_MAX = 60;

const SliderControl = ({
  label,
  hint,
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100,
  suffix = '',
  resetTo = 0,
  resetLabel,
  trailing = null,
}) => {
  const num = Number(value) || 0;
  const pct = Math.min(100, Math.max(0, ((num - min) / (max - min)) * 100));
  const atDefault = num === resetTo;
  const THUMB = 16;
  const fill = `calc(${pct}% + ${(THUMB / 2 - (pct * THUMB) / 100).toFixed(2)}px)`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 min-w-0 shadow-sm transition hover:border-indigo-200">
      <div className="flex items-baseline justify-between gap-2 min-w-0 mb-2">
        <p className="text-[13px] font-bold text-gray-700 truncate">{label}</p>
        {hint ? (
          <p className="text-[11px] text-gray-400 truncate shrink-0">{hint}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3" dir="ltr">
        <input
          type="range"
          className="admit-range min-w-0 flex-1"
          min={min}
          max={max}
          step={step}
          value={num}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${fill}, #e5e7eb ${fill}, #e5e7eb 100%)`,
          }}
        />

        <span className="w-[54px] shrink-0 text-right text-[14px] font-bold text-indigo-700">
          {num}
          {suffix}
        </span>

        <button
          type="button"
          onClick={() => onChange(resetTo)}
          disabled={atDefault}
          className="shrink-0 text-[12px] font-semibold text-indigo-600 hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          {resetLabel}
        </button>

        {trailing}
      </div>
    </div>
  );
};

const RANGE_CSS = `
  .admit-range {
    -webkit-appearance: none;
    appearance: none;
    height: 6px;
    border-radius: 999px;
    outline: none;
    cursor: pointer;
  }
  .admit-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4F46E5;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
    cursor: pointer;
  }
  .admit-range::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4F46E5;
    border: 2px solid #ffffff;
    box-shadow: 0 1px 3px rgba(0,0,0,.3);
    cursor: pointer;
  }
  .admit-range::-moz-range-track { background: transparent; }
`;

const PRINT_READY_TIMEOUT = 4000;

const waitForImage = (img) =>
  img.complete
    ? Promise.resolve()
    : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });

const waitForPrintReady = async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const ready = (async () => {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {}
    const images = Array.from(document.querySelectorAll('.admit-print-root img'));
    await Promise.all(images.map(waitForImage));
  })();
  await Promise.race([
    ready,
    new Promise((resolve) => setTimeout(resolve, PRINT_READY_TIMEOUT)),
  ]);
};

const Spinner = ({ size = 24, stroke = 3, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={stroke} opacity="0.2" />
    <path
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
    />
  </svg>
);

const Modal = ({
  open,
  title,
  onClose,
  dir,
  width = 'max-w-5xl',
  zIndex = 'z-50',
  disableEsc = false,
  children,
  footer,
}) => {
  useEffect(() => {
    if (!open || disableEsc) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, disableEsc, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${zIndex} flex items-start justify-center bg-black/50 p-4 overflow-y-auto hidden_in_print`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl w-full ${width} my-6 flex flex-col max-h-[90vh] overflow-hidden shadow-2xl`}
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h3 className="text-[18px] font-bold">{title}</h3>
          <button
            type="button"
            className="text-[26px] leading-none text-gray-500 hover:text-gray-800"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-4 sm:px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 shrink-0">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const PrintIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="7" rx="1" />
  </svg>
);

const TemplateStrip = ({
  templates = [],
  activeId,
  onPick,
  renderThumb,
  filter,
  onFilter,
  labels,
  dir = 'ltr',
}) => {
  const trackRef = useRef(null);
  const scrollBy = (step) =>
    trackRef.current?.scrollBy({ left: step * 240, behavior: 'smooth' });

  const arrow =
    'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-[16px] leading-none text-gray-600 shadow-sm hover:bg-gray-100 transition';

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div
          className="flex shrink-0 self-start overflow-hidden rounded-lg border border-gray-300 bg-white sm:self-auto"
          dir={dir}
        >
          {[
            { id: 'default', label: labels.default },
            { id: 'custom', label: labels.custom },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilter(f.id)}
              className={`px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition ${
                filter === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${arrow} hidden sm:flex`}
          onClick={() => scrollBy(-1)}
          aria-label="<"
        >
          ‹
        </button>

        <div
          ref={trackRef}
          className="flex min-w-0 flex-1 items-stretch gap-2 overflow-x-auto overscroll-x-contain pb-1"
          dir="ltr"
        >
          {templates.length ? (
            templates.map((tpl) => {
              const on = String(activeId) === String(tpl.id);
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => onPick(tpl)}
                  title={tpl.title}
                  className={`w-[88px] shrink-0 rounded-lg border-2 bg-white p-1 transition sm:w-[104px] ${
                    on
                      ? 'border-indigo-600 shadow-sm'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-center overflow-hidden rounded border border-gray-100 bg-white">
                    {renderThumb(tpl)}
                  </div>
                  <p className="mt-1 truncate text-center text-[11px] font-medium text-gray-700">
                    {tpl.title}
                  </p>
                </button>
              );
            })
          ) : (
            <p className="px-3 py-5 text-[12px] text-gray-500">{labels.empty}</p>
          )}
        </div>

        <button
          type="button"
          className={`${arrow} hidden sm:flex`}
          onClick={() => scrollBy(1)}
          aria-label=">"
        >
          ›
        </button>
      </div>
    </div>
  );
};

const ExamAdmitCard = ({ pageTitle = 'Exam Admit Card' }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { watch, register, handleSubmit, setValue, getValues } = methods;

  const [selectedTemplate, setSelectedTemplate] = useState(ADMIT_TEMPLATES[0]?.id ?? null);
  const [checkboxState, setCheckboxState] = useState(DEFAULT_ADMIT_FIELDS);
  const [selectedRows, setSelectedRows] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [printOnly, setPrintOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [simPrint, setSimPrint] = useState(false);
  const [tplFilter, setTplFilter] = useState('default');
  const [admitMode, setAdmitMode] = useState(DEFAULT_ADMIT_MODE);
  const [routeTemplate, setRouteTemplate] = useState(ROUTINE_CARD_TEMPLATES[0]?.id ?? 'r1');
  const [routineColor, setRoutineColor] = useState('');
  const [routineColumns, setRoutineColumns] = useState(DEFAULT_ROUTINE_COLUMNS);
  const [seatEnabled, setSeatEnabled] = useState(true);

  const [contentZoom, setContentZoom] = useState(100);
  const [seatOffsetY, setSeatOffsetY] = useState(0);
  const [signOffsetY, setSignOffsetY] = useState(0);
  const [qrOffsetY, setQrOffsetY] = useState(0);

  const [lang, setLang] = useState(DEFAULT_ADMIT_LANG);
  const ui = (key) => getUIText(key, lang);
  const rui = (key) => getRoutineUIText(key, lang);
  const uui = (key) => getUploadUIText(key, lang);
  const xui = (key) => EXTRA_UI[lang]?.[key] ?? EXTRA_UI.bn[key];
  const uiDir = getAdmitDir(lang);

  const [qrEnabled, setQrEnabled] = useState(true);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [najemSign, setNajemSign] = useState(true);
  const [najemSignName, setNajemSignName] = useState(true);
  const [najemSignDate, setNajemSignDate] = useState(true);
  const [principalSign, setPrincipalSign] = useState(true);
  const [principalSignName, setPrincipalSignName] = useState(true);
  const [principalSignDate, setPrincipalSignDate] = useState(true);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const { data: savedSettings } = useGetAdmitCardSettingsQuery();
  const [saveAdmitCardSettings, { isLoading: isSaving }] = useSaveAdmitCardSettingsMutation();

  const { data: uploadedData } = useGetAdmitCardTemplatesQuery();
  const [uploadAdmitCardTemplate] = useUploadAdmitCardTemplateMutation();
  const [deleteAdmitCardTemplate] = useDeleteAdmitCardTemplateMutation();
  const [updateAdmitCardTemplate] = useUpdateAdmitCardTemplateMutation();

  const instName = getInstituteName(institutionInfo, lang);
  const instAddress = getInstituteAddress(institutionInfo, lang);

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const SubClassID = watch('SubClassID');
  const UserCode = watch('UserCode');
  const RDID = watch('RDID');
  const reportType = watch('ReportID');

  const zoomFactor = (Number(contentZoom) || 100) / 100;
  const uploadedList = uploadedData?.templates;

  const customAdmitTemplates = useMemo(() => buildUploadedTemplates(uploadedList, 'A5', API_URL), [uploadedList]);
  const customRoutineTemplates = useMemo(() => buildUploadedTemplates(uploadedList, 'A4', API_URL), [uploadedList]);

  const admitTemplateList = useMemo(() => [...ADMIT_TEMPLATES, ...customAdmitTemplates], [customAdmitTemplates]);
  const routineTemplateList = useMemo(() => [...ROUTINE_CARD_TEMPLATES, ...customRoutineTemplates], [customRoutineTemplates]);

  const routineOn = isRoutineMode(admitMode);

  const plainTemplate = useMemo(
    () => admitTemplateList.find((t) => String(t.id) === String(selectedTemplate)) || getTemplate(selectedTemplate),
    [admitTemplateList, selectedTemplate]
  );
  const routeTpl = useMemo(
    () => routineTemplateList.find((t) => String(t.id) === String(routeTemplate)) || getRoutineTemplate(routeTemplate),
    [routineTemplateList, routeTemplate]
  );

  const template = routineOn ? routeTpl : plainTemplate;
  const overlayOn = Boolean(template?.overlay);
  const showPrintSwitch = routineOn || overlayOn;
  const printSim = showPrintSwitch && simPrint;

  useEffect(() => {
    if (!showPrintSwitch && simPrint) setSimPrint(false);
  }, [showPrintSwitch, simPrint]);

  const activeTemplateId = routineOn ? routeTemplate : selectedTemplate;

  const stripTemplates = useMemo(() => {
    const list = routineOn ? routineTemplateList : admitTemplateList;
    return tplFilter === 'custom'
      ? list.filter((t) => t.uploaded)
      : list.filter((t) => !t.uploaded);
  }, [routineOn, routineTemplateList, admitTemplateList, tplFilter]);

  const nameSize = watch(`institute_name_size_${activeTemplateId}`);
  const nameColor = watch(`institute_name_color_${activeTemplateId}`);
  const addressSize = watch(`institute_address_size_${activeTemplateId}`);
  const addressColor = watch(`institute_address_color_${activeTemplateId}`);
  const examSize = watch(`exam_name_size_${activeTemplateId}`);
  const examColor = watch(`exam_name_color_${activeTemplateId}`);

  const filterReady = Boolean(SessionID && ExamID && SubClassID && RDID);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const { data: studentAdmitCards, isFetching } = useGetStudentAdmitCardsQuery(
    filterReady
      ? UserCode?.trim()
        ? { SessionID, ExamID, SubClassID, RDID, UserCode }
        : { SessionID, ExamID, SubClassID, RDID }
      : skipToken
  );

  const studentList = useMemo(() => {
    const raw = Array.isArray(studentAdmitCards)
      ? studentAdmitCards
      : studentAdmitCards?.data ?? [];
    return raw.map(normalizeAdmitRow);
  }, [studentAdmitCards]);

  const watermarkLogo = useMemo(
    () => buildAssetUrl(studentAdmitCards?.documentLogo),
    [studentAdmitCards]
  );

  const { data: routineData, isFetching: routineFetching } = useGetExamRoutineCardQuery(
    SessionID && ExamID && SubClassID
      ? { SessionID, ExamID, SubClassID }
      : skipToken
  );

  const routineRows = useMemo(() => normalizeRoutineRows(routineData), [routineData]);
  const hallGrid = useMemo(() => buildHallGrid(routineData || {}), [routineData]);

  const hallSeats = useMemo(
    () => mapAllocatedSeats(studentList, routineData),
    [studentList, routineData]
  );

  const seatTexts = useMemo(() => {
    const out = new Map();
    const words = {
      hall: getRoutineUIText('hall', lang),
      column: getRoutineUIText('column', lang),
      row: getRoutineUIText('row', lang),
      seat: getRoutineUIText('seat', lang),
    };
    const none = getRoutineUIText('noSeatPlan', lang);

    studentList.forEach((s) => {
      const key = String(s.AdmissionID ?? s.UserID ?? s.StudentCode);
      const seat = hallSeats.get(key);
      out.set(key, seat ? formatSeatLine(seat, lang, words) : none);
    });

    return out;
  }, [studentList, hallSeats, lang]);

  const previewRoutine = routineRows.length ? routineRows : getRoutineDemoRows(lang);
  const previewSeat = hallSeats.values().next().value || null;

  const previewSeatText = useMemo(
    () =>
      previewSeat
        ? formatSeatLine(previewSeat, lang, {
            hall: getRoutineUIText('hall', lang),
            column: getRoutineUIText('column', lang),
            row: getRoutineUIText('row', lang),
            seat: getRoutineUIText('seat', lang),
          })
        : getRoutineUIText('noSeatPlan', lang),
    [previewSeat, lang]
  );

  const fieldLabels = useMemo(
    () => resolveFieldLabels(studentAdmitCards?.labels, { lang }),
    [studentAdmitCards, lang]
  );

  const hydratedRef = useRef(false);
  const savedLabelsRef = useRef(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    const setup = savedSettings?.setup;
    if (!setup) return;

    hydratedRef.current = true;

    if (setup.templateId) setSelectedTemplate(setup.templateId);
    if (setup.lang) setLang(setup.lang);
    if (Array.isArray(setup.fields) && setup.fields.length) {
      setCheckboxState(setup.fields);
    }

    const t = setup.toggles || {};
    if (t.qr !== undefined) setQrEnabled(t.qr);
    if (t.watermark !== undefined) setWatermarkEnabled(t.watermark);
    if (t.photo !== undefined) setPhotoEnabled(t.photo);
    if (t.sign !== undefined) {
      setNajemSign(t.sign);
      setPrincipalSign(t.sign);
    }
    if (t.signName !== undefined) {
      setNajemSignName(t.signName);
      setPrincipalSignName(t.signName);
    }
    if (t.signDate !== undefined) {
      setNajemSignDate(t.signDate);
      setPrincipalSignDate(t.signDate);
    }
    if (t.najemSign !== undefined) setNajemSign(t.najemSign);
    if (t.principalSign !== undefined) setPrincipalSign(t.principalSign);
    if (t.najemSignName !== undefined) setNajemSignName(t.najemSignName);
    if (t.principalSignName !== undefined) setPrincipalSignName(t.principalSignName);
    if (t.najemSignDate !== undefined) setNajemSignDate(t.najemSignDate);
    if (t.principalSignDate !== undefined) setPrincipalSignDate(t.principalSignDate);

    if (setup.contentZoom !== undefined && setup.contentZoom !== null) {
      setContentZoom(Number(setup.contentZoom) || 100);
    }
    if (setup.seatOffsetY !== undefined && setup.seatOffsetY !== null) {
      setSeatOffsetY(Number(setup.seatOffsetY) || 0);
    }
    if (setup.signOffsetY !== undefined && setup.signOffsetY !== null) {
      setSignOffsetY(Number(setup.signOffsetY) || 0);
    }
    if (setup.qrOffsetY !== undefined && setup.qrOffsetY !== null) {
      setQrOffsetY(Number(setup.qrOffsetY) || 0);
    }

    if (setup.najemName !== undefined) setValue('najem_name_text', setup.najemName || '');
    if (setup.principalName !== undefined) setValue('principal_name_text', setup.principalName || '');

    const r = setup.routing || {};
    if (r.mode) {
      setAdmitMode(r.mode === ADMIT_MODES.ROUTINE ? ADMIT_MODES.ROUTINE : ADMIT_MODES.PLAIN);
    } else if (r.templateId) {
      setAdmitMode(ADMIT_MODES.ROUTINE);
    }
    if (r.templateId) setRouteTemplate(r.templateId);
    if (r.color !== undefined && r.color !== null) setRoutineColor(String(r.color));
    if (Array.isArray(r.columns) && r.columns.length) setRoutineColumns(r.columns);
    if (r.seat !== undefined) setSeatEnabled(Boolean(r.seat));

    if (setup.reportType) setValue('ReportID', setup.reportType);

    const tplId = setup.templateId || selectedTemplate;
    if (setup.nameSize) setValue(`institute_name_size_${tplId}`, setup.nameSize);
    if (setup.nameColor) setValue(`institute_name_color_${tplId}`, setup.nameColor);
    if (setup.addressSize) setValue(`institute_address_size_${tplId}`, setup.addressSize);
    if (setup.addressColor) setValue(`institute_address_color_${tplId}`, setup.addressColor);
    if (setup.examNameSize) setValue(`exam_name_size_${tplId}`, setup.examNameSize);
    if (setup.examNameColor) setValue(`exam_name_color_${tplId}`, setup.examNameColor);

    savedLabelsRef.current = setup.labels || null;
  }, [savedSettings, setValue, selectedTemplate]);

  useEffect(() => {
    if (!institutionInfo) return;
    const cur = getValues();
    if (!cur.najem_name_text && institutionInfo.NajemName) {
      setValue('najem_name_text', institutionInfo.NajemName);
    }
    if (!cur.principal_name_text && institutionInfo.PrincipalName) {
      setValue('principal_name_text', institutionInfo.PrincipalName);
    }
  }, [institutionInfo, setValue, getValues]);

  useEffect(() => {
    const saved = savedLabelsRef.current;
    ADMIT_FIELDS.forEach((f) => {
      const existing = getValues(`fieldkey_${f.id}`);
      if (!existing || !String(existing).trim()) {
        setValue(`fieldkey_${f.id}`, saved?.[f.id] || fieldLabels[f.id]);
      }
    });
  }, [fieldLabels, setValue, getValues]);

  useEffect(() => {
    setSelectedRows([]);
    setCurrentPage(1);
    setPrintData(null);
  }, [SessionID, ExamID, SubClassID, RDID, UserCode]);

  useEffect(() => {
    setSelectedRows((prev) =>
      prev.length === studentList.length &&
      prev.every((row, i) => row === studentList[i])
        ? prev
        : studentList
    );
  }, [studentList]);

  useEffect(() => {
    setPrintData(null);
  }, [
    selectedTemplate, checkboxState, reportType, lang, qrEnabled, watermarkEnabled, photoEnabled,
    najemSign, najemSignName, najemSignDate, principalSign, principalSignName, principalSignDate,
    contentZoom, seatOffsetY, signOffsetY, qrOffsetY, admitMode, routeTemplate, routineColor,
    routineColumns, seatEnabled,
  ]);

  const totalPages = Math.ceil(studentList.length / PAGE_SIZE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentList.slice(start, start + PAGE_SIZE);
  }, [studentList, currentPage]);

  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    if (!isUploadedTemplateId(id)) {
      setCheckboxState((prev) => prev.filter((f) => isFieldAllowedForTemplate(f, id)));
    }
  };

  const [editTemplate, setEditTemplate] = useState(null);

  const openTemplateEditor = (tpl) => {
    const rec = (uploadedList || []).find((r) => String(r.id) === String(tpl.uploadId));
    if (!rec) return;
    setEditTemplate(rec);
    setShowUploadModal(true);
  };

  const handleSaveOffsets = async (id, offsets) => {
    await updateAdmitCardTemplate({ id, offsets }).unwrap();
    Swal.fire({
      icon: 'success',
      title: uui('saveOk'),
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleUploadTemplate = async (formData) => {
    const res = await uploadAdmitCardTemplate(formData).unwrap();
    const fresh = res?.template;
    if (fresh?.id) {
      const id = `u_${fresh.id}`;
      if (String(fresh.mode) === 'A4') setRouteTemplate(id);
      else setSelectedTemplate(id);
    }
    Swal.fire({
      icon: 'success',
      title: uui('uploadOk'),
      timer: 1600,
      showConfirmButton: false,
    });
  };

  const handleDeleteTemplate = async (tpl) => {
    const ok = await Swal.fire({
      icon: 'warning',
      title: uui('deleteAsk'),
      text: uui('deleteNote'),
      showCancelButton: true,
      confirmButtonText: uui('delete'),
      cancelButtonText: ui('cancel'),
      confirmButtonColor: '#dc2626',
    });

    if (!ok.isConfirmed) return;

    try {
      await deleteAdmitCardTemplate(tpl.uploadId).unwrap();
      if (String(tpl.mode) === 'A4') {
        if (String(routeTemplate) === String(tpl.id)) {
          setRouteTemplate(ROUTINE_CARD_TEMPLATES[0]?.id ?? 'r1');
        }
      } else if (String(selectedTemplate) === String(tpl.id)) {
        setSelectedTemplate(ADMIT_TEMPLATES[0]?.id ?? null);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: uui('errUpload'),
        text: err?.data?.error || '',
      });
    }
  };

  const handleFieldToggle = (fieldId, checked) => {
    setCheckboxState((prev) =>
      checked
        ? prev.includes(fieldId) ? prev : [...prev, fieldId]
        : prev.filter((f) => f !== fieldId)
    );
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? studentList : []);
  };

  const handleRowSelect = (e, student) => {
    setSelectedRows((prev) =>
      e.target.checked
        ? prev.some((r) => r.AdmissionID === student.AdmissionID) ? prev : [...prev, student]
        : prev.filter((r) => r.AdmissionID !== student.AdmissionID)
    );
  };

  const buildPrintRows = (formData) =>
    selectedRows.map((row) => {
      const newRow = { ...row };
      checkboxState.forEach((key) => {
        const typed = formData[`fieldkey_${key}`];
        newRow[`fieldkey_${key}`] =
          typed && String(typed).trim() ? String(typed).trim() : fieldLabels[key] || key;
      });
      newRow.institute_name = instName;
      newRow.institute_address = instAddress;
      newRow.admit_name_color = nameColor || template.nameColor;
      newRow.admit_name_size = nameSize || template.nameSize;
      newRow.admit_address_color = addressColor || template.addressColor;
      newRow.admit_address_size = addressSize || template.addressSize;
      newRow.admit_exam_color = examColor || template.examNameColor || template.labelColor;
      newRow.admit_exam_size = examSize || template.examNameSize || 13;
      newRow.SignatureNajem = row.SignatureNajem || institutionInfo?.SignatureNajem;
      newRow.SignaturePrincipal = row.SignaturePrincipal || institutionInfo?.SignaturePrincipal;
      newRow.NajemName = formData.najem_name_text?.trim() || institutionInfo?.NajemName || '';
      newRow.PrincipalName = formData.principal_name_text?.trim() || institutionInfo?.PrincipalName || '';
      return newRow;
    });

  const onSubmit = (formData) => {
    if (!checkboxState.length) {
      Swal.fire({
        icon: 'warning',
        title: ui('pickFieldTitle'),
        text: ui('pickFieldText'),
        showCancelButton: true,
        confirmButtonText: ui('setup'),
        cancelButtonText: ui('cancel'),
      }).then((result) => {
        if (result.isConfirmed) setShowSetupModal(true);
      });
      return null;
    }

    if (routineOn && !routineColumns.length) {
      Swal.fire({
        icon: 'warning',
        title: rui('pickRoutineColTitle'),
        text: rui('pickRoutineColText'),
        showCancelButton: true,
        confirmButtonText: ui('setup'),
        cancelButtonText: ui('cancel'),
      }).then((result) => {
        if (result.isConfirmed) setShowSetupModal(true);
      });
      return null;
    }

    if (!selectedRows.length) {
      Swal.fire({
        icon: 'warning',
        title: ui('pickStudentTitle'),
        text: ui('pickStudentText'),
      });
      return null;
    }
    if (!reportType) {
      Swal.fire({
        icon: 'warning',
        title: ui('pickReportTitle'),
        text: ui('pickReportText'),
      });
      return null;
    }
    const rows = buildPrintRows(formData);
    setPrintData(rows);
    return rows;
  };

  const handlePrint = handleSubmit(async (formData) => {
    setPrintOnly(true);
    const rows = onSubmit(formData);
    if (!rows) {
      setPrintOnly(false);
      return;
    }
    await waitForPrintReady();
    window.print();
  });

  const handleSaveSetup = async () => {
    const formData = getValues();
    const labels = {};
    checkboxState.forEach((f) => {
      const typed = formData[`fieldkey_${f}`];
      if (typed && String(typed).trim()) labels[f] = String(typed).trim();
    });

    const setup = {
      templateId: selectedTemplate,
      lang,
      fields: checkboxState,
      labels,
      toggles: {
        qr: qrEnabled,
        watermark: watermarkEnabled,
        photo: photoEnabled,
        najemSign,
        najemSignName,
        najemSignDate,
        principalSign,
        principalSignName,
        principalSignDate,
        sign: najemSign && principalSign,
        signName: najemSignName && principalSignName,
        signDate: najemSignDate && principalSignDate,
      },
      contentZoom,
      seatOffsetY,
      signOffsetY,
      qrOffsetY,
      routing: {
        mode: admitMode,
        templateId: routeTemplate || null,
        color: routineColor || null,
        columns: routineColumns,
        seat: seatEnabled,
      },
      najemName: formData.najem_name_text || '',
      principalName: formData.principal_name_text || '',
      reportType: reportType || null,
      nameSize: nameSize || template.nameSize,
      nameColor: nameColor || template.nameColor,
      addressSize: addressSize || template.addressSize,
      addressColor: addressColor || template.addressColor,
      examNameSize: examSize || template.examNameSize || 13,
      examNameColor: examColor || template.examNameColor || template.labelColor,
    };

    try {
      await saveAdmitCardSettings({ setup }).unwrap();
      hydratedRef.current = true;
      savedLabelsRef.current = labels;
      Swal.fire({
        icon: 'success',
        title: ui('savedTitle'),
        text: ui('savedText'),
        timer: 1800,
        showConfirmButton: false,
      });
      setShowSetupModal(false);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: ui('saveFailTitle'),
        text: err?.data?.error || ui('saveFailText'),
      });
    }
  };

  const reportOptions = useMemo(
    () =>
      routineOn
        ? Object.keys(ROUTINE_LAYOUTS).map((id) => ({ id, label: getRoutineLayoutLabel(id, lang) }))
        : PLAIN_LAYOUT_ORDER.map((id) => ({ id, label: getLayoutLabel(id, lang) })),
    [routineOn, lang]
  );

  useEffect(() => {
    const ids = reportOptions.map((o) => String(o.id));
    if (!ids.length) return;
    if (!ids.includes(String(reportType || ''))) setValue('ReportID', ids[0]);
  }, [reportOptions, reportType, setValue]);

  const generalToggles = [
    { id: 'qr', label: ui('qr'), checked: qrEnabled, onChange: setQrEnabled },
    { id: 'photo', label: ui('photo'), checked: photoEnabled, onChange: setPhotoEnabled },
    ...(watermarkLogo ? [{ id: 'watermark', label: ui('watermark'), checked: watermarkEnabled, onChange: setWatermarkEnabled }] : []),
    { id: 'seatLine', label: ui('seatLine'), checked: seatEnabled, onChange: setSeatEnabled },
  ];

  const najemToggles = [
    { id: 'najemSign', label: ui('sign'), checked: najemSign, onChange: setNajemSign },
    { id: 'najemSignName', label: ui('signName'), checked: najemSignName, onChange: setNajemSignName },
    { id: 'najemSignDate', label: ui('date'), checked: najemSignDate, onChange: setNajemSignDate },
  ];

  const principalToggles = [
    { id: 'principalSign', label: ui('sign'), checked: principalSign, onChange: setPrincipalSign },
    { id: 'principalSignName', label: ui('signName'), checked: principalSignName, onChange: setPrincipalSignName },
    { id: 'principalSignDate', label: ui('date'), checked: principalSignDate, onChange: setPrincipalSignDate },
  ];

  const previewStudent = useMemo(() => {
    const row = {
      institute_name: instName,
      institute_address: instAddress,
      admit_name_color: nameColor,
      admit_name_size: nameSize,
      admit_address_color: addressColor,
      admit_address_size: addressSize,
      admit_exam_color: examColor,
      admit_exam_size: examSize,
      SignatureNajem: institutionInfo?.SignatureNajem,
      SignaturePrincipal: institutionInfo?.SignaturePrincipal,
      PrincipalName: watch('principal_name_text') || institutionInfo?.PrincipalName,
      NajemName: watch('najem_name_text') || institutionInfo?.NajemName,
      ExamName: getFieldDemo('ExamName', lang),
      SessionName: getFieldDemo('SessionName', lang),
      QRValue: `https://qmmsoft.com/${institutionInfo?.InstitutionCode || 'demo'}/students/1/1/1/${getFieldDemo('StudentCode', 'en')}`,
    };
    checkboxState.forEach((f) => {
      row[f] = getFieldDemo(f, lang);
      const typed = watch(`fieldkey_${f}`);
      row[`fieldkey_${f}`] = typed && String(typed).trim() ? String(typed).trim() : fieldLabels[f];
    });
    return row;
  }, [checkboxState, fieldLabels, institutionInfo, instName, instAddress, lang, nameColor, nameSize, addressColor, addressSize, examColor, examSize, watch]);

  const availableFields = ADMIT_FIELDS.filter(
    (f) => isUploadedTemplateId(selectedTemplate) || isFieldAllowedForTemplate(f.id, selectedTemplate)
  );

  const remaining = MAX_FIELD_SELECT - checkboxState.length;
  const uploadMode = routineOn ? 'A4' : 'A5';
  const uploadSpec = getUploadSpec(uploadMode);

  return (
    <FormProvider {...methods}>
      <div className="font-SolaimanLipi p-4 md:p-6 hidden_in_print max-w-full overflow-x-hidden" dir={uiDir}>
        <div className="rounded-xl overflow-hidden">
          
          {/* ================================================== মডার্ন হেডার */}
          <div className="flex flex-col gap-4 bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] px-5 py-5 sm:flex-row sm:items-center sm:justify-between relative overflow-hidden">
            <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur border border-white/20 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold leading-tight text-white">{ui('title') || 'প্রবেশপত্র তৈরি'}</h3>
                <p className="text-[13px] text-indigo-100 mt-0.5">শিক্ষাবর্ষ ও পরীক্ষা অনুযায়ী প্রবেশপত্র জেনারেট ও প্রিন্ট করুন</p>
              </div>
            </div>
            
            {/* হেডারের ডান পাশ */}
            <div className="flex items-center gap-3 relative z-10">
              <select
                className="rounded-lg border-0 bg-white/20 px-3 py-2 text-[13px] font-semibold text-white shadow-sm cursor-pointer outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-gray-800"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                dir="ltr"
              >
                {ADMIT_LANGS.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="rounded-lg bg-white px-5 py-2 text-[13px] font-bold text-indigo-700 shadow-sm hover:bg-indigo-50 transition whitespace-nowrap"
                onClick={() => setShowSetupModal(true)}
              >
                {ui('setup')}
              </button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {/* ===================================== মোড ও টেমপ্লেট সিলেকশন */}
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm" dir="ltr">
                  {[
                    { id: ADMIT_MODES.PLAIN, short: ui('modePlainShort'), full: ui('modePlain') },
                    { id: ADMIT_MODES.ROUTINE, short: ui('modeRoutineShort'), full: ui('modeRoutine') },
                  ].map((m) => {
                    const on = String(admitMode) === String(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setAdmitMode(m.id);
                          setShowTemplateModal(true);
                        }}
                        title={m.full}
                        className={`rounded-md px-4 py-1.5 text-[13px] font-bold transition ${
                          on ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {m.short}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="w-full min-w-0 flex-1">
                <TemplateStrip
                  templates={stripTemplates}
                  activeId={activeTemplateId}
                  filter={tplFilter}
                  onFilter={setTplFilter}
                  dir={uiDir}
                  labels={{
                    default: xui('tplDefault'),
                    custom: xui('tplCustom'),
                    empty: xui('noCustom'),
                  }}
                  onPick={(tpl) => {
                    if (routineOn) setRouteTemplate(tpl.id);
                    else handleTemplateSelect(tpl.id);
                  }}
                  renderThumb={(tpl) =>
                    routineOn ? (
                      <RoutineThumb
                        template={tpl}
                        routineColor={routineColor}
                        lang={lang}
                        height={64}
                        routineColumns={routineColumns}
                        routine={previewRoutine}
                        seat={previewSeat}
                        showSeatLine={seatEnabled}
                      />
                    ) : (
                      <TemplateThumb template={tpl} lang={lang} />
                    )
                  }
                />
              </div>
            </div>

            {/* ===================================== ফিল্টার */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 items-end gap-4">
                <DefaultSelect
                  label={`${ui('session')} :`}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('examName')} :`}
                  options={examNameData ?? []}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('classJamaat')} :`}
                  options={subClassData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('residential')} :`}
                  options={residentialData ?? []}
                  valueField="RDID"
                  nameField="ResidentialName"
                  registerKey="RDID"
                  unicode
                  hidePlaceholder
                  initialValue={5}
                />
                <DefaultSelect
                  label={`${ui('reportType')} :`}
                  options={reportOptions}
                  valueField="id"
                  nameField="label"
                  registerKey="ReportID"
                />
                <DefaultInput
                  label={ui('studentId')}
                  valueField="UserCode"
                  nameField="UserCode"
                  registerKey="UserCode"
                />

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-indigo-600 px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-indigo-700 shadow-sm"
                >
                  <PrintIcon />
                  {ui('print')}
                </button>
              </div>
            </div>

            {/* ================================ শিক্ষার্থীর ডাটা */}
            <div className="relative flex h-[calc(100vh-400px)] min-h-[200px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="p-3 text-start w-[44px]">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={handleSelectAll}
                          disabled={!studentList.length}
                          checked={studentList.length > 0 && selectedRows.length === studentList.length}
                        />
                      </th>
                      <th className="p-3 text-start font-semibold text-gray-600">{fieldLabels.StudentCode}</th>
                      <th className="p-3 text-start font-semibold text-gray-600">{fieldLabels.StudentName}</th>
                      <th className="p-3 text-start font-semibold text-gray-600">{fieldLabels.SubClass}</th>
                      <th className="p-3 text-start font-semibold text-gray-600">{fieldLabels.RollNo}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((student) => (
                      <tr key={student.AdmissionID} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            onChange={(e) => handleRowSelect(e, student)}
                            checked={selectedRows.some((r) => r.AdmissionID === student.AdmissionID)}
                          />
                        </td>
                        <td className="p-3 text-gray-700">{toLangDigit(student.StudentCode, lang)}</td>
                        <td className="p-3 font-medium text-gray-800">{getFieldValue(student, 'StudentName', lang)}</td>
                        <td className="p-3 text-gray-700">{getFieldValue(student, 'SubClass', lang) || getFieldValue(student, 'ClassName', lang)}</td>
                        <td className="p-3 text-gray-700">{toLangDigit(student.RollNo, lang)}</td>
                      </tr>
                    ))}

                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-12 text-center align-middle">
                          <span className="text-[15px] text-gray-500 font-medium">
                            {isFetching
                              ? ui('loading')
                              : filterReady
                              ? ui('searchHint')
                              : ui('filterFirst')}
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {isFetching ? (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
                  <Spinner size={48} stroke={4} className="text-indigo-600" />
                  <p className="mt-4 text-[15px] font-semibold text-gray-700">{ui('loading')}</p>
                  <p className="mt-1 text-[13px] text-gray-500">{ui('searchHint')}</p>
                </div>
              ) : null}

              <div className="shrink-0 flex items-center justify-center border-t border-gray-200 bg-gray-50 px-3 py-2">
                <DefaultPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>

            {printData?.length && !printOnly ? (
              <p className="mt-3 text-[14px] text-emerald-700 text-center font-semibold bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                {ui('ready')(toLangDigit(printData.length, lang))}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ============================ প্রিন্ট এরিয়া */}
      <style>{`
        @media print {
          .admit-output {
            margin: 0 !important;
            padding: 0 !important;
            width: auto !important;
            max-width: none !important;
            overflow: visible !important;
          }
        }
        @media screen {
          .admit-output--print-only {
            position: absolute;
            left: -10000px;
            top: 0;
            width: ${CARD_W + 80}px;
            opacity: 0;
            pointer-events: none;
          }
        }
      `}</style>

      {printData?.length ? (
        <div className={`mt-8 max-w-full overflow-x-auto overscroll-x-contain admit-output${printOnly ? ' admit-output--print-only' : ''}`}>
          {routineOn ? (
            <AdmitCardRoutinegenerate
              routineTemplateId={routeTemplate}
              routineTemplate={routeTpl}
              routineColor={routineColor}
              fields={checkboxState}
              data={printData}
              routine={routineRows}
              seats={hallSeats}
              routineColumns={routineColumns}
              showSeatLine={seatEnabled}
              reportType={reportType}
              lang={lang}
              grayscale={false}
              inName={instName}
              inAddress={instAddress}
              inLogo={institutionInfo?.Logo}
              inWatermark={watermarkLogo}
              institutionCode={institutionInfo?.InstitutionCode}
              showQR={qrEnabled}
              showWatermark={watermarkEnabled}
              showPhoto={photoEnabled}
              showSign={najemSign || principalSign}
              showSignName={najemSignName || principalSignName}
              showSignDate={najemSignDate || principalSignDate}
              najemShowSign={najemSign}
              najemShowName={najemSignName}
              najemShowDate={najemSignDate}
              principalShowSign={principalSign}
              principalShowName={principalSignName}
              principalShowDate={principalSignDate}
              zoom={zoomFactor}
              seatOffsetY={seatOffsetY}
              signOffsetY={signOffsetY}
              qrOffsetY={qrOffsetY}
            />
          ) : (
            <AdmitCardGenerate
              templateId={selectedTemplate}
              templateObj={plainTemplate}
              fields={checkboxState}
              data={printData}
              seats={seatEnabled ? seatTexts : null}
              reportType={reportType}
              lang={lang}
              grayscale={false}
              inName={instName}
              inAddress={instAddress}
              inLogo={institutionInfo?.Logo}
              inWatermark={watermarkLogo}
              institutionCode={institutionInfo?.InstitutionCode}
              showQR={qrEnabled}
              showWatermark={watermarkEnabled}
              showPhoto={photoEnabled}
              showSign={najemSign || principalSign}
              showSignName={najemSignName || principalSignName}
              showSignDate={najemSignDate || principalSignDate}
              najemShowSign={najemSign}
              najemShowName={najemSignName}
              najemShowDate={najemSignDate}
              principalShowSign={principalSign}
              principalShowName={principalSignName}
              principalShowDate={principalSignDate}
              zoom={zoomFactor}
              seatOffsetY={seatOffsetY}
              signOffsetY={signOffsetY}
              qrOffsetY={qrOffsetY}
            />
          )}
        </div>
      ) : null}

      {/* ============================ পপআপ ১ — টেমপ্লেট ও ডাটা সেটিং */}
      <Modal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title={ui('setup')}
        dir={uiDir}
        width="max-w-7xl"
        disableEsc={showTemplateModal || showUploadModal}
        footer={
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveSetup}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-[14px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
          >
            {isSaving ? ui('saving') : ui('save')}
          </button>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-7 xl:h-[calc(90vh-170px)]">
          {/* বাম পাশ */}
          <div className="min-w-0 xl:overflow-y-auto xl:pr-2">
            <div className="xl:sticky xl:top-0 xl:z-10 bg-white pb-3">
              <style>{'.admit-print-sim .admit-paper-only{display:none !important}'}</style>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-baseline gap-2 min-w-0">
                  <p className="text-[15px] font-bold text-gray-700 shrink-0">
                    {printSim
                      ? getUploadUIText('previewModePrint', lang)
                      : routineOn
                      ? rui('routinePreview')
                      : ui('livePreview')}
                  </p>
                  <p className="text-[14px] font-medium text-gray-600 truncate">{template.title}</p>
                </div>

                {showPrintSwitch ? (
                  <div className="flex overflow-hidden rounded-lg border border-gray-300 shrink-0">
                    {[
                      { on: false, label: getUploadUIText('previewModeDesign', lang) },
                      { on: true, label: getUploadUIText('previewModePrint', lang) },
                    ].map((opt) => (
                      <button
                        key={String(opt.on)}
                        type="button"
                        onClick={() => setSimPrint(opt.on)}
                        className={`px-3 py-1 text-[12px] font-semibold transition ${
                          simPrint === opt.on ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="overflow-x-auto overscroll-x-contain -mx-1 px-1 pb-2">
                {routineOn ? (
                  <div
                    className={`relative mx-auto overflow-hidden rounded border border-gray-200 shadow-sm ${printSim ? ' admit-print-sim bg-white' : ''}`}
                    style={{ width: ROUTINE_CARD_W * 0.72, height: ROUTINE_CARD_H * 0.72 }}
                    dir="ltr"
                  >
                    <div
                      className="absolute top-0 left-0"
                      style={{ width: ROUTINE_CARD_W, height: ROUTINE_CARD_H, transform: 'scale(0.72)', transformOrigin: 'top left' }}
                    >
                      <RoutineCardFace
                        template={template}
                        routineColor={routineColor}
                        fields={checkboxState}
                        student={previewStudent}
                        routine={previewRoutine}
                        seat={previewSeat}
                        routineColumns={routineColumns}
                        showSeatLine={seatEnabled}
                        lang={lang}
                        inName={instName}
                        inAddress={instAddress}
                        inLogo={institutionInfo?.Logo}
                        inWatermark={watermarkLogo}
                        institutionCode={institutionInfo?.InstitutionCode}
                        showQR={qrEnabled}
                        showWatermark={watermarkEnabled}
                        showPhoto={photoEnabled}
                        showSign={najemSign || principalSign}
                        showSignName={najemSignName || principalSignName}
                        showSignDate={najemSignDate || principalSignDate}
                        najemShowSign={najemSign}
                        najemShowName={najemSignName}
                        najemShowDate={najemSignDate}
                        principalShowSign={principalSign}
                        principalShowName={principalSignName}
                        principalShowDate={principalSignDate}
                        zoom={zoomFactor}
                        seatOffsetY={seatOffsetY}
                        signOffsetY={signOffsetY}
                        qrOffsetY={qrOffsetY}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-[520px] shrink-0 shadow-sm border border-gray-100 rounded ${printSim ? ' admit-print-sim bg-white' : ''}`} dir="ltr">
                    <AdmitCardFace
                      template={template}
                      fields={checkboxState}
                      student={previewStudent}
                      lang={lang}
                      inName={instName}
                      inAddress={instAddress}
                      inLogo={institutionInfo?.Logo}
                      inWatermark={watermarkLogo}
                      institutionCode={institutionInfo?.InstitutionCode}
                      showQR={qrEnabled}
                      showWatermark={watermarkEnabled}
                      showPhoto={photoEnabled}
                      showSign={najemSign || principalSign}
                      showSignName={najemSignName || principalSignName}
                      showSignDate={najemSignDate || principalSignDate}
                      najemShowSign={najemSign}
                      najemShowName={najemSignName}
                      najemShowDate={najemSignDate}
                      principalShowSign={principalSign}
                      principalShowName={principalSignName}
                      principalShowDate={principalSignDate}
                      zoom={zoomFactor}
                      seatOffsetY={seatOffsetY}
                      signOffsetY={signOffsetY}
                      qrOffsetY={qrOffsetY}
                      seatText={seatEnabled ? previewSeatText : ''}
                    />
                  </div>
                )}
              </div>
              
              {printSim ? (
                <p className="mt-1 text-center text-[12px] text-gray-500">
                  {overlayOn ? getUploadUIText('previewPrintNote', lang) : xui('printFullNote')}
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 items-stretch">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="rounded-lg border-2 border-indigo-200 p-2 min-w-0 text-start hover:border-indigo-500 transition flex flex-col bg-indigo-50/30"
                >
                  <p className="text-[11px] font-semibold text-indigo-600 mb-1 truncate">{ui('templateSelect')}</p>
                  <div className="overflow-hidden rounded border border-gray-200 flex-1 flex items-center justify-center bg-white">
                    {routineOn ? (
                      <RoutineThumb template={template} routineColor={routineColor} lang={lang} height={110} routineColumns={routineColumns} routine={previewRoutine} seat={previewSeat} showSeatLine={seatEnabled} />
                    ) : (
                      <TemplateThumb template={template} lang={lang} />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-indigo-600 truncate text-center">{ui('changeDesign')}</p>
                </button>

                <div className="rounded-lg border border-gray-200 p-3 min-w-0 flex flex-col bg-white shadow-sm">
                  <p className="text-[12px] font-bold text-gray-600 mb-2">{ui('mode')}</p>
                  <div className="grid grid-cols-2 gap-2 content-start">
                  {[
                    { id: ADMIT_MODES.PLAIN, short: ui('modePlainShort'), note: ui('modePlainNote') },
                    { id: ADMIT_MODES.ROUTINE, short: ui('modeRoutineShort'), note: ui('modeRoutineNote') },
                  ].map((m) => {
                    const on = String(admitMode) === String(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => { setAdmitMode(m.id); setShowTemplateModal(true); }}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-start transition ${on ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}`}
                      >
                        <span className={`shrink-0 rounded-full border-[4px] ${on ? 'border-indigo-600' : 'border-gray-300'}`} style={{ width: 14, height: 14 }} />
                        <span className="min-w-0 leading-tight">
                          <span className={`block text-[13px] font-bold ${on ? 'text-indigo-700' : 'text-gray-700'}`} dir="ltr">{m.short}</span>
                          <span className="block text-[10px] text-gray-500">{m.note}</span>
                        </span>
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ডান পাশ */}
          <div className="min-w-0 xl:overflow-y-auto xl:pr-2">
            <style>{RANGE_CSS}</style>

            <div className="grid grid-cols-1 gap-3 mb-6">
              {[
                { key: 'institute_name', label: ui('instituteName'), size: template.nameSize, color: template.nameColor, value: nameSize, min: 12, max: 40 },
                { key: 'institute_address', label: ui('address'), size: template.addressSize, color: template.addressColor, value: addressSize, min: 8, max: 40 },
                { key: 'exam_name', label: ui('examName'), size: template.examNameSize ?? 13, color: template.examNameColor || template.labelColor, value: examSize, min: 8, max: 26 },
              ].map((box) => (
                <SliderControl
                  key={`${box.key}-${activeTemplateId}`}
                  label={box.label}
                  value={Number(box.value) || box.size}
                  onChange={(v) => setValue(`${box.key}_size_${activeTemplateId}`, v)}
                  step={1}
                  min={box.min}
                  max={box.max}
                  suffix="px"
                  resetTo={box.size}
                  resetLabel={xui('auto')}
                  trailing={
                    <input
                      type="color"
                      className="h-[26px] w-[34px] shrink-0 cursor-pointer border-0 bg-transparent p-0 rounded"
                      defaultValue={box.color}
                      {...register(`${box.key}_color_${activeTemplateId}`)}
                    />
                  }
                />
              ))}
              
              <SliderControl label={xui('sizeBox')} hint={xui('sizeHint')} value={contentZoom} onChange={setContentZoom} step={ZOOM_STEP} min={ZOOM_MIN} max={ZOOM_MAX} suffix="%" resetTo={100} resetLabel={xui('auto')} />
              <SliderControl label={xui('seatBox')} hint={xui('seatHint')} value={seatOffsetY} onChange={setSeatOffsetY} step={2} min={SEAT_OFF_MIN} max={SEAT_OFF_MAX} suffix="px" resetTo={0} resetLabel={xui('auto')} />
              
              {!seatEnabled ? <p className="text-[12px] font-medium text-amber-600 px-1">{xui('seatOffNote')}</p> : null}

              <SliderControl label={xui('signBox')} hint={xui('signHint')} value={signOffsetY} onChange={setSignOffsetY} step={2} min={SEAT_OFF_MIN} max={SEAT_OFF_MAX} suffix="px" resetTo={0} resetLabel={xui('auto')} />
              <SliderControl label={xui('qrBox')} hint={xui('qrHint')} value={qrOffsetY} onChange={setQrOffsetY} step={2} min={SEAT_OFF_MIN} max={SEAT_OFF_MAX} suffix="px" resetTo={0} resetLabel={xui('auto')} />
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
              <p className="font-bold text-[15px] mb-3 text-gray-800">{ui('displaySettings')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {generalToggles.map((tg) => (
                  <label key={tg.id} className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition shadow-sm">
                    <input type="checkbox" className="h-[15px] w-[15px] accent-indigo-600 rounded" checked={tg.checked} onChange={(e) => tg.onChange(e.target.checked)} />
                    <span className="text-[13px] font-semibold text-gray-700">{tg.label}</span>
                  </label>
                ))}
              </div>

              {seatEnabled ? (
                <p className="mt-2 text-[12px] font-medium" style={{ color: hallSeats.size ? '#15803d' : '#b45309' }}>
                  {routineFetching ? ui('loading') : hallSeats.size ? `${rui('seatPlanReady')} — ${toLangDigit(hallSeats.size, lang)} ${rui('seatPlanRows')}` : rui('noSeatPlan')}
                </p>
              ) : null}
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
              <p className="font-bold text-[15px] mb-3 text-gray-800">{ui('leftSignature')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {najemToggles.map((tg) => (
                  <label key={tg.id} className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition shadow-sm">
                    <input type="checkbox" className="h-[15px] w-[15px] accent-indigo-600 rounded" checked={tg.checked} onChange={(e) => tg.onChange(e.target.checked)} />
                    <span className="text-[13px] font-semibold text-gray-700">{tg.label}</span>
                  </label>
                ))}
                <input type="text" className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder={ui('signNamePlaceholder')} {...register('najem_name_text')} />
              </div>
            </div>

            <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mb-6">
              <p className="font-bold text-[15px] mb-3 text-gray-800">{ui('rightSignature')}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {principalToggles.map((tg) => (
                  <label key={tg.id} className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition shadow-sm">
                    <input type="checkbox" className="h-[15px] w-[15px] accent-indigo-600 rounded" checked={tg.checked} onChange={(e) => tg.onChange(e.target.checked)} />
                    <span className="text-[13px] font-semibold text-gray-700">{tg.label}</span>
                  </label>
                ))}
                <input type="text" className="flex-1 min-w-[150px] border border-gray-300 rounded-lg px-3 py-1.5 text-[13px] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" placeholder={ui('signNamePlaceholder')} {...register('principal_name_text')} />
              </div>
            </div>

            <div className="mb-4">
              <p className="font-bold text-[15px] mb-1 text-gray-800">
                {checkboxState.length === 0 ? ui('selectUpTo')(toLangDigit(MAX_FIELD_SELECT, lang)) : remaining > 0 ? ui('canAddMore')(toLangDigit(remaining, lang)) : ui('maxSelected')}
              </p>
              <p className="text-[13px] text-gray-500 mb-4">{ui('labelHint')}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableFields.map((f) => {
                  const checked = checkboxState.includes(f.id);
                  return (
                    <div key={f.id} className={`flex items-center gap-3 border rounded-lg px-3 py-2 min-w-0 transition ${checked ? 'border-indigo-400 bg-indigo-50/40 shadow-sm' : 'border-gray-200 bg-white'}`}>
                      <input type="checkbox" className="h-[18px] w-[18px] shrink-0 accent-indigo-600 rounded cursor-pointer" checked={checked} disabled={!checked && checkboxState.length >= MAX_FIELD_SELECT} onChange={(e) => handleFieldToggle(f.id, e.target.checked)} />
                      <span className="text-[14px] font-medium text-gray-700 w-[110px] shrink-0 truncate">{getFieldName(f.id, lang)}</span>
                      <input className="flex-1 min-w-0 border border-gray-300 rounded px-2 py-1 text-[13px] outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400" disabled={!checked} {...register(`fieldkey_${f.id}`)} />
                    </div>
                  );
                })}
              </div>
            </div>

            {routineOn ? (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <p className="text-[15px] font-bold text-gray-800 mb-3">{rui('routineColumns')}</p>
                <div className="flex items-center gap-2 flex-wrap mb-5">
                  {ROUTINE_COLUMNS.map((c) => {
                    const on = routineColumns.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 cursor-pointer bg-white hover:bg-gray-50 transition shadow-sm">
                        <input type="checkbox" className="h-[15px] w-[15px] accent-indigo-600 rounded" checked={on} onChange={(e) => setRoutineColumns((prev) => e.target.checked ? prev.includes(c.id) ? prev : [...prev, c.id] : prev.filter((x) => x !== c.id))} />
                        <span className="text-[13px] font-semibold text-gray-700">{getRoutineColumnLabel(c.id, lang)}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-[13px] font-medium text-gray-700">
                    {routineFetching ? ui('loading') : routineRows.length ? (
                      <span className="inline-flex items-center gap-1.5"><span className="text-indigo-500 font-bold">›</span><span>{rui('routineReady')}</span><span className="text-gray-400">—</span><span>{toLangDigit(routineRows.length, lang)} {rui('routineRows')}</span></span>
                    ) : rui('noRoutine')}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-1">
                    {hallGrid.columns.length ? (
                      <span className="inline-flex items-center gap-1.5"><span className="text-indigo-500 font-bold">›</span><span>{hallGrid.hallName || rui('hall')}</span><span className="text-gray-400">—</span><span>{toLangDigit(hallGrid.columns.length, lang)} {rui('column')}, {rui('totalSeats')} {toLangDigit(hallGrid.totalSeats, lang)}</span></span>
                    ) : rui('noHall')}
                  </p>
                  <p className="text-[12px] mt-1 font-medium" style={{ color: hallSeats.size ? '#15803d' : '#b45309' }}>
                    {routineFetching ? ui('loading') : hallSeats.size ? (
                      <span className="inline-flex items-center gap-1.5"><span className="text-indigo-500 font-bold">›</span><span>{rui('seatPlanReady')}</span><span className="text-gray-400">—</span><span>{toLangDigit(hallSeats.size, lang)} {rui('seatPlanRows')}</span></span>
                    ) : rui('noSeatPlan')}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Modal>

      {/* পপআপ ১ক — টেমপ্লেট সিলেক্ট */}
      <Modal open={showTemplateModal} onClose={() => setShowTemplateModal(false)} title={ui('selectTemplate')} dir={uiDir} width={routineOn ? 'max-w-5xl' : 'max-w-4xl'} zIndex="z-[60]" disableEsc={showUploadModal}>
        {routineOn ? (
          <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
            <p className="text-[14px] font-bold text-gray-800 mb-1">{ui('routineColor')}</p>
            <p className="text-[12px] text-gray-500 mb-3">{ui('routineColorHint')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {ROUTINE_COLOR_PRESETS.map((hex) => {
                const on = String(routineColor).toLowerCase() === hex.toLowerCase();
                return (
                  <button key={hex} type="button" onClick={() => setRoutineColor(hex)} title={hex} aria-label={hex} className={`shrink-0 rounded-full border-2 transition ${on ? 'border-indigo-600 scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'}`} style={{ background: hex, width: 30, height: 30 }} />
                );
              })}
              <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 cursor-pointer hover:bg-gray-100 transition shadow-sm ml-2">
                <input type="color" className="h-[22px] w-[30px] cursor-pointer border-0 bg-transparent p-0" value={routineColor || routeTpl.table?.borderColor || '#111827'} onChange={(e) => setRoutineColor(e.target.value)} />
                <span className="text-[13px] font-semibold text-gray-700" dir="ltr">{routineColor || '—'}</span>
              </label>
            </div>
          </div>
        ) : null}

        <div className={`grid gap-4 ${routineOn ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
          <button
            type="button"
            onClick={() => { setEditTemplate(null); setShowUploadModal(true); }}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 p-3 text-center transition hover:border-indigo-500 hover:bg-indigo-50"
            style={{ minHeight: routineOn ? 240 : 180 }}
          >
            <span className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-indigo-600 text-[24px] leading-none text-white shadow-md">+</span>
            <span className="text-[14px] font-bold text-indigo-700">{uui('uploadNew')}</span>
            <span className="text-[11px] leading-snug text-gray-600 font-medium">
              {formatSize(uploadSpec.width, uploadSpec.height, lang)} px<br />{formatBytes(uploadSpec.maxBytes, lang)} · PNG/JPG
            </span>
          </button>

          {(routineOn ? routineTemplateList : admitTemplateList).map((tpl) => {
            const on = String(activeTemplateId) === String(tpl.id);
            return (
              <div key={tpl.id} className="relative min-w-0 group">
                <button
                  type="button"
                  onClick={() => { if (routineOn) setRouteTemplate(tpl.id); else handleTemplateSelect(tpl.id); setShowTemplateModal(false); }}
                  className={`w-full rounded-xl border-2 p-2 transition min-w-0 ${on ? 'border-indigo-600 shadow-lg bg-indigo-50/20' : 'border-gray-200 hover:border-indigo-300 bg-white'}`}
                >
                  <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
                    {routineOn ? (
                      <RoutineThumb template={tpl} routineColor={routineColor} lang={lang} height={200} routineColumns={routineColumns} routine={previewRoutine} seat={previewSeat} showSeatLine={seatEnabled} />
                    ) : (
                      <TemplateThumb template={tpl} lang={lang} />
                    )}
                  </div>
                  <p className="mt-2 text-center text-[14px] font-semibold text-gray-800 truncate">{tpl.title}</p>
                  {tpl.uploaded ? <p className="text-center text-[11px] font-medium text-indigo-600">{uui('uploaded')}</p> : null}
                </button>

                {tpl.uploaded ? (
                  <>
                    <button type="button" title={uui('delete')} onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(tpl); }} className="absolute right-1 top-1 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white/90 text-[18px] leading-none text-red-600 shadow hover:bg-red-600 hover:text-white transition">
                      ×
                    </button>
                    <button type="button" title={uui('adjustBtn')} onClick={(e) => { e.stopPropagation(); openTemplateEditor(tpl); }} className="absolute left-1 top-1 flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white/90 text-indigo-600 shadow hover:bg-indigo-600 hover:text-white transition">
                      <svg className="h-[14px] w-[14px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
                    </button>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* পপআপ ১খ — নিজের ডিজাইন আপলোড */}
      <AdmitTemplateUpload
        open={showUploadModal}
        mode={editTemplate?.mode || uploadMode}
        lang={lang}
        instName={instName}
        instAddress={instAddress}
        institutionInfo={institutionInfo}
        watermarkLogo={watermarkLogo}
        apiUrl={API_URL}
        record={editTemplate}
        onClose={() => { setShowUploadModal(false); setEditTemplate(null); }}
        onUpload={handleUploadTemplate}
        onSaveOffsets={handleSaveOffsets}
      />
    </FormProvider>
  );
};

const RoutineThumb = ({ template, routineColor, lang, height = 200, routineColumns, routine, seat, showSeatLine }) => {
  const scale = height / ROUTINE_CARD_H;
  return (
    <div className="relative mx-auto overflow-hidden bg-white" style={{ height, width: ROUTINE_CARD_W * scale }} dir="ltr">
      <div className="absolute top-0 left-0" style={{ width: ROUTINE_CARD_W, height: ROUTINE_CARD_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <RoutineCardFace
          template={template} routineColor={routineColor} lang={lang} fields={['StudentName', 'FatherName', 'SubClass', 'StudentCode']}
          routine={routine} seat={seat} routineColumns={routineColumns} showSeatLine={showSeatLine} showQR={false} showPhoto
          student={{
            institute_name: 'জামিয়া ইসলামিয়া দারুল মাদরাসা', institute_address: 'যাত্রাবাড়ী, ঢাকা',
            ExamName: getFieldDemo('ExamName', lang), SessionName: getFieldDemo('SessionName', lang),
            StudentName: getFieldDemo('StudentName', lang), FatherName: getFieldDemo('FatherName', lang),
            SubClass: getFieldDemo('SubClass', lang), StudentCode: getFieldDemo('StudentCode', lang),
            fieldkey_StudentName: getFieldName('StudentName', lang), fieldkey_FatherName: getFieldName('FatherName', lang),
            fieldkey_SubClass: getFieldName('SubClass', lang), fieldkey_StudentCode: getFieldName('StudentCode', lang),
          }}
        />
      </div>
    </div>
  );
};

const TemplateThumb = ({ template, lang }) => {
  const boxRef = useRef(null);
  const [scale, setScale] = useState(150 / CARD_W);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const w = box.clientWidth;
      if (w > 0) setScale(w / CARD_W);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  if (template.variant === 'image') {
    return <img src={template.thumb || template.image} alt={template.title} className="w-full block" />;
  }

  return (
    <div ref={boxRef} className="relative w-full overflow-hidden" style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}>
      <div className="absolute top-0 left-0" style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <AdmitCardFace
          template={template} lang={lang} fields={['StudentName', 'FatherName', 'SubClass', 'StudentCode']} showQR={false} showPhoto
          student={{
            institute_name: 'জামিয়া ইসলামিয়া দারুল মাদরাসা', institute_address: 'যাত্রাবাড়ী, ঢাকা',
            ExamName: getFieldDemo('ExamName', lang), SessionName: getFieldDemo('SessionName', lang),
            StudentName: getFieldDemo('StudentName', lang), FatherName: getFieldDemo('FatherName', lang),
            SubClass: getFieldDemo('SubClass', lang), StudentCode: getFieldDemo('StudentCode', lang),
            fieldkey_StudentName: getFieldName('StudentName', lang), fieldkey_FatherName: getFieldName('FatherName', lang),
            fieldkey_SubClass: getFieldName('SubClass', lang), fieldkey_StudentCode: getFieldName('StudentCode', lang),
          }}
        />
      </div>
    </div>
  );
};

export default ExamAdmitCard;
