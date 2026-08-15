// src/pages/userpanel/DocumentSettings.jsx
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import DefaultImageUpload from '../../components/Forms/DefaultImageUpload';
import {
  useGetDocumentSettingsQuery, 
  useSaveDocumentSettingsMutation, 
} from '../../features/settings/settingsQuerySlice';
import useTranslate from '../../utils/Translate';

const API_URL = import.meta.env.VITE_SERVER_URL;

export default function DocumentSettings() {
  const [logoImg, setLogoImg] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);

  const methods = useForm({
    defaultValues: {
      documentLogo: null,
      isActive: '1', 
    },
  });

  const translate = useTranslate();
  const { register, handleSubmit, setValue } = methods;

  const { data, error, isLoading } = useGetDocumentSettingsQuery();
  const [sendDocumentSettings] = useSaveDocumentSettingsMutation();

  useEffect(() => {
    if (data) {
      if (data.documentLogo) {
        setLogoUrl(`${API_URL}/public${data.documentLogo}`); 
      }
      if (data.isActive !== undefined) {
        setValue('isActive', data.isActive ? '1' : '0');
      }
    }
  }, [data, setValue]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    
    formData.append('isActive', data.isActive);

    if (data.documentLogo instanceof File) {
      // যদি নতুন ফাইল সিলেক্ট করা হয়
      formData.append('documentLogo', data.documentLogo);
    } else if (!logoUrl) {
      // যদি নতুন ফাইল না থাকে এবং প্রিভিউ URL ও খালি থাকে, তারমানে ইউজার ছবি ডিলিট করে দিয়েছে
      formData.append('removeLogo', 'true');
    }

    try {
      await sendDocumentSettings(formData).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ডকুমেন্ট লোগো সেটিং সফলভাবে সংরক্ষণ করা হয়েছে।',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text: error?.data?.message || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="website-settings">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {translate('Upload Document Logo')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="documentLogo"
                image={logoImg}
                setPreviewUrl={setLogoUrl}
                previewUrl={logoUrl}
              />
            </div>
          </div>

          <div className="mt-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              {translate('Logo Status')}
            </h3>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="1" {...register('isActive')} className="w-4 h-4 cursor-pointer text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">{translate('Active')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="0" {...register('isActive')} className="w-4 h-4 cursor-pointer text-cyan-600" />
                <span className="text-sm font-medium text-gray-700">{translate('Inactive')}</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary py-2 px-2 bg-cyan-600 text-white rounded-[4px] mt-4 text-center">
            {translate('Save Settings')}
          </button>
        </form>
      </div>
    </FormProvider>
  );
}
