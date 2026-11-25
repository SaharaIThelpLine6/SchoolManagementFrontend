// Settings → হাজিরা ডিভাইস → ইউজার আপলোড
// হাজিরা তালিকার (Time_AllUser) ইউজারদের ডিভাইসে পাঠায়। ডিভাইসে ইউজার নম্বর (PIN) = UserID।
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import { useGetUserTypesQuery } from '../../features/userType/userTypeSlice';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';
import { useGetClassListQuery } from '../../features/class/classQuerySlice';
import { useGetAllUserListAttendancesQuery } from '../../features/attendance/attendanceSlice';
import {
  useGetDeviceUploadStatusQuery,
  useUploadUsersToDeviceMutation,
} from '../../features/attendance/attendanceDeviceSlice';

const EMPTY = [];
const STUDENT_TYPE = 1;
const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;
const selectClass =
  'h-[38px] w-full rounded border-[1.5px] border-stroke bg-white px-2 text-[14px] text-black outline-none focus:border-custom-focus';

const UploadStatus = ({ deviceId }) => {
  const [polling, setPolling] = useState(0);
  const { data } = useGetDeviceUploadStatusQuery(deviceId, { pollingInterval: polling });
  const last = data?.lastUpload;
  const inProgress = Boolean(last && last.pending + last.sent > 0);

  // শুধু আপলোড চলাকালীন প্রতি ১০ সেকেন্ডে অবস্থা দেখা
  useEffect(() => {
    setPolling(inProgress ? 10 * 1000 : 0);
  }, [inProgress]);

  if (!last) return null;
  const finished = last.done + last.failed;
  const percent = last.total ? Math.round((finished / last.total) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-gray-800">শেষ আপলোড ({last.createdAt})</span>
        {inProgress && !data?.deviceOnline && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            ডিভাইস অফলাইন — অনলাইন হলে পাঠানো হবে
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-600 tabular-nums">
        মোট {last.total} · সফল {last.done} · ব্যর্থ {last.failed} · অপেক্ষমাণ {last.pending + last.sent}
      </p>
      {last.failedUsers?.length > 0 && (
        <details className="mt-1 text-xs text-red-700">
          <summary className="cursor-pointer">ব্যর্থ ইউজার দেখুন</summary>
          <ul className="mt-1 list-disc pl-5">
            {last.failedUsers.map((u) => (
              <li key={u.label}>{u.label} {u.result && `(${u.result})`}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

UploadStatus.propTypes = { deviceId: PropTypes.number.isRequired };

const DeviceUserUpload = ({ device, onClose }) => {
  const [userTypeId, setUserTypeId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());

  const { data: userTypes = EMPTY } = useGetUserTypesQuery();
  const { data: sessions = EMPTY } = useGetSessionsQuery();
  const { data: classes = EMPTY } = useGetClassListQuery();

  const isStudent = Number(userTypeId) === STUDENT_TYPE;
  const skip = !userTypeId || (isStudent && !sessionId);
  const { data: users = EMPTY, isFetching } = useGetAllUserListAttendancesQuery(
    { userTypeId, sessionId: isStudent ? sessionId : '', classId: isStudent ? classId : '' },
    { skip }
  );
  const [uploadUsers, { isLoading: isUploading }] = useUploadUsersToDeviceMutation();

  // ফিল্টার বদলালে নির্বাচন মুছে যাবে
  useEffect(() => {
    setSelected(new Set());
  }, [userTypeId, sessionId, classId]);

  const visibleUsers = useMemo(() => {
    const list = skip ? EMPTY : users;
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) =>
        String(u.UserName || '').toLowerCase().includes(q) ||
        String(u.UserCode ?? '').includes(q) ||
        String(u.UserID ?? '').includes(q)
    );
  }, [users, search, skip]);

  const allVisibleSelected = visibleUsers.length > 0 && visibleUsers.every((u) => selected.has(u.UserID));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleUsers.forEach((u) => (allVisibleSelected ? next.delete(u.UserID) : next.add(u.UserID)));
      return next;
    });
  };

  const toggleOne = (userId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleUpload = async () => {
    if (selected.size === 0) {
      Swal.fire({ icon: 'warning', title: 'অন্তত একজন ইউজার নির্বাচন করুন' });
      return;
    }
    const confirmation = await Swal.fire({
      icon: 'question',
      title: `${selected.size} জন ইউজার ডিভাইসে পাঠাবেন?`,
      text: 'ডিভাইসে আগে থেকে একই নম্বরের ইউজার থাকলে তার নাম ও কার্ড আপডেট হবে। আঙুলের ছাপ/ফেস ডিভাইসেই নিতে হবে।',
      showCancelButton: true,
      confirmButtonText: 'পাঠান',
      cancelButtonText: 'বাতিল',
    });
    if (!confirmation.isConfirmed) return;

    try {
      const result = await uploadUsers({ id: device.ID, userIds: [...selected] }).unwrap();
      setSelected(new Set());
      Swal.fire({
        icon: 'success',
        title: 'ইউজার পাঠানো শুরু হয়েছে',
        text: `${result.message}${result.skipped ? ` (${result.skipped} জন হাজিরা তালিকায় না থাকায় বাদ গেছে)` : ''}${
          result.deviceOnline ? '' : ' ডিভাইস এখন অফলাইন, অনলাইন হলে পাঠানো হবে।'
        }`,
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'ইউজার পাঠানো যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-gray-800">ইউজার আপলোড: {device.deviceName || device.serialNo}</h4>
          <p className="text-xs text-gray-600">
            হাজিরা তালিকার ইউজারদের ডিভাইসে পাঠান। ডিভাইসে ইউজার নম্বর হবে সফটওয়্যারের User ID। তালিকায় কেউ না থাকলে
            আগে &quot;List Create&quot; থেকে হাজিরা তালিকা তৈরি করুন।
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-700"
          >
            বন্ধ করুন
          </button>
        )}
      </div>

      <UploadStatus deviceId={device.ID} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          ইউজার টাইপ
          <select className={selectClass} value={userTypeId} onChange={(e) => setUserTypeId(e.target.value)}>
            <option value="">নির্বাচন করুন</option>
            {userTypes.map((t) => (
              <option key={t.ID} value={t.ID}>{t.TypeName}</option>
            ))}
          </select>
        </label>
        {isStudent && (
          <>
            <label className="flex flex-col gap-1 text-sm font-medium">
              সেশন
              <select className={selectClass} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                <option value="">নির্বাচন করুন</option>
                {sessions.map((s) => (
                  <option key={s.SessionID} value={s.SessionID}>{s.SessionName}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              শ্রেণি
              <select className={selectClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">সকল শ্রেণি</option>
                {classes.map((c) => (
                  <option key={c.ClassID} value={c.ClassID}>{c.ClassName}</option>
                ))}
              </select>
            </label>
          </>
        )}
        <label className="flex flex-col gap-1 text-sm font-medium">
          খুঁজুন
          <input
            className={selectClass}
            placeholder="নাম, কোড বা User ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {!skip && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="sticky top-0 bg-gray-50 text-gray-700">
                <tr>
                  <th className="w-10 px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label="সবাইকে নির্বাচন"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      disabled={visibleUsers.length === 0}
                    />
                  </th>
                  <th className="px-3 py-2 font-semibold">User ID</th>
                  <th className="px-3 py-2 font-semibold">কোড</th>
                  <th className="px-3 py-2 font-semibold">নাম</th>
                  {isStudent && <th className="px-3 py-2 font-semibold">শ্রেণি</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isFetching && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">লোড হচ্ছে...</td></tr>
                )}
                {!isFetching && visibleUsers.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">হাজিরা তালিকায় কোনো ইউজার পাওয়া যায়নি।</td></tr>
                )}
                {!isFetching &&
                  visibleUsers.map((u) => (
                    <tr
                      key={u.UserID}
                      className={`cursor-pointer ${selected.has(u.UserID) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      onClick={() => toggleOne(u.UserID)}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          aria-label={`${u.UserName} নির্বাচন`}
                          checked={selected.has(u.UserID)}
                          onChange={() => toggleOne(u.UserID)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2 font-mono text-xs tabular-nums">{u.UserID}</td>
                      <td className="px-3 py-2 tabular-nums">{u.UserCode}</td>
                      <td className="px-3 py-2 text-gray-800">{u.UserName}</td>
                      {isStudent && <td className="px-3 py-2 text-gray-600">{u.ClassName}</td>}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-gray-700">নির্বাচিত: <b className="tabular-nums">{selected.size}</b> জন</span>
        <Button type="button" onClick={handleUpload} loading={isUploading} disabled={isUploading || selected.size === 0}>
          ডিভাইসে পাঠান
        </Button>
      </div>
    </section>
  );
};

DeviceUserUpload.propTypes = {
  device: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    serialNo: PropTypes.string,
    deviceName: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func,
};

export default DeviceUserUpload;
