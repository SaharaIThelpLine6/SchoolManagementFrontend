// DefaultModal → CHECK_TYPE_ENTRY: সুইচের ধরন (Time_CheckType) যোগ / এডিট / মুছুন
// যেমন: আগমন (Check-In), প্রস্থান (Check-Out), বিরতি-প্রস্থান, বিরতি-আগমন
import { useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import SvgIcon from '../../components/icons/SvgIcon';
import {
  useCreateTimeCheckTypeMutation,
  useDeleteTimeCheckTypeMutation,
  useGetTimeCheckTypesQuery,
  useUpdateTimeCheckTypeMutation,
} from '../../features/attendance/attendanceSlice';
import { errorText, fieldClass, toBnDigits } from './timeUtils';

const EMPTY_FORM = { TypeNameBangla: '', TypeNameEnglish: '' };

const CheckTypeEntry = () => {
  const { data, isLoading } = useGetTimeCheckTypesQuery();
  const [createType, { isLoading: isCreating }] = useCreateTimeCheckTypeMutation();
  const [updateType, { isLoading: isUpdating }] = useUpdateTimeCheckTypeMutation();
  const [deleteType] = useDeleteTimeCheckTypeMutation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const types = data?.data || [];
  const isSaving = isCreating || isUpdating;

  const reset = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const body = { TypeNameBangla: form.TypeNameBangla.trim(), TypeNameEnglish: form.TypeNameEnglish.trim() };
    if (!body.TypeNameBangla || !body.TypeNameEnglish) {
      toast.warning('বাংলা ও ইংরেজি দুই নামই দিন');
      return;
    }
    try {
      if (editId) {
        await updateType({ editID: editId, ...body }).unwrap();
        toast.success('সুইচের ধরন আপডেট হয়েছে');
      } else {
        await createType(body).unwrap();
        toast.success('সুইচের ধরন যোগ হয়েছে');
      }
      reset();
    } catch (error) {
      toast.error(errorText(error, 'সংরক্ষণ করা যায়নি'));
    }
  };

  const remove = async (type) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'সুইচের ধরন মুছবেন?',
      text: `"${type.TypeNameBangla}" মুছে যাবে।`,
      showCancelButton: true,
      confirmButtonText: 'মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmation.isConfirmed) return;
    try {
      await deleteType(type.ID).unwrap();
      if (editId === type.ID) reset();
      toast.success('মুছে ফেলা হয়েছে');
    } catch (error) {
      toast.error(errorText(error, 'মুছে ফেলা যায়নি'));
    }
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={submit}
        className={`rounded-xl border p-4 ${editId ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50/70'}`}
      >
        <p className="mb-3 text-sm font-bold text-slate-800">{editId ? 'সুইচের ধরন এডিট করুন' : 'নতুন সুইচের ধরন'}</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">নাম (বাংলা) <span className="text-red-500">*</span></span>
            <input
              className={fieldClass}
              placeholder="যেমন আগমন"
              maxLength={30}
              value={form.TypeNameBangla}
              onChange={(event) => setForm((f) => ({ ...f, TypeNameBangla: event.target.value }))}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">নাম (ইংরেজি) <span className="text-red-500">*</span></span>
            <input
              className={fieldClass}
              placeholder="যেমন Check-In"
              maxLength={30}
              value={form.TypeNameEnglish}
              onChange={(event) => setForm((f) => ({ ...f, TypeNameEnglish: event.target.value }))}
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={reset} className="h-[38px] rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {editId ? 'বাতিল' : 'রিসেট'}
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="h-[38px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? 'সংরক্ষণ হচ্ছে...' : editId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
          <h5 className="text-sm font-bold text-slate-700">সুইচের ধরন তালিকা</h5>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">{toBnDigits(types.length)} টি</span>
        </div>
        <div className="max-h-[320px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500 shadow-[0_1px_0_#e2e8f0]">
              <tr>
                <th className="w-14 px-4 py-2 font-semibold">ক্রমিক</th>
                <th className="px-3 py-2 font-semibold">বাংলা</th>
                <th className="px-3 py-2 font-semibold">ইংরেজি</th>
                <th className="px-3 py-2 font-semibold">ব্যবহার</th>
                <th className="px-3 py-2 text-center font-semibold">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">লোড হচ্ছে...</td></tr>
              )}
              {!isLoading && types.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">কোনো সুইচের ধরন নেই।</td></tr>
              )}
              {types.map((type, index) => {
                const used = Number(type.SwitchCount) || 0;
                return (
                  <tr key={type.ID} className={editId === type.ID ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                    <td className="px-4 py-2.5 text-slate-600">{toBnDigits(index + 1)}</td>
                    <td className="px-3 py-2.5 font-SolaimanLipi font-semibold text-slate-800">{type.TypeNameBangla}</td>
                    <td className="px-3 py-2.5 text-slate-600">{type.TypeNameEnglish}</td>
                    <td className="px-3 py-2.5 text-xs text-slate-500">{used ? `${toBnDigits(used)} টি শিফটে` : '—'}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEditId(type.ID);
                          setForm({ TypeNameBangla: type.TypeNameBangla || '', TypeNameEnglish: type.TypeNameEnglish || '' });
                        }}
                        title="এডিট"
                        aria-label={`${type.TypeNameBangla} এডিট`}
                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                      >
                        <SvgIcon name="FiEdit" size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(type)}
                        disabled={used > 0}
                        title={used > 0 ? 'শিফটের সময়সূচিতে ব্যবহৃত — মুছা যাবে না' : 'মুছুন'}
                        aria-label={`${type.TypeNameBangla} মুছুন`}
                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <SvgIcon name="FaTrash" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CheckTypeEntry;
