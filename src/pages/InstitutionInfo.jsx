import { Buffer } from 'buffer';
import 'flatpickr/dist/flatpickr.css';
import React, { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultInput from '../components/Forms/DefaultInput';
import { formFieldsSettings } from '../components/Forms/FormData/SettingFormData';
import Loading from '../components/Loading/Loading';
import { permissionsDataList } from '../Data/permissions';
import {
  useGetInstitutionInfoQuery,
  useUpdateInstitutionInfoMutation,
} from '../features/settings/settingsQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import useTranslate from '../utils/Translate';
import bnBijoy2Unicode from '../utils/conveter';
import DefaultImageUpload from '../components/Forms/DefaultImageUpload';
import { showModal } from '../utils/ModalControlar';
const API_URL = import.meta.env.VITE_SERVER_URL;
const InstitutionInfo = () => {
  const translate = useTranslate();

  const {
    data: institutionInfo,
    isLoading,
    isError,
  } = useGetInstitutionInfoQuery();
  const [updateInstitutionInfo] = useUpdateInstitutionInfoMutation();

  const [images, setImages] = useState({
    Logo: null,
    SignaturePrincipal: null,
    SignatureNajem: null,
    SignatureAccountant: null,
    ReportHeaderImg: null,
  });

  const [imageFiles, setImageFiles] = useState({
    Logo: null,
    SignaturePrincipal: null,
    SignatureNajem: null,
    SignatureAccountant: null,
    ReportHeaderImg: null
  });
  const [previewImg, setPreviewImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (institutionInfo) {
      const loadedImages = {};
      [
        'Logo',
        'SignaturePrincipal',
        'SignatureNajem',
        'SignatureAccountant',
      ].forEach((key) => {
        const bufferData = institutionInfo[key]?.data;
        if (bufferData) {
          const base64 = Buffer.from(bufferData).toString('base64');
          loadedImages[key] = `data:image/png;base64,${base64}`;
        }
      });
      setImages(loadedImages);
    }
  }, [institutionInfo]);

  const methods = useForm();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (institutionInfo) {
      setValue('AccountantName', institutionInfo.AccountantName || '');
      setValue('Address', institutionInfo.Address || '');
      setValue('AdmissionType', institutionInfo.AdmissionType || false);
      setValue('AraAddress', institutionInfo.AraAddress || '');
      setValue('AraContactNumber', institutionInfo.AraContactNumber || '');
      setValue('AraDistrict', institutionInfo.AraDistrict || '');
      setValue('AraInstitutionName', institutionInfo.AraInstitutionName?.trim() || '');
      setValue('AraPoliceStation', institutionInfo.AraPoliceStation || '');
      setValue('AraPostOffice', institutionInfo.AraPostOffice || '');
      setValue('AraVillage', institutionInfo.AraVillage || '');
      setValue('ContactNumber', institutionInfo.ContactNumber || '');
      setValue('District', institutionInfo.District || '');
      setValue('Elhaq', institutionInfo.Elhaq || '');
      setValue('Email', institutionInfo.Email || '');
      setValue('Website', institutionInfo.Website || '');
      setValue('Youtube', institutionInfo.Website || '');
      setValue('Facebook', institutionInfo.Facebook || '');
      setValue('WhatsApp', institutionInfo.WhatsApp || '');
      setValue('Telegram', institutionInfo.Telegram || '');
      setValue('EngAddress', institutionInfo.EngAddress || '');
      setValue('EngInstitutionName', institutionInfo.EngInstitutionName || '');
      setValue('InstitutionName', institutionInfo.InstitutionName || '');
      setValue('InstitutionCode', institutionInfo.InstitutionCode || '');
      setValue('NajemName', institutionInfo.NajemName || '');
      setValue('PoliceStation', institutionInfo.PoliceStation || '');
      setValue('PostOffice', institutionInfo.PostOffice || '');
      setValue('PrincipalName', institutionInfo.PrincipalName || '');
      setValue('SMSMobile', institutionInfo.SMSMobile || '');
      setValue('Village', institutionInfo.Village || '');
      setValue('ActiveReportHeader', institutionInfo.ActiveReportHeader || '1');
      setValue('ReportHeaderImg', institutionInfo.ReportHeaderImg || '');
      setPreviewUrl(institutionInfo.ReportHeaderImg ? `${API_URL}/public${institutionInfo.ReportHeaderImg}` : '' )
    }
  }, [institutionInfo, setValue]);

  // Image preview state & refs
  const [imagePreviews, setImagePreviews] = useState(Array(4).fill(null));
  const fileInputs = useRef([]);

  const handleImageClick = (index) => {
    fileInputs.current[index]?.click();
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPreviews = [...imagePreviews];
        updatedPreviews[index] = reader.result;
        setImagePreviews(updatedPreviews);
      };
      reader.readAsDataURL(file);

      // Store the actual file object
      const imageKeys = [
        'Logo',
        'SignaturePrincipal',
        'SignatureNajem',
        'SignatureAccountant',
        'ReportHeaderImg'
      ];
      const key = imageKeys[index];

      setImageFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
    }
  };

  const onSubmit = async (data) => {
    console.log(data);
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Append all text fields
      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      // Append image files if they exist
      Object.keys(imageFiles).forEach((key) => {
        if (imageFiles[key]) {
          formData.append(key, imageFiles[key]);
        }
      });

      await updateInstitutionInfo(formData).unwrap();
      Swal.fire({
        title: 'Institution info updated successfully!',
        icon: 'success',
        draggable: true,
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Institution update failed',
        text: error?.data?.message || 'Please try again',
        confirmButtonColor: '#3B82F6',
      });
    }
  };

  const ActiveReportHeader = watch("ActiveReportHeader")
  const ActiveReportTemplate = watch("ActiveReportTemplate")
  const tem2 = {
    ActiveReportHeader,
    templateHandler: (val) => {
      console.log(val);
      setValue("ActiveReportTemplate", val)
    }
  }
  const handleReportHaderOption = (val) => {
    setValue("ActiveReportHeader", val)
    switch (val) {
      case 2:
        showModal("Choose report header template", "REPORT_HEADER_MODAL", tem2)
      default: null
    }
  }


  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <p className="text-lg font-semibold">Page Data Not Found</p>
        </div>
      </div>
    );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 md:p-4 rounded-xl shadow-lg"
        encType="multipart/form-data"
      >
        <div className="px-[24px] text-[14px]">
          <div className="flex flex-col gap-5 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
              {formFieldsSettings.map((section, idx) => (
                <React.Fragment key={idx}>
                  <div className="col-span-full">
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">
                      {translate(section.title)}
                    </h2>
                  </div>
                  {section.fields.map((field) => (
                    <DefaultInput
                      key={field.key}
                      registerKey={field.key}
                      type={field.type || 'text'}
                      placeholder={translate(`Enter ${field.label}`) + ' ...'}
                      label={translate(field.label)}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>

            {/* Signatories Section */}
            <div className="col-span-3 w-full">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">
                {translate('Signatories')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {['Logo', 'Principal', 'Najem', 'Accountant'].map(
                (role, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
                  >
                    {role === 'Logo' ? (
                      <p className="mb-5 text-sm font-semibold text-gray-700 mt-9">
                        {translate('Institution Logo Upload')}
                      </p>
                    ) : (
                      <div className="mb-3 w-full">
                        <DefaultInput
                          registerKey={`${role}Name`}
                          type="text"
                          label={translate(`${role} Name`)}
                          placeholder={translate(`Enter ${role} Name`) + ' ...'}
                        />
                      </div>
                    )}

                    {/* Image Preview/Upload */}
                    <div
                      className="w-[150px] h-[150px] overflow-hidden rounded-lg shadow-inner mb-3 cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={
                          imagePreviews[index] ||
                          images[
                          role === 'Logo' ? 'Logo' : `Signature${role}`
                          ] ||
                          'https://live.staticflickr.com/7262/26793943536_523d3176a2_z.jpg'
                        }
                        alt={`${role} image`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => (fileInputs.current[index] = el)}
                      onChange={(e) => handleImageChange(e, index)}
                      className="hidden"
                    />

                    <p className="text-sm font-medium text-gray-700">
                      Size: 144 x 144
                    </p>
                  </div>
                )
              )}
            </div>
            <div className="col-span-3 w-full">
              <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">
                রির্পোট হেডার
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 relative" onClick={() => { handleReportHaderOption(1) }}>
                <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>Default Report Header</p>

                <div className="text-center w-full bg-white opacity-[0.8] pointer-events-none">
                  <h1 className="text-[14px] bg-white">
                    {bnBijoy2Unicode(institutionInfo.InstitutionName)}
                  </h1>
                  <p className="text-[10px] bg-white">
                    {bnBijoy2Unicode(institutionInfo?.Address)}
                  </p>
                  <div className="text-black border border-black px-1 py-1 inline-block mt-1 rounded tracking-widest bg-white font-bold text-[12px]">
                    দৈনিক ফি গ্রহণ তালিকা
                  </div>
                  <div className="grid grid-cols-3 items-center my-[10px] justify-between w-full">
                    <p className="text-[10px] text-start">শিক্ষাবর্ষ : ২০২৬ ইং</p>
                    <p className="text-[10px] text-center"> {new Date().toLocaleDateString("bn-BD")} হতে {new Date().toLocaleDateString("bn-BD")} পর্যন্ত </p>
                    <p className="text-end text-[10px]">প্রিন্ট তারিখ: {new Date().toLocaleDateString("bn-BD")} </p>
                  </div>
                </div>

                <div className={`absolute top-[10px] right-[10px] h-[20px] w-[20px] rounded-full border border-black ${ActiveReportHeader == 1 ? 'bg-blue-500 border-blue-500' : 'border-black'}`}></div>
              </div>
              <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 relative" onClick={() => { handleReportHaderOption(2) }}>
                <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>Select Report Header Template</p>

                <img src='/reaport-heading-template/1.jpg' className='w-full' />
                <div className={`absolute top-[10px] right-[10px] h-[20px] w-[20px] rounded-full border border-black ${ActiveReportHeader == 2 ? 'bg-blue-500 border-blue-500' : 'border-black'}`}></div>
              </div>
              <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 relative" onClick={() => { handleReportHaderOption(3) }}>
                <p className='mb-5 text-sm font-semibold text-gray-700 mt-9'>Upload Customize Report Header</p>
                <div className='w-full'>
                  <DefaultImageUpload registerKey="ReportHeaderImg"          image={previewImg}
                      setPreviewUrl={setPreviewUrl}
                      previewUrl={previewUrl} />
                </div>
                <div className={`absolute top-[10px] right-[10px] h-[20px] w-[20px] rounded-full border border-black ${ActiveReportHeader == 3 ? 'bg-blue-500 border-blue-500' : 'border-black'}`}></div>
              </div>
            </div>


            {/* Submit Button */}
            <div className="flex pl-[4px] font-bold">
              <ViewPermission
                permissionId={permissionsDataList.institute_info}
                permissionType="insert|edit"
              >
                <Button type="submit">{translate('Save')}</Button>
              </ViewPermission>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default InstitutionInfo;
