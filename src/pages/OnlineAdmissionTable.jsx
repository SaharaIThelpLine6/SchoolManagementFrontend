import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Button from '../components/Button/Button';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import SvgIcon from '../components/icons/SvgIcon';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { useGetUsersOnlineRegInfoQuery } from '../features/student/studentQuerySlice';
import bnBijoy2Unicode from '../utils/conveter';
import useTranslate from '../utils/Translate';
import OnlineAdmissionForm from '../view/students/admission/OnlineAdmissionForm';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const OnlineAdmissionTable = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: {
      pageSize: 10,
      applicationNo: '',
    },
  });

  const { watch } = methods;
  const applicationNo = watch('applicationNo');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const {
    data: apiData,
    isLoading,
    isError,
  } = useGetUsersOnlineRegInfoQuery({
    page: currentPage,
    limit: pageSize,
  });

  // State for selected filter
  const [selectedStatus, setSelectedStatus] = useState(null);

  const studentData = apiData?.data || [];
  const totalRecords = apiData?.total || 0;
  const totalPages = Math.ceil(totalRecords / pageSize);

  // Filter data based on selected status and application number
  const filteredData = useMemo(() => {
    let result = studentData;

    // Filter by status if selected
    if (selectedStatus !== null) {
      result = result.filter((student) => student.Status === selectedStatus);
    }

    // Filter by application number if entered
    if (applicationNo) {
      const searchTerm = applicationNo.toString().trim().toLowerCase();
      result = result.filter((student) =>
        student.UserCode.toString().toLowerCase().includes(searchTerm)
      );
    }

    return result;
  }, [studentData, selectedStatus, applicationNo]);

  const SUB_CLASS_OPTIONS = [
    { value: 0, label: 'ভর্তি অসম্পূর্ণ' },
    { value: 2, label: 'ভর্তি সম্পূর্ণ' },
    { value: 1, label: 'ইনঅ্যাক্টিভ' },
    { value: 3, label: 'সকল' },
  ];

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption.value === 3 ? null : selectedOption.value);
  };

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getGenderText = (genderId) => {
    return genderId === 1 ? 'Male' : 'Female';
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setSelectedStudent(null);
  };

  if (isLoading) return <Loading />;
  if (isError) return <div className="text-red-500">Error loading data</div>;

  const columns = [
    {
      title: translate('Action'),
      hozAlign: 'center',
      render: (row) => {
        const statusOption = SUB_CLASS_OPTIONS.find(
          (opt) => opt.value === row.Status
        );
        const statusText = statusOption?.label || 'অজানা';

        let textColor = 'text-gray-800';
        let bgColor = 'bg-gray-100';
        let buttonClass = '';

        switch (row.Status) {
          case 0:
            textColor = 'text-yellow-800';
            bgColor = 'bg-yellow-100';
            buttonClass = 'bg-yellow-500 hover:bg-yellow-600 text-white';
            break;
          case 1:
            textColor = 'text-red-800';
            bgColor = 'bg-red-100';
            break;
          case 2:
            textColor = 'text-green-800';
            bgColor = 'bg-green-100';
            break;
          case 3:
            textColor = 'text-blue-800';
            bgColor = 'bg-blue-100';
            break;
          default:
            textColor = 'text-gray-800';
            bgColor = 'bg-gray-100';
        }

        return (
          <div className="flex justify-center items-center gap-2">
            {row.Status === 0 ? (
              <Button
                onClick={() => handleEditStudent(row)}
                className={buttonClass}
              >
                {statusText}
              </Button>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-sm ${textColor} ${bgColor}`}
              >
                {statusText}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: translate('Sequential'),
      field: 'UserID',
      hozAlign: 'center',
      width: 80,
      render: (row) => <p>{row.UserID}</p>,
    },
    {
      title: translate('Application No'),
      field: 'UserCode',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{row.UserCode}</p>,
    },
    {
      title: translate('User Name'),
      field: 'UserName',
      hozAlign: 'center',
      width: 150,
      render: (row) => <p>{bnBijoy2Unicode(row.UserName)}</p>,
    },
    {
      title: translate('Father Name'),
      field: 'FatherName',
      hozAlign: 'center',
      width: 150,
      render: (row) => <p>{bnBijoy2Unicode(row.FatherName)}</p>,
    },
    {
      title: translate('Gender'),
      field: 'GenderID',
      hozAlign: 'center',
      width: 100,
      render: (row) => <p>{getGenderText(row.GenderID)}</p>,
    },
    {
      title: translate('Mobile'),
      field: 'Mobile1',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{row.Mobile1}</p>,
    },
    {
      title: translate('Village'),
      field: 'permanentVill',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{bnBijoy2Unicode(row.permanentVill)}</p>,
    },
    {
      title: translate('Post Office'),
      field: 'permanentPost',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{bnBijoy2Unicode(row.permanentPost)}</p>,
    },
    {
      title: translate('Date of Birth'),
      field: 'DateOfBirth',
      hozAlign: 'center',
      width: 120,
      render: (row) => <p>{row.DateOfBirth}</p>,
    },
  ];

  return (
    <>
      {!showForm && (
        <FormProvider {...methods}>
          <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
            <div className="block w-full overflow-x-auto">
              <div className="flex flex-row justify-start items-center mb-4">
                <h3 className="font-SolaimanLipi text-[20px] font-bold">
                  {translate('Online Admission List')}
                </h3>
                {/* <Button onClick={handleNewAdmission}>New Admission</Button> */}
              </div>

              <div className="filter_header border-b border-[#e9edf4] flex flex-col sm:flex-row items-center justify-between sm:px-5 py-5 pt-0 sm:pt-5 mb-6">
                <div className="flex gap-3 flex-col sm:flex-row w-full sm:w-auto py-3">
                  <DefaultSelect
                    options={SUB_CLASS_OPTIONS}
                    nameField={'label'}
                    valueField={'value'}
                    registerKey={'statusFilter'}
                    label={translate('')}
                    onChange={handleStatusChange}
                  />
                  <DefaultInput
                    type="text"
                    registerKey="applicationNo"
                    placeholder="সার্চ করুন..."
                  />
                </div>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Show:</span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm">entries</span>
                  </div>
                </div>
              </div>

              <SortableTable
                columns={columns}
                data={filteredData}
                isFilterColumn={false}
              />

              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, totalRecords)} of{' '}
                  {totalRecords} entries
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SvgIcon name={'MdKeyboardArrowLeft'} size={18} />
                    Previous
                  </button>

                  <span className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <SvgIcon name={'MdKeyboardArrowRight'} size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FormProvider>
      )}

      {selectedStudent && (
        <OnlineAdmissionForm
          studentData={selectedStudent}
          onBack={handleBackToList}
        />
      )}
    </>
  );
};

export default OnlineAdmissionTable;
