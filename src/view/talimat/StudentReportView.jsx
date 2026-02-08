import { FormProvider, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Button from '../../components/Button/Button';
import Textarea from '../../components/Forms/Textarea';
import { closeModal } from '../../features/modal/modalSlice';
import {
  useDeleteStudentReportMutation,
  useGetSingleStudentReportQuery,
  usePutStudentReportConfirmDetailsUpdateMutation,
} from '../../features/talimat/talimatQuerySlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import { formatToDDMMYYYY } from '../../utils/dateFormat';

const StudentReportView = ({ id }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const solutionDescription = watch('solutionDescription');

  const { data, isLoading, isError } = useGetSingleStudentReportQuery(id, {
    skip: !id,
  });
console.log(data, 'data');
  const [updateStatus] =
    usePutStudentReportConfirmDetailsUpdateMutation();
  const [deleteStudentReport] =
    useDeleteStudentReportMutation();

  const handleSubmit = async () => {
    try {
      await updateStatus({
        id,
        confirmDetails: solutionDescription,
      }).unwrap();

      Swal.fire({
        title: 'সফল!',
        text: 'সমাধান সংরক্ষণ করা হয়েছে।',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      hideModal();
    } catch (error) {
      Swal.fire({
        title: 'ত্রুটি!',
        text: 'সমাধান সংরক্ষণ ব্যর্থ হয়েছে।',
        icon: 'error',
        timer: 2500,
        showConfirmButton: false,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteStudentReport(id).unwrap();
      toast.success(
        res?.message ||
          translate('Student Report deleted successfully')
      );
      dispatch(closeModal());
    } catch (error) {
      toast.error(
        error?.data?.message ||
          translate('Failed to delete report')
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-500 rounded-full" />
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <p className="text-center py-6 text-red-500">
        Report load করতে সমস্যা হয়েছে
      </p>
    );
  }

  const reportData = data.data;
  const user = reportData?.CreatedBy;

  return (
    <FormProvider {...methods}>
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-5 text-gray-800">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold flex justify-center items-center gap-2">
            📝 শিক্ষার্থীর অভিযোগ (Admin View)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            তারিখ: {translate(formatToDDMMYYYY(reportData?.CreateAt))}
          </p>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">নাম:</span>
            <span className="font-semibold">{user?.UserName || '—'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">মোবাইল:</span>
            <span>{user?.Mobile1 || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">ইউজার কোড:</span>
            <span>{user?.UserCode || '—'}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">স্ট্যাটাস:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                Number(reportData?.SeeUnSee) === 1
                  ? 'bg-green-100 text-green-600'
                  : Number(reportData?.SeeUnSee) === 3
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
              }`}
            >
              {Number(reportData?.SeeUnSee) === 1
                ? translate('সমাধান')
                : Number(reportData?.SeeUnSee) === 3
                  ? translate('প্রক্রিয়াধীন')
                  : translate('অপেক্ষমান')}
            </span>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="mt-5">
          <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
            <span className="text-base">📌</span>
            অভিযোগের বিস্তারিত
          </p>

          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words max-h-64 overflow-y-auto shadow-inner">
            {reportData?.ComplaintDetails || 'কোনো অভিযোগ লেখা নেই'}
          </div>
        </div>

        {/* Solution Already Added */}
        {Number(reportData?.SeeUnSee) === 1 && (
          <div className="mt-5">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
              <span className="text-base">✅</span>
              সমাধানের বিস্তারিত
            </p>

            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-4 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap break-words max-h-64 overflow-y-auto shadow-inner">
              {reportData?.ConfirmMessage || 'কোনো সমাধান লেখা নেই'}
            </div>
          </div>
        )}

        {/* Solution Input */}
        {Number(reportData?.SeeUnSee) !== 1 && (
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700">
              <span className="text-base">🛠️</span>
              সমাধান লিখুন
            </p>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <Textarea
                registerKey="solutionDescription"
                require="Solution description is required"
                placeholder={`${translate('সমাধানের বিস্তারিত লিখুন')}...`}
              />

              <div className="mt-3 flex justify-end">
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete (Optional) */}
        {/*
        <div className="mt-6 text-right">
          <Button
            className="bg-red-500 hover:bg-red-600"
            onClick={() => handleDelete(reportData?.SCID)}
          >
            Delete
          </Button>
        </div>
        */}
      </div>
    </FormProvider>
  );
};

export default StudentReportView;
