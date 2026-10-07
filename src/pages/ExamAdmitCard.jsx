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
} from '../features/exam/examQuerySlice';
import {
  useGetInstitutionInfoQuery,
  useGetResidentialQuery,
} from '../features/settings/settingsQuerySlice';

import AdmitCardGenerate, { AdmitCardFace } from '../components/AdmitCardGenerate';
import {
  ADMIT_FIELDS,
  ADMIT_LANGS,
  ADMIT_TEMPLATES,
  CARD_H,
  CARD_W,
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

/** প্রিন্টের আগে ফন্ট ও সব ছবি লোড হওয়া পর্যন্ত অপেক্ষা */
const waitForPrintReady = async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ফন্ট API না থাকলে এড়িয়ে যাই */
  }

  const images = Array.from(document.querySelectorAll('.admit-print-root img'));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          })
    )
  );
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

/** এখনো তৈরি হয়নি এমন সুবিধার জন্য একই চেহারার বার্তা */
const UpcomingBox = ({ label, note }) => (
  <div className="rounded-[10px] border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
    <p className="text-[20px] font-bold text-gray-700">{label}</p>
    <p className="mt-2 text-[14px] text-gray-500">{note}</p>
  </div>
);

const ExamAdmitCard = ({ pageTitle = 'Exam Admit Card' }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { watch, register, handleSubmit, setValue, getValues, reset } = methods;

  const [selectedTemplate, setSelectedTemplate] = useState(
    ADMIT_TEMPLATES[0]?.id ?? null
  );
  const [checkboxState, setCheckboxState] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // চারটা পপআপ
  // ফিল্টার আর পপআপে নেই — সেটা হেডারেই ইনলাইন বসে।
  // টেমপ্লেট নির্বাচন সেটিং পপআপের ভিতরে, নিজেই আরেকটা পপআপ হয়ে খোলে।
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showRoutingModal, setShowRoutingModal] = useState(false);

  // কার্ড ও এডিটর — দুইটারই ভাষা
  const [lang, setLang] = useState(DEFAULT_ADMIT_LANG);
  const ui = (key) => getUIText(key, lang);
  const uiDir = getAdmitDir(lang);

  // লোকাল টগল — সব ডিফল্টভাবে ON
  const [qrEnabled, setQrEnabled] = useState(true);
  // ওয়াটারমার্ক — ডাটাবেজে লোগো থাকলে ডিফল্টে চালু, এই পেজ থেকেই বন্ধ করা যায়
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [signNameEnabled, setSignNameEnabled] = useState(true);
  const [signEnabled, setSignEnabled] = useState(true);
  const [signDateEnabled, setSignDateEnabled] = useState(true);

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
    if (Array.isArray(setup.fields)) setCheckboxState(setup.fields);

    const t = setup.toggles || {};
    if (t.qr !== undefined) setQrEnabled(t.qr);
    if (t.watermark !== undefined) setWatermarkEnabled(t.watermark);
    if (t.photo !== undefined) setPhotoEnabled(t.photo);
    if (t.signName !== undefined) setSignNameEnabled(t.signName);
    if (t.sign !== undefined) setSignEnabled(t.sign);
    if (t.signDate !== undefined) setSignDateEnabled(t.signDate);

    if (setup.reportType) setValue('ReportID', setup.reportType);

    const tplId = setup.templateId || selectedTemplate;
    if (setup.nameSize) setValue(`institute_name_size_${tplId}`, setup.nameSize);
    if (setup.nameColor) setValue(`institute_name_color_${tplId}`, setup.nameColor);
    if (setup.addressSize) setValue(`institute_address_size_${tplId}`, setup.addressSize);
    if (setup.addressColor) setValue(`institute_address_color_${tplId}`, setup.addressColor);

    // লেবেলগুলো পরের ধাপে বসে — কারণ fieldLabels এলে ওটা আবার সব লিখে দেয়
    savedLabelsRef.current = setup.labels || null;
  }, [savedSettings, setValue, selectedTemplate]);

  // লেবেল এলে বা ভাষা বদলালে ইনপুটের মান আসলেই বদলাতে হয়।
  // শুধু defaultValue বা key দিয়ে রিমাউন্ট করলে react-hook-form এর ভিতরের
  // সংরক্ষিত মান পুরোনোই থেকে যায়, আর buildPrintRows সেটাই তুলে নেয়।
  useEffect(() => {
    const saved = savedLabelsRef.current;
    ADMIT_FIELDS.forEach((f) => {
      // সংরক্ষিত লেবেল থাকলে সেটাই জেতে, নইলে LabelName/ভিত্তি নাম
      setValue(`fieldkey_${f.id}`, saved?.[f.id] || fieldLabels[f.id]);
    });
  }, [fieldLabels, setValue]);

  useEffect(() => {
    setSelectedRows([]);
    setCurrentPage(1);
    setPrintData(null);
  }, [SessionID, ExamID, SubClassID, RDID, UserCode]);

  // টেমপ্লেট, ভাষা বা টগল বদলালে আগের আউটপুট বাতিল
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
    signNameEnabled,
    signEnabled,
    signDateEnabled,
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

      newRow.SignatureNajem = row.SignatureNajem || institutionInfo?.SignatureNajem;
      newRow.SignaturePrincipal =
        row.SignaturePrincipal || institutionInfo?.SignaturePrincipal;
      // নাম না পেলে কার্ড নিজেই ভাষা অনুযায়ী ডিফল্ট বসাবে
      newRow.PrincipalName = institutionInfo?.PrincipalName;
      newRow.NajemName = institutionInfo?.NajemName;

      return newRow;
    });

  const onSubmit = (formData) => {
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

  const handlePreview = handleSubmit(onSubmit);

  const handlePrint = handleSubmit(async (formData) => {
    const rows = onSubmit(formData);
    if (!rows) return;
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
        signName: signNameEnabled,
        sign: signEnabled,
        signDate: signDateEnabled,
      },
      reportType: reportType || null,
      nameSize: nameSize || template.nameSize,
      nameColor: nameColor || template.nameColor,
      addressSize: addressSize || template.addressSize,
      addressColor: addressColor || template.addressColor,
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

  const handleResetFilter = () => {
    reset({
      ...getValues(),
      SessionID: '',
      ExamID: '',
      SubClassID: '',
      RDID: '',
      UserCode: '',
    });
    setSelectedRows([]);
    setPrintData(null);
    setCurrentPage(1);
  };

  const reportOptions = Object.keys(PRINT_LAYOUTS).map((id) => ({
    id,
    label: getLayoutLabel(id, lang),
  }));

  const displayToggles = [
    { id: 'qr', label: ui('qr'), checked: qrEnabled, onChange: setQrEnabled },
    { id: 'photo', label: ui('photo'), checked: photoEnabled, onChange: setPhotoEnabled },
    // ডাটাবেজে লোগো থাকলেই কেবল ওয়াটারমার্কের টগল — না থাকলে কিছুই করত না
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
      id: 'signName',
      label: ui('signName'),
      checked: signNameEnabled,
      onChange: setSignNameEnabled,
    },
    { id: 'sign', label: ui('sign'), checked: signEnabled, onChange: setSignEnabled },
    {
      id: 'signDate',
      label: ui('date'),
      checked: signDateEnabled,
      onChange: setSignDateEnabled,
    },
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
      SignatureNajem: institutionInfo?.SignatureNajem,
      SignaturePrincipal: institutionInfo?.SignaturePrincipal,
      PrincipalName: institutionInfo?.PrincipalName,
      NajemName: institutionInfo?.NajemName,
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
            ঠিক মাঝখানেই বসে — দুই পাশের বোতামের চওড়া সমান না হলেও। */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-wrap">
            {/* বাঁ পাশ — টেমপ্লেট নির্বাচন, ড্রপডাউনের চেহারায় */}
            <div className="flex flex-1 min-w-0 items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className={dropdownBtn}
                title={ui('currentTemplate')}
              >
                <div className="w-[34px] shrink-0 overflow-hidden rounded-[3px] border border-gray-200">
                  <TemplateThumb template={template} lang={lang} />
                </div>
                <span className="truncate max-w-[140px]">{template.title}</span>
              </button>

              {/* রুটিংসহ টেমপ্লেট — এখনো তৈরি হয়নি, চাপলে আপকামিং */}
              <button
                type="button"
                onClick={() => setShowRoutingModal(true)}
                className={dropdownBtn}
                title={ui('routingTemplate')}
              >
                <span className="truncate max-w-[150px]">{ui('routingTemplate')}</span>
                <span className="text-[12px] text-gray-400 shrink-0">
                  {ui('upcoming')}
                </span>
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

        {/* ====================================== ফিল্টার — এক লাইনে ছয়টা ঘর
            বড় স্ক্রিনে ছয়টা পাশাপাশি; জায়গা কমলে ধাপে ধাপে ভেঙে যায়। */}
        <div className="rounded-[10px] border border-gray-200 bg-gray-50/70 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <p className="text-[15px] font-bold text-gray-700">{ui('filterBtn')}</p>
            <button
              type="button"
              className="rounded-[8px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100"
              onClick={handleResetFilter}
            >
              {ui('resetFilter')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
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
              পেজিনেশন ঠিক মাঝে — দুই পাশের ঘরেই flex-1, তাই ডানের বোতাম
              দুইটা থাকলেও মাঝেরটা নড়ে না। shrink-0 বলে এটা কখনো চেপে যায় না। */}
          <div className="shrink-0 flex items-center gap-3 border-t border-gray-200 bg-white px-3 py-2">
            <div className="flex-1 min-w-0" />

            <div className="shrink-0">
              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>

            <div className="flex flex-1 min-w-0 items-center justify-end gap-3">
              <Button type="button" onClick={handlePreview}>
                {ui('preview')}
              </Button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2 rounded-[8px] bg-blue-600 text-white whitespace-nowrap"
              >
                {ui('print')}
              </button>
            </div>
          </div>
        </div>

        {printData?.length ? (
          <p className="mt-2 text-[14px] text-green-700 text-center">
            {ui('ready')(toLangDigit(printData.length, lang))}
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------
          একটাই আউটপুট নোড — স্ক্রিনে প্রিভিউ, প্রিন্টে এটাই ছাপে।
      ------------------------------------------------------------------- */}
      {printData?.length ? (
        <div className="mt-8 max-w-full overflow-x-auto overscroll-x-contain admit-output">
          {/* grayscale সবসময় false — কালার নির্বাচন বাদ দেওয়া হয়েছে,
              প্রবেশপত্র এখন সবসময় রঙিনই ছাপে */}
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
            showSignName={signNameEnabled}
            showSign={signEnabled}
            showSignDate={signDateEnabled}
          />
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
        disableEsc={showTemplateModal}
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
                <p className="text-[15px] font-bold text-gray-700">{ui('livePreview')}</p>
                <p className="text-[14px] font-medium text-gray-600 truncate">
                  {template.title}
                </p>
              </div>

              {/* কার্ডটা ৫২০px স্থির — ছোট স্ক্রিনে এই ঘরটাই পাশে স্ক্রল হবে */}
              <div className="overflow-x-auto overscroll-x-contain -mx-1 px-1 pb-2">
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
                    showSignName={signNameEnabled}
                    showSign={signEnabled}
                    showSignDate={signDateEnabled}
                  />
                </div>
              </div>

              {/* ------------------------------------------------- তিনটা ঘর */}
              <div className="mt-2 grid grid-cols-3 gap-3">
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
              </div>
            </div>
          </div>

          {/* ================================================== ডান পাশ
              শুধু ডাটার সেটিং — কী দেখাবে, কোন ফিল্ড, আর রুটিং। */}
          <div className="min-w-0">
            {/* কী কী দেখাবে */}
            <p className="font-bold text-[16px] mb-2">{ui('displaySettings')}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {displayToggles.map((tg) => (
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

            {/* একদম নিচে — ঐচ্ছিক রুটিং সেটআপ, এখনো তৈরি হয়নি */}
            <p className="font-bold text-[16px] mt-8 mb-3">{ui('optionalRouting')}</p>
            <UpcomingBox label={ui('upcoming')} note={ui('upcomingNote')} />
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

      {/* ================================= পপআপ ২ — টেমপ্লেট রুটিং সিলেক্ট */}
      <Modal
        open={showRoutingModal}
        onClose={() => setShowRoutingModal(false)}
        title={ui('routingSelect')}
        dir={uiDir}
        width="max-w-xl"
      >
        <UpcomingBox label={ui('upcoming')} note={ui('upcomingNote')} />
      </Modal>
    </FormProvider>
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
