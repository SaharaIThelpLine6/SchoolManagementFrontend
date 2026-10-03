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

  const { data } = useGetMarkSheetQuery(params, {
    skip: !params.sessionid || !params.examid || !params.classid,
    refetchOnMountOrArgChange: true,
  });

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden mb-4">
        <h1 className="font-semibold text-lg text-theme-dark font-default mb-0">
          {translate('Mark Sheet')}
        </h1>
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
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 print:hidden"
            >
              প্রিন্ট করুন
            </button>
          </div>

          {/* Screen-e scroll, print-e full flow */}
          <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)] pr-2 print:max-h-none print:overflow-visible print:pr-0">
            <MarkSheetPdf data={data} />
          </div>
        </div>
      </div>
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
// import { useGetExamFilterExamsQuery, useGetExamFilterSubclassesQuery, useGetExamSessionQuery } from '../features/exam/examQuerySlice';
// import Button from '../components/Button/Button';
// import { useGetMarkSheetQuery, useGetResultReportDataQuery } from '../features/result/resultSilce';
// import DefaultInput from '../components/Forms/DefaultInput';
// import MarkSheetPdf from '../components/ResultPdf/MarkSheetPdf';

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

//   const selectedReportID = useWatch({ control, name: "ReportID" });
//   const sessionID = useWatch({ control, name: "SessionID" });
//   const examID = useWatch({ control, name: "ExamID" });
//   const SubClassID = useWatch({ control, name: "SubClassID" });

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
//   console.log(params, "params");

//   const {
//     data,
//     isError,
//     refetch,
//   } = useGetMarkSheetQuery(params, {
//     skip: !params.sessionid || !params.examid || !params.classid,
//     refetchOnMountOrArgChange: true,
//   });

//   console.log(data, "data");

//   useEffect(() => {
//     setValue("ExamID", "");
//     setValue("SubClassID", "");
//   }, [sessionID, setValue]);

//   useEffect(() => {
//     setValue("SubClassID", "");
//   }, [examID, setValue]);

//   const shouldShowFields = (fieldName) => {
//     switch (selectedReportID) {
//       case 1:
//         return ["ReportID", "SessionID", "ExamID", "SubClassID", "UserCode"].includes(fieldName);
//       case 2:
//       case 3:
//       case 4:
//       case 5:
//         return ["ReportID", "SessionID", "ExamID", "SubClassID"].includes(fieldName);
//       case 6:
//         return ["ReportID", "SessionID", "ExamID"].includes(fieldName);
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
//       if (params[key] === undefined || params[key] === "") {
//         delete params[key];
//       }
//     });

//     setQueryParams(params);
//   };

//   const hasStudentResults = Array.isArray(reportData?.studentResults)
//     && reportData.studentResults.length > 0;
//   const hasDivisionStatistics = Array.isArray(reportData?.divisionStatistics)
//     && reportData.divisionStatistics.length > 0;

//   if (isLoading) {
//     return <Loading />;
//   }

//   return (
//     <div>
//       <div className='flex items-center justify-between bg-white p-4 rounded-tl-lg rounded-tr-lg print:hidden mb-4'>
//         <h1 className='font-semibold text-lg text-theme-dark font-default mb-0'>
//           {translate("Mark Sheet")}
//         </h1>
//       </div>

//       <div className='flex flex-col lg:flex-row gap-4 min-h-screen print:min-h-0 print:gap-0'>
//         {/* Left: Filter Panel */}
//         <div className="p-4 print:hidden bg-white lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
//           <FormProvider {...methods}>
//             <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-1 gap-4">
//               <DefaultSelect
//                 label={translate("Report")}
//                 nameField="ReportName"
//                 registerKey="ReportID"
//                 valueField="ReportID"
//                 options={markSheetResultReports}
//                 type="number"
//                 require="This Field is required"
//               />

//               {shouldShowFields("SessionID") && (
//                 <DefaultSelect
//                   label={translate("Session")}
//                   nameField="SessionName"
//                   registerKey="SessionID"
//                   valueField="SessionID"
//                   options={sessionData ?? []}
//                   require="This Field is required"
//                   defaultSelect={false}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields("ExamID") && (
//                 <DefaultSelect
//                   label={translate("Exam")}
//                   nameField="ExamName"
//                   registerKey="ExamID"
//                   valueField="ExamID"
//                   options={examNameData ?? []}
//                   require={"This Field is required"}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields("ClassID") && (
//                 <DefaultSelect
//                   label={translate("Class")}
//                   nameField="ClassName"
//                   registerKey="ClassID"
//                   valueField="ClassID"
//                   options={classListData ?? []}
//                   require={"This Field is required"}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields("SubClassID") && (
//                 <DefaultSelect
//                   label={translate("Sub Class")}
//                   nameField="SubClass"
//                   registerKey="SubClassID"
//                   valueField="SubClassID"
//                   options={subclassListData ?? []}
//                   require={"This Field is required"}
//                   unicode={true}
//                 />
//               )}

//               {shouldShowFields("UserCode") && (
//                 <>
//                   <DefaultInput registerKey="UserCode1" label="আইডি থেকে" />
//                   <DefaultInput registerKey="UserCode2" label="আইডি পর্যন্ত" />
//                 </>
//               )}

//               <Button type='submit'>Submit</Button>
//             </form>
//           </FormProvider>
//         </div>

//         {/* Right: Result Panel with Scroll */}
//         <div className="w-full text-sm text-black bg-white relative">
//           {isFetching && (
//             <div className="p-2">{translate("Loading report...")}</div>
//           )}

//           {error && (
//             <div className="p-4 bg-white rounded-md shadow-md text-red-600 text-center">
//               Failed to load report.
//             </div>
//           )}

//           <div className="print:hidden flex justify-end p-2">
//             <button
//               onClick={() => window.print()}
//               className="px-4 py-2 rounded bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 print:hidden"
//             >
//               প্রিন্ট করুন
//             </button>
//           </div>

//           {/* ✅ Right side scrollable area */}
//           <div className="overflow-y-auto overflow-x-hidden max-h-[calc(100vh-180px)] pr-2 print:max-h-none print:overflow-visible print:pr-0">
//             <MarkSheetPdf data={data} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MarkSheet;