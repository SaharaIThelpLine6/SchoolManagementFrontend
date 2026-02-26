import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../../../components/Button/Button';
import DatePickerOne from '../../../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import PhoneNumberInput from '../../../components/Forms/PhoneNumberInput';
import SvgIcon from '../../../components/icons/SvgIcon';
import Loading from '../../../components/Loading/Loading';
import { permissionsDataList } from '../../../Data/permissions';
import {
    useGetClassListQuery,
    useGetSubClassListQuery,
} from '../../../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';
import {
    useGetCodeSettingsQuery,
    useGetDistrictsQuery,
    useGetDivisionsQuery,
    useGetFinancialStatusQuery,
    useGetLastAdmissionSerialQuery,
    useGetPoliceStationsQuery,
    useGetResidentialQuery,
    useGetSettingsQuery,
    useGetStudentRelationsQuery,
} from '../../../features/settings/settingsQuerySlice';
import {
    useGetLastAdmissionUserCodeQuery,
    usePostStudentAdmissionMutation,
} from '../../../features/student/studentQuerySlice';
import { ViewPermission } from '../../../Routes/ViewPermission';
import { showModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

const OnlineAdmissionForm = ({ studentData, onBack, pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();

  console.log(studentData, 'studentData');

  // API Data Hooks
  const { data: mobileRelationshipData } = useGetStudentRelationsQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classData } = useGetClassListQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: financialStatusData } = useGetFinancialStatusQuery();
  const { data: divisionsData } = useGetDivisionsQuery();
  const { data: settings } = useGetSettingsQuery();

  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);
  const settingInfo = Array.isArray(settings?.data)
    ? settings.data.find((item) => item.ID === 3)
    : null;

  const [postStudentAdmission, { isLoading }] =
    usePostStudentAdmissionMutation();
  const { data } = useGetLastAdmissionUserCodeQuery();

  // Create refs to track initialization and loading states
  const isInitializedRef = useRef(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingThanas, setIsLoadingThanas] = useState(false);
  const [isLoadingPermDistricts, setIsLoadingPermDistricts] = useState(false);
  const [isLoadingPermThanas, setIsLoadingPermThanas] = useState(false);

  // Extract location IDs from student data
  const transientIdStr =
    studentData?.TransientPoliceStationID?.toString().padStart(6, '0') ||
    '000000';
  const permanentIdStr =
    studentData?.permanentPoliceStationID?.toString().padStart(6, '0') ||
    '000000';

  // Current Address IDs
  const initialDivisionId = parseInt(transientIdStr.slice(0, 1));
  const initialDistrictId = parseInt(transientIdStr.slice(0, 3));
  const initialThanaId = parseInt(transientIdStr);

  // Permanent Address IDs
  const initialPermDivisionId = parseInt(permanentIdStr.slice(0, 1));
  const initialPermDistrictId = parseInt(permanentIdStr.slice(0, 3));
  const initialPermThanaId = parseInt(permanentIdStr);

  // Initialize react-hook-form
  const methods = useForm({
    defaultValues: {
      ...studentData,
      divisionId: '',
      districtId: '',
      thanaId: '',
      permanentDivisionId: '',
      permanentDistrictId: '',
      permanentThanaId: '',
    },
  });

  const { setValue } = methods;

  // Watch current selected values for both addresses
  const selectedDivision = methods.watch('divisionId');
  const selectedDistrict = methods.watch('districtId');
  const selectedPermDivision = methods.watch('permanentDivisionId');
  const selectedPermDistrict = methods.watch('permanentDistrictId');
  const SessionIDLast = methods.watch('SessionID');

  // ✅ TblPrintView ID 24 setting নিরাপদভাবে খোঁজা
  const tbiPrintView = settings?.data?.find((item) => item.ID === 24) || null;

  let ClassID = null;
  let SessionID = null;
  if (tbiPrintView?.Action === 1) {
    ClassID = studentData?.ClassID;
  } else if (tbiPrintView?.Action === 3) {
    SessionID = SessionIDLast;
  }

  // ✅ RTK Query Hook
  // ✅ Correct RTK Query Hook usage
  const { data: SerialData, error } = useGetLastAdmissionSerialQuery({
    ClassID,
    SessionID,
  });

  // Load districts when division selected (current address)
  const { data: districtsData = [], isFetching: isFetchingDistricts } =
    useGetDistrictsQuery(selectedDivision, {
      skip: !selectedDivision,
    });

  // Load thanas when district selected (current address)
  const { data: thanaData = [], isFetching: isFetchingThanas } =
    useGetPoliceStationsQuery(selectedDistrict, {
      skip: !selectedDistrict,
    });

  // Load districts when permanent division selected
  const { data: permDistrictsData = [], isFetching: isFetchingPermDistricts } =
    useGetDistrictsQuery(selectedPermDivision, {
      skip: !selectedPermDivision,
    });

  // Load thanas when permanent district selected
  const { data: permThanaData = [], isFetching: isFetchingPermThanas } =
    useGetPoliceStationsQuery(selectedPermDistrict, {
      skip: !selectedPermDistrict,
    });

  const { data: codeSettings = [] } = useGetCodeSettingsQuery(
    (undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    })
  );

  // When studentData and divisions are loaded, initialize form values
  useEffect(() => {
    if (studentData && divisionsData?.length && !isInitializedRef.current) {
      const initializeForm = async () => {
        // Initialize current address
        methods.setValue(
          'divisionId',
          studentData?.divisionId || initialDivisionId || ''
        );
        setIsLoadingDistricts(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        methods.setValue(
          'districtId',
          studentData?.districtId || initialDistrictId || ''
        );
        setIsLoadingThanas(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        methods.setValue(
          'thanaId',
          studentData?.thanaId || initialThanaId || ''
        );

        // Initialize permanent address
        methods.setValue(
          'permanentDivisionId',
          studentData?.permanentDivisionId || initialPermDivisionId || ''
        );
        setIsLoadingPermDistricts(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        methods.setValue(
          'permanentDistrictId',
          studentData?.permanentDistrictId || initialPermDistrictId || ''
        );
        setIsLoadingPermThanas(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        methods.setValue(
          'permanentThanaId',
          studentData?.permanentThanaId || initialPermThanaId || ''
        );

        isInitializedRef.current = true;
        setIsLoadingDistricts(false);
        setIsLoadingThanas(false);
        setIsLoadingPermDistricts(false);
        setIsLoadingPermThanas(false);
      };

      initializeForm();
    }
  }, [studentData, divisionsData]);

  // Reset dependent fields when division changes
  useEffect(() => {
    if (isInitializedRef.current) {
      if (selectedDivision !== methods.getValues('divisionId')) {
        methods.setValue('districtId', '');
        methods.setValue('thanaId', '');
      }
      if (selectedPermDivision !== methods.getValues('permanentDivisionId')) {
        methods.setValue('permanentDistrictId', '');
        methods.setValue('permanentThanaId', '');
      }
    }
  }, [selectedDivision, selectedPermDivision]);

  // Reset thana when district changes
  useEffect(() => {
    if (isInitializedRef.current) {
      if (selectedDistrict !== methods.getValues('districtId')) {
        methods.setValue('thanaId', '');
      }
      if (selectedPermDistrict !== methods.getValues('permanentDistrictId')) {
        methods.setValue('permanentThanaId', '');
      }
    }
  }, [selectedDistrict, selectedPermDistrict]);

  useEffect(() => {
    setValue('GenderID', studentData?.GenderID);
    setValue('ClassID', studentData?.ClassID);
    setValue('Relationship1', studentData?.Relationship1);
    setValue('Relationship2', studentData?.Relationship2);
    setValue('ResidentialStatusId', studentData?.ResidentialStatusId);
    setValue('SessionID', activeSession?.SessionID);
    setValue('SFTID', settingInfo?.Action);
  }, [studentData, activeSession, settingInfo, setValue]);

  let UserTypeID = 2;
  let existing = null;
  if (UserTypeID && codeSettings.length) {
    existing = codeSettings.find(
      (c) => Number(c.UserTypeID) === Number(UserTypeID)
    );
  }

  // Handle back button click
  const handleBackClick = () => {
    methods.reset();
    onBack();
  };

  // Render loading states if needed
  if (
    isLoadingDistricts ||
    isLoadingThanas ||
    isLoadingPermDistricts ||
    isLoadingPermThanas
  ) {
    return <Loading />;
  }

  const onSubmit = async (data) => {
    // console.log(data);
    const payload = {
      data: {
        UserID: data.UserID,
        UserCode: data.UserCode,
        GenderID: data.GenderID,
        UserName: data.UserName,
        FatherName: data.FatherName,
        MotherName: data.MotherName,
        NIDNO: data.NIDNO,
        BloodGroup: data.BloodGroup,
        Mobile1: data.Mobile1,
        Relationship1: data.Relationship1,
        Mobile2: data.Mobile2,
        Relationship2: data.Relationship2,
        DateOfBirth: data.DateOfBirth,
        Email: data.Email,
        permanentVill: data.permanentVill,
        permanentPost: data.permanentPost,
        permanentPoliceStationID: data.permanentThanaId,
        TransientVill: data.TransientVill,
        TransientPost: data.TransientPost,
        TransientPoliceStationID: data.thanaId,
        SessionID: data.SessionID,
        ClassID: data.ClassID,
        SubClassID: data.SubClassID,
        AdmissionSerial: data.AdmissionSerial,
        SFTID: data.SFTID,
        ResidentialStatusId: data.ResidentialStatusId,
        NewOldId: data.NewOldId,
        AdmissionStatus: data.AdmissionStatus,
        AdmissionAction: 1,
      },
    };

    try {
      const response = await postStudentAdmission(payload).unwrap();
      // console.log('Submitted:', response);

      Swal.fire({
        icon: 'success',
        title: 'ভর্তি সফল হয়েছে',
        text: 'ছাত্রের তথ্য সফলভাবে জমা হয়েছে!',
        confirmButtonText: 'ঠিক আছে',
      });
      methods.reset();
      onBack();
    } catch (error) {
      console.error('Error submitting admission:', error);

      Swal.fire({
        icon: 'error',
        title: 'ভুল হয়েছে',
        text: error?.data?.error || 'ভর্তি জমা দিতে ব্যর্থ হয়েছে!',
        confirmButtonText: 'ঠিক আছে',
      });
    }
  };

  // Static options
  const NEW_OLD_OPTIONS = [
    { NewOldId: 1, NewOldName: 'নতুন' },
    { NewOldId: 2, NewOldName: 'পুরাতন' },
    { NewOldId: 3, NewOldName: 'উভয়' },
  ];

  const ADMISSION_STATUS_OPTIONS = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'Paid' },
    { value: 2, label: 'Free' },
    { value: 3, label: 'Unpaid' },
  ];

  const GENDER_OPTIONS = [
    { GenderID: 1, label: 'পুরুষ' },
    { GenderID: 2, label: 'মহিলা' },
    { GenderID: 3, label: 'অন্যান্য' },
  ];
  const handleShowStudentFeeGroup = () => {
    showModal('Online Admission Serial', 'ONLINE_ADMISSION_SERIAL');
  };

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="flex flex-row justify-between items-center mb-4">
          <h3 className="font-SolaimanLipi text-2xl font-bold">
            {translate('Student Admission')}
          </h3>
          <Button onClick={handleBackClick}>{translate('Back')}</Button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Personal Information Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-5">
                <h2 className="text-base font-bold text-gray-800 border-b pb-2">
                  {translate('Personal Information')}
                </h2>
              </div>

              <DefaultInput
                type="text"
                registerKey="UserCode"
                label={translate('Student Code')}
                placeholder="পূর্ণ নাম লিখুন"
                require="This field is required!"
                defaultValue={data?.nextCode ? data?.nextCode : existing?.Value}
              />

              <DefaultInput
                type="text"
                registerKey="UserName"
                label={translate('User Name')}
                placeholder="পূর্ণ নাম লিখুন"
                require="This field is required!"
                unicode={true}
                defaultValue={studentData?.UserName ?? ''}
              />

              <DefaultInput
                type="text"
                registerKey="FatherName"
                label={translate('Father Name')}
                placeholder="পিতার নাম লিখুন"
                require="This field is required!"
                unicode={true}
                defaultValue={studentData?.FatherName ?? ''}
              />

              <DefaultInput
                type="text"
                registerKey="MotherName"
                label={translate('Mother Name')}
                placeholder="মাতার নাম লিখুন"
                require="This field is required!"
                unicode={true}
                defaultValue={studentData?.MotherName ?? ''}
              />

              <DefaultSelect
                label={translate('Gender')}
                options={GENDER_OPTIONS}
                valueField="GenderID"
                nameField="label"
                registerKey="GenderID"
                require="This field is required!"
              />

              <DefaultInput
                type="text"
                registerKey="NIDNO"
                label={translate('NID Number')}
                placeholder="NID নম্বর লিখুন"
                defaultValue={studentData?.NIDNO ?? ''}
              />
              <PhoneNumberInput
                label={translate('Mobile No 1')}
                registerKey="Mobile1"
                require={true}
                minLength={11}
                maxLength={11}
                allowedPrefixes={[
                  '013',
                  '014',
                  '015',
                  '016',
                  '017',
                  '018',
                  '019',
                ]}
                defaultValue={studentData?.Mobile1 ?? ''}
              />
              <DefaultSelect
                label={translate('Relationship 1')}
                options={mobileRelationshipData ?? []}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship1"
                require="This field is required!"
              />
              <PhoneNumberInput
                label={translate('Mobile No 2')}
                registerKey="Mobile2"
                // require={true}
                minLength={11}
                maxLength={11}
                allowedPrefixes={[
                  '013',
                  '014',
                  '015',
                  '016',
                  '017',
                  '018',
                  '019',
                ]}
                defaultValue={studentData?.Mobile2 ?? ''}
              />
              <DefaultSelect
                label={translate('Relationship 2')}
                options={mobileRelationshipData ?? []}
                valueField="RelationID"
                nameField="RelationName"
                registerKey="Relationship2"
              />

              <DefaultInput
                registerKey="BloodGroup"
                label={translate('Blood Group')}
                defaultValue={studentData?.BloodGroup ?? ''}
              />

              <DefaultInput
                type="email"
                registerKey="Email"
                label={translate('Email Address')}
                placeholder="example@domain.com"
                defaultValue={studentData?.Email ?? ''}
              />

              <DatePickerOne
                registerKey="DateOfBirth"
                dateCalender={translate('Date of Birth')}
                require="This field is required!"
                defaultValue={studentData?.DateOfBirth ?? ''}
              />

              {/* Address Information Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-5 mt-6">
                <h2 className="text-base font-bold text-gray-800 border-b pb-2">
                  {translate('Permanent Address Information') + ' :'}
                </h2>
              </div>

              {/* Permanent Address */}
              <DefaultInput
                type="text"
                registerKey="permanentVill"
                label={translate('Village')}
                placeholder="গ্রামের নাম লিখুন"
                require="This field is required!"
                unicode={true}
                defaultValue={studentData?.permanentVill ?? ''}
              />

              <DefaultInput
                type="text"
                registerKey="permanentPost"
                label={translate('Post Office')}
                placeholder="ডাকঘরের নাম লিখুন"
                require="This field is required!"
                unicode={true}
                defaultValue={studentData?.permanentPost ?? ''}
              />

              <DefaultSelect
                options={divisionsData ?? []}
                registerKey="permanentDivisionId"
                label={translate('Division')}
                valueField="DivisionID"
                nameField="DivisionName"
                require="This field is required!"
              />

              <DefaultSelect
                options={permDistrictsData ?? []}
                registerKey="permanentDistrictId"
                label={translate('District')}
                valueField="DistrictID"
                nameField="DistrictName"
                disabled={!selectedPermDivision}
                require="This field is required!"
              />

              <DefaultSelect
                options={permThanaData ?? []}
                registerKey="permanentThanaId"
                label={translate('Police Station')}
                valueField="PoliceStationID"
                nameField="PoliceStationName"
                disabled={!selectedPermDistrict}
                require="This field is required!"
              />
              <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-5 mt-6">
                <h2 className="text-base font-bold text-gray-800 border-b pb-2">
                  {translate('Present Address Information')}
                </h2>
              </div>
              {/* Current Address */}
              <DefaultInput
                type="text"
                registerKey="TransientVill"
                label={translate('Village')}
                placeholder="গ্রামের নাম লিখুন"
                unicode={true}
                require="This field is required!"
                defaultValue={studentData?.TransientVill ?? ''}
              />

              <DefaultInput
                type="text"
                registerKey="TransientPost"
                label={translate('Post Office')}
                placeholder="ডাকঘরের নাম লিখুন"
                unicode={true}
                require="This field is required!"
                defaultValue={studentData?.TransientPost ?? ''}
              />

              <DefaultSelect
                options={divisionsData ?? []}
                registerKey="divisionId"
                label={translate('Division')}
                valueField="DivisionID"
                nameField="DivisionName"
                require="This field is required!"
              />

              <DefaultSelect
                options={districtsData ?? []}
                registerKey="districtId"
                label={translate('District')}
                valueField="DistrictID"
                nameField="DistrictName"
                disabled={!selectedDivision}
                require="This field is required!"
              />

              <DefaultSelect
                options={thanaData ?? []}
                registerKey="thanaId"
                label={translate('Police Station')}
                valueField="PoliceStationID"
                nameField="PoliceStationName"
                disabled={!selectedDistrict}
                require="This field is required!"
              />

              {/* Academic Information Section */}
              <div className="space-y-4 col-span-1 md:col-span-2 lg:col-span-5 mt-6">
                <h2 className="text-base font-bold text-gray-800 border-b pb-2">
                  {translate('Educational Information')}
                </h2>
              </div>

              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
                require="This field is required!"
              />

              <DefaultSelect
                label={translate('Class')}
                options={classData ?? []}
                valueField="ClassID"
                nameField="ClassName"
                registerKey="ClassID"
                require="This field is required!"
                unicode
              />

              {/* <DefaultSelect
                label={translate('SubClass')}
                options={subClassData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                require="This field is required!"
                unicode
              /> */}

              <div className="flex items-center gap-2">
                <DefaultInput
                  type="text"
                  registerKey="AdmissionSerial"
                  label={translate('Admission Serial')}
                  placeholder="ভর্তি সিরিয়াল নম্বর"
                  require="This field is required!"
                  defaultValue={SerialData?.nextSerial ?? ''}
                  disable={SerialData?.nextSerial ? true : false}
                />
                <Button
                  onClick={handleShowStudentFeeGroup}
                  className="bg-[#EDEDED] mt-7 rounded-md py-3"
                >
                  <SvgIcon name={'FaPlus'} size={14} />
                </Button>
              </div>
              <DefaultSelect
                label={translate('Financial Status')}
                options={financialStatusData ?? []}
                valueField="SFTID"
                nameField="FinancialName"
                registerKey="SFTID"
                require="This field is required!"
              />

              <DefaultSelect
                label={translate('Residential')}
                options={residentialData ?? []}
                valueField="RDID"
                nameField="ResidentialName"
                registerKey="ResidentialStatusId"
                require="This field is required!"
              />

              <DefaultSelect
                label={translate('New/Old')}
                options={NEW_OLD_OPTIONS}
                valueField="NewOldId"
                nameField="NewOldName"
                registerKey="NewOldId"
                require="This field is required!"
              />

              <DefaultSelect
                label={translate('Admission Status')}
                options={ADMISSION_STATUS_OPTIONS}
                valueField="value"
                nameField="label"
                registerKey="AdmissionStatus"
                disabled
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                {translate('Cancel')}
              </button>
              <ViewPermission
                permissionId={permissionsDataList.student_admission}
                permissionType="insert"
              >
                <button
                  type="submit"
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  {translate('Save')}
                </button>
              </ViewPermission>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default OnlineAdmissionForm;
