import { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Buffer } from 'buffer';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import { FaSearch } from 'react-icons/fa';
import SvgIcon from '../components/icons/SvgIcon';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useGetUserTypesQuery } from '../features/userType/userTypeSlice';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetClassListQuery } from '../features/class/classQuerySlice';
import { useGetInstitutionInfoQuery, useGetResidentialQuery } from '../features/settings/settingsQuerySlice';
import { useGetAttendanceReportQuery, useGetTimeShiftingsQuery } from '../features/attendance/attendanceSlice';
import bnBijoy2Unicode from '../utils/conveter';
import { errorText, toBnDigits } from '../view/deviceTimeSettings/timeUtils';
import ReportDocument from '../view/attendanceReport/ReportDocument';
import CustomizePanel from '../view/attendanceReport/CustomizePanel';
import UserSearch from '../view/attendanceReport/UserSearch';
import { exportExcel } from '../view/attendanceReport/exportExcel';
import { loadTemplates, storeTemplates } from '../view/attendanceReport/templates';
import {
  REPORT_TYPES,
  baseOf,
  buildReport,
  defaultSettings,
  digits,
  fmtDate,
  fmtTime,
  normalizeColumns,
  prepare,
  typeOf,
  weekdayOf,
} from '../view/attendanceReport/reportEngine';

const STUDENT_TYPE = '1';
const EMPTY = [];
const MAX_DAYS = 366;
const CARD = 'rounded-2xl border border-slate-200 bg-white shadow-sm';
const DATE_INPUT =
  'h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

// ব্রাউজারের লোকাল তারিখ "YYYY-MM-DD"
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const PRESETS = [
  { id: 'today', label: 'আজ' },
  { id: 'yesterday', label: 'গতকাল' },
  { id: 'last7', label: 'গত ৭ দিন' },
  { id: 'thisMonth', label: 'এই মাস' },
  { id: 'lastMonth', label: 'গত মাস' },
  { id: 'thisYear', label: 'এই বছর' },
];
const presetRange = (id) => {
  const now = new Date();
  const [y, m, d] = [now.getFullYear(), now.getMonth(), now.getDate()];
  const range = {
    today: [now, now],
    yesterday: [new Date(y, m, d - 1), new Date(y, m, d - 1)],
    last7: [new Date(y, m, d - 6), now],
    thisMonth: [new Date(y, m, 1), new Date(y, m + 1, 0)],
    lastMonth: [new Date(y, m - 1, 1), new Date(y, m, 0)],
    thisYear: [new Date(y, 0, 1), new Date(y, 11, 31)],
  }[id];
  return { from: iso(range[0]), to: iso(range[1]) };
};
const dayCount = (from, to) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
const nameOf = (list, field, id, nameField) => list.find((x) => String(x[field]) === String(id))?.[nameField];

