import { useState } from 'react';
import Loading from '../components/Loading/Loading';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import useTranslate from '../utils/Translate';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { resultReports } from '../Data/userReportsData';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetClassListQuery, useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import Button from '../components/Button/Button';
import { useGetResultReportDataQuery } from '../features/result/resultSilce';
import AdmissionFormWithResult from '../view/students/reports/result-reports/AdmissionFormWithResult';
import StudentResultSheet from '../view/result/Reports/StudentResultSheet';
import StudentResultSheetTwoColumn from '../view/result/Reports/StudentResultSheetTwoColumn';
import AttendanceSheet from '../view/result/Reports/AttendanceSheet';
import ScaledPreview from '../components/ScaledPreview';
import StudentResultState from '../view/result/Reports/StudentResultState';

const ResultReport = () => {
  const translate = useTranslate();
  const [queryParams, setQueryParams] = useState(null);
  const {
    data: reportData,
    isLoading,
    isFetching,
    error,
  } = useGetResultReportDataQuery(queryParams, { skip: !queryParams });

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subclassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();


  const methods = useForm();
  const { control, handleSubmit } = methods;

  const selectedReportID = useWatch({ control, name: "ReportID" });
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
          "UserCode",
        ].includes(fieldName);
      case 2:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 3:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 4:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 5:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
          "SubClassID",
        ].includes(fieldName);
      case 6:
        return [
          "ReportID",
          "SessionID",
          "ExamID",
        ].includes(fieldName);
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
      if (params[key] === undefined || params[key] === "") {
        delete params[key];
      }
    });

    setQueryParams(params);
  };

  const hasStudentResults = Array.isArray(reportData?.studentResults)
    && reportData.studentResults.length > 0;
  const hasDivisionStatistics = Array.isArray(reportData?.divisionStatistics)
    && reportData.divisionStatistics.length > 0;

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className='flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden mb-4'>
        <h1 className='font-semibold text-lg text-theme-dark font-default mb-0'>ফলাফল রিপোর্ট</h1>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 min-h-screen print:min-h-0 print:gap-0'>
        <div className="p-4 print:hidden bg-white lg:w-[40%]">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <DefaultSelect
                label={translate("Report") + ":"}
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={resultReports}
                type="number"
                require="This Field is required"
              />

              {shouldShowFields("SessionID") && (
                <DefaultSelect
                  label={translate("Session") + " :"}
                  nameField="SessionName"
                  registerKey="SessionID"
                  valueField="SessionID"
                  options={sessionData ?? []}
                  require="This Field is required"
                  defaultSelect={false}
                  unicode={true}
                />
              )}

              {shouldShowFields("ExamID") && (
                <DefaultSelect
                  label={translate("Exam") + " :"}
                  nameField="ExamName"
                  registerKey="ExamID"
                  valueField="ExamID"
                  options={examNameData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}

              {shouldShowFields("ClassID") && (
                <DefaultSelect
                  label={translate("Class") + " :"}
                  nameField="ClassName"
                  registerKey="ClassID"
                  valueField="ClassID"
                  options={classListData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}

              {shouldShowFields("SubClassID") && (
                <DefaultSelect
                  label={translate("Sub Class") + " :"}
                  nameField="SubClass"
                  registerKey="SubClassID"
                  valueField="SubClassID"
                  options={subclassListData ?? []}
                  require={"This Field is required"}
                  unicode={true}
                />
              )}


              <Button type='submit'>Submit</Button>

            </form>
          </FormProvider>
        </div>

        <div className="w-full text-sm text-black bg-white relative">
          {isFetching && (
            <div className="p-2">{translate("Loading report...")}</div>
          )}

          {error && (
            <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center">
              Failed to load report.
            </div>
          )}
          <div className="print:hidden flex justify-end p-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 print:hidden"

            >
              প্রিন্ট করুন
            </button>
          </div>
          {hasStudentResults && selectedReportID == 1 && (
            <div className="">
              <div className="w-full overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>

              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}

          {hasStudentResults && selectedReportID == 2 && (
            <div className="">
              <div className="w-full overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>



              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}
          {hasStudentResults && selectedReportID == 3 && (
            <div className="">

              <div className="w-full overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>


              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <StudentResultSheet reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}
          {hasStudentResults && selectedReportID == 4 && (
            <div className="">

              <div className="w-full overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <StudentResultSheetTwoColumn reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>



              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <StudentResultSheetTwoColumn reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}
          {hasStudentResults && selectedReportID == 5 && (
            <div className="">


              <div className="w-full overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <AttendanceSheet reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>


              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <AttendanceSheet reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}
          {hasDivisionStatistics && selectedReportID == 6 && (
            <div className="">

              <div className="w-full  overflow-hidden print:min-h-0 print:gap-0 print:hidden">
                <ScaledPreview designWidth={750}>
                  <StudentResultState reportData={reportData} query={queryParams} />
                </ScaledPreview>
              </div>

              <div className="w-full relative max-w-full print_canvas result-report-print">
                <div className="min-w-[750px]  mx-auto">
                  <StudentResultState reportData={reportData} query={queryParams} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



    </div>
  );
};

export default ResultReport;
