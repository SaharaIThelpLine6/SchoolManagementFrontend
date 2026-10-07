import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import Swal from 'sweetalert2';
import { skipToken } from '@reduxjs/toolkit/query';

import Button from '../components/Button/Button';
import DefaultInput from '../components/Forms/DefaultInput';
import DefaultSelect from '../components/Forms/DefaultSelect';
import RadioOption from '../components/Radio/RadioOption';
import DefaultPagination from '../components/Pagination/DefaultPagination';

import { setPageName } from '../features/auth/authSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { useGetExamNamesQuery } from '../features/student/studentQuerySlice';
import { useGetStudentAdmitCardsQuery } from '../features/exam/examQuerySlice';
import {
  useGetInstitutionInfoQuery,
  useGetResidentialQuery,
} from '../features/settings/settingsQuerySlice';

import AdmitCardGenerate, { AdmitCardFace } from '../components/AdmitCardGenerate';
import {
  ADMIT_FIELDS,
  ADMIT_LANGS,
  ADMIT_TEMPLATES,
  DEFAULT_ADMIT_LANG,
  MAX_FIELD_SELECT,
  PRINT_LAYOUTS,
  getAdmitDir,
  getFieldDemo,
  getFieldName,
  getFieldValue,
  getInstituteAddress,
  getInstituteName,
  getLayoutLabel,
  getTemplate,
  getUIText,
  isFieldAllowedForTemplate,
  normalizeAdmitRow,
  resolveFieldLabels,
  toLangDigit,
} from '../Data/admitCardConfig';

const PAGE_SIZE = 10;

/** প্রিন্টের আগে ফন্ট ও সব ছবি লোড হওয়া পর্যন্ত অপেক্ষা */
const waitForPrintReady = async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    if (document.fonts?.ready) await document.fonts.ready;
  } catch {
    /* ফন্ট API না থাকলে এড়িয়ে যাই */
  }

  const images = Array.from(document.querySelectorAll('.admit-print-root img'));
  await Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
          })
    )
  );
};

