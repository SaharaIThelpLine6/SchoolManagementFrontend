// Device → Time Settings → ইউজারকে শিফটে যুক্ত করা
// বাম: হাজিরা তালিকার যেসব ইউজার এই শিফটে এখনো নেই (Time_AllUser − Time_ShiftSetting)
// ডান: যারা যুক্ত আছে (Time_ShiftSetting) — একটি সুইচ বা পুরো ইউজার সরানো যায়
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FormProvider, useForm } from 'react-hook-form';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { useGetUserTypesQuery } from '../../features/userType/userTypeSlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import { useGetClassListQuery } from '../../features/class/classQuerySlice';
import { useGetResidentialQuery } from '../../features/settings/settingsQuerySlice';
import {
  useCreateTimeSettingMutation,
  useDeleteTimeSettingMutation,
  useGetTimeSettingsFilteredQuery,
  useGetTimeSettingsQuery,
} from '../../features/attendance/attendanceSlice';
import { errorText } from './timeUtils';
import DeviceUploadButton, { DevicePicker } from './DeviceUploadBar';
import useDeviceUpload from './useDeviceUpload';
import DeviceUserBadge from './DeviceUserBadge';
import { useGetAttendanceDevicesQuery, useGetDeviceUsersQuery } from '../../features/attendance/attendanceDeviceSlice';

const STUDENT_TYPE = 1;
const EMPTY = [];

const matches = (user, q) =>
  !q ||
  String(user.UserName || '').toLowerCase().includes(q) ||
  String(user.FatherName || '').toLowerCase().includes(q) ||
  String(user.UserCode ?? '').includes(q);

// এক ইউজারের সব সুইচ এক সারিতে
const groupPending = (rows) => {
  const map = new Map();
  rows.forEach((r) => {
    if (!map.has(r.UserID)) {
      map.set(r.UserID, { key: r.UserID, UserID: r.UserID, UserCode: r.UserCode, UserName: r.UserName, FatherName: r.FatherName, switches: new Map() });
    }
    // শিফট নির্বাচন না থাকলে সার্ভার সুইচ ছাড়া শুধু ইউজার পাঠায় (SwitchID = null)
    if (r.SwitchID != null) {
      map.get(r.UserID).switches.set(r.SwitchID, { SwitchID: r.SwitchID, ShiftID: r.ShiftID, TypeNameBangla: r.TypeNameBangla });
    }
  });
  return [...map.values()].map((u) => ({ ...u, switches: [...u.switches.values()] }));
};

const groupAssigned = (rows) => {
  const map = new Map();
  const seen = new Set();
  rows.forEach((r) => {
    if (seen.has(r.ID)) return; // একাধিক ভর্তি থাকলে একই সারি বারবার আসে
    seen.add(r.ID);
    const key = `${r.UserID}-${r.ShiftID}`;
    if (!map.has(key)) {
      map.set(key, { key, UserID: r.UserID, UserCode: r.UserCode, UserName: r.UserName, FatherName: r.FatherName, ClassName: r.ClassName, ShiftNameBangla: r.ShiftNameBangla, items: [] });
    }
    map.get(key).items.push({ ID: r.ID, TypeNameBangla: r.TypeNameBangla });
  });
  return [...map.values()];
};

const pendingMessage = (error) => {
  const text = String(error?.data?.message || error?.data?.error || '');
  if (/switch/i.test(text)) return 'এই শিফটে এখনো কোনো সময়সূচি নেই — উপরে সময়সূচি যোগ করুন।';
  if (/users/i.test(text)) return 'এই ফিল্টারে হাজিরা তালিকায় কোনো ইউজার নেই। আগে "List Create" থেকে তালিকা তৈরি করুন।';
  return errorText(error, 'তথ্য আনা যায়নি।');
};

