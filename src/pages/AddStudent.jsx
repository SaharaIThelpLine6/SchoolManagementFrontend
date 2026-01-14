import 'flatpickr/dist/themes/light.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import Button from '../components/Button/Button';
import DropdownDefault from '../components/Dropdowns/DropdownDefault';
import AdmissionForm from '../components/Forms/AdmissionForm';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { permissionsDataList } from '../Data/permissions';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetFilteredAdmissionStudentsQuery } from '../features/student/studentQuerySlice';
import { fetchUserOnlyStudentData } from '../features/student/studentSlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const AddStudent = ({ pageTitle }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { watch, setValue, reset } = methods;
  const [FilterID, SessionID] = watch(['FilterID', 'SessionID']);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const filters = methods.watch();

  // FilterID change হলে currentFilters update করুন
  useEffect(() => {
    if (FilterID) {
      setCurrentFilters({
        FilterID: FilterID,
        UserCode: '',
        UserName: '',
        Mobile1: '',
        SessionID: null,
        SubClassID: null,
        AdmissionSerial: '',
      });
    }
  }, [FilterID]);

  const {
    data: filteredStudents,
    isLoading,
    isError,
    refetch,
  } = useGetFilteredAdmissionStudentsQuery(currentFilters, {
    skip: !currentFilters.FilterID,
    refetchOnMountOrArgChange: true,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenChangeClassModal = useCallback((id) => {
    showModal('Change Student Class', 'CHANGE_STUDENT_CLASS', id);
  }, []);

  useEffect(() => {
    if (FilterID !== 4 && FilterID !== 6) {
      setValue('SessionID', null);
      setValue('SubClassID', null);
    }
  }, [FilterID, setValue]);

  useEffect(() => {
    if (filter == 2) {
      dispatch(fetchUserOnlyStudentData());
    }
    dispatch(setPageName(pageTitle));
  }, [dispatch, location, pageTitle, filter]);

  // Search handler function
  const handleSearch = () => {
    const formValues = methods.getValues();
    setCurrentFilters({
      FilterID: formValues.FilterID,
      UserCode: formValues.UserID || '',
      UserName: formValues.UserName || '',
      Mobile1: formValues.Mobile1 || '',
      SessionID: formValues.SessionID || null,
      SubClassID: formValues.SubClassID || null,
      AdmissionSerial: formValues.AdmissionSerial || '',
    });
  };

  // Reset filter function
  const resetFilter = () => {
    reset({
      FilterID: '',
      UserID: '',
      UserName: '',
      Mobile1: '',
      SessionID: null,
      SubClassID: null,
      AdmissionSerial: '',
    });
    setCurrentFilters({});
  };
  const usersData = filteredStudents?.data || [];
  const exportToCSV = () => {
    if (selectedDateRange.length !== 2) {
      alert('Please select a valid date range before exporting.');
      return;
    }

    const [startDate, endDate] = selectedDateRange;
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const dataToExport = filteredStudents?.data;
    const filteredData = dataToExport?.filter((student) => {
      const studentDate = new Date(student.CreateAt).setHours(0, 0, 0, 0);
      return studentDate >= start && studentDate <= end;
    });

    if (!filteredData || filteredData.length === 0) {
      alert('No data found for the selected date range.');
      return;
    }

    const customHeaders = [
      [
        'User ID',
        'Admission No / Roll No',
        'Student ID',
        'Name',
        'Class',
        'Section',
        'Gender',
        'Date of Join',
        'Payment Status',
        'Status',
      ],
    ];

    const formattedData = filteredData.map((student) => [
      student.UserID,
      student.AdmissionID || 'N/A',
      student.StudentCode || student.UserCode || 'N/A',
      student.StudentName || student.UserName || 'N/A',
      student.ClassName || 'N/A',
      student.SubClass || 'N/A',
      student.GenderID === 1
        ? 'Male'
        : student.GenderID === 2
        ? 'Female'
        : 'Other',
      new Date(student.CreateAt).toLocaleDateString('en-GB'),
      student.AdmissionStatus === 0
        ? 'Pending'
        : student.AdmissionStatus === 1
        ? 'Paid'
        : student.AdmissionStatus === 2
        ? 'Free'
        : 'Unpaid',
      student.SessionAction === 0
        ? 'Pending'
        : student.SessionAction === 1
        ? 'Active'
        : 'N/A',
    ]);

    const finalCSVData = [...customHeaders, ...formattedData];
    const ws = utils.aoa_to_sheet(finalCSVData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Students');
    writeFile(wb, 'students_list.csv', { bookType: 'csv' });
  };
  // 🔹 Pagination
  const totalPages = Math.ceil(usersData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return usersData.slice(start, start + PAGE_SIZE);
  }, [usersData, currentPage]);
  const columnsAdmitedStudent = [
    {
      title: 'Student Id',
      field: 'StudentCode',
      hozAlign: 'center',
      type: 'text',
      filterable: true,
    },
    { title: 'Name', field: 'StudentName' },
    { title: 'Class', field: 'ClassName', hozAlign: 'center' },
    { title: 'Section', field: 'SubClass', hozAlign: 'center' },
    {
      title: 'Gender',
      field: 'GenderID',
      hozAlign: 'center',
      render: (row) => {
        const genderMap = {
          1: 'Male',
          2: 'Female',
          3: 'Other',
        };
        return genderMap[row.GenderID] || 'N/A';
      },
    },
    {
      title: 'Date of join',
      field: 'CreateAt',
      hozAlign: 'center',
      type: 'range',
      filterable: true,
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB');
      },
    },
    {
      title: 'Session',
      field: 'SessionName',
      hozAlign: 'center',
      filterable: true,
    },
    {
      title: 'Admission Payment status',
      field: 'AdmissionStatus',
      hozAlign: 'center',
      type: 'select',
      filterable: true,
      options: [
        { label: 'Pending', value: 0 },
        { label: 'Paid', value: 1 },
        { label: 'Free', value: 2 },
        { label: 'Unpaid', value: 3 },
      ],
      render: (row) => {
        switch (row.AdmissionStatus) {
          case 0:
            return (
              <p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
                Pending
              </p>
            );
          case 1:
            return (
              <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                Paid
              </p>
            );
          case 2:
            return (
              <p className="inline-flex rounded-lg bg-info bg-opacity-10 px-3 py-1 text-sm font-medium text-info">
                Free
              </p>
            );
          case 3:
            return (
              <p className="inline-flex rounded-lg bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">
                Unpaid
              </p>
            );
          default:
            return row.AdmissionStatus;
        }
      },
    },
    {
      title: 'Status',
      field: 'SessionAction',
      hozAlign: 'center',
      render: (row) => {
        switch (row.SessionAction) {
          case 0:
            return (
              <p className="inline-flex rounded-lg bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
                Pending
              </p>
            );
          case 1:
            return (
              <p className="inline-flex rounded-lg bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
                Active
              </p>
            );
          default:
            return row.AdmissionStatus;
        }
      },
    },
    {
      title: 'Action',
      field: 'SessionSerial',
      hozAlign: 'center',
      render: (row) => (
        <div>
          <DropdownDefault>
            <ViewPermission
              permissionId={permissionsDataList.student_class_change}
              permissionType="insert|edit"
            >
              <button
                className="flex w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm hover:bg-gray"
                onClick={() => {
                  handleOpenChangeClassModal(row.UserID);
                }}
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
                  className="icon icon-tabler icons-tabler-outline icon-tabler-transfer"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M20 10h-16l5.5 -6" />
                  <path d="M4 14h16l-5.5 6" />
                </svg>
                Change Class
              </button>
            </ViewPermission>
          </DropdownDefault>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <div>Error loading data!</div>;
  }

  const filterData = [
    { FilterID: 1, name: translate('User ID') },
    { FilterID: 2, name: translate('User Name') },
    { FilterID: 3, name: translate('Mobile1') },
    { FilterID: 4, name: translate('Session') },
    { FilterID: 5, name: translate('Class') },
    { FilterID: 6, name: translate('ID Serial Admission') },
  ];

  return (
    <FormProvider {...methods}>
      <div className="-translate-y-4 font-SolaimanLipi">
        <div className="block w-full overflow-x-auto mt-5">
          <AdmissionForm />
          <div className="rounded-xl border bg-white p-4 shadow-sm mt-3">
            <div className="grid grid-cols-1 md:grid-cols-5 my-5 gap-3">
              <DefaultSelect
                label={translate('Filter')}
                labelPosition="left"
                options={filterData}
                valueField="FilterID"
                nameField="name"
                registerKey="FilterID"
              />

              {/* FilterID: 1 → User ID */}
              {Number(FilterID) === 1 && (
                <DefaultInput
                  registerKey="UserID"
                  placeholder="শিক্ষার্থীর আইডি লিখুন"
                />
              )}

              {/* FilterID: 2 → User Name */}
              {Number(FilterID) === 2 && (
                <DefaultInput
                  registerKey="UserName"
                  placeholder="শিক্ষার্থীর নাম লিখুন"
                />
              )}

              {/* FilterID: 3 → Mobile */}
              {Number(FilterID) === 3 && (
                <DefaultInput
                  registerKey="Mobile1"
                  placeholder="মোবাইল নাম্বার লিখুন"
                />
              )}

              {/* FilterID: 4 → Session */}
              {Number(FilterID) === 4 && (
                <>
                  <DefaultSelect
                    options={sessionData ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    registerKey="SessionID"
                  />

                  {SessionID && Number(SessionID) > 0 && (
                    <DefaultSelect
                      options={subClassData ?? []}
                      valueField="SubClassID"
                      nameField="SubClass"
                      registerKey="SubClassID"
                      unicode
                    />
                  )}
                </>
              )}

              {/* FilterID: 6 → Session with Admission Serial */}
              {Number(FilterID) === 6 && (
                <>
                  <DefaultSelect
                    options={sessionData ?? []}
                    valueField="SessionID"
                    nameField="SessionName"
                    registerKey="SessionID"
                  />

                  {SessionID && Number(SessionID) > 0 && (
                    <>
                      <DefaultSelect
                        options={subClassData ?? []}
                        valueField="SubClassID"
                        nameField="SubClass"
                        registerKey="SubClassID"
                        unicode
                      />

                      <DefaultInput
                        registerKey="AdmissionSerial"
                        placeholder="Admission Serial লিখুন"
                      />
                    </>
                  )}
                </>
              )}

              {/* FilterID: 5 → Only Class/Subclass */}
              {Number(FilterID) === 5 && (
                <DefaultSelect
                  options={subClassData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode
                />
              )}

              {/* Search Button */}
              <Button onClick={handleSearch} disabled={!FilterID}>
                {translate('Search')}
              </Button>
            </div>

            {/* Clear Filter Button */}
            <div className="mb-4">
              <Button
                onClick={resetFilter}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                {translate('Clear Filter')}
              </Button>
            </div>

            {filteredStudents?.data && filteredStudents?.data.length > 0 ? (
              <div className="">
                <SortableTable
                  columns={columnsAdmitedStudent}
                  data={paginatedData}
                />
                <div className="flex justify-center mt-4">
                  <DefaultPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            ) : currentFilters.FilterID ? (
              <div className="text-center py-4">
                {translate('No data found')}
              </div>
            ) : (
              <div className="text-center py-4">
                {translate('Please select a filter and click Search')}
              </div>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default AddStudent;
