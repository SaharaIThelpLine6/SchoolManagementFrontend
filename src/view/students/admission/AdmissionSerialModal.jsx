import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DefaultRadio from '../../../components/Radio/DefaultRadio';
import {
  useGetCodeSettingsQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from '../../../features/settings/settingsQuerySlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const AdmissionSerialModal = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, watch, reset } = methods;

  const [UserTypeID] = watch(['UserTypeID', 'IDType']);

  const { data: codeSettings = [] } = useGetCodeSettingsQuery(
    (undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    })
  );



  const [settingUpdate] = useUpdateSettingsMutation();
  const { data: infoSettings = { data: [] } } = useGetSettingsQuery(undefined, {
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
  });
  const tbiPrintView =
    infoSettings?.data?.find((item) => item.ID === 24) || null;

  // ----------------- Set default values if UserTypeID selected -----------------

  let existing = null;
  if (UserTypeID && codeSettings.length) {
    existing = codeSettings.find(
      (c) => Number(c.UserTypeID) === Number(UserTypeID)
    );
  }

  const onSubmit = async (data) => {
    // 🔹 Condition check: IDType যদি 2 হয় → Value null করে পাঠানো হবে
    const payload = {
      ID: 24,
      Action: data.SerialType || null,
    };

    try {
      const response = await settingUpdate(payload).unwrap();

      // ✅ Success message
      toast.success(response.message || 'Code setting saved successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      hideModal();
    } catch (err) {
      console.error(err);

      // ✅ Error message
      let errorMessage = 'Something went wrong!';
      if (err?.data?.error) {
        errorMessage = err.data.error;
      }

      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  const serials = [
    {
      id: 1,
      name: 'ক্লাস ভিক্তিক',
    },
    {
      id: 2,
      name: 'কাস্টমাইজ',
    },
    {
      id: 3,
      name: 'সেশন ভিক্তিক',
    },
  ];

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-5 font-SolaimanLipi
               max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-center text-xl font-semibold text-gray-700">
          {translate('ভর্তি নাম্বার/সিরিয়াল সেটিং')}
        </h2>

        {/* Type */}
        <DefaultRadio
          label={'Type'}
          options={serials}
          registerKey="SerialType"
          defaultValue={tbiPrintView?.Action ?? ''}
        />
        <Button type="submit" className="w-full">
          {translate('Save')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AdmissionSerialModal;
