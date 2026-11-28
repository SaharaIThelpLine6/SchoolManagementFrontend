// একজন ইউজার নির্বাচিত হাজিরা ডিভাইসে আছে কি না + আপলোড / আবার আপলোড বোতাম
import PropTypes from 'prop-types';
import SvgIcon from '../../components/icons/SvgIcon';

const DEVICE_STATUS = {
  present: { label: 'ডিভাইসে আছে', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  pending: { label: 'পাঠানো হচ্ছে', className: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500 animate-pulse' },
  removing: { label: 'মুছা হচ্ছে', className: 'bg-slate-100 text-slate-600 ring-slate-200', dot: 'bg-slate-400 animate-pulse' },
  failed: { label: 'আপলোড ব্যর্থ', className: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  removed: { label: 'ডিভাইসে নেই', className: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
  none: { label: 'আপলোড হয়নি', className: 'bg-slate-50 text-slate-500 ring-slate-200', dot: 'bg-slate-300' },
};

const REMOVED_BY = {
  device: 'ডিভাইস থেকে মুছে ফেলা হয়েছে',
  sync: 'যাচাইয়ে ডিভাইসে পাওয়া যায়নি',
  delete: 'ডিভাইস থেকে মুছে ফেলা হয়েছে',
};

const DeviceUserBadge = ({ info, onUpload, uploading }) => {
  const status = info?.status && DEVICE_STATUS[info.status] ? info.status : 'none';
  const meta = DEVICE_STATUS[status];
  const busy = status === 'pending' || status === 'removing' || uploading;
  const title = [status === 'removed' ? REMOVED_BY[info?.by] : null, info?.at ? `সময়: ${info.at}` : null].filter(Boolean).join(' · ');
  const reupload = status === 'present';

  return (
    <div className="flex items-center justify-end gap-1">
      <span
        title={title || undefined}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${meta.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} aria-hidden="true" />
        {meta.label}
      </span>
      {onUpload && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUpload();
          }}
          disabled={busy}
          title={reupload ? 'আবার ডিভাইসে পাঠান' : 'ডিভাইসে পাঠান'}
          aria-label={reupload ? 'আবার ডিভাইসে পাঠান' : 'ডিভাইসে পাঠান'}
          className={`flex h-6 w-6 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-30 ${
            reupload ? 'text-slate-400 hover:bg-slate-100 hover:text-slate-700' : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          {reupload ? <span className="text-sm leading-none">↻</span> : <SvgIcon name="FiArrowRight" size={13} className="-rotate-90" />}
        </button>
      )}
    </div>
  );
};

DeviceUserBadge.propTypes = {
  info: PropTypes.shape({ status: PropTypes.string, at: PropTypes.string, by: PropTypes.string }),
  onUpload: PropTypes.func,
  uploading: PropTypes.bool,
};

export default DeviceUserBadge;
