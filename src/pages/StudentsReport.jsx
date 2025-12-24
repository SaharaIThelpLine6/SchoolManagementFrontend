import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/Button/Button';
import Checkbox from '../components/Checkboxes/Checkbox';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SearchSelect from '../components/Forms/SearchSelect';
import { userStatus } from '../Data/userReportsData';
import {
  useGetClassListQuery,
  useGetSubClassListQuery,
} from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import {
  fetchDidata,
  fetchSettingsData,
  fetchThanadata,
} from '../features/settings/settingsSlice';
import {
  fetchSingleUser,
  setEditMode,
} from '../features/userInfo/userInfoSlice';
import { useGetStudentReportQuery } from '../features/userReports/userReportsSlice';
import useTranslate from '../utils/Translate';
import AdmissionFormPdf from '../view/general-information/user-reports/AdmissionFormPdf';
import AddressBasedAdmissionRegister from '../view/students/reports/AddressBasedAdmissionRegister';
import AdmissionRegisterPrint from '../view/students/reports/AdmissionRegisterPrint';
import AdmissionRegisterSerial from '../view/students/reports/AdmissionRegisterSerial';
import AdmissionResigterAllStudentsSerial from '../view/students/reports/AdmissionResigterAllStudentsSerial';
import AttendanceBookWithPhoto from '../view/students/reports/AttendanceBookWithPhoto';
import BanglaAttendence from '../view/students/reports/BanglaAttendence';
import BanglaAttendenceSubjectWari from '../view/students/reports/BanglaAttendenceSubjectWari';
import BirthRegistrationBasedList from '../view/students/reports/BirthRegistrationBasedList';
import FinancialStatusBasedAdmissionRegister from '../view/students/reports/FinancialStatusBasedAdmissionRegister';
import IdAdmissionRegister from '../view/students/reports/IdAdmissionRegister';
import ImageWithAdmissionRegisterNewOld from '../view/students/reports/ImageWithAdmissionRegisterNewOld';
import JamaatBasedNewOldTotalStudent from '../view/students/reports/JamaatBasedNewOldTotalStudent';
import JamaatWariBookList from '../view/students/reports/JamaatWariBookList';
import OldNewRegisterList from '../view/students/reports/OldNewRegisterList';
import ParentsMobileNumberList from '../view/students/reports/ParentsMobileNumberList';
import ParentsMobileNumberTwoColumn from '../view/students/reports/ParentsMobileNumberTwoColumn';
import StudentsListTwoColumns from '../view/students/reports/StudentsListTwoColumns';

const StudentsReport = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { register, handleSubmit, watch, setValue, getValues, reset } = methods;

  const [selectedReportComponent, setSelectedReportComponent] = useState(null);
  const reportRef = useRef(null);
  const selectedReportID = watch('studentReport');
  const SessionID = watch('SessionID');
  const SubClassID = watch('SubClassID');
  const gender = watch('gender');
  const NewOldId = watch('NewOldId');
  const ResidentialStatusId = watch('ResidentialStatusId');
  const BookLine = watch('BookLine');

  const [queryParams, setQueryParams] = useState(null);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: residentialData } = useGetResidentialQuery();

  const defaultData = useSelector((state) => state.userInfo.defaultFormValue);
  const editMode = useSelector((state) => state.userInfo.editMode);
  const dispatch = useDispatch();
  const { divition, district, thana, status, error } = useSelector(
    (state) => state.settings
  );

  useEffect(() => {
    const numericSelectedID = Number(selectedReportID);

    const reportId = [
      2, 4, 5, 8, 9, 12, 14, 15, 16, 17, 18, 19, 21, 22, 24, 25, 26,

      // coming soon
      7, 10, 11, 20, 23,
    ];

    const params = {
      report_id: reportId.includes(numericSelectedID) ? 1 : numericSelectedID,
      SessionID,
      SubClassID,
      gender,
      NewOldId,
      ResidentialStatusId,
    };

    // Clean up undefined or empty values
    const cleanedParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== ''
      )
    );

    // Only set params if report_id is present (or your key condition)
    if (cleanedParams.report_id) {
      setQueryParams(cleanedParams);
    }
  }, [
    selectedReportID,
    SessionID,
    SubClassID,
    gender,
    NewOldId,
    ResidentialStatusId,
  ]);

  // Query only if queryParams are ready and valid
  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useGetStudentReportQuery(queryParams, {
    skip: !queryParams || Object.keys(queryParams).length === 0,
    refetchOnMountOrArgChange: true,
  });
