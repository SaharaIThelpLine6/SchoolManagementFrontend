import { useEffect, useMemo, useState, useRef } from 'react';
import { Buffer } from 'buffer';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { skipToken } from '@reduxjs/toolkit/query';
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
  signatureRoutineOptions,
  signatureSeatOptions,
  threeLanguageExamReport,
} from '../Data/examReportData';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetExamRoutineReportQuery } from '../features/reports/reportQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import { useGetExamReportQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import BSeatNoColor from '../view/exam/ExamReportPdf/seatNo/Bangla/BSeatNoColor';
import BSeatNoWhite from '../view/exam/ExamReportPdf/seatNo/Bangla/BSeatNoWhite';
import ASeatNoColor from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoColor';
import ASeatNoSeatPlain from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoSeatPlain';
import ASeatNoWhite from '../view/exam/ExamReportPdf/seatNo/English/ASeatNoWhite';
import ExamRoutine from '../view/exam/ExamReportPdf/signatureLetter/ExamRoutine';
import WithoutExamRoutine from '../view/exam/ExamReportPdf/signatureLetter/WithoutExamRoutine';
import StatisticsOfAllStudents from '../view/exam/ExamReportPdf/StatisticsOfAllStudents';
import ArobicOneColumnA5 from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/ArobicOneColumnA5';
import ArobicTwoColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/ArobicTwoColumn';
import NameWithAddressOneColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/NameWithAddressOneColumn';
import StudentNameWithHolding from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/StudentNameWithHolding';
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import ExaminationRoomSeatingChart from '../view/exam/ExamReportPdf/ExaminationRoomSeatingChart';
import InstituteExamSeatingChart from '../view/exam/ExamReportPdf/InstituteExamSeatingChart';

// ⭐ নতুন — ফি তালিকার পেজ ও সেটিংস
import BanglaFeeList from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/BanglaFeeList';
import FeeListSettingsModal from '../components/Modals/FeeListSettingsModal';
import {
  loadFeeListSettings,
  saveFeeListSettings,
  pickFeeRows,
  sortFeeRows,
  feeRowsSummary,
  toBn,
  paperColumnCount,
} from '../Data/feeListColumns';

// ⭐ নতুন — সিট কার্ডের সেটিংস (কোন ঘরগুলো কার্ডে বসবে)
import SeatCardSettingsModal from '../components/Modals/SeatCardSettingsModal';
import { loadSeatCardSettings } from '../Data/seatCardFields';

// ⭐ ৩ নং — নম্বর পত্র ও স্বাক্ষরপত্র (আগের ৩ আর ৫ এক হয়ে)
import NumberSheetPaper from '../view/exam/ExamReportPdf/numberLetter/NumberSheetPaper';
import NumberSheetSettingsModal from '../components/Modals/NumberSheetSettingsModal';
import {
  NUMBER_SHEET_FIELDS,
  ORIENTATIONS,
  PAPERS,
  SORT_KEYS,
  TITLE_DEFAULT,
  columnCount,
  loadNumberSheetSettings,
  maxFieldsFor,
  orientationValue,
  paperById,
  saveNumberSheetSettings,
  sortKeyValue,
  sortOrderValue,
  toggleField,
  visibleFields,
} from '../Data/numberSheetColumns';

// ⭐ ৯ নং — পরীক্ষার রুটিন (গ্রিড)
import ExamRoutinePaper from '../view/exam/ExamReportPdf/ExamRoutinePaper';
import {
  getClassText,
  getRRText,
  getSubClassText,
} from '../Data/Examroutinereportconfig';

const API_URL = import.meta.env.VITE_SERVER_URL;

const ROUTINE_REPORT_ID = 12;

const toImageSrc = (img) => {
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (img?.data) {
    const base64String = Buffer.from(img.data).toString('base64');
    return `data:image/png;base64,${base64String}`;
  }
  return '';
};

