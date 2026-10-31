import { useEffect, useState } from 'react';
import Loading from '../components/Loading/Loading';
import useTranslate from '../utils/Translate';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { markSheetResultReports } from '../Data/userReportsData';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import {
  useGetExamFilterExamsQuery,
  useGetExamFilterSubclassesQuery,
  useGetExamSessionQuery,
} from '../features/exam/examQuerySlice';
import Button from '../components/Button/Button';
import { useGetMarkSheetQuery, useGetResultReportDataQuery } from '../features/result/resultSilce';
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
  { id: 'template-2', name: 'Tabular Mark Sheet', desc: 'ট্যাবুলার ফরম্যাট' },
  { id: 'template-3', name: 'Grade Sheet', desc: 'গ্রেড ভিত্তিক মার্কশিট' },
  { id: 'template-4', name: 'Compact Mark Sheet', desc: 'কম্প্যাক্ট ডিজাইন' },
];

const MarkSheet = () => {
  const translate = useTranslate();
  const [queryParams, setQueryParams] = useState(null);

  // ⭐ স্টেট: সেটিংস মডাল এবং টেমপ্লেট সিলেকশন
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('template-1');

  // ⭐ নতুন স্টেট: স্বাক্ষর, তারিখ ও নামের জন্য
  const [showDate, setShowDate] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [principalName, setPrincipalName] = useState('');
  const [najemName, setNajemName] = useState('');

  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const { data: sessionData } = useGetExamSessionQuery();
  const { data: classListData } = useGetClassListQuery();
  const methods = useForm();
  const { control, handleSubmit, setValue } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });
  const sessionID = useWatch({ control, name: 'SessionID' });
  const examID = useWatch({ control, name: 'ExamID' });
  const SubClassID = useWatch({ control, name: 'SubClassID' });

  const { data: examNameData } = useGetExamFilterExamsQuery(
    { SessionID: sessionID },
    { skip: !sessionID }
  );
  const { data: subclassListData } = useGetExamFilterSubclassesQuery(
    { SessionID: sessionID, ExamID: examID },
    { skip: !sessionID || !examID }
  );

  const params = {
    sessionid: Number(sessionID),
    examid: Number(examID),
    classid: Number(SubClassID),
  };

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

  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'UserCode'].includes(fieldName);
      case 2:
      case 3:
      case 4:
      case 5:
        return ['ReportID', 'SessionID', 'ExamID', 'SubClassID'].includes(fieldName);
      case 6:
        return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
      default:
        return false;
    }
  };

  const onSubmit = (formData) => {
    const params = {
      report_data: selectedReportID,
      session_id: formData.SessionID,
      exam_id: formData.ExamID,
      subclass_id: formData.SubClassID,
    };

    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    setQueryParams(params);
  };

  const handleStudentMarkSheetNote = () => {
    setIsSettingsOpen(false); // ⭐ নোট ওপেন করার আগে সেটিংস মডাল বন্ধ হবে
    showModal('মার্কশিট নোট তৈরি করুন', 'STUDENT_MARK_SHEET_NOTE', {
      closeOnOutSide: false,
    });
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

    // ⭐ এখানে নতুন সেটিংস প্রপসগুলো পাঠানো হলো
    return (
      <MarkSheetPdf 
        data={data} 
        templateId={selectedTemplate} 
        showDate={showDate}
        showSignature={showSignature}
        principalName={principalName}
        najemName={najemName}
      />
    );
  };

  const canPrint = hasMarkSheetParams && !!data && !isMarkSheetBusy && !isMarkSheetError;

  return (
    <div className="font-SolaimanLipi space-y-4 bg-transparent max-w-full overflow-x-hidden">
      
      {/* ================= গ্রেডিয়েন্ট হেডার ================= */}
      <div className={`${C.gradient} rounded-xl shadow-lg px-5 py-4 text-white print:hidden`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 15h6M9 11h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base sm:text-[20px] font-bold leading-tight">
                {translate('Mark Sheet')}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                শিক্ষাবর্ষ ও পরীক্ষা অনুযায়ী মার্কশিট তৈরি ও প্রিন্ট করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* ⭐ শুধুমাত্র সেটিংস বাটন */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center justify-center h-9 w-9 bg-white/20 text-white rounded-lg shadow hover:bg-white/30 transition"
              title="সেটিংস ও টেমপ্লেট"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ================= মূল কন্টেন্ট এরিয়া ================= */}
      <div className="flex flex-col lg:flex-row gap-5 min-h-screen print:min-h-0 print:gap-0 print:block">
        
        {/* Left: Filter Panel */}
        <div className="print:hidden lg:w-[35%] xl:w-[30%] shrink-0 lg:sticky lg:top-4 lg:self-start">
          <div className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden`}>
            <div className={`${C.panel} border-b ${C.panelBorder} px-4 py-3`}>
              <h4 className="text-sm font-bold text-[#5B21B6] flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                ফিল্টার ও সেটিংস
              </h4>
            </div>
            
            <div className="p-5">
              <FormProvider {...methods}>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-1 gap-4"
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

                  {shouldShowFields('UserCode') && (
                    <div className="grid grid-cols-2 gap-3">
                      <DefaultInput registerKey="UserCode1" label="আইডি থেকে" />
                      <DefaultInput registerKey="UserCode2" label="আইডি পর্যন্ত" />
                    </div>
                  )}

                  <button
                    type="submit"
                    className={`mt-2 w-full flex items-center justify-center gap-2 h-[42px] rounded-lg text-[14px] font-bold ${C.primary} shadow-sm transition`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    রিপোর্ট তৈরি করুন
                  </button>
                </form>
              </FormProvider>
            </div>
          </div>
        </div>

        {/* Right: Result Panel */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:border-0 print:shadow-none">
          
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

          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)] p-4 print:p-0 print:max-h-none print:overflow-visible">
            {renderResult()}
          </div>
        </div>
        
      </div>

      {/* ================= ⭐ নতুন: সেটিংস ও টেমপ্লেট মডাল ================= */}
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

              {/* ⭐ নতুন: স্বাক্ষর, তারিখ ও নামের সেটিংস */}
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
                    <button
                      key={tpl.id}
                      onClick={() => setSelectedTemplate(tpl.id)}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-[#7C3AED] bg-[#F5F3FF] shadow-md ring-2 ring-[#7C3AED]/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={`font-bold text-sm ${isSelected ? 'text-[#6D28D9]' : 'text-slate-700'}`}>
                          {tpl.name}
                        </span>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-white">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{tpl.desc}</p>
                      
                      <div className={`mt-3 w-full h-20 rounded-lg border flex items-center justify-center ${isSelected ? 'border-[#DDD6FE] bg-white' : 'border-slate-100 bg-slate-50'}`}>
                        <span className="text-[10px] text-slate-400 font-medium">Template Preview</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-5 py-2 rounded-lg text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition ${C.primary}`}
                >
                  সেভ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkSheet;









































