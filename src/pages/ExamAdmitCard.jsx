import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { skipToken } from '@reduxjs/toolkit/query';

import Button from '../components/Button/Button';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';

import { setPageName } from '../features/auth/authSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/student/studentQuerySlice';
// সেটআপের দুইটা hook ও exam স্লাইসেই — রাউটটা /api/exam/admit_card_settings
import {
  useGetStudentAdmitCardsQuery,
  useGetAdmitCardSettingsQuery,
  useSaveAdmitCardSettingsMutation,
  useGetExamRoutineCardQuery,
} from '../features/exam/examQuerySlice';
import {
  useGetInstitutionInfoQuery,
  useGetResidentialQuery,
} from '../features/settings/settingsQuerySlice';

import AdmitCardGenerate, { AdmitCardFace } from '../components/AdmitCardGenerate';
// রুটিংসহ টেমপ্লেট — প্রবেশপত্রের উপরের অংশ হুবহু রেখে নিচে রুটিন ও আসন ছক
import AdmitCardRoutinegenerate, { RoutineCardFace } from '../components/AdmitCardRoutinegenerate';
import {
  ADMIT_FIELDS,
  ADMIT_LANGS,
  ADMIT_TEMPLATES,
  CARD_H,
  CARD_W,
  DEFAULT_ADMIT_FIELDS,
  DEFAULT_ADMIT_LANG,
  MAX_FIELD_SELECT,
  PRINT_LAYOUTS,
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
  normalizeAdmitRow,
  resolveFieldLabels,
  toLangDigit,
} from '../Data/admitCardConfig';
import {
  DEFAULT_ROUTINE_COLUMNS,
  ROUTINE_CARD_H,
  ROUTINE_CARD_W,
  ROUTINE_COLUMNS,
  ROUTINE_DEMO_SEAT,
  ROUTINE_LAYOUTS,
  ROUTINE_TEMPLATES,
  assignHallSeats,
  buildHallGrid,
  getRoutineColumnLabel,
  getRoutineDemoRows,
  getRoutineLayoutLabel,
  getRoutineTemplate,
  getRoutineUIText,
  isRoutineOn,
  normalizeRoutineRows,
} from '../Data/admitCardRoutineconfig';

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

  // চারটা পপআপ
  // ফিল্টার আর পপআপে নেই — সেটা হেডারেই ইনলাইন বসে।
  // টেমপ্লেট নির্বাচন সেটিং পপআপের ভিতরে, নিজেই আরেকটা পপআপ হয়ে খোলে।
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  // রুটিং টেমপ্লেটের তালিকা — হেডার আর সেটিং পপআপ, দুই জায়গা থেকেই এটাই খোলে
  const [showRoutingModal, setShowRoutingModal] = useState(false);

  // ------------------------------------------------- রুটিংসহ টেমপ্লেট
  // null = রুটিং বন্ধ, তখন আগের মতো সাধারণ প্রবেশপত্রই ছাপে।
  // আইডি বসালে একই প্রবেশপত্রের নিচে রুটিন ও আসন ছক যোগ হয়।
  const [routeTemplate, setRouteTemplate] = useState(null);
  const [routineColumns, setRoutineColumns] = useState(DEFAULT_ROUTINE_COLUMNS);
  const [seatEnabled, setSeatEnabled] = useState(true);
  const [routeReportType, setRouteReportType] = useState('1');

  // কার্ড ও এডিটর — দুইটারই ভাষা
  const [lang, setLang] = useState(DEFAULT_ADMIT_LANG);
  const ui = (key) => getUIText(key, lang);
  // রুটিংয়ের নিজের লেখা — ADMIT_UI এ হাত না দিয়ে আলাদা ফাইলে রাখা হয়েছে
  const rui = (key) => getRoutineUIText(key, lang);
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

  // প্রতিষ্ঠানের নাম ও ঠিকানা — ভাষা অনুযায়ী
  const instName = getInstituteName(institutionInfo, lang);
  const instAddress = getInstituteAddress(institutionInfo, lang);

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const SubClassID = watch('SubClassID');
  const UserCode = watch('UserCode');
  const RDID = watch('RDID');
  const reportType = watch('ReportID');

  const nameSize = watch(`institute_name_size_${selectedTemplate}`);
  const nameColor = watch(`institute_name_color_${selectedTemplate}`);
  const addressSize = watch(`institute_address_size_${selectedTemplate}`);
  const addressColor = watch(`institute_address_color_${selectedTemplate}`);
  const examSize = watch(`exam_name_size_${selectedTemplate}`);
  const examColor = watch(`exam_name_color_${selectedTemplate}`);

  const template = getTemplate(selectedTemplate);

  // ফিল্টার পূর্ণ হলেই কেবল তালিকা, প্রিভিউ ও প্রিন্ট দেখানো হয়
  const filterReady = Boolean(SessionID && ExamID && SubClassID && RDID);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const { data: studentAdmitCards = {}, isFetching } = useGetStudentAdmitCardsQuery(
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
  // রুটিন, হলের কলাম ও সারি — আলাদা রাউট।
  // প্রবেশপত্রের মূল রাউটে একটা অক্ষরও বদলানো হয়নি; শিক্ষার্থীর সব ডাটা
  // আগের মতোই ওখান থেকেই আসে, এখান থেকে শুধু বাড়তি জিনিসগুলো।
  // -------------------------------------------------------------------------
  const { data: routineData, isFetching: routineFetching } = useGetExamRoutineCardQuery(
    SessionID && ExamID && SubClassID
      ? { SessionID, ExamID, SubClassID }
      : skipToken
  );

  const routineRows = useMemo(() => normalizeRoutineRows(routineData), [routineData]);
  const hallGrid = useMemo(() => buildHallGrid(routineData || {}), [routineData]);
  // রুটিং চালু কি না — আইডিটা চেনা হলেই
  const routineOn = isRoutineOn(routeTemplate);
  const routeTpl = getRoutineTemplate(routeTemplate);

  // কে কোন আসনে — কলাম → সারি → আসন, ভর্তি সিরিয়ালের ক্রমেই।
  // পুরো তালিকার উপর বসানো হয়, তাই কাকে সিলেক্ট করা হলো তার উপর
  // আসন নম্বর নির্ভর করে না — একই শিক্ষার্থী সবসময় একই আসনই পায়।
  const hallSeats = useMemo(
    () => assignHallSeats(studentList, hallGrid),
    [studentList, hallGrid]
  );

  // প্রিভিউতে আসল রুটিন থাকলে সেটাই, না থাকলে ডামি — তাই ফিল্টার দেওয়ার
  // আগেও সেটিং পপআপে কার্ডটা কেমন দেখাবে তা বোঝা যায়
  const previewRoutine = routineRows.length ? routineRows : getRoutineDemoRows(lang);
  const previewSeat =
    (hallGrid.columns.length ? hallSeats.values().next().value : null) ||
    ROUTINE_DEMO_SEAT;

  const routineReportOptions = Object.keys(ROUTINE_LAYOUTS).map((id) => ({
    id,
    label: getRoutineLayoutLabel(id, lang),
  }));

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
    if (r.templateId) setRouteTemplate(r.templateId);
    if (Array.isArray(r.columns) && r.columns.length) setRoutineColumns(r.columns);
    if (r.seat !== undefined) setSeatEnabled(Boolean(r.seat));
    if (r.reportType) setRouteReportType(String(r.reportType));

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
  // কাউকে বাদ দিতে চাইলে চেকবক্স খুলে নিলেই হলো; ফিল্টার বদলে নতুন তালিকা
  // এলে আবার সবাই নির্বাচিত হয়ে যায়।
  // উপরের রিসেট ইফেক্টের পরে বসানো — তাই একই রেন্ডারে দুইটা চললে
  // শেষেরটাই টেকে, ফলে তালিকা এসে কখনো ফাঁকা নির্বাচনে আটকে থাকে না।
  useEffect(() => {
    setSelectedRows(studentList);
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
    routeTemplate,
    routineColumns,
    seatEnabled,
    routeReportType,
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
    setCheckboxState((prev) => prev.filter((f) => isFieldAllowedForTemplate(f, id)));
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
    // রুটিং চালু থাকলে কাগজের ধরণ রুটিনের নিজের ঘর থেকে আসে, তাই
    // প্রবেশপত্রের রিপোর্ট টাইপ তখন বাধ্যতামূলক নয়
    if (!routineOn && !reportType) {
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

  const handlePreview = handleSubmit((formData) => {
    setPrintOnly(false);
    return onSubmit(formData);
  });

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
        // নতুন — বাঁ (নায়েম) ও ডান (মুহতামিম) আলাদা, প্রতিটার তিনটি অংশ
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
        templateId: routeTemplate || null,
        columns: routineColumns,
        seat: seatEnabled,
        reportType: routeReportType || '1',
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

  const reportOptions = Object.keys(PRINT_LAYOUTS).map((id) => ({
    id,
    label: getLayoutLabel(id, lang),
  }));

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

  const availableFields = ADMIT_FIELDS.filter((f) =>
    isFieldAllowedForTemplate(f.id, selectedTemplate)
  );

  const remaining = MAX_FIELD_SELECT - checkboxState.length;

  // হেডারের ড্রপডাউন-চেহারার বোতাম — পাশের ভাষা select এর সাথে মিলিয়ে
  const dropdownBtn =
    'flex items-center gap-2 min-w-0 rounded-[8px] border border-gray-200 bg-white ' +
    'px-3 py-2 text-[14px] font-medium text-gray-700 shadow-sm ' +
    'hover:border-blue-400 hover:text-blue-700 transition';

  return (
    <FormProvider {...methods}>
      {/* max-w-full + overflow-x-hidden — ভিতরের ৫২০px কার্ড যেন পুরো পেজ চওড়া না করে */}
      <div
        className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print max-w-full overflow-x-hidden"
        dir={uiDir}
      >
        {/* ================================================== হেডার
            তিন ভাগ — বাঁয়ে টেমপ্লেট ও রুটিংয়ের ড্রপডাউন, মাঝে শিরোনাম,
            ডানে ভাষা ও সেটিং। দুই পাশের ঘরেই flex-1 দেওয়া, তাই শিরোনামটা
            ঠিক মাঝখানেই বসে — দুই পাশের বোতামের চওড়া সমান না হলেও।

            বাঁ দিকের দুইটা বোতাম আরও পরিষ্কার করা হয়েছে:
            - টেমপ্লেট বোতামে ছোট লেবেল "টেমপ্লেট সিলেক্ট", থাম্বনেইল,
              নাম এবং নিচমুখী তীরচিহ্ন — ড্রপডাউন বোঝায়।
            - রুটিং বোতামে রুট আইকন, লেবেল "টেমপ্লেট রুটিং সিলেক্ট",
              নাম এবং "আপকামিং" ব্যাজ — ড্যাশড বর্ডারে তাই "এখনো তৈরি হয়নি"
              প্রথম দেখাতেই স্পষ্ট। */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {/* বাঁ পাশ — টেমপ্লেট ও রুটিং, দুইটারই উপরে ছোট লেবেল */}
            <div className="flex flex-1 min-w-0 items-center gap-2 flex-wrap">
              {/* ----------------------------------------------------------
                  টেমপ্লেট নির্বাচন — ক্লিক করলে টেমপ্লেটের তালিকা খোলে
              ---------------------------------------------------------- */}
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="group flex items-stretch gap-2 min-w-0 rounded-[10px] border border-gray-200 bg-white pl-2 pr-3 py-1.5 text-start shadow-sm hover:border-blue-400 hover:bg-blue-50/40 hover:shadow transition"
                title={ui('currentTemplate')}
              >
                <div className="w-[38px] shrink-0 self-center overflow-hidden rounded-[4px] border border-gray-200 bg-white">
                  <TemplateThumb template={template} lang={lang} />
                </div>
                <div className="flex flex-col justify-center min-w-0 leading-tight">
                  <span className="text-[11px] font-medium text-gray-500 group-hover:text-blue-600">
                    {ui('templateSelect')}
                  </span>
                  <span className="flex items-center gap-1 mt-0.5 min-w-0">
                    <span className="truncate max-w-[120px] text-[14px] font-bold text-gray-800 group-hover:text-blue-700">
                      {template.title}
                    </span>
                    {/* নিচমুখী তীর — ড্রপডাউন বোঝায় */}
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

              {/* ----------------------------------------------------------
                  রুটিংসহ টেমপ্লেট — চাপলে রুটিং টেমপ্লেটের তালিকা খোলে।
                  বন্ধ থাকলে ড্যাশড বর্ডার (অ্যাকটিভ নয়), চালু থাকলে সবুজ
                  বর্ডার আর পাশে "চালু" ব্যাজ — এক নজরেই বোঝা যায়।
                  একই তালিকা সেটিং পপআপের "ঐচ্ছিক রুটিং সেটআপ" ঘর থেকেও খোলে।
              ---------------------------------------------------------- */}
              <button
                type="button"
                onClick={() => setShowRoutingModal(true)}
                className={`group flex items-stretch gap-2 min-w-0 rounded-[10px] border pl-2 pr-3 py-1.5 text-start shadow-sm transition ${
                  routineOn
                    ? 'border-emerald-300 bg-emerald-50/60 hover:border-emerald-500 hover:bg-emerald-50'
                    : 'border-dashed border-gray-300 bg-gray-50/60 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
                title={ui('routingTemplate')}
              >
                {/* রুট আইকন */}
                <span
                  className={`flex self-center items-center justify-center w-[38px] h-[38px] rounded-[6px] shrink-0 ${
                    routineOn
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="6" cy="19" r="3" />
                    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
                    <circle cx="18" cy="5" r="3" />
                  </svg>
                </span>
                <div className="flex flex-col justify-center min-w-0 leading-tight">
                  <span className="text-[11px] font-medium text-gray-500 group-hover:text-blue-600">
                    {ui('routingSelect')}
                  </span>
                  <span className="flex items-center gap-1.5 mt-0.5 min-w-0">
                    <span
                      className={`truncate max-w-[130px] text-[14px] font-bold ${
                        routineOn
                          ? 'text-emerald-800'
                          : 'text-gray-700 group-hover:text-blue-700'
                      }`}
                    >
                      {routineOn ? routeTpl.title : rui('routineOff')}
                    </span>
                    {/* চালু থাকলে সবুজ ব্যাজ, নইলে কিছুই নয় */}
                    {routineOn ? (
                      <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                        {rui('routineActive')}
                      </span>
                    ) : null}
                  </span>
                </div>
              </button>
            </div>

            {/* মাঝে — পেজের শিরোনাম */}
            <h3 className="text-[18px] font-bold text-center whitespace-nowrap order-first w-full sm:order-none sm:w-auto">
              {ui('pageTitle')}
            </h3>

            {/* ডান পাশ — ভাষা ও সেটিং */}
            <div className="flex flex-1 min-w-0 items-center justify-end gap-2 flex-wrap">
              {/* ভাষা — আগে তিনটা বোতাম ছিল, এখন একটা ড্রপডাউন */}
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

        {/* ===================================== ফিল্টার — এক লাইনে আটটা ঘর
            ছয়টা ফিল্টারের ঘর, তারপর প্রিভিউ ও প্রিন্ট — মোট আটটা।
            আগে উপরে আলাদা একটা সারি ছিল ("ফিল্টার" শিরোনাম + বোতাম +
            "ফিল্টার মুছুন")। ওই সারিটা পুরোটা উঠে গেছে — ঘর বদলালেই তালিকা
            নিজে থেকে আসে, তাই আলাদা প্রয়োগ বা মোছার বোতাম লাগে না।

            items-end — ঘরগুলোর উপরে লেবেল বসে, তাই নিচের কিনারা মিলিয়ে
            রাখলে বোতাম দুইটা ইনপুটের সাথে এক লাইনে দেখায়। */}
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

            {/* ------------------------------------------- ৭ ও ৮ নং ঘর
                প্রিভিউ ও প্রিন্ট। বাইরের ঘরটা grid — এক কলামের গ্রিডে
                ভিতরের Button কম্পোনেন্টটা নিজে থেকেই পুরো চওড়া নেয়,
                তাই দুইটা বোতাম পাশের ইনপুটগুলোর মতোই সমান চওড়া হয়। */}
            <div className="grid">
              <Button type="button" onClick={handlePreview}>
                {ui('preview')}
              </Button>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full px-5 py-2 rounded-[8px] bg-blue-600 text-white whitespace-nowrap hover:bg-blue-700 transition"
            >
              {ui('print')}
            </button>
          </div>
        </div>

        {/* ================================ শিক্ষার্থীর ডাটা — পুরো পেজ জুড়ে
            ঘরটার উচ্চতা স্থির। কয়জন শিক্ষার্থী এল তার উপর আকার নির্ভর করে না —
            ডাটা কম হলেও ঘরটা ছোট হয় না, বেশি হলে ভিতরেই স্ক্রল হয়। ফলে
            নিচের পেজিনেশন ও বোতামের জায়গা কখনো লাফায় না।
            h-[calc(...)] দিয়ে পর্দার বাকি অংশটুকু নেয়, min-h ছোট পর্দার জন্য। */}
        <div className="mt-6 flex h-[calc(100vh-340px)] min-h-[160px] flex-col overflow-hidden rounded-[10px] border border-gray-200">
          {/* ---------------------------------------- তালিকা, ভিতরে স্ক্রল হয় */}
          <div className="flex-1 min-h-0 overflow-auto">
            <table className="w-full min-w-[520px] border-collapse">
              {/* স্ক্রল করলেও হেডার সারিটা উপরে লেগে থাকে */}
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

                {/* কেউ না থাকলে বার্তাটা পুরো সারি জুড়ে, ঠিক মাঝখানে */}
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

          {/* ------------------------------------------- ঘরের নিচের স্থির সারি
              শুধু পেজিনেশন, ঠিক মাঝখানে। প্রিভিউ ও প্রিন্ট উপরে ফিল্টারের
              সারিতে উঠে গেছে। shrink-0 বলে এই সারিটা কখনো চেপে যায় না। */}
          <div className="shrink-0 flex items-center justify-center border-t border-gray-200 bg-white px-3 py-2">
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* "প্রস্তুত — নিচে দেখুন" শুধু প্রিভিউর বেলায়; প্রিন্টে নিচে
            দেখার মতো কিছু থাকে না, তাই বার্তাটাও বসে না। */}
        {printData?.length && !printOnly ? (
          <p className="mt-2 text-[14px] text-green-700 text-center">
            {ui('ready')(toLangDigit(printData.length, lang))}
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------
          একটাই আউটপুট নোড — স্ক্রিনে প্রিভিউ, প্রিন্টে এটাই ছাপে।
      ------------------------------------------------------------------- */}
      {/* প্রিন্টের জন্য বানানো আউটপুট পর্দা থেকে সরিয়ে রাখার নিয়ম।
          display:none দেওয়া হয়নি ইচ্ছে করেই — তাতে ভিতরের ছবি ও ফন্টের
          মাপজোক ঠিকভাবে হতো না, QR আর কার্ডের লেআউট ভেঙে ছাপা হতো।
          বদলে পুরো ঘরটা পর্দার বাইরে বসানো হয়: লেআউট আগের মতোই হয়,
          ছবি আগের মতোই লোড হয়, শুধু চোখে পড়ে না।
          নিয়মটা @media screen এ, তাই ছাপার সময় এর কোনো প্রভাবই থাকে না। */}
      <style>{`
        /* ছাপার সময় উপরের ফাঁকটুকু থাকলে প্রথম পৃষ্ঠার দ্বিতীয় কার্ডটা
           নিচে নেমে যেত আর পুরো সিরিজটা একটা করে পৃষ্ঠা পিছিয়ে যেত —
           ১২টা কার্ড ৬ পৃষ্ঠার বদলে ৭ পৃষ্ঠা নিত, প্রথম পৃষ্ঠায় একটাই
           কার্ড বসত। পর্দার ফাঁকটা দরকারি, তাই শুধু ছাপার সময় বাদ। */
        @media print {
          /* এই ঘরটাই কার্ডগুলোকে ধরে রাখে। পর্দায় এর max-width আর
             overflow-x দরকার (৫২০px কার্ড যেন পেজ চওড়া না করে), কিন্তু
             ছাপার সময় ওই দুইটাই বিপদ — ছোট পর্দায় ঘরটা সরু হয়ে কার্ডের
             ডান দিক কেটে দিত। ছাপায় তাই সব বাঁধন খুলে দিই।

             buildPrintCss এও একই কাজ :has() দিয়ে করা আছে, সেটা অ্যাপের
             বাইরের খোলসটুকুও ধরে। পুরোনো ব্রাউজারে :has() নেই, তাই
             নিজের ঘরটার জন্য এই নিয়মটা আলাদা করে রাখা। */
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
          {/* grayscale সবসময় false — কালার নির্বাচন বাদ দেওয়া হয়েছে,
              প্রবেশপত্র এখন সবসময় রঙিনই ছাপে।

              রুটিং টেমপ্লেট বাছা থাকলে রুটিনসহ কার্ড ছাপে — ভিতরের উপরের
              অংশটা হুবহু এই প্রবেশপত্রই, নিচে রুটিন ও আসন ছক যোগ হয়।
              বন্ধ থাকলে একদম আগের মতোই সাধারণ প্রবেশপত্র। */}
          {routineOn ? (
            <AdmitCardRoutinegenerate
              templateId={selectedTemplate}
              routineTemplateId={routeTemplate}
              fields={checkboxState}
              data={printData}
              routine={routineRows}
              seats={hallSeats}
              routineColumns={routineColumns}
              showSeatLine={seatEnabled}
              reportType={routeReportType}
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
              fields={checkboxState}
              data={printData}
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

      {/* ============================ পপআপ ১ — টেমপ্লেট ও ডাটা সেটিং (সংরক্ষণ)
          বাঁ পাশে লাইভ প্রিভিউ, স্ক্রল করলেও আটকে থাকে — তাই টেমপ্লেট বদলালে
          বা ফিল্ড/টগল বদলালে সাথে সাথেই কার্ডে ফলটা দেখা যায়।
          ডান পাশে সব সেটিং: টেমপ্লেট নির্বাচন → কী দেখাবে → ফিল্ড ও লেবেল
          → ফন্ট ও কালার → ঐচ্ছিক রুটিং। */}
      <Modal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title={ui('setup')}
        dir={uiDir}
        width="max-w-7xl"
        disableEsc={showTemplateModal || showRoutingModal}
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
          {/* =================================================== বাম পাশ
              টেমপ্লেটের নাম → লাইভ প্রিভিউ → তিনটা ঘর (টেমপ্লেট, নাম, ঠিকানা)।
              কার্ডের চেহারা যা বদলায় সেগুলো প্রিভিউর গা ঘেঁষেই রাখা হলো,
              তাই বদল করলে সাথে সাথে ফলটা চোখে পড়ে। */}
          <div className="min-w-0">
            <div className="xl:sticky xl:top-0 xl:z-10 bg-white pb-3">
              {/* টেমপ্লেটের নাম — আগে প্রিভিউর নিচে ছিল, এখন উপরে */}
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[15px] font-bold text-gray-700">
                  {routineOn ? rui('routinePreview') : ui('livePreview')}
                </p>
                <p className="text-[14px] font-medium text-gray-600 truncate">
                  {routineOn ? `${template.title} + ${routeTpl.title}` : template.title}
                </p>
              </div>

              {/* কার্ডটা ৫২০px স্থির — ছোট স্ক্রিনে এই ঘরটাই পাশে স্ক্রল হবে।
                  রুটিং চালু থাকলে কার্ডটা ৭৪০px লম্বা, তাই পপআপে আঁটানোর
                  জন্য ৭২% এ scale করা হয় — ভিতরের কিছুই বদলায় না। */}
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
                        routeTemplate={routeTpl}
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
                    />
                  </div>
                )}
              </div>

              {/* ------------------------------------------------- তিনটা ঘর */}
              <div className="mt-2 grid grid-cols-2 xl:grid-cols-4 gap-3">
                {/* ঘর ১ — টেমপ্লেট সিলেক্ট, তালিকাটা উপরের পপআপে খোলে */}
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(true)}
                  className="rounded-[8px] border-2 border-blue-200 p-2 min-w-0 text-start hover:border-blue-500 transition"
                >
                  <p className="text-[12px] text-gray-500 mb-1 truncate">
                    {ui('templateSelect')}
                  </p>
                  <div className="overflow-hidden rounded-[4px] border border-gray-200">
                    <TemplateThumb template={template} lang={lang} />
                  </div>
                  <p className="mt-1 text-[12px] text-blue-600 truncate">
                    {ui('changeDesign')}
                  </p>
                </button>

                {/* ঘর ২ — প্রতিষ্ঠানের নামের ফন্ট ও কালার */}
                <div className="rounded-[8px] border border-gray-200 p-2 min-w-0">
                  <p className="text-[12px] text-gray-500 mb-2 truncate">
                    {ui('instituteName')}
                  </p>
                  <div className="flex items-center gap-2" dir="ltr">
                    <input
                      type="number"
                      className="w-[56px] min-w-0 border rounded px-2 py-1 text-[13px]"
                      defaultValue={template.nameSize}
                      {...register(`institute_name_size_${selectedTemplate}`)}
                    />
                    <input
                      type="color"
                      className="w-[36px] h-[28px] shrink-0"
                      defaultValue={template.nameColor}
                      {...register(`institute_name_color_${selectedTemplate}`)}
                    />
                  </div>
                </div>

                {/* ঘর ৩ — ঠিকানার ফন্ট ও কালার */}
                <div className="rounded-[8px] border border-gray-200 p-2 min-w-0">
                  <p className="text-[12px] text-gray-500 mb-2 truncate">{ui('address')}</p>
                  <div className="flex items-center gap-2" dir="ltr">
                    <input
                      type="number"
                      className="w-[56px] min-w-0 border rounded px-2 py-1 text-[13px]"
                      defaultValue={template.addressSize}
                      {...register(`institute_address_size_${selectedTemplate}`)}
                    />
                    <input
                      type="color"
                      className="w-[36px] h-[28px] shrink-0"
                      defaultValue={template.addressColor}
                      {...register(`institute_address_color_${selectedTemplate}`)}
                    />
                  </div>
                </div>
                {/* ঘর ৪ — পরীক্ষার নামের ফন্ট ও কালার */}
                <div className="rounded-[8px] border border-gray-200 p-2 min-w-0">
                  <p className="text-[12px] text-gray-500 mb-2 truncate">
                    {ui('examName')}
                  </p>
                  <div className="flex items-center gap-2" dir="ltr">
                    <input
                      type="number"
                      className="w-[56px] min-w-0 border rounded px-2 py-1 text-[13px]"
                      defaultValue={template.examNameSize ?? 13}
                      {...register(`exam_name_size_${selectedTemplate}`)}
                    />
                    <input
                      type="color"
                      className="w-[36px] h-[28px] shrink-0"
                      defaultValue={template.examNameColor || template.labelColor}
                      {...register(`exam_name_color_${selectedTemplate}`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================== ডান পাশ
              শুধু ডাটার সেটিং — কী দেখাবে, কোন ফিল্ড, আর রুটিং। */}
          <div className="min-w-0">
            {/* কী কী দেখাবে */}
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

            {/* ---------------- বাঁ পাশের স্বাক্ষর (নায়েম) ----------------
                তিনটি অংশ আলাদাভাবে বন্ধ/চালু, আর নিচে নাম ইনপুট —
                ইনপুট ফাঁকা থাকলে প্রতিষ্ঠানের তথ্য থেকে নাম আসবে। */}
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
                    {/* মান setValue দিয়ে বসে — defaultValue বা key লাগে না */}
                    <input
                      className="flex-1 min-w-0 border rounded px-2 py-1 text-[14px]"
                      disabled={!checked}
                      {...register(`fieldkey_${f.id}`)}
                    />
                  </div>
                );
              })}
            </div>

            {/* ======================= একদম নিচে — ঐচ্ছিক রুটিং সেটআপ
                হেডারের বোতামের মতো এখানেও আলাদা করে রুটিং টেমপ্লেট বাছা যায়।
                দুইটাই একই তালিকা খোলে, তাই যেখান থেকেই বাছুন ফল একই।
                বন্ধ থাকলে নিচের ঘরগুলো দেখায় না — অযথা ভিড় বাড়ে না। */}
            <p className="font-bold text-[16px] mt-8 mb-3">{ui('optionalRouting')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-[190px_1fr] gap-3">
              {/* ঘর — রুটিং টেমপ্লেট সিলেক্ট (উপরের টেমপ্লেটের ঘরের মতোই) */}
              <button
                type="button"
                onClick={() => setShowRoutingModal(true)}
                className={`rounded-[8px] border-2 p-2 min-w-0 text-start transition ${
                  routineOn
                    ? 'border-emerald-300 hover:border-emerald-500'
                    : 'border-gray-200 hover:border-blue-400'
                }`}
              >
                <p className="text-[12px] text-gray-500 mb-1 truncate">
                  {ui('routingSelect')}
                </p>

                {routineOn ? (
                  <div className="overflow-hidden rounded-[4px] border border-gray-200">
                    <RoutineThumb
                      template={template}
                      routeTemplate={routeTpl}
                      lang={lang}
                      height={150}
                      routineColumns={routineColumns}
                      routine={previewRoutine}
                      seat={previewSeat}
                      showSeatLine={seatEnabled}
                    />
                  </div>
                ) : (
                  <div className="flex h-[150px] items-center justify-center rounded-[4px] border border-dashed border-gray-300 bg-gray-50 px-2 text-center text-[12px] text-gray-500">
                    {rui('routineOffNote')}
                  </div>
                )}

                <p
                  className={`mt-1 text-[12px] truncate ${
                    routineOn ? 'text-emerald-700' : 'text-blue-600'
                  }`}
                >
                  {routineOn ? routeTpl.title : ui('changeDesign')}
                </p>
              </button>

              {/* ডান পাশ — কলাম, হল, আসন ও কাগজের ধরণ */}
              <div className="min-w-0">
                {routineOn ? (
                  <>
                    {/* রুটিনে কোন কলাম থাকবে */}
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

                    {/* কাগজের ধরণ — হল নির্বাচন রুটিনে লাগে না, তাই বাদ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                      <div className="min-w-0">
                        <p className="text-[12px] text-gray-500 mb-1">
                          {rui('routineReportType')}
                        </p>
                        <select
                          className="w-full rounded-[8px] border border-gray-300 bg-white px-3 py-2 text-[14px]"
                          value={routeReportType}
                          onChange={(e) => setRouteReportType(e.target.value)}
                        >
                          {routineReportOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mt-3">
                      <label className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                        <input
                          type="checkbox"
                          className="h-[15px] w-[15px] accent-blue-600"
                          checked={seatEnabled}
                          onChange={(e) => setSeatEnabled(e.target.checked)}
                        />
                        <span className="text-[13px] font-medium text-gray-700">
                          {rui('seatLine')}
                        </span>
                      </label>
                    </div>

                    {/* ডাটার অবস্থা — রুটিন ও হল আসলেই পাওয়া গেছে কি না */}
                    <div className="mt-4 rounded-[8px] border border-gray-200 bg-gray-50 px-3 py-2">
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
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[150px] items-center justify-center rounded-[8px] border border-dashed border-gray-300 bg-gray-50 px-4 text-center">
                    <p className="text-[13px] text-gray-500">{rui('routineOffNote')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ------------------ পপআপ ১ক — টেমপ্লেট সিলেক্ট (সেটিং পপআপের উপরে)
          DOM এ এটা সেটিং পপআপের ভাই, ভিতরে নয় — তাই ব্যাকড্রপে ক্লিক করলে
          শুধু এটাই বন্ধ হয়, নিচেরটা খোলা থাকে। z-[60] দিয়ে উপরে বসানো। */}
      <Modal
        open={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={ui('selectTemplate')}
        dir={uiDir}
        width="max-w-4xl"
        zIndex="z-[60]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {ADMIT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                handleTemplateSelect(tpl.id);
                setShowTemplateModal(false);
              }}
              className={`rounded-[10px] border-2 p-2 transition min-w-0 ${
                String(selectedTemplate) === String(tpl.id)
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="overflow-hidden rounded-[6px] border border-gray-100">
                <TemplateThumb template={tpl} lang={lang} />
              </div>
              <p className="mt-2 text-center text-[14px] truncate">{tpl.title}</p>
            </button>
          ))}
        </div>
      </Modal>

      {/* ================================= পপআপ ২ — টেমপ্লেট রুটিং সিলেক্ট
          হেডারের বোতাম এবং সেটিং পপআপের "ঐচ্ছিক রুটিং সেটআপ" ঘর — দুইটাই
          এই একই পপআপ খোলে। z-[60] দেওয়া, কারণ সেটিং পপআপের উপরেও বসতে হয়;
          DOM এ সেটিং পপআপের ভাই, তাই ব্যাকড্রপে ক্লিকে শুধু এটাই বন্ধ হয়।

          প্রথম ঘরটা "রুটিং বন্ধ" — ওটা বাছলে আগের মতো সাধারণ প্রবেশপত্রই
          ছাপে, কোনো কিছু হারায় না। */}
      <Modal
        open={showRoutingModal}
        onClose={() => setShowRoutingModal(false)}
        title={rui('pickRoutineTemplate')}
        dir={uiDir}
        width="max-w-5xl"
        zIndex="z-[60]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* ঘর ০ — রুটিং বন্ধ */}
          <button
            type="button"
            onClick={() => {
              setRouteTemplate(null);
              setShowRoutingModal(false);
            }}
            className={`rounded-[10px] border-2 p-2 transition min-w-0 ${
              routineOn
                ? 'border-gray-200 hover:border-blue-300'
                : 'border-blue-600 shadow-lg'
            }`}
          >
            <div className="flex h-[200px] items-center justify-center rounded-[6px] border border-dashed border-gray-300 bg-gray-50 px-3 text-center">
              <p className="text-[12px] text-gray-500">{rui('routineOffNote')}</p>
            </div>
            {/* বাকি ঘরগুলোর মতোই নিচে নাম — তাই "বন্ধ"টাও একটা পছন্দ মনে হয় */}
            <p className="mt-2 text-center text-[14px] truncate">{rui('routineOff')}</p>
          </button>

          {ROUTINE_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setRouteTemplate(tpl.id);
                setShowRoutingModal(false);
              }}
              className={`rounded-[10px] border-2 p-2 transition min-w-0 ${
                String(routeTemplate) === String(tpl.id)
                  ? 'border-blue-600 shadow-lg'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="overflow-hidden rounded-[6px] border border-gray-100">
                <RoutineThumb
                  template={template}
                  routeTemplate={tpl}
                  lang={lang}
                  height={200}
                  routineColumns={routineColumns}
                  routine={previewRoutine}
                  seat={previewSeat}
                  showSeatLine={seatEnabled}
                />
              </div>
              <p className="mt-2 text-center text-[14px] truncate">{tpl.title}</p>
            </button>
          ))}
        </div>
      </Modal>
    </FormProvider>
  );
};

/**
 * রুটিন কার্ডের থাম্বনেইল।
 * কার্ডটা ৫২০ × ৭৪০ — তাই উচ্চতা ধরে scale করা হয়, নইলে ঘরটা অনেক লম্বা
 * হয়ে যেত। ভিতরে আসল RoutineCardFace ই বসে, তাই থাম্বনেইলে যা দেখা যায়
 * প্রিন্টেও হুবহু সেটাই আসে।
 */
const RoutineThumb = ({
  template,
  routeTemplate,
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
          routeTemplate={routeTemplate}
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
 * কার্ডটা স্থির ৫২০px, আর এই ঘরের প্রস্থ breakpoint ভেদে বদলায় (১১০ / ১৫০ / মোডালে আরও বড়) —
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