const INSTITUTE_LOGO_KEYS = [
  'InstitutionLogo', 'institutionLogo',
  'Logo', 'logo',
  'InstituteLogo', 'instituteLogo',
  'SchoolLogo', 'schoolLogo',
  'HeaderLogo', 'headerLogo',
];

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

  const [documentLogo, setDocumentLogo] = useState('');
  const [logoIsActive, setLogoIsActive] = useState(false);
  const [docSettings, setDocSettings] = useState(null);

  const [feeListType, setFeeListType] = useState(3);

  const [sortBy, setSortBy] = useState('AdmissionSerial');
  const [sortOrder, setSortOrder] = useState('asc');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [feeSettings, setFeeSettings] = useState(() => loadFeeListSettings(1, 1));

  const [seatSettingsOpen, setSeatSettingsOpen] = useState(false);
  const [seatSettings, setSeatSettings] = useState(() => loadSeatCardSettings(1));

  const [numberSettingsOpen, setNumberSettingsOpen] = useState(false);
  const [numberSettings, setNumberSettings] = useState(() => loadNumberSheetSettings(1));

  const [routineHideEmptyRows, setRoutineHideEmptyRows] = useState(false);
  const [routineHideEmptyShift, setRoutineHideEmptyShift] = useState(false);
  const [routineShowClassCol, setRoutineShowClassCol] = useState(false);
  const [routineShowRoom, setRoutineShowRoom] = useState(false);
  const [routineShowTime, setRoutineShowTime] = useState(true);

  const [isColumnDropdownOpen, setIsColumnDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { control, handleSubmit, watch, register, setValue } = methods;
  const formValues = useWatch({ control });
  const selectedReportID = formValues?.ReportID;
  const languageID = formValues?.id;
  const selectedPdfID = formValues?.PdfID;

  const isSeatNoReport = Number(selectedReportID) === 7;
  const isFeeReport = Number(selectedReportID) === 1;
  const isNumberSheet = [4, 8].includes(Number(selectedReportID));
  const isRoutineReport = Number(selectedReportID) === ROUTINE_REPORT_ID;
  const langId = Number(languageID) || 1;

  const routineLang = langId === 2 ? 'ar' : langId === 3 ? 'en' : 'bn';
  const rui = (key) => getRRText(key, routineLang);

  const [kitabId, setKitabId] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsColumnDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applySettings = (next) => {
    setFeeSettings(next);
    if (next?.sortBy) setSortBy(next.sortBy);
    if (next?.sortOrder) setSortOrder(next.sortOrder);
  };

  const paperColumns = paperColumnCount(feeSettings?.paperColumns);

  const changePaperColumns = (value) => {
    const next = { ...feeSettings, paperColumns: paperColumnCount(value) };
    saveFeeListSettings(feeListType, langId, next);
    applySettings(next);
  };

  useEffect(() => {
    applySettings(loadFeeListSettings(feeListType, langId));
  }, [feeListType, langId]);

  useEffect(() => {
    setSeatSettings(loadSeatCardSettings(langId));
  }, [langId]);

  useEffect(() => {
    setNumberSettings(loadNumberSheetSettings(langId));
  }, [langId]);

  // ⭐ Quick Change: শুধু স্টেট আপডেট হবে, LocalStorage এ সেভ হবে না (স্থায়ী সেভ সেটিংস মডাল থেকে হবে)
  const changeNumberSetting = (patch) => {
    setNumberSettings((prev) => ({ ...prev, ...patch }));
  };

  // ⭐ সেটিংস মডাল যে তালিকা ও যে কি থেকে পড়ে, ড্রপডাউনও হুবহু সেটাই
  const numberFieldLimit = maxFieldsFor(numberSettings.columns);

  const activeFields = useMemo(
    () => visibleFields(numberSettings).map((f) => f.key),
    [numberSettings]
  );

  const numberFieldsFull = activeFields.length >= numberFieldLimit;

  const handleToggleColumn = (key) => {
    changeNumberSetting({
      visible: toggleField(numberSettings.visible, key, numberFieldLimit),
    });
  };

  const shouldShowFields = (fieldName) => {
    switch (Number(selectedReportID)) {
      case 1:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID', 'Langauge'].includes(fieldName);
      case 3:
        // ⭐ একটা PdfSelect এর বদলে দুইটা আলাদা ফিল্টার — রুটিন আর সিট নং
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'RDID', 'Langauge', 'SigRoutine', 'SigSeat'].includes(fieldName);
      case 4:
      case 8:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID', 'SubClassID', 'Langauge'].includes(fieldName);
      case 7:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'SubClassID', 'Langauge', 'PdfSelect'].includes(fieldName);
      case 9:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(fieldName);
      case 10:
        return ['ReportID', 'SessionID', 'ExamID', 'HallList'].includes(fieldName);
      case 11:
        return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
      case ROUTINE_REPORT_ID:
        return ['ReportID', 'SessionID', 'ExamID', 'Langauge'].includes(fieldName);
      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [
    ReportID, SessionID, ExamID, SubClassID, RDID, ERIsActive, sevenColor, id, PdfID, ClassID,
    SigRoutine, SigSeat,
  ] = watch(['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'RDID', 'ERIsActive', 'sevenColor', 'id', 'PdfID', 'ClassID', 'SigRoutine', 'SigSeat']);

  /* ═══════════════════════════════════════════════════════════════════════
     ২ নং স্বাক্ষরপত্র — দুইটা ফিল্টার থেকে PdfID

     ব্যবহারকারী দুইটা আলাদা ড্রপডাউন বাছে, কিন্তু ব্যাকএন্ড, queryParams
     আর নিচের কাগজের শাখাগুলো আগের মতোই PdfID দেখে। তাই এখানে দুইটা
     মিলিয়ে PdfID বসিয়ে দেওয়া হয় — বাকি কোথাও হাত দিতে হয়নি।

       রুটিন সহ   + সিট নং সহ    → ১
       রুটিন সহ   + সিট নং ছাড়া  → ৩
       রুটিন ছাড়া + সিট নং সহ    → ৪
       রুটিন ছাড়া + সিট নং ছাড়া  → ২

     দুইটার একটাও বাছা না হলে PdfID ফাঁকা করে দিই — নইলে অন্য রিপোর্ট
     থেকে ফিরে আসার সময় আগের PdfID টা রয়ে গিয়ে কাগজ বসে যেত, অথচ
     ফিল্টার দুইটা তখনো খালি।
     ═══════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (Number(ReportID) !== 3) return;

    if (!SigRoutine || !SigSeat) {
      if (PdfID) setValue('PdfID', '');
      return;
    }

    const withRoutine = Number(SigRoutine) === 1;
    const withSeat = Number(SigSeat) === 1;
    const nextPdfID = withRoutine ? (withSeat ? 1 : 3) : (withSeat ? 4 : 2);

    if (Number(PdfID) !== nextPdfID) setValue('PdfID', nextPdfID);
  }, [ReportID, SigRoutine, SigSeat, PdfID, setValue]);

  const isSignatureSheet = Number(ReportID) === 8;
  const isStatistics = Number(ReportID) === 9;

  const shouldSkip = (() => {
    if (!ReportID || !SessionID || !ExamID) return true;
    if (isRoutineReport) return true;
    if (isStatistics) return false;
    if (!SubClassID || !RDID) return true;
    if (isNumberSheet) return false;
    if (isSignatureSheet || Number(ReportID) === 1) return false;
    return !PdfID;
  })();

  const actualReportId = (() => {
    if (Number(ReportID) === 1) return feeListType === 2 ? 2 : 1;
    if (Number(ReportID) === 8) return 4;
    return ReportID;
  })();

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
      SortBy: sortBy,
      SortOrder: sortOrder,
      ListType: Number(ReportID) === 1 ? feeListType : undefined,
    },
    { skip: shouldSkip }
  );

  const { data: routineData, isFetching: routineFetching } = useGetExamRoutineReportQuery(
    isRoutineReport && SessionID && ExamID
      ? {
          SessionID,
          ExamID,
          ...(ClassID ? { ClassID } : {}),
          ...(SubClassID ? { SubClassID } : {}),
        }
      : skipToken
  );

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examHallList } = useGetExamHallListQuery();

  const routineClassOptions = useMemo(() => routineData?.classes ?? [], [routineData]);

  const numberClassOptions = useMemo(() => {
    const seen = new Map();

    for (const g of SubClassListData || []) {
      const id = g?.ClassID;
      if (id === null || id === undefined || String(id) === '') continue;

      const key = String(id);
      if (seen.has(key)) continue;

      const label =
        getClassText(g, routineLang) ||
        (typeof g.Class === 'string' ? g.Class : '') ||
        g.ClassName ||
        g.ClassNameEng ||
        (g.Class && typeof g.Class === 'object'
          ? g.Class.Class || g.Class.ClassName || ''
          : '') ||
        key;

      seen.set(key, { ClassID: id, label });
    }

    return [...seen.values()];
  }, [SubClassListData, routineLang]);

  const numberSubClassOptions = useMemo(() => {
    const base = SubClassListData || [];
    if (!isNumberSheet || !ClassID) return base;
    return base.filter((g) => String(g.ClassID ?? '') === String(ClassID));
  }, [SubClassListData, isNumberSheet, ClassID]);

  useEffect(() => {
    if (!isNumberSheet || !SubClassID) return;
    const ok = numberSubClassOptions.some(
      (g) => String(g.SubClassID) === String(SubClassID)
    );
    if (!ok) setValue('SubClassID', '');
  }, [isNumberSheet, numberSubClassOptions, SubClassID, setValue]);

  const routineSubClassOptions = useMemo(() => {
    const base =
      (Array.isArray(SubClassListData) && SubClassListData.length
        ? SubClassListData
        : routineData?.subClasses) ?? [];

    if (!ClassID) return base;
    return base.filter((g) => String(g.ClassID ?? '') === String(ClassID));
  }, [SubClassListData, routineData, ClassID]);

  useEffect(() => {
    if (!isRoutineReport || !SubClassID) return;
    const ok = routineSubClassOptions.some(
      (g) => String(g.SubClassID) === String(SubClassID)
    );
    if (!ok) setValue('SubClassID', '');
  }, [isRoutineReport, routineSubClassOptions, SubClassID, setValue]);

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
    if (isSeatNoReport) {
      setSeatSettingsOpen(true);
      return;
    }
    if (isNumberSheet) {
      setNumberSettingsOpen(true);
      return;
    }
    if (Number(selectedReportID) === 3) {
      console.log('Opening Settings for Signature Letter (Report 3)');
    }
  };

  const feeRows = useMemo(() => {
    if (!isFeeReport || !data) return [];
    return sortFeeRows(pickFeeRows(data, feeListType), sortBy, sortOrder);
  }, [data, isFeeReport, feeListType, sortBy, sortOrder]);

  const summary = useMemo(
    () => (isFeeReport && data ? feeRowsSummary(feeRows, data) : data?.summary),
    [isFeeReport, data, feeRows]
  );

  const numberSheetRows = useMemo(() => {
    if (!isNumberSheet || !data) return [];
    return Array.isArray(data) ? data : data.data ?? [];
  }, [isNumberSheet, data]);

  const examSubjects = useMemo(
    () => (isNumberSheet && data && Array.isArray(data.subjects) ? data.subjects : []),
    [isNumberSheet, data]
  );

  const numberSheetHeader = useMemo(
    () => (isNumberSheet && data && !Array.isArray(data) ? data.header ?? null : null),
    [isNumberSheet, data]
  );

  const subjectLabel = (sub) => {
    if (!sub) return '';
    return (
      (langId === 2 ? sub.SubjectNameAra || sub.SubjectName : sub.SubjectName) ||
      sub.SubjectNameEng ||
      ''
    );
  };

  useEffect(() => {
    if (!kitabId) return;
    if (!examSubjects.some((sub) => String(sub.SubID) === String(kitabId))) {
      setKitabId('');
    }
  }, [examSubjects]);

  const selectedKitab = useMemo(
    () => examSubjects.find((sub) => String(sub.SubID) === String(kitabId)) || null,
    [examSubjects, kitabId]
  );

  const kitabName = subjectLabel(selectedKitab);

  const subClassName =
    (langId === 2
      ? numberSheetHeader?.SubClassAra || numberSheetHeader?.SubClass
      : numberSheetHeader?.SubClass) ||
    numberSheetRows[0]?.SubClassName ||
    numberSheetRows[0]?.SubClass ||
    (SubClassListData || []).find((c) => String(c.SubClassID) === String(SubClassID))?.SubClass ||
    '';

  const instituteLogo = useMemo(
    () => findInstituteLogo(settingsState) || findInstituteLogo(docSettings),
    [settingsState, docSettings]
  );

  const showWatermark = !isFeeReport || feeSettings?.showWatermark !== false;

  const watermarkLogo = useMemo(() => {
    const firstFeeRow = feeRows[0] || {};
    return (
      toImageSrc(
        firstFeeRow.InstitutionLogo ||
        firstFeeRow.Logo ||
        firstFeeRow.logo ||
        firstFeeRow.InstituteLogo
      ) ||
      instituteLogo ||
      documentLogo
    );
  }, [feeRows, instituteLogo, documentLogo]);

  const routineLogo = useMemo(
    () =>
      toImageSrc(routineData?.header?.InstitutionLogo) ||
      instituteLogo ||
      documentLogo,
    [routineData, instituteLogo, documentLogo]
  );

  const watermarkOpacity = isFeeReport
    ? Math.min(Math.max(Number(feeSettings?.watermarkOpacity) || 5, 2), 30) / 100
    : 0.05;

  const feeReportData = useMemo(
    () => (isFeeReport && data ? { ...data, data: feeRows, total: feeRows.length, summary } : data),
    [isFeeReport, data, feeRows, summary]
  );

  return (
    <>
      <style>
        {`
          @media print {
            .watermark-print {
              position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
              z-index: 9999; pointer-events: none;
              max-width: 60%; max-height: 60%;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .exam-report-bar { position: static !important; }
          }
          @media screen { .watermark-print { display: none; } }
        `}
      </style>

      {!isSeatNoReport && !isRoutineReport && watermarkLogo && logoIsActive && showWatermark && (
        <img
          src={watermarkLogo}
          alt=""
          className="watermark-print"
          style={{ opacity: watermarkOpacity }}
        />
      )}

      <div>
        <div className="flex flex-col font-default gap-3 print:hidden">
          <div className="exam-report-bar relative w-full rounded-2xl bg-white shadow-md border border-slate-200">

            {/* ═══ রঙিন হেডার ═══════════════════════════ */}
            <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-5 py-4 rounded-t-2xl">
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

                  {(isFeeReport || isSeatNoReport || isNumberSheet || Number(selectedReportID) === 3) && (
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-end">
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

                    {shouldShowFields('SessionID') && (
                      <DefaultSelect label={translate('Session')} nameField="SessionName" registerKey="SessionID" valueField="SessionID" options={sessionData ?? []} require="This Field is required" defaultSelect={false} unicode={true} />
                    )}

                    {shouldShowFields('ExamID') && (
                      <DefaultSelect label={translate('Exam')} nameField="ExamName" registerKey="ExamID" valueField="ExamID" options={examNameData ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('SubClassID') && (
                      <DefaultSelect label={translate('SubClass')} nameField="SubClass" registerKey="SubClassID" valueField="SubClassID" options={(isNumberSheet ? numberSubClassOptions : SubClassListData) ?? []} require="This Field is required" unicode={true} />
                    )}

                    {isNumberSheet && shouldShowFields('ClassID') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {rui('mainClass')}
                        </label>
                        <div className="relative">
                          <select
                            {...register('ClassID')}
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="">{rui('allClass')}</option>
                            {numberClassOptions.map((c) => (
                              <option key={c.ClassID} value={c.ClassID}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                          <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {isRoutineReport && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {rui('mainClass')}
                          </label>
                          <div className="relative">
                            <select
                              {...register('ClassID')}
                              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">{rui('allClass')}</option>
                              {routineClassOptions.map((c) => (
                                <option key={c.ClassID} value={c.ClassID}>
                                  {getClassText(c, routineLang) || c.ClassID}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {rui('subClass')}
                          </label>
                          <div className="relative">
                            <select
                              {...register('SubClassID')}
                              className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">{rui('allSubClass')}</option>
                              {routineSubClassOptions.map((g) => (
                                <option key={g.SubClassID} value={g.SubClassID}>
                                  {getSubClassText(g, routineLang) || g.SubClassID}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </>
                    )}

                    {shouldShowFields('RDID') && (
                      <DefaultSelect label={translate('Residential')} nameField="ResidentialName" registerKey="RDID" valueField="RDID" options={residentialData ?? []} require="This Field is required" unicode={true} />
                    )}

                    {shouldShowFields('Langauge') && (
                      <DefaultSelect label={translate('Langauge')} nameField="name" registerKey="id" valueField="id" options={language ?? []} require="This Field is required" unicode={true} />
                    )}

                    {isFeeReport && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          কলাম
                        </label>

                        <div className="relative">
                          <select
                            value={paperColumns}
                            onChange={(e) => changePaperColumns(e.target.value)}
                            title="দুই কলামে কাগজের দুই পাশে দুইটা তালিকা বসে"
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value={1}>এক কলাম</option>
                            <option value={2}>দুই কলাম</option>
                          </select>

                          <svg
                            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* ⭐ ২ নং স্বাক্ষরপত্রের দুইটা আলাদা ফিল্টার, দুইটাই বাধ্যতামূলক */}
                    {shouldShowFields('SigRoutine') && (
                      <DefaultSelect
                        label="পরীক্ষার রুটিন"
                        nameField="name"
                        registerKey="SigRoutine"
                        valueField="id"
                        options={signatureRoutineOptions}
                        require="This Field is required"
                        unicode={true}
                      />
                    )}

                    {shouldShowFields('SigSeat') && (
                      <DefaultSelect
                        label="সিট নং"
                        nameField="name"
                        registerKey="SigSeat"
                        valueField="id"
                        options={signatureSeatOptions}
                        require="This Field is required"
                        unicode={true}
                      />
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

                  {isFeeReport && (
                    <div className="w-full rounded-xl border border-emerald-200 bg-emerald-50/50 p-2 flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap px-2">
                        তালিকার ধরন:
                      </span>
                      {[
                        { id: 3, text: 'সকল তালিকা' },
                        { id: 1, text: 'ফি বিহীন তালিকা' },
                        { id: 2, text: 'ফি গৃহীত তালিকা' },
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

                  {isRoutineReport && (
                    <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-1">
                        <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        কাগজের সাজ:
                      </span>

                      {[
                        {
                          key: 'rows',
                          text: rui('hideEmptyRow'),
                          on: routineHideEmptyRows,
                          set: setRoutineHideEmptyRows,
                        },
                        {
                          key: 'shift',
                          text: rui('hideEmptyShift'),
                          on: routineHideEmptyShift,
                          set: setRoutineHideEmptyShift,
                        },
                        {
                          key: 'class',
                          text: rui('showClassCol'),
                          on: routineShowClassCol,
                          set: setRoutineShowClassCol,
                        },
                        {
                          key: 'time',
                          text: rui('showTime'),
                          on: routineShowTime,
                          set: setRoutineShowTime,
                        },
                        {
                          key: 'room',
                          text: rui('showRoom'),
                          on: routineShowRoom,
                          set: setRoutineShowRoom,
                        },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 cursor-pointer hover:bg-slate-50 transition"
                        >
                          <input
                            type="checkbox"
                            className="h-[15px] w-[15px] accent-teal-600"
                            checked={opt.on}
                            onChange={(e) => opt.set(e.target.checked)}
                          />
                          <span className="text-[13px] font-medium text-slate-700">{opt.text}</span>
                        </label>
                      ))}

                      {routineData?.rows?.length ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-teal-200 px-3 py-1 text-xs font-semibold text-teal-700 ml-auto">
                          {toBn(routineData.rows.length)} টি শ্রেণি ·{' '}
                          {toBn(routineData.columns?.length ?? 0)} দিন
                        </span>
                      ) : null}
                    </div>
                  )}

                  {isNumberSheet && (
                    <div className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-fuchsia-50 to-violet-50 p-3 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700 px-1">
                        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        কিতাব:
                      </span>

                      <div className="relative w-[190px] shrink-0">
                        <select
                          value={kitabId}
                          onChange={(e) => setKitabId(e.target.value)}
                          disabled={!examSubjects.length}
                          className={`w-full appearance-none rounded-lg border px-3 py-2 pr-9 text-sm font-medium outline-none transition ${
                            examSubjects.length
                              ? 'border-violet-300 bg-white text-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-200'
                              : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <option value="">
                            {examSubjects.length ? 'কিতাব বাছুন (ফাঁকা রাখলে ঘরটা খালি যাবে)' : 'এই পরীক্ষার রুটিনে কোনো কিতাব নেই'}
                          </option>
                          {examSubjects.map((sub) => (
                            <option key={sub.SubID} value={sub.SubID}>
                              {subjectLabel(sub)}
                            </option>
                          ))}
                        </select>

                        <svg
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">সাজানো:</span>

                        <div className="flex gap-2">
                          {SORT_KEYS.map((opt) => {
                            const isActive = sortKeyValue(numberSettings.sortBy) === opt.key;
                            const isAsc = sortOrderValue(numberSettings.sortOrder) === 'asc';

                            return (
                              <button
                                key={opt.key}
                                type="button"
                                onClick={() => {
                                  if (isActive) {
                                    changeNumberSetting({ sortOrder: isAsc ? 'desc' : 'asc' });
                                  } else {
                                    changeNumberSetting({ sortBy: opt.key, sortOrder: 'asc' });
                                  }
                                }}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-all ${
                                  isActive
                                    ? 'border-violet-500 bg-violet-50 shadow-sm'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                <span className={`text-sm ${isActive ? 'text-violet-700 font-bold' : 'text-slate-600 font-medium'}`}>
                                  {opt.label}
                                </span>
                                
                                <div className={`w-[1px] h-4 ${isActive ? 'bg-violet-200' : 'bg-slate-200'}`} />
                                
                                <div className="flex items-center gap-1">
                                  <svg
                                    className={`h-3.5 w-3.5 transition-colors ${
                                      isActive && isAsc ? 'text-violet-700' : 'text-slate-300'
                                    }`}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7 7-7 7 7" />
                                  </svg>
                                  <svg
                                    className={`h-3.5 w-3.5 transition-colors ${
                                      isActive && !isAsc ? 'text-violet-700' : 'text-slate-300'
                                    }`}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7-7 7-7-7" />
                                  </svg>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ⭐ নতুন ডাইনামিক চেকবক্স ড্রপডাউন */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
                          কলাম:
                        </span>
                        
                        <div className="relative" ref={dropdownRef}>
                          <button
                            type="button"
                            onClick={() => setIsColumnDropdownOpen(!isColumnDropdownOpen)}
                            className="flex items-center justify-between min-w-[130px] appearance-none rounded-lg border border-violet-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                          >
                            <span className="truncate">
                              {activeFields.length > 0
                                ? `${toBn(activeFields.length)} / ${toBn(numberFieldLimit)} টি কলাম`
                                : 'কলাম নির্বাচন'}
                            </span>
                            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isColumnDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-60 rounded-md bg-white shadow-lg border border-gray-200 py-1 max-h-72 overflow-y-auto">
                              {NUMBER_SHEET_FIELDS.map((f) => {
                                const isChecked = activeFields.includes(f.key);
                                const locked = !isChecked && numberFieldsFull;

                                return (
                                  <label
                                    key={f.key}
                                    title={
                                      locked
                                        ? 'সীমায় পৌঁছে গেছে — আগে একটা কলাম বন্ধ করুন'
                                        : undefined
                                    }
                                    className={`flex items-center gap-2.5 px-4 py-2 transition-colors ${
                                      locked
                                        ? 'opacity-40 cursor-not-allowed'
                                        : 'hover:bg-slate-50 cursor-pointer'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={locked}
                                      onChange={() => handleToggleColumn(f.key)}
                                      className="h-4 w-4 accent-violet-600 rounded border-gray-300"
                                    />
                                    <span className={`text-sm ${isChecked ? 'font-semibold text-violet-700' : 'text-slate-700'}`}>
                                      {numberSettings.labels?.[f.key]?.trim() || f.label}
                                    </span>
                                  </label>
                                );
                              })}

                              <p className="px-4 pt-1.5 pb-1 text-[11px] text-slate-400 border-t border-slate-100 mt-1">
                                {columnCount(numberSettings.columns) === 2
                                  ? 'দুই কলামে সর্বোচ্চ ৪টি ঘর বসে'
                                  : 'সর্বোচ্চ ৮টি ঘর বসে'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-medium text-slate-500 whitespace-nowrap">
                          শিরোনাম:
                        </span>

                        <div className="relative min-w-[180px]">
                          <input
                            type="text"
                            value={numberSettings.title ?? ''}
                            placeholder={TITLE_DEFAULT}
                            onChange={(e) => changeNumberSetting({ title: e.target.value })}
                            title="কাগজের শিরোনাম — কাগজের পট্টিতেও সরাসরি লেখা যায়"
                            className="w-full rounded-lg border border-violet-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                          />
                          <svg
                            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-500"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[
                          {
                            key: 'paper',
                            title: 'কাগজের মাপ',
                            value: paperById(numberSettings.paper).id,
                            options: PAPERS.map((p) => ({ id: p.id, label: p.label })),
                            pick: (v) => changeNumberSetting({ paper: paperById(v).id }),
                          },
                          {
                            key: 'orientation',
                            title: 'দিক',
                            value: orientationValue(numberSettings.orientation),
                            options: ORIENTATIONS,
                            pick: (v) => changeNumberSetting({ orientation: orientationValue(v) }),
                          },
                          {
                            key: 'columns',
                            title: 'কলাম',
                            value: columnCount(numberSettings.columns),
                            options: [
                              { id: 1, label: '১ কলাম' },
                              { id: 2, label: '২ কলাম' },
                            ],
                            pick: (v) => changeNumberSetting({ columns: columnCount(v) }),
                          },
                        ].map((sel) => (
                          <div key={sel.key} className="relative">
                            <select
                              title={sel.title}
                              value={sel.value}
                              onChange={(e) => sel.pick(e.target.value)}
                              className="appearance-none rounded-lg border border-violet-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-200"
                            >
                              {sel.options.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <svg
                              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-violet-500"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
        {(isLoading || routineFetching) && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white py-14 text-center print:hidden">
            <div className="inline-block h-8 w-8 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm mt-3">তালিকা আনা হচ্ছে…</p>
          </div>
        )}

        {/* ═══ প্রিন্ট এরিয়া ════════════════════════════ */}
        <div className="print:block">

          {/* ১. পরীক্ষার ফি তালিকা — বাংলা */}
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

          {/* ২. স্বাক্ষরপত্র(দস্তখত) */}
          {/* PdfID টা উপরের দুইটা ফিল্টার (রুটিন + সিট নং) থেকে হিসাব হয়ে বসে:
              ১ রুটিন সহ + সিট নং সহ    | ৩ রুটিন সহ + সিট নং ছাড়া
              ৪ রুটিন ছাড়া + সিট নং সহ  | ২ রুটিন ছাড়া + সিট নং ছাড়া

              সিট নং সহ → ExamRoutine (হল ধরে ধরে, সিট প্ল্যান লাগে)
              সিট নং ছাড়া → WithoutExamRoutine (পুরো শ্রেণি একসাথে)
              useRoutine → কিতাবের কলাম রুটিন থেকে, নইলে পরীক্ষার শর্ত থেকে */}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 1 && (
            <ExamRoutine reportData={data} queryParams={queryParams} useRoutine />
          )}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 3 && (
            <WithoutExamRoutine reportData={data} queryParams={queryParams} useRoutine />
          )}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 4 && (
            <ExamRoutine reportData={data} queryParams={queryParams} useRoutine={false} />
          )}
          {Number(selectedReportID) === 3 && Number(languageID) === 1 && Number(selectedPdfID) === 2 && (
            <WithoutExamRoutine reportData={data} queryParams={queryParams} useRoutine={false} />
          )}

          {/* ৩. নম্বর পত্র ও স্বাক্ষরপত্র */}
          {isNumberSheet && (
            <NumberSheetPaper
              reportData={numberSheetRows}
              header={numberSheetHeader}
              settings={numberSettings}
              subClassName={subClassName}
              kitabName={kitabName}
              instituteLogo={instituteLogo || watermarkLogo}
              onTitleChange={(title) => changeNumberSetting({ title })}
            />
          )}

          {/* ৪. সিট নং */}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 1 && (
            <BSeatNoWhite queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} instituteLogo={instituteLogo} showSeatNo settings={seatSettings} studentList={Array.isArray(data) ? data : data?.data} />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 2 && (
            <BSeatNoColor queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} showSeatNo />
          )}
          {Number(selectedReportID) === 7 && Number(languageID) === 1 && Number(selectedPdfID) === 3 && (
            <BSeatNoWhite queryParams={queryParams} documentLogo={documentLogo} logoIsActive={logoIsActive} instituteLogo={instituteLogo} showSeatNo={false} settings={seatSettings} studentList={Array.isArray(data) ? data : data?.data} />
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

          {/* ৬. সকল পরীক্ষার্থীর পরিসংখ্যান */}
          {isStatistics && !isLoading && (
            <StatisticsOfAllStudents
              reportData={data}
              queryParams={queryParams}
              instituteLogo={instituteLogo}
              language={langId}
            />
          )}

          {/* ৭. পরীক্ষা কক্ষের আসন বিন্যাস */}
          {Number(selectedReportID) === 10 && <ExaminationRoomSeatingChart queryParams={queryParams} />}

          {/* ৮. প্রতিষ্ঠানের আসন বিন্যাস */}
          {Number(selectedReportID) === 11 && <InstituteExamSeatingChart queryParams={queryParams} />}

          {/* ৯. পরীক্ষার রুটিন */}
          {isRoutineReport && !routineFetching && (
            <ExamRoutinePaper
              reportData={routineData}
              lang={routineLang}
              instituteLogo={routineLogo}
              showWatermark={logoIsActive}
              hideEmptyRows={routineHideEmptyRows}
              hideEmptyShift={routineHideEmptyShift}
              showClassCol={routineShowClassCol}
              showRoom={routineShowRoom}
              showTime={routineShowTime}
            />
          )}
        </div>
      </div>

      {/* ═══ সেটিংস মডাল ═════════════════════════════ */}
      <FeeListSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        listType={feeListType}
        language={langId}
        onSaved={applySettings}
        watermarkLogo={watermarkLogo}
      />

      {/* ⭐ সিট কার্ডের সেটিংস — কোন ঘরগুলো কার্ডে বসবে */}
      <SeatCardSettingsModal
        open={seatSettingsOpen}
        onClose={() => setSeatSettingsOpen(false)}
        language={langId}
        onSaved={setSeatSettings}
      />

      {/* ⭐ নম্বর পত্র ও স্বাক্ষরপত্রের সেটিংস */}
      <NumberSheetSettingsModal
        open={numberSettingsOpen}
        onClose={() => setNumberSettingsOpen(false)}
        language={langId}
        onSaved={setNumberSettings}
        watermarkLogo={watermarkLogo}
      />
    </>
  );
};

export default ExamReportList;
