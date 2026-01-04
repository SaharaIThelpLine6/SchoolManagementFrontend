import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import ExamRoutingCheckbox from '../components/Checkboxes/ExamRoutingCheckbox';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import {
  examVacationStatus,
  resultReportOptional,
  resultReports,
  resultReportSizeStatus,
} from '../Data/userReportsData';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import { useGetPointVReportQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import AdmissionFormA4 from '../view/result/PointVReports/AdmissionFormA4';
import IdSerialResult from '../view/result/PointVReports/IdSerialResult';

const PointVReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });

  const watchedValues = useWatch({
    control,
    name: [
      'ReportID',
      'SessionID',
      'ClassID',
      'ExamID',
      'start_id',
      'end_id',
      'RDID',
    ],
  });

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
          'Optional',
          'SizeStatus',
        ].includes(fieldName);
      case 2:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(
          fieldName
        );
      case 3:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Optional',
          'SizeStatus',
        ].includes(fieldName);
      case 4:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Optional',
        ].includes(fieldName);
      case 5:
        return [
          'ReportID',
          'SessionID',
          'ExamID',
          'ClassID',
          'DefaultInput',
        ].includes(fieldName);
      case 6:
        return [
          'ReportID',
          'SessionID',
          'ExamID',
          'ClassID',
          'DefaultInput',
        ].includes(fieldName);
      case 7:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Optional',
        ].includes(fieldName);

      default:
        return false;
    }
  };

  const [queryParams, setQueryParams] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const { data, isFetching, isError, error, isLoading } =
    useGetPointVReportQuery(queryParams, {
      skip: !queryParams,
    });
  console.log(queryParams, 'queryParams');
  console.log(data, 'data');

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: residentialData } = useGetResidentialQuery();

  useEffect(() => {
    const [ReportID, SessionID, ClassID, ExamID, start_id, end_id, RDID] =
      watchedValues;

    // Required fields define report-wise
    const requiredFieldsMap = {
      5: ['ReportID', 'SessionID', 'ClassID', 'ExamID', 'start_id', 'end_id'],
      1: ['ReportID', 'SessionID', 'ClassID', 'ExamID', 'RDID'],
      // jodi aro report thake, ekhane add korte paro
    };

    const requiredFields = requiredFieldsMap[ReportID] || ['ReportID'];

    // Check if all required fields exist
    const allFieldsPresent = requiredFields.every((field) => {
      switch (field) {
        case 'ReportID':
          return ReportID !== undefined && ReportID !== '';
        case 'SessionID':
          return SessionID !== undefined && SessionID !== '';
        case 'ClassID':
          return ClassID !== undefined && ClassID !== '';
        case 'ExamID':
          return ExamID !== undefined && ExamID !== '';
        case 'start_id':
          return start_id !== undefined && start_id !== '';
        case 'end_id':
          return end_id !== undefined && end_id !== '';
        case 'RDID':
          return RDID !== undefined && RDID !== '';
        default:
          return true;
      }
    });

    if (!allFieldsPresent) return; // required field missing, API call hobe na

    // params build
    const params = {
      report_id: ReportID,
      session_id: SessionID,
      class_id: ClassID,
      exam_id: ExamID,
    };

    if (ReportID === 5) {
      params.start_id = start_id;
      params.end_id = end_id;
    } else if (ReportID === 1) {
      params.RDID = RDID;
    }

    // remove undefined or empty fields
    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === '') && delete params[key]
    );

    setQueryParams(params);
  }, [watchedValues]);

  const onSubmit = (formData) => {
    // const params = {
    //   report_id: formData.ReportID,
    //   session_id: formData.SessionID,
    //   class_id: formData.ClassID,
    //   exam_id: formData.ExamID,
    //   // residential_id: formData.RDID,
    //   // language_id: formData.LanguageID,
    //   start_id: formData.start_id,
    //   end_id: formData.end_id,
    // };
    // Object.keys(params).forEach(
    //   (key) =>
    //     (params[key] === undefined || params[key] === '') && delete params[key]
    // );
    // setQueryParams(params);
  };
  // useEffect(() => {
  //   if (isLoading) {
  //     // Loading modal দেখানো
  //     Swal.fire({
  //       title: 'Loading...',
  //       html: 'Please wait while fetching data',
  //       allowOutsideClick: false,
  //       didOpen: () => {
  //         Swal.showLoading();
  //       },
  //     });
  //   } else {
  //     // Loading শেষ হলে Swal hide
  //     Swal.close();

  //     // Error হলে দেখানো
  //     if (isError && error) {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Error',
  //         text: error?.data?.message || error?.error || 'Something went wrong!',
  //       });
  //     }
  //   }
  // }, [isLoading, isError, error]);

  const handlePrint = () => {
    // data নাই বা empty হলে
    if (!data || !data?.data || data.data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: translate('No Data Found'),
        text: translate('Print করার জন্য কোনো তথ্য পাওয়া যায়নি'),
        confirmButtonText: translate('OK'),
      });
      return;
    }

    // data থাকলে print
    try {
      window.print();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: translate('Print Failed'),
        text: translate('Print করার সময় সমস্যা হয়েছে'),
      });
      console.log(error);
    }
  };

  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3 print:hidden">
        <div className=" w-full border rounded-lg p-4 bg-white shadow-sm border-theme-offwhite">
          <h1 className="font-semibold text-lg text-theme-dark font-lato mb-4">
            {translate(pageTitle)}
          </h1>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {/* Report Select - Always shown */}
              <DefaultSelect
                label={translate('Report') + ':'}
                nameField="ReportName"
                registerKey="ReportID"
                valueField="ReportID"
                options={resultReports.filter((r) =>
                  [1, 2, 3, 4, 5, 6, 7].includes(r.ReportID)
                )}
                type="number"
                require="This Field is required"
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
                  label={translate('Class')}
                  nameField="ClassName"
                  registerKey="ClassID"
                  valueField="ClassID"
                  options={classListData ?? []}
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
              {shouldShowFields('Optional') && (
                <DefaultSelect
                  label={translate('Optional')}
                  nameField="name"
                  registerKey="OptionalID"
                  valueField="id"
                  options={resultReportOptional ?? []}
                  require={'This Field is required'}
                />
              )}

              {shouldShowFields('ExamVacationStatus') && (
                <div className="col-span-2">
                  <ExamRoutingCheckbox
                    label={translate('Exam Routine')}
                    options={examVacationStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? 'This Field is required'
                        : false
                    }
                  />
                </div>
              )}
              {shouldShowFields('SizeStatus') && (
                <div className="">
                  <ExamRoutingCheckbox
                    label={translate('Size Status')}
                    options={resultReportSizeStatus}
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? 'This Field is required'
                        : false
                    }
                  />
                </div>
              )}
              {shouldShowFields('DefaultInput') && (
                <div className="flex flex-col md:flex-row gap-4 ">
                  <DefaultInput registerKey="start_id" />
                  <DefaultInput registerKey="end_id" />
                </div>
              )}

              <div className="md:col-span-4 flex justify-end gap-3">
                {/* <Button type="submit" loading={isFetching}>
                  {translate('Search')}
                </Button> */}
                <Button
                  type="Button"
                  onClick={handlePrint}
                  // disabled={!data?.data || data.data.length === 0}
                >
                  {translate('Print')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <div className="print-only print-page">
        <div className="print-content">
          {selectedReportID === 5 &&
            data?.data?.length > 0 &&
            data.data.map((item, index) => (
              <AdmissionFormA4 key={index} data={item} />
            ))}

          {selectedReportID === 1 && <IdSerialResult data={data?.data || []} />}
        </div>

        <div className="print-footer print-avoid-break">
          {/* signature / footer */}
        </div>
      </div>
    </div>
  );
};

export default PointVReport;