// import { useEffect, useState } from 'react';
// import Loading from '../components/Loading/Loading';
// import useTranslate from '../utils/Translate';
// import { FormProvider, useForm, useWatch } from 'react-hook-form';
// import DefaultSelect from '../components/Forms/DefaultSelect';
// import { markSheetResultReports } from '../Data/userReportsData';
// import { useGetClassListQuery } from '../features/class/classQuerySlice';
// import {
//   useGetExamFilterExamsQuery,
//   useGetExamFilterSubclassesQuery,
//   useGetExamSessionQuery,
// } from '../features/exam/examQuerySlice';
// import Button from '../components/Button/Button';
// import { useGetMarkSheetQuery, useGetResultReportDataQuery } from '../features/result/resultSilce';
// import DefaultInput from '../components/Forms/DefaultInput';
// import MarkSheetPdf from '../components/ResultPdf/MarkSheetPdf';
// import { showModal } from '../utils/ModalControlar';

// // ==========================================
// // Inline loading spinner (শুধু মার্কশিট এলাকার জন্য)
// // ==========================================
// const MarkSheetLoader = () => (
//   <div className="flex flex-col items-center justify-center gap-3 py-24 print:hidden">
//     <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
//     <p className="text-sm font-medium text-emerald-700">মার্কশিট লোড হচ্ছে, অপেক্ষা করুন...</p>
//   </div>
// );

