import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import Textarea from '../../../components/Forms/Textarea';
import {
  useGetStudentAdmissionMessageQuery,
  useUpdateStudentAdmissionMessageMutation,
} from '../../../features/settings/settingsQuerySlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import { useEffect } from 'react';

const AdmissionMessageModal = () => {
  const { data: messageData, isLoading } = useGetStudentAdmissionMessageQuery();

  const defaultDate = messageData.data?.Message3rdPart ?? null;
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, watch, reset, setValue } = methods;


  const [admissionMessageUpdate] = useUpdateStudentAdmissionMessageMutation();


  const onSubmit = async (data) => {
    try {

      const payload = {
        ...data,
        // Message3rdPart:,
      };
      const response = await admissionMessageUpdate(data).unwrap();

      // ✅ Success message
      toast.success(response.message || 'Message saved successfully!', {
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className=" bg-white shadow-md rounded-lg p-6 space-y-5 font-SolaimanLipi"
      >
        <div className="flex justify-between gap-3">
          <Textarea
            label={translate('Message 1st Part')}
            registerKey="Message1stPart"
            placeholder={translate('এসএমএস লিখুন...')}
            rows={6}
            defaultValue={messageData?.data.Message1stPart || ''}
          />
          <Textarea
            label={translate('Message 2nd Part')}
            registerKey="Message2ndPart"
            placeholder={translate('এসএমএস লিখুন...')}
            rows={6}
            defaultValue={messageData?.data.Message2ndPart || ''}
          />
        </div>
        <Textarea
          label={translate('Message 3rd Part')}
          registerKey="Message4thPart"
          placeholder={translate('এসএমএস লিখুন...')}
          rows={6}
          defaultValue={messageData?.data.Message4thPart || ''}
        />
        <DatePickerOne
          dateCalender="Admission Deadline Date"
          placeholder="From Date"
          registerKey="Message3rdPart"
          defaultValue={defaultDate}
        />
        <Button type="submit" className="">
          {translate('Save')}
        </Button>
      </form>
    </FormProvider>
  );
};

export default AdmissionMessageModal;
