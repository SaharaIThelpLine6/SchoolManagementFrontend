import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../components/Button/Button';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import useTranslate from '../../utils/Translate';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { setCurrentSession } from '../../features/userPanel/sessionChange/sessionChangeSlice';
import { hideModal } from '../../utils/ModalControlar';

const SessionChangeModal = ({ id }) => {
  const methods = useForm();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const { handleSubmit, setValue } = methods;
  const { data: sessionsData } = useGetSessionsQuery();

  useEffect(() => {
    if (sessionsData?.length && id) {
      setValue('SessionID', id);
    }
  }, [sessionsData, id, setValue]);

  // Save handler
  const onSave = (data) => {
    if (data.SessionID) {
      dispatch(setCurrentSession(data.SessionID));
      hideModal();
    }
  };

  return (
    <div className="w-full border rounded-lg p-5 bg-white shadow-inner">
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        সেশন নির্বাচন করুন
      </h2>

      <FormProvider {...methods}>
        <form className="space-y-3" onSubmit={handleSubmit(onSave)}>
          <DefaultSelect
            options={sessionsData}
            registerKey="SessionID"
            nameField="SessionName"
            valueField="SessionID"
          />

          <div className="flex gap-3 mt-4 justify-end">
            <Button type="submit">
              {translate('Save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SessionChangeModal;
