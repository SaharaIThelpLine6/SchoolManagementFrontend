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
// সেটআপ ও টেমপ্লেটের hook গুলো exam স্লাইসেই — রাউট /api/exam/...
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
// রুটিংসহ টেমপ্লেট — প্রবেশপত্রের উপরের অংশ হুবহু রেখে নিচে রুটিন ও আসন
import AdmitCardRoutinegenerate, { RoutineCardFace } from '../components/AdmitCardRoutinegenerate';
// নিজের ডিজাইন আপলোডের পর্দা
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

// ওয়াটারমার্কের ছবির ঠিকানা।
// আপলোড রাউট ফাইলটা রাখে  public/uploads/<recordName>/  ফোল্ডারে, কিন্তু
// WebsiteSettings টেবিলে জমা হয় শুধু  /uploads/<recordName>/<file>  অংশটুকু —
// '/public' অংশটা বাদ থাকে। DocumentSettings পেজও ঠিক এভাবেই প্রিভিউ বানায়।
const API_URL = import.meta.env.VITE_SERVER_URL;

const buildAssetUrl = (value) => {
  const raw = value == null ? '' : String(value).trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  const base = String(API_URL || '').replace(/\/+$/, '');
  return `${base}/public/${raw.replace(/^\/+/, '')}`;
};

// প্রিন্টের আগে সর্বোচ্চ কতক্ষণ অপেক্ষা করা হবে। এর পর ছবি লোড হোক বা
// না হোক, প্রিন্ট ডায়ালগ খুলবেই — বোতাম যেন কখনো মরা মনে না হয়।
const PRINT_READY_TIMEOUT = 4000;

/**
 * একটা ছবির লোড শেষ হওয়ার অপেক্ষা।
 *
 * শুধু `complete` দেখা হয়, `naturalWidth` নয় — কারণ complete এর মানে
 * "ব্রাউজারের কাজ শেষ", সফল হোক বা ৪০৪।
 *
 * আগে শর্ত ছিল `complete && naturalWidth > 0`। ফলে আগেই ফেল করা একটা ছবি
 * (যেমন প্রতিষ্ঠানের লোগোর ভুল ঠিকানা) দ্বিতীয় শর্তে আটকে গিয়ে load/error
 * ইভেন্টের অপেক্ষায় বসে থাকত — কিন্তু সেই ইভেন্ট তো আগেই একবার ঘটে গেছে,
 * আর কোনোদিন আসত না। Promise.all তাই কখনো শেষ হতো না আর window.print()
 * পর্যন্ত পৌঁছানোই যেত না। একবার প্রিভিউ দেখার পর প্রিন্ট চাপলে ঠিক এটাই
 * হতো — পর্দায় প্রিভিউ আসত, প্রিন্ট ডায়ালগ আসত না।
 */
const waitForImage = (img) =>
  img.complete
    ? Promise.resolve()
    : new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });

/** প্রিন্টের আগে ফন্ট ও সব ছবি লোড হওয়া পর্যন্ত অপেক্ষা */
const waitForPrintReady = async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  const ready = (async () => {
    try {
      if (document.fonts?.ready) await document.fonts.ready;
    } catch {
      /* ফন্ট API না থাকলে এড়িয়ে যাই */
    }

    const images = Array.from(document.querySelectorAll('.admit-print-root img'));
    await Promise.all(images.map(waitForImage));
  })();

  // দ্বিতীয় জাল — উপরের কোনো ধাপ অপ্রত্যাশিতভাবে ঝুলে গেলেও
  // নির্দিষ্ট সময় পর প্রিন্ট চলবেই।
  await Promise.race([
    ready,
    new Promise((resolve) => setTimeout(resolve, PRINT_READY_TIMEOUT)),
  ]);
};

/** ছোট, নির্ভরতা-মুক্ত স্পিনার — সব জায়গায় একই চেহারা */
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

/**
 * সব পপআপের অভিন্ন খোল — হেডার, স্ক্রলযোগ্য বডি, ব্যাকড্রপে ক্লিকে বন্ধ।
 * খোলা না থাকলে কিছুই রেন্ডার হয় না, তাই ভিতরের কাজও হয় না।
 *
 * পপআপের ভিতরে পপআপ বসাতে দুইটা জিনিস লাগে —
 *   zIndex    → ভিতরেরটা যেন উপরে থাকে (ভিতরেরটায় z-[60] দেওয়া হয়)
 *   disableEsc → উপরে আরেকটা পপআপ খোলা থাকলে Esc যেন নিচেরটা বন্ধ না করে,
 *                নইলে একবার Esc চাপলেই দুইটাই একসাথে বন্ধ হয়ে যেত
 */
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
  // Esc চাপলেও বন্ধ হবে — পপআপ খোলা থাকলেই কেবল লিসেনার বসে
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

/**
 * প্রিন্টারের আইকন — inline SVG, তাই কোনো আইকন প্যাকেজ ইনস্টল করতে হয় না
 * আর ছাপার সময়ও ঠিকঠাক আসে। রঙটা বোতামের লেখার রঙই নেয় (currentColor)।
 */
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

