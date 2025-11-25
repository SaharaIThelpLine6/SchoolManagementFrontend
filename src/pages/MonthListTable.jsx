import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '../components/Button/Button';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { months } from '../Data/monthsData';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetMonthListQuery } from '../features/months/montListSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const MonthListTable = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const { data: monthsList = [], isLoading, isError } = useGetMonthListQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(monthsList.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return monthsList.slice(start, start + PAGE_SIZE);
  }, [monthsList, currentPage]);

  const handleOpenModal = useCallback(() => {
    showModal(translate('Create month names'), 'ADD_MONTHNAMES');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(translate('Update month names'), 'EDIT_MONTHNAMES', id);
    },
    [translate]
  );

  if (isLoading) return <Loading />;
  if (isError)
    return <p className="text-red-500">Failed to load month list data</p>;

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const monthColumns = months.map((month, index) => ({
    title: translate(month),
    field: `Month${index + 1}`,
    hozAlign: 'center',
  }));
  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.month_name}
            permissionType="edit"
          >
            <button
              className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
              title="Edit"
              onClick={() => handleEditOpenModal(row.ID)}
            >
              <SvgIcon name={'FiEdit'} size={20} />
            </button>
          </ViewPermission>
        </div>
      ),
    },
    { title: translate('Session'), field: 'sessionName', hozAlign: 'center' },
    { title: translate('Class'), field: 'ClassName', hozAlign: 'center' },
    ...monthColumns,
  ];

  return (
    <div className="p-4 font-lato bg-white md:p-4 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4 border-b border-[#e9edf4] py-5 pt-0">
        <h3 className="text-xl font-bold">
          {pageTitle || translate('Months list table')}
        </h3>
        <ViewPermission
          permissionId={permissionsDataList.month_name}
          permissionType="insert"
        >
          <Button onClick={handleOpenModal}>
            {translate('Months create')}
          </Button>
        </ViewPermission>
      </div>

      <SortableTable columns={columns} data={paginatedData} />

      {/* Pagination Controls */}
      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default MonthListTable;
