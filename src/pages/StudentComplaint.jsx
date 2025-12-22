import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import {
  useGetStudentParentsReportListQuery,
  usePutStudentReportStatusUpdateMutation,
} from '../features/userPanel/userInfo/userInfoQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const StudentComplaint = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  // ✅ Fetch complaints from API
  const {
    data: studentData,
    isLoading,
    error,
  } = useGetStudentParentsReportListQuery();

  console.log(studentData, 'studentData');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);
  const [updateStatus] = usePutStudentReportStatusUpdateMutation();
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Safe data extract
  const complaints = studentData?.data || [];

  // ✅ Pagination logic
  const totalPages = Math.ceil(complaints.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return complaints.slice(start, start + PAGE_SIZE);
  }, [complaints, currentPage]);

  // ✅ Open "Create Complaint" modal
  const handleOpenModal = useCallback(
    async (id) => {
      try {
        const payload = {
          id,
          SeeUnSee: 1,
        };

        await updateStatus(payload).unwrap();

        showModal(
          translate('View Student Complaint'),
          'STUDENT_COMPLAINT_VIEW',
          id
        );
      } catch (error) {
        console.error('Failed to update complaint status', error);
      }
    },
    [translate, updateStatus, showModal]
  );
  const rowTextClass = (row) =>
    row.SeeUnSee === false ? 'font-bold text-gray-900' : 'font-normal';

  // ✅ Table columns definition
  const columnsComplaint = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-md"
            onClick={() => handleOpenModal(row.SCID)}
          >
            <SvgIcon name={'FaEye'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate('ID'),
      field: 'SCID',
      hozAlign: 'center',
      render: (row) => <p className={rowTextClass(row)}>{row.SCID}</p>,
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.UserName || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Father Name'),
      field: 'FatherName',
      hozAlign: 'center',
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.FatherName || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Mobile'),
      field: 'Mobile1',
      hozAlign: 'center',
      render: (row) => (
        <p className={rowTextClass(row)}>
          {row.CreatedBy?.Mobile1 || translate('Unknown')}
        </p>
      ),
    },
    {
      title: translate('Complaint Details'),
      field: 'ComplaintDetails',
      hozAlign: 'center',
      render: (row) => (
        <p className={`${rowTextClass(row)} max-w-[250px] truncate mx-auto`}>
          {row.ComplaintDetails}
        </p>
      ),
    },
    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      render: (row) => (
        <p className={rowTextClass(row)}>
          {new Date(row.CreateAt).toLocaleString()}
        </p>
      ),
    },
    {
      title: translate('Status'),
      field: 'SeeUnSee',
      hozAlign: 'center',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.SeeUnSee
              ? 'bg-green-100 text-green-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {row.SeeUnSee ? translate('Seen') : translate('Unseen')}
        </span>
      ),
    },
  ];

  // ✅ Loading / Error / Empty states
  if (isLoading) return <Loading />;

  if (error)
    return (
      <p className="text-red-500 text-center">
        {translate('Failed to load student complaints')}
      </p>
    );

  if (!complaints.length)
    return (
      <p className="text-gray-500 text-center">
        {translate('No complaints found')}
      </p>
    );

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e9edf4] py-5 sm:px-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Student Complaints')}
          </h3>
          {/* <Button onClick={handleOpenModal}>
            {translate('Create Complaint')}
          </Button> */}
        </div>

        {/* Table */}
        <SortableTable
          columns={columnsComplaint}
          data={paginatedData}
          isFilterColumn={false}
        />

        {/* Pagination */}
        <DefaultPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default StudentComplaint;
