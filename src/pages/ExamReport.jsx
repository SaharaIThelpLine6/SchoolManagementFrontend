import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
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
  sixLanguageExamReport,
  threeLanguageExamReport,
} from '../Data/userReportsData';
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
import ArobicNumberStudentWithOutNameA5 from '../view/exam/ExamReportPdf/numberLetter/ArobicNumberStudentWithOutNameA5';
import BanglaNumberStudentNameWithA5 from '../view/exam/ExamReportPdf/numberLetter/BanglaNumberStudentNameWithA5';
import BanglaNumberStudentWithOutNameA5 from '../view/exam/ExamReportPdf/numberLetter/BanglaNumberStudentWithOutNameA5';
import BanglaNumberWithTwoColumn from '../view/exam/ExamReportPdf/numberLetter/BanglaNumberWithTwoColumn';
import BanglaWithOutNameColumn from '../view/exam/ExamReportPdf/numberLetter/BanglaWithOutNameColumn';
import AdmissionSerialNWOTC from '../view/exam/ExamReportPdf/numberLetterAdmissionSerial/AdmissionSerialNWOTC';
import AdmissionSerialNWTC from '../view/exam/ExamReportPdf/numberLetterAdmissionSerial/AdmissionSerialNWTC';
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
import BanglaOneColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/BanglaOneColumn';
import BanglaTwoColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/BanglaTwoColumn';
import NameWithAddressOneColumn from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/NameWithAddressOneColumn';
import StudentNameWithHolding from '../view/exam/ExamReportPdf/studentFeeWithdrawalLists/StudentNameWithHolding';

const ExamReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit, watch } = methods;

  // useWatch দিয়ে form এর values গুলো নিন
  const formValues = useWatch({ control });
  const selectedReportID = formValues?.ReportID;
  const languageID = formValues?.id;
  const selectedPdfID = formValues?.PdfID;

  console.log(
    'selectedReportID:',
    selectedReportID,
    'languageID:',
    languageID,
    'selectedPdfID:',
    selectedPdfID
  );

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 2:
        return fieldName === 'ReportID';
      case 3:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'ExamVacationStatus',
          'PdfSelect',
        ].includes(fieldName);
      case 4:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 5:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'ColorStatus',
        ].includes(fieldName);
      case 6:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 7:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 8:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(
          fieldName
        );
      case 9:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(
          fieldName
        );

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedPdfData, setSelectedPdfData] = useState(null);
  const [
    ReportID,
    SessionID,
    ExamID,
    SubClassID,
    RDID,
    ERIsActive,
    sevenColor,
    id,
  ] = watch([
    'ReportID',
    'SessionID',
    'ExamID',
    'SubClassID',
    'RDID',
    'ERIsActive',
    'sevenColor',
    'id',
  ]);
  const shouldSkip = !ReportID || !SessionID || !ExamID || !SubClassID;

  console.log({
    ReportID: ReportID,
    SessionID: SessionID,
    ExamID: ExamID,
    SubClassID: SubClassID,
    RDID: RDID,
    ERIsActive: ERIsActive,
    Language: id,
    sevenColor: sevenColor,
  });

  const { data, isLoading, isError, error } = useGetExamReportQuery(
    {
      report_id: ReportID,
      SessionID,
      ExamID,
      SubClassID,
      RDID,
      ERIsActive,
      Language: id,
      sevenColor,
    },
    {
      skip: shouldSkip,
    }
  );

  console.log(data, 'data');
  // const { isFetching, isError, error } = useGetUserReportQuery(queryParams, {
  //   skip: !queryParams,
  // });
  console.log(error, 'error');

  const { data: sessionData } = useGetSessionsQuery();
  const { data: SubClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();

  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (status === 'idle') {
      dispatch(fetchSettingsData());
    }
  }, [status, dispatch, pageTitle]);

  useEffect(() => {
    if (isError && error) {
      setErrorMessage(
        error.status === 403
          ? translate('You do not have permission to view this report')
          : error.status === 400
          ? translate('Missing or invalid data provided')
          : translate('An error occurred while fetching the report')
      );
    } else {
      setErrorMessage(null);
    }
  }, [isError, error, translate]);

  useEffect(() => {
    if (errorMessage) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      });
    }
  }, [errorMessage]);

  const reportMap = {
    1: oneLanguageExamReport,
    3: threeLanguageExamReport,
    4: fourLanguageExamReport,
    6: sixLanguageExamReport,
    7: sevenLanguageExamReport,
  };

  const getPDFOptions = () => {
    if (!selectedReportID || !languageID) return [];

    const reportList = reportMap[selectedReportID];
    if (!reportList) return [];

    const found = reportList.find((item) => item.id === Number(languageID));
    return found?.pdfList || [];
  };

  const pdfOptions = getPDFOptions();

  // যখন PdfID change হয়, তখন selected PDF data সেট করুন
  useEffect(() => {
    if (selectedPdfID && pdfOptions.length > 0) {
      const foundPdf = pdfOptions.find(
        (pdf) => pdf.PdfID === Number(selectedPdfID)
      );
      setSelectedPdfData(foundPdf || null);
    } else {
      setSelectedPdfData(null);
    }
  }, [selectedPdfID, pdfOptions]);

  const onSubmit = (formData) => {
    const params = {
      report_id: formData.ReportID,
      session_id: Number(formData.SessionID),
      class_id: Number(formData.ClassID),
      exam_id: Number(formData.ExamID),
      residential_id: Number(formData.RDID),
      language_id: Number(formData.id),
      pdf_id: Number(formData.PdfID),
      ERIsActive: Number(formData.ERIsActive),
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === '') && delete params[key]
    );
    console.log('Submitted params:', params);
    // setQueryParams(params);
    window.print();
  };

  // selected PDF এর নাম বের করার ফাংশন
  const getSelectedPdfName = () => {
    if (!selectedPdfID || !pdfOptions.length) return '';
    const selectedPdf = pdfOptions.find(
      (pdf) => pdf.PdfID === Number(selectedPdfID)
    );
    return selectedPdf ? selectedPdf.name : '';
  };

  return (
    <div className="">
      <div className="flex flex-col font-SolaimanLipi gap-3 print:hidden">
        <div className="print:hidden w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate('Exam Report')}
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Report Select - Always shown */}
              <DefaultSelect
                label={translate('Report')}
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={examReports.filter((r) =>
                  [1, 2, 3, 4, 5, 6, 7, 8, 9].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
                defaultSelect={false}
                unicode={true}
              />

              {/* Conditionally shown fields */}
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
                  label={translate('SubClass')}
                  nameField="SubClass"
                  registerKey="SubClassID"
                  valueField="SubClassID"
                  options={SubClassListData ?? []}
                  require={'This Field is required'}
                  unicode={true}
                />
              )}

              {shouldShowFields('RDID') && (
                <DefaultSelect
                  label={translate('Residential')}
                  nameField="ResidentialName"
                  registerKey="RDID"
                  valueField="RDID"
                  options={residentialData ?? []}
                  require={'This Field is required'}
                  unicode={true}
                />
              )}

              {shouldShowFields('Langauge') && (
                <DefaultSelect
                  label={translate('Langauge')}
                  nameField="name"
                  registerKey="id"
                  valueField="id"
                  options={language ?? []}
                  require={'This Field is required'}
                  unicode={true}
                />
              )}

              {shouldShowFields('ExamVacationStatus') && (
                <div className="col-span-2">
                  <ExamRoutingCheckbox
                    label={translate('Exam Routine')}
                    options={examVacationStatus}
                    registerKey="ERIsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? 'This Field is required'
                        : false
                    }
                  />
                </div>
              )}

              {shouldShowFields('ColorStatus') && (
                <div className="">
                  <ExamRoutingCheckbox
                    label={translate('Color Status')}
                    options={colorStatus}
                    registerKey="CSIsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? 'This Field is required'
                        : false
                    }
                  />
                </div>
              )}

              {shouldShowFields('PdfSelect') && pdfOptions.length > 0 && (
                <DefaultSelect
                  label={translate('PDF Select')}
                  nameField="name"
                  registerKey="PdfID"
                  valueField="PdfID"
                  options={pdfOptions}
                  require="This Field is required"
                />
              )}
              {selectedReportID === 5 && (
                <DefaultSelect
                  label={translate('PDF Select')}
                  nameField="name"
                  registerKey="PdfID"
                  valueField="PdfID"
                  options={fiveLanguageExamReport}
                  require="This Field is required"
                />
              )}

              <div className="md:col-span-4 flex justify-end">
                <Button type="submit">{translate('Preview')}</Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      {/* StatisticsOfAllExaminees কম্পোনেন্টে প্রয়োজনীয় props পাস করুন */}
      <div className="hidden print:block">
        {/* ১. পরীক্ষার ফি উত্তোলন তালিকা */}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 1 && <BanglaOneColumn />}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 2 && <BanglaTwoColumn />}
        {/* Arob */}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 1 && <ArobicTwoColumn />}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 2 && <ArobicOneColumnA5 />}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 3 && <NameWithAddressOneColumn />}
        {Number(selectedReportID) === 1 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 4 && <StudentNameWithHolding />}
        {/* ২. প্রবেশ পত্র */}
        {/* ৩. দস্তখত পত্র */}
        {Number(selectedReportID) === 3 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 1 && <ExamRoutine />}
        {Number(selectedReportID) === 3 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 2 && <WithoutExamRoutine />}
        {/* Arobic 2 pdf baki ase */}
        {/* ৪. নম্বর পত্র */}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 1 && <BanglaNumberWithTwoColumn />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 2 && <BanglaWithOutNameColumn />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 3 && <BanglaNumberStudentNameWithA5 />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 4 && <BanglaNumberStudentWithOutNameA5 />}

        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 1 && <ArobicNameWithTwoColumn />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 2 && <ArobicNameWithTwoColumn />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 3 && <ArobicNumberStudentWithOutNameA5 />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 3 && <ArobicNumberStudentWithOutNameA5 />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 4 && <ArobicNumberStudentWithOutNameA5 />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 5 && <ArobicNameWithLegal />}
        {Number(selectedReportID) === 4 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 6 && <ArobicNameWithLegal />}

        {/* 5. নম্বরপত্র ভর্তি সিরিয়ালে */}
        {Number(selectedReportID) === 5 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 1 && <AdmissionSerialNWTC />}
        {Number(selectedReportID) === 5 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 2 && <AdmissionSerialNWOTC />}
        {/* 6. স্বাক্ষরপত্র ও নম্বরসীট */}
        {Number(selectedReportID) === 6 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 1 && <ArobicNumberClassBasedTC />}
        {/* 7. সিট নং */}
        {Number(selectedReportID) === 7 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 1 && <BSeatNoWhite />}
        {Number(selectedReportID) === 7 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 2 && <BSeatNoColor />}
        {Number(selectedReportID) === 7 &&
          Number(languageID) === 1 &&
          Number(selectedPdfID) === 3 && <BSeatNoWhite />}

        {Number(selectedReportID) === 7 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 1 && <ASeatNoWhite />}
        {Number(selectedReportID) === 7 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 2 && <ASeatNoColor />}
        {Number(selectedReportID) === 7 &&
          Number(languageID) === 2 &&
          Number(selectedPdfID) === 3 && <ASeatNoSeatPlain />}
        {/* 8. নম্বরপত্র ভর্তি সিরিয়ালে */}
        {Number(selectedReportID) === 8 && <SingatureSheetNS />}
        {/* 9. সকল পরীক্ষার্থীর পরিসংখ্যান  */}
        {Number(selectedReportID) === 9 && <StatisticsOfAllStudents />}
      </div>

      {/* <StatisticsOfAllExaminees
        queryParams={queryParams}
        selectedPdfID={selectedPdfID}
        selectedPdfName={getSelectedPdfName()}
        pdfOptions={pdfOptions}
        reportData={{
          reportID: selectedReportID,
          languageID: languageID,
          pdfData: selectedPdfData
        }}
      /> */}
    </div>
  );
};

export default ExamReport;
