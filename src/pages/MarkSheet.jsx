import { useEffect, useMemo, useState } from 'react';
import Loading from '../components/Loading/Loading';
import useTranslate from '../utils/Translate';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { languageResultReport, markSheetResultReports } from '../Data/userReportsData';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import {
  useGetExamFilterExamsQuery,
  useGetExamFilterSubclassesQuery,
  useGetExamSessionQuery,
} from '../features/exam/examQuerySlice';
import Button from '../components/Button/Button';
import {
  useGetMarkSheetQuery,
  useGetResultReportDataQuery,
  useGetMarkSheetSettingsQuery,
  useSaveMarkSheetSettingsMutation,
} from '../features/result/resultSilce';
import DefaultInput from '../components/Forms/DefaultInput';
import MarkSheetPdf from '../components/ResultPdf/MarkSheetPdf';
import { showModal } from '../utils/ModalControlar';

// ==========================================
// Inline loading spinner (শুধু মার্কশিট এলাকার জন্য)
// ==========================================
const MarkSheetLoader = () => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 print:hidden">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    <p className="text-sm font-medium text-indigo-700">মার্কশিট লোড হচ্ছে, অপেক্ষা করুন...</p>
  </div>
);

/* ---------------- কালার প্যালেট ---------------- */
const C = {
  gradient: "bg-gradient-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4]",
  panel: "bg-[#FAF5FF]",
  panelBorder: "border-[#E9D5FF]",
  primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
};

// ⭐ টেমপ্লেট লিস্ট
const MARK_SHEET_TEMPLATES = [
  { id: 'template-1', name: 'Standard Mark Sheet', desc: 'সাধারণ মার্কশিট ডিজাইন' },
  { id: 'template-2', name: 'Modern Gradient', desc: 'আধুনিক গ্র‍্যাডিয়েন্ট ডিজাইন (নতুন)' },
  { id: 'template-3', name: 'Elegant Classic', desc: 'এলিগ্যান্ট গোল্ড ফ্রেম ডিজাইন (নতুন)' },
  { id: 'template-4', name: 'Minimalist Mono', desc: 'সাদা-কালো মিনিমাল এডিটরিয়াল ডিজাইন (নতুন)' },
  { id: 'template-5', name: 'Bold Sidebar', desc: 'ডার্ক সাইডবার স্প্লিট লেআউট (নতুন)' },
  { id: 'template-6', name: 'Vintage Gazette', desc: 'সংবাদপত্র স্টাইল সেরিফ ডিজাইন (নতুন)' },
  { id: 'template-7', name: 'Bauhaus Bold', desc: 'প্রাইমারি কালার পোস্টার ডিজাইন (নতুন)' },
  { id: 'template-8', name: 'Classic Traditional', desc: 'সাদা-কালো বর্ডারের চিরচেনা ক্লাসিক ডিজাইন (নতুন)' },
  { id: 'template-9', name: 'Traditional School', desc: 'গোল্ড ফ্রেম ও রিবন ব্যাজসহ প্রচলিত স্কুল ডিজাইন (নতুন)' },
  { id: 'template-10', name: 'Academic Transcript', desc: 'নীল বর্ডারের ট্রান্সক্রিপ্ট ডিজাইন (নতুন)' },
  { id: 'template-11', name: 'Ornate Certificate', desc: 'অলংকৃত ফ্রেমের সার্টিফিকেট ডিজাইন (নতুন)' },
  { id: 'template-12', name: 'Royal Emerald', desc: 'সবুজ-সোনালী ইসলামিক নকশার ডিজাইন (নতুন)' },
];

// ==========================================
// Size sliders
// One control shape, used both on the toolbar and inside the settings
// modal, so a size can be changed from either place and both show the
// same value.
// ==========================================
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBnNum = (value) => String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);

/**
 * Moves one block of the press-printed sheet up or down.
 * Pixels, not a percentage, and it rests at 0 rather than 100 — minus is up,
 * plus is down, so a block can be lined up with what the press already put
 * on the paper.
 */