const ExamAdmitCard = ({ pageTitle = 'Exam Admit Card' }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const { watch, register, handleSubmit, setValue } = methods;

  const [selectedTemplate, setSelectedTemplate] = useState(
    ADMIT_TEMPLATES[0]?.id ?? null
  );
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [checkboxState, setCheckboxState] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [printData, setPrintData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // কার্ড ও এডিটর — দুইটারই ভাষা
  const [lang, setLang] = useState(DEFAULT_ADMIT_LANG);
  const ui = (key) => getUIText(key, lang);
  const uiDir = getAdmitDir(lang);

  // লোকাল টগল — সব ডিফল্টভাবে ON
  const [qrEnabled, setQrEnabled] = useState(true);
  const [photoEnabled, setPhotoEnabled] = useState(true);
  const [signNameEnabled, setSignNameEnabled] = useState(true);
  const [signEnabled, setSignEnabled] = useState(true);
  const [signDateEnabled, setSignDateEnabled] = useState(true);

  const displayToggles = [
    { id: 'qr', label: ui('qr'), checked: qrEnabled, onChange: setQrEnabled },
    { id: 'photo', label: ui('photo'), checked: photoEnabled, onChange: setPhotoEnabled },
    {
      id: 'signName',
      label: ui('signName'),
      checked: signNameEnabled,
      onChange: setSignNameEnabled,
    },
    { id: 'sign', label: ui('sign'), checked: signEnabled, onChange: setSignEnabled },
    {
      id: 'signDate',
      label: ui('date'),
      checked: signDateEnabled,
      onChange: setSignDateEnabled,
    },
  ];

  const { data: sessionData } = useGetSessionsQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassData } = useGetSubClassListQuery();
  const { data: institutionInfo } = useGetInstitutionInfoQuery();

  // প্রতিষ্ঠানের নাম ও ঠিকানা — ভাষা অনুযায়ী
  const instName = getInstituteName(institutionInfo, lang);
  const instAddress = getInstituteAddress(institutionInfo, lang);

  const SessionID = watch('SessionID');
  const ExamID = watch('ExamID');
  const SubClassID = watch('SubClassID');
  const UserCode = watch('UserCode');
  const RDID = watch('RDID');
  const reportType = watch('ReportID');
  const colorMode = watch('classType');

  const nameSize = watch(`institute_name_size_${selectedTemplate}`);
  const nameColor = watch(`institute_name_color_${selectedTemplate}`);
  const addressSize = watch(`institute_address_size_${selectedTemplate}`);
  const addressColor = watch(`institute_address_color_${selectedTemplate}`);

  const template = getTemplate(selectedTemplate);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const { data: studentAdmitCards = {}, isFetching } = useGetStudentAdmitCardsQuery(
    SessionID && ExamID && SubClassID && RDID
      ? UserCode?.trim()
        ? { SessionID, ExamID, SubClassID, RDID, UserCode }
        : { SessionID, ExamID, SubClassID, RDID }
      : skipToken
  );

  const studentList = useMemo(() => {
    const raw = Array.isArray(studentAdmitCards)
      ? studentAdmitCards
      : studentAdmitCards?.data ?? [];
    return raw.map(normalizeAdmitRow);
  }, [studentAdmitCards]);

  // LabelName টেবিল থেকে আসা লেবেল, ভাষা অনুযায়ী — না এলে config এর ভিত্তি নাম
  const fieldLabels = useMemo(
    () => resolveFieldLabels(studentAdmitCards?.labels, { lang }),
    [studentAdmitCards, lang]
  );

  // লেবেল এলে বা ভাষা বদলালে ইনপুটের মান আসলেই বদলাতে হয়।
  // শুধু defaultValue বা key দিয়ে রিমাউন্ট করলে react-hook-form এর ভিতরের
  // সংরক্ষিত মান পুরোনোই থেকে যায়, আর buildPrintRows সেটাই তুলে নেয়।
  useEffect(() => {
    ADMIT_FIELDS.forEach((f) => {
      setValue(`fieldkey_${f.id}`, fieldLabels[f.id]);
    });
  }, [fieldLabels, setValue]);

  useEffect(() => {
    setSelectedRows([]);
    setCurrentPage(1);
    setPrintData(null);
  }, [SessionID, ExamID, SubClassID, RDID, UserCode]);

  // টেমপ্লেট, ভাষা বা টগল বদলালে আগের আউটপুট বাতিল
  useEffect(() => {
    setPrintData(null);
  }, [
    selectedTemplate,
    checkboxState,
    reportType,
    colorMode,
    lang,
    qrEnabled,
    photoEnabled,
    signNameEnabled,
    signEnabled,
    signDateEnabled,
  ]);

  const totalPages = Math.ceil(studentList.length / PAGE_SIZE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentList.slice(start, start + PAGE_SIZE);
  }, [studentList, currentPage]);

  // ---------------------------------------------------------------- handlers
  const handleTemplateSelect = (id) => {
    setSelectedTemplate(id);
    setCheckboxState((prev) => prev.filter((f) => isFieldAllowedForTemplate(f, id)));
  };

  const handleFieldToggle = (fieldId, checked) => {
    setCheckboxState((prev) =>
      checked
        ? prev.includes(fieldId)
          ? prev
          : [...prev, fieldId]
        : prev.filter((f) => f !== fieldId)
    );
  };

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? studentList : []);
  };

  const handleRowSelect = (e, student) => {
    setSelectedRows((prev) =>
      e.target.checked
        ? prev.some((r) => r.AdmissionID === student.AdmissionID)
          ? prev
          : [...prev, student]
        : prev.filter((r) => r.AdmissionID !== student.AdmissionID)
    );
  };

  const buildPrintRows = (formData) =>
    selectedRows.map((row) => {
      const newRow = { ...row };

      checkboxState.forEach((key) => {
        const typed = formData[`fieldkey_${key}`];
        newRow[`fieldkey_${key}`] =
          typed && String(typed).trim() ? String(typed).trim() : fieldLabels[key] || key;
      });

      newRow.institute_name = instName;
      newRow.institute_address = instAddress;

      newRow.admit_name_color = nameColor || template.nameColor;
      newRow.admit_name_size = nameSize || template.nameSize;
      newRow.admit_address_color = addressColor || template.addressColor;
      newRow.admit_address_size = addressSize || template.addressSize;

      newRow.SignatureNajem = row.SignatureNajem || institutionInfo?.SignatureNajem;
      newRow.SignaturePrincipal =
        row.SignaturePrincipal || institutionInfo?.SignaturePrincipal;
      // নাম না পেলে কার্ড নিজেই ভাষা অনুযায়ী ডিফল্ট বসাবে
      newRow.PrincipalName = institutionInfo?.PrincipalName;
      newRow.NajemName = institutionInfo?.NajemName;

      return newRow;
    });

  const onSubmit = (formData) => {
    if (!selectedRows.length) {
      Swal.fire({
        icon: 'warning',
        title: ui('pickStudentTitle'),
        text: ui('pickStudentText'),
      });
      return null;
    }
    if (!reportType) {
      Swal.fire({
        icon: 'warning',
        title: ui('pickReportTitle'),
        text: ui('pickReportText'),
      });
      return null;
    }
    const rows = buildPrintRows(formData);
    setPrintData(rows);
    return rows;
  };

  const handlePrint = handleSubmit(async (formData) => {
    const rows = onSubmit(formData);
    if (!rows) return;
    await waitForPrintReady();
    window.print();
  });

  const colorOptions = [
    { id: 'poriyat', label: ui('blackWhite') },
    { id: 'hifz', label: ui('colored') },
  ];

  const reportOptions = Object.keys(PRINT_LAYOUTS).map((id) => ({
    id,
    label: getLayoutLabel(id, lang),
  }));

  // প্রিভিউ কার্ডের ডামি ডাটা — ভাষা অনুযায়ী
  const previewStudent = useMemo(() => {
    const row = {
      institute_name: instName,
      institute_address: instAddress,
      admit_name_color: nameColor,
      admit_name_size: nameSize,
      admit_address_color: addressColor,
      admit_address_size: addressSize,
      SignatureNajem: institutionInfo?.SignatureNajem,
      SignaturePrincipal: institutionInfo?.SignaturePrincipal,
      PrincipalName: institutionInfo?.PrincipalName,
      NajemName: institutionInfo?.NajemName,
      ExamName: getFieldDemo('ExamName', lang),
      SessionName: getFieldDemo('SessionName', lang),
      QRValue: `https://qmmsoft.com/${
        institutionInfo?.InstitutionCode || 'demo'
      }/students/1/1/1/${getFieldDemo('StudentCode', 'en')}`,
    };
    checkboxState.forEach((f) => {
      row[f] = getFieldDemo(f, lang);
      const typed = watch(`fieldkey_${f}`);
      row[`fieldkey_${f}`] =
        typed && String(typed).trim() ? String(typed).trim() : fieldLabels[f];
    });
    return row;
  }, [
    checkboxState,
    fieldLabels,
    institutionInfo,
    instName,
    instAddress,
    lang,
    nameColor,
    nameSize,
    addressColor,
    addressSize,
    watch,
  ]);

  const availableFields = ADMIT_FIELDS.filter((f) =>
    isFieldAllowedForTemplate(f.id, selectedTemplate)
  );

  const remaining = MAX_FIELD_SELECT - checkboxState.length;

  return (
    <>
      <div
        className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print"
        dir={uiDir}
      >
        {/* ------------------------------------------------------- header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <h3 className="text-[18px] font-bold">{ui('pageTitle')}</h3>

          {/* ভাষা নির্বাচন */}
          <div
            className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 p-1"
            dir="ltr"
          >
            {ADMIT_LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                  lang === l.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
            {/* ============================================ টেমপ্লেট সিলেক্টর */}
            <div>
              <p className="mb-3 text-[15px] text-gray-600">{ui('chooseDesign')}</p>
              <button
                type="button"
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-4 rounded-[10px] border-2 border-blue-200 p-3 hover:border-blue-500 transition"
                style={{ boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 12px -4px' }}
              >
                <div className="w-[150px] shrink-0 overflow-hidden rounded-[6px] border border-gray-200">
                  <TemplateThumb template={template} lang={lang} />
                </div>
                <div className={uiDir === 'rtl' ? 'text-right' : 'text-left'}>
                  <p className="text-[15px] font-bold">{template.title}</p>
                  <p className="text-[13px] text-blue-600 mt-1">{ui('changeDesign')}</p>
                </div>
              </button>
            </div>

            {/* ==================================== লাইভ প্রিভিউ + ফিল্ড সিলেকশন */}
            <div className="grid grid-cols-1 lg:grid-cols-[560px_1fr] gap-8">
              {/* লাইভ প্রিভিউ */}
              <div>
                <div className="w-[520px] max-w-full" dir="ltr">
                  <AdmitCardFace
                    template={template}
                    fields={checkboxState}
                    student={previewStudent}
                    lang={lang}
                    inName={instName}
                    inAddress={instAddress}
                    inLogo={institutionInfo?.Logo}
                    institutionCode={institutionInfo?.InstitutionCode}
                    showQR={qrEnabled}
                    showPhoto={photoEnabled}
                    showSignName={signNameEnabled}
                    showSign={signEnabled}
                    showSignDate={signDateEnabled}
                  />
                </div>

                {/* ফন্ট সাইজ ও কালার সেটিংস */}
                <div className="mt-4 grid grid-cols-2 gap-4 w-[520px] max-w-full">
                  <div className="border rounded-[8px] p-3">
                    <p className="text-[14px] mb-2">{ui('instituteName')}</p>
                    <div className="flex items-center gap-3" dir="ltr">
                      <input
                        type="number"
                        className="w-[70px] border rounded px-2 py-1"
                        defaultValue={template.nameSize}
                        {...register(`institute_name_size_${selectedTemplate}`)}
                      />
                      <input
                        type="color"
                        className="w-[50px] h-[32px]"
                        defaultValue={template.nameColor}
                        {...register(`institute_name_color_${selectedTemplate}`)}
                      />
                    </div>
                  </div>
                  <div className="border rounded-[8px] p-3">
                    <p className="text-[14px] mb-2">{ui('address')}</p>
                    <div className="flex items-center gap-3" dir="ltr">
                      <input
                        type="number"
                        className="w-[70px] border rounded px-2 py-1"
                        defaultValue={template.addressSize}
                        {...register(`institute_address_size_${selectedTemplate}`)}
                      />
                      <input
                        type="color"
                        className="w-[50px] h-[32px]"
                        defaultValue={template.addressColor}
                        {...register(`institute_address_color_${selectedTemplate}`)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ফিল্ড চেকবক্স + লেবেল এডিট */}
              <div>
                <div className="flex items-start justify-between gap-4 flex-wrap mb-1">
                  <p className="font-bold text-[16px]">
                    {checkboxState.length === 0
                      ? ui('selectUpTo')(toLangDigit(MAX_FIELD_SELECT, lang))
                      : remaining > 0
                      ? ui('canAddMore')(toLangDigit(remaining, lang))
                      : ui('maxSelected')}
                  </p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {displayToggles.map((tg) => (
                      <label
                        key={tg.id}
                        className="flex items-center gap-2 border rounded-full px-3 py-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <input
                          type="checkbox"
                          className="h-[15px] w-[15px] accent-blue-600"
                          checked={tg.checked}
                          onChange={(e) => tg.onChange(e.target.checked)}
                        />
                        <span className="text-[13px] font-medium text-gray-700">
                          {tg.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <p className="text-[14px] text-gray-500 mb-4">{ui('labelHint')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableFields.map((f) => {
                    const checked = checkboxState.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        className={`flex items-center gap-3 border rounded-[8px] px-3 py-2 ${
                          checked ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="h-[18px] w-[18px]"
                          checked={checked}
                          disabled={!checked && checkboxState.length >= MAX_FIELD_SELECT}
                          onChange={(e) => handleFieldToggle(f.id, e.target.checked)}
                        />
                        <span className="text-[15px] w-[130px] shrink-0">
                          {getFieldName(f.id, lang)}
                        </span>
                        {/* মান setValue দিয়ে বসে — defaultValue বা key লাগে না */}
                        <input
                          className="flex-1 min-w-0 border rounded px-2 py-1 text-[14px]"
                          disabled={!checked}
                          {...register(`fieldkey_${f.id}`)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ================================================ ফিল্টার ও প্রিন্ট */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <DefaultSelect
                  label={`${ui('session')} :`}
                  options={sessionData ?? []}
                  valueField="SessionID"
                  nameField="SessionName"
                  registerKey="SessionID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('examName')} :`}
                  options={examNameData ?? []}
                  valueField="ExamID"
                  nameField="ExamName"
                  registerKey="ExamID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('classJamaat')} :`}
                  options={subClassData ?? []}
                  valueField="SubClassID"
                  nameField="SubClass"
                  registerKey="SubClassID"
                  unicode
                />
                <DefaultSelect
                  label={`${ui('residential')} :`}
                  options={residentialData ?? []}
                  valueField="RDID"
                  nameField="ResidentialName"
                  registerKey="RDID"
                  unicode
                />
                <DefaultInput
                  label={ui('studentId')}
                  valueField="UserCode"
                  nameField="UserCode"
                  registerKey="UserCode"
                />
                <DefaultSelect
                  label={`${ui('reportType')} :`}
                  options={reportOptions}
                  valueField="id"
                  nameField="label"
                  registerKey="ReportID"
                />

                <fieldset className="border border-gray-200 rounded-lg p-3 md:col-span-2">
                  <legend className="text-gray-700 px-2 text-[14px]">
                    {ui('colorSelect')}
                  </legend>
                  <div className="flex flex-wrap gap-4">
                    {colorOptions.map((option) => (
                      <RadioOption
                        key={option.id}
                        option={option}
                        register={register}
                        name="classType"
                      />
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* শিক্ষার্থীর তালিকা */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-start">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={
                            studentList.length > 0 &&
                            selectedRows.length === studentList.length
                          }
                        />
                      </th>
                      <th className="p-2 text-start">{fieldLabels.StudentCode}</th>
                      <th className="p-2 text-start">{fieldLabels.StudentName}</th>
                      <th className="p-2 text-start">{fieldLabels.SubClass}</th>
                      <th className="p-2 text-start">{fieldLabels.RollNo}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((student) => (
                      <tr key={student.AdmissionID} className="border-t">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            onChange={(e) => handleRowSelect(e, student)}
                            checked={selectedRows.some(
                              (r) => r.AdmissionID === student.AdmissionID
                            )}
                          />
                        </td>
                        <td className="p-2">{toLangDigit(student.StudentCode, lang)}</td>
                        <td className="p-2">
                          {getFieldValue(student, 'StudentName', lang)}
                        </td>
                        <td className="p-2">
                          {getFieldValue(student, 'SubClass', lang) ||
                            getFieldValue(student, 'ClassName', lang)}
                        </td>
                        <td className="p-2">{toLangDigit(student.RollNo, lang)}</td>
                      </tr>
                    ))}
                    {paginatedData.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center p-4">
                          {isFetching ? ui('loading') : ui('searchHint')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                <Button type="submit">{ui('preview')}</Button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2 rounded-[8px] bg-blue-600 text-white"
                >
                  {ui('print')}
                </button>
              </div>

              {printData?.length ? (
                <p className="mt-3 text-[14px] text-green-700">
                  {ui('ready')(toLangDigit(printData.length, lang))}
                </p>
              ) : null}
            </div>
          </form>
        </FormProvider>
      </div>

      {/* ------------------------------------------------------------------
          একটাই আউটপুট নোড — স্ক্রিনে প্রিভিউ, প্রিন্টে এটাই ছাপে।
      ------------------------------------------------------------------- */}
      {printData?.length ? (
        <div className="mt-8 overflow-x-auto admit-output">
          <AdmitCardGenerate
            templateId={selectedTemplate}
            fields={checkboxState}
            data={printData}
            reportType={reportType}
            lang={lang}
            grayscale={colorMode === 'poriyat'}
            inName={instName}
            inAddress={instAddress}
            inLogo={institutionInfo?.Logo}
            institutionCode={institutionInfo?.InstitutionCode}
            showQR={qrEnabled}
            showPhoto={photoEnabled}
            showSignName={signNameEnabled}
            showSign={signEnabled}
            showSignDate={signDateEnabled}
          />
        </div>
      ) : null}

      {/* --------------------------------------------------- Template Modal */}
      {showTemplateModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 hidden_in_print"
          onClick={() => setShowTemplateModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            dir={uiDir}
            onClick={(e) => e.stopPropagation()}
          >
            {/* sticky হেডার — স্ক্রল করলেও উপরে বসে থাকবে */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
              <h3 className="text-[18px] font-bold">{ui('selectTemplate')}</h3>
              <button
                type="button"
                className="text-[26px] leading-none text-gray-500 hover:text-gray-800"
                onClick={() => setShowTemplateModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* শুধু এই অংশটা স্ক্রল হবে */}
            <div className="overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {ADMIT_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      handleTemplateSelect(tpl.id);
                      setShowTemplateModal(false);
                    }}
                    className={`rounded-[10px] border-2 p-2 transition ${
                      String(selectedTemplate) === String(tpl.id)
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="overflow-hidden rounded-[6px] border border-gray-100">
                      <TemplateThumb template={tpl} lang={lang} />
                    </div>
                    <p className="mt-2 text-center text-[15px]">{tpl.title}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

/** টেমপ্লেটের থাম্বনেইল */
const TemplateThumb = ({ template, lang }) => {
  const THUMB_W = 240;
  const scale = THUMB_W / 520;

  if (template.variant === 'image') {
    return (
      <img
        src={template.thumb || template.image}
        alt={template.title}
        className="w-full block"
      />
    );
  }

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '520 / 410',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 520,
          height: 410,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        <AdmitCardFace
          template={template}
          lang={lang}
          fields={['StudentName', 'FatherName', 'SubClass', 'StudentCode']}
          showQR={false}
          showPhoto
          student={{
            institute_name: 'জামিয়া ইসলামিয়া দারুল মাদরাসা',
            institute_address: 'যাত্রাবাড়ী, ঢাকা',
            ExamName: getFieldDemo('ExamName', lang),
            SessionName: getFieldDemo('SessionName', lang),
            StudentName: getFieldDemo('StudentName', lang),
            FatherName: getFieldDemo('FatherName', lang),
            SubClass: getFieldDemo('SubClass', lang),
            StudentCode: getFieldDemo('StudentCode', lang),
            fieldkey_StudentName: getFieldName('StudentName', lang),
            fieldkey_FatherName: getFieldName('FatherName', lang),
            fieldkey_SubClass: getFieldName('SubClass', lang),
            fieldkey_StudentCode: getFieldName('StudentCode', lang),
          }}
        />
      </div>
    </div>
  );
};

export default ExamAdmitCard;
