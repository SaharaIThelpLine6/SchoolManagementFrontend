import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetClassListQuery, useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useGetStudentBySearchQuery,
  usePostChnageStudentGroupMutation,
} from '../features/student/studentQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import { setPrintableStudentList } from '../features/student/studentSlice';
import { showModal } from '../utils/ModalControlar';
import { useGetInstitutionInfoQuery } from '../features/settings/settingsQuerySlice';
import StudentIdCardGenerate from './StudentIdCardGenerate';

const PAGE_SIZE = 10;

const StudentIdCardPrint = ({ pageTitle }) => {
  const navigate = useNavigate()
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { register, watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);

  const [checkboxState, setCheckboxState] = useState([]);

  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  const SessionID = watch('SessionID');
  const ClassID = watch('ClassID');
  const SubClassID = watch('SubClassID');
  const ResidentialStatusId = watch('ResidentialStatusId');

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const [postChnageStudentGroup, { isLoading, isSuccess, isError }] =
    usePostChnageStudentGroupMutation();

  const { data: searchStudentInfo = [], refetch } = useGetStudentBySearchQuery(
    { SubClassID, SessionID, ResidentialStatusId },
    {
      skip: !SubClassID || !SessionID || !ResidentialStatusId,
      refetchOnFocus: false,
    }
  );
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // useEffect(() => {
  //   console.log(checkboxState);

  // }, [checkboxState])

  const totalPages = Math.ceil(searchStudentInfo.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return searchStudentInfo.slice(start, start + PAGE_SIZE);
  }, [searchStudentInfo, currentPage]);


  const handleCheckboxChange = (id, isChecked) => {
    console.log(id);
    console.log(isChecked);

    setCheckboxState(prev => {
      if (isChecked) {

        return [...prev, id];
      } else {
        // Remove when unchecked
        return prev.filter(item => item !== id);
      }
    });
  };



  const handleSelectAll = (e) => {
    if (e.target.checked) {
      console.log(searchStudentInfo);

      setSelectedRows(searchStudentInfo);
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (e, student) => {
    if (e.target.checked) {
      setSelectedRows(prev =>
        prev.some(row => row.AdmissionID === student.AdmissionID) ? prev : [...prev, student]
      );
    } else {
      setSelectedRows(prev =>
        prev.filter(
          row => row.AdmissionID !== student.AdmissionID
        )
      );
    }
  };


  const onSubmit = async (data) => {
    try {
      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'ফর্ম অসম্পূর্ণ',
          text: 'অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।',
        });
        return;
      }


      // console.log(data);
      // console.log(selectedRows);
      // console.log(checkboxState);

      const updatedSelectedRows = selectedRows.map(row => {
        const newRow = { ...row };
        checkboxState.forEach(key => {
          const fieldKeyName = `fieldkey_${key}`;
          if (data[fieldKeyName]) {
            newRow[`fieldkey_${key}`] = data[fieldKeyName];
          }
        });
        return newRow;
      });

      dispatch(setPrintableStudentList(updatedSelectedRows));
      showModal('', 'STUDENT_ID_CARD', checkboxState);
      // navigate("/students/student-id-card-print", {
      //   state: {
      //     layoutId: selectedLayout,
      //     fields: checkboxState,
      //   },
      // });

      //   const response = await postChnageStudentGroup({
      //     id: data.SubClassID,
      //     body: { admissionIds: selectedRows },
      //   }).unwrap();

      //   Swal.fire({
      //     icon: 'success',
      //     title: 'সফলভাবে সংরক্ষণ হয়েছে',
      //     text: response?.message || 'গ্রুপ পরিবর্তন সফল হয়েছে।',
      //   }).then(() => {
      //     refetch();
      //     setSelectedRows([]);
      //     methods.reset();
      //   });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ত্রুটি ঘটেছে!',
        text: error?.data?.error || 'ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।',
      });
      console.error('Error updating student group:', error);
    }
  };

  const handleLayoutSelect = (layoutId) => {
    setSelectedLayout(layoutId);
  };
  const layouts = [
    { id: "1", image: "/student_id_image.png" },

  ];


  const englishToBanglaMap = {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  };
  const convertToBanglaDisplay = (value) => {
    if (!value) return '';

    return value
      .split('')
      .map((char) => englishToBanglaMap[char] || char)
      .join('');
  };
  const FIELD_LABELS = {
    StudentName: "নাম",
    FatherName: "পিতার নাম",
    MotherName: "মাতার নাম",
    ClassName: "শ্রেণি",
    Mobile1: "মোবাইল",
    SessionName: "সেশন",
    BloodGroup: "রক্তের গ্রুপ",
    ResidentialName: "অবস্থান",
    NIDNO: "NID",
    DateOfBirth: "জন্ম তারিখ",
    NewOldId: "আবস্থা",
  };
  const FIELD_Value_Demo = {
    StudentName: "মো: আজাদ হাসান",
    FatherName: "মো: সোলায়মান হাসান",
    MotherName: "মোসা: ফাতেমা বেগম",
    ClassName: "প্রথম",
    Mobile1: "০১৮৭৬৮৬২৩৮৬",
    SessionName: "২০২৬",
    BloodGroup: "এ +",
    ResidentialName: "আবাসিক",
    NIDNO: "01234567898",
    DateOfBirth: "12/06/2021",
    NewOldId: "",
  };
  return (
    <div>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5 hidden_in_print">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate('Group Distribution List')}
          </h3>
        </div>

        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => handleLayoutSelect(layout.id)}
            className={`border rounded-xl hidden_in_print p-2 ${selectedLayout === layout.id ? "border-blue-500" : ""
              }`}
          >
            <div className='w-[250px] border border-[#000] mb-[1px] relative print-id-card'>
              <img src="/student_id_card_top.jpeg" alt="card header" className='h-[110px]' />
              <div className="absolute top-[2px] w-full">
                <h2 className='text-center text-[20px] text-white font-bold truncate'>{institutionInfo?.InstitutionName}</h2>
                <p className='text-[16px] text-center text-white'>{institutionInfo?.Address}</p>
              </div>
              <div className="middle_area px-2 -mt-[40px]">
                <div className="proile_image_shape text-center">
                  <div className="image overflow-hidden h-[92px] w-[92px] shadow-lg mx-auto rounded-[5px]">
                    <img className='w-full h-full object-cover' src="/avatar.png" alt="" />
                  </div>
                  <h3 className='text-center py-[2px] px-[30px] mt-[6px] bg-sky-600 inline-block rounded-[50px] mx-auto text-white text-[16px]'>পরিচয় পত্র</h3>
                </div>
                <div className='pt-1 pb-2  text-left'>
                  <h3 className='text-red pl-[20px] text-[16px]'>আইডি নং: 123</h3>
                  {checkboxState.map((fieldName) => {
                    if (!fieldName) return null;
                    return (
                      <p key={fieldName} className='text-[15px]'>
                        <input className='w-fit inline-block' style={{
                          width: `${(watch(`fieldkey_${fieldName}`)?.length || FIELD_LABELS[fieldName]?.length || 1) - 0}ch`,
                          minWidth: "0.1ch",
                        }} {...register(`fieldkey_${fieldName}`)} defaultValue={FIELD_LABELS[fieldName]} />: {FIELD_Value_Demo[fieldName]}
                      </p>
                    );
                  })}
                </div>
              </div>

              <img src="/student_id_card_bottom.jpeg" alt="card footer" className='h-[15px] w-full' />
            </div>
          </button>
        ))}



        <FormProvider {...methods}>
          <form className="w-full space-y-4 hidden_in_print" onSubmit={handleSubmit(onSubmit)}>
            <p className='mt-4 font-bold text-[18px]'>{checkboxState.length == 0 ? "সর্বাধিক ৫টি এন্ট্রি নির্বাচন করুন" : checkboxState.length < 5 ? `আরও ${convertToBanglaDisplay(String(5 - checkboxState.length))}টি ফিল্ড নির্বাচন করতে পারবেন` : "সর্বোচ্চ এন্ট্রি নির্বাচন করা হয়েছে"}</p>
            <div className='flex gap-4 mt-[40px] mb-[40px]'>
              {[
                { ID: "StudentName", Name: "User Name" },
                { ID: "FatherName", Name: "Father Name" },
                { ID: "MotherName", Name: "Mother Name" },
                { ID: "ClassName", Name: "Class Name" },
                { ID: "Mobile1", Name: "Mobile" },
                { ID: "SessionName", Name: "Session" },
                { ID: "BloodGroup", Name: "Blood Group" },
                { ID: "ResidentialName", Name: "Residential Name" },
                { ID: "NIDNO", Name: "NID" },
                { ID: "DateOfBirth", Name: "Date Of Birth" },
                { ID: "NewOldId", Name: "Position" },
              ].map((i) => (
                <div className='flex items-center gap-2'>
                  <input
                    type="checkbox"
                    {...register(i.ID)}
                    className='h-[20px] w-[20px]'
                    onChange={(e) => handleCheckboxChange(i.ID, e.target.checked)}

                    disabled={
                      checkboxState.length >= 5 && !checkboxState.includes(i.ID)
                    }
                  />
                  <label className='text-[20px]' htmlFor={i.ID}>{translate(i.Name)}</label>
                </div>

              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-3">

              <DefaultSelect
                label={translate('Session')}
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
              <DefaultSelect
                label={translate('Sub Class')}
                options={subClassListData}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode={true}
              />
              <DefaultSelect
                label={translate('Sub Class')}
                options={[
                  {
                    ResidentialStatusId: 1,
                    value: "আবাসিক"
                  },
                  {
                    ResidentialStatusId: 2,
                    value: "অনাবাসিক"
                  },
                  {
                    ResidentialStatusId: 3,
                    value: "ডে-কেয়ার"
                  },
                  {
                    ResidentialStatusId: 4,
                    value: "উভয়"
                  }
                ]}
                valueField="ResidentialStatusId"
                nameField="value"
                registerKey="ResidentialStatusId"
                unicode={true}
              />

              <div className="pt-7 w-full">
                <ViewPermission
                  permissionId={permissionsDataList.student_group_setting}
                  permissionType="insert"
                >
                  <Button type="submit" className="w-full md:w-auto">
                    {translate('Preview')}
                  </Button>
                </ViewPermission>
              </div>



            </div>
          </form>
        </FormProvider>

        <div className="overflow-x-auto mt-5 hidden_in_print">
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">
                  {/* <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    selectedRows.length === paginatedData.length &&
                    paginatedData.length > 0
                  }
                /> */}
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      searchStudentInfo.length > 0 &&
                      selectedRows.length === searchStudentInfo.length
                    }
                  />
                </th>
                <th className="p-2 text-left">{translate('User ID')}</th>
                <th className="p-2 text-left">{translate('Student Name')}</th>
                <th className="p-2 text-left">{translate('Class')}</th>
                <th className="p-2 text-left">{translate('Sub Class')}</th>
                <th className="p-2 text-left">{translate('Residential')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((student) => (
                <tr key={student.AdmissionID} className="border-t">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      onChange={(e) => handleRowSelect(e, student)}
                      checked={selectedRows.some(
                        row => row.AdmissionID === student.AdmissionID
                      )}
                    />
                  </td>
                  <td className="p-2">{student.StudentCode}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.StudentName)}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.ClassName)}</td>
                  <td className="p-2">{bnBijoy2Unicode(student.SubClass)}</td>
                  <td className="p-2">{student.ResidentialName}</td>
                </tr>
              ))}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center p-4">
                    {translate('No data found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />



      </div>
      <div className='print_canvas'>
        <StudentIdCardGenerate fields={checkboxState} />
      </div>
    </div>
  );
};

export default StudentIdCardPrint;
