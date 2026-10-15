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
import { bufferToDataUrl } from '../utils/bufferDataURL';
import DefaultSearchSelect from '../components/Forms/DefaultSearchSelect';

const PAGE_SIZE = 10;

const CUSTOM_SIZE_SEP = '::';
const parseCustomColumn = (colId) => {
  const raw = String(colId).replace(/^custom_/, '');
  const idx = raw.lastIndexOf(CUSTOM_SIZE_SEP);
  if (idx === -1) return { label: raw, size: null };
  const label = raw.slice(0, idx);
  const size = parseFloat(raw.slice(idx + CUSTOM_SIZE_SEP.length));
  return { label, size: Number.isFinite(size) && size > 0 ? size : null };
};

const DataExport = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, setValue } = methods;
  const [logo, setLogo] = useState(null);

  const { data: institutionInfo, isLoading: isInstitutionLoading } =
    useGetInstitutionInfoQuery();

  console.log(institutionInfo, 'institutionInfo');

  const LOGO_IMG = bufferToDataUrl(institutionInfo?.Logo);
  const signatureNajemSrc = bufferToDataUrl(institutionInfo?.SignatureNajem);
  const signaturePrincipalSrc = bufferToDataUrl(institutionInfo?.SignaturePrincipal);

  const { data, isLoading: isLoadingLabel } = useGetLabelNameListsQuery();

  const allColumns = [
    { id: 'logo', label: 'Logo', field: 'logo', type: 'image' },
    { id: 'ID', label: `${data?.[0]?.StudentIDLabel ? data?.[0]?.StudentIDLabel : 'ID'}`, field: 'StudentCode' },
    { id: 'Name', label: 'Name', field: 'StudentName' },
    { id: 'Fathar Name', label: 'Father Name', field: 'FatherName' },
    { id: 'Mother Name', label: 'Mother Name', field: 'MotherName' },
    { id: 'Mobile 1', label: 'Mobile 1', field: 'Mobile1' },
    { id: 'Mobile 2', label: 'Mobile 2', field: 'Mobile2' },
    { id: 'E-mail', label: 'E-mail', field: 'Email' },
    { id: 'Session', label: 'Session', field: 'SessionName' },
    { id: 'Class', label: `${data?.[0]?.ClassNameLabel ? data?.[0]?.ClassNameLabel : 'Class'}`, field: 'ClassName' },
    { id: 'Sub Class', label: 'Sub Class', field: 'SubClass' },
    { id: 'Admission Serial', label: `${data?.[0]?.AdmissionIDLabel ? data?.[0]?.AdmissionIDLabel : 'ID'}`, field: 'AdmissionSerial' },
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
    { id: 'User Active', label: 'User Active', field: 'UserActionName' },
  ];

  const { data: templatesData, isLoading: isLoadingTemplates } =
    useGetAllStudentDataExportTemplatesQuery();

  const [SessionID, SubClassID, NewOldId, ResidentialStatusId, UserAction, FieldKey] = watch([
    'SessionID', 'SubClassID', 'NewOldId', 'ResidentialStatusId', 'UserAction', 'FieldKey',
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

  const selectedTemplate = useMemo(() => {
    if (!FieldKey || !templatesData?.data) return null;
    return templatesData.data.find((t) => t.FieldKey === FieldKey) || null;
  }, [FieldKey, templatesData]);

  const selectedTemplateColumns = useMemo(() => {
    return selectedTemplate?.FieldValue?.selectedColumns || [];
  }, [selectedTemplate]);

  const {
    data: searchStudentInfo,
    error: searchStudentError,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
  } = useGetStudentBySearchQuery(
    {
      SubClassID: SubClassID ? SubClassID : null,
      SessionID: SessionID ? SessionID : null,
      NewOldId: NewOldId ? NewOldId : null,
      ResidentialStatusId: ResidentialStatusId ? ResidentialStatusId : null,
      // ✅ UserAction removed from API call (filtered locally)
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
        StudentCode: student.User?.UserCode || '',
        StudentName: student.User?.UserName || '',
        FatherName: student.User?.FatherName || '',
        MotherName: student.User?.MotherName || '',
        Mobile1: student.User?.Mobile1 || '',
        Mobile2: student.User?.Mobile2 || '',
        Email: student.User?.Email || '',
        DateOfBirth: student.User?.DateOfBirth || '',
        NIDNO: student.User?.NIDNO || '',
        BloodGroup: student.User?.BloodGroup || '',
        GenderID: student.User?.GenderID === 1 ? 'ছেলে' : 'মহিলা' || '',
        SessionName: student.AcademicSession?.SessionName || '',
        ClassName: student.Class?.ClassName || '',
        SubClass: student.SubClass?.SubClass || '',
        AdmissionSerial: student.AdmissionSerial || '',
        NewOldId: student.NewOldId || '',
        ResidentialStatusId: student.ResidentialStatusId || '',
        ResidentialName:
          student.ResidentialStatusId === 1 ? 'আবাসিক' :
            student.ResidentialStatusId === 2 ? 'অনাবাসিক' : '',
        permanentVill: student.User?.permanentVill || '',
        permanentPost: student.User?.permanentPost || '',
        PoliceStationName: student.User?.permanentPoliceStation?.PoliceStationName || '',
        PermanentDistrictName: student.User?.permanentPoliceStation?.District?.DistrictName || '',
        PermanentDivisionName: student.User?.permanentPoliceStation?.District?.Division?.DivisionName || '',
        TransientVill: student.User?.TransientVill || '',
        TransientPost: student.User?.TransientPost || '',
        TransientPoliceStationName: student.User?.transientPoliceStation?.PoliceStationName || '',
        TransientDistrictName: student.User?.transientPoliceStation?.District?.DistrictName || '',
        TransientDivisionName: student.User?.transientPoliceStation?.District?.Division?.DivisionName || '',
        logo: studentLogo,
        SFTID: student.SFTID,
        ExamAction: student.ExamAction,
        AdmissionStatus: student.AdmissionStatus,
        AdmissionAction: student.AdmissionAction,
        FinancialStatus: student.FinancialStatus || '',
        UserAction: student.User?.UserAction,
        // ✅ UserAction 1 = সক্রিয়, 0 = নিষ্ক্রিয়
        UserActionName:
          student.User?.UserAction === 1 ? 'সক্রিয়' :
            student.User?.UserAction === 0 ? 'নিষ্ক্রিয়' : '',
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

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const activeColumns = useMemo(() => {
    if (!selectedTemplateColumns.length) return [];

    return selectedTemplateColumns
      .map((colId) => {
        if (typeof colId === 'string' && colId.startsWith('custom_')) {
          const { label, size } = parseCustomColumn(colId);
          return {
            id: colId,
            label,
            field: null,
            isCustom: true,
            type: 'text',
            size,
          };
        }

        const base = allColumns.find((c) => c.id === colId);
        if (!base) return null;
        return { ...base, isCustom: false };
      })
      .filter(Boolean);
  }, [selectedTemplateColumns]);

  const filteredStudentData = useMemo(() => {
    if (!processedStudentData.length || !activeColumns.length) return [];

    let filtered = processedStudentData;

    // ✅ UserAction filter locally (since removed from API)
    if (UserAction !== undefined && UserAction !== null && UserAction !== '') {
      filtered = filtered.filter(
        (student) => Number(student.UserAction) === Number(UserAction)
      );
    }

    return filtered.map((student) => {
      const filteredStudent = {};
      activeColumns.forEach((col) => {
        if (col.isCustom) {
          filteredStudent[col.id] = '';
        } else {
          const value = student[col.field];
          filteredStudent[col.id] =
            value !== undefined && value !== null && value !== '' ? value : '';
        }
      });
      return filteredStudent;
    });
  }, [processedStudentData, activeColumns, UserAction]);

  useEffect(() => {
    if (!filteredStudentData.length) {
      setSelectedRowIds([]);
      return;
    }
    const allIds = filteredStudentData.map((_, idx) => idx);
    setSelectedRowIds(allIds);
  }, [filteredStudentData]);

  const selectedPrintData = useMemo(() => {
    if (!filteredStudentData.length) return [];
    return filteredStudentData.filter((_, idx) => selectedRowIds.includes(idx));
  }, [filteredStudentData, selectedRowIds]);

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

  const dynamicColumns = useMemo(() => {
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
            row[col.id] && row[col.id] !== '' ? (
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

  const validateFilters = useCallback(() => {
    const { SessionID, SubClassID, ResidentialStatusId } = methods.getValues();
    const isValid = SessionID && SubClassID && ResidentialStatusId;
    setErrors((prev) => ({ ...prev, filters: !isValid }));
    return isValid;
  }, [methods]);

  /* ============================================================
    ✅ PRINT — Dynamic template (only selected rows)
    - সিগনেচার শুধু শেষ পেজে
    - capacity সঠিক হিসাব
    - প্রতিটা পেজ পুরোপুরি ভরে যাবে
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
    const todayBn = new Date().toLocaleDateString('bn-BD');

    const printColumns = activeColumns.map((col) => ({
      id: col.id,
      name: col.isCustom ? col.label : col.id,
      field: col.field,
      isCustom: col.isCustom,
      isImage: col.type === 'image',
      size: col.isCustom ? col.size : null,
    }));

    const recommended = printColumns.length > 7 ? 'Landscape' : 'Portrait';
    const orientResult = await Swal.fire({
      title: 'কাগজের অবস্থান নির্বাচন করুন',
      text: `${printColumns.length}টি কলাম আছে — ${recommended} ভালো হবে।`,
      icon: 'question',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Portrait',
      denyButtonText: 'Landscape',
      cancelButtonText: translate('Cancel'),
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#16a34a',
      cancelButtonColor: '#6b7280',
      width: '420px',
    });
    if (orientResult.isDismissed) return;
    const isLandscape = orientResult.isDenied;

    const MM = 96 / 25.4;
    const PAGE_MARGIN_MM = 10;
    const pageWmm = isLandscape ? 297 : 210;
    const pageHmm = isLandscape ? 210 : 297;
    const contentW = Math.floor((pageWmm - PAGE_MARGIN_MM * 2) * MM);
    const contentH = Math.floor((pageHmm - PAGE_MARGIN_MM * 2) * MM);
    const SAFETY_PX = 4;
    const capacity = contentH - SAFETY_PX;

    const headerHtml = `
    <img class="pc-logo" src="${LOGO_IMG}" alt="logo" onerror="this.style.visibility='hidden';" />
    <div style="text-align: center; margin-bottom: 6px;">
      <h1 style="font-size: 26px; font-weight: bold; margin: 0; font-family: 'SolaimanLipi';">
        ${institutionInfo?.InstitutionName || ''}
      </h1>
      <p style="font-size: 15px; margin: 4px 0 0 0; color: #333; font-family: 'SolaimanLipi';">
        ${institutionInfo?.PoliceStation || ''}, ${institutionInfo?.District || ''}
      </p>
    </div>
    <div style="display: flex; justify-content: center; align-items: center; margin: 12px 0;">
      <div style="border: 1.5px solid #000; border-radius: 4px; padding: 5px 28px; font-size: 15px; font-weight: bold; font-family: 'SolaimanLipi'; background-color: #f9f9f9;">
        শিক্ষাবর্ষ : ${sessionName}
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-top: 6px; font-family: 'SolaimanLipi', sans-serif;">
      <div style="text-align: left; font-weight: bold; font-size: 15px;">শ্রেণি/জামাতঃ ${className}</div>
      <div style="text-align: center; font-weight: bold; font-size: 22px; padding: 0 10px;">
        <span style="border-bottom: 2px solid #000; padding-bottom: 4px; display: inline-block;">${reportName}</span>
      </div>
      <div style="text-align: right; font-size: 13px; color: #444;">প্রিন্ট: ${todayBn}</div>
    </div>
  `;

    const colHeadHtml = `
    <tr style="background-color: #eaeaea;">
      <th style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; width: 40px;">ক্র</th>
      ${printColumns.map((c) => `
        <th style="border: 1px solid #000; padding: 6px 4px; text-align: center; font-weight: bold; font-family: 'SolaimanLipi'; font-size: 13px;${c.size ? ` width: ${c.size}%;` : ''}">
          ${c.isImage ? translate('Image') : translate(c.name)}
        </th>
      `).join('')}
    </tr>
  `;

    const rowHtml = (row, idx) => `
    <tr>
      <td style="border: 1px solid #000; padding: 6px 5px; text-align: center;">${idx + 1}</td>
      ${printColumns.map((col) => {
      const cellValue = row[col.id];
      if (col.isImage) {
        return `
          <td style="border: 1px solid #000; padding: 4px; text-align: center;">
            ${cellValue ? `<img src="${cellValue}" style="max-height: 70px; margin: auto; width: 55px; object-fit: cover; border-radius: 4px;" onerror="this.onerror=null; this.src='/avatar.png';" />` : ''}
          </td>
        `;
      }
      return `
        <td style="border: 1px solid #000; padding: 6px 5px; text-align: center; font-family: 'SolaimanLipiNormal', 'SolaimanLipi';">
          ${cellValue || ''}
        </td>
      `;
    }).join('')}
    </tr>
  `;

    /* ✅ সিগনেচার ব্লক — শুধু শেষ পেজে দেখাবে */
    const signHtml = `
    <div class="sign-wrap">
      <div class="sign-row">
        <div class="sign-box">
          <img src="${signaturePrincipalSrc}" alt="signature" onerror="this.style.visibility='hidden';" />
          <div class="sign-line">
            <p class="sign-name">${institutionInfo?.PrincipalName || ''}</p>
          </div>
        </div>
        <div class="sign-box">
          <img src="${signatureNajemSrc}" alt="signature" onerror="this.style.visibility='hidden';" />
          <div class="sign-line">
            <p class="sign-name">${institutionInfo?.NajemName || ''}</p>
          </div>
        </div>
      </div>
      <div class="soft">Software Developed by <span style="color: #16a34a;">SAHARAIT</span></div>
    </div>
  `;

    const css = `
    @page { size: A4 ${isLandscape ? 'landscape' : 'portrait'}; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .pc-root { font-family: 'SolaimanLipi', sans-serif; color: #000; }
    .pc-root .pc-header { display: flow-root; position: relative; margin-bottom: 8px; }
    .pc-root .pc-logo { position: absolute; left: 0; top: 0; margin-top: 15px;  height:${isLandscape ? "90px" : "60px"}; width: auto; max-width: 140px; object-fit: contain;}
    .pc-root .print-page { 
      box-sizing: border-box; 
      width: ${pageWmm}mm; 
      height: ${pageHmm - 1}mm; 
      padding: ${PAGE_MARGIN_MM}mm; 
      overflow: hidden; 
      display: flex;
      flex-direction: column;
    }
    .pc-root .print-page + .print-page { 
      break-before: page; 
      page-break-before: always; 
    }
    .pc-root table.report-table { 
      width: 100%; 
      border-collapse: collapse; 
      font-family: 'SolaimanLipiNormal', 'SolaimanLipi', sans-serif; 
      font-size: 13px; 
    }
    .pc-root table.report-table tr { 
      page-break-inside: avoid; 
      break-inside: avoid; 
    }
    /* ✅ sign-wrap শেষ পেজে নিচে বসবে */
    .pc-root .sign-wrap {
      margin-top: auto;
      padding-top: 30px;
      page-break-inside: avoid;
      break-inside: avoid;
      flex-shrink: 0;
    }
    .pc-root .sign-row { display: flex; justify-content: space-around; gap: 40px; }
    .pc-root .sign-box { width: 40%; text-align: center; }
    .pc-root .sign-box img { height: 55px; display: block; margin: 0 auto 4px auto; object-fit: contain; }
    .pc-root .sign-line { border-top: 1.5px dashed #777; padding-top: 6px; }
    .pc-root .sign-name { font-weight: bold; font-size: 14px; margin: 0; font-family: 'SolaimanLipi', sans-serif; }
    .pc-root .soft {
      margin-top: 10px;
      border-top: 1px solid #ddd;
      padding-top: 3px;
      font-size: 9px;
      color: #555;
      text-align: center;
    }
  `;

    const withTimeout = (p, ms) =>
      Promise.race([p, new Promise((resolve) => setTimeout(resolve, ms))]);

    const waitForImages = (root) => {
      const imgs = Array.from(root.querySelectorAll('img'));
      return Promise.all(
        imgs.map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) return resolve();
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            })
        )
      );
    };

    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText = `position: fixed; left: -99999px; top: 0; width: ${contentW}px; height: 30000px; border: 0; opacity: 0; pointer-events: none;`;
    const removeIframe = () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    let win = null;

    try {
      document.body.appendChild(iframe);
      const idoc = iframe.contentDocument;
      win = iframe.contentWindow;

      const appStyles = Array.from(
        document.querySelectorAll('link[rel="stylesheet"], style')
      )
        .map((n) => n.outerHTML)
        .join('\n');

      idoc.open();
      idoc.write(
        `<!doctype html><html><head><meta charset="utf-8"><title>${reportName}</title>${appStyles}<style>${css}</style></head><body class="pc-root"></body></html>`
      );
      idoc.close();

      const links = Array.from(idoc.querySelectorAll('link[rel="stylesheet"]'));
      await withTimeout(
        Promise.all(
          links.map(
            (l) =>
              new Promise((resolve) => {
                if (l.sheet) return resolve();
                l.addEventListener('load', resolve, { once: true });
                l.addEventListener('error', resolve, { once: true });
              })
          )
        ),
        5000
      );

      // ✅ প্রথমে সব row দিয়ে render, measurement নেওয়ার জন্য
      idoc.body.innerHTML = `
      <div class="pc-header">${headerHtml}</div>
      <table class="report-table">
        <thead>${colHeadHtml}</thead>
        <tbody>${selectedPrintData.map((row, idx) => rowHtml(row, idx)).join('')}</tbody>
      </table>
      ${signHtml}
    `;

      if (idoc.fonts && idoc.fonts.ready) {
        await withTimeout(idoc.fonts.ready, 3000);
      }
      await withTimeout(waitForImages(idoc.body), 5000);

      const rowHeights = Array.from(idoc.querySelectorAll('tbody tr')).map(
        (tr) => tr.getBoundingClientRect().height
      );
      const headerH = idoc.querySelector('.pc-header').getBoundingClientRect().height;
      const colHeadH = idoc.querySelector('thead').getBoundingClientRect().height;
      const signH = idoc.querySelector('.sign-wrap').getBoundingClientRect().height;

      const baseUsed = headerH + colHeadH;

      /* ============================================================
         ✅ পেজ ভাগ করা — শেষ পেজে সিগনেচার ফিট আছে কিনা চেক করা হয়
      ============================================================ */
      const pages = [];
      let cur = { rows: [], used: baseUsed };

      rowHeights.forEach((h, i) => {
        const rowH = h + 0.5;
        if (cur.used + rowH > capacity && cur.rows.length > 0) {
          pages.push(cur);
          cur = { rows: [], used: baseUsed };
        }
        cur.rows.push(i);
        cur.used += rowH;
      });
      pages.push(cur);

      // ✅ শেষ পেজে সিগনেচার ফিট না হলে শেষ row-টা নতুন পেজে নিয়ে যাও
      const lastPage = pages[pages.length - 1];
      if (lastPage.used + signH > capacity && lastPage.rows.length > 1) {
        const moved = lastPage.rows.pop();
        lastPage.used -= rowHeights[moved] + 0.5;
        pages.push({ rows: [moved], used: baseUsed + rowHeights[moved] + 0.5 });
      }

      // ✅ চূড়ান্ত HTML render
      idoc.body.innerHTML = pages
        .map(
          (pg, pIdx) => `
        <div class="print-page">
          <div class="pc-header">${headerHtml}</div>
          <table class="report-table">
            <thead>${colHeadHtml}</thead>
            <tbody>
              ${pg.rows.map((i) => rowHtml(selectedPrintData[i], i)).join('')}
            </tbody>
          </table>
          ${pIdx === pages.length - 1 ? signHtml : ''}
        </div>
      `
        )
        .join('');

      await withTimeout(waitForImages(idoc.body), 5000);
    } catch (error) {
      console.error('Print error:', error);
      removeIframe();
      toast.error('প্রিন্ট প্রস্তুত করতে সমস্যা হয়েছে।');
      return;
    }

    win.onafterprint = () => setTimeout(removeIframe, 500);

    setTimeout(() => {
      try {
        win.focus();
        win.print();
      } catch (error) {
        console.error('Print error:', error);
        removeIframe();
        toast.error('প্রিন্ট শুরু করা যায়নি।');
        return;
      }
      setTimeout(removeIframe, 120000);
    }, 300);

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
              row[col.id] && row[col.id] !== '' ? 'Logo Available' : 'No Logo';
          } else {
            rowData[col.label] = row[col.id] ?? '';
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

  const totalPages = Math.ceil(filteredStudentData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudentData.slice(start, start + PAGE_SIZE);
  }, [filteredStudentData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [FieldKey, SessionID, SubClassID, NewOldId, ResidentialStatusId, UserAction]);

  const exportData = {
    SessionName: searchStudentInfo?.[0]?.AcademicSession?.SessionName,
    ClassName: searchStudentInfo?.[0]?.Class?.ClassName,
    data: filteredStudentData,
  };

  const handleModal = useCallback(() => {
    showModal(translate('Data Export'), 'DATA_EXPORT_FEILD');
  }, [translate]);

  if (
    isSVTLoading ||
    isLoadingTemplates ||
    isInstitutionLoading ||
    isLoadingLabel
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
                {translate('Add New Report')}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 flex-1">
            <div className="w-full">
              <DefaultSearchSelect
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
                label={translate('Report')}
                error={errors.filters}
              />
            </div>
            <div className="w-full">
              <DefaultSearchSelect options={sessionData || []} require={'Session is required'} nameField={'SessionName'} valueField={'SessionID'} registerKey={'SessionID'} type={'number'} label={translate('Session')} error={errors.filters} />
            </div>
            <div className="w-full">
              <DefaultSearchSelect
                options={subClassData || []}
                require={true}
                nameField="SubClass"
                valueField="SubClassID"
                registerKey="SubClassID"
                type="number"
                label="Sub Class"
                unicode={true}
                searchable={true}                       // 👈 সার্চ চালু
                searchPlaceholder="খুঁজুন..."           // অপশনাল
                noResultText="কিছু পাওয়া যায়নি"        // অপশনাল
              />
            </div>
            <div className="w-full">
              <DefaultSearchSelect
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
            </div>
            <div className="w-full">
              <DefaultSearchSelect options={residential || []} require={'Living Condition is required'} nameField={'ResidentialName'} valueField={'RDID'} registerKey={'ResidentialStatusId'} type={'number'} label={translate('Living Condition')} error={errors.filters} />
            </div>
            <div className="w-full">
              <DefaultSearchSelect
                options={[
                  { UserAction: 1, UserActionName: 'সক্রিয়' },
                  { UserAction: 0, UserActionName: 'নিষ্ক্রিয়' },
                ]}
                require={'User Active is required'}
                nameField={'UserActionName'}
                valueField={'UserAction'}
                registerKey={'UserAction'}
                type={'number'}
                label={'স্ট্যাটাস'}
                error={errors.filters}
              />
            </div>

            {/* Buttons Section */}
            <div className="w-full flex items-end justify-end gap-2 lg:col-span-1">
              {/* Main Print Button */}
              <button
                onClick={handlePrint}
                aria-label="Print"
                className={`group flex items-center justify-center border rounded-lg shadow-sm transition-all duration-200 w-10 h-10 bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 active:scale-95`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
              </button>

              {/* Three Dot Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="More options"
                  className={`group flex items-center justify-center border rounded-lg shadow-sm transition-all duration-200 w-10 h-10 ${showMenu ? 'border-blue-400 ring-2 ring-blue-400/30 bg-blue-50 text-blue-600' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 active:scale-95'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-all duration-300 ${showMenu ? 'rotate-90' : ''}`}>
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="12" cy="5" r="1"></circle>
                    <circle cx="12" cy="19" r="1"></circle>
                  </svg>
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl z-50 overflow-hidden border border-gray-100">
                    <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                        {translate('Export Options')}
                      </span>
                    </div>

                    {/* ✅ Print Button inside dropdown */}
                    <button
                      onClick={handlePrint}
                      className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 transition-all duration-200"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-all">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M8 13h2a1.5 1.5 0 0 1 0 3H8v-3Z" />
                          <path d="M14 16v-3h1a1.5 1.5 0 0 1 0 3h-1Z" />
                          <path d="M19 13h-2v3" />
                          <path d="M17 14.5h1.5" />
                        </svg>
                      </span>

                      <div className="flex flex-col items-start">
                        <span className="font-medium">{translate('PDF')}</span>
                        <span className="text-[11px] text-gray-400">
                          {translate('Download PDF report')}
                        </span>
                      </div>
                    </button>

                    <div className="mx-4 border-t border-dashed border-gray-200"></div>

                    {/* Excel Option */}
                    <button
                      onClick={handleExcel}
                      className="group w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 transition-all duration-200"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-[#1D6F42] group-hover:bg-[#1D6F42] group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

          {/* Selected count info */}
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