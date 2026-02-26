import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Button from '../../components/Button/Button';
import Textarea from '../../components/Forms/Textarea';

import {
  useGetSingleMaddasahReportQuery,
  usePostMaddasahReportsMutation,
  useUpdateMaddasahReportsMutation,
} from '../../features/talimat/talimatQuerySlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';

const MaddrasahReportEditCreate = ({ id }) => {
  const methods = useForm({
    defaultValues: {
      Details: '',
    },
  });
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;

  const isEditMode = Boolean(id);

  /* =========================
     Queries & Mutations
  ========================== */

  const { data: editData, isFetching } = useGetSingleMaddasahReportQuery(id, {
    skip: !isEditMode,
  });

  const [createMaddrasah, { isLoading: isCreating }] =
    usePostMaddasahReportsMutation();

  const [updateMaddrasah, { isLoading: isUpdating }] =
    useUpdateMaddasahReportsMutation();

  /* =========================
     Prefill for Edit
  ========================== */

  useEffect(() => {
    if (isEditMode && editData?.data) {
      setValue('Details', editData.data.Details || '');
    } else {
      reset();
    }
  }, [isEditMode, editData, setValue, reset]);

  /* =========================
     Submit Handler
  ========================== */

  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        await updateMaddrasah({
          id,
          Details: formData.Details,
        }).unwrap();

        toast.success(translate('Report updated successfully'));
      } else {
        await createMaddrasah({
          Details: formData.Details,
        }).unwrap();

        toast.success(translate('Report created successfully'));
      }

      hideModal();
      reset();
    } catch (error) {
      console.error('Maddrasah report error:', error);
      toast.error(error?.data?.message || translate('Failed to save report'));
    }
  };

  /* =========================
     UI
  ========================== */

  return (
    <div className="w-full border rounded-lg p-5 bg-white">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6"
        >
          <Textarea
            label={translate('Details')}
            registerKey="Details"
            placeholder={translate('এসএমএস / রিপোর্ট বিস্তারিত লিখুন...')}
            rows={6}
            disabled={isFetching}
          />

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              loading={isCreating || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>

            <Button type="button" variant="secondary" onClick={hideModal}>
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default MaddrasahReportEditCreate;
