import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import StudentReportList from '../components/StudentReportList';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import {
  useGetStudentBySearchQuery,
  useGetStudentReportCetsQuery,
  useGetStudentReportsQuery,
  useGetStudentReportTypeQuery,
  usePostStudentCharacterReportMutation,
  useUpdateStudentCharacterReportMutation,
} from '../features/student/studentQuerySlice';
import {
  setCharacterReportEditMode,
  setFilteredStudent,
} from '../features/student/studentSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const CharacterReport = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { academicSession, status } = useSelector((state) => state.settings);
  const {
    admittedStudent,
    academicClassStudentError,
    filteredStudent,
    characterReportEditMode,
  } = useSelector((state) => state.student);
  const methods = useForm();
  const { data: studentReportCet, error: studentReportCetError } =
    useGetStudentReportCetsQuery();
  const { data: studentReportType, error: studentReportTypeError } =
    useGetStudentReportTypeQuery();
  const [
    addCharacterStudent,
    {
      isLoading: isCreating,
      isError: isCreateError,
      isSuccess: isCreateSuccess,
    },
  ] = usePostStudentCharacterReportMutation();
  const [
    updateCharacterStudent,
    {
      isLoading: isUpdating,
      isError: isUpdateError,
      isSuccess: isUpdateSuccess,
    },
  ] = useUpdateStudentCharacterReportMutation();
  const translate = useTranslate();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [reportParams, setReportParams] = useState({
    userCode: null,
    classID: null,
    SessionID: null,
  });
  const [reportUpdateId, setReportUpdateId] = useState(null);
  const [subClassId, setSubClassId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const studentCodeOrName = methods.watch('StudentCode');
  const classID = methods.watch('SubClassID');
  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: studentInfoLoading,
  } = useGetStudentBySearchQuery(
    { search: studentCodeOrName, ClassID: null, SessionID: null },
    {
      skip: !userTyping,
      refetchOnFocus: false,
    }
  );

  const { data: subClassData, isLoading: isSubClassLoading } =
    useGetSubClassListQuery();

  const {
    data: reportsResponse,
    error: reportsError,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useGetStudentReportsQuery(reportParams, {
    skip: !reportParams.userCode,
  });

  // Load initial data
  useEffect(() => {
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
    dispatch(setPageName(pageTitle));
    dispatch(setFilteredStudent(null));
    dispatch(setCharacterReportEditMode(null));
  }, []);

  // When admitted student data changes
  useEffect(() => {
    if (Object.keys(admittedStudent).length > 0) {
      dispatch(setCharacterReportEditMode(null));
      methods.reset({
        StudentName: bnBijoy2Unicode(admittedStudent.StudentName),
        FatherName: bnBijoy2Unicode(admittedStudent.FatherName),
        ClassName: bnBijoy2Unicode(admittedStudent.ClassName),
        SubClassID: admittedStudent.SubClassID,
        SessionID: admittedStudent.SessionID,
        Date: new Date(),
      });

      // Set report params when student is selected
      setReportParams({
        userCode: admittedStudent.StudentCode,
        classID: admittedStudent.SubClassID,
        SessionID: admittedStudent.SessionID,
      });
    }
  }, [admittedStudent]);

  // When filtered student changes
  useEffect(() => {
    if (filteredStudent) {
      setUserTyping(false);
      dispatch(setCharacterReportEditMode(null));
      methods.reset({
        StudentCode: filteredStudent.StudentCode,
        StudentName: bnBijoy2Unicode(filteredStudent.StudentName),
        FatherName: bnBijoy2Unicode(filteredStudent.FatherName),
        ClassName: bnBijoy2Unicode(filteredStudent.ClassName),
        SubClassID: filteredStudent.SubClassID,
        SessionID: filteredStudent.SessionID,
        Date: new Date(),
      });

      // Set report params when student is filtered
      setReportParams({
        userCode: filteredStudent.StudentCode,
        classID: filteredStudent.SubClassID,
        SessionID: filteredStudent.SessionID,
      });
    }
  }, [filteredStudent]);

  // Show suggestions when typing
  useEffect(() => {
    if (
      studentCodeOrName &&
      searchStudentInfo?.length > 0 &&
      !searchStudentError
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchStudentInfo, searchStudentError]);

  // Set default session and date
  useEffect(() => {
    if (status === 'succeeded' && academicSession.length > 0) {
      const today = new Date();
      methods.setValue('SessionID', academicSession[0].SessionID);
      methods.setValue('Date', today);
    }
  }, [status, academicSession]);

  // Handle errors
  useEffect(() => {
    if (academicClassStudentError) {
      methods.setValue('StudentName', '');
      methods.setValue('FatherName', '');
      methods.setValue('ClassName', '');
      methods.setValue('SubClassID', '');
      toast.error(academicClassStudentError || 'Something went wrong');
    }
  }, [academicClassStudentError]);

  // Handle when reportUpdateId changes (edit mode)
  useEffect(() => {
    if (reportUpdateId && reportsResponse) {
      const reportToEdit = reportsResponse.find(
        (report) => report.SRID === reportUpdateId
      );

      const subclassOption = subClassData?.find(
        (d) => d.SubClassID === reportToEdit.SubClassID
      );

      console.log(subclassOption, 'subclassOption');
      if (reportToEdit) {
        setIsEditMode(true);
        methods.reset({
          StudentCode: reportToEdit.StudentCode,
          StudentName: bnBijoy2Unicode(reportToEdit.StudentName),
          FatherName: bnBijoy2Unicode(reportToEdit.FatherName),
          ClassName: bnBijoy2Unicode(subclassOption?.Class?.ClassName),
          SubClassID: reportToEdit.SubClassID,
          SessionID: reportToEdit.SessionID,
          Date: reportToEdit.CreateDate,
          ReportCetID: reportToEdit.ReportCetID,
          ReportTypID: reportToEdit.ReportTypID,
          Remark: bnBijoy2Unicode(reportToEdit.Remark),
        });
      }
    } else {
      setIsEditMode(false);
    }
  }, [reportUpdateId, reportsResponse]);

  const onSubmit = async (data) => {
    const toastId = toast.loading(isEditMode ? 'Updating...' : 'Submitting...');

    try {
      // 🔹 ConvertedData আর লাগবে না, সরাসরি data ব্যবহার
      if (isEditMode) {
        const updatedData = { ...data, SRID: reportUpdateId };
        await updateCharacterStudent(updatedData).unwrap();
      } else {
        await addCharacterStudent(data).unwrap();
      }

      // ✅ Success Toast
      toast.update(toastId, {
        render: isEditMode
          ? 'Updated successfully!'
          : 'Submitted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });

      // 🔄 Refresh the report list
      refetchReports();

      // 🧹 Reset only specific fields (keeping others)
      methods.reset({
        ...methods.getValues(),
        Date: new Date(),
        ReportCetID: '',
        ReportTypID: '',
        Remark: '',
      });

      // 🚪 Exit edit mode if needed
      if (isEditMode) {
        setIsEditMode(false);
        setReportUpdateId(null);
      }
    } catch (err) {
      // ❌ Error Toast
      toast.update(toastId, {
        render:
          err?.data?.error ||
          (isEditMode ? 'Update failed!' : 'Submission failed!'),
        type: 'error',
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      console.error('Error:', err);
    }
  };

  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    methods.setValue('StudentCode', item.StudentCode);
    methods.setValue('StudentName', bnBijoy2Unicode(item.StudentName));
    methods.setValue('FatherName', bnBijoy2Unicode(item.FatherName));
    methods.setValue('ClassName', bnBijoy2Unicode(item.ClassName));
    methods.setValue('SubClassID', item.SubClassID);
    methods.setValue('SessionID', item.SessionID);

    dispatch(setCharacterReportEditMode(null));
    dispatch(setFilteredStudent(null));
    setShowSuggestions(false);

    // Set report params when student is selected from suggestions
    setReportParams({
      userCode: item.StudentCode,
      classID: item.SubClassID,
      SessionID: item.SessionID,
    });
  };

  const handleOpenModal = useCallback((id) => {
    dispatch(setFilteredStudent(null));
    setShowSuggestions(false);
    showModal('Filter Student', 'STUDENT_FILTER');
  }, []);

  const handleCategoryModal = useCallback(() => {
    showModal('Category', 'CHARACTER_REPORT_CATEGORY');
  }, []);

  const handleTypeModal = useCallback(() => {
    showModal('Type', 'CHARACTER_REPORT_TYPE');
  }, []);

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setReportUpdateId(null);
    methods.reset({
      StudentCode: methods.getValues('StudentCode'),
      StudentName: methods.getValues('StudentName'),
      FatherName: methods.getValues('FatherName'),
      ClassName: methods.getValues('ClassName'),
      SubClassID: methods.getValues('SubClassID'),
      SessionID: methods.getValues('SessionID'),
      Date: new Date(),
      ReportCetID: '',
      ReportTypID: '',
      Remark: '',
    });
  };

  const handleViewReport = () => {
    setReportParams({
      userCode: methods.getValues('StudentCode'),
      classID: methods.getValues('SubClassID'),
      SessionID: methods.getValues('SessionID'),
    });
  };

  if (status === 'loading' || isCreating || isUpdating) {
    return <Loading />;
  }

  return (
    <div>
      <div className="print:p-0">
        <div className="bg-white p-2 md:p-8 rounded-xl shadow-lg print:p-0 print:shadow-none">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="mx-auto print:hidden"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600 uppercase font-SolaimanLipi">
                {translate('Character Report')}
              </h1>

              <div className="grid xl:grid-cols-4 gap-4 md:gap-6 mb-6">
                <input
                  {...methods.register('SubClassID', {
                    required: 'Short address is required',
                  })}
                  className="hidden"
                />

                <div className="relative">
                  <div className="w-full">
                    <label
                      htmlFor={'StudentCode'}
                      className="mb-1 block text-black font-SolaimanLipi"
                    >
                      <span className="text-red-500">
                        {translate('User Code')} * :
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        {...methods.register('StudentCode', { required: ' ' })}
                        className="w-full rounded border-[1.5px] border-stroke bg-[#EDEDED] px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary disabled:cursor-not-allowed disabled:bg-slate-200"
                        onInput={() => {
                          setUserTyping(true);
                          dispatch(setCharacterReportEditMode(null));
                        }}
                        autoComplete="false"
                        disabled={isEditMode}
                      />
                      <button
                        type="button"
                        onClick={handleOpenModal}
                        className="text-gray-500 hover:text-gray-700 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="icon icon-tabler icons-tabler-outline icon-tabler-filter-plus"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M12 20l-3 1v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v3" />
                          <path d="M16 19h6" />
                          <path d="M19 16v6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {showSuggestions && (
                    <div className="search_suggetion h-[200px] overflow-y-auto absolute bottom-[0px] translate-y-full left-0 w-full bg-white shadow-lg z-30">
                      {searchStudentInfo.map((item, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-blue-100 cursor-pointer"
                          onClick={() => handleSuggestionClick(item)}
                        >
                          {item.StudentCode} -{' '}
                          {bnBijoy2Unicode(item.StudentName)} -{' '}
                          {bnBijoy2Unicode(item.SubClass)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <DefaultSelect
                  label={
                    <span className="text-red-500">
                      {translate('Session')} * :
                    </span>
                  }
                  nameField={'SessionName'}
                  registerKey={'SessionID'}
                  valueField={'SessionID'}
                  options={academicSession}
                  type={'number'}
                  require={'This Field is require'}
                  disabled={false}
                  defaultSelect={false}
                  unicode={true}
                />

                <DefaultInput
                  registerKey={'StudentName'}
                  label={`${translate('Student Name')}: `}
                  disable={true}
                />

                <DefaultInput
                  registerKey={'FatherName'}
                  label={`${translate('Father Name')}: `}
                  disable={true}
                />

                <DefaultInput
                  registerKey={'ClassName'}
                  label={`${translate('Class')}:`}
                  disable={true}
                />

                <DatePickerOne
                  dateCalender={`${translate('Date')}: `}
                  placeholder={''}
                  registerKey={'Date'}
                  require={'Date Require'}
                />
                <div className="flex items-center">
                  <DefaultSelect
                    label={`${translate('Varient')}: `}
                    nameField={'ReportCetName'}
                    registerKey={'ReportCetID'}
                    valueField={'ReportCetID'}
                    options={studentReportCet}
                    type={'number'}
                    require={'This Field is require'}
                    disabled={false}
                    defaultSelect={false}
                    unicode={true}
                  />
                  <div className="pt-[32px]">
                    <button
                      type="button"
                      className="btn btn_plus bg-info py-[6px] px-[8px] text-white"
                      onClick={handleCategoryModal}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M5 12l14 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <DefaultSelect
                    label={`${translate('Type')}: `}
                    nameField={'ReportTypeName'}
                    registerKey={'ReportTypID'}
                    valueField={'ReportTypID'}
                    options={studentReportType}
                    type={'number'}
                    require={'This Field is require'}
                    disabled={false}
                    defaultSelect={false}
                    unicode={true}
                  />
                  <div className="pt-[32px]">
                    <button
                      type="button"
                      className="btn btn_plus bg-info py-[6px] px-[8px] text-white"
                      onClick={handleTypeModal}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="icon icon-tabler icons-tabler-outline icon-tabler-plus"
                      >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M12 5l0 14" />
                        <path d="M5 12l14 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-6 mb-6">
                <div>
                  <label className="block text-[16px] font-400 font-normal text-gray-700 mb-1 md:mb-2 font-SolaimanLipi">
                    {translate('Remark')}:
                  </label>
                  <textarea
                    {...methods.register('Remark', {
                      required: 'Remark is required',
                    })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                  {errors.Remark && (
                    <span className="text-red-500 text-sm mt-1 block">
                      {errors.Remark.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex">
                <ViewPermission
                  permissionId={permissionsDataList.student_report}
                  permissionType="insert|edit"
                >
                  <button
                    type="submit"
                    className="lg:inline-block text-center bg-blue-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
                  >
                    {isEditMode ? 'Update' : 'Submit'}
                  </button>
                </ViewPermission>

                {isEditMode && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="lg:inline-block text-center bg-gray-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-gray-600 transition-colors font-medium text-sm md:text-base ml-4"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleViewReport}
                  className="lg:inline-block text-center bg-blue-400 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base ml-4"
                >
                  View Report
                </button>
              </div>
            </form>
          </FormProvider>

          <StudentReportList
            reportParams={reportParams}
            setReportUpdateId={setReportUpdateId}
            reportsResponse={reportsResponse}
            isLoading={reportsLoading}
            error={reportsError}
            studentReportCet={studentReportCet}
            studentReportType={studentReportType}
          />
        </div>
      </div>
    </div>
  );
};

export default CharacterReport;
