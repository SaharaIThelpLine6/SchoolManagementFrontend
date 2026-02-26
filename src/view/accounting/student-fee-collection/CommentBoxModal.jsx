import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Textarea from '../../../components/Forms/Textarea';
import { hideModal } from '../../../utils/ModalControlar';

const CommentBoxModal = () => {
  const methods = useForm();
  const { handleSubmit, reset } = methods;
  const [saved, setSaved] = useState(false);

  const onSubmit = (data) => {
    // 🧠 Save message to localStorage
    localStorage.setItem('smsMessage', data.Message);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    reset();
    hideModal();
    // Notify main form that comment is saved
    window.dispatchEvent(new Event('commentSaved'));
  };

  return (
    <FormProvider {...methods}>
      <div className="bg-white flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Textarea
              label="এসএমএস মেসেজ"
              registerKey="Message"
              placeholder="এসএমএস মেসেজ লিখুন..."
              rows={4}
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default CommentBoxModal;