const SearchBox = ({ value, onChange, label }) => (
  <div className="relative w-full sm:max-w-[220px]">
    <SvgIcon name="FaSearch" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="search"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="নাম, পিতার নাম বা কোড"
      className="h-[34px] w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2 text-[13px] outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

SearchBox.propTypes = { value: PropTypes.string, onChange: PropTypes.func, label: PropTypes.string };

const Chip = ({ children, tone = 'emerald', onRemove, removeLabel }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-SolaimanLipi text-xs font-semibold ${
      tone === 'emerald' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
    }`}
  >
    {children}
    {onRemove && (
      <button type="button" onClick={onRemove} aria-label={removeLabel} title={removeLabel} className="rounded-full p-0.5 hover:bg-red-100 hover:text-red-600">
        <SvgIcon name="FiX" size={10} />
      </button>
    )}
  </span>
);

Chip.propTypes = { children: PropTypes.node, tone: PropTypes.string, onRemove: PropTypes.func, removeLabel: PropTypes.string };

const UserCell = ({ user, extra }) => (
  <div className="min-w-0">
    <p className="truncate font-SolaimanLipi text-[15px] font-semibold text-slate-800">{user.UserName || '-'}</p>
    <p className="truncate font-SolaimanLipi text-xs text-slate-500">
      {user.FatherName || ''}
      {extra && <span className="text-slate-400"> · {extra}</span>}
    </p>
  </div>
);

UserCell.propTypes = { user: PropTypes.object.isRequired, extra: PropTypes.string };

const AssignUsersPanel = ({ shifts }) => {
  // সব ড্রপডাউন DefaultSelect (react-hook-form) — মান watch দিয়ে পড়া হয়
  const methods = useForm({
    defaultValues: { ShiftID: '', UserTypeID: String(STUDENT_TYPE), SessionID: '', ClassID: '', ResidentialID: '', DeviceID: '' },
  });
  const { watch, setValue } = methods;
  const [shiftId, userTypeId, sessionId, classId, residentialId, deviceId] = watch([
    'ShiftID',
    'UserTypeID',
    'SessionID',
    'ClassID',
    'ResidentialID',
    'DeviceID',
  ]);
  const shift = shifts.find((s) => String(s.ID) === String(shiftId ?? '')) || null;
  const filters = useMemo(
    () => ({ userTypeId: String(userTypeId ?? ''), sessionId: String(sessionId ?? ''), classId: String(classId ?? ''), residentialId: String(residentialId ?? '') }),
    [userTypeId, sessionId, classId, residentialId]
  );
  const [pendingSearch, setPendingSearch] = useState('');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [pendingSel, setPendingSel] = useState(new Set());
  const [assignedSel, setAssignedSel] = useState(new Set());
  const [removing, setRemoving] = useState(false);

  // ---------- হাজিরা ডিভাইস: কে ডিভাইসে আছে ----------
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [rowUploading, setRowUploading] = useState(null);
  const [rosterPollMs, setRosterPollMs] = useState(60 * 1000);
  const { data: deviceData, isLoading: devicesLoading } = useGetAttendanceDevicesQuery();
  // ID ছাড়া (NULL) ডিভাইস বাদ — ব্যাকএন্ড তালিকা আনার সময় সেগুলোর ID ঠিক করে দেয়
  const devices = useMemo(
    () => (deviceData?.devices || []).filter((d) => !d.ownedByOther && Number(d.ID) > 0),
    [deviceData]
  );
  const device = devices.find((d) => String(d.ID) === String(deviceId ?? '')) || null;
  const { data: roster } = useGetDeviceUsersQuery(device?.ID, { skip: !device, pollingInterval: rosterPollMs });
  const { upload, isUploading } = useDeviceUpload(device);

  // পাঠানো/যাচাই চলাকালীন ঘন ঘন, বাকি সময় মিনিটে একবার
  useEffect(() => {
    const busy =
      roster?.syncing || Object.values(roster?.users || {}).some((u) => u.status === 'pending' || u.status === 'removing');
    setRosterPollMs(busy ? 8 * 1000 : 60 * 1000);
  }, [roster]);

  const deviceInfo = (u) => (device ? roster?.users?.[String(u.UserID)] : undefined);
  const uploadOne = async (u) => {
    setRowUploading(u.UserID);
    await upload([Number(u.UserID)], { confirm: false });
    setRowUploading(null);
  };
  // "শিফটে নেই" তালিকায় শুধু অবস্থা দেখায় (শিফট বদলালেও ইউজার ডিভাইসে থেকে যায়), আপলোড শুধু "শিফটে যুক্ত" থেকে
  const badge = (u, { canUpload = true } = {}) =>
    device ? (
      <DeviceUserBadge
        info={deviceInfo(u)}
        onUpload={canUpload ? () => uploadOne(u) : undefined}
        uploading={rowUploading === u.UserID}
      />
    ) : null;

  const { data: userTypes = EMPTY } = useGetUserTypesQuery();
  const { data: sessions = EMPTY } = useGetSessionsQuery();
  const { data: classes = EMPTY } = useGetClassListQuery();
  const { data: residentials = EMPTY } = useGetResidentialQuery();

  const isStudent = Number(filters.userTypeId) === STUDENT_TYPE;
  const query = {
    UserTypeID: filters.userTypeId,
    SessionID: isStudent ? filters.sessionId : '',
    ClassID: isStudent ? filters.classId : '',
    ResidentialID: isStudent ? filters.residentialId : '',
    ShiftID: shift?.ID,
  };
  // শিফট ঐচ্ছিক: নির্বাচিত থাকলে ডানে সেই শিফটের ইউজার, না থাকলে যেকোনো শিফটের ইউজার;
  // বামে সবসময় যারা কোনো শিফটেই নেই (একজন ইউজার একটি শিফটেই থাকতে পারে)
  const skipPending = !filters.userTypeId || (isStudent && !filters.sessionId);

  const pendingQuery = useGetTimeSettingsQuery(query, { skip: skipPending });
  const assignedQuery = useGetTimeSettingsFilteredQuery({
    UserTypeID: query.UserTypeID,
    SessionID: query.SessionID,
    ClassID: query.ClassID,
    ResidentialStatusId: query.ResidentialID,
    ShiftID: shift?.ID ?? '',
  }, { skip: skipPending }); // ইউজার টাইপ (+ শিক্ষার্থীর সেশন) ছাড়া কিছু দেখাবে না
  const [createTimeSetting, { isLoading: isSaving }] = useCreateTimeSettingMutation();
  const [deleteTimeSetting] = useDeleteTimeSettingMutation();

  const pendingUsers = useMemo(
    () => (skipPending || pendingQuery.error ? EMPTY : groupPending(pendingQuery.data?.dataList || EMPTY)),
    [pendingQuery.data, pendingQuery.error, skipPending]
  );
  const assignedUsers = useMemo(
    () => (skipPending ? EMPTY : groupAssigned(assignedQuery.data?.data || EMPTY)),
    [assignedQuery.data, skipPending]
  );

  const visiblePending = useMemo(() => {
    const q = pendingSearch.trim().toLowerCase();
    return pendingUsers.filter((u) => matches(u, q));
  }, [pendingUsers, pendingSearch]);
  const visibleAssigned = useMemo(() => {
    const q = assignedSearch.trim().toLowerCase();
    return assignedUsers.filter((u) => {
      if (!matches(u, q)) return false;
      if (!device || deviceFilter === 'all') return true;
      const onDevice = roster?.users?.[String(u.UserID)]?.status === 'present';
      return deviceFilter === 'present' ? onDevice : !onDevice;
    });
  }, [assignedUsers, assignedSearch, device, deviceFilter, roster]);

  // ফিল্টার/শিফট বদলালে নির্বাচন মুছে যাবে
  useEffect(() => {
    setPendingSel(new Set());
    setAssignedSel(new Set());
  }, [filters, shift?.ID, deviceFilter]);

  // ইউজার টাইপ বদলালে শিক্ষার্থীর ফিল্টারগুলো খালি
  const onUserTypeChange = () => {
    setValue('SessionID', '');
    setValue('ClassID', '');
    setValue('ResidentialID', '');
  };

  const toggle = (setter, key) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleAll = (setter, selected, visible) => {
    const allOn = visible.length > 0 && visible.every((u) => selected.has(u.key));
    setter((prev) => {
      const next = new Set(prev);
      visible.forEach((u) => (allOn ? next.delete(u.key) : next.add(u.key)));
      return next;
    });
  };

  const selectedPendingUsers = pendingUsers.filter((u) => pendingSel.has(u.key));
  const selectedEntryCount = selectedPendingUsers.reduce((sum, u) => sum + u.switches.length, 0);

  const assign = async () => {
    if (!selectedPendingUsers.length) return;
    const settings = selectedPendingUsers.flatMap((u) => u.switches.map((sw) => ({ UserID: u.UserID, ShiftID: sw.ShiftID, SwitchID: sw.SwitchID })));
    try {
      await createTimeSetting({ settings }).unwrap();
      toast.success(`${selectedPendingUsers.length} জন ইউজার ${shift.ShiftNameBangla} শিফটে যুক্ত হয়েছে`);
      setPendingSel(new Set());
    } catch (error) {
      toast.error(errorText(error, 'যুক্ত করা যায়নি'));
    }
  };

  const removeIds = async (ids, title) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title,
      text: 'সরালে এই ইউজারের হাজিরা এই সময়সূচি অনুযায়ী আর হিসাব হবে না।',
      showCancelButton: true,
      confirmButtonText: 'সরান',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmation.isConfirmed) return;
    setRemoving(true);
    const results = await Promise.allSettled(ids.map((id) => deleteTimeSetting(id).unwrap()));
    setRemoving(false);
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed) toast.error(`${failed} টি এন্ট্রি সরানো যায়নি`);
    else toast.success('সরানো হয়েছে');
    setAssignedSel(new Set());
  };

  const selectedAssignedUserIds = [...new Set(assignedUsers.filter((u) => assignedSel.has(u.key)).map((u) => Number(u.UserID)))];
  const selectedAssignedIds = assignedUsers.filter((u) => assignedSel.has(u.key)).flatMap((u) => u.items.map((i) => i.ID));
  const pendingAllOn = visiblePending.length > 0 && visiblePending.every((u) => pendingSel.has(u.key));
  const assignedAllOn = visibleAssigned.length > 0 && visibleAssigned.every((u) => assignedSel.has(u.key));

  return (
    <FormProvider {...methods}>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm pb-[80px]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <SvgIcon name="TbUserPlus" size={18} className="text-blue-600" />
          <h4 className="text-[17px] font-bold text-slate-800">ইউজারদের শিফটে যুক্ত করুন</h4>
        </div>
      </header>

      {/* ফিল্টার — দুই পাশের তালিকাতেই প্রযোজ্য */}
      <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 md:grid-cols-5">
        <DefaultSelect
          label="শিফট"
          require
          registerKey="ShiftID"
          options={shifts}
          valueField="ID"
          nameField="ShiftNameBangla"
          defaultValue="শিফট নির্বাচন করুন"
        />
        <DefaultSelect
          label="ইউজার টাইপ"
          registerKey="UserTypeID"
          options={userTypes}
          valueField="ID"
          nameField="TypeName"
          defaultValue="নির্বাচন করুন"
          initialValue={String(STUDENT_TYPE)}
          onChange={onUserTypeChange}
        />
        {isStudent && (
          <>
            <DefaultSelect
              label="সেশন"
              require
              registerKey="SessionID"
              options={sessions}
              valueField="SessionID"
              nameField="SessionName"
              defaultValue="সেশন নির্বাচন করুন"
            />
            <DefaultSelect
              label="শ্রেণী"
              registerKey="ClassID"
              options={classes}
              valueField="ClassID"
              nameField="ClassName"
              defaultValue="সব শ্রেণী"
            />
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
      </div>


      <div className="grid grid-cols-1 divide-y divide-slate-200 xl:grid-cols-2 xl:divide-x xl:divide-y-0">
        {/* ---------- বাম: অপেক্ষমাণ ---------- */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col gap-2 bg-amber-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-amber-900">
              শিফটে নেই <span className="ml-1 rounded-full bg-amber-200/70 px-2 py-0.5 text-xs">{pendingUsers.length}</span>
            </p>
            <SearchBox value={pendingSearch} onChange={setPendingSearch} label="অপেক্ষমাণ ইউজার খুঁজুন" />
          </div>

          <div className="max-h-[520px] min-h-[240px] flex-1 overflow-y-auto">
            {skipPending && <p className="p-8 text-center text-sm text-slate-500">ইউজার টাইপ{isStudent ? ' ও সেশন' : ''} নির্বাচন করুন।</p>}
            {!skipPending && pendingQuery.isFetching && !pendingQuery.data && <p className="p-8 text-center text-sm text-slate-500">লোড হচ্ছে...</p>}
            {!skipPending && pendingQuery.error && !pendingQuery.isFetching && (
              <p className="m-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{pendingMessage(pendingQuery.error)}</p>
            )}
            {!skipPending && !pendingQuery.error && pendingQuery.data && pendingUsers.length === 0 && (
              <p className={`p-8 text-center text-sm ${pendingQuery.data.listCount ? 'text-emerald-700' : 'text-slate-500'}`}>
                {pendingQuery.data.listCount
                  ? 'সবাই কোনো না কোনো শিফটে যুক্ত আছে ✓'
                  : 'এই ফিল্টারে হাজিরা তালিকায় কোনো ইউজার নেই। আগে "List Create" থেকে তালিকা তৈরি করুন।'}
              </p>
            )}
            {visiblePending.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-white text-xs text-slate-500 shadow-[0_1px_0_#e2e8f0]">
                  <tr>
                    <th className="w-10 px-4 py-2">
                      <input type="checkbox" aria-label="সবাইকে নির্বাচন" checked={pendingAllOn} onChange={() => toggleAll(setPendingSel, pendingSel, visiblePending)} className="h-4 w-4 accent-blue-600" />
                    </th>
                    <th className="px-2 py-2 font-semibold">কোড</th>
                    <th className="px-2 py-2 font-semibold">নাম</th>
                    {device && <th className="px-3 py-2 text-right font-semibold">ডিভাইস</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visiblePending.map((u) => (
                    <tr key={u.key} onClick={() => toggle(setPendingSel, u.key)} className={`cursor-pointer ${pendingSel.has(u.key) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-2">
                        <input type="checkbox" aria-label={`${u.UserName} নির্বাচন`} checked={pendingSel.has(u.key)} onChange={() => toggle(setPendingSel, u.key)} onClick={(e) => e.stopPropagation()} className="h-4 w-4 accent-blue-600" />
                      </td>
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{u.UserCode}</td>
                      <td className="max-w-[220px] px-2 py-2"><UserCell user={u} /></td>
                      {device && <td className="px-3 py-2">{badge(u, { canUpload: false })}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-600 tabular-nums">
              নির্বাচিত <b className="text-slate-800">{selectedPendingUsers.length}</b> জন · {selectedEntryCount} টি এন্ট্রি
            </p>
            <button
              type="button"
              onClick={assign}
              disabled={!shift || !selectedPendingUsers.length || isSaving}
              title={shift ? undefined : 'যুক্ত করতে উপরে একটি শিফট নির্বাচন করুন'}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? 'সেভ হচ্ছে...' : shift ? 'শিফটে যুক্ত করুন' : 'আগে শিফট নির্বাচন করুন'}
              <SvgIcon name="FiArrowRight" size={14} />
            </button>
          </div>
        </div>

        {/* ---------- ডান: যুক্ত ---------- */}
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-col gap-2 bg-emerald-50/60 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm font-bold text-emerald-900">
                শিফটে যুক্ত <span className="ml-1 rounded-full bg-emerald-200/70 px-2 py-0.5 text-xs">{assignedUsers.length}</span>
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              {device && (
                <select
                  aria-label="ডিভাইসের অবস্থা অনুযায়ী দেখুন"
                  value={deviceFilter}
                  onChange={(event) => setDeviceFilter(event.target.value)}
                  className="h-[34px] shrink-0 rounded-lg border border-slate-300 bg-white px-2 text-[12px] outline-none focus:border-blue-500"
                >
                  <option value="all">সবাই</option>
                  <option value="missing">ডিভাইসে নেই</option>
                  <option value="present">ডিভাইসে আছে</option>
                </select>
              )}
              <SearchBox value={assignedSearch} onChange={setAssignedSearch} label="যুক্ত ইউজার খুঁজুন" />
            </div>
          </div>

          <DevicePicker devices={devices} isLoading={devicesLoading} device={device} roster={roster} />

          <div className="max-h-[520px] min-h-[240px] flex-1 overflow-y-auto">
            {skipPending && <p className="p-8 text-center text-sm text-slate-500">ইউজার টাইপ{isStudent ? ' ও সেশন' : ''} নির্বাচন করুন।</p>}
            {!skipPending && assignedQuery.isLoading && <p className="p-8 text-center text-sm text-slate-500">লোড হচ্ছে...</p>}
            {!skipPending && assignedQuery.error && (
              <p className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorText(assignedQuery.error, 'তথ্য আনা যায়নি।')}</p>
            )}
            {!skipPending && !assignedQuery.isLoading && !assignedQuery.error && visibleAssigned.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-500">
                {assignedUsers.length && deviceFilter !== 'all' ? 'এই অবস্থার কেউ নেই।' : 'কেউ যুক্ত নেই।'}
              </p>
            )}
            {visibleAssigned.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-white text-xs text-slate-500 shadow-[0_1px_0_#e2e8f0]">
                  <tr>
                    <th className="w-10 px-4 py-2">
                      <input type="checkbox" aria-label="সবাইকে নির্বাচন" checked={assignedAllOn} onChange={() => toggleAll(setAssignedSel, assignedSel, visibleAssigned)} className="h-4 w-4 accent-emerald-600" />
                    </th>
                    <th className="px-2 py-2 font-semibold">কোড</th>
                    <th className="px-2 py-2 font-semibold">নাম</th>
                    {/* <th className="px-2 py-2 font-semibold">সময়সূচি</th> */}
                    {device && <th className="px-2 py-2 text-right font-semibold">ডিভাইস</th>}
                    <th className="px-2 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleAssigned.map((u) => (
                    <tr key={u.key} className={assignedSel.has(u.key) ? 'bg-emerald-50' : 'hover:bg-slate-50'}>
                      <td className="px-4 py-2">
                        <input type="checkbox" aria-label={`${u.UserName} নির্বাচন`} checked={assignedSel.has(u.key)} onChange={() => toggle(setAssignedSel, u.key)} className="h-4 w-4 accent-emerald-600" />
                      </td>
                      <td className="px-2 py-2 font-mono text-xs text-slate-600">{u.UserCode}</td>
                      <td className="max-w-[220px] px-2 py-2">
                        <UserCell user={u} extra={[u.ClassName, shift ? null : u.ShiftNameBangla].filter(Boolean).join(' · ')} />
                      </td>
                      {/* <td className="px-2 py-2">
                        <div className="flex flex-wrap gap-1">
                          {u.items.map((item) => (
                            <Chip key={item.ID} onRemove={() => removeIds([item.ID], `${item.TypeNameBangla} সরাবেন?`)} removeLabel={`${item.TypeNameBangla} সরান`}>
                              {item.TypeNameBangla}
                            </Chip>
                          ))}
                        </div>
                      </td> */}
                      {device && <td className="px-2 py-2">{badge(u)}</td>}
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeIds(u.items.map((i) => i.ID), `${u.UserName} কে শিফট থেকে সরাবেন?`)}
                          title="শিফট থেকে সরান"
                          aria-label={`${u.UserName} কে শিফট থেকে সরান`}
                          className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                        >
                          <SvgIcon name="FaTrash" size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
            <p className="text-xs text-slate-600 tabular-nums">
              নির্বাচিত <b className="text-slate-800">{assignedSel.size}</b> জন
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => removeIds(selectedAssignedIds, `${assignedSel.size} জনকে সরাবেন?`)}
                disabled={!assignedSel.size || removing}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {removing ? 'সরানো হচ্ছে...' : 'নির্বাচিতদের সরান'}
              </button>
              <DeviceUploadButton
                device={device}
                userIds={selectedAssignedUserIds}
                onUploaded={() => setAssignedSel(new Set())}
                upload={upload}
                isUploading={isUploading}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </FormProvider>
  );
};

AssignUsersPanel.propTypes = {
  shifts: PropTypes.array.isRequired,
};

export default AssignUsersPanel;
