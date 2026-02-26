import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
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

  // 🔹 Submit logic
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateSession({ id, data: formData }).unwrap();
        toast.success(translate('Session updated successfully'));
      } else {
        await addSession(formData).unwrap();
        toast.success(translate('Session created successfully'));
      }
      hideModal();
      reset();
    } catch (err) {
      toast.error(translate('Failed to save session'));
      console.error(err);
    }
  };

  // if (isLoading) return <Loading />;

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