const OffsetSlider = ({ label, value, onChange, hint, min = -100, max = 100, step = 1 }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] font-bold text-[#7C3AED] tabular-nums">
          {Number(value) > 0 ? '+' : ''}{toBnNum(value)} px
        </span>
        <button
          type="button"
          title="রিসেট"
          onClick={() => onChange('0')}
          className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-[#7C3AED] hover:border-[#DDD6FE] transition"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.3 5.3M4 15a8 8 0 0013.7 3.7" />
          </svg>
        </button>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 w-full accent-[#7C3AED]"
    />
    {hint && <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>}
  </div>
);

const ScaleSlider = ({ label, value, onChange, hint, min = 60, max = 160, step = 5 }) => (
  <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] font-semibold text-slate-700">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] font-bold text-[#7C3AED] tabular-nums">{toBnNum(value)}%</span>
        <button
          type="button"
          title="রিসেট"
          onClick={() => onChange('100')}
          className="flex h-5 w-5 items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-[#7C3AED] hover:border-[#DDD6FE] transition"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 006.3 5.3M4 15a8 8 0 0013.7 3.7" />
          </svg>
        </button>
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#7C3AED]"
    />
    {hint && <p className="mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>}
  </div>
);

/**
 * Live sample of the result table. It uses the same arithmetic the sheet
 * does — real padding and real font sizes, never a zoom — so what the
 * sample shows is what gets printed.
 */
const TableScaleSample = ({ rowGap = 100, font = 100 }) => {
  const pad = (6 * (Number(rowGap) || 100)) / 100;
  const size = (11 * (Number(font) || 100)) / 100;
  const cell = { paddingTop: pad, paddingBottom: pad, fontSize: size };

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
      <table className="w-full border-collapse text-center">
        <thead>
          <tr style={{ backgroundColor: '#0f5132', color: '#ffffff' }}>
            {['ক্রমিক', 'বিষয়', 'পূর্ণমান', 'প্রাপ্ত নম্বর'].map((head, i) => (
              <th key={head} className={`px-2 font-bold ${i === 1 ? 'text-left' : ''}`} style={cell}>{head}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[['১', 'বাংলা', '১০০', '৮৫'], ['২', 'ইংরেজি', '১০০', '৭৮']].map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 ? '#ecfdf5' : '#ffffff' }}>
              {row.map((value, j) => (
                <td key={j} className={`border-b border-emerald-100 px-2 font-bold ${j === 1 ? 'text-left' : ''}`} style={cell}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** Live sample of the institution name and address at the chosen size. */
const HeaderScaleSample = ({ scale, name, address }) => {
  const pct = (Number(scale) || 100) / 100;
  return (
    <div
      className="mt-2 overflow-hidden rounded-md px-3 py-2 text-center text-white"
      style={{ backgroundImage: 'linear-gradient(to right,#0b3d26,#14694a,#0b3d26)' }}
    >
      <p className="font-bold leading-tight" style={{ fontSize: 15 * pct }}>
        {name || 'প্রতিষ্ঠানের নাম'}
      </p>
      <p className="text-emerald-100" style={{ fontSize: 10 * pct }}>
        {address || 'ঠিকানা'}
      </p>
    </div>
  );
};

// ==========================================
// Template miniature
// A real mark sheet, rendered small. The abstract thumbnails could not show
// what a design actually looks like, so each card now renders the template
// itself — same header, same table, same colours — shrunk to fit.
//
// The sheet is laid out at A4 width (794px) and scaled down with a
// transform, which costs nothing to lay out and keeps every proportion.
// Each one gets its own scopeId so the stylesheet it carries applies to
// that card alone and never leaks into the sheet being previewed.
// ==========================================
const MINI_WIDTH = 794;   // the width every template is designed at
// One A4 page at that scale: the sheet is 286mm tall (the printable area),
// which is 286 x 96 / 25.4 px. Matching it exactly keeps the card from
// showing a strip of empty white under the sheet.
const MINI_HEIGHT = Math.round((286 * 96) / 25.4);

/** A single student with a few subjects — enough to show a design off. */
const MINI_SAMPLE = {
  institution: {
    InstitutionName: 'জামিয়া ইসলামিয়া দারুল মাদরাসা',
    Address: 'যাত্রাবাড়ী, ঢাকা',
    InstitutionCode: 'SAMPLE',
    PrincipalName: 'মুহতামিম',
    NajemName: 'নাযেম',
    Logo: null,
    SignatureNajem: null,
    SignaturePrincipal: null,
  },
  session: { SessionName: '২০২৬', SessionID: 1 },
  class: { ClassName: 'নমুনা শ্রেণী' },
  classGroup: { SubClassID: 1 },
  exam: [{ ExamID: 1, ExamName: 'বার্ষিক পরীক্ষা' }],
  examid: 1,
  conditionAverage: [{
    ExamType: 1, AverageSubsonkha: 4,
    DivisionID1: 1, DivisionNumber1: 80,
    DivisionID2: 2, DivisionNumber2: 70,
    DivisionID3: 3, DivisionNumber3: 60,
  }],
  divisions: [
    { ID: 1, DivisionNames: 'এ+' },
    { ID: 2, DivisionNames: 'এ' },
    { ID: 3, DivisionNames: 'এ-' },
  ],
  examSubjects: ['বাংলা', 'ইংরেজি', 'গণিত', 'হাদীস'].map((name, i) => ({
    ID: i + 1, SubjectID: i + 1, SubjectName: name,
    MaxNumber: 100, PassNumber: 33, HighestMark: 95,
  })),
  students: [{
    ID: 1, UserID: 1,
    UserName: 'মোসা: জান্নাতুল আক্তার',
    FatherName: 'মো: রাসেল মিয়া',
    MotherName: 'মোসা: ঝিমা বেগম',
    DateOfBirth: '০১/০১/২০১২',
    AdmissionSerial: 7, UserCode: '১০০৪',
    DivisionNames: 'এ', Positions: 2, Total: 340,
    Note: 'ভালো ফলাফল করেছে।',
    subjects: [88, 82, 90, 80].map((mark, i) => ({ SubjectID: i + 1, Marks: mark, HighestMark: 95 })),
  }],
};

const TemplateMiniature = ({
  templateId, data, width = 150,
  showDate, showSignature, principalName, najemName,
  paperSize, orientation, studentInfoFields, colorMode,
  showClassTeacherSign, showGuardianSign,
  headerScale, contentFontScale, rowGapScale,
  language,
  pressPrint, pressHidePreview, pressExamOffset, pressBodyOffset, pressSignOffset,
}) => {
  // The real report can hold hundreds of students; a card needs exactly one.
  const sheetData = useMemo(() => {
    if (!data?.students?.length) return MINI_SAMPLE;
    return { ...data, students: data.students.slice(0, 1) };
  }, [data]);

  const scale = width / MINI_WIDTH;

  return (
    <div
      className="relative overflow-hidden rounded bg-white"
      style={{ width, height: MINI_HEIGHT * scale }}
    >
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: MINI_WIDTH, transform: `scale(${scale})` }}
      >
        <MarkSheetPdf
          data={sheetData}
          templateId={templateId}
          scopeId={`ms-mini-${templateId}-${width}`}
          showDate={showDate}
          showSignature={showSignature}
          principalName={principalName}
          najemName={najemName}
          paperSize={paperSize}
          orientation={orientation}
          studentInfoFields={studentInfoFields}
          colorMode={colorMode}
          showClassTeacherSign={showClassTeacherSign}
          showGuardianSign={showGuardianSign}
          headerScale={headerScale}
          contentFontScale={contentFontScale}
          rowGapScale={rowGapScale}
          language={language}
          pressPrint={pressPrint}
          pressHidePreview={pressHidePreview}
          pressExamOffset={pressExamOffset}
          pressBodyOffset={pressBodyOffset}
          pressSignOffset={pressSignOffset}
        />
      </div>
    </div>
  );
};

const MarkSheet = () => {
  const translate = useTranslate();
  const [queryParams, setQueryParams] = useState(null);

  // ⭐ স্টেট: সেটিংস মডাল এবং টেমপ্লেট সিলেকশন
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('template-1');

  // ⭐ স্টেট: স্বাক্ষর, তারিখ ও নামের জন্য
  const [showDate, setShowDate] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [principalName, setPrincipalName] = useState('');
  const [najemName, setNajemName] = useState('');

  // ⭐ নতুন স্টেট: শ্রেণী শিক্ষক ও অভিভাবকের স্বাক্ষর দেখানো/লুকানো
  const [showClassTeacherSign, setShowClassTeacherSign] = useState(true);
  const [showGuardianSign, setShowGuardianSign] = useState(true);

  // ⭐ স্টেট: প্রিন্ট পেপার সাইজ এবং ওরিয়েন্টেশন
  const [paperSize, setPaperSize] = useState('A4');
  const [orientation, setOrientation] = useState('portrait');

  // ⭐ স্টেট: প্রিন্ট স্কেল (subject বেশি হলে ছোট করে এক পেজে আনার জন্য)
  const [printScale, setPrintScale] = useState('100');

  // ⭐ স্টেট: রঙিন / সাদা-কালো প্রিন্ট
  const [colorMode, setColorMode] = useState('color');

  // Font scale — shrinks/enlarges the whole sheet (preview + print).
  // The control sits on the toolbar AND inside the settings modal.
  const [fontScale, setFontScale] = useState('100');

  // Institution name and address size, independent of the rest of the
  // sheet, so a long name can be shrunk or a short one enlarged.
  const [headerScale, setHeaderScale] = useState('100');

  // Subject table (বিষয়ভিত্তিক ফলাফল), two separate controls:
  //   rowGapScale    how much air each row has — cell padding
  //   contentFontScale the size of every piece of text in the sheet body
  // Neither one zooms; both change real px values, so the table keeps
  // its width and the page keeps its layout.
  const [rowGapScale, setRowGapScale] = useState('100');
  const [contentFontScale, setContentFontScale] = useState('100');

  // ⭐ স্টেট: appliedUserCode
  const [appliedUserCode1, setAppliedUserCode1] = useState('');
  const [appliedUserCode2, setAppliedUserCode2] = useState('');

  // ⭐ স্টেট: পরীক্ষার্থীর তথ্য (কোন কোন ফিল্ড দেখাবে)
  const [studentInfoFields, setStudentInfoFields] = useState({
    name: true,
    fatherName: true,
    motherName: true,
    dob: false,
    registration: true,
    admission: true,
    totalStudents: true,
  });

  // ⭐ নতুন স্টেট: ড্রপডাউন ওপেন/ক্লোজ
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);

  // Toolbar popover holding the three size sliders.
  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);

  // Report 2 — printing onto a sheet the press has already printed.
  // The three offsets move the exam line, the data block and the signature
  // row separately, so each can be lined up with the paper.
  const [isPressDropdownOpen, setIsPressDropdownOpen] = useState(false);
  // Takes the institution block off the preview too, so the screen shows
  // what the press-printed paper will look like
  const [pressHidePreview, setPressHidePreview] = useState(true);
  const [pressExamOffset, setPressExamOffset] = useState('0');
  const [pressBodyOffset, setPressBodyOffset] = useState('0');
  const [pressSignOffset, setPressSignOffset] = useState('0');

  // Template strip under the filter row — every design at a glance,
  // so one can be picked without opening the settings modal.
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(false);

  // Template id shown in the large preview overlay (null = closed).
  // With mark sheet data already loaded the overlay renders the real
  // sheet in that design; otherwise it shows the thumbnail.
  const [previewTemplateId, setPreviewTemplateId] = useState(null);

  // ⭐ চেক করা হচ্ছে কয়টি ফিল্ড সিলেক্ট করা আছে
  const checkedCount = Object.entries(studentInfoFields).filter(
    ([key, val]) => key !== 'totalStudents' && Boolean(val)
  ).length;

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const { data: sessionData } = useGetExamSessionQuery();
  const { data: classListData } = useGetClassListQuery();

  // Saved settings — stored in the Report_Template table, the same way
  // admit_card_settings are stored (one JSON row per institution)
  const { data: savedSettings } = useGetMarkSheetSettingsQuery();
  const [saveMarkSheetSettings, { isLoading: isSavingSettings, isError: isSaveError }] =
    useSaveMarkSheetSettingsMutation();
  const methods = useForm({ defaultValues: { LanguageID: 1 } });
  const { control, handleSubmit, setValue } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });
  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });
  const SubClassID = useWatch({ control, name: 'SubClassID' });
  const languageID = useWatch({ control, name: 'LanguageID' });

  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID: sessionID },
    { skip: !sessionID }
  );
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID: sessionID, ExamID: examID },
    { skip: !sessionID || !examID }
  );

  // ⭐ params-এ appliedUserCode1 এবং appliedUserCode2 যোগ করা হলো
  const params = {
    sessionid: Number(sessionID),
    examid: Number(examID),
    classid: Number(SubClassID),
    UserCode1: appliedUserCode1 || undefined,
    UserCode2: appliedUserCode2 || undefined,
  };

  // Report 2 is the press-printed mark sheet. It always uses the Classic
  // Traditional design (template-8), because the blocks that print are
  // positioned for that one sheet; picking another design here would put
  // them in the wrong place on the pre-printed paper.
  const PRESS_TEMPLATE_ID = 'template-8';
  const isPressReport = Number(selectedReportID) === 2;
  const activeTemplate = isPressReport ? PRESS_TEMPLATE_ID : selectedTemplate;

  const pressProps = {
    pressPrint: isPressReport,
    pressHidePreview,
    pressExamOffset: Number(pressExamOffset) || 0,
    pressBodyOffset: Number(pressBodyOffset) || 0,
    pressSignOffset: Number(pressSignOffset) || 0,
  };

  // 1 = Bangla, 2 = Arabic, 3 = English. Empty select means Bangla.
  // The API always sends all three, so this only picks which one prints.
  const sheetLanguage = Number(languageID) || 1;

  const hasMarkSheetParams = !!params.sessionid && !!params.examid && !!params.classid;

  // ✅ Mark sheet data loading state
  const {
    data,
    isLoading: isMarkSheetLoading,
    isFetching: isMarkSheetFetching,
    isError: isMarkSheetError,
  } = useGetMarkSheetQuery(params, {
    skip: !hasMarkSheetParams,
    refetchOnMountOrArgChange: true,
  });

  // isFetching ধরলে নতুন filter দিলে পুরনো data না দেখিয়ে loader দেখাবে
  const isMarkSheetBusy = hasMarkSheetParams && (isMarkSheetLoading || isMarkSheetFetching);

  useEffect(() => {
    setValue('ExamID', '');
    setValue('SubClassID', '');
  }, [sessionID, setValue]);

  useEffect(() => {
    setValue('SubClassID', '');
  }, [examID, setValue]);

  // ⭐ ড্রপডাউন বন্ধ করার জন্য বাইরে ক্লিক লিসেনার
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.info-dropdown-container')) {
        setIsInfoDropdownOpen(false);
      }
      if (!event.target.closest('.size-dropdown-container')) {
        setIsSizeDropdownOpen(false);
      }
      if (!event.target.closest('.press-dropdown-container')) {
        setIsPressDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply the saved settings once they arrive from the database.
  // null/missing values keep the page defaults.
  useEffect(() => {
    const s = savedSettings?.setup;
    if (!s) return;

    if (s.templateId) setSelectedTemplate(s.templateId);
    if (s.showDate !== null && s.showDate !== undefined) setShowDate(Boolean(s.showDate));
    if (s.showSignature !== null && s.showSignature !== undefined) setShowSignature(Boolean(s.showSignature));
    if (s.showClassTeacherSign !== null && s.showClassTeacherSign !== undefined) setShowClassTeacherSign(Boolean(s.showClassTeacherSign));
    if (s.showGuardianSign !== null && s.showGuardianSign !== undefined) setShowGuardianSign(Boolean(s.showGuardianSign));
    if (s.principalName) setPrincipalName(s.principalName);
    if (s.najemName) setNajemName(s.najemName);
    if (s.paperSize) setPaperSize(s.paperSize);
    if (s.orientation) setOrientation(s.orientation);
    if (s.colorMode) setColorMode(s.colorMode);
    if (s.printScale) setPrintScale(String(s.printScale));
    if (s.fontScale) setFontScale(String(s.fontScale));
    if (s.headerScale) setHeaderScale(String(s.headerScale));
    if (s.rowGapScale) setRowGapScale(String(s.rowGapScale));
    if (s.contentFontScale) setContentFontScale(String(s.contentFontScale));
    if (s.pressHidePreview !== null && s.pressHidePreview !== undefined) setPressHidePreview(Boolean(s.pressHidePreview));
    if (s.pressExamOffset !== null && s.pressExamOffset !== undefined) setPressExamOffset(String(s.pressExamOffset));
    if (s.pressBodyOffset !== null && s.pressBodyOffset !== undefined) setPressBodyOffset(String(s.pressBodyOffset));
    if (s.pressSignOffset !== null && s.pressSignOffset !== undefined) setPressSignOffset(String(s.pressSignOffset));
    if (s.studentInfoFields && typeof s.studentInfoFields === 'object') {
      setStudentInfoFields((prev) => ({ ...prev, ...s.studentInfoFields }));
    }
  }, [savedSettings]);

  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      // Report 2 is the press-printed mark sheet — same filters as report 1,
      // only the sheet it prints onto is different.
      case 1:
      case 2:
        return ['ReportID', 'LanguageID', 'SessionID', 'ExamID', 'SubClassID', 'UserCode'].includes(fieldName);
      case 3:
      case 4:
      case 5:
        return ['ReportID', 'LanguageID', 'SessionID', 'ExamID', 'SubClassID'].includes(fieldName);
      case 6:
        return ['ReportID', 'LanguageID', 'SessionID', 'ExamID'].includes(fieldName);
      default:
        return false;
    }
  };

  // ⭐ onSubmit-এ appliedUserCode সেট করা হলো
  const onSubmit = (formData) => {
    setAppliedUserCode1(formData.UserCode1 || '');
    setAppliedUserCode2(formData.UserCode2 || '');

    const queryObj = {
      report_data: selectedReportID,
      session_id: formData.SessionID,
      exam_id: formData.ExamID,
      subclass_id: formData.SubClassID,
      UserCode1: formData.UserCode1,
      UserCode2: formData.UserCode2,
    };

    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] === undefined || queryObj[key] === '') {
        delete queryObj[key];
      }
    });

    setQueryParams(queryObj);
  };

  const handleStudentMarkSheetNote = () => {
    setIsSettingsOpen(false);
    showModal('মার্কশিট নোট তৈরি করুন', 'STUDENT_MARK_SHEET_NOTE', {
      closeOnOutSide: false,
    });
  };

  // Save the current setup into the Report_Template table.
  // The modal closes only when the save succeeds.
  const handleSaveSettings = async () => {
    try {
      await saveMarkSheetSettings({
        templateId: selectedTemplate,
        showDate,
        showSignature,
        showClassTeacherSign,
        showGuardianSign,
        principalName,
        najemName,
        paperSize,
        orientation,
        colorMode,
        printScale: Number(printScale),
        fontScale: Number(fontScale),
        headerScale: Number(headerScale),
        rowGapScale: Number(rowGapScale),
        contentFontScale: Number(contentFontScale),
        pressHidePreview,
        pressExamOffset: Number(pressExamOffset),
        pressBodyOffset: Number(pressBodyOffset),
        pressSignOffset: Number(pressSignOffset),
        studentInfoFields,
      }).unwrap();
      setIsSettingsOpen(false);
    } catch {
      // isSaveError shows the message inside the modal footer
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  // Result panel-এ কী দেখাবে
  const renderResult = () => {
    if (isMarkSheetBusy) return <MarkSheetLoader />;

    if (isMarkSheetError) {
      return (
        <div className="p-4 m-2 bg-red-50 border border-red-200 rounded-md shadow-sm text-red-600 text-center print:hidden">
          মার্কশিট লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </div>
      );
    }

    if (!hasMarkSheetParams || !data) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 print:hidden">
          <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">মার্কশিট দেখতে সেশন, পরীক্ষা ও শ্রেণী নির্বাচন করুন।</p>
        </div>
      );
    }

    return (
      <MarkSheetPdf 
        data={data} 
        templateId={activeTemplate} 
        showDate={showDate}
        showSignature={showSignature}
        principalName={principalName}
        najemName={najemName}
        paperSize={paperSize}
        orientation={orientation}
        studentInfoFields={studentInfoFields}
        colorMode={colorMode}
        showClassTeacherSign={showClassTeacherSign} // ⭐ নতুন প্রপস
        showGuardianSign={showGuardianSign} // ⭐ নতুন প্রপস
        headerScale={headerScale}
        contentFontScale={contentFontScale}
        rowGapScale={rowGapScale}
        language={sheetLanguage}
        {...pressProps}
      />
    );
  };

  const canPrint = hasMarkSheetParams && !!data && !isMarkSheetBusy && !isMarkSheetError;

  // Passed to every miniature so a card shows the design with the
  // settings actually in force, not a generic version of it.
  const miniProps = {
    data,
    showDate,
    showSignature,
    principalName,
    najemName,
    paperSize: 'A4',
    orientation: 'portrait',
    studentInfoFields,
    colorMode,
    showClassTeacherSign,
    showGuardianSign,
    headerScale,
    contentFontScale,
    rowGapScale,
    language: sheetLanguage,
    ...pressProps,
  };

  return (
    <div className="font-SolaimanLipi space-y-4 bg-transparent max-w-full overflow-x-hidden">

      {/* ================= প্রিন্ট স্কেল =================
          শুধু zoom — বাকি সব ডিজাইন MarkSheetPdf.jsx নিজে সামলায়,
          তাই প্রিভিউ আর প্রিন্ট একই রকম দেখায়। */}
      <style>{`
        @media print {
          #mark-sheet-print-area { zoom: ${Number(printScale) / 100}; }
        }
      `}</style>

      {/* ================= মূল কন্টেন্ট এরিয়া ================= */}
      <div className="flex flex-col gap-5 min-h-screen print:min-h-0 print:gap-0 print:block">
        
        {/* Top: Filter Panel (Horizontal) */}
        <div className="print:hidden w-full">
          <div className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden`}>
            <div className="p-5">
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,1.7fr)_auto] gap-3 items-end"
                >
                  <DefaultSelect
                    label={translate('Report')}
                    nameField="ReportName"
                    registerKey="ReportID"
                    valueField="ReportID"
                    options={markSheetResultReports}
                    type="number"
                    require="This Field is required"
                  />

                  {shouldShowFields('SessionID') && (
                    <DefaultSelect
                      label={translate('Session')}
                      nameField="SessionName"
                      registerKey="SessionID"
                      valueField="SessionID"
                      options={sessionData ?? []}
                      require="This Field is required"
                      defaultSelect={false}
                      unicode={true}
                    />
                  )}

                  {shouldShowFields('ExamID') && (
                    <DefaultSelect
                      label={translate('Exam')}
                      nameField="ExamName"
                      registerKey="ExamID"
                      valueField="ExamID"
                      options={examNameData ?? []}
                      require={'This Field is required'}
                      unicode={true}
                    />
                  )}

                  {shouldShowFields('ClassID') && (
                    <DefaultSelect
                      label={translate('Class')}
                      nameField="ClassName"
                      registerKey="ClassID"
                      valueField="ClassID"
                      options={classListData ?? []}
                      require={'This Field is required'}
                      unicode={true}
                    />
                  )}

                  {shouldShowFields('SubClassID') && (
                    <DefaultSelect
                      label={translate('Sub Class')}
                      nameField="SubClass"
                      registerKey="SubClassID"
                      valueField="SubClassID"
                      options={subclassListData ?? []}
                      require={'This Field is required'}
                      unicode={true}
                    />
                  )}

                  {shouldShowFields('LanguageID') && (
                    <DefaultSelect
                      label="ভাষা"
                      nameField="name"
                      registerKey="LanguageID"
                      valueField="id"
                      options={languageResultReport}
                      type="number"
                      defaultSelect={false}
                    />
                  )}

                  {shouldShowFields('UserCode') && (
                    <div className="grid grid-cols-2 gap-2 sm:col-span-2 xl:col-span-1 xl:col-start-6">
                      <DefaultInput registerKey="UserCode1" label="আইডি থেকে" />
                      <DefaultInput registerKey="UserCode2" label="আইডি পর্যন্ত" />
                    </div>
                  )}

                  {/* ⭐ রিপোর্ট তৈরি এবং সেটিংস বাটন */}
                  <div className="flex items-center gap-2 w-full min-w-0 sm:col-span-2 xl:col-span-1 xl:col-start-7">
                    <button
                      type="submit"
                      className={`w-auto px-5 flex items-center justify-center gap-1.5 h-[44px] shrink-0 rounded-lg text-[13px] font-bold ${C.primary} shadow-sm transition`}
                    >
                      View
                    </button>
                    
                    {!isPressReport && (
                    <button
                      type="button"
                      onClick={() => setIsTemplatePanelOpen((open) => !open)}
                      className={`flex items-center gap-1.5 h-[38px] px-3 shrink-0 rounded-lg border text-[12px] font-bold shadow-sm transition ${
                        isTemplatePanelOpen
                          ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#6D28D9]'
                          : 'bg-white border-[#E9D5FF] text-[#7C3AED] hover:bg-[#F5F3FF]'
                      }`}
                      title="সব টেমপ্লেট দেখে নির্বাচন করুন"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5h16v14H4zM4 9h16M9 9v10" />
                      </svg>
                      <span className="whitespace-nowrap">টেমপ্লেট</span>
                      <svg className={`w-3.5 h-3.5 shrink-0 transition-transform ${isTemplatePanelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="flex items-center justify-center h-[38px] w-[38px] shrink-0 bg-white border border-[#E9D5FF] text-[#7C3AED] rounded-lg shadow-sm hover:bg-[#F5F3FF] transition"
                      title="সেটিংস ও টেমপ্লেট"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </FormProvider>
            </div>

            {/* ================= টেমপ্লেট স্ট্রিপ =================
                ফিল্টারের নিচে সব ডিজাইন একসাথে — ক্লিক করলেই সিলেক্ট হয়। */}
            {isTemplatePanelOpen && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">টেমপ্লেট নির্বাচন করুন</span>
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 border border-violet-200">
                      {MARK_SHEET_TEMPLATES.find((t) => t.id === selectedTemplate)?.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTemplatePanelOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                    title="বন্ধ করুন"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
                  {MARK_SHEET_TEMPLATES.map((tpl) => {
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setSelectedTemplate(tpl.id)}
                        title={tpl.desc}
                        className={`rounded-lg border-2 p-1.5 text-left transition ${
                          isSelected
                            ? 'border-[#7C3AED] bg-white shadow-md ring-2 ring-[#7C3AED]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-center">
                          <TemplateMiniature templateId={tpl.id} width={75} {...miniProps} />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between gap-1">
                          <span className={`truncate text-[10px] font-bold leading-tight ${isSelected ? 'text-[#6D28D9]' : 'text-slate-600'}`}>
                            {tpl.name}
                          </span>
                          {isSelected && (
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-[11px] text-slate-500">
                  ডিজাইনটি বড় করে দেখতে বা অন্য সেটিংস বদলাতে পাশের ⚙ বাটনে যান।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Result Panel (Full Width) */}
        <div className="w-full bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
          
          {/* Result Toolbar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700">প্রিভিউ</span>
              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200">
                {MARK_SHEET_TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Default Template'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {isFetching && (
                <span className="text-xs text-indigo-600 font-semibold animate-pulse">
                  {translate('Loading report...')}
                </span>
              )}

              <div className="flex items-center gap-2 mr-2">
                <div className="relative info-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsInfoDropdownOpen(!isInfoDropdownOpen)}
                    className="flex items-center justify-between gap-2 h-8 rounded-lg border border-[#DDD6FE] bg-white px-3 py-1 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  >
                    পরীক্ষার্থীর তথ্য
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isInfoDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-600">তথ্য নির্বাচন করুন</span>
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-100 px-2 py-0.5 rounded">সর্বোচ্চ ৫টি</span>
                      </div>
                      <div className="space-y-2">
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.name && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.name} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, name: e.target.checked }))} 
                            disabled={!studentInfoFields.name && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">নাম</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.fatherName && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.fatherName} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, fatherName: e.target.checked }))} 
                            disabled={!studentInfoFields.fatherName && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">পিতার নাম</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.motherName && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.motherName} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, motherName: e.target.checked }))} 
                            disabled={!studentInfoFields.motherName && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">মাতার নাম</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.dob && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.dob} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, dob: e.target.checked }))} 
                            disabled={!studentInfoFields.dob && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">জন্ম তারিখ</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.registration && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.registration} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, registration: e.target.checked }))} 
                            disabled={!studentInfoFields.registration && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">দাখেলা</span>
                        </label>
                        <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.admission && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <input 
                            type="checkbox" 
                            checked={studentInfoFields.admission} 
                            onChange={(e) => setStudentInfoFields(prev => ({ ...prev, admission: e.target.checked }))} 
                            disabled={!studentInfoFields.admission && checkedCount >= 5}
                            className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                          />
                          <span className="text-sm font-medium text-slate-700">ভর্তি নং</span>
                        </label>
                        {/* ⭐ Separate section — not part of the 5-field limit */}
                        <div className="pt-2 border-t border-slate-100">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={studentInfoFields.totalStudents !== false} 
                              onChange={(e) => setStudentInfoFields(prev => ({ ...prev, totalStudents: e.target.checked }))} 
                              className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500" 
                            />
                            <span className="text-sm font-medium text-slate-700">মোট পরীক্ষার্থীর সংখ্যা</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="h-8 rounded-lg border border-[#DDD6FE] bg-white px-2 py-1 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select>

                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value)}
                  className="h-8 rounded-lg border border-[#DDD6FE] bg-white px-2 py-1 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>

                {/* ⭐ রঙিন / সাদা-কালো */}
                <select
                  value={colorMode}
                  onChange={(e) => setColorMode(e.target.value)}
                  title="রঙিন নাকি সাদা-কালো"
                  className="h-8 rounded-lg border border-[#DDD6FE] bg-white px-2 py-1 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="color">রঙিন</option>
                  <option value="bw">সাদা-কালো</option>
                </select>

                {/* ⭐ প্রিন্ট স্কেল — subject বেশি হলে ছোট করে এক পেজে আনার জন্য */}
                <select
                  value={printScale}
                  onChange={(e) => setPrintScale(e.target.value)}
                  title="প্রিন্ট সাইজ — subject বেশি হলে ছোট করুন"
                  className="h-8 rounded-lg border border-[#DDD6FE] bg-white px-2 py-1 text-sm font-medium text-slate-700 outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                >
                  <option value="100">১০০%</option>
                  <option value="95">৯৫%</option>
                  <option value="90">৯০%</option>
                  <option value="85">৮৫%</option>
                  <option value="80">৮০%</option>
                  <option value="75">৭৫%</option>
                </select>

                {/* Block offsets — report 2 only, same three controls as in the settings modal */}
                {isPressReport && (
                  <div className="relative press-dropdown-container">
                    <button
                      type="button"
                      onClick={() => setIsPressDropdownOpen(!isPressDropdownOpen)}
                      title="ঘর উপর-নিচ"
                      className="flex items-center gap-2 h-8 rounded-lg border border-[#DDD6FE] bg-white px-3 py-1 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                    >
                      <svg className="w-4 h-4 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-3 3m3-3l3 3m-3 13l-3-3m3 3l3-3" />
                      </svg>
                      ঘর সরান
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isPressDropdownOpen && (
                      <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 space-y-2.5">
                        <p className="px-1 text-[11px] leading-snug text-slate-500">
                          প্রেসে ছাপা কাগজে শুধু এই তিনটা ঘর ছাপা হবে। কাগজের সাথে মিলিয়ে আলাদা আলাদা উপরে-নিচে সরান।
                        </p>
                        <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pressHidePreview}
                          onChange={(e) => setPressHidePreview(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span>
                          <span className="block text-[13px] font-semibold text-slate-700">প্রিভিউতেও হেডার লুকান</span>
                          <span className="block text-[11px] leading-snug text-slate-500">
                            প্রতিষ্ঠানের নাম, ঠিকানা ও শিক্ষাবর্ষ পর্দাতেও সরে যাবে — ছাপা কাগজ যেমন দেখাবে ঠিক তেমন। জায়গাটা ফাঁকা থেকে যায়, বর্ডারটা তখন কাটা দাগে দেখায়।
                          </span>
                        </span>
                      </label>
                      <OffsetSlider
                        label="পরীক্ষার নামের লাইন"
                        value={pressExamOffset}
                        onChange={setPressExamOffset}
                        hint="মাইনাস = উপরে, প্লাস = নিচে।"
                      />
                      <OffsetSlider
                        label="মাঝের ডাটা ব্লক"
                        value={pressBodyOffset}
                        onChange={setPressBodyOffset}
                        hint="পরীক্ষার্থীর তথ্য, নম্বর বিভাজন, ফলাফলের টেবিল ও মন্তব্য — একসাথে।"
                      />
                      <OffsetSlider
                        label="স্বাক্ষরের সারি"
                        value={pressSignOffset}
                        onChange={setPressSignOffset}
                        hint="নিচের দুই স্বাক্ষর ও তারিখ।"
                      />
                      </div>
                    )}
                  </div>
                )}

                {/* Size sliders — the same three controls as in the settings modal */}
                <div className="relative size-dropdown-container">
                  <button
                    type="button"
                    onClick={() => setIsSizeDropdownOpen(!isSizeDropdownOpen)}
                    title="লেখার আকার"
                    className="flex items-center gap-2 h-8 rounded-lg border border-[#DDD6FE] bg-white px-3 py-1 text-sm font-medium text-slate-700 outline-none hover:bg-slate-50 focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]"
                  >
                    <svg className="w-4 h-4 text-[#7C3AED]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V5h10v2M9 5v14M7 19h4M15 13v-1h6v1M18 12v7M16.5 19h3" />
                    </svg>
                    আকার
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isSizeDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-3 z-50 space-y-2.5">
                      <ScaleSlider
                        label="লেখার আকার"
                        value={fontScale}
                        onChange={setFontScale}
                        hint="পুরো মার্কশিট ছোট/বড় হয়।"
                      />
                      <ScaleSlider
                        label="নাম ও ঠিকানার আকার"
                        value={headerScale}
                        onChange={setHeaderScale}
                        hint="শুধু প্রতিষ্ঠানের নাম ও ঠিকানা।"
                      />
                      <ScaleSlider
                        label="ফলাফলের সারির ফাঁক"
                        value={rowGapScale}
                        onChange={setRowGapScale}
                        min={40}
                        max={220}
                        hint="সারিগুলোর উপরে-নিচে কতটুকু ফাঁকা থাকবে।"
                      />
                      <ScaleSlider
                        label="লেখার ফন্ট"
                        value={contentFontScale}
                        onChange={setContentFontScale}
                        hint="পরীক্ষার্থীর তথ্য, নম্বর বিভাজন, ফলাফল, সারসংক্ষেপ ও মন্তব্য — সব লেখা।"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => window.print()}
                disabled={!canPrint}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                প্রিন্ট করুন
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-center text-sm font-medium">
              Failed to load report.
            </div>
          )}

          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-280px)] p-4 print:p-0 print:max-h-none print:overflow-visible">
            {/* ⭐ প্রিন্ট স্কেল এই wrapper-এর উপর অ্যাপ্লাই হয় */}
            <div id="mark-sheet-print-area">
              {/* Font scale — applies on screen and in print (compounds with print scale) */}
              <div style={{ zoom: Number(fontScale) / 100 }}>
                {renderResult()}
              </div>
            </div>
          </div>
        </div>
        
      </div>

      {/* ================= সেটিংস ও টেমপ্লেট মডাল ================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className={`${C.gradient} px-5 py-4 flex items-center justify-between`}>
              <div>
                <h3 className="text-white font-bold text-lg">মার্কশিট সেটিংস</h3>
                <p className="text-white/80 text-xs mt-0.5">পছন্দের টেমপ্লেট ও সেটিংস সিলেক্ট করুন</p>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* ⭐ নতুন: নোট বাটন */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleStudentMarkSheetNote}
                  className="w-full flex items-center justify-center gap-2 bg-[#F5F3FF] border border-[#E9D5FF] text-[#6D28D9] font-bold text-sm px-4 py-3 rounded-xl hover:bg-[#EDE9FE] transition shadow-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                  বিভাগ মার্কশিট নোট তৈরি করুন
                </button>
              </div>

              {/* ⭐ প্রিন্ট সাইজ সেটিংস (মডালের ভেতরেও) */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" /></svg>
                  প্রিন্ট সেটিংস
                </h4>
                <div className="flex items-center gap-3 mb-3">
                  <select
                    value={colorMode}
                    onChange={(e) => setColorMode(e.target.value)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="color">রঙিন</option>
                    <option value="bw">সাদা-কালো</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    সাদা-কালো দিলে ডিজাইন একই থাকবে, শুধু রঙ উঠে যাবে।
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={printScale}
                    onChange={(e) => setPrintScale(e.target.value)}
                    className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="100">১০০% (ডিফল্ট)</option>
                    <option value="95">৯৫%</option>
                    <option value="90">৯০%</option>
                    <option value="85">৮৫%</option>
                    <option value="80">৮০%</option>
                    <option value="75">৭৫%</option>
                  </select>
                  <p className="text-xs text-slate-500">
                    বিষয় বেশি হয়ে ফুটার ২য় পেজে গেলে ৮৫% বা ৮০% দিন।
                  </p>
                </div>

              </div>

              {/* প্রেসে ছাপা মার্কশিটের ঘর — রিপোর্ট ২ বাছলে দেখা যায় */}
              {isPressReport && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-3 3m3-3l3 3m-3 13l-3-3m3 3l3-3" />
                    </svg>
                    ঘর উপর-নিচ করুন
                  </h4>
                  <p className="mb-3 text-[12px] leading-snug text-slate-600">
                    প্রেসে ছাপা কাগজে প্রতিষ্ঠানের নাম, ঠিকানা, শিক্ষাবর্ষ ও বর্ডার আগে থেকেই আছে — তাই ওগুলো আর ছাপা হয় না।
                    শুধু নিচের তিনটা ঘর বসে। কাগজ হাতে নিয়ে মিলিয়ে নিন।
                  </p>

                  <div className="space-y-3">
                      <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pressHidePreview}
                          onChange={(e) => setPressHidePreview(e.target.checked)}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                        />
                        <span>
                          <span className="block text-[13px] font-semibold text-slate-700">প্রিভিউতেও হেডার লুকান</span>
                          <span className="block text-[11px] leading-snug text-slate-500">
                            প্রতিষ্ঠানের নাম, ঠিকানা ও শিক্ষাবর্ষ পর্দাতেও সরে যাবে — ছাপা কাগজ যেমন দেখাবে ঠিক তেমন। জায়গাটা ফাঁকা থেকে যায়, বর্ডারটা তখন কাটা দাগে দেখায়।
                          </span>
                        </span>
                      </label>
                      <OffsetSlider
                        label="পরীক্ষার নামের লাইন"
                        value={pressExamOffset}
                        onChange={setPressExamOffset}
                        hint="মাইনাস = উপরে, প্লাস = নিচে।"
                      />
                      <OffsetSlider
                        label="মাঝের ডাটা ব্লক"
                        value={pressBodyOffset}
                        onChange={setPressBodyOffset}
                        hint="পরীক্ষার্থীর তথ্য, নম্বর বিভাজন, ফলাফলের টেবিল ও মন্তব্য — একসাথে।"
                      />
                      <OffsetSlider
                        label="স্বাক্ষরের সারি"
                        value={pressSignOffset}
                        onChange={setPressSignOffset}
                        hint="নিচের দুই স্বাক্ষর ও তারিখ।"
                      />
                  </div>
                </div>
              )}

              {/* ⭐ আকারের সেটিংস — তিনটি স্লাইডার, সাথে লাইভ প্রিভিউ */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7V5h10v2M9 5v14M7 19h4M15 13v-1h6v1M18 12v7M16.5 19h3" /></svg>
                  লেখার আকার
                </h4>

                <div className="space-y-3">
                  <ScaleSlider
                    label="লেখার আকার (পুরো মার্কশিট)"
                    value={fontScale}
                    onChange={setFontScale}
                    hint="প্রিভিউ ও প্রিন্ট দুই জায়গাতেই পুরো মার্কশিট ছোট/বড় হবে।"
                  />

                  <div>
                    <ScaleSlider
                      label="প্রতিষ্ঠানের নাম ও ঠিকানার আকার"
                      value={headerScale}
                      onChange={setHeaderScale}
                      hint="শুধু উপরের নাম ও ঠিকানা — বাকি লেখা অপরিবর্তিত থাকবে।"
                    />
                    <HeaderScaleSample
                      scale={headerScale}
                      name={data?.institution?.InstitutionName}
                      address={data?.institution?.Address}
                    />
                  </div>

                  <div>
                    <ScaleSlider
                      label="ফলাফলের সারির ফাঁক"
                      value={rowGapScale}
                      onChange={setRowGapScale}
                      min={40}
                      max={220}
                      hint="সারিগুলোর উপরে-নিচে কতটুকু ফাঁকা থাকবে — লেখার সাইজ বদলাবে না।"
                    />
                    <ScaleSlider
                      label="লেখার ফন্ট"
                      value={contentFontScale}
                      onChange={setContentFontScale}
                      hint="পরীক্ষার্থীর তথ্য, নম্বর বিভাজন, বিষয়ভিত্তিক ফলাফল, সারসংক্ষেপ ও মন্তব্য — সব লেখা একসাথে ছোট/বড় হবে। সারির ফাঁক বদলাবে না।"
                    />
                    <TableScaleSample rowGap={rowGapScale} font={contentFontScale} />
                  </div>
                </div>
              </div>

              {/* ⭐ পরীক্ষার্থীর তথ্য সেটিংস (মডালের ভেতরেও থাকলো) */}
              <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    পরীক্ষার্থীর তথ্য (কোনটি দেখাবে)
                  </h4>
                  <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded">
                    সর্বোচ্চ ৫টি
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.name && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.name} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, name: e.target.checked }))} 
                      disabled={!studentInfoFields.name && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">নাম</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.fatherName && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.fatherName} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, fatherName: e.target.checked }))} 
                      disabled={!studentInfoFields.fatherName && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">পিতার নাম</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.motherName && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.motherName} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, motherName: e.target.checked }))} 
                      disabled={!studentInfoFields.motherName && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">মাতার নাম</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.dob && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.dob} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, dob: e.target.checked }))} 
                      disabled={!studentInfoFields.dob && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">জন্ম তারিখ</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.registration && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.registration} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, registration: e.target.checked }))} 
                      disabled={!studentInfoFields.registration && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">দাখেলা</span>
                  </label>
                  <label className={`flex items-center gap-2 cursor-pointer ${!studentInfoFields.admission && checkedCount >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.admission} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, admission: e.target.checked }))} 
                      disabled={!studentInfoFields.admission && checkedCount >= 5}
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                    />
                    <span className="text-sm font-medium text-slate-700">ভর্তি নং</span>
                  </label>
                  {/* ⭐ totalStudents is separate — not part of the 5-field limit */}
                  <label className="col-span-2 sm:col-span-3 flex items-center gap-2 cursor-pointer pt-3 mt-1 border-t border-slate-200">
                    <input 
                      type="checkbox" 
                      checked={studentInfoFields.totalStudents !== false} 
                      onChange={(e) => setStudentInfoFields(prev => ({ ...prev, totalStudents: e.target.checked }))} 
                      className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">
                      মোট পরীক্ষার্থীর সংখ্যা
                      <span className="ml-2 text-[10px] text-slate-400 font-normal">(৫টির সীমার বাইরে)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* ⭐ স্বাক্ষর, তারিখ ও নামের সেটিংস */}
              <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  স্বাক্ষর, তারিখ ও নামের সেটিংস
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* চেকবক্স সেটিংস */}
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showDate} 
                        onChange={(e) => setShowDate(e.target.checked)} 
                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-slate-700">তারিখ দেখাবে</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showSignature} 
                        onChange={(e) => setShowSignature(e.target.checked)} 
                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-slate-700">স্বাক্ষর (ছবি) দেখাবে</span>
                    </label>
                    {/* ⭐ নতুন চেকবক্স */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showClassTeacherSign} 
                        onChange={(e) => setShowClassTeacherSign(e.target.checked)} 
                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-slate-700">শ্রেণী শিক্ষক মন্তব্য দেখাবে</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={showGuardianSign} 
                        onChange={(e) => setShowGuardianSign(e.target.checked)} 
                        className="w-4 h-4 text-violet-600 rounded border-slate-300 focus:ring-violet-500"
                      />
                      <span className="text-sm font-medium text-slate-700">অভিভাবক মন্তব্য দেখাবে</span>
                    </label>
                  </div>

                  {/* নাম এডিট করার ইনপুট */}
                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                      placeholder="মুহতামিমের নাম (ফাঁকা রাখলে ডিফল্ট)"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    />
                    <input
                      type="text"
                      value={najemName}
                      onChange={(e) => setNajemName(e.target.value)}
                      placeholder="নায়েবে তালিমাতের নাম (ফাঁকা রাখলে ডিফল্ট)"
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-700 mb-4 pb-3 border-b border-slate-100">টেমপ্লেট নির্বাচন করুন</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                {MARK_SHEET_TEMPLATES.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedTemplate(tpl.id);
                        }
                      }}
                      className={`flex cursor-pointer flex-col items-start p-4 rounded-xl border-2 transition-all text-left outline-none ${
                        isSelected
                          ? 'border-[#7C3AED] bg-[#F5F3FF] shadow-md ring-2 ring-[#7C3AED]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2 gap-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-[#6D28D9]' : 'text-slate-700'}`}>
                          {tpl.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Opens the design full size without selecting it */}
                          <button
                            type="button"
                            title="বড় করে দেখুন"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplateId(tpl.id);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-[#DDD6FE] hover:text-[#7C3AED] transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16zM11 8v6M8 11h6" />
                            </svg>
                          </button>
                          {isSelected && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{tpl.desc}</p>

                      {/* Miniature of the design */}
                      <div className={`mt-3 flex w-full justify-center rounded-lg border p-1.5 ${isSelected ? 'border-[#DDD6FE] bg-white' : 'border-slate-100 bg-slate-50'}`}>
                        <TemplateMiniature templateId={tpl.id} width={105} {...miniProps} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer — সেভ করুন writes the setup to the database */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                {isSaveError && (
                  <span className="mr-auto text-xs font-semibold text-red-600">
                    সেটিং সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।
                  </span>
                )}
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${C.primary}`}
                >
                  {isSavingSettings ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= বড় প্রিভিউ =================
          মার্কশিট ডাটা লোড থাকলে আসল ডিজাইন, না থাকলে মিনিয়েচার। */}
      {previewTemplateId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
          <div className="flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className={`${C.gradient} flex items-center justify-between px-5 py-3`}>
              <div>
                <h3 className="text-white font-bold text-base">
                  {MARK_SHEET_TEMPLATES.find((t) => t.id === previewTemplateId)?.name}
                </h3>
                <p className="text-white/80 text-xs mt-0.5">
                  {MARK_SHEET_TEMPLATES.find((t) => t.id === previewTemplateId)?.desc}
                </p>
              </div>
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/20 text-white hover:bg-white/30 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              {hasMarkSheetParams && data ? (
                <div style={{ zoom: 0.62 }}>
                  <MarkSheetPdf
                    data={data}
                    templateId={previewTemplateId}
                    showDate={showDate}
                    showSignature={showSignature}
                    principalName={principalName}
                    najemName={najemName}
                    paperSize={paperSize}
                    orientation={orientation}
                    studentInfoFields={studentInfoFields}
                    colorMode={colorMode}
                    showClassTeacherSign={showClassTeacherSign}
                    showGuardianSign={showGuardianSign}
                    headerScale={headerScale}
                    contentFontScale={contentFontScale}
                    rowGapScale={rowGapScale}
                    language={sheetLanguage}
                    {...pressProps}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <TemplateMiniature templateId={previewTemplateId} width={210} {...miniProps} />
                  </div>
                  <p className="text-sm font-medium text-slate-500 text-center">
                    সেশন, পরীক্ষা ও শ্রেণী নির্বাচন করে View দিলে এখানে আসল ডাটা দিয়ে প্রিভিউ দেখা যাবে।
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-3">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(previewTemplateId);
                  setPreviewTemplateId(null);
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition ${C.primary}`}
              >
                এই ডিজাইনটি নির্বাচন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkSheet;