const ExamAdmitCard = ({ pageTitle = 'Exam Admit Card' }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { watch, register, handleSubmit, setValue, getValues } = methods;

  const [selectedTemplate, setSelectedTemplate] = useState(
    ADMIT_TEMPLATES[0]?.id ?? null
  );
  // কার্ডে কোন তথ্য বসবে — শুরুতেই config এর আটটা ডিফল্ট ধরা থাকে, তাই
  // সেটিং একবারও না খুলেও প্রথমবারেই কার্ড ভরা অবস্থায় দেখা যায়।
  // সংরক্ষিত সেটিং এলে নিচের hydrate ধাপে সেটাই এর জায়গা নেয়।
  const [checkboxState, setCheckboxState] = useState(DEFAULT_ADMIT_FIELDS);
  const [selectedRows, setSelectedRows] = useState([]);
  const [printData, setPrintData] = useState(null);
  // আউটপুটটা কি শুধু ছাপার জন্য বানানো হয়েছে?
  // প্রিন্ট চাপলে কার্ডগুলো DOM এ থাকতেই হয় — নইলে ছাপার কিছু থাকে না।
  // কিন্তু পর্দায় ওগুলো দেখানোর দরকার নেই, তাই true হলে আউটপুট
  // পর্দার বাইরে সরিয়ে রাখা হয়। প্রিভিউ চাপলে false, তখন আগের মতোই দেখায়।
  const [printOnly, setPrintOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // পপআপ — সেটিং, টেমপ্লেট তালিকা, আর নিজের ডিজাইন আপলোড
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ------------------------------------------------- রুটিংসহ টেমপ্লেট
  // A5 = শুধু প্রবেশপত্র, A4 = রুটিনসহ। রুটিন চালু/বন্ধ এই একটা
  // সুইচেই ঠিক হয় — আলাদা "রুটিং বন্ধ" বলে আর কিছু নেই।
  const [admitMode, setAdmitMode] = useState(DEFAULT_ADMIT_MODE);
  // A4 মোডের ডিজাইন — সম্পূর্ণ আলাদা তালিকা থেকে
  const [routeTemplate, setRouteTemplate] = useState(
    ROUTINE_CARD_TEMPLATES[0]?.id ?? 'r1'
  );
  // রুটিনের টেবিলের রঙ — ফাঁকা মানে টেমপ্লেটের নিজের রঙ
  const [routineColor, setRoutineColor] = useState('');
  const [routineColumns, setRoutineColumns] = useState(DEFAULT_ROUTINE_COLUMNS);
  const [seatEnabled, setSeatEnabled] = useState(true);

  // কার্ড ও এডিটর — দুইটারই ভাষা
  const [lang, setLang] = useState(DEFAULT_ADMIT_LANG);
  const ui = (key) => getUIText(key, lang);
  // রুটিংয়ের নিজের লেখা — ADMIT_UI এ হাত না দিয়ে আলাদা ফাইলে রাখা হয়েছে
  const rui = (key) => getRoutineUIText(key, lang);
  // আপলোডের নিজের লেখা — ওটাও আলাদা ফাইলে
  const uui = (key) => getUploadUIText(key, lang);
  const uiDir = getAdmitDir(lang);

  // লোকাল টগল — সব ডিফল্টভাবে ON
  const [qrEnabled, setQrEnabled] = useState(true);
  // ওয়াটারমার্ক — ডাটাবেজে লোগো থাকলে ডিফল্টে চালু, এই পেজ থেকেই বন্ধ করা যায়
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

  // সংরক্ষিত টেমপ্লেট ও ডাটা সেটিং
  const { data: savedSettings } = useGetAdmitCardSettingsQuery();
  const [saveAdmitCardSettings, { isLoading: isSaving }] =
    useSaveAdmitCardSettingsMutation();

  // আপলোড করা ডিজাইন
  const { data: uploadedData } = useGetAdmitCardTemplatesQuery();
  const [uploadAdmitCardTemplate] = useUploadAdmitCardTemplateMutation();
  const [deleteAdmitCardTemplate] = useDeleteAdmitCardTemplateMutation();
  const [updateAdmitCardTemplate] = useUpdateAdmitCardTemplateMutation();

  // প্রতিষ্ঠানের নাম ও ঠিকানা — ভাষা অনুযায়ী
  const instName = getInstituteName(institutionInfo, lang);
  const instAddress = getInstituteAddress(institutionInfo, lang);

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const SubClassID = watch('SubClassID');
  const UserCode = watch('UserCode');
  const RDID = watch('RDID');
  const reportType = watch('ReportID');

  // -------------------------------------------------------------------------
  // টেমপ্লেটের তালিকা = বিল্ট-ইন + আপলোড করা
  //
  // আপলোড করা ডিজাইনের আইডিতে 'u_' উপসর্গ থাকে, তাই বিল্ট-ইন আইডির সাথে
  // কখনো মেলে না — পুরোনো সংরক্ষিত সেটিং তাই নিরাপদ।
  // -------------------------------------------------------------------------
  const uploadedList = uploadedData?.templates;

  const customAdmitTemplates = useMemo(
    () => buildUploadedTemplates(uploadedList, 'A5', API_URL),
    [uploadedList]
  );
  const customRoutineTemplates = useMemo(
    () => buildUploadedTemplates(uploadedList, 'A4', API_URL),
    [uploadedList]
  );

  const admitTemplateList = useMemo(
    () => [...ADMIT_TEMPLATES, ...customAdmitTemplates],
    [customAdmitTemplates]
  );
  const routineTemplateList = useMemo(
    () => [...ROUTINE_CARD_TEMPLATES, ...customRoutineTemplates],
    [customRoutineTemplates]
  );

  // ------------------------------------------------- সক্রিয় মোড ও টেমপ্লেট
  // A5 হলে ডিজাইন আসে ADMIT_TEMPLATES থেকে, A4 হলে রুটিনের নিজের তালিকা
  // থেকে — দুইটার শেষেই আপলোড করা ডিজাইনগুলো যোগ হয়। ফন্ট/রঙের ঘরগুলোও
  // সক্রিয় টেমপ্লেটের আইডি ধরে আলাদা করে জমা থাকে, তাই A5 আর A4 এর
  // সাজসজ্জা একে অন্যকে ছোঁয় না।
  const routineOn = isRoutineMode(admitMode);

  // আপলোড করা ডিজাইন বাছা থাকলে তালিকা থেকেই নেওয়া হয়; না পাওয়া গেলে
  // (যেমন ডিজাইনটা মুছে ফেলা হয়েছে) বিল্ট-ইন প্রথমটায় ফিরে যাই
  const plainTemplate = useMemo(
    () =>
      admitTemplateList.find((t) => String(t.id) === String(selectedTemplate)) ||
      getTemplate(selectedTemplate),
    [admitTemplateList, selectedTemplate]
  );
  const routeTpl = useMemo(
    () =>
      routineTemplateList.find((t) => String(t.id) === String(routeTemplate)) ||
      getRoutineTemplate(routeTemplate),
    [routineTemplateList, routeTemplate]
  );

  const template = routineOn ? routeTpl : plainTemplate;
  const activeTemplateId = routineOn ? routeTemplate : selectedTemplate;

  const nameSize = watch(`institute_name_size_${activeTemplateId}`);
  const nameColor = watch(`institute_name_color_${activeTemplateId}`);
  const addressSize = watch(`institute_address_size_${activeTemplateId}`);
  const addressColor = watch(`institute_address_color_${activeTemplateId}`);
  const examSize = watch(`exam_name_size_${activeTemplateId}`);
  const examColor = watch(`exam_name_color_${activeTemplateId}`);

  // ফিল্টার পূর্ণ হলেই কেবল তালিকা, প্রিভিউ ও প্রিন্ট দেখানো হয়
  const filterReady = Boolean(SessionID && ExamID && SubClassID && RDID);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // ⚠️ এখানে `= {}` ডিফল্ট দেওয়া যাবে না।
  //
  // ফিল্টার দেওয়ার আগে কুয়েরিটা skipToken এ থাকে, তাই `data` আসে undefined।
  // ডিফল্ট `= {}` লিখলে প্রতি রেন্ডারে একটা *নতুন* অবজেক্ট তৈরি হতো, আর
  // নিচের তিনটা useMemo (studentList, watermarkLogo, fieldLabels) এই
  // অবজেক্টটাকেই ডিপেন্ডেন্সি ধরে — ফলে প্রতিবারই সেগুলো আবার চলত,
  // নতুন অ্যারে বানাত, আর `[studentList]` এর ইফেক্ট setSelectedRows() ডাকত।
  // নতুন রেফারেন্স মানে state "বদলেছে" → আবার রেন্ডার → আবার নতুন {} …
  // অর্থাৎ অনন্ত রেন্ডার লুপ। তখন সাইডবারে ক্লিক করলে URL বদলাত, কিন্তু
  // React নতুন পেজটা কমিট করার ফুরসত পেত না — রিফ্রেশ ছাড়া পেজ বদলাত না।
  //
  // undefined নিজেই একটা স্থির মান, তাই ডিফল্ট না দিলেই সমস্যাটা শেষ।
  // নিচে সব জায়গায় `?.` আর Array.isArray দিয়ে পাহারা দেওয়াই আছে।
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

  // মাঝের ওয়াটারমার্কের ছবি — WebsiteSettings টেবিলের documentLogo।
  // হেডারের লোগো আগের মতোই institutionInfo.Logo থেকেই আসে, এখানে হাত পড়ে না।
  const watermarkLogo = useMemo(
    () => buildAssetUrl(studentAdmitCards?.documentLogo),
    [studentAdmitCards]
  );

  // -------------------------------------------------------------------------
  // রুটিন, হলের ছক ও শিক্ষকের সাজানো আসন — আলাদা রাউট।
  // প্রবেশপত্রের মূল রাউটে একটা অক্ষরও বদলানো হয়নি; শিক্ষার্থীর সব ডাটা
  // আগের মতোই ওখান থেকেই আসে, এখান থেকে শুধু বাড়তি জিনিসগুলো।
  // -------------------------------------------------------------------------
  const { data: routineData, isFetching: routineFetching } = useGetExamRoutineCardQuery(
    SessionID && ExamID && SubClassID
      ? { SessionID, ExamID, SubClassID }
      : skipToken
  );

  const routineRows = useMemo(() => normalizeRoutineRows(routineData), [routineData]);
  // হলের ছকটা এখন শুধু দেখানোর জন্য — কয়টা কলাম, মোট কত আসন
  const hallGrid = useMemo(() => buildHallGrid(routineData || {}), [routineData]);

  // -------------------------------------------------------------------------
  // কে কোন আসনে — একমাত্র উৎস শিক্ষকের সাজানো সিট প্ল্যান
  // (Exam_SitAllocation)। কোনো অনুমান নেই: যার বরাদ্দ নেই তার জন্য Map এ
  // কিছুই থাকে না, আর কার্ডে তখন "সিট প্ল্যান তৈরি করা হয়নি" লেখাটাই বসে।
  // -------------------------------------------------------------------------
  const hallSeats = useMemo(
    () => mapAllocatedSeats(studentList, routineData),
    [studentList, routineData]
  );

  // আসনের এক লাইনের লেখা — A4 তে রুটিনের ঘরে, A5 তে QR এর উপরে।
  // দুই জায়গাতেই হুবহু একই লেখা, তাই এক জায়গাতেই বানিয়ে রাখি।
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

  // প্রিভিউতে আসল রুটিন থাকলে সেটাই, না থাকলে ডামি — তাই ফিল্টার দেওয়ার
  // আগেও সেটিং পপআপে কার্ডটা কেমন দেখাবে তা বোঝা যায়
  const previewRoutine = routineRows.length ? routineRows : getRoutineDemoRows(lang);

  // আসনের বেলায় ডামি নেই — প্ল্যানে প্রথম যে আসনটা আছে সেটাই দেখাই,
  // না থাকলে বার্তা। ডামি আসন দেখালে প্রিভিউ দেখে মনে হতো প্ল্যান আছে।
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

  // LabelName টেবিল থেকে আসা লেবেল, ভাষা অনুযায়ী — না এলে config এর ভিত্তি নাম
  const fieldLabels = useMemo(
    () => resolveFieldLabels(studentAdmitCards?.labels, { lang }),
    [studentAdmitCards, lang]
  );

  // -------------------------------------------------------------------------
  // সংরক্ষিত সেটিং একবারই বসানো হয়।
  // পরে ইউজার কিছু বদলালে সেটা আর ওভাররাইট হয় না — তাই ref দিয়ে পাহারা।
  // -------------------------------------------------------------------------
  const hydratedRef = useRef(false);
  const savedLabelsRef = useRef(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    const setup = savedSettings?.setup;
    if (!setup) return;

    hydratedRef.current = true;

    if (setup.templateId) setSelectedTemplate(setup.templateId);
    if (setup.lang) setLang(setup.lang);
    // ফাঁকা অ্যারে সংরক্ষিত থাকলে ডিফল্ট আটটাই থাকুক — নইলে পুরোনো
    // ফাঁকা সেটিং থাকা প্রতিষ্ঠানে কার্ডের মাঝখানটা খালি ছাপত।
    if (Array.isArray(setup.fields) && setup.fields.length) {
      setCheckboxState(setup.fields);
    }

    const t = setup.toggles || {};
    if (t.qr !== undefined) setQrEnabled(t.qr);
    if (t.watermark !== undefined) setWatermarkEnabled(t.watermark);
    if (t.photo !== undefined) setPhotoEnabled(t.photo);
    // পুরোনো সেটিংয়ে একটাই sign/signName/signDate ছিল — ছয়টাতেই বসাই,
    // তারপর নতুন আলাদা কী থাকলে সেটা জেতে (backward compat)
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

    // স্বাক্ষরের নাম — সংরক্ষিত থাকলে সেটাই ইনপুটে বসে
    if (setup.najemName !== undefined) {
      setValue('najem_name_text', setup.najemName || '');
    }
    if (setup.principalName !== undefined) {
      setValue('principal_name_text', setup.principalName || '');
    }

    // রুটিংয়ের সেটিং — আলাদা ঘরে সংরক্ষিত, তাই প্রবেশপত্রের কিছুই ছোঁয় না
    const r = setup.routing || {};
    // পুরোনো সেটিংয়ে মোড ছিল না — তখন রুটিং টেমপ্লেট বাছা থাকলেই
    // সেটা A4, না থাকলে A5। নতুন সেটিংয়ে mode সরাসরি লেখা থাকে।
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

    // লেবেলগুলো পরের ধাপে বসে — কারণ fieldLabels এলে ওটা আবার সব লিখে দেয়
    savedLabelsRef.current = setup.labels || null;
  }, [savedSettings, setValue, selectedTemplate]);

  // প্রতিষ্ঠানের তথ্য এলে স্বাক্ষরের নাম ইনপুটে ডিফল্ট বসে — ইউজার নিজে
  // কিছু লিখে ফেললে বা সংরক্ষিত সেটিং থেকে এসে বসলে আর ছোঁয়া হয় না
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

  // লেবেল সিডিং — ইনপুটে আগে থেকে কিছু থাকলে ছোঁব না।
  // আগে শর্ত ছাড়াই setValue হতো, তাই প্রতি রেন্ডারে (fieldLabels নতুন
  // রেফারেন্স পেলেই) ইউজারের টাইপ করা অক্ষর মুছে গিয়ে ইনপুটটা জমে যেত।
  // এখন: ফাঁকা ঘর কেবল তখনই সিড হয়, নইলে ইউজারের লেখাই থাকে।
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

  // ------------------------------------------------- সবাই ডিফল্টে নির্বাচিত
  // তালিকা এলেই সব শিক্ষার্থীর ঘরে টিক বসে — সাধারণত পুরো শাখারই প্রবেশপত্র
  // একসাথে ছাপা হয়, তাই একটা একটা করে টিক দেওয়ার দরকার পড়ে না।
  useEffect(() => {
    // তালিকা সত্যিই বদলালে তবেই state ছোঁয়া হয়। অ্যারেটা নতুন রেফারেন্স
    // হলেও ভিতরের সারিগুলো এক হলে আগেরটাই ফেরত দিই — তাতে React
    // রেন্ডার বাদ দেয়, আর ভবিষ্যতে কোনো কারণে রেফারেন্স অস্থির হলেও
    // আর কখনো অনন্ত লুপে পড়বে না।
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
    selectedTemplate,
    checkboxState,
    reportType,
    lang,
    qrEnabled,
    watermarkEnabled,
    photoEnabled,
    najemSign,
    najemSignName,
    najemSignDate,
    principalSign,
    principalSignName,
    principalSignDate,
    // রুটিংয়ের কিছু বদলালেও আগের আউটপুট বাতিল
    admitMode,
    routeTemplate,
    routineColor,
    routineColumns,
    seatEnabled,
  ]);

  const totalPages = Math.ceil(studentList.length / PAGE_SIZE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentList.slice(start, start + PAGE_SIZE);
  }, [studentList, currentPage]);

  // ---------------------------------------------------------------- handlers
  const handleTemplateSelect = (id) => {
    // বাম পাশের থাম্বনেইল বা পপআপ — দুই জায়গা থেকেই সাথে সাথে ডিজাইন বদলায়।
    // সংরক্ষণ হয় না; সেটা শুধু "টেমপ্লেট ও ডাটা সেটিং" এর সংরক্ষণ বোতামেই।
    setSelectedTemplate(id);
    // আপলোড করা ডিজাইনে সব ফিল্ডই চলে, তাই সেখানে ছাঁকার কিছু নেই
    if (!isUploadedTemplateId(id)) {
      setCheckboxState((prev) => prev.filter((f) => isFieldAllowedForTemplate(f, id)));
    }
  };

  /**
   * কোন ডিজাইনের ঘর ঠিক করা হচ্ছে — null হলে পর্দাটা নতুন আপলোডের মোডে
   * খোলে। রেকর্ডটা সার্ভারের তালিকা থেকেই নেওয়া হয় (টেমপ্লেট অবজেক্ট
   * নয়), কারণ জমা থাকা `design` ঘরটা ওখানেই আছে।
   */
  const [editTemplate, setEditTemplate] = useState(null);

  const openTemplateEditor = (tpl) => {
    const rec = (uploadedList || []).find(
      (r) => String(r.id) === String(tpl.uploadId)
    );
    if (!rec) return;
    setEditTemplate(rec);
    setShowUploadModal(true);
  };

  /** ঘরগুলো সংরক্ষণ — ছবিটা অক্ষত থাকে, কেবল চারটে মান বদলায় */
  const handleSaveOffsets = async (id, offsets) => {
    await updateAdmitCardTemplate({ id, offsets }).unwrap();

    Swal.fire({
      icon: 'success',
      title: uui('saveOk'),
      timer: 1600,
      showConfirmButton: false,
    });
  };

  /** নিজের ডিজাইন আপলোড — AdmitTemplateUpload থেকে FormData আসে */
  const handleUploadTemplate = async (formData) => {
    const res = await uploadAdmitCardTemplate(formData).unwrap();

    // আপলোডের সাথে সাথেই নতুন ডিজাইনটা বাছা হয়ে যায় — নইলে আবার
    // তালিকা থেকে খুঁজে বের করতে হতো
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

  /** আপলোড করা ডিজাইন মুছে ফেলা */
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

      // মুছে ফেলা ডিজাইনটাই বাছা ছিল — তাহলে বিল্ট-ইন প্রথমটায় ফিরি,
      // নইলে কার্ডটা ভাঙা ছবি নিয়ে ছাপা হতো
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
        ? prev.includes(fieldId)
          ? prev
          : [...prev, fieldId]
        : prev.filter((f) => f !== fieldId)
    );
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? studentList : []);
  };

  const handleRowSelect = (e, student) => {
    setSelectedRows((prev) =>
      e.target.checked
        ? prev.some((r) => r.AdmissionID === student.AdmissionID)
          ? prev
          : [...prev, student]
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
      newRow.SignaturePrincipal =
        row.SignaturePrincipal || institutionInfo?.SignaturePrincipal;
      newRow.NajemName =
        formData.najem_name_text?.trim() || institutionInfo?.NajemName || '';
      newRow.PrincipalName =
        formData.principal_name_text?.trim() || institutionInfo?.PrincipalName || '';

      return newRow;
    });

  const onSubmit = (formData) => {
    // কার্ডে কোন তথ্য বসবে তা বাছা না থাকলে ফাঁকা কার্ড ছাপা হতো —
    // নাম-ঠিকানা-স্বাক্ষর আছে কিন্তু মাঝখানটা খালি। তাই আগেই থামাই
    // আর সরাসরি সেটিং পপআপে যাওয়ার পথ দেখিয়ে দিই।
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

    // রুটিং চালু কিন্তু রুটিনের একটা কলামও বাছা নেই — টেবিলটা ফাঁকা ছাপা হতো
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

    // কোনো সতর্কবার্তায় আটকে গেলে (ফিল্ড/শিক্ষার্থী বাছা নেই) আউটপুট
    // বানানোই হয়নি — লুকানো অবস্থাটা তখন ফিরিয়ে দিতে হয়, নইলে আগের
    // প্রিভিউটা হঠাৎ উধাও হয়ে যেত।
    if (!rows) {
      setPrintOnly(false);
      return;
    }

    await waitForPrintReady();
    window.print();
  });

  /** টেমপ্লেট ও ডাটা সেটিং সংরক্ষণ — WebsiteSettings টেবিলে */
  const handleSaveSetup = async () => {
    const formData = getValues();

    // লেবেল শুধু নির্বাচিত ফিল্ডগুলোরই পাঠাই, নইলে অযথা বড় হয়
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
        // পুরোনো কী — পুরোনো ক্লায়েন্টে/পুরোনো ডাটায় backward compat
        sign: najemSign && principalSign,
        signName: najemSignName && principalSignName,
        signDate: najemSignDate && principalSignDate,
      },

      // রুটিংয়ের সেটিং আলাদা ঘরে — তাই প্রবেশপত্রের পুরোনো সেটিং অটুট
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
      // সংরক্ষণের পর যেন সার্ভারের উত্তর আবার এসে ইউজারের বদল মুছে না দেয়
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

  // "রিপোর্টের ধরণ" — মোড অনুযায়ী তালিকা বদলায়।
  const reportOptions = useMemo(
    () =>
      routineOn
        ? Object.keys(ROUTINE_LAYOUTS).map((id) => ({
            id,
            label: getRoutineLayoutLabel(id, lang),
          }))
        : PLAIN_LAYOUT_ORDER.map((id) => ({ id, label: getLayoutLabel(id, lang) })),
    [routineOn, lang]
  );

  // মোড বদলালে আগের কাগজের ধরণটা নতুন তালিকায় না-ও থাকতে পারে — তখন
  // তালিকার প্রথমটাই বসে যায়, নইলে ড্রপডাউনটা ফাঁকা দেখাত।
  useEffect(() => {
    const ids = reportOptions.map((o) => String(o.id));
    if (!ids.length) return;
    if (!ids.includes(String(reportType || ''))) setValue('ReportID', ids[0]);
  }, [reportOptions, reportType, setValue]);

  // সাধারণ টগল — দুই পাশেই সমানভাবে প্রযোজ্য
  const generalToggles = [
    { id: 'qr', label: ui('qr'), checked: qrEnabled, onChange: setQrEnabled },
    { id: 'photo', label: ui('photo'), checked: photoEnabled, onChange: setPhotoEnabled },
    ...(watermarkLogo
      ? [
          {
            id: 'watermark',
            label: ui('watermark'),
            checked: watermarkEnabled,
            onChange: setWatermarkEnabled,
          },
        ]
      : []),
    {
      id: 'seatLine',
      label: ui('seatLine'),
      checked: seatEnabled,
      onChange: setSeatEnabled,
    },
  ];

  // বাঁ স্বাক্ষরের তিনটি অংশ — ছবি, নামের রেখা, তারিখ
  const najemToggles = [
    { id: 'najemSign', label: ui('sign'), checked: najemSign, onChange: setNajemSign },
    { id: 'najemSignName', label: ui('signName'), checked: najemSignName, onChange: setNajemSignName },
    { id: 'najemSignDate', label: ui('date'), checked: najemSignDate, onChange: setNajemSignDate },
  ];

  // ডান স্বাক্ষরের তিনটি অংশ
  const principalToggles = [
    { id: 'principalSign', label: ui('sign'), checked: principalSign, onChange: setPrincipalSign },
    { id: 'principalSignName', label: ui('signName'), checked: principalSignName, onChange: setPrincipalSignName },
    { id: 'principalSignDate', label: ui('date'), checked: principalSignDate, onChange: setPrincipalSignDate },
  ];

  // প্রিভিউ কার্ডের ডামি ডাটা — ভাষা অনুযায়ী
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
      PrincipalName:
        watch('principal_name_text') || institutionInfo?.PrincipalName,
      NajemName: watch('najem_name_text') || institutionInfo?.NajemName,
      ExamName: getFieldDemo('ExamName', lang),
      SessionName: getFieldDemo('SessionName', lang),
      QRValue: `https://qmmsoft.com/${
        institutionInfo?.InstitutionCode || 'demo'
      }/students/1/1/1/${getFieldDemo('StudentCode', 'en')}`,
    };
    checkboxState.forEach((f) => {
      row[f] = getFieldDemo(f, lang);
      const typed = watch(`fieldkey_${f}`);
      row[`fieldkey_${f}`] =
        typed && String(typed).trim() ? String(typed).trim() : fieldLabels[f];
    });
    return row;
  }, [
    checkboxState,
    fieldLabels,
    institutionInfo,
    instName,
    instAddress,
    lang,
    nameColor,
    nameSize,
    addressColor,
    addressSize,
    examColor, 
    examSize,
    watch,
  ]);

  // আপলোড করা ডিজাইনে সব ফিল্ডই চলে — ADMIT_ALLOWED_FIELDS এ ওই আইডি নেই,
  // তাই শর্তটা না রাখলে ফিল্ডের তালিকাটাই ফাঁকা দেখাত
  const availableFields = ADMIT_FIELDS.filter(
    (f) =>
      isUploadedTemplateId(selectedTemplate) ||
      isFieldAllowedForTemplate(f.id, selectedTemplate)
  );

  const remaining = MAX_FIELD_SELECT - checkboxState.length;

  // আপলোডের পর্দার জন্য — এখন কোন ধরণের ডিজাইন আপলোড হচ্ছে
  const uploadMode = routineOn ? 'A4' : 'A5';
  const uploadSpec = getUploadSpec(uploadMode);

  return (
    <FormProvider {...methods}>
      {/* max-w-full + overflow-x-hidden — ভিতরের ৫২০px কার্ড যেন পুরো পেজ চওড়া না করে */}
      <div
        className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print max-w-full overflow-x-hidden"
        dir={uiDir}
      >
        {/* ================================================== হেডার */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {/* বাঁ পাশ — টেমপ্লেট ও মোড */}
            <div className="flex flex-1 min-w-0 items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="group flex items-stretch gap-2 min-w-0 rounded-[10px] border border-gray-200 bg-white pl-2 pr-3 py-1.5 text-start shadow-sm hover:border-blue-400 hover:bg-blue-50/40 hover:shadow transition"
                title={ui('currentTemplate')}
              >
                <div className="w-[38px] shrink-0 self-center overflow-hidden rounded-[4px] border border-gray-200 bg-white">
                  {routineOn ? (
                    <RoutineThumb
                      template={template}
                      routineColor={routineColor}
                      lang={lang}
                      height={54}
                      routineColumns={routineColumns}
                      routine={previewRoutine}
                      seat={previewSeat}
                      showSeatLine={seatEnabled}
                    />
                  ) : (
                    <TemplateThumb template={template} lang={lang} />
                  )}
                </div>
                <div className="flex flex-col justify-center min-w-0 leading-tight">
                  <span className="text-[11px] font-medium text-gray-500 group-hover:text-blue-600">
                    {ui('templateSelect')}
                  </span>
                  <span className="flex items-center gap-1 mt-0.5 min-w-0">
                    <span className="truncate max-w-[120px] text-[14px] font-bold text-gray-800 group-hover:text-blue-700">
                      {template.title}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </div>
              </button>

              {/* A5 / A4 — প্রবেশপত্রের ধরণ */}
              <div
                className="flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white p-1 shadow-sm shrink-0"
                dir="ltr"
                title={ui('mode')}
              >
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
                      className={`rounded-[7px] px-3 py-1.5 text-[14px] font-bold transition ${
                        on
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {m.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* মাঝে — পেজের শিরোনাম */}
            <h3 className="text-[18px] font-bold text-center whitespace-nowrap order-first w-full sm:order-none sm:w-auto">
              {ui('pageTitle')}
            </h3>

            {/* ডান পাশ — ভাষা ও সেটিং */}
            <div className="flex flex-1 min-w-0 items-center justify-end gap-2 flex-wrap">
              <select
                className="rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-[14px] font-medium text-gray-700 shadow-sm cursor-pointer"
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label={ui('language')}
                dir="ltr"
              >
                {ADMIT_LANGS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="rounded-[8px] bg-blue-600 px-4 py-2 text-[14px] font-medium text-white shadow-sm hover:bg-blue-700 transition whitespace-nowrap"
                onClick={() => setShowSetupModal(true)}
              >
                {ui('setup')}
              </button>
            </div>
          </div>
        </div>

        {/* ===================================== ফিল্টার — এক লাইনে আটটা ঘর */}
        <div className="rounded-[10px] border border-gray-200 bg-gray-50/70 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 items-end gap-3">
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
            />
            <DefaultInput
              label={ui('studentId')}
              valueField="UserCode"
              nameField="UserCode"
              registerKey="UserCode"
            />
            <DefaultSelect
              label={`${ui('reportType')} :`}
              options={reportOptions}
              valueField="id"
              nameField="label"
              registerKey="ReportID"
            />

            {/* প্রিভিউ বোতামটা তুলে দেওয়া হয়েছে — এখন সরাসরি প্রিন্ট।
                ব্রাউজারের প্রিন্ট পর্দাতেই পুরোটা দেখা যায়, তাই আলাদা করে
                পর্দায় বসিয়ে দেখার দরকার পড়ে না। */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
            >
              <PrintIcon />
              {ui('print')}
            </button>
          </div>
        </div>

        {/* ================================ শিক্ষার্থীর ডাটা — পুরো পেজ জুড়ে */}
        <div className="relative mt-6 flex h-[calc(100vh-340px)] min-h-[160px] flex-col overflow-hidden rounded-[10px] border border-gray-200">
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr>
                  <th className="p-2 text-start w-[44px] border-b border-gray-300">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      disabled={!studentList.length}
                      checked={
                        studentList.length > 0 &&
                        selectedRows.length === studentList.length
                      }
                    />
                  </th>
                  <th className="p-2 text-start border-b border-gray-300">
                    {fieldLabels.StudentCode}
                  </th>
                  <th className="p-2 text-start border-b border-gray-300">
                    {fieldLabels.StudentName}
                  </th>
                  <th className="p-2 text-start border-b border-gray-300">
                    {fieldLabels.SubClass}
                  </th>
                  <th className="p-2 text-start border-b border-gray-300">
                    {fieldLabels.RollNo}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((student) => (
                  <tr key={student.AdmissionID} className="border-t border-gray-200">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        onChange={(e) => handleRowSelect(e, student)}
                        checked={selectedRows.some(
                          (r) => r.AdmissionID === student.AdmissionID
                        )}
                      />
                    </td>
                    <td className="p-2">{toLangDigit(student.StudentCode, lang)}</td>
                    <td className="p-2">{getFieldValue(student, 'StudentName', lang)}</td>
                    <td className="p-2">
                      {getFieldValue(student, 'SubClass', lang) ||
                        getFieldValue(student, 'ClassName', lang)}
                    </td>
                    <td className="p-2">{toLangDigit(student.RollNo, lang)}</td>
                  </tr>
                ))}

                {paginatedData.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-12 text-center align-middle">
                      <span className="text-[15px] text-gray-600">
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
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-[2px]">
              <Spinner size={52} stroke={4} className="text-blue-600" />
              <p className="mt-3 text-[16px] font-semibold text-gray-700">
                {ui('loading')}
              </p>
              <p className="mt-1 text-[13px] text-gray-500">{ui('searchHint')}</p>
            </div>
          ) : null}

          <div className="shrink-0 flex items-center justify-center border-t border-gray-200 bg-white px-3 py-2">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {printData?.length && !printOnly ? (
          <p className="mt-2 text-[14px] text-green-700 text-center">
            {ui('ready')(toLangDigit(printData.length, lang))}
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------
          একটাই আউটপুট নোড — স্ক্রিনে প্রিভিউ, প্রিন্টে এটাই ছাপে।
      ------------------------------------------------------------------- */}
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
        <div
          className={`mt-8 max-w-full overflow-x-auto overscroll-x-contain admit-output${
            printOnly ? ' admit-output--print-only' : ''
          }`}
        >
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
            className="rounded-[8px] bg-blue-600 px-6 py-2 text-[14px] text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? ui('saving') : ui('save')}
          </button>
        }
      >
        <div className="grid grid-cols-1 xl:grid-cols-[560px_1fr] gap-7">
          {/* =================================================== বাম পাশ */}
          <div className="min-w-0">
            <div className="xl:sticky xl:top-0 xl:z-10 bg-white pb-3">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold text-gray-700">
                  {routineOn ? rui('routinePreview') : ui('livePreview')}
                </p>
                <p className="text-[14px] font-medium text-gray-600 truncate">
                  {template.title}
                </p>
              </div>

              <div className="overflow-x-auto overscroll-x-contain -mx-1 px-1 pb-2">
                {routineOn ? (
                  <div
                    className="relative mx-auto overflow-hidden rounded-[4px] border border-gray-200"
                    style={{
                      width: ROUTINE_CARD_W * 0.72,
                      height: ROUTINE_CARD_H * 0.72,
                    }}
                    dir="ltr"
                  >
                    <div
                      className="absolute top-0 left-0"
                      style={{
                        width: ROUTINE_CARD_W,
                        height: ROUTINE_CARD_H,
                        transform: 'scale(0.72)',
                        transformOrigin: 'top left',
                      }}
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
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-[520px] shrink-0" dir="ltr">
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
                      seatText={seatEnabled ? previewSeatText : ''}
                    />
                  </div>
                )}
              </div>
              
              {/* ================================================
                  এক লাইনে — টেমপ্লেট সিলেক্ট ও ফন্ট-রঙের তিনটা বক্স।
                  চারটে কলাম: প্রথমটায় টেমপ্লেট, তারপর নাম-ঠিকানা-পরীক্ষা।
                  প্রতিটা বক্সের ভিতরে লেবেল উপরে, নাম্বার মাঝে, রঙ নিচে।
              ================================================ */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-stretch">
                {/* ---- টেমপ্লেট সিলেক্ট ---- */}
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="rounded-[8px] border-2 border-blue-200 p-2 min-w-0 text-start hover:border-blue-500 transition flex flex-col"
                >
                  <p className="text-[11px] text-gray-500 mb-1 truncate">
                    {ui('templateSelect')}
                  </p>
                  <div className="overflow-hidden rounded-[4px] border border-gray-200 flex-1 flex items-center justify-center bg-white">
                    {routineOn ? (
                      <RoutineThumb
                        template={template}
                        routineColor={routineColor}
                        lang={lang}
                        height={110}
                        routineColumns={routineColumns}
                        routine={previewRoutine}
                        seat={previewSeat}
                        showSeatLine={seatEnabled}
                      />
                    ) : (
                      <TemplateThumb template={template} lang={lang} />
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-blue-600 truncate">
                    {ui('changeDesign')}
                  </p>
                </button>

                {/* ---- ফন্ট ও রঙের ৩টা বক্স ---- */}
                {[
                  {
                    key: 'institute_name',
                    label: ui('instituteName'),
                    size: template.nameSize,
                    color: template.nameColor,
                  },
                  {
                    key: 'institute_address',
                    label: ui('address'),
                    size: template.addressSize,
                    color: template.addressColor,
                  },
                  {
                    key: 'exam_name',
                    label: ui('examName'),
                    size: template.examNameSize ?? 13,
                    color: template.examNameColor || template.labelColor,
                  },
                ].map((box) => (
                  <div
                    key={box.key}
                    className="rounded-[8px] border border-gray-200 px-2 py-2 min-w-0 flex flex-col"
                  >
                    {/* লেবেল — সবার উপরে, মাঝ বরাবর */}
                    <p className="text-[11px] text-gray-500 text-center mb-2 truncate">
                      {box.label}
                    </p>

                    {/* নাম্বার ও রঙ — উপর-নিচে, মাঝ বরাবর */}
                    <div className="flex flex-col items-center gap-1.5">
                      <input
                        type="number"
                        className="border rounded px-1 py-0.5 text-center text-[13px]"
                        style={{ width: '100%', maxWidth: 70 }}
                        defaultValue={box.size}
                        {...register(`${box.key}_size_${activeTemplateId}`)}
                      />
                      <input
                        type="color"
                        className="cursor-pointer border-0 bg-transparent p-0"
                        style={{ width: '100%', maxWidth: 70, height: 26 }}
                        defaultValue={box.color}
                        {...register(`${box.key}_color_${activeTemplateId}`)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ----------------- কাগজের ধরণ (আলাদা সারি) ---------------- */}
              <div className="mt-3 rounded-[8px] border border-gray-200 p-2 min-w-0">
                <p className="text-[12px] text-gray-500 mb-2">{ui('mode')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {[
                    {
                      id: ADMIT_MODES.PLAIN,
                      short: ui('modePlainShort'),
                      note: ui('modePlainNote'),
                    },
                    {
                      id: ADMIT_MODES.ROUTINE,
                      short: ui('modeRoutineShort'),
                      note: ui('modeRoutineNote'),
                    },
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
                        className={`flex items-center gap-2 rounded-[6px] border px-2 py-1.5 text-start transition ${
                          on
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`shrink-0 rounded-full border-[4px] ${
                            on ? 'border-blue-600' : 'border-gray-300'
                          }`}
                          style={{ width: 14, height: 14 }}
                        />
                        <span className="min-w-0 leading-tight">
                          <span
                            className={`block text-[14px] font-bold ${
                              on ? 'text-blue-700' : 'text-gray-700'
                            }`}
                            dir="ltr"
                          >
                            {m.short}
                          </span>
                          <span className="block text-[11px] text-gray-500">
                            {m.note}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ================================================== ডান পাশ */}
          <div className="min-w-0">
            <p className="font-bold text-[16px] mb-2">{ui('displaySettings')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {generalToggles.map((tg) => (
                <label
                  key={tg.id}
                  className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <input
                    type="checkbox"
                    className="h-[15px] w-[15px] accent-blue-600"
                    checked={tg.checked}
                    onChange={(e) => tg.onChange(e.target.checked)}
                  />
                  <span className="text-[13px] font-medium text-gray-700">{tg.label}</span>
                </label>
              ))}
            </div>

            {/* আসনের অবস্থা — সিট প্ল্যান আদৌ করা হয়েছে কি না */}
            {seatEnabled ? (
              <p
                className="mt-2 text-[12px]"
                style={{ color: hallSeats.size ? '#15803d' : '#b45309' }}
              >
                {routineFetching
                  ? ui('loading')
                  : hallSeats.size
                  ? `${rui('seatPlanReady')} — ${toLangDigit(hallSeats.size, lang)} ${rui(
                      'seatPlanRows'
                    )}`
                  : rui('noSeatPlan')}
              </p>
            ) : null}

            {/* ---------------- বাঁ পাশের স্বাক্ষর (নায়েম) ---------------- */}
            <p className="font-bold text-[16px] mt-6 mb-2">{ui('leftSignature')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {najemToggles.map((tg) => (
                <label
                  key={tg.id}
                  className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <input
                    type="checkbox"
                    className="h-[15px] w-[15px] accent-blue-600"
                    checked={tg.checked}
                    onChange={(e) => tg.onChange(e.target.checked)}
                  />
                  <span className="text-[13px] font-medium text-gray-700">{tg.label}</span>
                </label>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[150px] border rounded-[8px] px-3 py-1.5 text-[13px]"
                placeholder={ui('signNamePlaceholder')}
                {...register('najem_name_text')}
              />
            </div>

            {/* ---------------- ডান পাশের স্বাক্ষর (মুহতামিম) ---------------- */}
            <p className="font-bold text-[16px] mt-5 mb-2">{ui('rightSignature')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {principalToggles.map((tg) => (
                <label
                  key={tg.id}
                  className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <input
                    type="checkbox"
                    className="h-[15px] w-[15px] accent-blue-600"
                    checked={tg.checked}
                    onChange={(e) => tg.onChange(e.target.checked)}
                  />
                  <span className="text-[13px] font-medium text-gray-700">{tg.label}</span>
                </label>
              ))}
              <input
                type="text"
                className="flex-1 min-w-[150px] border rounded-[8px] px-3 py-1.5 text-[13px]"
                placeholder={ui('signNamePlaceholder')}
                {...register('principal_name_text')}
              />
            </div>

            {/* ফিল্ড নির্বাচন ও লেবেল */}
            <p className="font-bold text-[16px] mt-7 mb-1">
              {checkboxState.length === 0
                ? ui('selectUpTo')(toLangDigit(MAX_FIELD_SELECT, lang))
                : remaining > 0
                ? ui('canAddMore')(toLangDigit(remaining, lang))
                : ui('maxSelected')}
            </p>
            <p className="text-[14px] text-gray-500 mb-4">{ui('labelHint')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableFields.map((f) => {
                const checked = checkboxState.includes(f.id);
                return (
                  <div
                    key={f.id}
                    className={`flex items-center gap-3 border rounded-[8px] px-3 py-2 min-w-0 ${
                      checked ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-[18px] w-[18px] shrink-0"
                      checked={checked}
                      disabled={!checked && checkboxState.length >= MAX_FIELD_SELECT}
                      onChange={(e) => handleFieldToggle(f.id, e.target.checked)}
                    />
                    <span className="text-[15px] w-[110px] shrink-0 truncate">
                      {getFieldName(f.id, lang)}
                    </span>
                    <input
                      className="flex-1 min-w-0 border rounded px-2 py-1 text-[14px]"
                      disabled={!checked}
                      {...register(`fieldkey_${f.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {/* ====================================== রুটিনের সেটিং (শুধু A4) */}
            {routineOn ? (
              <>
                <p className="font-bold text-[16px] mt-8 mb-3">
                  {ui('optionalRouting')}
                </p>

                <p className="text-[14px] font-bold text-gray-700 mb-2">
                  {rui('routineColumns')}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {ROUTINE_COLUMNS.map((c) => {
                    const on = routineColumns.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <input
                          type="checkbox"
                          className="h-[15px] w-[15px] accent-blue-600"
                          checked={on}
                          onChange={(e) =>
                            setRoutineColumns((prev) =>
                              e.target.checked
                                ? prev.includes(c.id)
                                  ? prev
                                  : [...prev, c.id]
                                : prev.filter((x) => x !== c.id)
                            )
                          }
                        />
                        <span className="text-[13px] font-medium text-gray-700">
                          {getRoutineColumnLabel(c.id, lang)}
                        </span>
                      </label>
                    );
                  })}
                </div>

                {/* ডাটার অবস্থা — রুটিন, হল ও সিট প্ল্যান তিনটাই এক নজরে */}
                <div className="mt-5 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2">
                  <p className="text-[13px] text-gray-700">
                    {routineFetching
                      ? ui('loading')
                      : routineRows.length
                      ? `${rui('routineReady')} — ${toLangDigit(
                          routineRows.length,
                          lang
                        )} ${rui('routineRows')}`
                      : rui('noRoutine')}
                  </p>
                  <p className="text-[12px] text-gray-500 mt-0.5">
                    {hallGrid.columns.length
                      ? `${hallGrid.hallName || rui('hall')} — ${toLangDigit(
                          hallGrid.columns.length,
                          lang
                        )} ${rui('column')}, ${rui('totalSeats')} ${toLangDigit(
                          hallGrid.totalSeats,
                          lang
                        )}`
                      : rui('noHall')}
                  </p>
                  <p
                    className="text-[12px] mt-0.5"
                    style={{ color: hallSeats.size ? '#15803d' : '#b45309' }}
                  >
                    {routineFetching
                      ? ui('loading')
                      : hallSeats.size
                      ? `${rui('seatPlanReady')} — ${toLangDigit(
                          hallSeats.size,
                          lang
                        )} ${rui('seatPlanRows')}`
                      : rui('noSeatPlan')}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </Modal>

      {/* ------------------ পপআপ ১ক — টেমপ্লেট সিলেক্ট (সেটিং পপআপের উপরে) */}
      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={ui('selectTemplate')}
        dir={uiDir}
        width={routineOn ? 'max-w-5xl' : 'max-w-4xl'}
        zIndex="z-[60]"
        disableEsc={showUploadModal}
      >
        {/* ------------------------------------------------- রুটিনের রঙ */}
        {routineOn ? (
          <div className="mb-4 rounded-[10px] border border-gray-200 bg-gray-50/70 p-3">
            <p className="text-[14px] font-bold text-gray-700 mb-1">
              {ui('routineColor')}
            </p>
            <p className="text-[12px] text-gray-500 mb-2">{ui('routineColorHint')}</p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setRoutineColor('')}
                className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition ${
                  routineColor
                    ? 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100'
                    : 'border-blue-500 bg-blue-50 text-blue-700'
                }`}
              >
                {ui('routineColorReset')}
              </button>

              {ROUTINE_COLOR_PRESETS.map((hex) => {
                const on = String(routineColor).toLowerCase() === hex.toLowerCase();
                return (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setRoutineColor(hex)}
                    title={hex}
                    aria-label={hex}
                    className={`shrink-0 rounded-full border-2 transition ${
                      on ? 'border-blue-600 scale-110' : 'border-gray-200 hover:border-gray-400'
                    }`}
                    style={{ background: hex, width: 28, height: 28 }}
                  />
                );
              })}

              <label className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="color"
                  className="h-[22px] w-[30px] cursor-pointer border-0 bg-transparent p-0"
                  value={routineColor || routeTpl.table?.borderColor || '#111827'}
                  onChange={(e) => setRoutineColor(e.target.value)}
                />
                <span className="text-[13px] font-medium text-gray-700" dir="ltr">
                  {routineColor || '—'}
                </span>
              </label>
            </div>
          </div>
        ) : null}

        {/* ============================================ ডিজাইনের তালিকা
            প্রথম ঘরটা আপলোডের — তাই নিজের ডিজাইন যোগ করার পথটা ঠিক
            সেখানেই, যেখানে ডিজাইন বাছা হয়। নিচে মাপটাও লেখা থাকে, তাই
            আপলোডের পর্দা না খুলেও কত মাপের ছবি লাগবে তা জানা যায়। */}
        <div
          className={`grid gap-4 ${
            routineOn
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {/* ---- আপলোডের ঘর */}
          <button
            type="button"
            onClick={() => {
              // নতুন আপলোড — আগের সম্পাদনার রেকর্ড পড়ে থাকলে পর্দাটা
              // ভুল করে সম্পাদনার মোডে খুলত
              setEditTemplate(null);
              setShowUploadModal(true);
            }}
            className="flex flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-blue-300 bg-blue-50/40 p-3 text-center transition hover:border-blue-500 hover:bg-blue-50"
            style={{ minHeight: routineOn ? 240 : 180 }}
          >
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-blue-600 text-[24px] leading-none text-white">
              +
            </span>
            <span className="text-[14px] font-bold text-blue-700">
              {uui('uploadNew')}
            </span>
            {/* মাপটা এখানেই লেখা — আপলোডের পর্দা না খুলেও জানা যায় */}
            <span className="text-[11px] leading-snug text-gray-600">
              {formatSize(uploadSpec.width, uploadSpec.height, lang)} px
              <br />
              {formatBytes(uploadSpec.maxBytes, lang)} · PNG/JPG
            </span>
          </button>

          {(routineOn ? routineTemplateList : admitTemplateList).map((tpl) => {
            const on = String(activeTemplateId) === String(tpl.id);
            return (
              <div key={tpl.id} className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => {
                    if (routineOn) setRouteTemplate(tpl.id);
                    else handleTemplateSelect(tpl.id);
                    setShowTemplateModal(false);
                  }}
                  className={`w-full rounded-[10px] border-2 p-2 transition min-w-0 ${
                    on ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="overflow-hidden rounded-[6px] border border-gray-100">
                    {routineOn ? (
                      <RoutineThumb
                        template={tpl}
                        routineColor={routineColor}
                        lang={lang}
                        height={200}
                        routineColumns={routineColumns}
                        routine={previewRoutine}
                        seat={previewSeat}
                        showSeatLine={seatEnabled}
                      />
                    ) : (
                      <TemplateThumb template={tpl} lang={lang} />
                    )}
                  </div>
                  <p className="mt-2 text-center text-[14px] truncate">{tpl.title}</p>
                  {tpl.uploaded ? (
                    <p className="text-center text-[11px] text-blue-600">
                      {uui('uploaded')}
                    </p>
                  ) : null}
                </button>

                {/* আপলোড করা ডিজাইনেই কেবল মোছার বোতাম — বিল্ট-ইনগুলো
                    কোডের অংশ, ওগুলো পর্দা থেকে মোছা যায় না */}
                {tpl.uploaded ? (
                  <>
                    <button
                      type="button"
                      title={uui('delete')}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(tpl);
                      }}
                      className="absolute right-1 top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/90 text-[16px] leading-none text-red-600 shadow hover:bg-red-600 hover:text-white transition"
                    >
                      ×
                    </button>

                    {/* ঘর ঠিক করার বোতাম — ডিজাইনটা নতুন করে আপলোড না
                        করেই চারটে ঘর উপর-নিচ করা যায় */}
                    <button
                      type="button"
                      title={uui('adjustBtn')}
                      onClick={(e) => {
                        e.stopPropagation();
                        openTemplateEditor(tpl);
                      }}
                      className="absolute left-1 top-1 flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white/90 text-[14px] leading-none text-blue-600 shadow hover:bg-blue-600 hover:text-white transition"
                    >
                      ⇕
                    </button>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* ------------------ পপআপ ১খ — নিজের ডিজাইন আপলোড (সবার উপরে) */}
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
        onClose={() => {
          setShowUploadModal(false);
          setEditTemplate(null);
        }}
        onUpload={handleUploadTemplate}
        onSaveOffsets={handleSaveOffsets}
      />
    </FormProvider>
  );
};

/**
 * রুটিন কার্ডের থাম্বনেইল।
 * কার্ডটা ৫২০ × ৭৪০ — তাই উচ্চতা ধরে scale করা হয়। ভিতরে আসল
 * RoutineCardFace ই বসে, তাই থাম্বনেইলে যা দেখা যায় প্রিন্টেও হুবহু তাই আসে।
 */
const RoutineThumb = ({
  template,
  routineColor,
  lang,
  height = 200,
  routineColumns,
  routine,
  seat,
  showSeatLine,
}) => {
  const scale = height / ROUTINE_CARD_H;

  return (
    <div
      className="relative mx-auto overflow-hidden bg-white"
      style={{ height, width: ROUTINE_CARD_W * scale }}
      dir="ltr"
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: ROUTINE_CARD_W,
          height: ROUTINE_CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <RoutineCardFace
          template={template}
          routineColor={routineColor}
          lang={lang}
          fields={['StudentName', 'FatherName', 'SubClass', 'StudentCode']}
          routine={routine}
          seat={seat}
          routineColumns={routineColumns}
          showSeatLine={showSeatLine}
          showQR={false}
          showPhoto
          student={{
            institute_name: 'জামিয়া ইসলামিয়া দারুল মাদরাসা',
            institute_address: 'যাত্রাবাড়ী, ঢাকা',
            ExamName: getFieldDemo('ExamName', lang),
            SessionName: getFieldDemo('SessionName', lang),
            StudentName: getFieldDemo('StudentName', lang),
            FatherName: getFieldDemo('FatherName', lang),
            SubClass: getFieldDemo('SubClass', lang),
            StudentCode: getFieldDemo('StudentCode', lang),
            fieldkey_StudentName: getFieldName('StudentName', lang),
            fieldkey_FatherName: getFieldName('FatherName', lang),
            fieldkey_SubClass: getFieldName('SubClass', lang),
            fieldkey_StudentCode: getFieldName('StudentCode', lang),
          }}
        />
      </div>
    </div>
  );
};

/**
 * টেমপ্লেটের থাম্বনেইল।
 * কার্ডটা স্থির ৫২০px, আর এই ঘরের প্রস্থ breakpoint ভেদে বদলায় —
 * তাই scale টা মেপে বসানো হয়, হার্ডকোড করা হয় না।
 */
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

  // ছবি-ভিত্তিক টেমপ্লেটে (বিল্ট-ইন PNG ও আপলোড করা, দুইটাই) থাম্বনেইলে
  // ছবিটাই দেখাই — পুরো কার্ড আঁকার দরকার নেই, ডিজাইনটা এতেই বোঝা যায়
  if (template.variant === 'image') {
    return (
      <img
        src={template.thumb || template.image}
        alt={template.title}
        className="w-full block"
      />
    );
  }

  return (
    <div
      ref={boxRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${CARD_W} / ${CARD_H}` }}
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: CARD_W,
          height: CARD_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <AdmitCardFace
          template={template}
          lang={lang}
          fields={['StudentName', 'FatherName', 'SubClass', 'StudentCode']}
          showQR={false}
          showPhoto
          student={{
            institute_name: 'জামিয়া ইসলামিয়া দারুল মাদরাসা',
            institute_address: 'যাত্রাবাড়ী, ঢাকা',
            ExamName: getFieldDemo('ExamName', lang),
            SessionName: getFieldDemo('SessionName', lang),
            StudentName: getFieldDemo('StudentName', lang),
            FatherName: getFieldDemo('FatherName', lang),
            SubClass: getFieldDemo('SubClass', lang),
            StudentCode: getFieldDemo('StudentCode', lang),
            fieldkey_StudentName: getFieldName('StudentName', lang),
            fieldkey_FatherName: getFieldName('FatherName', lang),
            fieldkey_SubClass: getFieldName('SubClass', lang),
            fieldkey_StudentCode: getFieldName('StudentCode', lang),
          }}
        />
      </div>
    </div>
  );
};

export default ExamAdmitCard;
