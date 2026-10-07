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
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
    <p className="text-sm font-medium text-emerald-700">মার্কশিট লোড হচ্ছে, অপেক্ষা করুন...</p>
  </div>
);

const MarkSheet = () => {
  const translate = useTranslate();
  const [queryParams, setQueryParams] = useState(null);
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
        <div className="p-4 m-2 bg-white rounded-md shadow-md text-red-600 text-center print:hidden">
          মার্কশিট লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </div>
      );
    }

    if (!hasMarkSheetParams || !data) {
      return (
        <div className="p-10 text-center text-slate-500 print:hidden">
          মার্কশিট দেখতে সেশন, পরীক্ষা ও শ্রেণী নির্বাচন করুন।
        </div>
      );
    }

    return <MarkSheetPdf data={data} />;
  };

  const canPrint = hasMarkSheetParams && !!data && !isMarkSheetBusy && !isMarkSheetError;

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden mb-4">
        <h1 className="font-semibold text-lg text-theme-dark font-default mb-0">
          {translate('Mark Sheet')}
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleStudentMarkSheetNote}>
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              বিভাগ মার্কশিট নোট
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 min-h-screen print:min-h-0 print:gap-0 print:block">
        {/* Left: Filter Panel (print-e hide) */}
        <div className="p-4 print:hidden bg-white lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-1 gap-4"
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
                <>
                  <DefaultInput registerKey="UserCode1" label="আইডি থেকে" />
                  <DefaultInput registerKey="UserCode2" label="আইডি পর্যন্ত" />
                </>
              )}

              <Button type="submit">Submit</Button>
            </form>
          </FormProvider>
        </div>

        {/* Right: Result Panel */}
        <div className="w-full text-sm text-black bg-white relative print:bg-transparent print:text-[inherit]">
          {isFetching && <div className="p-2 print:hidden">{translate('Loading report...')}</div>}

          {error && (
            <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center print:hidden">
              Failed to load report.
            </div>
          )}

          <div className="print:hidden flex justify-end p-2">
            <button
              onClick={() => window.print()}
              disabled={!canPrint}
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 print:hidden"
            >
              প্রিন্ট করুন
            </button>
          </div>

          {/* Screen-e scroll, print-e full flow */}
          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)] pr-2 print:max-h-none print:overflow-visible print:pr-0">
            {renderResult()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkSheet;