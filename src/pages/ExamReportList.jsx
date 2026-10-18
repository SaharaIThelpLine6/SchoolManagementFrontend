import { useEffect, useMemo, useState } from 'react';
import { Buffer } from 'buffer';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import ExamRoutingCheckbox from '../components/Checkboxes/ExamRoutingCheckbox';
import DefaultSelect from '../components/Forms/DefaultSelect';
import {
  colorStatus,
  examReports,
  examVacationStatus,
  fiveLanguageExamReport,
  fourLanguageExamReport,
  language,
  oneLanguageExamReport,
  sevenLanguageExamReport,
  threeLanguageExamReport,
} from '../Data/examReportData';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import { useGetExamReportQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import ArobicNumberClassBasedTC from '../view/exam/ExamReportPdf/numberClassBased/ArobicNumberClassBasedTC';
import ArobicNameWithLegal from '../view/exam/ExamReportPdf/numberLetter/ArobicNameWithLegal';
import ArobicNameWithTwoColumn from '../view/exam/ExamReportPdf/numberLetter/ArobicNameWithTwoColumn';
import BanglaNumberWithTwoColumn from '../view/exam/ExamReportPdf/numberLetter/BanglaNumberWithTwoColumn';
import BanglaWithOutNameColumn from '../view/exam/ExamReportPdf/numberLetter/BanglaWithOutNameColumn';
import BSeatNoColor from '../view/exam/ExamReportPdf/seatNo/Bangla/BSeatNoColor';
import BSeatNoWhite from '../view/exam/ExamReportPdf/seatNo/Bangla/BSeatNoWhite';
import ASeatNoColor from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoColor';
import ASeatNoSeatPlain from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoSeatPlain';
import ASeatNoWhite from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoWhite';
import ExamRoutine from '../view/exam/ExamReportPdf/signatureLetter/ExamRoutine';
import WithoutExamRoutine from '../view/exam/ExamReportPdf/signatureLetter/WithoutExamRoutine';
import SingatureSheetNS from '../view/exam/ExamReportPdf/signatureSheetndNumberSheet/SingatureSheetNS';
import StatisticsOfAllStudents from '../view/exam/ExamReportPdf/StatisticsOfAllStudents';
import ArobicOneColumnA5 from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/ArobicOneColumnA5';
import ArobicTwoColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/ArobicTwoColumn';
import NameWithAddressOneColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/NameWithAddressOneColumn';
import StudentNameWithHolding from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/StudentNameWithHolding';
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import ExaminationRoomSeatingChart from '../view/exam/ExamReportPdf/ExaminationRoomSeatingChart';
import InstituteExamSeatingChart from '../view/exam/ExamReportPdf/InstituteExamSeatingChart';
import ExamReportFive from '../view/exam/ExamReportPdf/numberLetterAdmissionSerial/ExamReportFive';

// ⭐ নতুন — ফি তালিকার পেজ ও সেটিংস
import BanglaFeeList from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/BanglaFeeList';
import FeeListSettingsModal from '../components/Modals/FeeListSettingsModal';
import { loadFeeListSettings, pickFeeRows, sortFeeRows, feeRowsSummary, toBn } from '../Data/feeListColumns';

const API_URL = import.meta.env.VITE_SERVER_URL;

/* ═══════════════════════════════════════════════════════════════════════════
   দুইটা লোগো — কোনটা কোথায়

     প্রতিষ্ঠানের লোগো → কাগজের মাথায়, নামের উপরে বা বাঁ পাশে, স্পষ্ট করে
     জলছাপের লোগো     → পাতার মাঝখানে, হালকা হয়ে পেছনে

   মূল উৎস এখন রুট — loadReportHeader() এ Institution_Information থেকে
   InstitutionLogo আসে আর ...header প্রতিটা সারিতে ছড়িয়ে যায়, তাই কাগজের
   পাতা সারি থেকেই লোগোটা তুলে নেয় (প্রবেশপত্রের কার্ড যেভাবে নেয়)।

   নিচের খোঁজাটা শুধু পেছনের ভরসা — রুট কোনো কারণে লোগো না পাঠালে রিডাক্সের
   সেটিংস বা document_settings এ দেখা হয়।

   লোগো SQL Server এ varbinary, তাই বাইট হয়েই আসে — toImageSrc টা
   AdmitCardGenerate এর হুবহু একই।
   ═══════════════════════════════════════════════════════════════════════════ */

const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

/** লোগো যেসব নামে থাকতে পারে — রুটেরটা InstitutionLogo, তাই ওটা আগে */
const INSTITUTE_LOGO_KEYS = [
  'InstitutionLogo', 'institutionLogo',
  'Logo', 'logo',
  'InstituteLogo', 'instituteLogo',
  'SchoolLogo', 'schoolLogo',
  'HeaderLogo', 'headerLogo',
];

/** আর যেসব ঘরের ভেতরে থাকতে পারে */
const LOGO_CONTAINERS = [
  'institutionInfo', 'institution', 'instituteInfo',
  'data', 'settings', 'settingsData', 'info', 'result',
];

const findInstituteLogo = (source, depth = 0) => {
  if (!source || typeof source !== 'object' || depth > 3) return '';

  for (const key of INSTITUTE_LOGO_KEYS) {
    const src = toImageSrc(source[key]);
    if (src) return src;
  }

  for (const box of LOGO_CONTAINERS) {
    const inner = source[box];
    if (inner && typeof inner === 'object') {
      const found = findInstituteLogo(Array.isArray(inner) ? inner[0] : inner, depth + 1);
      if (found) return found;
    }
  }

  return '';
};

const ExamReportList = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const settingsState = useSelector((state) => state.settings);
  const { status } = settingsState;

  // জলছাপের লোগো (document_settings থেকে)
  const [documentLogo, setDocumentLogo] = useState('');
  const [logoIsActive, setLogoIsActive] = useState(false);
  // একই উত্তরে প্রতিষ্ঠানের লোগোও থাকতে পারে, তাই পুরোটাই রেখে দিই
  const [docSettings, setDocSettings] = useState(null);

  // ফি বিহীন (1) নাকি ফি গৃহীত (2)
  const [feeListType, setFeeListType] = useState(1);

  // ⭐ সাজানোর ক্রম — ভর্তি নং বা আইডি নং, আরোহী বা অবরোহী
  const [sortBy, setSortBy] = useState('AdmissionSerial');
  const [sortOrder, setSortOrder] = useState('asc');

  // ⭐ কলাম সেটিংস
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feeSettings, setFeeSettings] = useState(() => loadFeeListSettings(1, 1));

  const { control, handleSubmit, watch } = methods;
  const formValues = useWatch({ control });
  const selectedReportID = formValues?.ReportID;
  const languageID = formValues?.id;
  const selectedPdfID = formValues?.PdfID;

  const isSeatNoReport = Number(selectedReportID) === 7;
  const isFeeReport = Number(selectedReportID) === 1;
  const langId = Number(languageID) || 1;

  // তালিকার ধরন বা ভাষা বদলালে সেই অনুযায়ী সেভ করা সেটিংসটা তুলে আনি
  useEffect(() => {
    setFeeSettings(loadFeeListSettings(feeListType, langId));
  }, [feeListType, langId]);

  const shouldShowFields = (fieldName) => {
    switch (Number(selectedReportID)) {
      case 1:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID', 'Langauge'].includes(fieldName);
      case 3:
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'RDID', 'Langauge', 'PdfSelect'].includes(fieldName);
      case 4:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID', 'Langauge', 'PdfSelect'].includes(fieldName);
      case 7:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID', 'Langauge', 'PdfSelect'].includes(fieldName);
      case 8:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID'].includes(fieldName);
      case 9:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(fieldName);
      case 10:
        return ['ReportID', 'SessionID', 'ExamID', 'HallList'].includes(fieldName);
      case 11:
        return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [
    ReportID, SessionID, ExamID, SubClassID, RDID, ERIsActive, sevenColor, id, PdfID,
  ] = watch(['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'RDID', 'ERIsActive', 'sevenColor', 'id', 'PdfID']);

  const isSignatureSheet = Number(ReportID) === 8;

  // রিপোর্ট ১ এ PDF বাছাই আর লাগে না — একটাই বাংলা পেজ, সেটিংস দিয়ে বদলায়
  const shouldSkip = (() => {
    if (!ReportID || !SessionID || !ExamID || !SubClassID || !RDID) return true;
    if (isSignatureSheet || Number(ReportID) === 1) return false;
    return !PdfID;
  })();

  // রিপোর্ট ১ এ report_id টা ১ বা ২ ই যায় (পুরোনো আচরণ অক্ষত), আর কোন
  // তালিকা সেটা ListType বলে দেয় — "সকল" (৩) এর জন্য আলাদা report_id নেই
  const actualReportId = Number(ReportID) === 1 ? (feeListType === 2 ? 2 : 1) : ReportID;

  const { data, isLoading, isError, error } = useGetExamReportQuery(
    {
      report_id: actualReportId,
      SessionID,
      ExamID,
      SubClassID,
      RDID,
      ERIsActive,
      Language: id,
      sevenColor,
      pdf_id: PdfID,
      // নিচের তিনটা সার্ভারের জন্য — স্লাইসটা এগুলো URL এ বসালে সার্ভারও
      // একই ক্রমে সাজিয়ে পাঠাবে। না বসালেও ক্ষতি নেই, কারণ বাছাই আর সাজানো
      // দুইটাই এখন এখানেই হয় (নিচে feeRows দেখুন)।
      SortBy: sortBy,
      SortOrder: sortOrder,
      // ১ = ফি বিহীন, ২ = ফি গৃহীত, ৩ = সকল
      ListType: Number(ReportID) === 1 ? feeListType : undefined,
    },
    { skip: shouldSkip }
  );

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examHallList } = useGetExamHallListQuery();

  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (status === 'idle') {
      dispatch(fetchSettingsData());
    }
  }, [status, dispatch, pageTitle]);

  useEffect(() => {
    const fetchDocumentSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/settings/document_settings`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const result = await response.json();
          setDocSettings(result);
          if (result.documentLogo) setDocumentLogo(`${API_URL}/public${result.documentLogo}`);
          setLogoIsActive(result.isActive === true || result.isActive === 'true');
        }
      } catch (err) {
        console.error('Failed to fetch document settings:', err);
      }
    };
    fetchDocumentSettings();
  }, []);

  useEffect(() => {
    if (documentLogo && logoIsActive) {
      const img = new Image();
      img.src = documentLogo;
    }
  }, [documentLogo, logoIsActive]);

  useEffect(() => {
    if (isError && error) {
      setErrorMessage(
        error.status === 403
          ? translate('You do not have permission to view this report')
          : error.status === 400
            ? error.data?.error || translate('Missing or invalid data provided')
            : translate('An error occurred while fetching the report')
      );
    } else {
      setErrorMessage(null);
    }
  }, [isError, error, translate]);

  useEffect(() => {
    if (errorMessage) {
      Swal.fire({ icon: 'error', title: 'Oops...', text: errorMessage });
    }
  }, [errorMessage]);

  const reportMap = {
    1: oneLanguageExamReport,
    3: threeLanguageExamReport,
    4: fourLanguageExamReport,
    7: sevenLanguageExamReport,
  };

  const pdfOptions = useMemo(() => {
    if (!selectedReportID || !languageID) return [];
    const reportList = reportMap[selectedReportID];
    if (!reportList) return [];
    const found = reportList.find((item) => item.id === Number(languageID));
    return found?.pdfList || [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportID, languageID]);

  useEffect(() => {
    setQueryParams({
      ...formValues,
      report_id: actualReportId,
      SortBy: sortBy,
      SortOrder: sortOrder,
      ListType: feeListType,
    });
  }, [formValues, actualReportId, sortBy, sortOrder, feeListType]);

  const onSubmit = () => {
    window.print();
  };

  const handleOpenSettings = () => {
    if (isFeeReport) {
      setSettingsOpen(true);
      return;
    }
    if (Number(selectedReportID) === 3) {
      // দস্তখত পত্রের সেটিংস — পরে বসবে
      console.log('Opening Settings for Signature Letter (Report 3)');
    }
  };

  /* ══════════════════════════════════════════════════════════════════════
     কোন তালিকা আর কোন ক্রমে — এটা এখন এখানেই হয়

     আগে তিনটাই (ListType / SortBy / SortOrder) সার্ভারে পাঠানো হতো, কিন্তু
     useGetExamReportQuery স্লাইসটা নির্দিষ্ট কয়েকটা প্যারামই URL এ বসায় —
     এই তিনটা চুপচাপ বাদ পড়ে যেত। সেজন্যই "সকল তালিকা" ফাঁকা আসত আর সাজানো
     কাজ করত না।

     এখন সার্ভার দুই দলের তালিকাই একসাথে পাঠায়, আর বাছাই-সাজানো এখানে হয়।
     ফল — স্লাইসে হাত দিতে হয় না, আর তালিকা বা ক্রম বদলালে নতুন করে সার্ভারে
     যেতেও হয় না, সাথে সাথেই বদলায়।
     ══════════════════════════════════════════════════════════════════════ */
  const feeRows = useMemo(() => {
    if (!isFeeReport || !data) return [];
    return sortFeeRows(pickFeeRows(data, feeListType), sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isFeeReport, feeListType, sortBy, sortOrder]);

  const summary = useMemo(
    () => (isFeeReport && data ? feeRowsSummary(feeRows, data) : data?.summary),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFeeReport, data, feeRows]
  );

  /**
   * প্রতিষ্ঠানের লোগো — আগে রিডাক্সের সেটিংসে, না পেলে document_settings এর
   * উত্তরে খোঁজা হয়। দুই জায়গাতেই না থাকলে মাথায় লোগো ছাড়াই ছাপা হবে —
   * জলছাপের ছবিটা আর ওখানে বসবে না।
   */
  const instituteLogo = useMemo(
    () => findInstituteLogo(settingsState) || findInstituteLogo(docSettings),
    [settingsState, docSettings]
  );

  /**
   * জলছাপ দেখাবে কিনা — ফি তালিকায় এটা সেটিংস থেকে ঠিক হয়, বাকি
   * রিপোর্টগুলোয় আগের মতোই (লোগো থাকলেই বসে)।
   */
  const showWatermark = !isFeeReport || feeSettings?.showWatermark !== false;

  /** কাগজের পেজটা যা পায় — সাজানো সারিগুলো আর এই তালিকার হিসাব */
  const feeReportData = useMemo(
    () => (isFeeReport && data ? { ...data, data: feeRows, total: feeRows.length, summary } : data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isFeeReport, data, feeRows, summary]
  );

  return (
    <>
      <style>
        {`
          @media print {
            .watermark-print {
              position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
              opacity: 0.05; z-index: 9999; pointer-events: none;
              max-width: 60%; max-height: 60%;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            /* ⭐ উপরে আটকানো কার্ডটা কাগজে আটকে থাকার দরকার নেই */
            .exam-report-bar { position: static !important; }
          }
          @media screen { .watermark-print { display: none; } }
        `}
      </style>

      {/* জলছাপ — শুধু পেছনে, হালকা হয়ে। কাগজের মাথার লোগো এটা নয়। */}
      {!isSeatNoReport && documentLogo && logoIsActive && showWatermark && (
        <img src={documentLogo} alt="Watermark" className="watermark-print" />
      )}

      <div>
        <div className="flex flex-col font-default gap-3 print:hidden">
          {/*
            ⭐ উপরে আটকানো (sticky) — তালিকা লম্বা হলেও রিপোর্ট বাছাই,
               ফিল্টার আর সাজানোর ঘরগুলো চোখের সামনেই থাকে, নিচে স্ক্রল
               করে আবার উপরে ফিরতে হয় না।
          */}
          <div className="exam-report-bar relative w-full rounded-2xl bg-white shadow-md border border-slate-200 overflow-hidden">

            {/* ═══ রঙিন হেডার ═══════════════════════════ */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-4">

              {/* ---- উপরের সারি: শিরোনাম, গণনা, বোতাম ---- */}
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <h1 className="text-white font-bold text-lg leading-tight">{translate('Exam Report')}</h1>
                  <p className="text-white/80 text-xs mt-0.5">শিক্ষাবর্ষ ও পরীক্ষা অনুযায়ী রিপোর্ট তৈরি করুন</p>
                </div>

                <div className="ml-auto flex items-center gap-2 shrink-0">
                  {isFeeReport && summary && (
                    <>
                      <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        দিয়েছে: {summary.paidCount}
                      </span>
                      <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white">
                        <span className="h-2 w-2 rounded-full bg-rose-300" />
                        দেয়নি: {summary.unpaidCount}
                      </span>
                    </>
                  )}

                  {Boolean(selectedReportID) && (
                    <button
                      type="button"
                      onClick={onSubmit}
                      className="h-10 px-4 rounded-xl bg-white text-indigo-700 font-semibold text-sm shadow-sm hover:bg-indigo-50 flex items-center gap-2 transition"
                      title="প্রিন্ট করুন"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      প্রিন্ট
                    </button>
                  )}

                  {(isFeeReport || Number(selectedReportID) === 3) && (
                    <button
                      type="button"
                      onClick={handleOpenSettings}
                      className="h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition"
                      title="সেটিংস"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* ═══ ফর্ম ═════════════════════════════════ */}
            <div className="p-5 space-y-4">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                  {/* রিপোর্ট বাছাই + ফি তালিকার ধরন */}
                  <div className="flex flex-col lg:flex-row gap-4 items-end">
                    <div className="w-full lg:w-1/3">
                      <DefaultSelect
                        label={translate('Report')}
                        nameField="ReportName"
                        registerKey="ReportID"
                        valueField="ReportID"
                        options={examReports}
                        type="number"
                        require="This Field is required"
                        defaultSelect={false}
                        unicode={true}
                      />
                    </div>

                    {/*
                      তালিকার ধরন — তিনটা:
                        ১ ফি বিহীন   → যারা এখনো ফি দেয়নি
                        ২ ফি গৃহীত   → যারা ফি দিয়েছে
                        ৩ সকল        → দুই দলই একসাথে
                    */}
                    {isFeeReport && (
                      <div className="w-full lg:flex-1 rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap px-2">
                          তালিকার ধরন:
                        </span>
                        {[
                          { id: 1, text: 'ফি বিহীন তালিকা' },
                          { id: 2, text: 'ফি গৃহীত তালিকা' },
                          { id: 3, text: 'সকল তালিকা' },
                        ].map((opt) => {
                          const on = feeListType === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setFeeListType(opt.id)}
                              className={`relative flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                                on
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {opt.text}
                              {on && (
                                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white border border-emerald-500 flex items-center justify-center">
                                  <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ফিল্টারগুলো */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                    {shouldShowFields('SessionID') && (
                      <DefaultSelect label={translate('Session')} nameField="SessionName" registerKey="SessionID" valueField="SessionID" options={sessionData ?? []} require="This Field is required" defaultSelect={false} unicode={true} />
                    )}

                    {shouldShowFields('ExamID') && (
                      <DefaultSelect label={translate('Exam')} nameField="ExamName" registerKey="ExamID" valueField="ExamID" options={examNameData ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('SubClassID') && (
                      <DefaultSelect label={translate('SubClass')} nameField="SubClass" registerKey="SubClassID" valueField="SubClassID" options={SubClassListData ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('RDID') && (
                      <DefaultSelect label={translate('Residential')} nameField="ResidentialName" registerKey="RDID" valueField="RDID" options={residentialData ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('Langauge') && (
                      <DefaultSelect label={translate('Langauge')} nameField="name" registerKey="id" valueField="id" options={language ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('PdfSelect') && pdfOptions.length > 0 && (
                      <DefaultSelect label={translate('PDF Select')} nameField="name" registerKey="PdfID" valueField="PdfID" options={pdfOptions} require="This Field is required" />
                    )}

                    {Number(selectedReportID) === 5 && (
                      <DefaultSelect label={translate('PDF Select')} nameField="name" registerKey="PdfID" valueField="PdfID" options={fiveLanguageExamReport} require="This Field is required" />
                    )}

                    {shouldShowFields('ExamVacationStatus') && (
                      <div className="col-span-1 md:col-span-2">
                        <ExamRoutingCheckbox label={translate('Exam Routine')} options={examVacationStatus} registerKey="ERIsActive" require={isFeeReport ? 'This Field is required' : false} />
                      </div>
                    )}

                    {shouldShowFields('ColorStatus') && (
                      <div className="col-span-1">
                        <ExamRoutingCheckbox label={translate('Color Status')} options={colorStatus} registerKey="sevenColor" require={isFeeReport ? 'This Field is required' : false} />
                      </div>
                    )}

                    {shouldShowFields('HallList') && (
                      <DefaultSelect options={examHallList} registerKey="HallId" nameField="HallName" valueField="ID" label={translate('Exam Hall')} />
                    )}
                  </div>

                  {/* ⭐ সাজানোর ক্রম — শুধু ফি তালিকার জন্য */}
                  {isFeeReport && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-1">
                        <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                        সাজানো:
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'AdmissionSerial', text: 'ভর্তি নং' },
                          { key: 'UserCode', text: 'আইডি নং' },
                        ].map((opt) => {
                          const on = sortBy === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setSortBy(opt.key)}
                              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                on
                                  ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>

                      {/* কত জন উঠল — তালিকা বদলালেই সাথে সাথে বদলায় */}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-700">
                        দেখাচ্ছে: {toBn(feeRows.length)} জন
                      </span>

                      <div className="flex gap-1 ml-auto rounded-lg border border-slate-200 bg-white p-1">
                        {[
                          { key: 'asc', text: 'ছোট → বড়', icon: 'M5 15l7-7 7 7' },
                          { key: 'desc', text: 'বড় → ছোট', icon: 'M19 9l-7 7-7-7' },
                        ].map((opt) => {
                          const on = sortOrder === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setSortOrder(opt.key)}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition ${
                                on ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={opt.icon} />
                              </svg>
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </form>
              </FormProvider>
            </div>
          </div>
        </div>

        {/* ═══ লোডিং ═══════════════════════════════════ */}
        {isLoading && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white py-14 text-center print:hidden">
            <div className="inline-block h-8 w-8 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm mt-3">তালিকা আনা হচ্ছে…</p>
          </div>
        )}

        {/* ═══ প্রিন্ট এরিয়া ════════════════════════════ */}
        <div className="print:block">

          {/* ১. পরীক্ষার ফি তালিকা — বাংলা (নতুন একক পেজ) */}
          {isFeeReport && langId === 1 && !isLoading && (
            <BanglaFeeList
              reportData={feeReportData}
              queryParams={queryParams}
              settings={feeSettings}
              instituteLogo={instituteLogo}
              documentLogo={documentLogo}
              logoIsActive={logoIsActive}
              listType={feeListType}
              language={langId}
            />
          )}

          {/* ১খ. আরবি — আগের পেজগুলো আপাতত আগের মতোই */}
          {isFeeReport && langId === 2 && Number(selectedPdfID) === 1 && <ArobicTwoColumn />}
          {isFeeReport && langId === 2 && Number(selectedPdfID) === 2 && <ArobicOneColumnA5 />}
          {isFeeReport && langId === 2 && Number(selectedPdfID) === 3 && <NameWithAddressOneColumn />}
          {isFeeReport && langId === 2 && Number(selectedPdfID) === 4 && <StudentNameWithHolding />}

          {/* ২. দস্তখত পত্র */}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 1 && <ExamRoutine reportData={data} queryParams={queryParams} />}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 2 && <WithoutExamRoutine reportData={data} queryParams={queryParams} requireSeatPlan />}

          {/* ৩. নম্বর পত্র */}
          {Number(selectedReportID) === 4 && Number(languageID) === 1 && Number(selectedPdfID) === 1 && <BanglaNumberWithTwoColumn reportData={data} queryParams={queryParams} />}
          {Number(selectedReportID) === 4 && Number(languageID) === 1 && Number(selectedPdfID) === 2 && <BanglaWithOutNameColumn reportData={data} queryParams={queryParams} />}
          {Number(selectedReportID) === 4 && Number(languageID) === 1 && Number(selectedPdfID) === 3 && <ExamReportFive data={data} />}
          {Number(selectedReportID) === 4 && Number(languageID) === 1 && Number(selectedPdfID) === 4 && <ArobicNumberClassBasedTC />}

          {Number(selectedReportID) === 4 && Number(languageID) === 2 && Number(selectedPdfID) === 1 && <ArobicNameWithTwoColumn reportData={data} queryParams={queryParams} />}
          {Number(selectedReportID) === 4 && Number(languageID) === 2 && Number(selectedPdfID) === 2 && <ArobicNameWithLegal />}
          {Number(selectedReportID) === 4 && Number(languageID) === 2 && Number(selectedPdfID) === 3 && <ExamReportFive data={data} />}
          {Number(selectedReportID) === 4 && Number(languageID) === 2 && Number(selectedPdfID) === 4 && <ArobicNumberClassBasedTC />}

          {/* ৪. সিট নং */}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 1 && (
            <BSeatNoWhite queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} showSeatNo studentList={Array.isArray(data) ? data : data?.data} />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 2 && (
            <BSeatNoColor queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} showSeatNo />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 3 && (
            <BSeatNoWhite queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} showSeatNo={false} studentList={Array.isArray(data) ? data : data?.data} />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 2 && Number(selectedPdfID) === 1 && (
            <ASeatNoWhite queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 2 && Number(selectedPdfID) === 2 && (
            <ASeatNoColor queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 2 && Number(selectedPdfID) === 3 && (
            <ASeatNoSeatPlain queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} />
          )}

          {/* ৫. স্বাক্ষরপত্র ও নম্বরসীট */}
          {Number(selectedReportID) === 8 && (
            <SingatureSheetNS reportData={data} queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} />
          )}

          {/* ৬. সকল পরীক্ষার্থীর পরিসংখ্যান */}
          {Number(selectedReportID) === 9 && <StatisticsOfAllStudents />}

          {/* ৭. পরীক্ষা কক্ষের আসন বিন্যাস */}
          {Number(selectedReportID) === 10 && <ExaminationRoomSeatingChart queryParams={queryParams} />}

          {/* ৮. প্রতিষ্ঠানের আসন বিন্যাস */}
          {Number(selectedReportID) === 11 && <InstituteExamSeatingChart queryParams={queryParams} />}
        </div>
      </div>

      {/* ═══ সেটিংস মডাল ═════════════════════════════ */}
      <FeeListSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        listType={feeListType}
        language={langId}
        onSaved={setFeeSettings}
      />
    </>
  );
};

export default ExamReportList;