// const MarkSheet = () => {
//   const translate = useTranslate();
//   const [queryParams, setQueryParams] = useState(null);
//   const {
//     data: reportData,
//     isLoading,
//     isFetching,
//     error,
//   } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

//   const { data: sessionData } = useGetExamSessionQuery();
//   const { data: classListData } = useGetClassListQuery();
//   const methods = useForm();
//   const { control, handleSubmit, setValue } = methods;

//   const selectedReportID = useWatch({ control, name: 'ReportID' });
//   const sessionID = useWatch({ control, name: 'SessionID' });
//   const examID = useWatch({ control, name: 'ExamID' });
//   const SubClassID = useWatch({ control, name: 'SubClassID' });

//   const { data: examNameData } = useGetExamFilterExamsQuery(
//     { SessionID: sessionID },
//     { skip: !sessionID }
//   );
//   const { data: subclassListData } = useGetExamFilterSubclassesQuery(
//     { SessionID: sessionID, ExamID: examID },
//     { skip: !sessionID || !examID }
//   );

//   const params = {
//     sessionid: Number(sessionID),
//     examid: Number(examID),
//     classid: Number(SubClassID),
//   };

//   const hasMarkSheetParams = !!params.sessionid && !!params.examid && !!params.classid;

//   // ✅ Mark sheet data loading state
//   const {
//     data,
//     isLoading: isMarkSheetLoading,
//     isFetching: isMarkSheetFetching,
//     isError: isMarkSheetError,
//   } = useGetMarkSheetQuery(params, {
//     skip: !hasMarkSheetParams,
//     refetchOnMountOrArgChange: true,
//   });

//   // console.log(data, "data")

//   // isFetching ধরলে নতুন filter দিলে পুরনো data না দেখিয়ে loader দেখাবে
//   const isMarkSheetBusy = hasMarkSheetParams && (isMarkSheetLoading || isMarkSheetFetching);

//   useEffect(() => {
//     setValue('ExamID', '');
//     setValue('SubClassID', '');
//   }, [sessionID, setValue]);

//   useEffect(() => {
//     setValue('SubClassID', '');
//   }, [examID, setValue]);

//   const shouldShowFields = (fieldName) => {
//     switch (selectedReportID) {
//       case 1:
//         return ['ReportID', 'SessionID', 'ExamID', 'SubClassID', 'UserCode'].includes(fieldName);
//       case 2:
//       case 3:
//       case 4:
//       case 5:
//         return ['ReportID', 'SessionID', 'ExamID', 'SubClassID'].includes(fieldName);
//       case 6:
//         return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
//       default:
//         return false;
//     }
//   };

//   const onSubmit = (formData) => {
//     const params = {
//       report_data: selectedReportID,
//       session_id: formData.SessionID,
//       exam_id: formData.ExamID,
//       subclass_id: formData.SubClassID,
//     };

//     Object.keys(params).forEach((key) => {
//       if (params[key] === undefined || params[key] === '') {
//         delete params[key];
//       }
//     });

//     setQueryParams(params);
//   };

//   const handleStudentMarkSheetNote = () => {
//     showModal('মার্কশিট নোট তৈরি করুন', 'STUDENT_MARK_SHEET_NOTE', {
//       closeOnOutSide: false,
//     });
//   };

//   if (isLoading) {
//     return <Loading />;
//   }

//   // Result panel-এ কী দেখাবে
//   const renderResult = () => {
//     if (isMarkSheetBusy) return <MarkSheetLoader />;

//     if (isMarkSheetError) {
//       return (
//         <div className="p-4 m-2 bg-white rounded-md shadow-md text-red-600 text-center print:hidden">
//           মার্কশিট লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
//         </div>
//       );
//     }

