import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import FilterSelectGroup from '../components/Forms/SelectGroup/FilterSelectGroup';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { fetchUserOnlyStudentData } from '../features/student/studentSlice';
// import { Modal } from "../components/ModalSettings";
import 'flatpickr/dist/themes/light.css';
import { FormProvider, useForm } from 'react-hook-form';
import DropdownDefault from '../components/Dropdowns/DropdownDefault';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import { permissionsDataList } from '../Data/permissions';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import {
  useGetStudentQuery,
  useGetStudentsAdmissionDataQuery,
} from '../features/student/studentQuerySlice';
import { ViewPermission } from '../Routes/ViewPermission';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const AddStudent = ({ pageTitle }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const [FilterID, SessionID] = watch(['FilterID', 'SessionID']);
  console.log(FilterID, 'FilterID');
  const [selectedImage, setSelectedImage] = useState(null);
  const {
    data: userOnlyStudents,
    isLoading,
    isError,
    error,
  } = useGetStudentsAdmissionDataQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const location = useLocation();
  const dispatch = useDispatch();
  const searchParams = new URLSearchParams(location.search);
  const filter = searchParams.get('filter');
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const [selectedDateRange, setSelectedDateRange] = useState([]);
  const { data: studentList, error: studentListError } = useGetStudentQuery();
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
  const handleOpenModal = useCallback((id) => {
    showModal('Admission Details', 'ADD_STUDENT', id);
  }, []);

  const handleOpenChangeClassModal = useCallback((id) => {
    showModal('Change Student Class', 'CHANGE_STUDENT_CLASS', id);
  }, []);
  // const handleFeeCollectionModal = useCallback((id) => {
  //   showModal("Fee Collection", "FEE_COLLECTION", id);
  // }, []);

  useEffect(() => {
    if (filter == 2) {
      dispatch(fetchUserOnlyStudentData());
    }
    dispatch(setPageName(pageTitle));
  }, [dispatch, location]);

  const exportToCSV = () => {
    if (selectedDateRange.length !== 2) {
      alert('Please select a valid date range before exporting.');
      return;
    }

    const [startDate, endDate] = selectedDateRange;

    // Convert selected dates to comparable formats (YYYY-MM-DD)
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    // Get data from the Redux store based on filter
    const dataToExport = filter == 2 ? userOnlyStudents : studentList;

    // Filter data based on the CreateAt date
    const filteredData = dataToExport.filter((student) => {
      const studentDate = new Date(student.CreateAt).setHours(0, 0, 0, 0);
      return studentDate >= start && studentDate <= end;
    });

    if (filteredData.length === 0) {
      alert('No data found for the selected date range.');
      return;
    }

    // Define custom headers
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

    // Convert filtered data to match custom headers
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

    // Merge headers with data
    const finalCSVData = [...customHeaders, ...formattedData];

    // Convert array to worksheet
    const ws = utils.aoa_to_sheet(finalCSVData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Students');

    // Export as CSV file
    writeFile(wb, 'students_list.csv', { bookType: 'csv' });
  };

  const columnsAdmitedStudent = [
    // { title: "User Id", field: "UserID", hozAlign: 'center' },
    // { title: "Admission No / Roll No", field: "AdmissionID", hozAlign: 'center' },
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
  const columnsNotAdmitedStudent = [
    // { title: "User Id", field: "UserID", hozAlign: 'center' },
    { title: 'Student Id', field: 'UserCode', hozAlign: 'center' },
    { title: 'Name', field: 'UserName' },
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
      render: (row) => {
        return new Date(row.CreateAt).toLocaleDateString('en-GB');
      },
    },
    {
      title: 'Action',
      field: 'SessionSerial',
      hozAlign: 'center',
      render: (row) => (
        <>
          <ViewPermission
            permissionId={permissionsDataList.student_admission}
            permissionType="insert"
            empty={true}
          >
            <button
              onClick={() => {
                handleOpenModal(row.UserID);
              }}
              className="px-4 py-2 bg-rose-500 text-white rounded"
            >
              {translate('Complete Admission')}
            </button>
          </ViewPermission>
        </>
      ),
    },
  ];
  // console.log(studentList);

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
      <div className="-translate-y-4 font-lato">
        <div className="block w-full overflow-x-auto">
          <div className="filter_header border-b  border-[#e9edf4] flex items-center justify-between px-5 py-5 mb-6">
            <h3 className="font-SolaimanLipi text-[20px] font-bold ">
              {filter == 2
                ? translate('Not Admitted Students List')
                : translate('Admitted Students List')}
            </h3>
            <div className="flex items-center space-x-5">
              <div className="filter relative">
                {/* <SelectGroupTwo /> */}
                {/* <button type="button" onClick={exportToCSV}>Export</button>
              <Flatpickr
                className="w-full h-[80%] px-2 py-1 outline-1 border border-gray-300 outline-theme-color rounded-[5px] text-xs font-normal"
                options={{
                  mode: "range",
                  dateFormat: "Y-m-d"
                }}
                onChange={(selectedDates) => setSelectedDateRange(selectedDates)}
              /> */}

                <FilterSelectGroup
                  defaultSelect={filter}
                  options={[
                    { id: 0, value: translate('Admitted students') },
                    { id: 2, value: translate('Not Admitted students') },
                  ]}
                  nameField={'value'}
                  valueField={'id'}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 mb-3 gap-3">
            <DefaultSelect
              label={translate('Filter')}
              labelPosition="left"
              options={filterData}
              valueField="FilterID"
              nameField="name"
              registerKey="FilterID"
            />
            {Number(FilterID) === 1 && (
              <DefaultInput
                registerKey="UserID"
                placeholder="শিক্ষার্থীর আইডি লিখুন"
              />
            )}
            {Number(FilterID) === 2 && (
              <DefaultInput
                registerKey="User Name"
                placeholder="শিক্ষার্থীর নাম লিখুন"
              />
            )}
            {Number(FilterID) === 3 && (
              <DefaultInput
                registerKey="Mobile1"
                placeholder="মোবাইল নাম্বার লিখুন"
              />
            )}
            {Number(FilterID) === 4 && (
              <DefaultSelect
                options={sessionData ?? []}
                valueField="SessionID"
                nameField="SessionName"
                registerKey="SessionID"
              />
            )}
            {SessionID && Number(SessionID) > 0 && (
              <DefaultSelect
                options={subClassData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode
              />
            )}
            {Number(FilterID) === 5 && (
              <DefaultSelect
                options={subClassData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode
              />
            )}
          </div>
          {studentList && studentList.data.length > 0 ? (
            <SortableTable
              columns={
                filter == 2 ? columnsNotAdmitedStudent : columnsAdmitedStudent
              }
              data={filter == 2 ? userOnlyStudents : studentList.data}
            />
          ) : (
            <Loading />
          )}
        </div>
      </div>
    </FormProvider>
  );
};
export default AddStudent;
