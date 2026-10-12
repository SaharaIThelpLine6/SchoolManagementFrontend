import { Buffer } from 'buffer';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import * as XLSX from 'xlsx';
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
import {
  useGetAllStudentDataExportTemplatesQuery,
  useGetInstitutionInfoQuery,
} from '../features/settings/settingsQuerySlice';
import { useGetLabelNameListsQuery } from '../features/result/resultSilce';

const PAGE_SIZE = 10;

const DataExport = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, setValue } = methods;
  const [logo, setLogo] = useState(null);

  // ✅ Institution info with loading
  const { data: institutionInfo, isLoading: isInstitutionLoading } =
    useGetInstitutionInfoQuery();

  // ✅ Label name with loading
  const { data, isLoading: isLoadingLabel } = useGetLabelNameListsQuery();

  // ✅ allColumns
  const allColumns = [
    { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
    { id: 'ID', label: `${data?.[0]?.StudentIDLabel ? data?.[0]?.StudentIDLabel : "ID"}`, field: 'StudentCode' },
    { id: 'Name', label: 'Name', field: 'StudentName' },
    { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
    { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
    { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
    { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
    { id: 'E-mail', label: 'E-mail', field: 'Email' },
    { id: 'Session', label: 'Session', field: 'SessionName' },
    { id: 'Class', label: `${data?.[0]?.ClassNameLabel ? data?.[0]?.ClassNameLabel : "Class"}`, field: 'ClassName' },
    { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
    { id: 'Admission Serial', label: `${data?.[0]?.AdmissionIDLabel ? data?.[0]?.AdmissionIDLabel : "ID"}`, field: 'AdmissionSerial' },
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
    { id: 'User Active', label: 'User Active', field: 'UserActiveName' },
  ];

  /* ============================================================
     ✅ RTK Query hooks
  ============================================================ */
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useGetAllStudentDataExportTemplatesQuery();

  const [SessionID, SubClassID, NewOldId, ResidentialStatusId, UserActive, FieldKey] = watch([
    'SessionID', 'SubClassID', 'NewOldId', 'ResidentialStatusId', 'UserActive', 'FieldKey',
  ]);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { residential, error: settingsError } = useSelector((state) => state.settings);

  const { data: studentVacationTypeData = [], isError: isSVTError, isLoading: isSVTLoading } =
    useGetStudentsVacationTypeListQuery();

  /* ============================================================
     ✅ Selected Template — FieldKey দিয়ে match
  ============================================================ */
  const selectedTemplate = useMemo(() => {
    if (!FieldKey || !templatesData?.data) return null;
    return templatesData.data.find((t) => t.FieldKey === FieldKey) || null;
  }, [FieldKey, templatesData]);

  const selectedTemplateColumns = useMemo(() => {
    return selectedTemplate?.FieldValue?.selectedColumns || [];
  }, [selectedTemplate]);

  /* ============================================================
     ✅ Student Data
  ============================================================ */
  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching, // ✅ add for refetch loading
  } = useGetStudentBySearchQuery(
    {
      SubClassID: SubClassID ? SubClassID : null,
      SessionID: SessionID ? SessionID : null,
      NewOldId: NewOldId ? NewOldId : null,
      ResidentialStatusId: ResidentialStatusId ? ResidentialStatusId : null,
      UserActive: UserActive !== undefined && UserActive !== null ? UserActive : null,
    },
    {
      skip: !SessionID || !SubClassID || !ResidentialStatusId,
      refetchOnFocus: false,
    }
  );

  /* ============================================================
     ✅ Process raw data
  ============================================================ */
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
        ResidentialName:
          student.ResidentialStatusId === 1 ? 'আবাসিক' :
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
        UserActive: student.User?.UserActive,
        UserActiveName:
          student.User?.UserActive === 1 ? 'Active' :
            student.User?.UserActive === 0 ? 'InActive' : '-',
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
  const { data: subClassData } = useGetSubClassListQuery();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
    dispatch(fetchSettingsData());
  }, [dispatch, pageTitle]);

  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({ filters: false });

  /* ============================================================
     ✅ NEW: Selected Rows state — default all selected
  ============================================================ */
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  /* ============================================================
     ✅ Dynamic Columns — selected template থেকে
  ============================================================ */
  const activeColumns = useMemo(() => {
    if (!selectedTemplateColumns.length) return [];

    return selectedTemplateColumns
      .map((colId) => {
        if (typeof colId === 'string' && colId.startsWith('custom_')) {
          const label = colId.replace(/^custom_/, '');
          return {
            id: colId,
            label,
            field: null,
            isCustom: true,
            type: 'text',
          };
        }

        const base = allColumns.find((c) => c.id === colId);
        if (!base) return null;
        return { ...base, isCustom: false };
      })
      .filter(Boolean);
  }, [selectedTemplateColumns]);

  /* ============================================================
     ✅ Filtered Data — শুধু selected template columns
  ============================================================ */
  const filteredStudentData = useMemo(() => {
    if (!processedStudentData.length || !activeColumns.length) return [];

    return processedStudentData.map((student) => {
      const filteredStudent = {};
      activeColumns.forEach((col) => {
        if (col.isCustom) {
          filteredStudent[col.id] = '-';
        } else {
          const value = student[col.field];
          filteredStudent[col.id] =
            value !== undefined && value !== null && value !== '' ? value : '-';
        }
      });
      return filteredStudent;
    });
  }, [processedStudentData, activeColumns]);

  /* ============================================================
     ✅ Selected Rows auto-sync — default সব selected
  ============================================================ */
  useEffect(() => {
    if (!filteredStudentData.length) {
      setSelectedRowIds([]);
      return;
    }

    // ✅ Default: সব row selected
    const allIds = filteredStudentData.map((_, idx) => idx);
    setSelectedRowIds(allIds);
  }, [filteredStudentData]);

  /* ============================================================
     ✅ Filtered Data — শুধু checked row গুলো (Print/Excel-এর জন্য)
  ============================================================ */
  const selectedPrintData = useMemo(() => {
    if (!filteredStudentData.length) return [];
    return filteredStudentData.filter((_, idx) => selectedRowIds.includes(idx));
  }, [filteredStudentData, selectedRowIds]);

  /* ============================================================
     ✅ Row Checkbox handlers
  ============================================================ */
  const handleRowToggle = useCallback((rowIndex) => {
    setSelectedRowIds((prev) =>
      prev.includes(rowIndex)
        ? prev.filter((i) => i !== rowIndex)
        : [...prev, rowIndex]
    );
  }, []);

  const handleSelectAllRows = useCallback((checked) => {
    if (checked) {
      setSelectedRowIds(filteredStudentData.map((_, idx) => idx));
    } else {
      setSelectedRowIds([]);
    }
  }, [filteredStudentData]);

  const allRowsSelected = useMemo(() => {
    return (
      filteredStudentData.length > 0 &&
      selectedRowIds.length === filteredStudentData.length
    );
  }, [filteredStudentData, selectedRowIds]);

  /* ============================================================
     ✅ Dynamic Table Columns (with Checkbox)
  ============================================================ */
  const dynamicColumns = useMemo(() => {
    // ✅ Checkbox column সবার আগে
    const checkboxColumn = {
      title: (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={allRowsSelected}
            onChange={(e) => handleSelectAllRows(e.target.checked)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
            title={translate('Select All')}
          />
        </div>
      ),
      field: '__checkbox__',
      hozAlign: 'center',
      headerHozAlign: 'center',
      width: 50,
      render: (row) => {
        // ✅ Global index বের করুন
        const globalIndex = filteredStudentData.indexOf(row);
        const isChecked = selectedRowIds.includes(globalIndex);
        return (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleRowToggle(globalIndex)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>
        );
      },
    };

    const dataColumns = activeColumns.map((col) => {
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
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 bg-gray-100">
                  <img
                    src={row[col.id]}
                    alt="Student Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/avatar.png';
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center">
                <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden">
                  <img
                    src="/avatar.png"
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

    return [checkboxColumn, ...dataColumns];
  }, [
    activeColumns,
    translate,
    filteredStudentData,
    selectedRowIds,
    allRowsSelected,
    handleRowToggle,
    handleSelectAllRows,
  ]);

  /* ============================================================
     ✅ Validate Filters
  ============================================================ */
  const validateFilters = useCallback(() => {
    const { SessionID, SubClassID, ResidentialStatusId } = methods.getValues();
    const isValid = SessionID && SubClassID && ResidentialStatusId;
    setErrors((prev) => ({ ...prev, filters: !isValid }));
    return isValid;
  }, [methods]);

  /* ============================================================
     ✅ PRINT — Dynamic template (only selected rows)
  ============================================================ */
  const handlePrint = useCallback(async () => {
    if (!validateFilters()) {
      toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্টার নির্বাচন করুন।');
      return;
    }
    if (!selectedTemplate) {
      toast.error('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন।');
      return;
    }
    if (!selectedPrintData.length) {
      toast.error('প্রিন্ট করার জন্য কোনো ডেটা নির্বাচন করুন।');
      return;
    }

    const reportName = selectedTemplate.FieldValue?.ReportName || 'Report';
    const sessionName = searchStudentInfo?.[0]?.AcademicSession?.SessionName || '';
    const className = searchStudentInfo?.[0]?.Class?.ClassName || '';

    // ✅ Column definitions for print (skip checkbox)
    const printColumns = activeColumns.map((col) => ({
      id: col.id,
      name: col.isCustom ? col.label : col.id,
      field: col.field,
      isCustom: col.isCustom,
      isImage: col.type === 'image',
      size: null,
    }));

    const container = document.createElement('div');
    container.id = 'print-container';
    container.innerHTML = `
      <style>
        @media print {
          body * { visibility: hidden; padding-top: 0; margin-top: 0px; }
          #print-container * { visibility: visible; }
          #root { display: none; }
          table { page-break-inside: auto; border-collapse: collapse; }
          tr { page-break-inside: avoid !important; page-break-after: auto; }
          td, th { page-break-inside: avoid !important; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          #print-container { position: absolute; width: 100%; margin: 0; padding: 0; }
        }
      </style>

      <div style="padding: 20px 30px; font-family: 'SolaimanLipi', sans-serif; color: #000;">
        <div style="text-align: center; margin-bottom: 6px;">
          <h1 style="font-size: 26px; font-weight: bold; margin: 0; font-family: 'SolaimanLipi';">
            ${institutionInfo?.InstitutionName || ''}
          </h1>
          <p style="font-size: 15px; margin: 4px 0 0 0; color: #333; font-family: 'SolaimanLipi';">
            ${institutionInfo?.PoliceStation || ''}, ${institutionInfo?.District || ''}
          </p>
        </div>

        <div style="display: flex; justify-content: center; align-items: center; margin: 14px 0;">
          <div style="border: 1.5px solid #000; border-radius: 4px; padding: 5px 28px; font-size: 15px; font-weight: bold; font-family: 'SolaimanLipi'; background-color: #f9f9f9;">
            শিক্ষাবর্ষ : ${sessionName}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-family: 'SolaimanLipi';">
          <p style="font-weight: bold; font-size: 15px; margin: 0;">শ্রেণি/জামাতঃ ${className}</p>
          <p style="font-size: 13px; margin: 0; color: #444;">প্রিন্ট: ${new Date().toLocaleDateString('bn-BD')}</p>
        </div>

        <h2 style="text-align: center; padding-bottom: 8px; margin: 0px 0 10px 0; font-weight: bold; font-size: 22px; font-family: 'SolaimanLipi';">
          <span style="border-bottom: 2px solid #000; padding-bottom: 4px; display: inline-block;">
            ${reportName}
          </span>
        </h2>

        <table border="1" width="100%" cellpadding="6" style="border-collapse: collapse; border: 1px solid #000; font-family: 'SolaimanLipiNormal', 'SolaimanLipi', sans-serif; font-size: 13px;">
          <thead>
            <tr style="background-color: #eaeaea;">
              <th style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; width: 40px;">ক্র</th>
              ${printColumns.map((c) => `
                <th style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; font-family: 'SolaimanLipi'; font-size: 13px;">
                  ${c.isImage ? translate('Image') : translate(c.name)}
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${selectedPrintData.map((row, idx) => `
              <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #000; padding: 6px 5px; text-align: center;">${idx + 1}</td>
                ${printColumns.map((col) => {
      const cellValue = row[col.id];
      if (col.isImage) {
        return `
                      <td style="border: 1px solid #000; padding: 4px; text-align: center;">
                        <img src="${cellValue || '/avatar.png'}" alt="logo" style="max-height: 70px; margin: auto; width: 55px; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null; this.src='/avatar.png';" />
                      </td>
                    `;
      }
      return `
                    <td style="border: 1px solid #000; padding: 6px 5px; text-align: center; font-family: 'SolaimanLipiNormal', 'SolaimanLipi';">
                      ${cellValue ?? '-'}
                    </td>
                  `;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(container);

    setTimeout(() => {
      window.print();

      const printContainer = container;
      const cleanup = () => {
        if (printContainer.parentNode) {
          document.body.removeChild(printContainer);
        }
        window.onafterprint = null;
        window.onfocus = null;
      };
      window.onafterprint = cleanup;
      let focusTimeout = null;
      window.onfocus = () => {
        if (focusTimeout) {
          clearTimeout(focusTimeout);
          focusTimeout = null;
        }
        focusTimeout = setTimeout(() => {
          cleanup();
          focusTimeout = null;
        }, 500);
      };
      setTimeout(() => {
        if (printContainer.parentNode) cleanup();
      }, 1000);
    }, 1000);

    setShowMenu(false);
  }, [
    validateFilters,
    selectedTemplate,
    selectedPrintData,
    activeColumns,
    searchStudentInfo,
    institutionInfo,
    translate,
  ]);

  /* ============================================================
     ✅ EXCEL — Dynamic template (only selected rows)
  ============================================================ */
  const handleExcel = useCallback(async () => {
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
    if (!selectedTemplate) {
      toast.error('অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন।');
      return;
    }
    if (!selectedPrintData.length) {
      toast.error('রপ্তানি করার জন্য কোনো ডেটা নির্বাচন করুন।');
      return;
    }

    try {
      const workbook = XLSX.utils.book_new();

      const exportData = selectedPrintData.map((row) => {
        const rowData = {};
        activeColumns.forEach((col) => {
          if (col.type === 'image') {
            rowData[col.label] =
              row[col.id] && row[col.id] !== '-' ? 'Logo Available' : 'No Logo';
          } else {
            rowData[col.label] = row[col.id] ?? '-';
          }
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `${selectedTemplate.FieldValue?.ReportName || 'Report'}.xlsx`;

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'Excel Files',
                accept: {
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
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
            a.download = fileName;
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
        a.download = fileName;
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
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      await Swal.fire({
        icon: 'error',
        title: translate('Error'),
        text: translate('Failed to export data. Please try again.'),
        width: '400px',
      });
    }

    setShowMenu(false);
  }, [
    validateFilters,
    selectedTemplate,
    selectedPrintData,
    activeColumns,
    translate,
  ]);

  /* ============================================================
     ✅ Pagination
  ============================================================ */
  const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudentData.slice(start, start + PAGE_SIZE);
  }, [filteredStudentData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [FieldKey, SessionID, SubClassID, NewOldId, ResidentialStatusId, UserActive]);

  /* ============================================================
     ✅ Modal — Add New Template
  ============================================================ */
  const exportData = {
    SessionName: searchStudentInfo?.[0]?.AcademicSession?.SessionName,
    ClassName: searchStudentInfo?.[0]?.Class?.ClassName,
    data: filteredStudentData,
  };

  const handleModal = useCallback(() => {
    showModal(translate('Data Export'), 'DATA_EXPORT_FEILD');
  }, [translate]);

  /* ============================================================
     ✅ MAIN LOADING (updated)
  ============================================================ */
  if (
    isSVTLoading ||
    isLoadingTemplates ||   // ✅ template loading add
    isInstitutionLoading || // ✅ institution info loading add
    isLoadingLabel          // ✅ label loading add
  )
    return <Loading />;

  if (isSVTError || settingsError)
    return <p className="text-red-500">Failed to load required data</p>;

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col gap-6 font-default print:hidden">
        <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-4">
          {/* Header */}
          <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              <span className="font-bold text-xl">{translate('ফিল্টার')}</span>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 w-full 2xl:w-auto">

              {/* Add New Template Button */}
              <button
                type="button"
                onClick={handleModal}
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 h-10"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {translate('Add New Template')}
              </button>

              {/* Three Dot Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="More options"
                  className={`group flex items-center justify-center border rounded-lg shadow-sm transition-all duration-200 w-10 h-10 ${showMenu
                    ? 'border-[#37c565] ring-2 ring-[#37c565]/30 bg-green-50'
                    : 'border-blue-300 bg-blue-500 text-white hover:border-blue-400 hover:bg-blue-600 hover:shadow-md active:scale-95'
                    }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-300 ${showMenu ? 'text-[#37c565] rotate-90' : 'text-white'
                      }`}
                  >
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        {translate('Export Options')}
                      </span>
                    </div>

                    {/* Print */}
                    <button
                      onClick={handlePrint}
                      className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 6 2 18 2 18 9"></polyline>
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                          <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{translate('Print')}</span>
                        <span className="text-[11px] text-gray-400">
                          {translate('Print the report')}
                        </span>
                      </div>
                    </button>

                    <div className="mx-4 border-t border-dashed border-gray-200"></div>

                    {/* Excel */}
                    <button
                      onClick={handleExcel}
                      className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 transition-all duration-200"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-[#1D6F42] group-hover:bg-[#1D6F42] group-hover:text-white transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="9" y1="13" x2="15" y2="13"></line>
                          <line x1="9" y1="17" x2="15" y2="17"></line>
                        </svg>
                      </span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{translate('Excel')}</span>
                        <span className="text-[11px] text-gray-400">
                          {translate('Download as Excel')}
                        </span>
                      </div>
                    </button>

                    <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-green-500 to-[#1D6F42]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 flex-1">
            <DefaultSelect
              options={
                templatesData?.data?.map((template) => ({
                  label: template.FieldValue.ReportName,
                  value: template.FieldKey,
                })) || []
              }
              require={'Report is required'}
              nameField={'label'}
              valueField={'value'}
              registerKey={'FieldKey'}
              type={'text'}
              label={translate('Data Export Template')}
              error={errors.filters}
            />
            <DefaultSelect options={sessionData || []} require={'Session is required'} nameField={'SessionName'} valueField={'SessionID'} registerKey={'SessionID'} type={'number'} label={translate('Session')} error={errors.filters} />
            <DefaultSelect options={subClassData || []} require={'Sub Class is required'} nameField={'SubClass'} valueField={'SubClassID'} registerKey={'SubClassID'} type={'number'} label={translate('Sub Class')} error={errors.filters} unicode={true} />
            <DefaultSelect
              options={[
                { NewOldId: 1, ClassName: 'নতুন' },
                { NewOldId: 2, ClassName: 'পুরাতন' },
                { NewOldId: 3, ClassName: 'উভয়' },
              ]}
              require={'New/Old is required'}
              nameField={'ClassName'}
              valueField={'NewOldId'}
              registerKey={'NewOldId'}
              type={'number'}
              label={translate('New/Old')}
              error={errors.filters}
            />
            <DefaultSelect options={residential || []} require={'Living Condition is required'} nameField={'ResidentialName'} valueField={'RDID'} registerKey={'ResidentialStatusId'} type={'number'} label={translate('Living Condition')} error={errors.filters} />
            <DefaultSelect
              options={[
                { UserActive: 1, UserActiveName: 'সক্রিয়' },
                { UserActive: 0, UserActiveName: 'নিষ্ক্রিয়' },
              ]}
              require={'User Active is required'}
              nameField={'UserActiveName'}
              valueField={'UserActive'}
              registerKey={'UserActive'}
              type={'number'}
              label={'স্ট্যাটাস'}
              error={errors.filters}
            />
          </div>

          {/* ✅ Selected count info */}
          {filteredStudentData.length > 0 && (
            <div className="flex items-center justify-between text-xs text-gray-500 px-1">
              <span>
                {translate('Selected')}: <b className="text-blue-600">{selectedRowIds.length}</b> / {filteredStudentData.length}
              </span>
              {selectedRowIds.length > 0 && (
                <span className="text-green-600 font-medium">
                  ✓ {translate('Print/Excel will include selected rows only')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg rounded-xl pb-3 flex flex-col lg:flex-row gap-6">
          {searchStudentError ? (
            <div className="w-full">
              <p className="text-red-500 text-center">
                {translate('Failed to load student data. Please check your filters or try again later.')}
              </p>
            </div>
          ) : (
            <div className="w-full">
              {/* ✅ Inline loading during refetch */}
              {isSearchFetching && !isSearchLoading ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                  <Loading />
                </div>
              ) : activeColumns.length > 0 && filteredStudentData.length > 0 ? (
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
                    {!FieldKey
                      ? translate('Select a template to display data')
                      : activeColumns.length === 0
                        ? translate('No columns in this template')
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

// import { Buffer } from 'buffer';
// import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { useDispatch, useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';
// import * as XLSX from 'xlsx';
// import Button from '../components/Button/Button';
// import DefaultSelect from '../components/Forms/DefaultSelect';
// import Loading from '../components/Loading/Loading';
// import DefaultPagination from '../components/Pagination/DefaultPagination';
// import SortableTable from '../components/Tables/SortableTable';
// import { setPageName } from '../features/auth/authSlice';
// import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
// import { useGetSessionsQuery } from '../features/session/sessionSlice';
// import { fetchSettingsData } from '../features/settings/settingsSlice';
// import {
//   useGetStudentBySearchQuery,
//   useGetStudentsVacationTypeListQuery,
// } from '../features/student/studentQuerySlice';
// import { showModal } from '../utils/ModalControlar';
// import useTranslate from '../utils/Translate';
// import { useGetAllStudentDataExportTemplatesQuery } from '../features/settings/settingsQuerySlice';

// const PAGE_SIZE = 10;

// const DataExport = ({ pageTitle }) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const methods = useForm();
//   const { watch } = methods;
//   const [logo, setLogo] = useState(null);

//   const {
//     data: templatesData,
//     isLoading: isLoadingTemplates,
//     isError: isErrorTemplates,
//     error: templatesError,
//     refetch: refetchTemplates,
//   } = useGetAllStudentDataExportTemplatesQuery();

//   console.log(templatesData, "templatesData")

//   const [SessionID, SubClassID, NewOldId, ResidentialStatusId, UserActive] = watch([
//     'SessionID',
//     'SubClassID',
//     'NewOldId',
//     'ResidentialStatusId',
//     'UserActive',
//   ]);

//   const [showMenu, setShowMenu] = useState(false);
//   const menuRef = useRef(null);

//   // Close menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handlePrint = () => {
//     // your print logic
//     setShowMenu(false);
//   };

//   const handleExcel = () => {
//     // your excel export logic
//     setShowMenu(false);
//   };
//   const { residential, error: settingsError } = useSelector(
//     (state) => state.settings
//   );

//   const {
//     data: studentVacationTypeData = [],
//     isError: isSVTError,
//     isLoading: isSVTLoading,
//   } = useGetStudentsVacationTypeListQuery();

//   const {
//     data: searchStudentInfo,
//     error: searchStudentError,
//     isLoading: isSearchLoading,
//   } = useGetStudentBySearchQuery(
//     {
//       SubClassID: SubClassID ? SubClassID : null,
//       SessionID: SessionID ? SessionID : null,
//       NewOldId: NewOldId ? NewOldId : null,
//       ResidentialStatusId: ResidentialStatusId ? ResidentialStatusId : null,
//       UserActive: UserActive !== undefined && UserActive !== null ? UserActive : null,
//     },
//     {
//       skip: !SessionID || !SubClassID || !ResidentialStatusId,
//       refetchOnFocus: false,
//     }
//   );

//   console.log(searchStudentInfo, "searchStudentInfo")

//   const processedStudentData = useMemo(() => {
//     if (!searchStudentInfo || !searchStudentInfo.length) return [];

//     return searchStudentInfo.map((student) => {
//       let studentLogo = null;

//       if (student.User?.UserImage?.Image?.data) {
//         try {
//           const buffer = Buffer.from(student.User.UserImage.Image.data);
//           const base64String = buffer.toString('base64');
//           studentLogo = `data:image/png;base64,${base64String}`;
//         } catch (error) {
//           console.error('Error processing logo:', error);
//           studentLogo = null;
//         }
//       }

//       return {
//         AdmissionID: student.AdmissionID,
//         UserID: student.UserID,
//         StudentCode: student.User?.UserCode || '-',
//         StudentName: student.User?.UserName || '-',
//         FatherName: student.User?.FatherName || '-',
//         MotherName: student.User?.MotherName || '-',
//         Mobile1: student.User?.Mobile1 || '-',
//         Mobile2: student.User?.Mobile2 || '-',
//         Email: student.User?.Email || '-',
//         DateOfBirth: student.User?.DateOfBirth || '-',
//         NIDNO: student.User?.NIDNO || '-',
//         BloodGroup: student.User?.BloodGroup || '-',
//         GenderID: student.User?.GenderID || '-',
//         SessionName: student.AcademicSession?.SessionName || '-',
//         ClassName: student.Class?.ClassName || '-',
//         SubClass: student.SubClass?.SubClass || '-',
//         AdmissionSerial: student.AdmissionSerial || '-',
//         NewOldId: student.NewOldId || '-',
//         ResidentialStatusId: student.ResidentialStatusId || '-',
//         ResidentialName: student.ResidentialStatusId === 1 ? 'আবাসিক' :
//           student.ResidentialStatusId === 2 ? 'অনাবাসিক' : '-',
//         permanentVill: student.User?.permanentVill || '-',
//         permanentPost: student.User?.permanentPost || '-',
//         PoliceStationName: student.User?.permanentPoliceStation?.PoliceStationName || '-',
//         PermanentDistrictName: student.User?.permanentPoliceStation?.District?.DistrictName || '-',
//         PermanentDivisionName: student.User?.permanentPoliceStation?.District?.Division?.DivisionName || '-',
//         TransientVill: student.User?.TransientVill || '-',
//         TransientPost: student.User?.TransientPost || '-',
//         TransientPoliceStationName: student.User?.transientPoliceStation?.PoliceStationName || '-',
//         TransientDistrictName: student.User?.transientPoliceStation?.District?.DistrictName || '-',
//         TransientDivisionName: student.User?.transientPoliceStation?.District?.Division?.DivisionName || '-',
//         logo: studentLogo,
//         SFTID: student.SFTID,
//         ExamAction: student.ExamAction,
//         AdmissionStatus: student.AdmissionStatus,
//         AdmissionAction: student.AdmissionAction,
//         FinancialStatus: student.FinancialStatus || '-',
//         UserActive: student.User?.UserActive,
//         UserActiveName: student.User?.UserActive === 1 ? 'Active' : student.User?.UserActive === 0 ? 'InActive' : '-',
//       };
//     });
//   }, [searchStudentInfo]);

//   useEffect(() => {
//     if (searchStudentInfo?.[0]?.User?.UserImage?.data) {
//       try {
//         const buffer = Buffer.from(searchStudentInfo[0].User.UserImage.data);
//         const base64String = buffer.toString('base64');
//         const imageSrc = `data:image/png;base64,${base64String}`;
//         setLogo(imageSrc);
//       } catch (error) {
//         console.error('Error processing main logo:', error);
//       }
//     }
//   }, [searchStudentInfo]);

//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: subClassData, isLoading: subClassDataLoading, isError: subClassDataSuccess } = useGetSubClassListQuery();

//   useEffect(() => {
//     if (pageTitle) dispatch(setPageName(pageTitle));
//     dispatch(fetchSettingsData());
//   }, [dispatch, pageTitle]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedColumns, setSelectedColumns] = useState([]);
//   const [errors, setErrors] = useState({ filters: false });

//   const allColumns = [
//     { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
//     { id: 'ID', label: 'ID', field: 'StudentCode' },
//     { id: 'Name', label: 'Name', field: 'StudentName' },
//     { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
//     { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
//     { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
//     { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
//     { id: 'E-mail', label: 'E-mail', field: 'Email' },
//     { id: 'Session', label: 'Session', field: 'SessionName' },
//     { id: 'Class', label: 'Class', field: 'ClassName' },
//     { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
//     { id: 'Admission Serial', label: 'Admission Serial', field: 'AdmissionSerial' },
//     { id: 'Gender', label: 'Gender', field: 'GenderID' },
//     { id: 'Residence', label: 'Residence', field: 'ResidentialName' },
//     { id: 'New/Old', label: 'New/Old', field: 'NewOldId' },
//     { id: 'Date Of Birth', label: 'Date of Birth', field: 'DateOfBirth' },
//     { id: 'NID/Birth Registration', label: 'NID/Birth Registration', field: 'NIDNO' },
//     { id: 'Blood Group', label: 'Blood Group', field: 'BloodGroup' },
//     { id: 'permanentDivision', label: 'Permanent Division', field: 'PermanentDivisionName' },
//     { id: 'permanentDistrict', label: 'Permanent District', field: 'PermanentDistrictName' },
//     { id: 'permanentPoliceStation', label: 'Permanent Police Station', field: 'PoliceStationName' },
//     { id: 'permanentPostOffice', label: 'Permanent Post Office', field: 'permanentPost' },
//     { id: 'permanentVillage', label: 'Permanent Village', field: 'permanentVill' },
//     { id: 'transientDivision', label: 'Transient Division', field: 'TransientDivisionName' },
//     { id: 'transientDistrict', label: 'Transient District', field: 'TransientDistrictName' },
//     { id: 'transientPoliceStation', label: 'Transient Police Station', field: 'TransientPoliceStationName' },
//     { id: 'transientPostOffice', label: 'Transient Post Office', field: 'TransientPost' },
//     { id: 'transientVillage', label: 'Transient Village', field: 'TransientVill' },
//     { id: 'Financial Status', label: 'Financial Status', field: 'FinancialStatus' },
//     { id: 'User Active', label: 'User Active', field: 'UserActiveName' },
//   ];

//   const handleColumnToggle = useCallback((columnId) => {
//     setSelectedColumns((prev) =>
//       prev.includes(columnId)
//         ? prev.filter((id) => id !== columnId)
//         : [...prev, columnId]
//     );
//   }, []);

//   const validateFilters = useCallback(() => {
//     const { SessionID, SubClassID, ResidentialStatusId } = methods.getValues();
//     const isValid = SessionID && SubClassID && ResidentialStatusId;
//     setErrors((prev) => ({ ...prev, filters: !isValid }));
//     return isValid;
//   }, [methods]);

//   const filteredStudentData = useMemo(() => {
//     if (!processedStudentData || !processedStudentData.length) return [];

//     return processedStudentData.map((student) => {
//       const filteredStudent = {};
//       allColumns.forEach((col) => {
//         if (selectedColumns.includes(col.id)) {
//           const value = student[col.field];
//           filteredStudent[col.id] = value !== undefined && value !== null && value !== '' ? value : '-';
//         }
//       });
//       return filteredStudent;
//     });
//   }, [processedStudentData, selectedColumns, allColumns]);

//   const dynamicColumns = useMemo(() => {
//     return allColumns
//       .filter((col) => selectedColumns.includes(col.id))
//       .map((col) => {
//         if (col.id === 'logo') {
//           return {
//             title: translate(col.label),
//             field: col.id,
//             hozAlign: 'center',
//             headerHozAlign: 'center',
//             width: 80,
//             render: (row) =>
//               row[col.id] && row[col.id] !== '-' ? (
//                 <div className="flex justify-center items-center">
//                   <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
//                     <img
//                       src={row[col.id]}
//                       alt="Student Logo"
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.style.display = 'none';
//                         e.currentTarget.parentElement.querySelector(
//                           '.no-img'
//                         ).style.display = 'block';
//                       }}
//                     />
//                     <span className="no-img hidden text-gray-400 text-[10px]">
//                       No Image
//                     </span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center">
//                   <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-[10px] overflow-hidden">
//                     <img
//                       src={`/avatar.png`}
//                       alt="Student Logo"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 </div>
//               ),
//           };
//         }
//         return {
//           title: translate(col.label),
//           field: col.id,
//           hozAlign: 'center',
//           headerHozAlign: 'center',
//           render: (row) => <p className="text-sm">{row[col.id]}</p>,
//         };
//       });
//   }, [selectedColumns, translate]);

//   const exportToExcel = useCallback(async () => {
//     const result = await Swal.fire({
//       title: translate('Are you sure?'),
//       text: translate('You want to export this data to Excel?'),
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: translate('Yes, export it!'),
//       cancelButtonText: translate('Cancel'),
//       width: '400px',
//     });

//     if (!result.isConfirmed) return;

//     if (!validateFilters()) {
//       toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্টার নির্বাচন করুন।');
//       return;
//     }

//     if (!filteredStudentData.length) {
//       toast.error('রপ্তানি করার জন্য কোনো ডেটা পাওয়া যায়নি।');
//       return;
//     }

//     if (!selectedColumns.length) {
//       toast.error('অনুগ্রহ করে রপ্তানির জন্য অন্তত একটি কলাম নির্বাচন করুন।');
//       return;
//     }

//     try {
//       const workbook = XLSX.utils.book_new();

//       const exportData = filteredStudentData.map((row) => {
//         const rowData = {};
//         selectedColumns.forEach((colId) => {
//           const column = allColumns.find((c) => c.id === colId);
//           if (colId === 'logo') {
//             rowData[column.label] =
//               row[colId] && row[colId] !== '-' ? 'Logo Available' : 'No Logo';
//           } else {
//             rowData[column.label] = row[colId];
//           }
//         });
//         return rowData;
//       });

//       const worksheet = XLSX.utils.json_to_sheet(exportData);
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

//       const excelBuffer = XLSX.write(workbook, {
//         bookType: 'xlsx',
//         type: 'array',
//       });

//       const blob = new Blob([excelBuffer], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       });

//       if ('showSaveFilePicker' in window) {
//         try {
//           const handle = await window.showSaveFilePicker({
//             suggestedName: 'Student_Data.xlsx',
//             types: [
//               {
//                 description: 'Excel Files',
//                 accept: {
//                   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
//                     ['.xlsx'],
//                 },
//               },
//             ],
//           });
//           const writable = await handle.createWritable();
//           await writable.write(blob);
//           await writable.close();
//         } catch (error) {
//           if (error.name !== 'AbortError') {
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = 'Student_Data.xlsx';
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);
//           }
//         }
//       } else {
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'Student_Data.xlsx';
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//       }

//       await Swal.fire({
//         icon: 'success',
//         title: translate('Data exported successfully'),
//         timer: 1500,
//         showConfirmButton: false,
//         width: '400px',
//       });
//       // toast.success(translate('Data exported successfully')); // ❌ removed as per request
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       await Swal.fire({
//         icon: 'error',
//         title: translate('Error'),
//         text: translate('Failed to export data. Please try again.'),
//         width: '400px',
//       });
//       toast.error('ডেটা প্রিন্ট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
//     }
//   }, [
//     filteredStudentData,
//     selectedColumns,
//     allColumns,
//     validateFilters,
//     translate,
//   ]);

//   // console.log(filteredStudentData, "filteredStudentData")

//   const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return filteredStudentData.slice(start, start + PAGE_SIZE);
//   }, [filteredStudentData, currentPage]);

//   const exportData = {
//     SessionName: searchStudentInfo?.[0]?.AcademicSession?.SessionName,
//     ClassName: searchStudentInfo?.[0]?.Class?.ClassName,
//     data: filteredStudentData
//   };

//   const handleModal = useCallback(() => {
//     showModal(translate('Data Export'), 'DATA_EXPORT_FEILD', exportData);
//   }, [translate, exportData]);

//   if (isSVTLoading || isSearchLoading) return <Loading />;
//   if (isSVTError || settingsError)
//     return <p className="text-red-500">Failed to load required data</p>;

//   return (
//     <FormProvider {...methods}>
//       <div className=" flex flex-col gap-6 font-default print:hidden">
//         <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-4">

//           {/* Top Header Row: Filter Icon + Text on left, Buttons on right */}
//           <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4 border-b border-gray-100 pb-4">

//             {/* Filter Icon + Text */}
//             <div className="flex items-center gap-2 text-gray-700">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="20"
//                 height="20"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
//               </svg>
//               <span className="font-bold text-xl">{translate('ফিল্টার')}</span>
//             </div>

//             {/* Buttons on right */}
//             <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full 2xl:w-auto">
//               <button
//                 onClick={handleModal}
//                 className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#37c565] hover:bg-[#37c565] text-white px-6 py-2.5 rounded-md shadow-sm transition-all duration-200 text-sm font-medium"
//               >
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   width="18"
//                   height="18"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <line x1="12" y1="5" x2="12" y2="19"></line>
//                   <line x1="5" y1="12" x2="19" y2="12"></line>
//                 </svg>
//                 {translate('Add New Template')}
//               </button>

//               {/* Three Dot Button with Dropdown Menu */}
//               <div className="relative w-full sm:w-auto" ref={menuRef}>
//                 <button
//                   onClick={() => setShowMenu((prev) => !prev)}
//                   aria-label="More options"
//                   className={`group w-full sm:w-auto flex items-center justify-center border rounded-lg shadow-sm transition-all duration-200 px-3 py-2.5
//     ${showMenu
//                       ? 'border-[#37c565] ring-2 ring-[#37c565]/30 bg-green-50'
//                       : 'border-blue-300 bg-blue-500 text-white hover:border-blue-400 hover:bg-blue-600 hover:shadow-md active:scale-95'
//                     }`}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="18"
//                     height="18"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2.5"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className={`transition-all duration-300 ${showMenu
//                       ? 'text-[#37c565] rotate-90'
//                       : 'text-white group-hover:text-white'
//                       }`}
//                   >
//                     <circle cx="12" cy="12" r="1"></circle>
//                     <circle cx="12" cy="5" r="1"></circle>
//                     <circle cx="12" cy="19" r="1"></circle>
//                   </svg>
//                 </button>

//                 {/* Dropdown Menu */}
//                 {showMenu && (
//                   <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100 animate-fadeIn">

//                     {/* Header Label */}
//                     <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
//                       <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
//                         {translate('Export Options')}
//                       </span>
//                     </div>

//                     {/* Print Option */}
//                     <button
//                       onClick={handlePrint}
//                       className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 transition-all duration-200"
//                     >
//                       <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white group-hover:scale-110 transition-all duration-200 shadow-sm">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <polyline points="6 9 6 2 18 2 18 9"></polyline>
//                           <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
//                           <rect x="6" y="14" width="12" height="8"></rect>
//                         </svg>
//                       </span>
//                       <div className="flex flex-col items-start">
//                         <span className="font-medium group-hover:text-blue-700 transition-colors duration-200">
//                           {translate('Print')}
//                         </span>
//                         <span className="text-[11px] text-gray-400 group-hover:text-blue-500/80 transition-colors duration-200">
//                           {translate('Print the report')}
//                         </span>
//                       </div>
//                       <svg
//                         className="ml-auto w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200"
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       >
//                         <polyline points="9 18 15 12 9 6"></polyline>
//                       </svg>
//                     </button>

//                     {/* Divider */}
//                     <div className="mx-4 border-t border-dashed border-gray-200"></div>

//                     {/* Excel Option */}
//                     <button
//                       onClick={handleExcel}
//                       className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 transition-all duration-200"
//                     >
//                       <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-[#1D6F42] group-hover:bg-[#1D6F42] group-hover:text-white group-hover:scale-110 transition-all duration-200 shadow-sm">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         >
//                           <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//                           <polyline points="14 2 14 8 20 8"></polyline>
//                           <line x1="9" y1="13" x2="15" y2="13"></line>
//                           <line x1="9" y1="17" x2="15" y2="17"></line>
//                           <line x1="9" y1="9" x2="10" y2="9"></line>
//                         </svg>
//                       </span>
//                       <div className="flex flex-col items-start">
//                         <span className="font-medium group-hover:text-[#1D6F42] transition-colors duration-200">
//                           {translate('Excel')}
//                         </span>
//                         <span className="text-[11px] text-gray-400 group-hover:text-[#1D6F42]/80 transition-colors duration-200">
//                           {translate('Download as Excel')}
//                         </span>
//                       </div>
//                       <svg
//                         className="ml-auto w-4 h-4 text-gray-300 group-hover:text-[#1D6F42] group-hover:translate-x-0.5 transition-all duration-200"
//                         xmlns="http://www.w3.org/2000/svg"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       >
//                         <polyline points="9 18 15 12 9 6"></polyline>
//                       </svg>
//                     </button>

//                     {/* Bottom accent bar */}
//                     <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-green-500 to-[#1D6F42]"></div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Filter Inputs Grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 xl:grid-cols-6 gap-4 flex-1">
//             <DefaultSelect
//               options={
//                 templatesData?.data?.map((template) => ({
//                   label: template.FieldValue.ReportName,
//                   value: template.FieldKey,
//                 })) || []
//               }
//               require={'Report is required'}
//               nameField={'label'}
//               valueField={'value'}
//               registerKey={'FieldKey'}
//               type={'text'}
//               label={translate('Data Export Template')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={sessionData || []}
//               require={'Session is required'}
//               nameField={'SessionName'}
//               valueField={'SessionID'}
//               registerKey={'SessionID'}
//               type={'number'}
//               label={translate('Session')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={subClassData || []}
//               require={'Sub Class is required'}
//               nameField={'SubClass'}
//               valueField={'SubClassID'}
//               registerKey={'SubClassID'}
//               type={'number'}
//               label={translate('Sub Class')}
//               error={errors.filters}
//               unicode={true}
//             />
//             <DefaultSelect
//               options={[
//                 { NewOldId: 1, ClassName: 'নতুন' },
//                 { NewOldId: 2, ClassName: 'পুরাতন' },
//                 { NewOldId: 3, ClassName: 'উভয়' },
//               ]}
//               require={'New/Old is required'}
//               nameField={'ClassName'}
//               valueField={'NewOldId'}
//               registerKey={'NewOldId'}
//               type={'number'}
//               label={translate('New/Old')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={residential || []}
//               require={'Living Condition is required'}
//               nameField={'ResidentialName'}
//               valueField={'RDID'}
//               registerKey={'ResidentialStatusId'}
//               type={'number'}
//               label={translate('Living Condition')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={[
//                 { UserActive: 1, UserActiveName: 'সক্রিয়' },
//                 { UserActive: 0, UserActiveName: 'নিষ্ক্রিয়' },
//               ]}
//               require={'User Active is required'}
//               nameField={'UserActiveName'}
//               valueField={'UserActive'}
//               registerKey={'UserActive'}
//               type={'number'}
//               label={"স্ট্যাটাস"}
//               error={errors.filters}
//             />
//           </div>
//         </div>

//         <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col lg:flex-row gap-6">
//           {/* <div className="w-full lg:w-1/4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-700 mb-3">
//                 {translate('Select Columns')}
//               </h3>
//               <div className="p-2">
//                 <div className="mb-2">
//                   <label className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedColumns.length === allColumns.length}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedColumns(allColumns.map((col) => col.id));
//                         } else {
//                           setSelectedColumns([]);
//                         }
//                       }}
//                       className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
//                     />
//                     <span className="text-sm text-gray-700">
//                       {translate('All Select')}
//                     </span>
//                   </label>
//                 </div>

//                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//                   {allColumns.map((column) => (
//                     <label
//                       key={column.id}
//                       className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedColumns.includes(column.id)}
//                         onChange={() => handleColumnToggle(column.id)}
//                         className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
//                       />
//                       <span className="text-sm text-gray-700">
//                         {translate(column.label)}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div> */}

//           {searchStudentError ? (
//             <div className="w-full">
//               <p className="text-red-500 text-center">
//                 {translate(
//                   'Failed to load student data. Please check your filters or try again later.'
//                 )}
//               </p>
//             </div>
//           ) : (
//             <div className="w-full">
//               {selectedColumns.length > 0 && filteredStudentData.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                     <SortableTable
//                       columns={dynamicColumns}
//                       data={paginatedData}
//                       isFilterColumn={false}
//                     />
//                   </div>

//                   <DefaultPagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     onPageChange={setCurrentPage}
//                   />
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
//                   <p className="text-gray-500">
//                     {selectedColumns.length === 0
//                       ? translate('Select columns to display data')
//                       : translate('No data available for the selected filters')}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </FormProvider>
//   );
// };

// export default DataExport;



// import { Buffer } from 'buffer';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { FormProvider, useForm } from 'react-hook-form';
// import { useDispatch, useSelector } from 'react-redux';
// import { useLocation } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import Swal from 'sweetalert2';
// import 'sweetalert2/dist/sweetalert2.min.css';
// import * as XLSX from 'xlsx';
// import Button from '../components/Button/Button';
// import DefaultSelect from '../components/Forms/DefaultSelect';
// import Loading from '../components/Loading/Loading';
// import DefaultPagination from '../components/Pagination/DefaultPagination';
// import SortableTable from '../components/Tables/SortableTable';
// import { setPageName } from '../features/auth/authSlice';
// import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
// import { useGetSessionsQuery } from '../features/session/sessionSlice';
// import { fetchSettingsData } from '../features/settings/settingsSlice';
// import {
//   useGetStudentBySearchQuery,
//   useGetStudentsVacationTypeListQuery,
// } from '../features/student/studentQuerySlice';
// import { showModal } from '../utils/ModalControlar';
// import useTranslate from '../utils/Translate';

// const PAGE_SIZE = 10;

// const DataExport = ({ pageTitle }) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const translate = useTranslate();
//   const methods = useForm();
//   const { watch } = methods;
//   const [logo, setLogo] = useState(null);

//   const [SessionID, SubClassID, NewOldId, ResidentialStatusId, UserActive] = watch([
//     'SessionID',
//     'SubClassID',
//     'NewOldId',
//     'ResidentialStatusId',
//     'UserActive',
//   ]);
//   const { residential, error: settingsError } = useSelector(
//     (state) => state.settings
//   );

//   const {
//     data: studentVacationTypeData = [],
//     isError: isSVTError,
//     isLoading: isSVTLoading,
//   } = useGetStudentsVacationTypeListQuery();

//   const {
//     data: searchStudentInfo,
//     error: searchStudentError,
//     isLoading: isSearchLoading,
//   } = useGetStudentBySearchQuery(
//     {
//       SubClassID: SubClassID ? SubClassID : null,
//       SessionID: SessionID ? SessionID : null,
//       NewOldId: NewOldId ? NewOldId : null,
//       ResidentialStatusId: ResidentialStatusId ? ResidentialStatusId : null,
//       UserActive: UserActive !== undefined && UserActive !== null ? UserActive : null,
//     },
//     {
//       skip: !SessionID || !SubClassID || !ResidentialStatusId,
//       refetchOnFocus: false,
//     }
//   );

//   console.log(searchStudentInfo, "searchStudentInfo")

//   const processedStudentData = useMemo(() => {
//     if (!searchStudentInfo || !searchStudentInfo.length) return [];

//     return searchStudentInfo.map((student) => {
//       let studentLogo = null;

//       if (student.User?.UserImage?.Image?.data) {
//         try {
//           const buffer = Buffer.from(student.User.UserImage.Image.data);
//           const base64String = buffer.toString('base64');
//           studentLogo = `data:image/png;base64,${base64String}`;
//         } catch (error) {
//           console.error('Error processing logo:', error);
//           studentLogo = null;
//         }
//       }

//       return {
//         AdmissionID: student.AdmissionID,
//         UserID: student.UserID,
//         StudentCode: student.User?.UserCode || '-',
//         StudentName: student.User?.UserName || '-',
//         FatherName: student.User?.FatherName || '-',
//         MotherName: student.User?.MotherName || '-',
//         Mobile1: student.User?.Mobile1 || '-',
//         Mobile2: student.User?.Mobile2 || '-',
//         Email: student.User?.Email || '-',
//         DateOfBirth: student.User?.DateOfBirth || '-',
//         NIDNO: student.User?.NIDNO || '-',
//         BloodGroup: student.User?.BloodGroup || '-',
//         GenderID: student.User?.GenderID || '-',
//         SessionName: student.AcademicSession?.SessionName || '-',
//         ClassName: student.Class?.ClassName || '-',
//         SubClass: student.SubClass?.SubClass || '-',
//         AdmissionSerial: student.AdmissionSerial || '-',
//         NewOldId: student.NewOldId || '-',
//         ResidentialStatusId: student.ResidentialStatusId || '-',
//         ResidentialName: student.ResidentialStatusId === 1 ? 'আবাসিক' :
//           student.ResidentialStatusId === 2 ? 'অনাবাসিক' : '-',
//         permanentVill: student.User?.permanentVill || '-',
//         permanentPost: student.User?.permanentPost || '-',
//         PoliceStationName: student.User?.permanentPoliceStation?.PoliceStationName || '-',
//         PermanentDistrictName: student.User?.permanentPoliceStation?.District?.DistrictName || '-',
//         PermanentDivisionName: student.User?.permanentPoliceStation?.District?.Division?.DivisionName || '-',
//         TransientVill: student.User?.TransientVill || '-',
//         TransientPost: student.User?.TransientPost || '-',
//         TransientPoliceStationName: student.User?.transientPoliceStation?.PoliceStationName || '-',
//         TransientDistrictName: student.User?.transientPoliceStation?.District?.DistrictName || '-',
//         TransientDivisionName: student.User?.transientPoliceStation?.District?.Division?.DivisionName || '-',
//         logo: studentLogo,
//         SFTID: student.SFTID,
//         ExamAction: student.ExamAction,
//         AdmissionStatus: student.AdmissionStatus,
//         AdmissionAction: student.AdmissionAction,
//         FinancialStatus: student.FinancialStatus || '-',
//         UserActive: student.User?.UserActive,
//         UserActiveName: student.User?.UserActive === 1 ? 'Active' : student.User?.UserActive === 0 ? 'InActive' : '-',
//       };
//     });
//   }, [searchStudentInfo]);

//   useEffect(() => {
//     if (searchStudentInfo?.[0]?.User?.UserImage?.data) {
//       try {
//         const buffer = Buffer.from(searchStudentInfo[0].User.UserImage.data);
//         const base64String = buffer.toString('base64');
//         const imageSrc = `data:image/png;base64,${base64String}`;
//         setLogo(imageSrc);
//       } catch (error) {
//         console.error('Error processing main logo:', error);
//       }
//     }
//   }, [searchStudentInfo]);

//   const { data: sessionData } = useGetSessionsQuery();
//   const { data: subClassData, isLoading: subClassDataLoading, isError: subClassDataSuccess } = useGetSubClassListQuery();

//   useEffect(() => {
//     if (pageTitle) dispatch(setPageName(pageTitle));
//     dispatch(fetchSettingsData());
//   }, [dispatch, pageTitle]);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedColumns, setSelectedColumns] = useState([]);
//   const [errors, setErrors] = useState({ filters: false });

//   const allColumns = [
//     { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
//     { id: 'ID', label: 'ID', field: 'StudentCode' },
//     { id: 'Name', label: 'Name', field: 'StudentName' },
//     { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
//     { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
//     { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
//     { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
//     { id: 'E-mail', label: 'E-mail', field: 'Email' },
//     { id: 'Session', label: 'Session', field: 'SessionName' },
//     { id: 'Class', label: 'Class', field: 'ClassName' },
//     { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
//     { id: 'Admission Serial', label: 'Admission Serial', field: 'AdmissionSerial' },
//     { id: 'Gender', label: 'Gender', field: 'GenderID' },
//     { id: 'Residence', label: 'Residence', field: 'ResidentialName' },
//     { id: 'New/Old', label: 'New/Old', field: 'NewOldId' },
//     { id: 'Date Of Birth', label: 'Date of Birth', field: 'DateOfBirth' },
//     { id: 'NID/Birth Registration', label: 'NID/Birth Registration', field: 'NIDNO' },
//     { id: 'Blood Group', label: 'Blood Group', field: 'BloodGroup' },
//     { id: 'permanentDivision', label: 'Permanent Division', field: 'PermanentDivisionName' },
//     { id: 'permanentDistrict', label: 'Permanent District', field: 'PermanentDistrictName' },
//     { id: 'permanentPoliceStation', label: 'Permanent Police Station', field: 'PoliceStationName' },
//     { id: 'permanentPostOffice', label: 'Permanent Post Office', field: 'permanentPost' },
//     { id: 'permanentVillage', label: 'Permanent Village', field: 'permanentVill' },
//     { id: 'transientDivision', label: 'Transient Division', field: 'TransientDivisionName' },
//     { id: 'transientDistrict', label: 'Transient District', field: 'TransientDistrictName' },
//     { id: 'transientPoliceStation', label: 'Transient Police Station', field: 'TransientPoliceStationName' },
//     { id: 'transientPostOffice', label: 'Transient Post Office', field: 'TransientPost' },
//     { id: 'transientVillage', label: 'Transient Village', field: 'TransientVill' },
//     { id: 'Financial Status', label: 'Financial Status', field: 'FinancialStatus' },
//     { id: 'User Active', label: 'User Active', field: 'UserActiveName' },
//   ];

//   const handleColumnToggle = useCallback((columnId) => {
//     setSelectedColumns((prev) =>
//       prev.includes(columnId)
//         ? prev.filter((id) => id !== columnId)
//         : [...prev, columnId]
//     );
//   }, []);

//   const validateFilters = useCallback(() => {
//     const { SessionID, SubClassID, ResidentialStatusId } = methods.getValues();
//     const isValid = SessionID && SubClassID && ResidentialStatusId;
//     setErrors((prev) => ({ ...prev, filters: !isValid }));
//     return isValid;
//   }, [methods]);

//   const filteredStudentData = useMemo(() => {
//     if (!processedStudentData || !processedStudentData.length) return [];

//     return processedStudentData.map((student) => {
//       const filteredStudent = {};
//       allColumns.forEach((col) => {
//         if (selectedColumns.includes(col.id)) {
//           const value = student[col.field];
//           filteredStudent[col.id] = value !== undefined && value !== null && value !== '' ? value : '-';
//         }
//       });
//       return filteredStudent;
//     });
//   }, [processedStudentData, selectedColumns, allColumns]);

//   const dynamicColumns = useMemo(() => {
//     return allColumns
//       .filter((col) => selectedColumns.includes(col.id))
//       .map((col) => {
//         if (col.id === 'logo') {
//           return {
//             title: translate(col.label),
//             field: col.id,
//             hozAlign: 'center',
//             headerHozAlign: 'center',
//             width: 80,
//             render: (row) =>
//               row[col.id] && row[col.id] !== '-' ? (
//                 <div className="flex justify-center items-center">
//                   <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center bg-gray-100">
//                     <img
//                       src={row[col.id]}
//                       alt="Student Logo"
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.style.display = 'none';
//                         e.currentTarget.parentElement.querySelector(
//                           '.no-img'
//                         ).style.display = 'block';
//                       }}
//                     />
//                     <span className="no-img hidden text-gray-400 text-[10px]">
//                       No Image
//                     </span>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex justify-center items-center">
//                   <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 text-[10px] overflow-hidden">
//                     <img
//                       src={`/avatar.png`}
//                       alt="Student Logo"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 </div>
//               ),
//           };
//         }
//         return {
//           title: translate(col.label),
//           field: col.id,
//           hozAlign: 'center',
//           headerHozAlign: 'center',
//           render: (row) => <p className="text-sm">{row[col.id]}</p>,
//         };
//       });
//   }, [selectedColumns, translate]);

//   const exportToExcel = useCallback(async () => {
//     const result = await Swal.fire({
//       title: translate('Are you sure?'),
//       text: translate('You want to export this data to Excel?'),
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#3085d6',
//       cancelButtonColor: '#d33',
//       confirmButtonText: translate('Yes, export it!'),
//       cancelButtonText: translate('Cancel'),
//       width: '400px',
//     });

//     if (!result.isConfirmed) return;

//     if (!validateFilters()) {
//       toast.error('অনুগ্রহ করে সব প্রয়োজনীয় ফিল্টার নির্বাচন করুন।');
//       return;
//     }

//     if (!filteredStudentData.length) {
//       toast.error('রপ্তানি করার জন্য কোনো ডেটা পাওয়া যায়নি।');
//       return;
//     }

//     if (!selectedColumns.length) {
//       toast.error('অনুগ্রহ করে রপ্তানির জন্য অন্তত একটি কলাম নির্বাচন করুন।');
//       return;
//     }

//     try {
//       const workbook = XLSX.utils.book_new();

//       const exportData = filteredStudentData.map((row) => {
//         const rowData = {};
//         selectedColumns.forEach((colId) => {
//           const column = allColumns.find((c) => c.id === colId);
//           if (colId === 'logo') {
//             rowData[column.label] =
//               row[colId] && row[colId] !== '-' ? 'Logo Available' : 'No Logo';
//           } else {
//             rowData[column.label] = row[colId];
//           }
//         });
//         return rowData;
//       });

//       const worksheet = XLSX.utils.json_to_sheet(exportData);
//       XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

//       const excelBuffer = XLSX.write(workbook, {
//         bookType: 'xlsx',
//         type: 'array',
//       });

//       const blob = new Blob([excelBuffer], {
//         type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//       });

//       if ('showSaveFilePicker' in window) {
//         try {
//           const handle = await window.showSaveFilePicker({
//             suggestedName: 'Student_Data.xlsx',
//             types: [
//               {
//                 description: 'Excel Files',
//                 accept: {
//                   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
//                     ['.xlsx'],
//                 },
//               },
//             ],
//           });
//           const writable = await handle.createWritable();
//           await writable.write(blob);
//           await writable.close();
//         } catch (error) {
//           if (error.name !== 'AbortError') {
//             const url = URL.createObjectURL(blob);
//             const a = document.createElement('a');
//             a.href = url;
//             a.download = 'Student_Data.xlsx';
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             URL.revokeObjectURL(url);
//           }
//         }
//       } else {
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = 'Student_Data.xlsx';
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//       }

//       await Swal.fire({
//         icon: 'success',
//         title: translate('Data exported successfully'),
//         timer: 1500,
//         showConfirmButton: false,
//         width: '400px',
//       });
//       // toast.success(translate('Data exported successfully')); // ❌ removed as per request
//     } catch (error) {
//       console.error('Error exporting to Excel:', error);
//       await Swal.fire({
//         icon: 'error',
//         title: translate('Error'),
//         text: translate('Failed to export data. Please try again.'),
//         width: '400px',
//       });
//       toast.error('ডেটা প্রিন্ট করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
//     }
//   }, [
//     filteredStudentData,
//     selectedColumns,
//     allColumns,
//     validateFilters,
//     translate,
//   ]);

//   // console.log(filteredStudentData, "filteredStudentData")

//   const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

//   const paginatedData = useMemo(() => {
//     const start = (currentPage - 1) * PAGE_SIZE;
//     return filteredStudentData.slice(start, start + PAGE_SIZE);
//   }, [filteredStudentData, currentPage]);

//   const exportData = {
//     SessionName: searchStudentInfo?.[0]?.AcademicSession?.SessionName,
//     ClassName: searchStudentInfo?.[0]?.Class?.ClassName,
//     data: filteredStudentData
//   };

//   const handlePrint = useCallback(() => {
//     showModal(translate('Data Export'), 'DATA_EXPORT_FEILD', exportData);
//   }, [translate, exportData]);

//   if (isSVTLoading || isSearchLoading) return <Loading />;
//   if (isSVTError || settingsError)
//     return <p className="text-red-500">Failed to load required data</p>;

//   return (
//     <FormProvider {...methods}>
//       <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col gap-6 font-default print:hidden">
//         <div className="flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
//           <h2 className="text-xl font-bold text-black shrink-0 2xl:mr-6">
//             {translate('Export students data')}
//           </h2>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-4 flex-1">
//             <DefaultSelect
//               options={sessionData || []}
//               require={'Session is required'}
//               nameField={'SessionName'}
//               valueField={'SessionID'}
//               registerKey={'SessionID'}
//               type={'number'}
//               label={translate('Session')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={subClassData || []}
//               require={'Sub Class is required'}
//               nameField={'SubClass'}
//               valueField={'SubClassID'}
//               registerKey={'SubClassID'}
//               type={'number'}
//               label={translate('Sub Class')}
//               error={errors.filters}
//               unicode={true}
//             />
//             <DefaultSelect
//               options={[
//                 { NewOldId: 1, ClassName: 'নতুন' },
//                 { NewOldId: 2, ClassName: 'পুরাতন' },
//                 { NewOldId: 3, ClassName: 'উভয়' },
//               ]}
//               require={'New/Old is required'}
//               nameField={'ClassName'}
//               valueField={'NewOldId'}
//               registerKey={'NewOldId'}
//               type={'number'}
//               label={translate('New/Old')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={residential || []}
//               require={'Living Condition is required'}
//               nameField={'ResidentialName'}
//               valueField={'RDID'}
//               registerKey={'ResidentialStatusId'}
//               type={'number'}
//               label={translate('Living Condition')}
//               error={errors.filters}
//             />
//             <DefaultSelect
//               options={[
//                 { UserActive: 1, UserActiveName: 'সক্রিয়' },
//                 { UserActive: 0, UserActiveName: 'নিষ্ক্রিয়' },
//               ]}
//               require={'User Active is required'}
//               nameField={'UserActiveName'}
//               valueField={'UserActive'}
//               registerKey={'UserActive'}
//               type={'number'}
//               label={"স্ট্যাটাস"}
//               error={errors.filters}
//             />
//           </div>

//           <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:mt-6 w-full 2xl:w-auto">
//             <Button
//               className="w-full sm:w-auto flex items-center gap-2"
//               onClick={exportToExcel}
//             >
//               {translate('Data Export (Excel)')}
//             </Button>

//             <Button
//               variant="secondary"
//               className="w-full sm:w-auto flex items-center gap-2 bg-green-500 hover:bg-green-600"
//               onClick={handlePrint}
//             >
//               {translate('Data Export (PDF)')}
//             </Button>
//           </div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-6">
//           <div className="w-full lg:w-1/4">
//             <div className="bg-gray-50 p-4 rounded-lg">
//               <h3 className="font-medium text-gray-700 mb-3">
//                 {translate('Select Columns')}
//               </h3>
//               <div className="p-2">
//                 <div className="mb-2">
//                   <label className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedColumns.length === allColumns.length}
//                       onChange={(e) => {
//                         if (e.target.checked) {
//                           setSelectedColumns(allColumns.map((col) => col.id));
//                         } else {
//                           setSelectedColumns([]);
//                         }
//                       }}
//                       className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
//                     />
//                     <span className="text-sm text-gray-700">
//                       {translate('All Select')}
//                     </span>
//                   </label>
//                 </div>

//                 <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
//                   {allColumns.map((column) => (
//                     <label
//                       key={column.id}
//                       className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
//                     >
//                       <input
//                         type="checkbox"
//                         checked={selectedColumns.includes(column.id)}
//                         onChange={() => handleColumnToggle(column.id)}
//                         className="form-checkbox h-4 w-4 text-blue-600 rounded cursor-pointer"
//                       />
//                       <span className="text-sm text-gray-700">
//                         {translate(column.label)}
//                       </span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {searchStudentError ? (
//             <div className="w-full lg:w-3/4">
//               <p className="text-red-500 text-center">
//                 {translate(
//                   'Failed to load student data. Please check your filters or try again later.'
//                 )}
//               </p>
//             </div>
//           ) : (
//             <div className="w-full lg:w-3/4">
//               {selectedColumns.length > 0 && filteredStudentData.length > 0 ? (
//                 <div className="space-y-4">
//                   <div className="overflow-x-auto border border-gray-200 rounded-lg">
//                     <SortableTable
//                       columns={dynamicColumns}
//                       data={paginatedData}
//                       isFilterColumn={false}
//                     />
//                   </div>

//                   <DefaultPagination
//                     currentPage={currentPage}
//                     totalPages={totalPages}
//                     onPageChange={setCurrentPage}
//                   />
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
//                   <p className="text-gray-500">
//                     {selectedColumns.length === 0
//                       ? translate('Select columns to display data')
//                       : translate('No data available for the selected filters')}
//                   </p>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </FormProvider>
//   );
// };

// export default DataExport;