console.log(reportData, 'reportData');
  // Debug log
  useEffect(() => {
    if (isError) {
      console.error('Error fetching report data');
    }
    if (reportData) {
      console.log('Report data:', reportData);
    }
  }, [reportData, isError]);

  const [DivisionID, DistrictID, permanentPoliceStationID] = watch([
    'DivisionID',
    'DistrictID',
    'permanentPoliceStationID',
  ]);

  useEffect(() => {
    if (editMode === 0) {
      setValue('DistrictID', '');
      setValue('permanentPoliceStationID', '');
      if (DivisionID) {
        dispatch(fetchDidata(DivisionID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID?.toString();
      if (DivisionID === Number(numberStrP?.slice(0, 1))) {
        console.log('Division: Both Are Same');
      } else {
        console.log('Division: Both Are Not Same');
        setValue('DistrictID', '');
        setValue('permanentPoliceStationID', '');
        if (DivisionID) {
          dispatch(fetchDidata(DivisionID));
        }
      }
    }
  }, [DivisionID, setValue, dispatch, editMode, defaultData]);

  useEffect(() => {
    if (editMode === 0) {
      setValue('permanentPoliceStationID', '');
      if (DistrictID) {
        dispatch(fetchThanadata(DistrictID));
      }
    } else if (editMode === 2) {
      const numberStrP = defaultData.permanentPoliceStationID?.toString();
      if (DistrictID === Number(numberStrP?.slice(0, 3))) {
        console.log('District: Both Are Same');
      } else {
        setValue('permanentPoliceStationID', '');
        if (DistrictID) {
          dispatch(fetchThanadata(DistrictID));
        }
      }
    }
  }, [DistrictID, setValue, dispatch, editMode, defaultData]);

  useEffect(() => {
    dispatch(fetchSettingsData());
    if (editMode === 0) {
      reset({
        DivisionID: '',
        DistrictID: '',
        permanentPoliceStationID: '',
      });
    }
  }, [dispatch, reset, editMode]);

  useEffect(() => {
    if (defaultData && editMode === 1) {
      reset(defaultData);
      const numberStrP = defaultData.permanentPoliceStationID?.toString();

      const defaultFormData = {
        ...defaultData,
        DivisionID: Number(numberStrP?.slice(0, 1)),
        DistrictID: Number(numberStrP?.slice(0, 3)),
      };

      const promises = [
        dispatch(fetchDidata(defaultFormData.DivisionID)),
        dispatch(fetchThanadata(defaultFormData.DistrictID)),
      ];

      Promise.all(promises)
        .then(() => {
          reset(defaultFormData);
          dispatch(setEditMode(2));
        })
        .catch((err) => {
          console.error('Error in dispatching actions:', err);
        });
    }
  }, [defaultData, reset, dispatch, editMode]);

  useEffect(() => {
    if (editMode === 2) {
      const formUserid = getValues('UserID');
      const actualUserId = defaultData.UserID;
      if (formUserid !== actualUserId) {
        dispatch(setEditMode(1));
        dispatch(fetchSingleUser(formUserid));
      }
    }
  }, [editMode, getValues, defaultData, dispatch]);

  if (status === 'failed') {
    console.error('Settings status failed:', error);
    return <div>{translate('Failed to load settings data')}</div>;
  }

  // if (isLoading) {
  //   return <div>{translate("Loading...")}</div>;
  // }

  if (isError) {
    return (
      <div>
        {translate('Error fetching report data')}
        <Button onClick={refetch}>{translate('Retry')}</Button>
      </div>
    );
  }

  const genderOptions = [
    { id: '1', value: 'পুরুষ' },
    { id: '2', value: 'মহিলা' },
    { id: '3', value: 'উভয়' },
  ];
  const newAndOldData = [
    { id: '1', value: 'নতুন' },
    { id: '2', value: 'পুরাতন' },
    { id: '3', value: 'উভয়' },
  ];
  const classAndSubClassData = [
    { id: '1', name: 'ক্লাস' },
    { id: '2', name: 'সাব ক্লাস' },
  ];
  const admissionData = [
    { id: '1', name: 'ভর্তির আগে' },
    { id: '2', name: 'ভর্তির পরে' },
  ];
  const bookOfSubjectData = [
    { id: '3', name: '3 বিষয়ের খাতা' },
    { id: '4', name: '4 বিষয়ের খাতা' },
    { id: '5', name: '5 বিষয়ের খাতা' },
    { id: '6', name: '6 বিষয়ের খাতা' },
    { id: '7', name: '7 বিষয়ের খাতা' },
    { id: '8', name: '8 বিষয়ের খাতা' },
    { id: '9', name: '9 বিষয়ের খাতা' },
    { id: '10', name: '10 বিষয়ের খাতা' },
  ];

  const studentReportData = [
    { id: '1', value: '১. ভর্তি রেজিস্টার' },
    { id: '2', value: '২. নতুন পুরাতন শিক্ষার্থীর তালিকা' },
    { id: '3', value: '৩. জামাত ভিত্তিক নতুন পুরাতন মোট শিক্ষার্থী' },
    { id: '4', value: '৪. শিক্ষার্থীর সংক্ষিপ্ত তালিকা দুই কলমে' },
    { id: '5', value: '৫. অভিভাবকের মোবাইল নাম্বারের তালিকা' },
    { id: '6', value: '৬. জামাত ওয়ারী কিতাব/বিষয়ের তালিকা' },
    { id: '7', value: '৭. শিক্ষার্থীদের পরিচয় পত্র (আইডি কার্ড)' },
    { id: '8', value: '৮. বাংলা হাজিরা খাতা 30 দিনের' },
    { id: '9', value: '৯. বাংলা হাজিরা খাতা বিষয়ওয়ারী' },
    { id: '10', value: '১০. আরবী হাজিরা খাতা 30 দিনের সর্ট অ্যাড্রেস' },
    { id: '11', value: '১১. আরবী হাজিরা খাতা বিষয়ওয়ারী' },
    { id: '12', value: '১২. ভর্তি রেজি: সকল শিক্ষার্থীর জামাত সিরিয়াল' },
    { id: '13', value: '১৩. সকল শিক্ষার্থীর পরিসংখ্যান' },
    { id: '14', value: '১৪. ভর্তি ফর্ম' },
    { id: '15', value: '১৫. নতুন ভর্তির ফর্ম' },
    { id: '16', value: '১৬. আইডি দিয়ে ভর্তি রেজিস্টার' },
    { id: '17', value: '১৭. ভর্তি রেজি: সকল শিক্ষার্থীর আইডি সিরিয়াল' },
    { id: '18', value: '১৮. ছবি সহ ভর্তি রেজিস্টার নতুন-পুরাতন' },
    { id: '19', value: '১৯. অভিভাবকের মোবাইল নাম্বার দুই কলমে' },
    { id: '20', value: '২০. আর্থিক অবস্থা ভিত্তিক পরিসংখ্যান' },
    { id: '21', value: '২১. আর্থিক অবস্থা ভিত্তিক ভর্তি রেজিস্টার' },
    { id: '22', value: '২২. জন্ম নিবন্ধন ভিত্তিক তালিকা' },
    { id: '23', value: '২৩. অভিভাবকের তথ্য' },
    { id: '24', value: '২৪. আইডি দিয়ে ভর্তি ফর্ম' },
    { id: '25', value: '২৫. ঠিকানা ভিত্তিক ভর্তি রেজিস্টার' },
    { id: '26', value: '২৬. ছবিসহ হাজিরা খাতা' },
  ];

  const reportFieldMap = {
    SessionID: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '8',
      '9',
      '10',
      '11',
      '12',
      '13',
      '14',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '26',
    ],
    ClassID: [
      '1',
      '2',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      '14',
      '18',
      '19',
      '21',
      '22',
      '23',
      '24',
      '26',
    ],
    gender: ['1', '4', '8', '12', '23', '26', '16'],
    id: ['1', '2', '4', '12', '17', '16', '18', '21'], // New/Old
    RDID: ['1', '5', '8', '9', '12', '23', '26'],
    IsActive: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '7',
      '8',
      '12',
      '15',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
    ],
    bookOfSubject: ['9', '11'],
    classAndSubClassData: ['13'],
    IsActiveAdmissionForm: ['14', '24'],
    IdAdmissionRegister: ['16'],
    IdAdmissionForm: ['24'],
    addresss: ['25'],
  };
  const ComingSoon = () => {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-200 py-16 px-4">
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">
            Coming Soon
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            We're working hard to bring you something amazing. Stay tuned...
          </p>
          {/* Loader removed per your request */}
        </div>
      </div>
    );
  };
  const onSubmit = () => {
    // Map report ID to component and pass reportData as a prop

    const reportComponents = {
      1: <AdmissionRegisterPrint reportData={reportData} />,
      2: (
        <OldNewRegisterList
          reportData={reportData}
          NewOldId={NewOldId}
          SubClassID={SubClassID}
        />
      ),
      3: <JamaatBasedNewOldTotalStudent reportData={reportData} />,
      4: <StudentsListTwoColumns reportData={reportData} />,
      5: (
        <ParentsMobileNumberList
          reportData={reportData}
          SubClassID={SubClassID}
          SessionID={SessionID}
        />
      ),
      6: <JamaatWariBookList reportData={reportData} SubClassID={SubClassID} />,
      7: <ComingSoon />,

      8: (
        <BanglaAttendence
          reportData={reportData}
          SubClassID={SubClassID}
          SessionID={SessionID}
        />
      ),
      9: (
        <BanglaAttendenceSubjectWari
          reportData={reportData}
          SubClassID={SubClassID}
          BookLine={BookLine}
        />
      ),
      10: <ComingSoon />,
      11: <ComingSoon />,
      12: (
        <AdmissionRegisterSerial
          reportData={reportData}
          SessionID={SessionID}
        />
      ),
      // 13: <AllStudentsStatistics reportData={reportData} />,
      13: <ComingSoon />,
      14: <AdmissionFormPdf SubClassID={SubClassID} SessionID={SessionID} />,
      15: <AdmissionFormPdf />,
      16: <IdAdmissionRegister reportData={reportData} />,
      17: (
        <AdmissionResigterAllStudentsSerial
          reportData={reportData}
          SessionID={SessionID}
        />
      ),
      18: <ImageWithAdmissionRegisterNewOld reportData={reportData} />,
      19: <ParentsMobileNumberTwoColumn reportData={reportData} />,
      // 20: <FinancialStatusBasedStatistics reportData={reportData} />,
      20: <ComingSoon />,
      21: <FinancialStatusBasedAdmissionRegister reportData={reportData} />,
      22: <BirthRegistrationBasedList reportData={reportData} />,
      // 23: <ParentsInfo reportData={reportData} />,
      23: <ComingSoon />,
      24: <AdmissionFormPdf SubClassID={SubClassID} SessionID={SessionID} />,
      25: <AddressBasedAdmissionRegister reportData={reportData} />,
      26: <AttendanceBookWithPhoto reportData={reportData} />,
    };

    const component = reportComponents[selectedReportID] || null;
    setSelectedReportComponent(component);

    // Trigger print only if data is available and component is set
    if (component && reportData && !isLoading) {
      setTimeout(() => {
        window.print();
      }, 500); // Increased delay to ensure rendering
    } else {
      console.warn('Cannot print: Data not ready or component not set.');
    }
    // reset();
  };

  return (
    <>
      <div className="bg-white p-6 md:p-4 rounded-xl shadow-lg font-SolaimanLipi hidden_in_print">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate('Students Report')}
          </h3>
        </div>
        <FormProvider {...methods}>
          <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-3">
              <SearchSelect
                label={translate('Students Report')}
                registerKey="studentReport"
                options={studentReportData ?? []}
                valueField="id"
                nameField="value"
                require="Students Report is required"
              />

              {reportFieldMap.SessionID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate('Session')}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                />
              )}
              {reportFieldMap.classAndSubClassData.includes(
                selectedReportID
              ) && (
                <DefaultSelect
                  label={translate('Class And Subclass')}
                  options={classAndSubClassData ?? []}
                  valueField="id"
                  nameField="name"
                  registerKey="id"
                />
              )}
              {reportFieldMap.bookOfSubject.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate('Book of subjects')}
                  options={bookOfSubjectData ?? []}
                  valueField="id"
                  nameField="name"
                  registerKey="BookLine"
                />
              )}
              {reportFieldMap.ClassID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate('SubClass')}
                  options={subClassListData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode={true}
                />
              )}
              {reportFieldMap.gender.includes(selectedReportID) && (
                <DefaultSelect
                  label={
                    <p className="text-gray-700 font-medium">
                      {translate('Gender')}
                    </p>
                  }
                  options={genderOptions}
                  valueField="id"
                  nameField="value"
                  registerKey="gender"
                />
              )}
              {reportFieldMap.id.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate('New/Old')}
                  options={newAndOldData ?? []}
                  valueField="id"
                  nameField="value"
                  registerKey="NewOldId"
                />
              )}
              {reportFieldMap.RDID.includes(selectedReportID) && (
                <DefaultSelect
                  label={translate('Residential')}
                  options={residentialData ?? []}
                  valueField="RDID"
                  nameField="ResidentialName"
                  registerKey="ResidentialStatusId"
                />
              )}
              {reportFieldMap.addresss.includes(selectedReportID) && (
                <>
                  <DefaultSelect
                    label={translate('Division')}
                    type="number"
                    options={Array.isArray(divition) ? divition : []}
                    registerKey="DivisionID"
                    valueField="DivisionID"
                    nameField="DivisionName"
                  />
                  <DefaultSelect
                    label={translate('District') }
                    type="number"
                    options={
                      Array.isArray(district[DivisionID])
                        ? district[DivisionID]
                        : []
                    }
                    registerKey="DistrictID"
                    valueField="DistrictID"
                    nameField="DistrictName"
                  />
                  <DefaultSelect
                    label={translate('Thana')}
                    type="number"
                    options={
                      Array.isArray(thana[DistrictID]) ? thana[DistrictID] : []
                    }
                    registerKey="permanentPoliceStationID"
                    valueField="PoliceStationID"
                    nameField="PoliceStationName"
                  />
                </>
              )}
              {reportFieldMap.IdAdmissionRegister.includes(
                selectedReportID
              ) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DefaultInput
                    label={translate('Id one')}
                    registerKey="IdOne"
                  />
                  <DefaultInput
                    label={translate('Id two')}
                    registerKey="IdTwo"
                  />
                </div>
              )}
              {reportFieldMap.IdAdmissionForm.includes(selectedReportID) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DefaultInput
                    label={translate('Id one')}
                    registerKey="IdOne"
                  />
                </div>
              )}
              {reportFieldMap.IsActive.includes(selectedReportID) && (
                <Checkbox
                  label={translate('User Status')}
                  options={userStatus}
                  registerKey="is_active"
                />
              )}
              {reportFieldMap.IsActiveAdmissionForm.includes(
                selectedReportID
              ) && (
                <Checkbox
                  label={translate('Admission Status')}
                  options={admissionData}
                  registerKey="IsActive"
                />
              )}

              <div className="pt-7 w-full">
                <Button type="submit" className="w-full md:w-auto">
                  {translate('Preview')}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>

      {selectedReportComponent && (
        <div ref={reportRef} className="print_canvas mt-4">
          {selectedReportComponent}
        </div>
      )}
    </>
  );
};

