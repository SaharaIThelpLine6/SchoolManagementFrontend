import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import {
  useDuplicateExamConditionsMutation,
  useGetExamNamesQuery,
} from '../../../features/exam/examQuerySlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const ExamConditionPasteModal = ({ conditions }) => {
  const translate = useTranslate();
  const methods = useForm({ defaultValues: { DestinationExamID: '' } });
  const { handleSubmit, setError, clearErrors, formState: { errors } } = methods;
  const { data: exams = [], isFetching, isError, refetch } = useGetExamNamesQuery();
  const [duplicateExamConditions, { isLoading: isPasting }] = useDuplicateExamConditionsMutation({
    fixedCacheKey: 'exam-condition-paste',
  });

  const onSubmit = async ({ DestinationExamID }) => {
    if (isPasting || !conditions.length) return;
    clearErrors('root');
    try {
      await duplicateExamConditions({
        ExamID: Number(DestinationExamID),
        conditions: conditions.map(({ SessionID, ExamID, SubClassID }) => ({ SessionID, ExamID, SubClassID })),
      }).unwrap();
      hideModal();
    } catch (error) {
      setError('root', {
        message: error?.data?.error || translate('Could not paste exam conditions. Please try again.'),
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4 font-default">
        <p className="text-sm text-gray-600">
          {conditions.length} {translate('conditions copied. Select the destination exam.')}
        </p>
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
          disabled={isPasting || isFetching || isError}
        />
        {isFetching && <p role="status" className="text-sm text-gray-600">{translate('Loading...')}</p>}
        {isError && (
          <div role="alert" className="text-sm text-red-600">
            <p>{translate('Could not load exams. Please refresh and try again.')}</p>
            <button type="button" className="mt-1 underline" onClick={refetch}>{translate('Retry')}</button>
          </div>
        )}
        {errors.root && <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button type="button" onClick={hideModal} disabled={isPasting} className="!bg-gray-500 hover:!bg-gray-600">
            {translate('Cancel')}
          </Button>
          <Button type="submit" loading={isPasting} disabled={isFetching || isError || !exams.length || !conditions.length}>
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
