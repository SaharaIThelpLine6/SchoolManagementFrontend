import { useState } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import DeviceUserUpload from '../view/attendance/DeviceUserUpload';
import {
  useAddAttendanceDeviceMutation,
  useGetAttendanceDevicesQuery,
  useRemoveAttendanceDeviceMutation,
  useUpdateAttendanceDeviceMutation,
} from '../features/attendance/attendanceDeviceSlice';

const POLL_MS = 30 * 1000;
const SERIAL_RE = /^[A-Za-z0-9_-]{3,50}$/;
const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;
const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const checkForm = ({ serialNo, deviceName }) => {
  if (!SERIAL_RE.test(serialNo)) {
    Swal.fire({ icon: 'warning', title: 'সঠিক সিরিয়াল নম্বর দিন', text: 'শুধু ইংরেজি অক্ষর ও সংখ্যা, যেমন UDP3251600929' });
    return false;
  }
  if (!deviceName) {
    Swal.fire({ icon: 'warning', title: 'ডিভাইসের নাম দিন', text: 'যেমন: মেইন গেট' });
    return false;
  }
  return true;
};

const StatusBadge = ({ live }) => {
  if (!live) {
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
        এখনো সংযুক্ত হয়নি
      </span>
    );
  }
  return (
    <div>
      <span
        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
          live.online ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
        }`}
      >
        {live.online ? 'অনলাইন' : 'অফলাইন'}
      </span>
      {live.lastSeen && <span className="mt-0.5 block text-xs text-gray-500 tabular-nums">শেষ: {live.lastSeen}</span>}
    </div>
  );
};

StatusBadge.propTypes = {
  live: PropTypes.shape({ online: PropTypes.bool, lastSeen: PropTypes.string }),
};

const DeviceRow = ({ device, isUploadOpen, onUpload }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ serialNo: device.serialNo, deviceName: device.deviceName });
  const [updateDevice, { isLoading: isSaving }] = useUpdateAttendanceDeviceMutation();
  const [removeDevice, { isLoading: isRemoving }] = useRemoveAttendanceDeviceMutation();

  const startEdit = () => {
    setForm({ serialNo: device.serialNo, deviceName: device.deviceName });
    setEditing(true);
  };

  const save = async () => {
    const data = { serialNo: form.serialNo.trim(), deviceName: form.deviceName.trim() };
    if (!checkForm(data)) return;
    try {
      await updateDevice({ id: device.ID, ...data }).unwrap();
      setEditing(false);
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'আপডেট করা যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    }
  };

  const remove = async () => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'ডিভাইস সরাবেন?',
      html: `<b>${escapeHtml(device.deviceName || device.serialNo)}</b> (${escapeHtml(device.serialNo)})<br/><span style="font-size:13px;color:#64748b">সরালে এই ডিভাইসের নতুন হাজিরা আর আপনার প্রতিষ্ঠানে আসবে না।</span>`,
      showCancelButton: true,
      confirmButtonText: 'সরান',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmation.isConfirmed) return;
    try {
      await removeDevice(device.ID).unwrap();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'সরানো যায়নি', text: errorText(error, 'আবার চেষ্টা করুন।') });
    }
  };

  if (editing) {
    return (
      <tr className="bg-blue-50/50">
        <td className="px-3 py-2">
          <input
            aria-label="সিরিয়াল নম্বর"
            className="h-[34px] w-full rounded border-[1.5px] border-stroke px-2 font-mono text-xs outline-none focus:border-custom-focus"
            value={form.serialNo}
            maxLength={50}
            onChange={(event) => setForm((f) => ({ ...f, serialNo: event.target.value.replace(/\s/g, '') }))}
          />
        </td>
        <td className="px-3 py-2">
          <input
            aria-label="ডিভাইসের নাম"
            className="h-[34px] w-full rounded border-[1.5px] border-stroke px-2 text-sm outline-none focus:border-custom-focus"
            value={form.deviceName}
            maxLength={50}
            onChange={(event) => setForm((f) => ({ ...f, deviceName: event.target.value }))}
          />
        </td>
        <td className="px-3 py-2"><StatusBadge live={device.live} /></td>
        <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
          <button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            {isSaving ? 'সেভ হচ্ছে...' : 'সেভ'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
          >
            বাতিল
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td className="px-3 py-2 font-mono text-xs text-gray-800">
        {device.serialNo || '-'}
        {device.ownedByOther && (
          <span className="mt-0.5 block font-sans text-xs text-red-600">এই ডিভাইসটি অন্য প্রতিষ্ঠানে যুক্ত আছে</span>
        )}
      </td>
      <td className="px-3 py-2 text-gray-800">{device.deviceName || '-'}</td>
      <td className="px-3 py-2"><StatusBadge live={device.live} /></td>
      <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
        <button
          type="button"
          onClick={onUpload}
          disabled={device.ownedByOther}
          className={`rounded-md border px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
            isUploadOpen
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          ইউজার আপলোড
        </button>
        <button
          type="button"
          onClick={startEdit}
          className="rounded-md border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
        >
          এডিট
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={isRemoving}
          className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          সরান
        </button>
      </td>
    </tr>
  );
};

DeviceRow.propTypes = {
  isUploadOpen: PropTypes.bool,
  onUpload: PropTypes.func.isRequired,
  device: PropTypes.shape({
    ID: PropTypes.number.isRequired,
    serialNo: PropTypes.string,
    deviceName: PropTypes.string,
    ownedByOther: PropTypes.bool,
    live: PropTypes.object,
  }).isRequired,
};

