// Time Settings: হাজিরা ডিভাইসে ইউজার পাঠানো (একজন বা অনেকজন)। PIN = UserID।
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useUploadUsersToDeviceMutation } from '../../features/attendance/attendanceDeviceSlice';
import { errorText } from './timeUtils';

// নির্বাচিত ইউজারদের পাঠানো — একজন বা অনেকজন
const useDeviceUpload = (device) => {
  const [uploadUsers, { isLoading }] = useUploadUsersToDeviceMutation();

  const upload = async (userIds, { confirm = true } = {}) => {
    if (!device || !userIds.length) return false;
    if (confirm) {
      const confirmation = await Swal.fire({
        icon: 'question',
        title: `${userIds.length} জন ইউজার "${device.deviceName || device.serialNo}" ডিভাইসে পাঠাবেন?`,
        text: 'ডিভাইসে আগে থেকে একই নম্বরের ইউজার থাকলে তার নাম ও কার্ড আপডেট হবে। আঙুলের ছাপ/ফেস ডিভাইসেই নিতে হবে।',
        showCancelButton: true,
        confirmButtonText: 'পাঠান',
        cancelButtonText: 'বাতিল',
      });
      if (!confirmation.isConfirmed) return false;
    }
    try {
      const result = await uploadUsers({ id: device.ID, userIds }).unwrap();
      const extra = `${result.skipped ? ` (${result.skipped} জন হাজিরা তালিকায় না থাকায় বাদ গেছে)` : ''}${
        result.deviceOnline ? '' : ' ডিভাইস এখন অফলাইন, অনলাইন হলে পাঠানো হবে।'
      }`;
      toast.success(`${result.message}${extra}`);
      return true;
    } catch (error) {
      toast.error(errorText(error, 'ইউজার পাঠানো যায়নি'));
      return false;
    }
  };

  return { upload, isUploading: isLoading };
};

export default useDeviceUpload;
