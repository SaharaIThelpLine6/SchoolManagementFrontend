import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useCreateClassMutation,
  useGetSingleClassQuery,
  useUpdateClassMutation,
} from '../../features/class/classQuerySlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const ClassCreateUpdateModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;

  const isEditMode = !!id;

  // GET SINGLE
  const { data: classData, isLoading } = useGetSingleClassQuery(id, {
    skip: !isEditMode,
  });

  const [postClass, { isLoading: isAdding }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  // PREFILL DATA
  useEffect(() => {
    if (classData?.data) {
      setValue('ClassName', classData.data.ClassName || '');
      setValue('EnglishClass', classData.data.EnglishClass || '');
      setValue('ArabicClass', classData.data.ArabicClass || '');
    }
  }, [classData, setValue]);

  // SUBMIT
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateClass({ id, data: formData }).unwrap();
        toast.success(translate('Class updated successfully'));
      } else {
        await postClass(formData).unwrap();
        toast.success(translate('Class created successfully'));
      }
      hideModal();
      reset();
    } catch (err) {
      toast.error(translate('Failed to save class'));
      console.error(err);
    }
  };

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        {isEditMode ? translate('Update Class') : translate('Create Class')}
      </h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <DefaultInput
            label={translate('Class Name')}
            registerKey="ClassName"
            require={translate('Class name is required')}
          />

          <DefaultInput
            label={translate('English Name')}
            registerKey="EnglishClass"
          />

          <DefaultInput
            label={translate('Arabic Name')}
            registerKey="ArabicClass"
          />

          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="submit"
              disabled={isAdding || isUpdating}
              loading={isAdding || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>

            <Button
              type="button"
              onClick={() => hideModal()}
              variant="secondary"
            >
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ClassCreateUpdateModal;
