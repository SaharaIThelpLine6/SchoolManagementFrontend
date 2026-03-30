import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Button from '../../../components/Button/Button';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import Textarea from '../../../components/Forms/Textarea';
import DefaultSelect from '../../../components/Forms/DefaultSelect';

import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

import {
  useGetSingleAdmissionTimeMessageQuery,
  usePutAdmissionTimeMessageMutation,
} from '../../../features/student/studentQuerySlice';

import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import { useGetClassListQuery } from '../../../features/class/classQuerySlice';

const AdmissionMessageModal = ({ id }) => {
  const translate = useTranslate();

  const methods = useForm();
  const { handleSubmit, setValue } = methods;

  // ✅ API Calls
  const {
    data: messageData,
    isLoading: isSingleLoading,
  } = useGetSingleAdmissionTimeMessageQuery(id, { skip: !id });

  const { data: sessionData, isLoading: sessionLoading } =
    useGetSessionsQuery();

  const { data: classListData, isLoading: classLoading } =
    useGetClassListQuery();

  const [admissionMessageUpdate, { isLoading: isUpdating }] =
    usePutAdmissionTimeMessageMutation();

  // ✅ Prefill form
  useEffect(() => {
    if (messageData?.data) {
      const data = messageData.data;

      setValue('SessionID', data.SessionID);
      setValue('ClassID', data.ClassID);
      // setValue('Message1stPart', data.Message1stPart);
      // setValue('Message2ndPart', data.Message2ndPart);
      // setValue('Message3rdPart', data.Message3rdPart);

      setValue(
        'CreatedAt',
        data.CreatedAt ? data.CreatedAt.split('T')[0] : ''
      );
    }
  }, [messageData, setValue]);

  // ✅ Submit
  const onSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        id: id,
      };

      const response = await admissionMessageUpdate(payload).unwrap();

      toast.success(response.message || 'Message updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      hideModal();
    } catch (err) {
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

  // ✅ Global loading check
  if (isSingleLoading || sessionLoading || classLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 animate-pulse">
          {translate('Loading...')}
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white gap-3 grid grid-cols-1 sm:grid-cols-3 font-SolaimanLipi"
      >
        {/* Session */}
        <DefaultSelect
          options={sessionData ?? []}
          registerKey="SessionID"
          placeholder="বছর নির্বাচন করুন"
          nameField="SessionName"
          valueField="SessionID"
          label={translate('Session')}
          require={true}
          disabled={isUpdating}
        />

        {/* Class */}
        <DefaultSelect
          options={classListData ?? []}
          registerKey="ClassID"
          placeholder="শ্রেণি নির্বাচন করুন"
          nameField="ClassName"
          valueField="ClassID"
          label={translate('Class')}
          require={true}
          disabled={isUpdating}
        />

        {/* Date */}
        <DatePickerOne
          dateCalender="Admission Deadline Date"
          placeholder="Select Date"
          registerKey="CreatedAt"
          disabled={isUpdating}
        />

        {/* Message 1 */}
        <Textarea
          label={translate('Message 1st Part')}
          registerKey="Message1stPart"
          placeholder={translate('এসএমএস লিখুন...')}
          rows={4}
          disabled={isUpdating}
          defaultValue={messageData?.data.Message1stPart || ""}
        />

        {/* Message 2 */}
        <Textarea
          label={translate('Message 2nd Part')}
          registerKey="Message2ndPart"
          placeholder={translate('এসএমএস লিখুন...')}
          rows={4}
          disabled={isUpdating}
          defaultValue={messageData?.data.Message2ndPart || ""}

        />

        {/* Message 3 */}
        <Textarea
          label={translate('Message 3rd Part')}
          registerKey="Message3rdPart"
          placeholder={translate('এসএমএস লিখুন...')}
          rows={4}
          disabled={isUpdating}
          defaultValue={messageData?.data.Message3rdPart || ""}

        />

        {/* Submit */}
        <div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? translate('Saving...') : translate('Save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AdmissionMessageModal;