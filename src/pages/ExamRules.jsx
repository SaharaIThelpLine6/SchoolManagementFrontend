import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

import Button from '../components/Button/Button';
import DeleteButton from '../components/Button/DeleteButton';
import EditButton from '../components/Button/EditButton';
import ViewButton from '../components/Button/ViewButton';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import {
  useDeleteExamRuleMutation,
  useGetExamRulesQuery,
} from '../features/exam/examQuerySlice';

const PAGE_SIZE = 10;

const ExamRules = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();

  const {
    data: examRulesData = [],
    isSVTError,
    isSVTLoading,
  } = useGetExamRulesQuery();

  const [
    deleteExamRule,
    { isLoading: isDeleteLoading, isError: isDeleteError },
  ] = useDeleteExamRuleMutation();

  const searchParams = new URLSearchParams(location.search);
  const filter = parseInt(searchParams.get('filter') || '0');

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(examRulesData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examRulesData.slice(start, start + PAGE_SIZE);
  }, [examRulesData, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Exam rule create'), 'CREATE_EXAM_RULE');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Exam rule update'), 'UPDATE_EXAM_RULE', id);
    },
    [translate]
  );
  const handleViewOpenModal = useCallback(
    (id) => {
      showModal(translate('Exam rule view'), 'VIEW_EXAM_RULE', id);
    },
    [translate]
  );

  const handleDelete = useCallback(
    async (ERID) => {
      Swal.fire({
        title: translate('Are you sure?'),
        text: translate('This action will permanently delete the exam rule.'),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: translate('Yes, delete it!'),
        cancelButtonText: translate('Cancel'),
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteExamRule(ERID).unwrap();
            Swal.fire(
              translate('Deleted!'),
              translate('The exam rule has been removed.'),
              'success'
            );
          } catch (error) {
            Swal.fire(
              translate('Error!'),
              translate('Failed to delete the exam rule.'),
              'error'
            );
          }
        }
      });
    },
    [deleteExamRule, translate]
  );

  if (isSVTLoading) return <Loading />;
  if (isSVTError)
    return <p className="text-red-500">Failed to load exam rule data</p>;

  const columns = [
    {
      title: translate('Action'),
      field: 'ERID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpenModal(row.ERID)} />
          <DeleteButton onClick={() => handleDelete(row.ERID)} />
          <ViewButton onClick={() => handleViewOpenModal(row.ERID)} />
        </div>
      ),
    },
    {
      title: translate('ID'),
      field: 'ERID',
      hozAlign: 'center',
      render: (row) => <p>{row.ERID}</p>,
    },
    {
      title: translate('Rule Name'),
      field: 'ExamRule',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center">
          <p className="truncate w-60 text-center">{row.ExamRule}</p>
        </div>
      ),
    },

    {
      title: translate('Created At'),
      field: 'CreateAt',
      hozAlign: 'center',
      render: (row) =>
        row.CreateAt ? new Date(row.CreateAt).toLocaleString() : '-',
    },
    {
      title: translate('Updated At'),
      field: 'UpdateAt',
      hozAlign: 'center',
      render: (row) =>
        row.UpdateAt ? new Date(row.UpdateAt).toLocaleString() : '-',
    },
  ];

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
          <h3 className="font-SolaimanLipi text-[20px] font-bold">
            {translate('Exam Rules')}
          </h3>
          <Button onClick={() => handleOpenModal()}>
            {translate('Create')}
          </Button>
        </div>

        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
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

export default ExamRules;
