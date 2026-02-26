import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetExamFeeSettingQuery } from '../features/exam/examQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import bnBijoy2Unicode from '../utils/conveter';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const BalanceTransfer = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();

  const [currentPage, setCurrentPage] = useState(1);
  // Create an array to track visibility for each select (12 columns)

  const {
    data: examFeeSettingData,
    isLoading: isExamFeeSettingLoading,
    isError: isExamFeeSettingError,
    refetch,
  } = useGetExamFeeSettingQuery();

  const totalPages = Math.ceil((examFeeSettingData?.length || 0) / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examFeeSettingData?.slice(start, start + PAGE_SIZE) || [];
  }, [examFeeSettingData, currentPage]);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // Update Handle
  const handleEdit = (row) => {
    showModal('Balance Transfer Update', 'BALANCE_TRANSFER_UPDATE');

    // methods.reset({
    //   ID: row.ID,
    //   SessionID: row.SessionID,
    //   ExamID: row.ExamID,
    //   SubClassID: row.SubClassID,
    //   Fee: row.Fee,
    //   SLID: row.SLID,
    // });
  };
  const handleOpenModal = useCallback(() => {
    showModal('Balance Transfer Create', 'BALANCE_TRANSFER');
  }, []);

  // Table Data Columns
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.balance_transfer}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEdit(row)} />
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.balance_transfer}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDelete(row)} />
          </ViewPermission>
        </div>
      ),
    },
    {
      title: (
        <div className="flex items-center justify-center gap-1">
          <SvgIcon name={'GrDrag'} size={16} />
        </div>
      ),
      hozAlign: 'center',
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate('ID'),
      hozAlign: 'center',
      render: (row) => <>{row?.ID}</>,
    },
    {
      title: translate('Account'),
      hozAlign: 'center',
      render: (row) => <>{row?.AcademicSession?.SessionName}</>,
    },
    {
      title: translate('Date'),
      hozAlign: 'center',
      render: (row) => <>{bnBijoy2Unicode(row?.Exam_Name?.ExamName)}</>,
    },
    {
      title: translate('Comments'),
      hozAlign: 'center',
      render: (row) => <>{bnBijoy2Unicode(row?.Class?.SubClass)}</>,
    },
    {
      title: translate('Deposit'),
      field: 'SLID',
      hozAlign: 'center',
    },
    {
      title: translate('Withdraw'),
      field: 'SLID',
      hozAlign: 'center',
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg md:text-xl font-bold">
          {translate('Balance Transafer')}
        </h3>
        <ViewPermission
          permissionId={permissionsDataList.balance_transfer}
          permissionType="insert"
        >
          <Button onClick={handleOpenModal}>
            {translate('Create Balance Transfer')}
          </Button>
        </ViewPermission>
      </div>
      {/* Table Section */}
      <div className="mt-5 overflow-x-auto">
        {isExamFeeSettingLoading ? (
          <Loading />
        ) : isExamFeeSettingError ? (
          <div className="text-red-500 text-center py-4">
            {translate('Failed to load exam fee settings. Please try again.')}
          </div>
        ) : (
          <SortableTable
            columns={columns}
            data={paginatedData}
            isFilterColumn={false}
          />
        )}
      </div>

      {/* Pagination */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default BalanceTransfer;
