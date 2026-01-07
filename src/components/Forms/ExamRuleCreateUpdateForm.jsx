import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import Button from '../Button/Button';

import {
  useGetExamRuleQuery,
  usePostExamRuleMutation,
  usePutExamRuleMutation,
} from '../../features/exam/examQuerySlice';
import Textarea from './Textarea';

const ExamRuleCreateUpdateForm = ({ id }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset, setValue } = methods;
  console.log(id, 'id');
  const { data: examRules = [], isLoading: isExamRuleLoading } =
    useGetExamRuleQuery(id, {
      skip: !id,
    });
  console.log(examRules, 'examRules');
  const [createExamRule, { isLoading: isCreating }] = usePostExamRuleMutation();
  const [updateExamRule, { isLoading: isUpdating }] = usePutExamRuleMutation();

  // Reset form when ID changes or selected rule changes
  // useEffect(() => {
  //   if (id && examRules) {
  //     setValue('ExamRule', examRules.ExamRule || '');
  //   }
  // }, [id, examRules]);

  const onSubmit = async (formData) => {
    const payload = { ExamRule: formData.ExamRule };

    try {
      if (id) {
        // UPDATE
        await updateExamRule({ id, ...payload }).unwrap();
        Swal.fire({
          title: translate('Rule updated successfully!'),
          icon: 'success',
        });
      } else {
        // CREATE
        await createExamRule(payload).unwrap();
        Swal.fire({
          title: translate('Rule created successfully!'),
          icon: 'success',
        });
      }
      hideModal();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: translate('Failed to submit rule'),
        confirmButtonColor: '#3B82F6',
      });
    }
  };

  if (isExamRuleLoading) return <p>{translate('Loading...')}</p>;

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="font-lato p-6">
        <div className="mb-4">
          <Textarea
            registerKey="ExamRule"
            require={translate('Rule name is required')}
            type="text"
            placeholder={`${translate('Enter type of rule')}...`}
            label={translate('Exam Rule')}
            defaultValue={examRules.ExamRule ?? ''}
          />
        </div>

        <Button
          type="submit"
          loading={isCreating || isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {id ? translate('Update') : translate('Create')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default ExamRuleCreateUpdateForm;
