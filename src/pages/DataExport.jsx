import { Buffer } from 'buffer';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import * as XLSX from 'xlsx';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import Loading from '../components/Loading/Loading';
import DefaultPagination from '../components/Pagination/DefaultPagination';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { fetchSettingsData } from '../features/settings/settingsSlice';
import {
  useGetStudentBySearchQuery,
  useGetStudentsVacationTypeListQuery,
} from '../features/student/studentQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';

const PAGE_SIZE = 10;

const DataExport = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const [logo, setLogo] = useState(null);

  const [SessionID, SubClassID, NewOldId, ResidentialStatusId] = watch([
    'SessionID',
    'SubClassID',
    'NewOldId',
    'ResidentialStatusId',
  ]);
  const { residential, error: settingsError } = useSelector(
    (state) => state.settings
  );

  const {
    data: studentVacationTypeData = [],
    isError: isSVTError,
    isLoading: isSVTLoading,
  } = useGetStudentsVacationTypeListQuery();

  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: isSearchLoading,
  } = useGetStudentBySearchQuery(
    {
      SubClassID: SubClassID ? SubClassID : null,
      SessionID: SessionID ? SessionID : null,
      NewOldId: NewOldId ? NewOldId : null,
      ResidentialStatusId: ResidentialStatusId ? ResidentialStatusId : null,
    },
    {
      skip: !SessionID || !SubClassID || !ResidentialStatusId,
      refetchOnFocus: false,
    }
  );

  const processedStudentData = useMemo(() => {
    if (!searchStudentInfo || !searchStudentInfo.length) return [];

    return searchStudentInfo.map((student) => {
      let studentLogo = null;

      if (student.User?.UserImage?.Image?.data) {
        try {
          const buffer = Buffer.from(student.User.UserImage.Image.data);
          const base64String = buffer.toString('base64');
          studentLogo = `data:image/png;base64,${base64String}`;
        } catch (error) {
          console.error('Error processing logo:', error);
          studentLogo = null;
        }
      }

      return {
        AdmissionID: student.AdmissionID,
        UserID: student.UserID,
        StudentCode: student.User?.UserCode || '-',
        StudentName: student.User?.UserName || '-',
        FatherName: student.User?.FatherName || '-',
        MotherName: student.User?.MotherName || '-',
        Mobile1: student.User?.Mobile1 || '-',
        Mobile2: student.User?.Mobile2 || '-',
        Email: student.User?.Email || '-',
        DateOfBirth: student.User?.DateOfBirth || '-',
        NIDNO: student.User?.NIDNO || '-',
        BloodGroup: student.User?.BloodGroup || '-',
        GenderID: student.User?.GenderID || '-',
        SessionName: student.AcademicSession?.SessionName || '-',
        ClassName: student.Class?.ClassName || '-',
        SubClass: student.SubClass?.SubClass || '-',
        AdmissionSerial: student.AdmissionSerial || '-',
        NewOldId: student.NewOldId || '-',
        ResidentialStatusId: student.ResidentialStatusId || '-',
        ResidentialName: student.ResidentialStatusId === 1 ? 'আবাসিক' : 
                         student.ResidentialStatusId === 2 ? 'অনাবাসিক' : '-',
        permanentVill: student.User?.permanentVill || '-',
        permanentPost: student.User?.permanentPost || '-',
        PoliceStationName: student.User?.permanentPoliceStation?.PoliceStationName || '-',
        PermanentDistrictName: student.User?.permanentPoliceStation?.District?.DistrictName || '-',
        PermanentDivisionName: student.User?.permanentPoliceStation?.District?.Division?.DivisionName || '-',
        TransientVill: student.User?.TransientVill || '-',
        TransientPost: student.User?.TransientPost || '-',
        TransientPoliceStationName: student.User?.transientPoliceStation?.PoliceStationName || '-',
        TransientDistrictName: student.User?.transientPoliceStation?.District?.DistrictName || '-',
        TransientDivisionName: student.User?.transientPoliceStation?.District?.Division?.DivisionName || '-',
        logo: studentLogo,
        SFTID: student.SFTID,
        ExamAction: student.ExamAction,
        AdmissionStatus: student.AdmissionStatus,
        AdmissionAction: student.AdmissionAction,
        FinancialStatus: student.FinancialStatus || '-',
      };
    });
  }, [searchStudentInfo]);

  useEffect(() => {
    if (searchStudentInfo?.[0]?.User?.UserImage?.data) {
      try {
        const buffer = Buffer.from(searchStudentInfo[0].User.UserImage.data);
        const base64String = buffer.toString('base64');
        const imageSrc = `data:image/png;base64,${base64String}`;
        setLogo(imageSrc);
      } catch (error) {
        console.error('Error processing main logo:', error);
      }
    }
  }, [searchStudentInfo]);

  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassData, isLoading: subClassDataLoading, isError: subClassDataSuccess } = useGetSubClassListQuery();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
    dispatch(fetchSettingsData());
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [errors, setErrors] = useState({ filters: false });

  const allColumns = [
    { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
    { id: 'ID', label: 'ID', field: 'StudentCode' },
    { id: 'Name', label: 'Name', field: 'StudentName' },
    { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
    { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
    { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
    { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
    { id: 'E-mail', label: 'E-mail', field: 'Email' },
    { id: 'Session', label: 'Session', field: 'SessionName' },
    { id: 'Class', label: 'Class', field: 'ClassName' },
    { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
    { id: 'Admission Serial', label: 'Admission Serial', field: 'AdmissionSerial' },
    { id: 'Gender', label: 'Gender', field: 'GenderID' },
    { id: 'Residence', label: 'Residence', field: 'ResidentialName' },
    { id: 'New/Old', label: 'New/Old', field: 'NewOldId' },
    { id: 'Date Of Birth', label: 'Date of Birth', field: 'DateOfBirth' },
    { id: 'NID/Birth Registration', label: 'NID/Birth Registration', field: 'NIDNO' },
    { id: 'Blood Group', label: 'Blood Group', field: 'BloodGroup' },
    { id: 'permanentDivision', label: 'Permanent Division', field: 'PermanentDivisionName' },
    { id: 'permanentDistrict', label: 'Permanent District', field: 'PermanentDistrictName' },
    { id: 'permanentPoliceStation', label: 'Permanent Police Station', field: 'PoliceStationName' },
    { id: 'permanentPostOffice', label: 'Permanent Post Office', field: 'permanentPost' },
    { id: 'permanentVillage', label: 'Permanent Village', field: 'permanentVill' },
    { id: 'transientDivision', label: 'Transient Division', field: 'TransientDivisionName' },
    { id: 'transientDistrict', label: 'Transient District', field: 'TransientDistrictName' },
    { id: 'transientPoliceStation', label: 'Transient Police Station', field: 'TransientPoliceStationName' },
    { id: 'transientPostOffice', label: 'Transient Post Office', field: 'TransientPost' },
    { id: 'transientVillage', label: 'Transient Village', field: 'TransientVill' },
    { id: 'Financial Status', label: 'Financial Status', field: 'FinancialStatus' },
  ];

  const handleColumnToggle = useCallback((columnId) => {
    setSelectedColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  }, []);

  const validateFilters = useCallback(() => {
    const { SessionID, SubClassID, ResidentialStatusId } = methods.getValues();
    const isValid = SessionID && SubClassID && ResidentialStatusId;
    setErrors((prev) => ({ ...prev, filters: !isValid }));
    return isValid;
  }, [methods]);

  const filteredStudentData = useMemo(() => {
    if (!processedStudentData || !processedStudentData.length) return [];

    return processedStudentData.map((student) => {
      const filteredStudent = {};
      allColumns.forEach((col) => {
        if (selectedColumns.includes(col.id)) {
          const value = student[col.field];
          filteredStudent[col.id] = value !== undefined && value !== null && value !== '' ? value : '-';
        }
      });
      return filteredStudent;
    });
  }, [processedStudentData, selectedColumns, allColumns]);

  const dynamicColumns = useMemo(() => {
    return allColumns
      .filter((col) => selectedColumns.includes(col.id))
      .map((col) => {
        if (col.id === 'logo') {
          return {
            title: translate(col.label),
            field: col.id,
            hozAlign: 'center',
            headerHozAlign: 'center',
            width: 80,
            render: (row) =>
              row[col.id] && row[col.id] !== '-' ? (
                <div className="flex justify-center items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
                    <img
                      src={row[col.id]}
                      alt="Student Logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement.querySelector(
                          '.no-img'
                        ).style.display = 'block';
                      }}
                    />
                    <span className="no-img hidden text-gray-400 text-[10px]">
                      No Image
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center">
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-[10px] overflow-hidden">
                    <img
                      src={`/avatar.png`}
                      alt="Student Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ),
          };
        }
        return {
          title: translate(col.label),
          field: col.id,
          hozAlign: 'center',
          headerHozAlign: 'center',
          render: (row) => <p className="text-sm">{row[col.id]}</p>,
        };
      });
  }, [selectedColumns, translate]);

  const exportToExcel = useCallback(async () => {
    const result = await Swal.fire({
      title: translate('Are you sure?'),
      text: translate('You want to export this data to Excel?'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: translate('Yes, export it!'),
      cancelButtonText: translate('Cancel'),
      width: '400px',
    });

    if (!result.isConfirmed) return;

    if (!validateFilters()) {
      toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্টার নির্বাচন করুন।');
      return;
    }

    if (!filteredStudentData.length) {
      toast.error('রপ্তানি করার জন্য কোনো ডেটা পাওয়া যায়নি।');
      return;
    }

    if (!selectedColumns.length) {
      toast.error('অনুগ্রহ করে রপ্তানির জন্য অন্তত একটি কলাম নির্বাচন করুন।');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      const exportData = filteredStudentData.map((row) => {
        const rowData = {};
        selectedColumns.forEach((colId) => {
          const column = allColumns.find((c) => c.id === colId);
          if (colId === 'logo') {
            rowData[column.label] =
              row[colId] && row[colId] !== '-' ? 'Logo Available' : 'No Logo';
          } else {
            rowData[column.label] = row[colId];
          }
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: 'Student_Data.xlsx',
            types: [
              {
                description: 'Excel Files',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                    ['.xlsx'],
                },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (error) {
          if (error.name !== 'AbortError') {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Student_Data.xlsx';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Student_Data.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      await Swal.fire({
        icon: 'success',
        title: translate('Data exported successfully'),
        timer: 1500,
        showConfirmButton: false,
        width: '400px',
      });
      // toast.success(translate('Data exported successfully')); // ❌ removed as per request
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      await Swal.fire({
        icon: 'error',
        title: translate('Error'),
        text: translate('Failed to export data. Please try again.'),
        width: '400px',
      });
      toast.error('ডেটা প্রিন্ট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  }, [
    filteredStudentData,
    selectedColumns,
    allColumns,
    validateFilters,
    translate,
  ]);

  const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudentData.slice(start, start + PAGE_SIZE);
  }, [filteredStudentData, currentPage]);

  const handlePrint = useCallback(() => {
    showModal(translate('Data Export'), 'DATA_EXPORT_FEILD', filteredStudentData);
  }, [translate, paginatedData]);

  if (isSVTLoading || isSearchLoading) return <Loading />;
  if (isSVTError || settingsError)
    return <p className="text-red-500">Failed to load required data</p>;

  return (
    <FormProvider {...methods}>
      <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-default print:hidden">
        <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
            {translate('Export students data')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 flex-1">
            <DefaultSelect
              options={sessionData || []}
              require={'Session is required'}
              nameField={'SessionName'}
              valueField={'SessionID'}
              registerKey={'SessionID'}
              type={'number'}
              label={translate('Session')}
              error={errors.filters}
            />
            <DefaultSelect
              options={subClassData || []}
              require={'Sub Class is required'}
              nameField={'SubClass'}
              valueField={'SubClassID'}
              registerKey={'SubClassID'}
              type={'number'}
              label={translate('Sub Class')}
              error={errors.filters}
              unicode={true}
            />
            <DefaultSelect
              options={[
                { NewOldId: 1, ClassName: 'নতুন' },
                { NewOldId: 2, ClassName: 'পুরাতন' },
                { NewOldId: 3, ClassName: 'উভয়' },
              ]}
              require={'New/Old is required'}
              nameField={'ClassName'}
              valueField={'NewOldId'}
              registerKey={'NewOldId'}
              type={'number'}
              label={translate('New/Old')}
              error={errors.filters}
            />
            <DefaultSelect
              options={residential || []}
              require={'Living Condition is required'}
              nameField={'ResidentialName'}
              valueField={'RDID'}
              registerKey={'ResidentialStatusId'}
              type={'number'}
              label={translate('Living Condition')}
              error={errors.filters}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:mt-6 w-full 2xl:w-auto">
            <Button
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={exportToExcel}
            >
              {translate('Data Export (Excel)')}
            </Button>

            <Button
              variant="secondary"
              className="w-full sm:w-auto flex items-center gap-2 bg-green-500 hover:bg-green-600"
              onClick={handlePrint}
            >
              {translate('Data Export (PDF)')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">
                {translate('Select Columns')}
              </h3>
              <div className="p-2">
                <div className="mb-2">
                  <label className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedColumns.length === allColumns.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColumns(allColumns.map((col) => col.id));
                        } else {
                          setSelectedColumns([]);
                        }
                      }}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">
                      {translate('All Select')}
                    </span>
                  </label>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {allColumns.map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(column.id)}
                        onChange={() => handleColumnToggle(column.id)}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
                      />
                      <span className="text-sm text-gray-700">
                        {translate(column.label)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {searchStudentError ? (
            <div className="w-full lg:w-3/4">
              <p className="text-red-500 text-center">
                {translate(
                  'Failed to load student data. Please check your filters or try again later.'
                )}
              </p>
            </div>
          ) : (
            <div className="w-full lg:w-3/4">
              {selectedColumns.length > 0 && filteredStudentData.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <SortableTable
                      columns={dynamicColumns}
                      data={paginatedData}
                      isFilterColumn={false}
                    />
                  </div>

                  <DefaultPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    {selectedColumns.length === 0
                      ? translate('Select columns to display data')
                      : translate('No data available for the selected filters')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default DataExport;