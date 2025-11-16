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
  language,
} from '../Data/userReportsData';
import { setPageName } from '../features/auth/authSlice';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import { useGetUserReportQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import StatisticsOfAllExaminees from '../view/exam/ExamReportPdf/Statistics of all examinees/StatisticsOfAllExaminees';

const ExamReport = ({ pageTitle }) => {
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const { status } = useSelector((state) => state.settings);

  const { control, handleSubmit } = methods;

  const selectedReportID = useWatch({ control, name: 'ReportID' });

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
        ].includes(fieldName);
      case 4:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
        ].includes(fieldName);
      case 5:
        return [
          'ReportID',
          'SessionID',
          'RDID',
          'ExamID',
          'ClassID',
          'Langauge',
          'ColorStatus',
        ].includes(fieldName);
      case 6:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(
          fieldName
        );
      case 7:
        return ['ReportID', 'SessionID', 'RDID', 'ExamID', 'ClassID'].includes(
          fieldName
        );
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

  const { isFetching, isError, error } = useGetUserReportQuery(queryParams, {
    skip: !queryParams,
  });

  console.log(error, 'error');

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
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

  const onSubmit = (formData) => {
    const params = {
      report_id: formData.ReportID,
      session_id: Number(data.session_id),
      class_id: Number(data.class_id),
      exam_id: Number(data.exam_id),
      residential_id: Number(data.residential_id),
      language_id: Number(data.language_id),
    };

    Object.keys(params).forEach(
      (key) =>
        (params[key] === undefined || params[key] === '') && delete params[key]
    );
    // console.log(params);
    setQueryParams(params);
  };

  return (
    <div className="font-SolaimanLipi">
      <div className="flex flex-col gap-3">
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
                    registerKey="IsActive"
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
                    registerKey="IsActive"
                    require={
                      selectedReportID === 1 || selectedReportID === 2
                        ? 'This Field is required'
                        : false
                    }
                  />
                </div>
              )}

              <div className="md:col-span-4 flex justify-end">
                <Button type="submit" loading={isFetching}>
                  {translate('Preview')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>

      <StatisticsOfAllExaminees />
    </div>
  );
};

export default ExamReport;
