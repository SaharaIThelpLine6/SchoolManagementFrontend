import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useAddSessionMutation,
  useGetSessionQuery,
  useUpdateSessionMutation,
} from '../../features/session/sessionSlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const SessionCreateUpdateModal = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;

  // 🔹 Check if edit mode
  const isEditMode = !!id;

  // 🔹 Fetch data only in edit mode
  const { data: sessionData, isLoading } = useGetSessionQuery(id, {
    skip: !isEditMode,
  });

  // 🔹 Mutations
  const [addSession, { isLoading: isAdding }] = useAddSessionMutation();
  const [updateSession, { isLoading: isUpdating }] = useUpdateSessionMutation();

  // 🔹 Pre-fill form when editing
  useEffect(() => {
    if (sessionData) {
      setValue('SessionName', sessionData.SessionName);
      setValue('SessionEngName', sessionData.SessionEngName);
      setValue('SessionAraName', sessionData.SessionAraName);
    }
  }, [sessionData, setValue]);

  // 🔹 Edit with confirmation
  const handleEditWithConfirm = async (formData) => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to update this session?'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, update it!'),
      cancelButtonText: translate('Cancel'),
      width: '400px',
    });

    if (result.isConfirmed) {
      try {
        await updateSession({ id, data: formData }).unwrap();
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
          text: err?.data?.message || translate('Failed to update session'),
          width: '400px',
        });
      }
    }
  };

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    if (isEditMode) {
      await handleEditWithConfirm(formData);
    } else {
      try {
        await addSession(formData).unwrap();
        toast.success(translate('Session created successfully'));
        hideModal();
        reset();
      } catch (err) {
        toast.error(translate('Failed to save session'));
        console.error(err);
      }
    }
  };

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        {isEditMode ? translate('Update Session') : translate('Create Session')}
      </h2>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <DefaultInput
            label={translate('Session Name')}
            registerKey="SessionName"
            require={translate('Session name is required')}
          />
          <DefaultInput
            label={translate('English Name')}
            registerKey="SessionEngName"
          />
          <DefaultInput
            label={translate('Arabic Name')}
            registerKey="SessionAraName"
          />

          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="submit"
              disabled={isAdding || isUpdating}
              loading={isAdding || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>
            <Button type="button" onClick={() => hideModal()} variant="secondary">
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SessionCreateUpdateModal;