//     if (!hasMarkSheetParams || !data) {
//       return (
//         <div className="p-10 text-center text-slate-500 print:hidden">
//           মার্কশিট দেখতে সেশন, পরীক্ষা ও শ্রেণী নির্বাচন করুন।
//         </div>
//       );
//     }

//     return <MarkSheetPdf data={data} />;
//   };

//   const canPrint = hasMarkSheetParams && !!data && !isMarkSheetBusy && !isMarkSheetError;

//   return (
//     <div>
//       <div className="flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden mb-4">
//         <h1 className="font-semibold text-lg text-theme-dark font-default mb-0">
//           {translate('Mark Sheet')}
//         </h1>
//         <div className="flex items-center gap-2">
//           <Button onClick={handleStudentMarkSheetNote}>
//             <span className="flex items-center gap-1.5">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width={18}
//                 height={18}
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M12 5v14" />
//                 <path d="M5 12h14" />
//               </svg>
//               বিভাগ মার্কশিট নোট
//             </span>
//           </Button>
//         </div>
//       </div>

//       <div className="flex flex-col lg:flex-row gap-4 min-h-screen print:min-h-0 print:gap-0 print:block">
//         {/* Left: Filter Panel (print-e hide) */}
//         <div className="p-4 print:hidden bg-white lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
//           <FormProvider {...methods}>
//             <form
//               onSubmit={handleSubmit(onSubmit)}
//               className="grid grid-cols-1 md:grid-cols-1 gap-4"
//             >
//               <DefaultSelect
//                 label={translate('Report')}
//                 nameField="ReportName"
//                 registerKey="ReportID"
//                 valueField="ReportID"
//                 options={markSheetResultReports}
//                 type="number"
//                 require="This Field is required"
//               />

//               {shouldShowFields('SessionID') && (
//                 <DefaultSelect
//                   label={translate('Session')}
//                   nameField="SessionName"
//                   registerKey="SessionID"
//                   valueField="SessionID"
//                   options={sessionData ?? []}
//                   require="This Field is required"
//                   defaultSelect={false}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields('ExamID') && (
//                 <DefaultSelect
//                   label={translate('Exam')}
//                   nameField="ExamName"
//                   registerKey="ExamID"
//                   valueField="ExamID"
//                   options={examNameData ?? []}
//                   require={'This Field is required'}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields('ClassID') && (
//                 <DefaultSelect
//                   label={translate('Class')}
//                   nameField="ClassName"
//                   registerKey="ClassID"
//                   valueField="ClassID"
//                   options={classListData ?? []}
//                   require={'This Field is required'}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields('SubClassID') && (
//                 <DefaultSelect
//                   label={translate('Sub Class')}
//                   nameField="SubClass"
//                   registerKey="SubClassID"
//                   valueField="SubClassID"
//                   options={subclassListData ?? []}
//                   require={'This Field is required'}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields('UserCode') && (
//                 <>
//                   <DefaultInput registerKey="UserCode1" label="আইডি থেকে" />
//                   <DefaultInput registerKey="UserCode2" label="আইডি পর্যন্ত" />
//                 </>
//               )}

//               <Button type="submit">Submit</Button>
//             </form>
//           </FormProvider>
//         </div>

//         {/* Right: Result Panel */}
//         <div className="w-full text-sm text-black bg-white relative print:bg-transparent print:text-[inherit]">
//           {isFetching && <div className="p-2 print:hidden">{translate('Loading report...')}</div>}

//           {error && (
//             <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center print:hidden">
//               Failed to load report.
//             </div>
//           )}

//           <div className="print:hidden flex justify-end p-2">
//             <button
//               onClick={() => window.print()}
//               disabled={!canPrint}
//               className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 print:hidden"
//             >
//               প্রিন্ট করুন
//             </button>
//           </div>

//           {/* Screen-e scroll, print-e full flow */}
//           <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)] pr-2 print:max-h-none print:overflow-visible print:pr-0">
//             {renderResult()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarkSheet;
