// Time Settings → "শিফটে যুক্ত" তালিকা: কোন ডিভাইসের অবস্থা দেখাবে, "ডিভাইস যাচাই", আর
// নির্বাচিত ইউজারদের একসাথে ডিভাইসে পাঠানোর বোতাম।
// ডিভাইসে ইউজার নম্বর (PIN) = UserID, নাম = UserCode। Backend: routes/attendanceDevices.js
import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import SvgIcon from '../../components/icons/SvgIcon';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { useSyncDeviceUsersMutation } from '../../features/attendance/attendanceDeviceSlice';
import { errorText } from './timeUtils';

const SYNC_TEXT = {
  running: 'যাচাই চলছে...',
  settling: 'যাচাই শেষ হচ্ছে...',
  failed: 'শেষ যাচাই ব্যর্থ',
  incomplete: 'শেষ যাচাই অসম্পূর্ণ — আবার যাচাই করুন',
};

// ডিভাইস নির্বাচন (DefaultSelect, registerKey="DeviceID" — FormProvider এর ভেতরে থাকতে হবে) + যাচাই
export const DevicePicker = ({ devices, isLoading, device, roster }) => {
  const [syncUsers, { isLoading: isSyncing }] = useSyncDeviceUsersMutation();
  const options = useMemo(
    () => devices.map((d) => ({ ID: String(d.ID), label: `${d.deviceName || d.serialNo} (${d.serialNo})` })),
    [devices]
  );
  const lastSync = roster?.lastSync;
  const syncing = Boolean(roster?.syncing);
  const online = Boolean(roster?.deviceOnline);

  const sync = async () => {
    try {
      const result = await syncUsers(device.ID).unwrap();
      toast.info(result.message);
    } catch (error) {
      toast.error(errorText(error, 'যাচাই শুরু করা যায়নি'));
    }
  };

  if (!isLoading && devices.length === 0) {
    return (
      <p className="border-b border-slate-100 px-4 py-2 text-xs text-slate-600">
        ডিভাইসে পাঠাতে আগে{' '}
        <Link to="/dashboard/device/attendance-devices" className="font-semibold text-blue-600 underline">
          হাজিরা ডিভাইস যুক্ত করুন
        </Link>
        ।
      </p>
    );
  }

  const waitingOffline = syncing && !online;
  const syncText = waitingOffline
    ? 'ডিভাইস অফলাইন — অনলাইন হলে যাচাই হবে'
    : syncing
      ? SYNC_TEXT[lastSync?.status] || 'যাচাইয়ের অপেক্ষায়...'
      : lastSync?.status === 'done'
        ? `শেষ যাচাই: ${lastSync.finishedAt} · ডিভাইসে ${lastSync.found} জন`
        : lastSync?.status === 'failed'
          ? 'শেষ যাচাই ব্যর্থ — ডিভাইস সাড়া দেয়নি, আবার চেষ্টা করুন'
          : SYNC_TEXT[lastSync?.status] || 'এখনো যাচাই করা হয়নি';

  return (
    <div className="space-y-1.5 border-b border-slate-100 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <DefaultSelect
            registerKey="DeviceID"
            options={options}
            valueField="ID"
            nameField="label"
            defaultValue={isLoading ? 'লোড হচ্ছে...' : 'ডিভাইস নির্বাচন করুন'}
            initialValue={options[0]?.ID}
            disabled={isLoading}
            icon={<SvgIcon name="SubDevice" size={16} />}
          />
        </div>
        {device && (
          <button
            type="button"
            onClick={sync}
            disabled={isSyncing || syncing}
            title="ডিভাইস থেকে ইউজার তালিকা এনে মিলিয়ে দেখা — ডিভাইসে কেউ মুছে ফেলা হলে ধরা পড়বে"
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3 text-xs font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={syncing && !waitingOffline ? 'inline-block animate-spin' : ''}>↻</span>
            {waitingOffline ? 'অপেক্ষায়' : syncing ? 'যাচাই হচ্ছে' : 'যাচাই'}
          </button>
        )}
      </div>
      {device && (
        <p className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-px font-semibold ${
              online ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {online ? 'অনলাইন' : 'অফলাইন'}
          </span>
          {syncText}
        </p>
      )}
    </div>
  );
};

DevicePicker.propTypes = {
  devices: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  device: PropTypes.object,
  roster: PropTypes.object,
};

// নির্বাচিতদের একসাথে ডিভাইসে পাঠানোর বোতাম (ফুটারে "নির্বাচিতদের সরান" এর পাশে)
const DeviceUploadButton = ({ device, userIds, onUploaded, upload, isUploading }) => {
  if (!device) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        if (await upload(userIds)) onUploaded();
      }}
      disabled={!userIds.length || isUploading}
      title={`${device.deviceName || device.serialNo} ডিভাইসে পাঠান`}
      className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <SvgIcon name="FiArrowRight" size={13} className="-rotate-90" />
      {isUploading ? 'পাঠানো হচ্ছে...' : `${userIds.length} জন আপলোড`}
    </button>
  );
};

DeviceUploadButton.propTypes = {
  device: PropTypes.object,
  userIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onUploaded: PropTypes.func.isRequired,
  upload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
};

export default DeviceUploadButton;