export default StudentsReport;

//     <>
//       {/* reports 1 */}
//       <AdmissionRegisterPrint />
//       {/* reports 2 */}
//       <OldNewRegisterList />
//       {/* reports 3 */}
//       <JamaatBasedNewOldTotalStudent />
//       {/* reports 4 */}
//       <StudentsListTwoColumns />
//       {/* reports 5 */}
//       <ParentsMobileNumberList />
//       {/* reports 6 */}
//       <JamaatWariBookList />
//       {/* শিক্ষার্থীদের পরিচয় পত্র আইডি কার্ড 7 */}
//       {/* reports 8 */}
//       <BanglaAttendence />
//       {/* reports 9 */}
//       <BanglaAttendenceSubjectWari />
// {/* আরবি হাজিরা খাতা 30 দিনের 10 */}
// {/* আরবি হাজিরা খাতা 30 দিনের শর্ট অ্যাড্রেস 10.2 */}
// {/* আরবি হাজিরা খাতা বিষয় ওয়ারী 11 */}
//       {/* reports 12 */}
//       <AdmissionRegisterSerial />
//       {/* reports 13 */}
//       <AllStudentsStatistics />
// {/* ভর্তি ফর্ম *  14 /}
// {/* নতুন ভর্তি ফর্ম 15 */}
//       {/* reports 16 */}
//       <IdAdmissionRegister />
//       {/* reports 17 */}
//       <AdmissionResigterAllStudentsSerial />
//       {/* reports 18 */}
//       <ImageWithAdmissionRegisterNewOld />
//       {/* reports 19 */}
//       <ParentsMobileNumberTwoColumn />
//       {/* reports 20 */}
//       <FinancialStatusBasedStatistics />
//       {/* reports 21 */}
//       <FinancialStatusBasedAdmissionRegister />
//       {/* reports 22 */}
//       <BirthRegistrationBasedList />
//       {/* reports 23 */}
//       <ParentsInfo />
//       {/* reports 24 */}
//       <AdmissionFormWithID />
//       {/* reports 25 */}
//       <AddressBasedAdmissionRegister />
//       {/* reports 26 */}
//       <AttendanceBookWithPhoto />
//     </>
