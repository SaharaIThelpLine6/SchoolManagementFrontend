import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Button from '../components/Button/Button';
import DeviceUserUpload from '../view/attendance/DeviceUserUpload';
import { useGetAttendanceDevicesQuery } from '../features/attendance/attendanceDeviceSlice';

const errorText = (error, fallback) => error?.data?.error || error?.data?.message || fallback;
const selectClass =
  'h-[38px] w-full rounded border-[1.5px] border-stroke bg-white px-2 text-[14px] text-black outline-none focus:border-custom-focus';

const DeviceUsers = ({ pageTitle }) => {
  const { data, isLoading, isFetching, error, refetch } = useGetAttendanceDevicesQuery(undefined, {
    pollingInterval: 30 * 1000,
  });
  const devices = (data?.devices || []).filter((d) => !d.ownedByOther);
  const [deviceId, setDeviceId] = useState(null);

  // একটি মাত্র ডিভাইস থাকলে সেটি নিজে থেকেই বেছে নেওয়া
  useEffect(() => {
    if (deviceId == null && devices.length === 1) setDeviceId(devices[0].ID);
  }, [devices, deviceId]);

  const device = devices.find((d) => d.ID === deviceId) || null;

  return (
    <div className="font-lato space-y-4 rounded-xl bg-white p-4 shadow-lg sm:p-6">
      <div className="border-b border-[#e9edf4] pb-4">
        <h3 className="font-SolaimanLipi text-[18px] font-bold sm:text-[20px]">{pageTitle}</h3>
        <p className="mt-1 text-sm text-gray-600">
          ডিভাইস বেছে নিয়ে হাজিরা তালিকার ইউজারদের (শিক্ষার্থী/শিক্ষক) সেই ডিভাইসে আপলোড করুন।
        </p>
      </div>

      {isLoading && <p className="text-sm text-gray-500">লোড হচ্ছে...</p>}

      {!isFetching && error && (
        <div role="alert" className="space-y-2">
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorText(error, 'তথ্য আনা যায়নি।')}
          </p>
          <Button type="button" onClick={refetch}>আবার চেষ্টা</Button>
        </div>
      )}

      {data && devices.length === 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          এখনো কোনো ডিভাইস যুক্ত করা হয়নি।{' '}
          <Link to="/dashboard/device/attendance-devices" className="font-semibold underline">
            আগে ডিভাইস যুক্ত করুন
          </Link>
        </p>
      )}

      {devices.length > 0 && (
        <div className="max-w-sm">
          <label htmlFor="device-user-device" className="mb-1 block text-sm font-semibold text-gray-700">
            ডিভাইস
          </label>
          <select
            id="device-user-device"
            className={selectClass}
            value={deviceId ?? ''}
            onChange={(event) => setDeviceId(event.target.value ? Number(event.target.value) : null)}
          >
            <option value="">ডিভাইস নির্বাচন করুন</option>
            {devices.map((d) => (
              <option key={d.ID} value={d.ID}>
                {d.deviceName || d.serialNo} ({d.serialNo}){d.live?.online ? ' — অনলাইন' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {device && <DeviceUserUpload key={device.ID} device={device} />}
    </div>
  );
};

DeviceUsers.propTypes = {
  pageTitle: PropTypes.string,
};

export default DeviceUsers;
