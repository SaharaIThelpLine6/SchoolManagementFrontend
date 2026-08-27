import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css'; // 🔹 Swal CSS fix
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useCreateClassMutation,
  useGetSingleClassQuery,
  useUpdateClassMutation,
} from '../../features/class/classQuerySlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

const ClassCreateUpdateModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;

  const isEditMode = !!id;

  const { data: classData, isLoading } = useGetSingleClassQuery(id, {
    skip: !isEditMode,
  });

  const [postClass, { isLoading: isAdding }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  useEffect(() => {
    if (classData?.data) {
      setValue('ClassName', classData.data.ClassName || '');
      setValue('EnglishClass', classData.data.EnglishClass || '');
      setValue('ArabicClass', classData.data.ArabicClass || '');
    }
  }, [classData, setValue]);

  // 🔹 edit confirmation + update + success/error handler
  const handleEditWithConfirm = async (formData) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to edit this class?'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, edit it!'),
      cancelButtonText: translate('Cancel'),
      width: '400px',
    });

    if (result.isConfirmed) {
      try {
        await updateClass({ id, data: formData }).unwrap();
        await Swal.fire({
          icon: 'success',
          title: translate('Update successfully'),
          timer: 1500,
          showConfirmButton: false,
          width: '400px',
        });
        hideModal();
        reset();
      } catch (err) {
        await Swal.fire({
          icon: 'error',
          title: translate('Error'),
          text: err?.data?.message || translate('Failed to update class'),
          width: '400px',
        });
      }
    }
  };

  const onSubmit = async (formData) => {
    if (isEditMode) {
      await handleEditWithConfirm(formData);
    } else {
      try {
        await postClass(formData).unwrap();
        Toast.fire({
          icon: 'success',
          title: translate('Class created successfully')
        });
        hideModal();
        reset();
      } catch (err) {
        Toast.fire({
          icon: 'error',
          title: translate('Failed to save class')
        });
        console.error(err);
      }
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
