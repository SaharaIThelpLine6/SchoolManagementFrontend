import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { usePostGetStudentListMutation } from '../features/exam/examQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import useTranslate from '../utils/Translate';
import MonthlyDuesFilter from '../view/accounting/MonthlyDuesFilter';
import MonthTable from '../view/accounting/MonthTable';

const PAGE_SIZE = 10;

// Custom 20 designation data
const designationData = [
  { DNID: 1, Designation: 'Principal', SL: 1 },
  { DNID: 2, Designation: 'Vice Principal', SL: 2 },
  { DNID: 3, Designation: 'Senior Teacher', SL: 3 },
  { DNID: 4, Designation: 'Assistant Teacher', SL: 4 },
  { DNID: 5, Designation: 'Head of Department', SL: 5 },
  { DNID: 6, Designation: 'Science Teacher', SL: 6 },
  { DNID: 7, Designation: 'Math Teacher', SL: 7 },
  { DNID: 8, Designation: 'English Teacher', SL: 8 },
  { DNID: 9, Designation: 'Bangla Teacher', SL: 9 },
  { DNID: 10, Designation: 'ICT Teacher', SL: 10 },
  { DNID: 11, Designation: 'Physical Education Teacher', SL: 11 },
  { DNID: 12, Designation: 'Arts Teacher', SL: 12 },
  { DNID: 13, Designation: 'Music Teacher', SL: 13 },
  { DNID: 14, Designation: 'Librarian', SL: 14 },
  { DNID: 15, Designation: 'Counselor', SL: 15 },
  { DNID: 16, Designation: 'Registrar', SL: 16 },
  { DNID: 17, Designation: 'Accountant', SL: 17 },
  { DNID: 18, Designation: 'Administrative Officer', SL: 18 },
  { DNID: 19, Designation: 'Receptionist', SL: 19 },
  { DNID: 20, Designation: 'Support Staff', SL: 20 },
];

const MonthlyDues = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { handleSubmit } = methods;
  const [filter, setFilter] = useState(null);
  const [leftRows, setLeftRows] = useState([]);
  const [rightRows, setRightRows] = useState([]);
  const [postGetStudentList] = usePostGetStudentListMutation();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(designationData.length / PAGE_SIZE);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const onSubmit = async () => {
    try {
      const payload = {
        SessionID: filter?.SessionId,
        ExamID: filter?.ExamId,
        SubClassID: filter?.SubClassId,
        userids: rightRows.map((row) => row.UserID),
      };

      console.log('Submitting data:', payload);
      const result = await postGetStudentList(payload).unwrap();

      Swal.fire({
        icon: 'success',
        title: translate('Successfully Saved'),
        text: result?.message || translate('Data saved successfully'),
      }).then(() => {
        if (methods) methods.reset();
        setLeftRows([]);
        setRightRows([]);
      });
    } catch (error) {
      console.error('Submission error:', error);
      Swal.fire({
        icon: 'error',
        title: translate('Error Occurred!'),
        text:
          error?.data?.message ||
          error?.message ||
          translate('Failed to save data'),
      });
    }
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designationData.slice(start, start + PAGE_SIZE);
  }, [currentPage]);

  const columns = [
    { title: 'SL', field: 'SL', hozAlign: 'center' },
    {
      title: translate('ID Number'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Student Name'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Mobile Number'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Fee Name'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Scheduled Fee'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Deducation'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Collection'),
      field: 'Designation',
      hozAlign: 'center',
    },
    {
      title: translate('Outstanding'),
      field: 'Designation',
      hozAlign: 'center',
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between mb-6">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate('Monthly Dues')}
        </h3>
      </div>

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="col-span-1">
              <MonthlyDuesFilter onFilter={setFilter} />
            </div>
            <div className="col-span-1">
              <MonthTable />
            </div>
          </div>
          <div className="flex justify-end">
            <ViewPermission
              permissionId={permissionsDataList.monthly_due_list}
              permissionType="insert"
            >
              <Button type="submit" className="w-full md:w-auto">
                {translate('Save')}
              </Button>
            </ViewPermission>
          </div>
        </form>
      </FormProvider>

      <div className="mt-5">
        {/* Designation Table */}
        <SortableTable
          columns={columns}
          data={paginatedData}
          className="mt-6"
        />

        {/* Pagination Controls */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default MonthlyDues;