function TypeCard({ type, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-w-0 flex-col items-start gap-1 rounded-xl border p-3 text-left transition ${
        active ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
      }`}
    >
      <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
        <SvgIcon name={type.icon} size={16} />
      </span>
      <span className={`text-[14px] font-bold leading-tight ${active ? 'text-blue-800' : 'text-slate-800'}`}>{type.name}</span>
      <span className="text-[12px] leading-snug text-slate-500">{type.hint}</span>
    </button>
  );
}
TypeCard.propTypes = {
  type: PropTypes.shape({ icon: PropTypes.string, name: PropTypes.string, hint: PropTypes.string }).isRequired,
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

const AttendenceReport = ({ pageTitle }) => {
  // ---------------- ফিল্টার
  const methods = useForm({
    defaultValues: { UserTypeID: '', SessionID: '', ClassID: '', ResidentialID: '', ShiftID: '' },
  });
  const { watch, setValue, getValues } = methods;
  const [userTypeId, sessionId, classId, residentialId, shiftId] = watch([
    'UserTypeID',
    'SessionID',
    'ClassID',
    'ResidentialID',
    'ShiftID',
  ]);
  const [reportUserId, setReportUserId] = useState(''); // ব্যক্তিগত রিপোর্টের ইউজার
  const isStudent = String(userTypeId ?? '') === STUDENT_TYPE;

  const [preset, setPreset] = useState('thisMonth');
  const [range, setRange] = useState(() => presetRange('thisMonth'));
  const choosePreset = (id) => {
    setPreset(id);
    setRange(presetRange(id));
  };

  const { data: userTypes = EMPTY } = useGetUserTypesQuery();
  const { data: sessions = EMPTY } = useGetSessionsQuery();
  const { data: classes = EMPTY } = useGetClassListQuery();
  const { data: residentials = EMPTY } = useGetResidentialQuery();
  const { data: shiftData } = useGetTimeShiftingsQuery();
  const shifts = shiftData?.data || EMPTY;

  const currentParams = useMemo(() => {
    const params = { from: range.from, to: range.to };
    const add = (key, value) => {
      if (value !== '' && value != null) params[key] = String(value);
    };
    add('UserTypeID', userTypeId);
    if (isStudent) {
      add('SessionID', sessionId);
      add('ClassID', classId);
      add('ResidentialID', residentialId);
    }
    add('ShiftID', shiftId);
    return params;
  }, [range, userTypeId, isStudent, sessionId, classId, residentialId, shiftId]);

  const [applied, setApplied] = useState(() => ({ params: { ...presetRange('thisMonth') }, labels: [] }));
  const dirty = JSON.stringify(currentParams) !== JSON.stringify(applied.params);

  const applyFilters = () => {
    const { from, to } = currentParams;
    if (!from || !to) return toast.warn('শুরু ও শেষ তারিখ দিন।');
    if (to < from) return toast.warn('শেষ তারিখ শুরুর তারিখের আগে হতে পারে না।');
    if (dayCount(from, to) > MAX_DAYS) return toast.warn(`সর্বোচ্চ ${toBnDigits(MAX_DAYS)} দিনের রিপোর্ট করা যায়।`);
    const v = getValues();
    const labels = [
      nameOf(userTypes, 'ID', currentParams.UserTypeID, 'TypeName'),
      currentParams.SessionID && `সেশন: ${nameOf(sessions, 'SessionID', v.SessionID, 'SessionName') || ''}`,
      nameOf(classes, 'ClassID', currentParams.ClassID, 'ClassName'),
      nameOf(residentials, 'RDID', currentParams.ResidentialID, 'ResidentialName'),
      nameOf(shifts, 'ID', currentParams.ShiftID, 'ShiftNameBangla'),
    ].filter(Boolean);
    setApplied({ params: currentParams, labels });
  };

  const onUserTypeChange = () => {
    setValue('SessionID', '');
    setValue('ClassID', '');
    setValue('ResidentialID', '');
  };

  const { data, isFetching, isLoading, error } = useGetAttendanceReportQuery(applied.params);

  // ---------------- রিপোর্ট সেটিংস
  const [settings, setSettings] = useState(() => defaultSettings('summary'));
  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const type = typeOf(settings.reportType);
  const base = baseOf(settings.reportType);
  const chooseType = (id) => setSettings((s) => defaultSettings(id, s));

  const prepared = useMemo(() => (data?.success ? prepare(data) : null), [data]);
  const columns = useMemo(() => normalizeColumns(settings.columns, base, prepared), [settings.columns, base, prepared]);
  const setColumns = (list) => update({ columns: list.map(({ key, on }) => ({ key, on })) });

  const report = useMemo(
    () =>
      prepared
        ? buildReport(prepared, { ...settings, userId: reportUserId })
        : { columns: [], rows: [], stats: [], info: null, legend: null, notice: null },
    [prepared, settings, reportUserId]
  );

  const generatedAt = useMemo(() => {
    const now = new Date();
    const hms = `${now.getHours()}:${now.getMinutes()}:00`;
    return `তৈরি: ${fmtDate(iso(now))}, ${fmtTime(hms, '12')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const meta = useMemo(() => {
    const { from, to } = data?.success ? data : applied.params;
    const datePart = digits(
      from === to ? `তারিখ: ${fmtDate(from)}, ${weekdayOf(from)}` : `তারিখ: ${fmtDate(from)} থেকে ${fmtDate(to)}`,
      settings
    );
    return {
      title: settings.title.trim() || type.title,
      subtitle: settings.subtitle.trim() || [datePart, ...applied.labels].join('  ·  '),
      generatedAt,
      info: report.info,
      stats: report.stats,
      legend: report.legend,
    };
  }, [data, applied, settings, type.title, generatedAt, report]);

  const { data: institutionData } = useGetInstitutionInfoQuery();
  const institution = useMemo(
    () => ({
      name: institutionData?.InstitutionName ? bnBijoy2Unicode(institutionData.InstitutionName) : '',
      address: institutionData?.Address ? bnBijoy2Unicode(institutionData.Address) : '',
      logo: institutionData?.Logo?.data ? `data:image/png;base64,${Buffer.from(institutionData.Logo.data).toString('base64')}` : '',
    }),
    [institutionData]
  );

  const reportUsers = data?.users || EMPTY;

  // ---------------- ডাউনলোড
  const docRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const [busy, setBusy] = useState(null);
  const [progress, setProgress] = useState('');
  const fileBase = `${meta.title.replace(/[\\/:*?"<>|]+/g, ' ').trim() || 'attendance-report'}_${data?.from || ''}_${data?.to || ''}`;
  const canDownload = Boolean(prepared) && !report.notice && !busy;

  const downloadPdf = async () => {
    setBusy('pdf');
    try {
      await docRef.current.exportPdf(`${fileBase}.pdf`, (i, n) => setProgress(`${toBnDigits(i)} / ${toBnDigits(n)}`));
    } catch (e) {
      console.error(e);
      toast.error('PDF তৈরি করা যায়নি।');
    } finally {
      setBusy(null);
      setProgress('');
    }
  };
  const downloadExcel = async () => {
    setBusy('excel');
    try {
      await exportExcel({ report, meta, settings, institution, fileName: `${fileBase}.xlsx` });
    } catch (e) {
      console.error(e);
      toast.error('Excel তৈরি করা যায়নি।');
    } finally {
      setBusy(null);
    }
  };

  // ---------------- টেমপ্লেট
  const [templates, setTemplates] = useState(loadTemplates);
  const saveTemplate = (name) => {
    const clean = name.trim();
    if (!clean) return false;
    const list = [...templates.filter((t) => t.name !== clean), { id: Date.now(), name: clean, settings }];
    setTemplates(list);
    if (storeTemplates(list)) toast.success('টেমপ্লেট রাখা হয়েছে।');
    else toast.warn('এই ব্রাউজারে টেমপ্লেট সংরক্ষণ করা যাচ্ছে না — শুধু এই সেশনে থাকবে।');
    return true;
  };
  const loadTemplate = (t) => {
    setSettings({ ...defaultSettings(t.settings.reportType), ...t.settings });
    toast.info(`"${t.name}" টেমপ্লেট চালু হয়েছে।`);
  };
  const deleteTemplate = async (t) => {
    const { isConfirmed } = await Swal.fire({
      title: 'টেমপ্লেট মুছবেন?',
      text: t.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'মুছুন',
      cancelButtonText: 'না',
      confirmButtonColor: '#e11d48',
    });
    if (!isConfirmed) return;
    const list = templates.filter((x) => x.id !== t.id);
    setTemplates(list);
    storeTemplates(list);
  };

  const rowCount = report.rows.filter((r) => r.kind !== 'group').length;

  return (
    <div className="font-default space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
          <SvgIcon name="SubReport" size={22} />
        </span>
        <div className="min-w-0">
          <h3 className="font-SolaimanLipi text-[20px] font-bold text-slate-800 sm:text-[22px]">{pageTitle}</h3>
          <p className="text-sm text-slate-500">রিপোর্টের ধরন ও ফিল্টার বেছে নিন, নিজের মতো সাজান, তারপর PDF বা Excel ডাউনলোড করুন।</p>
        </div>
      </div>

      {/* ---------- রিপোর্টের ধরন ---------- */}
      <section className={`${CARD} p-4`}>
        <h4 className="mb-3 text-[16px] font-bold text-slate-800">রিপোর্টের ধরন</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:grid-cols-8">
          {REPORT_TYPES.map((t) => (
            <TypeCard key={t.id} type={t} active={t.id === settings.reportType} onClick={() => chooseType(t.id)} />
          ))}
        </div>
      </section>

      {/* ---------- ফিল্টার ---------- */}
      <FormProvider {...methods}>
        <section className={`${CARD} p-4`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-[16px] font-bold text-slate-800">ফিল্টার</h4>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => choosePreset(p.id)}
                  className={`rounded-full border px-3 py-1 text-[13px] transition ${
                    preset === p.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block font-SolaimanLipi">
              <span className="mb-1 block text-sm font-bold text-black">শুরুর তারিখ :</span>
              <input
                type="date"
                className={DATE_INPUT}
                value={range.from}
                onChange={(e) => {
                  setPreset('');
                  setRange((r) => ({ ...r, from: e.target.value }));
                }}
              />
            </label>
            <label className="block font-SolaimanLipi">
              <span className="mb-1 block text-sm font-bold text-black">শেষ তারিখ :</span>
              <input
                type="date"
                className={DATE_INPUT}
                value={range.to}
                onChange={(e) => {
                  setPreset('');
                  setRange((r) => ({ ...r, to: e.target.value }));
                }}
              />
            </label>
            <DefaultSelect
              label="ইউজার টাইপ"
              registerKey="UserTypeID"
              options={userTypes}
              valueField="ID"
              nameField="TypeName"
              defaultValue="সব"
              onChange={onUserTypeChange}
            />
            <DefaultSelect label="শিফট" registerKey="ShiftID" options={shifts} valueField="ID" nameField="ShiftNameBangla" defaultValue="সব শিফট" />
            {isStudent && (
              <>
                <DefaultSelect
                  label="সেশন"
                  registerKey="SessionID"
                  options={sessions}
                  valueField="SessionID"
                  nameField="SessionName"
                  defaultValue="সব সেশন"
                />
                <DefaultSelect label="শ্রেণী" registerKey="ClassID" options={classes} valueField="ClassID" nameField="ClassName" defaultValue="সব শ্রেণী" />
                <DefaultSelect
                  label="আবাসিক অবস্থা"
                  registerKey="ResidentialID"
                  options={residentials}
                  valueField="RDID"
                  nameField="ResidentialName"
                  defaultValue="সব"
                />
              </>
            )}
            {type.needsUser && (
              <div className="sm:col-span-2">
                <UserSearch users={reportUsers} value={reportUserId} onChange={setReportUserId} disabled={!reportUsers.length} />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
            {dirty && <span className="text-[13px] text-amber-600">ফিল্টার বদলেছে — নতুন রিপোর্টের জন্য “রিপোর্ট দেখুন” চাপুন</span>}
            <button
              type="button"
              onClick={applyFilters}
              disabled={isFetching}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
            >
              <FaSearch size={14} />
              {isFetching ? 'লোড হচ্ছে…' : 'রিপোর্ট দেখুন'}
            </button>
          </div>
        </section>
      </FormProvider>

      {/* ---------- সাজানো + প্রিভিউ ---------- */}
      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="order-2 xl:order-1">
          <CustomizePanel
            settings={settings}
            update={update}
            base={base}
            columns={columns}
            setColumns={setColumns}
            templates={templates}
            onSaveTemplate={saveTemplate}
            onLoadTemplate={loadTemplate}
            onDeleteTemplate={deleteTemplate}
          />
        </div>

        <section className={`${CARD} order-1 min-w-0 overflow-hidden xl:order-2`}>
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="min-w-0">
              <h4 className="truncate text-[17px] font-bold text-slate-800">{meta.title}</h4>
              <p className="text-[13px] text-slate-500">
                {prepared
                  ? `${toBnDigits(rowCount)} টি সারি · ${toBnDigits(pageCount)} পৃষ্ঠা`
                  : 'প্রিভিউ'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={downloadPdf}
                disabled={!canDownload}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
              >
                <SvgIcon name="TbFileTypePdf" size={17} />
                {busy === 'pdf' ? `PDF তৈরি হচ্ছে ${progress}` : 'PDF ডাউনলোড'}
              </button>
              <button
                type="button"
                onClick={downloadExcel}
                disabled={!canDownload}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <SvgIcon name="FileSpreadsheet" size={17} />
                {busy === 'excel' ? 'Excel তৈরি হচ্ছে…' : 'Excel ডাউনলোড'}
              </button>
            </div>
          </header>

          <div className="relative bg-slate-100 p-3 sm:p-5">
            {isFetching && prepared && (
              <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/60 pt-24 text-sm font-semibold text-slate-600">
                রিপোর্ট তৈরি হচ্ছে…
              </div>
            )}
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
                {errorText(error, 'রিপোর্ট লোড করা যায়নি।')}
              </div>
            ) : isLoading || !prepared ? (
              <div className="flex h-64 items-center justify-center text-sm text-slate-500">রিপোর্ট তৈরি হচ্ছে…</div>
            ) : (
              <>
                {rowCount > 5000 && (
                  <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
                    অনেক বড় রিপোর্ট ({toBnDigits(rowCount)} সারি) — প্রিভিউ ও PDF তৈরিতে একটু সময় লাগবে। তারিখ বা ফিল্টার ছোট করলে দ্রুত হবে।
                  </p>
                )}
                <ReportDocument
                  ref={docRef}
                  report={report}
                  meta={meta}
                  settings={settings}
                  institution={institution}
                  onPageCount={setPageCount}
                />
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

AttendenceReport.propTypes = {
  pageTitle: PropTypes.string,
};

export default AttendenceReport;
