import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import DefaultImageUpload from '../../components/Forms/DefaultImageUpload';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
    useGetWebSettingsQuery,
    usePostWebsitesettingsMutation,
} from '../../features/settings/settingsQuerySlice';
import useTranslate from '../../utils/Translate';
const API_URL = import.meta.env.VITE_SERVER_URL;

export default function WebsiteSettings() {
  const [bannerImg, setBannerImg] = useState(null);
  const [bannerUrl, setBannerUrl] = useState(null);

  const [aboutImg, setAboutImg] = useState(null);
  const [aboutUrl, setAboutUrl] = useState(null);

  const methods = useForm({
    defaultValues: {
      fblink: '',
      ylink: '',
      studentListHeading: '',
      primaryHeading: '',
      aboutText: '',
      whyUsTitle: '',
      subjectListTitle: '',
      teacherListTitle: '',
      bannerImage: null,
      singleImage: null,
      whyUsList: [{ text: '' }],
    },
  });
  const translate = useTranslate();
  const { reset, control, register, setValue } = methods;
  const { fields, append, remove, replace, insert } = useFieldArray({
    control,
    name: 'whyUsList',
  });

  const [sendWebsiteSettings] = usePostWebsitesettingsMutation();
  const { data, error, isLoading } = useGetWebSettingsQuery();

  useEffect(() => {
    if (data) {
      console.log(data);

      data.forEach((item) => {
        const key = item.FieldKey;
        let value = item.FieldValue;
        if (key == 'whyUsItems') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = [{ text: '' }];
          }
          // while (fields.length > 0) {
          remove(0);
          // }
          console.log('{=========================');

          // Append items from API
          console.log(value);

          replace(value);
          // value.forEach((v, i) => {
          //     console.log({ [`whyUsList.${i}.text`]: v.text });
          //     // whyUsList.0.text
          //     // append({ [`whyUsList.${i}.text`]: v.text });
          //     // setValue(`whyUsList.${i}.text`, v.text)
          //     // console.log(v.text);
          //     // insert(i, v.text)

          // });
          // replace(value.map(v => ({ text: v.text })));
        } else {
          setValue(key, value); // for single values or images
        }
        if (key == 'BannerImage') {
          setBannerUrl(`${API_URL}/public${value}`);
        }
        if (key == 'whyUsImage') {
          setAboutUrl(`${API_URL}/public${value}`);
        }
      });
    }
  }, [data, setValue, append]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    // Text fields
    formData.append('fblink', data.fblink);
    formData.append('ylink', data.ylink);
    formData.append('primaryHeading', data.primaryHeading);
    formData.append('studentListHeading', data.studentListHeading);
    formData.append('aboutText', data.aboutText);
    formData.append('whyUsTitle', data.whyUsTitle);
    // JSON (stringify!)
    formData.append('whyUsList', JSON.stringify(data.whyUsList));
    formData.append('subjectListTitle', data.subjectListTitle);
    formData.append('teacherListTitle', data.teacherListTitle);
    // Images (only if selected)
    if (data.bannerImage instanceof File) {
      formData.append('bannerImage', data.bannerImage);
    }
    if (data.singleImage instanceof File) {
      formData.append('singleImage', data.singleImage);
    }
    try {
      await sendWebsiteSettings(formData).unwrap();

      // ✅ SUCCESS ALERT
      Swal.fire({
        icon: 'success',
        title: 'সফল!',
        text: 'ওয়েবসাইট সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      // ❌ ERROR ALERT
      Swal.fire({
        icon: 'error',
        title: 'ব্যর্থ!',
        text:
          error?.data?.message || 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="website-settings">
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mt-2">
            <DefaultInput
              registerKey="primaryHeading"
              type="text"
              label="Primary Title"
            />
          </div>
          <DefaultInput
            registerKey="aboutText"
            type="textarea"
            label="About Section Text"
            require="About text is required"
          />
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {translate('Upload About Image')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="bannerImage"
                require="This is required"
                image={bannerImg}
                setPreviewUrl={setBannerUrl}
                previewUrl={bannerUrl}
              />
            </div>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="studentListHeading"
              type="text"
              label="Student Stats Title"
            />
          </div>

          <DefaultInput
            registerKey="whyUsTitle"
            type="text"
            label="Why Choose Us Title"
          />
          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100 mt-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {translate('Upload About Image')}
            </h3>
            <div className="flex justify-center items-center">
              <DefaultImageUpload
                registerKey="singleImage"
                require="This is required"
                image={aboutImg}
                setPreviewUrl={setAboutUrl}
                previewUrl={aboutUrl}
              />
            </div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center mb-2">
              <DefaultInput
                defaultValue={field.text}
                registerKey={`whyUsList.${index}.text`}
                placeholder={`Point ${index + 1}`}
              />
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className="gap-4 flex items-center">
            <button
              type="button"
              onClick={() => append({ text: '' })}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
            >
              Add
            </button>
          </div>

          <div className="mt-2">
            <DefaultInput
              registerKey="subjectListTitle"
              type="text"
              label="Subject List Title"
            />
          </div>
          <div className="mt-2">
            <DefaultInput
              registerKey="teacherListTitle"
              type="text"
              label="Teacher List Card Title"
            />
          </div>
          <div className="mt-2 flex flex-wrap md:flex-nowrap gap-2">
            <DefaultInput
              registerKey="fblink"
              type="text"
              label="Facebook Link"
            />
            <DefaultInput
              registerKey="ylink"
              type="text"
              label="Youtube Link"
            />
          </div>

          {/* subjectListTitle */}
          <button
            type="submit"
            className="btn btn-primary py-2 px-2 bg-cyan-600 text-white rounded-[4px] mt-4 text-center"
          >
            Save Settings
          </button>
        </form>
      </div>
    </FormProvider>
  );
}
