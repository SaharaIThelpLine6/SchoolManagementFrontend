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
import { useGetExamHallListQuery } from '../features/examhall/examHallQuerySlice';
import ExaminationRoomSeatingChart from '../view/exam/ExamReportPdf/ExaminationRoomSeatingChart';
import InstituteExamSeatingChart from '../view/exam/ExamReportPdf/InstituteExamSeatingChart';
const API_URL = import.meta.env.VITE_SERVER_URL;

const ExamReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const [documentLogo, setDocumentLogo] = useState('');
  const [logoIsActive, setLogoIsActive] = useState(false);

  const { control, handleSubmit, watch } = methods;
  const formValues = useWatch({ control });
  const selectedReportID = formValues?.ReportID;
  const languageID = formValues?.id;
  const selectedPdfID = formValues?.PdfID;

  const isSeatNoReport = Number(selectedReportID) === 7;

  // Define which ReportIDs should show which fields
  const shouldShowFields = (fieldName) => {
    switch (selectedReportID) {
      case 1:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'SubClassID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 2:
        return fieldName === 'ReportID';
      case 3:
        return [
          'ReportID',
          'SessionID',
          'ExamID',
          'SubClassID',
          'RDID',
          'Langauge',
          'PdfSelect',
        ].includes(fieldName);
      case 4:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'SubClassID',
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
          'SubClassID',
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
      case 10:
        return ['ReportID', 'SessionID', 'ExamID', "HallList"].includes(
          fieldName
        );
      case 11:
        return ['ReportID', 'SessionID', 'ExamID'].includes(fieldName);
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
    PdfID
  ] = watch([
    'ReportID',
    'SessionID',
    'ExamID',
    'SubClassID',
    'RDID',
    'ERIsActive',
    'sevenColor',
    'id',
    'PdfID'
  ]);
  const shouldSkip = !ReportID || !SessionID || !ExamID || !SubClassID || !RDID || !PdfID;



  // useEffect(()=>{
  //   console.log(shouldSkip);
  // }, [shouldSkip])


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
      pdf_id: PdfID
    },
    {
      skip: shouldSkip,
    }
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

  // Fetch document logo for watermark
  useEffect(() => {
    const fetchDocumentSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/settings/document_settings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.documentLogo) {
            setDocumentLogo(`${API_URL}/public${data.documentLogo}`);
          }
          setLogoIsActive(data.isActive === true || data.isActive === 'true');
        }
      } catch (error) {
        console.error('Failed to fetch document settings:', error);
      }
    };
    fetchDocumentSettings();
  }, []);

  // Preload watermark image
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
            ? error.data.error || translate('Missing or invalid data provided')
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



  useEffect(() => {
    setQueryParams(formValues);
  }, [formValues])

  const onSubmit = (formData) => {
    // const params = {
    //   report_id: formData.ReportID,
    //   session_id: Number(formData.SessionID),
    //   class_id: Number(formData.ClassID),
    //   subClass_id: Number(formData.SubClassID),
    //   exam_id: Number(formData.ExamID),
    //   residential_id: Number(formData.RDID),
    //   language_id: Number(formData.id),
    //   pdf_id: Number(formData.PdfID),
    //   ERIsActive: Number(formData.ERIsActive),
    // };

    // Object.keys(params).forEach(
    //   (key) =>
    //     (params[key] === undefined || params[key] === '') && delete params[key]
    // );
    // console.log('Submitted params:', params);
    // setQueryParams(params);
    window.print();
  };

  // selected PDF এর নাম বের করার ফাংশন 
  const getSelectedPdfName = () => {
    if (!selectedPdfID || !pdfOptions.length) return '';
    const selectedPdf = pdfOptions.find(
      (pdf) => pdf.PdfID === Number(selectedPdfID)
    );
    return selectedPdf ? selectedPdf?.name : '';
  };

  return (
    <>
      {/* Watermark CSS — সিট নং রিপোর্ট ছাড়া বাকি সব রিপোর্টের জন্য */}
      <style>
        {`
          @media print {
            .watermark-print {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              opacity: 0.15;
              z-index: 9999;
              pointer-events: none;
              max-width: 60%;
              max-height: 60%;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
          @media screen {
            .watermark-print {
              display: none;
            }
          }
        `}
      </style>

      {/* একক বড় Watermark — সিট নং রিপোর্ট ছাড়া বাকি সব রিপোর্টে দেখাবে।
          সিট নং এর watermark প্রতিটা কার্ডের ভিতরে আলাদাভাবে বসবে (নিচে props দিয়ে)।
          রিপোর্ট ৯ সহ বাকি সব রিপোর্ট এখন এই global watermark পাবে। */}
      {!isSeatNoReport && documentLogo && logoIsActive && (
        <img
          src={documentLogo}
          alt="Watermark"
          className="watermark-print"
        />
      )}
      <div className="">
        <div className="flex flex-col font-default gap-3 print:hidden">
          <div className="print:hidden w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
            <h1 className="font-bold text-[20px] text-theme-dark mb-4 font-default">
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
                  options={examReports}
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

                {shouldShowFields('SubClassID') && (
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
                {
                  shouldShowFields('HallList') && (<DefaultSelect options={examHallList} registerKey={"HallId"} nameField={"HallName"} valueField={"ID"} label={translate('Exam Hall')} />)
                }

                <div className="md:col-span-4 flex justify-end">
                  <Button type="submit">{translate('Preview')}</Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* StatisticsOfAllExaminees কম্পোনেন্টে প্রয়োজনীয় props পাস করুন */}
        <div className="print:block">
          {/* ১. পরীক্ষার ফি উত্তোলন তালিকা */}
          {Number(selectedReportID) === 1 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 1 && <BanglaOneColumn />}
          {Number(selectedReportID) === 1 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 2 && <BanglaTwoColumn reportData={data} queryParams={queryParams} />}
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
            Number(selectedPdfID) === 1 && <ExamRoutine reportData={data}  queryParams={queryParams} />}
          {Number(selectedReportID) === 3 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 2 && <WithoutExamRoutine reportData={data}  queryParams={queryParams} />}
          {/* Arobic 2 pdf baki ase */}
          {/* ৪. নম্বর পত্র */}
          {Number(selectedReportID) == 4 &&
            Number(languageID) == 1 && 
            Number(selectedPdfID) == 1 && <BanglaNumberWithTwoColumn reportData={data} queryParams={queryParams} />}


          {Number(selectedReportID) == 4 &&
            Number(languageID) == 1 &&
            Number(selectedPdfID) == 2 && <BanglaWithOutNameColumn  reportData={data} queryParams={queryParams} />}
          {/* {Number(selectedReportID) === 4 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 3 && <BanglaNumberStudentNameWithA5 />} */}
          {/* {Number(selectedReportID) === 4 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 4 && <BanglaNumberStudentWithOutNameA5 />} */}


            {/*  */}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 1 && <ArobicNameWithTwoColumn reportData={data} queryParams={queryParams} />}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 2 && <ArobicNameWithTwoColumn reportData={data} queryParams={queryParams} />}
          {/* {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 3 && <ArobicNumberStudentWithOutNameA5 />}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 3 && <ArobicNumberStudentWithOutNameA5 />}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 4 && <ArobicNumberStudentWithOutNameA5 />} */}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 5 && <ArobicNameWithLegal />}
          {Number(selectedReportID) === 4 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 6 && <ArobicNameWithLegal />}

          {/* 5. নম্বরপত্র ভর্তি সিরিয়ালে */}
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

          {/* 7. সিট নং — প্রতিটা কার্ডের ভিতরে আলাদা watermark বসানোর জন্য
              documentLogo ও logoIsActive props হিসেবে পাস করা হচ্ছে। */}
          {Number(selectedReportID) === 7 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 1 && (
              <BSeatNoWhite
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}
          {Number(selectedReportID) === 7 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 2 && (
              <BSeatNoColor
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}
          {Number(selectedReportID) === 7 &&
            Number(languageID) === 1 &&
            Number(selectedPdfID) === 3 && (
              <BSeatNoWhite
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}

          {Number(selectedReportID) === 7 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 1 && (
              <ASeatNoWhite
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}
          {Number(selectedReportID) === 7 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 2 && (
              <ASeatNoColor
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}
          {Number(selectedReportID) === 7 &&
            Number(languageID) === 2 &&
            Number(selectedPdfID) === 3 && (
              <ASeatNoSeatPlain
                queryParams={queryParams}
                documentLogo={documentLogo}
                logoIsActive={logoIsActive}
              />
            )}
          {/* 8. নম্বরপত্র ভর্তি সিরিয়ালে */}
          {Number(selectedReportID) === 8 && <SingatureSheetNS />}
          {/* 9. সকল পরীক্ষার্থীর পরিসংখ্যান  */}
          {Number(selectedReportID) === 9 && <StatisticsOfAllStudents />}
          {Number(selectedReportID) === 10 && <ExaminationRoomSeatingChart queryParams={queryParams} />}
          {Number(selectedReportID) === 11 && <InstituteExamSeatingChart queryParams={queryParams} />}
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
    </>
  );
};

export default ExamReport;
