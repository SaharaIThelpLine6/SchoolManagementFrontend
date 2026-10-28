import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useDuplicateExamConditionsMutation,
  useGetExamNamesQuery,
} from '../../../features/exam/examQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const ExamConditionPasteModal = ({ conditions }) => {
  const translate = useTranslate();
  const methods = useForm({ defaultValues: { DestinationSessionID: '', DestinationExamID: '' } });
  const { handleSubmit, setError, clearErrors, setValue, getValues, formState: { errors } } = methods;
  const { data: exams = [], isFetching: isExamsFetching, isError: isExamsError, refetch: refetchExams } = useGetExamNamesQuery();
  const {
    data: sessions = [],
    isFetching: isSessionsFetching,
    isError: isSessionsError,
    refetch: refetchSessions,
  } = useGetSessionsQuery(undefined, { refetchOnMountOrArgChange: true });
  const sessionDefaultApplied = useRef(false);
  const [duplicateExamConditions, { isLoading: isPasting }] = useDuplicateExamConditionsMutation({
    fixedCacheKey: 'exam-condition-paste',
  });

  useEffect(() => {
    if (sessionDefaultApplied.current || isSessionsFetching || isSessionsError || !sessions.length) return;
    sessionDefaultApplied.current = true;
    const activeSession = sessions.find((session) => Number(session.SessionAction) === 1);
    if (activeSession && !getValues('DestinationSessionID')) {
      setValue('DestinationSessionID', Number(activeSession.SessionID));
    }
  }, [sessions, isSessionsFetching, isSessionsError, getValues, setValue]);

  const isLoadingOptions = isSessionsFetching || isExamsFetching;
  const hasOptionsError = isSessionsError || isExamsError;

  const onSubmit = async ({ DestinationSessionID, DestinationExamID }) => {
    if (isPasting || !conditions.length) return;
    clearErrors('root');
    try {
      await duplicateExamConditions({
        SessionID: Number(DestinationSessionID),
        ExamID: Number(DestinationExamID),
        conditions: conditions.map(({ SessionID, ExamID, SubClassID }) => ({ SessionID, ExamID, SubClassID })),
      }).unwrap();
      hideModal();
    } catch (error) {
      setError('root', {
        message: translate(error?.data?.error || 'Could not paste exam conditions. Please try again.'),
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 font-default">
        <p className="text-sm text-gray-600">
          {conditions.length} {translate('conditions copied. Select the destination session and exam.')}
        </p>
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 [&>div]:min-w-0">
          <DefaultSelect
            label="Session"
            registerKey="DestinationSessionID"
            options={sessions}
            valueField="SessionID"
            nameField="SessionName"
            defaultValue="Select Session"
            require={translate('Select Session')}
            type="number"
            unicode
            disabled={isPasting || isSessionsFetching || isSessionsError}
          />
          <DefaultSelect
            label="Exam"
            registerKey="DestinationExamID"
            options={exams}
            valueField="ExamID"
            nameField="ExamName"
            defaultValue="Select Exam"
            require={translate('Select Exam')}
            type="number"
            unicode
            disabled={isPasting || isExamsFetching || isExamsError}
          />
        </div>
        {isLoadingOptions && <p role="status" className="text-sm text-gray-600">{translate('Loading...')}</p>}
        {hasOptionsError && (
          <div role="alert" className="text-sm text-red-600">
            {isSessionsError && <p>{translate('Could not load sessions. Please refresh and try again.')}</p>}
            {isExamsError && <p>{translate('Could not load exams. Please refresh and try again.')}</p>}
            <button type="button" className="mt-1 underline" onClick={() => {
              if (isSessionsError) refetchSessions();
              if (isExamsError) refetchExams();
            }}>{translate('Retry')}</button>
          </div>
        )}
        {errors.root && <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>}
        <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" onClick={hideModal} disabled={isPasting} className="w-full !bg-gray-500 hover:!bg-gray-600 sm:w-auto">
            {translate('Cancel')}
          </Button>
          <Button type="submit" className="w-full sm:w-auto" loading={isPasting} disabled={isLoadingOptions || hasOptionsError || !sessions.length || !exams.length || !conditions.length}>
            {translate('Paste')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

const idType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);
ExamConditionPasteModal.propTypes = {
  conditions: PropTypes.arrayOf(PropTypes.shape({
    SessionID: idType.isRequired,
    ExamID: idType.isRequired,
    SubClassID: idType.isRequired,
  })).isRequired,
};

export default ExamConditionPasteModal;
