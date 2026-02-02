import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
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

const PAGE_SIZE = 10;

const StudentIdCardPrint = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);


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

  const totalPages = Math.ceil(searchStudentInfo.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return searchStudentInfo.slice(start, start + PAGE_SIZE);
  }, [searchStudentInfo, currentPage]);

    //   const handleSelectAll = (e) => {
    //     if (e.target.checked) {
    //       setSelectedRows(paginatedData.map((row) => row.AdmissionID));
    //     } else {
    //       setSelectedRows([]);
    //     }
    //   };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            console.log(searchStudentInfo);
            
            setSelectedRows(searchStudentInfo);
        } else {
            setSelectedRows([]);
        }
    };

    // const handleRowSelect = (e, student) => {
    // if (e.target.checked) {
    //     setSelectedRows(prev => [...prev, student]);
    // } else {
    //     setSelectedRows(prev =>
    //     prev.filter(
    //         row => row.AdmissionID !== student.AdmissionID
    //     )
    //     );
    // }
    // };

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
      console.log(selectedRows);
      dispatch(setPrintableStudentList(selectedRows));
      showModal('', 'STUDENT_ID_CARD');


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

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate('Group Distribution List')}
        </h3>
      </div>

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
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

      <div className="overflow-x-auto mt-5">
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
  );
};

export default StudentIdCardPrint;