const AttendanceDevices = ({ pageTitle }) => {
  const { data, isLoading, isFetching, error, refetch } = useGetAttendanceDevicesQuery(undefined, {
    pollingInterval: POLL_MS,
  });
  const [addDevice, { isLoading: isAdding }] = useAddAttendanceDeviceMutation();
  const [form, setForm] = useState({ serialNo: '', deviceName: '' });
  const [uploadDeviceId, setUploadDeviceId] = useState(null);
  const devices = data?.devices || [];
  const settings = data?.serverSettings;
  const uploadDevice = devices.find((d) => d.ID === uploadDeviceId) || null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    const body = { serialNo: form.serialNo.trim(), deviceName: form.deviceName.trim() };
    if (!checkForm(body)) return;
    try {
      await addDevice(body).unwrap();
      setForm({ serialNo: '', deviceName: '' });
      Swal.fire({ icon: 'success', title: 'ডিভাইস যুক্ত হয়েছে', timer: 1500, showConfirmButton: false });
    } catch (addError) {
      Swal.fire({ icon: 'error', title: 'ডিভাইস যুক্ত করা যায়নি', text: errorText(addError, 'আবার চেষ্টা করুন।') });
    }
  };

  return (
    <div className="font-default space-y-4 rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="border-b border-[#e9edf4] pb-4">
        <h3 className="font-SolaimanLipi text-[18px] font-bold sm:text-[20px]">{pageTitle}</h3>
        <p className="mt-1 text-sm text-gray-600">
          আপনার প্রতিষ্ঠানের ZKTeco হাজিরা ডিভাইস (ADMS) এখানে যুক্ত করুন। যুক্ত করার পর ডিভাইসের হাজিরা সার্ভারে আপনার প্রতিষ্ঠানের নামে জমা হবে।
        </p>
      </div>

      <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <h4 className="mb-2 font-bold">ধাপ ১: ডিভাইসে এগুলো সেট করুন (Menu → Comm. → Cloud Server Setting)</h4>
        <dl className="grid grid-cols-[auto,1fr] gap-x-4 gap-y-1">
          <dt className="text-sky-700">Server Mode</dt>
          <dd className="font-mono">{settings?.serverMode || 'ADMS'}</dd>
          <dt className="text-sky-700">Server Address</dt>
          <dd className="font-mono">{settings?.serverAddress || '-'}</dd>
          <dt className="text-sky-700">Server Port</dt>
          <dd className="font-mono">{settings?.serverPort || '-'}</dd>
        </dl>
        <p className="mt-2 text-xs text-sky-800">
          ধাপ ২: ডিভাইসের সিরিয়াল নম্বর (Menu → System Info → Device Info) নিচে লিখে ডিভাইস যুক্ত করুন।
          ঠিকভাবে সংযুক্ত হলে অবস্থা &quot;অনলাইন&quot; দেখাবে। পাতাটি প্রতি ৩০ সেকেন্ডে রিফ্রেশ হয়।
        </p>
      </section>

      {isLoading && <p className="text-sm text-gray-500">লোড হচ্ছে...</p>}

      {!isFetching && error && (
        <div role="alert" className="space-y-2">
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText(error, 'তথ্য আনা যায়নি।')}
          </p>
          <Button type="button" onClick={refetch}>আবার চেষ্টা</Button>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-3 py-2 font-semibold">সিরিয়াল নম্বর (SN)</th>
                  <th className="px-3 py-2 font-semibold">নাম</th>
                  <th className="px-3 py-2 font-semibold">অবস্থা</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-gray-500">এখনো কোনো ডিভাইস যুক্ত করা হয়নি।</td>
                  </tr>
                )}
                {devices.map((device) => (
                  <DeviceRow
                    key={device.ID}
                    device={device}
                    isUploadOpen={device.ID === uploadDeviceId}
                    onUpload={() => setUploadDeviceId((current) => (current === device.ID ? null : device.ID))}
                  />
                ))}
              </tbody>
            </table>
          </section>

          <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="text-sm font-bold text-gray-800">নতুন ডিভাইস যুক্ত করুন</h4>
            <div>
              <Input
                label="সিরিয়াল নম্বর (SN)"
                name="device-serial"
                placeholder="যেমন UDP3251600929"
                autoComplete="off"
                maxLength={50}
                value={form.serialNo}
                onChange={(event) => setForm((f) => ({ ...f, serialNo: event.target.value.replace(/\s/g, '') }))}
              />
            </div>
            <div>
              <Input
                label="ডিভাইসের নাম"
                name="device-name"
                placeholder="যেমন মেইন গেট"
                maxLength={50}
                value={form.deviceName}
                onChange={(event) => setForm((f) => ({ ...f, deviceName: event.target.value }))}
              />
            </div>
            <Button type="submit" loading={isAdding} disabled={isAdding}>ডিভাইস যুক্ত করুন</Button>
          </form>
        </div>
      )}

      {uploadDevice && (
        <DeviceUserUpload key={uploadDevice.ID} device={uploadDevice} onClose={() => setUploadDeviceId(null)} />
      )}
    </div>
  );
};

AttendanceDevices.propTypes = {
  pageTitle: PropTypes.string,
};

export default AttendanceDevices;
