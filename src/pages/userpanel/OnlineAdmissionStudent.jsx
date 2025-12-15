import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Button from '../../components/Button/Button';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../components/Forms/DefaultInput';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import {
  useGetClassListQuery,
  useGetSubClassListQuery,
} from '../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import {
  useGetFinancialStatusQuery,
  useGetLastAdmissionSerialQuery,
  useGetResidentialQuery,
} from '../../features/settings/settingsQuerySlice';
import useTranslate from '../../utils/Translate';

const OnlineAdmissionStudent = () => {
  const methods = useForm();
  const translate = useTranslate();
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  const { handleSubmit, reset, watch, getValues, setValue } = methods;
  const data = [];

  // Academic Session
  const {
    data: academicSession,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useGetSessionsQuery(undefined, { refetchOnMountOrArgChange: true });

  // Class List
  const {
    data: classList,
    isLoading: isClassLoading,
    isError: isClassError,
  } = useGetClassListQuery(undefined, { refetchOnMountOrArgChange: true });

  // Sub Class List
  const {
    data: subClassList,
    isLoading: isSubClassLoading,
    isError: isSubClassError,
  } = useGetSubClassListQuery(undefined, { refetchOnMountOrArgChange: true });

  // ✅ Filter Sub Class by ClassID
  const [ClassID, SessionID] = watch(['ClassID', 'SessionID']);

  // ✅ Last Admission Serial Query
  const { data: SerialData, error: serialError } =
    useGetLastAdmissionSerialQuery({
      ClassID,
      SessionID,
    });

  // Student Financial Status
  const {
    data: studentFinancialStatus,
    isLoading: isstudentFinancialStatusLoading,
    isError: isstudentFinancialStatusError,
  } = useGetFinancialStatusQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Residential
  const {
    data: residential,
    isLoading: isresidentialLoading,
    isError: isresidentialError,
  } = useGetResidentialQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const filteredSubClassList = (subClassList || [])
    .filter((sub) => {
      if (!ClassID) return true;
      return sub?.ClassID?.toString() === ClassID.toString();
    })
    .map((sub) => ({
      SubClassID: sub.SubClassID,
      SubClassName: sub.SubClass,
      SubClassAra: sub.SubClassAra,
      SubClassEng: sub.SubClassEng,
      Serial: sub.Serial,
    }))
    .sort((a, b) => (a.Serial || 0) - (b.Serial || 0));

  const AdmissionType = [
    { id: 1, name: 'New' },
    { id: 2, name: 'Old' },
  ];

  const logo = true;

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Here you would typically update the form state with the photo
        console.log('Photo uploaded:', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle take photo (simulated for mobile)
  const handleTakePhoto = () => {
    // This would integrate with a camera API in a real app
    alert('Camera functionality would open here on mobile devices');
    setShowPhotoOptions(false);
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Online Admission</h1>
          {/* <p className="text-gray-600 mt-1">Fill in the student details below</p> */}
        </div>

        <form>
          {/* Student Photo Section - Mobile Optimized */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {logo ? (
                    <img
                      src="https://icea.org.uk/wp-content/uploads/2016/03/BOYS-UNIFORM-ICEA.jpg"
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                >
                  {showPhotoOptions ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Photo Options Dropdown */}
              {showPhotoOptions && (
                <div className="mt-4 w-full max-w-xs bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-slideDown">
                  <div className="p-2 space-y-2">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="photo-upload"
                      />
                      <div className="flex items-center justify-center p-3 rounded-lg hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors">
                        <svg
                          className="w-5 h-5 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <span className="text-blue-600 font-medium">
                          Upload Photo
                        </span>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={handleTakePhoto}
                      className="w-full flex items-center justify-center p-3 rounded-lg hover:bg-blue-50 active:bg-blue-100 cursor-pointer transition-colors"
                    >
                      <svg
                        className="w-5 h-5 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-blue-600 font-medium">
                        Take Photo
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Sections with Accordion-like styling */}
          <div className="space-y-4">
            {/* Personal Information Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                  Personal Information
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <DefaultInput
                  registerKey="UserName"
                  label="Student Name"
                  placeholder="Enter student name"
                  require="Student Name is required"
                  defaultValue={data?.UserName || ''}
                  disable={true}
                  mobileView={true}
                />

                <DefaultInput
                  registerKey="FatherName"
                  label="Father Name"
                  placeholder="Enter father's name"
                  require="Father Name is required"
                  defaultValue={data?.FatherName || ''}
                  disable={true}
                  mobileView={true}
                />

                <DefaultInput
                  registerKey="Mobile1"
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  require="Mobile is required"
                  defaultValue={data?.Mobile1 || ''}
                  disable={true}
                  mobileView={true}
                  type="tel"
                />

                <DatePickerOne
                  registerKey="CreateAt"
                  dateCalender="Entry Date"
                  placeholder="Select entry date"
                  require="Entry Date is required"
                  disable={true}
                  mobileView={true}
                />
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-green-500 rounded-full mr-3"></div>
                  Academic Information
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <DefaultSelect
                  options={academicSession}
                  nameField="SessionName"
                  valueField="SessionID"
                  registerKey="SessionID"
                  label="Academic Session"
                  placeholder="Select session"
                  require="Session is required"
                  mobileView={true}
                />

                <DefaultSelect
                  options={classList}
                  nameField="ClassName"
                  valueField="ClassID"
                  registerKey="ClassID"
                  label="Admission Class"
                  placeholder="Select class"
                  require="Class is required"
                  mobileView={true}
                />

                <DefaultSelect
                  options={filteredSubClassList}
                  nameField="SubClassName"
                  valueField="SubClassID"
                  registerKey="SubClassID"
                  label="Admission Section"
                  placeholder="Select section"
                  mobileView={true}
                />

                <DefaultInput
                  type="text"
                  registerKey="AdmissionSerial"
                  label={translate('Admission Serial')}
                  placeholder="Enter admission serial number"
                  require="This field is required!"
                  defaultValue={SerialData?.nextSerial ?? ''}
                  disable={SerialData?.nextSerial ? true : false}
                  mobileView={true}
                />
              </div>
            </div>

            {/* Additional Details Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <div className="w-2 h-6 bg-purple-500 rounded-full mr-3"></div>
                  Additional Details
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <DefaultSelect
                  options={studentFinancialStatus}
                  nameField="FinancialName"
                  valueField="SFTID"
                  registerKey="SFTID"
                  label="Financial Condition"
                  placeholder="Select financial condition"
                  require="Financial Condition is required"
                  mobileView={true}
                />

                <DefaultSelect
                  options={residential}
                  nameField="ResidentialName"
                  valueField="RDID"
                  registerKey="ResidentialStatusId"
                  label="Living Condition"
                  placeholder="Select living condition"
                  require="Living Condition is required"
                  mobileView={true}
                />

                <DefaultSelect
                  options={AdmissionType}
                  nameField="name"
                  valueField="id"
                  registerKey="NewOldId"
                  label="Admission Type"
                  placeholder="Select admission type"
                  require="Admission Type is required"
                  mobileView={true}
                />

                <div className="w-full">
                  <Button className='w-full'>Save</Button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Bottom Padding for Mobile */}
        <div className="h-20"></div>
      </div>
    </FormProvider>
  );
};

export default OnlineAdmissionStudent;
