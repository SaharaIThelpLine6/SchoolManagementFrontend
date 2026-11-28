import { useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import SvgIcon from '../../components/icons/SvgIcon';
import {
  useCreateTimeSwitchMutation,
  useGetTimeCheckTypesQuery,
  useUpdateTimeSwitchMutation,
} from '../../features/attendance/attendanceSlice';
import { showModal } from '../../utils/ModalControlar';
import { errorText, fieldClass, toMinutes, toServerTime } from './timeUtils';

const Label = ({ children, required }) => (
  <span className="mb-1.5 block text-sm font-bold text-slate-700">
    {children}
    {required && <span className="text-red-500"> *</span>} :
  </span>
);

Label.propTypes = { children: PropTypes.node, required: PropTypes.bool };

// seed: { ID?, ShiftID?, CheckTypeID?, start?, late?, end? } — ID থাকলে এডিট
// 
const SwitchForm = ({ seed, shifts, switches, onDone }) => {
  const editId = seed?.ID ?? null;
  const [form, setForm] = useState({
    shiftId: seed?.ShiftID ? String(seed.ShiftID) : '',
    checkTypeId: seed?.CheckTypeID ? String(seed.CheckTypeID) : '',
    start: seed?.start || '',
    late: seed?.late || '',
    end: seed?.end || '',
  });
  const { data: checkTypeData } = useGetTimeCheckTypesQuery();
  const [createSwitch, { isLoading: isCreating }] = useCreateTimeSwitchMutation();
  const [updateSwitch, { isLoading: isUpdating }] = useUpdateTimeSwitchMutation();
  const checkTypes = checkTypeData?.data || [];
  const isSaving = isCreating || isUpdating;

  // নির্বাচিত শিফটে যে সুইচগুলো আগে থেকেই আছে
  const usedTypeIds = new Set(
    switches.filter((sw) => String(sw.ShiftID) === form.shiftId && sw.ID !== editId).map((sw) => sw.CheckTypeID)
  );

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const { shiftId, checkTypeId, start, late, end } = form;
    if (!shiftId || !checkTypeId || !start || !late || !end) {
      toast.warning('শিফট, সুইচের ধরন, শুরু, লেট ও শেষ সময় — সবগুলো দিন');
      return;
    }
    if (!(toMinutes(start) <= toMinutes(late) && toMinutes(late) <= toMinutes(end))) {
      toast.warning('সময় ঠিক নেই: শুরু সময় ≤ লেট শুরু ≤ শেষ সময় হতে হবে');
      return;
    }
    if (usedTypeIds.has(Number(checkTypeId))) {
      toast.warning('এই শিফটে এই সুইচ আগে থেকেই আছে — তালিকা থেকে এডিট করুন');
      return;
    }
    const times = { StartTime: toServerTime(start), StartLate: toServerTime(late), EndTime: toServerTime(end) };
    try {
      if (editId) {
        await updateSwitch({ editID: editId, ShiftID: Number(shiftId), CheckTypeID: Number(checkTypeId), ...times }).unwrap();
        toast.success('সুইচ আপডেট হয়েছে');
      } else {
        await createSwitch({ ShiftID: Number(shiftId), ShiftCheckTypeID: Number(checkTypeId), ...times }).unwrap();
        toast.success('সুইচ সংরক্ষণ হয়েছে');
      }
      onDone();
    } catch (error) {
      toast.error(errorText(error, 'সংরক্ষণ করা যায়নি'));
    }
  };

  return (
    <form
      onSubmit={submit}
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm ${editId ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'}`}
    >
      <div className="mb-5 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-[17px] font-bold text-slate-800">
          <SvgIcon name="IoMdSettings" size={18} className="text-slate-700" />
          {editId ? 'সুইচ এডিট করুন' : 'অটো সুইচ সেটিং'}
        </h4>
        {editId && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">এডিট মোড</span>}
      </div>

      <div className="grid flex-1 grid-cols-1 content-start gap-x-4 gap-y-4 sm:grid-cols-2">
        <div>
          <div className="flex items-start justify-between gap-2">
            <label htmlFor="switch-shift">
              <Label required>শিফটের নাম</Label>
            </label>
            <button
              type="button"
              onClick={() => showModal('নতুন শিফট যোগ করুন', 'SHIFT_ENTRY')}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              <SvgIcon name="FaPlus" size={9} /> নতুন শিফট
            </button>
          </div>
          <select id="switch-shift" className={`${fieldClass} h-[44px]`} value={form.shiftId} onChange={set('shiftId')}>
            <option value="">শিফট নির্বাচন করুন</option>
            {shifts.map((s) => (
              <option key={s.ID} value={s.ID}>{s.ShiftNameBangla}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-start justify-between gap-2">
            <label htmlFor="switch-check-type">
              <Label required>সুইচের ধরন</Label>
            </label>
            <button
              type="button"
              onClick={() => showModal('সুইচের ধরন যোগ করুন', 'CHECK_TYPE_ENTRY')}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              <SvgIcon name="FaPlus" size={9} /> নতুন ধরন
            </button>
          </div>
          <select id="switch-check-type" className={`${fieldClass} h-[44px]`} value={form.checkTypeId} onChange={set('checkTypeId')}>
            <option value="">ধরন নির্বাচন করুন</option>
            {checkTypes.map((ct) => (
              <option key={ct.ID} value={ct.ID} disabled={usedTypeIds.has(ct.ID)}>
                {ct.TypeNameBangla}{ct.TypeNameEnglish ? ` (${ct.TypeNameEnglish})` : ''}
                {usedTypeIds.has(ct.ID) ? ' — আছে' : ''}
              </option>
            ))}
          </select>
        </div>
        <label className="block">
          <Label required>শুরু সময়</Label>
          <input type="time" className={`${fieldClass} h-[44px] tabular-nums`} value={form.start} onChange={set('start')} />
        </label>
        <label className="block">
          <Label required>লেট শুরু</Label>
          <input type="time" className={`${fieldClass} h-[44px] tabular-nums`} value={form.late} onChange={set('late')} />
        </label>
        <label className="block">
          <Label required>শেষ সময়</Label>
          <input type="time" className={`${fieldClass} h-[44px] tabular-nums`} value={form.end} onChange={set('end')} />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onDone}
          className="flex h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ↻ {editId ? 'বাতিল' : 'রিসেট'}
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'সংরক্ষণ হচ্ছে...' : editId ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
        </button>
      </div>
    </form>
  );
};

SwitchForm.propTypes = {
  seed: PropTypes.object,
  shifts: PropTypes.array.isRequired,
  switches: PropTypes.array.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default SwitchForm;
