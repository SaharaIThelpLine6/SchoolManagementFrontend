import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import {
  useGetStudentBySearchQuery,
  usePostEnglishAndArobicNameMutation,
} from '../features/student/studentQuerySlice';
import {
  setCharacterReportEditMode,
  setFilteredStudent,
} from '../features/student/studentSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import convertBijoyToBengali from '../utils/uniconveter';

const EnglisArobihName = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const translate = useTranslate();

  const { academicSession, status } = useSelector((state) => state.settings);
  const { filteredStudent } = useSelector((state) => state.student);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

  const studentCodeOrName = methods.watch('StudentCode');

  const { data: searchStudentInfo, error: searchStudentError } =
    useGetStudentBySearchQuery(
      { search: studentCodeOrName, ClassID: null, SessionID: null },
      { skip: !userTyping, refetchOnFocus: false }
    );

  const [addEnglishArobicNameStudent, { isLoading }] =
    usePostEnglishAndArobicNameMutation();

  useEffect(() => {
    dispatch(setPageName(pageTitle));
    dispatch(setFilteredStudent(null));
    dispatch(setCharacterReportEditMode(null));
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
  }, []);

  useEffect(() => {
    if (status === 'succeeded' && academicSession.length > 0) {
      methods.setValue('SessionID', academicSession[0].SessionID);
      methods.setValue('Date', new Date());
    }
  }, [status, academicSession]);

  useEffect(() => {
    if (filteredStudent) {
      setUserTyping(false);
      dispatch(setCharacterReportEditMode(null));

      methods.reset({
        UserID: filteredStudent.UserID, // UserID
        StudentCode: filteredStudent.StudentCode,
        StudentName: bnBijoy2Unicode(filteredStudent.StudentName),
        FatherName: bnBijoy2Unicode(filteredStudent.FatherName),
        MotherName: bnBijoy2Unicode(filteredStudent.MotherName),
        EnglishName: filteredStudent.EnglishName || '',
        EnglishFather: filteredStudent.EnglishFather || '',
        EnglishMother: filteredStudent.EnglishMother || '',
        EnglishShortAdd: filteredStudent.EnglishShortAdd || '',
        ArabicName: filteredStudent.ArabicName || '',
        ArabicFather: filteredStudent.ArabicFather || '',
        ArabicMother: filteredStudent.ArabicMother || '',
        ArabicShortAdd: filteredStudent.ArabicShortAdd || '',
        ClassName: bnBijoy2Unicode(filteredStudent.ClassName),
        SubClassID: filteredStudent.SubClassID,
        SessionID: filteredStudent.SessionID,
        Date: new Date(),
      });
    }
  }, [filteredStudent]);

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

  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    dispatch(setFilteredStudent(item));
    setShowSuggestions(false);
  };

  const handleOpenModal = useCallback(() => {
    dispatch(setFilteredStudent(null));
    setShowSuggestions(false);
    showModal('Filter Student', 'STUDENT_FILTER');
  }, []);

  const onSubmit = async (data) => {
    const toastId = toast.loading('Submitting...');
    try {
      const convertedData = {
        UserID: data.UserID, // Make sure UserID
        EnglishName: data.EnglishName
          ? convertBijoyToBengali(data.EnglishName)
          : null,
        EnglishFather: data.EnglishFather
          ? convertBijoyToBengali(data.EnglishFather)
          : null,
        EnglishMother: data.EnglishMother
          ? convertBijoyToBengali(data.EnglishMother)
          : null,
        EnglishShortAdd: data.EnglishShortAdd
          ? convertBijoyToBengali(data.EnglishShortAdd)
          : null,
        ArabicName: data.ArabicName
          ? convertBijoyToBengali(data.ArabicName)
          : null,
        ArabicFather: data.ArabicFather
          ? convertBijoyToBengali(data.ArabicFather)
          : null,
        ArabicMother: data.ArabicMother
          ? convertBijoyToBengali(data.ArabicMother)
          : null,
        ArabicShortAdd: data.ArabicShortAdd
          ? convertBijoyToBengali(data.ArabicShortAdd)
          : null,
      };

      await addEnglishArobicNameStudent(convertedData).unwrap();
      toast.update(toastId, {
        render: 'Submitted successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: err?.data?.error || 'Submission failed!',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  if (status === 'loading') return <Loading />;

  return (
    <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-600 uppercase font-SolaimanLipi">
            {translate("Student's English Name")}
          </h1>

          <input type="hidden" {...methods.register('SubClassID')} />
          <input type="hidden" {...methods.register('UserID')} />

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="mb-6 relative">
              <label className="font-SolaimanLipi block mb-1">
                {translate('User Code')}:
              </label>
              <div className="flex gap-2">
                <input
                  {...methods.register('StudentCode', { required: true })}
                  className="w-full rounded border border-gray-300 px-2 h-[38px] bg-[#EDEDED]"
                  onInput={() => {
                    setUserTyping(true);
                    dispatch(setCharacterReportEditMode(null));
                  }}
                />
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="pr-2"
                >
                  <SvgIcon name={'TbFilterPlus'} size={30} />
                </button>
              </div>
              {showSuggestions && (
                <div className="absolute z-30 bg-white shadow border w-full max-h-[200px] overflow-y-auto mt-1">
                  {searchStudentInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)} -{' '}
                      {bnBijoy2Unicode(item.ClassName)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DefaultSelect
              label={<span>{translate('Session')}</span>}
              nameField={'SessionName'}
              registerKey={'SessionID'}
              valueField={'SessionID'}
              options={academicSession}
              type={'number'}
              require={'This Field is required'}
              disabled={false}
              defaultSelect={false}
              unicode={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Bangla Column */}
            <div className="space-y-4">
              <DefaultInput
                registerKey={'ClassName'}
                label="মারহালা/শ্রেণি"
                disable={true}
              />
              <DefaultInput
                registerKey={'StudentName'}
                label="শিক্ষার্থীর নাম"
                disable={true}
              />
              <DefaultInput
                registerKey={'FatherName'}
                label="পিতার নাম"
                disable={true}
              />
              <DefaultInput
                registerKey={'MotherName'}
                label="মাতার নাম"
                disable={true}
              />
            </div>

            {/* English Column */}
            <div className="space-y-4">
              <DefaultInput
                registerKey={'EnglishName'}
                label="Student Name"
              />
              <DefaultInput
                registerKey={'EnglishFather'}
                label="Father Name"
              />
              <DefaultInput
                registerKey={'EnglishMother'}
                label="Mother Name"
              />
              <DefaultInput
                registerKey={'EnglishShortAdd'}
                label="English Short Address"
              />
            </div>

            {/* Arabic Column */}
            <div className="space-y-4">
              <DefaultInput registerKey={'ArabicName'} label="اسم الطالب " />
              <DefaultInput registerKey={'ArabicFather'} label="اسم الأب " />
              <DefaultInput registerKey={'ArabicMother'} label="اسم الأم " />
              <DefaultInput
                registerKey={'ArabicShortAdd'}
                label="عنوان قصير باللغة العربية "
              />
            </div>
          </div>

          <div className="mt-6">
            <ViewPermission
              permissionId={
                permissionsDataList.english_name_entry ||
                permissionsDataList.english_name_entry
              }
              permissionType="insert"
            >
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            </ViewPermission>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EnglisArobihName;
