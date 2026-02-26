import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import SortableTable from '../../components/Tables/SortableTable';
import { setPageName } from '../../features/auth/authSlice';

import Loading from '../../components/Loading/Loading';
import { permissionsDataList } from '../../Data/permissions';
import { fetchSettingsData } from '../../features/settings/settingsSlice';
import {
  useDeleteStudentsVacationMutation,
  useGetStudentsVacationListQuery,
} from '../../features/student/studentQuerySlice';
import { formatTime } from '../../helper/formatTime';
import { ViewPermission } from '../../Routes/ViewPermission';
import bnBijoy2Unicode from '../../utils/conveter';
import { showModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import Button from '../Button/Button';
import DeleteButton from '../Button/DeleteButton';
import EditButton from '../Button/EditButton';
import SvgIcon from '../icons/SvgIcon';
import DefaultPagination from '../Pagination/DefaultPagination';
import Print from './Print';

const StudentVacationListTable = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [currentPage, setCurrentPage] = useState(1);
  const [printID, setPrintID] = useState(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  const {
    data: getStudentsVacationList,
    error: studentsVacationListError,
    isLoading: isStudentsVacationListLoading,
  } = useGetStudentsVacationListQuery({ page: currentPage, limit: 10 });

  const { academicSession } = useSelector((state) => state.settings);

  const [deleteStudentsVacation, { isLoading, isSuccess, isError, error }] =
    useDeleteStudentsVacationMutation();

  // Process data with session names and maintain pagination info
  const {
    processedData,
    totalPages,
    currentPage: serverPage,
  } = useMemo(() => {
    const apiData = getStudentsVacationList || {};

    // Process vacation data with flattened structure
    const processed =
      apiData.data?.map((vacation) => {
        // Find matching academic session
        const session = academicSession?.find(
          (s) => s.SessionID === vacation.SessionID
        );

        return {
          ...vacation,
          // Flatten user properties
          UserCode: vacation.User?.UserCode || 'N/A',
          UserName: vacation.User?.UserName || 'N/A',
          // Add session name
          sessionName: session?.SessionName || 'N/A',
          // Remove the nested User object if you want
          ...(vacation.User && { User: undefined }), // Optional: remove nested object
        };
      }) || [];

    return {
      processedData: processed,
      totalPages: apiData.totalPages || 1,
      currentPage: apiData.currentPage || 1,
    };
  }, [getStudentsVacationList, academicSession]);

  // Function to handle print button click
  const handlePrint = useCallback((id) => {
    setPrintID(id);
    setShouldPrint(true);
  }, []);

  useEffect(() => {
    if (shouldPrint && printID !== null) {
      const timer = setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [shouldPrint, printID]);

  // Set page title and fetch settings
  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (!academicSession.length) {
      dispatch(fetchSettingsData());
    }
  }, [dispatch, pageTitle, academicSession.length]);
  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleDelete = useCallback(
    (id) => {
      console.log(id, 'id');
      Swal.fire({
        title: translate('Are you sure?'),
        text: translate(
          'This action will permanently delete the student vacation.'
        ),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: translate('Yes, delete it!'),
        cancelButtonText: translate('Cancel'),
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteStudentsVacation(id).unwrap();

            Swal.fire({
              icon: 'success',
              title: translate('Deleted!'),
              text: translate('The record has been removed.'),
              confirmButtonColor: '#3085d6',
              confirmButtonText: translate('OK'),
            });

            // ✅ এখানে চাইলে refetch বা state update করতে পারো
          } catch (err) {
            Swal.fire({
              icon: 'error',
              title: translate('Error!'),
              text: translate('Failed to delete the record.'),
              confirmButtonColor: '#3085d6',
            });
            console.error(err);
          }
        }
      });
    },
    [translate, deleteStudentsVacation]
  );

  const handleOpenModal = useCallback(() => {
    showModal(translate('Create Student Vacation Info'), 'ADD_STUDENTVACATION');
  }, [translate]);

  const handleEditOpenModal = useCallback(
    (id) => {
      showModal(
        translate('Update Student Vacation Info'),
        'EDIT_STUDENTVACATION',
        id
      );
    },
    [translate]
  );

  if (isStudentsVacationListLoading) return <Loading />;

  if (studentsVacationListError) {
    Swal.fire({
      icon: 'error',
      title: translate('Failed to load student vacation list'),
      text: translate('Please try again later.'),
      confirmButtonColor: '#d33',
      confirmButtonText: translate('OK'),
    });
    return null;
  }

  const columns = [
    {
      title: translate('Action'),
      field: 'ID',
      hozAlign: 'center',
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <ViewPermission
            permissionId={permissionsDataList.gate_pass_leave}
            permissionType="edit"
            empty={true}
          >
            <EditButton onClick={() => handleEditOpenModal(row.ID)} />
          </ViewPermission>
          <ViewPermission
            permissionId={permissionsDataList.gate_pass_leave}
            permissionType="delete"
            empty={true}
          >
            <DeleteButton onClick={() => handleDelete(row.ID)} />
          </ViewPermission>

          <button
            className="p-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-md"
            title={translate('Print')}
            onClick={() => handlePrint(row.ID)}
          >
            <SvgIcon name={'MdLocalPrintshop'} size={20} />
          </button>
        </div>
      ),
    },
    {
      title: translate('User Code'), // User Code in Bengali
      field: 'UserCode',
      hozAlign: 'center',
      filterable: true,
      type: 'text',
    },
    {
      title: translate('Student Name'),
      field: 'UserName',
      hozAlign: 'center',
      filterable: true,
      type: 'text',
      render: (row) => <p>{bnBijoy2Unicode(row.UserName)}</p>,
    },
    {
      title: translate('Class/Jamaat'),
      field: 'ClassName',
      hozAlign: 'center',
      render: (row) => <p>{row.AcademicClass?.ClassName}</p>,
    },
    {
      title: translate('Vacation Type'),
      field: 'VacationType.VacationList',
      hozAlign: 'center',
      render: (row) => <p>{row.VacationType?.VacationList}</p>,
    },
    {
      title: translate('From Date'),
      field: 'VacationDateFrom',
      hozAlign: 'center',
      formatter: (cell) =>
        new Date(cell.getValue()).toLocaleDateString('bn-BD'),
    },
    {
      title: translate('Up to date'),
      field: 'VacationDateTo',
      hozAlign: 'center',
      formatter: (cell) =>
        new Date(cell.getValue()).toLocaleDateString('bn-BD'),
    },
    {
      title: translate('From Time'),
      field: 'VacationTimeFrom',
      hozAlign: 'center',
      render: (row) => {
        return formatTime(row.VacationTimeFrom);
      },
    },
    {
      title: translate('Be Time'),
      field: 'VacationTimeTo',
      hozAlign: 'center',
      render: (row) => {
        return formatTime(row.VacationTimeTo);
      },
    },
    {
      title: translate('Session'),
      field: 'sessionName',
      hozAlign: 'center',
      formatter: (cell) => cell.getValue() || '-',
      filterable: true,
      type: 'text',
      // options: academicSession.map((session) => ({
      //   value: session.SessionID,
      //   label: session.SessionName,
      // })),
    },
    {
      title: translate('Comment'),
      field: 'Comment',
      hozAlign: 'center',
      render: (row) => (
        <div className="w-[200px] whitespace-pre-wrap">
          <p>{row.Comment}</p>
        </div>
      ),
    },
    {
      title: translate('UserHolidayNo'),
      field: 'UserHolidayNo',
      hozAlign: 'center',
    },
  ];

  return (
    <div className="">
      <div className="print:hidden font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
            <div className="w-full flex flex-col gap-5 mb-3">
              <div className="flex justify-between w-full gap-5 sm:gap-0 items-center">
                {/* Left Buttons */}
                <h3 className="font-SolaimanLipi text-[20px] font-bold">
                  {translate('List of holidays')}
                </h3>
                <ViewPermission
                  permissionId={permissionsDataList.gate_pass_leave}
                  permissionType="insert"
                >
                  <Button
                    onClick={handleOpenModal}
                    className="bg-[#007af7] text-white hover:bg-blue-600"
                  >
                    {translate('Create Vacation')}
                  </Button>
                </ViewPermission>
              </div>
            </div>
          </div>

          <SortableTable columns={columns} data={processedData} />

          <DefaultPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {printID && (
        <div className="print-canvus hidden print:block">
          <Print id={printID} />
        </div>
      )}
    </div>
  );
};

export default StudentVacationListTable;
