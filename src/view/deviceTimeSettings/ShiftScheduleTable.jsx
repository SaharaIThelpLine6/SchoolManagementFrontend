import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import SvgIcon from '../../components/icons/SvgIcon';
import { useDeleteTimeSwitchMutation } from '../../features/attendance/attendanceSlice';
import { errorText, toBnDigits, toBnDisplay } from './timeUtils';

const ShiftScheduleTable = ({ shifts, switches, isLoading, editingId, onEdit, onAddSwitch }) => {
  const [deleteSwitch] = useDeleteTimeSwitchMutation();
  const groups = shifts.map((shift) => ({ shift, items: switches.filter((sw) => sw.ShiftID === shift.ID) }));
  const known = new Set(shifts.map((s) => s.ID));
  const orphans = switches.filter((sw) => !known.has(sw.ShiftID));
  if (orphans.length) groups.push({ shift: { ID: 'orphan', ShiftNameBangla: 'অজানা শিফট' }, items: orphans });

  const remove = async (sw) => {
    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'সুইচ মুছবেন?',
      text: `${sw.TypeNameBangla} (${toBnDisplay(sw.start)} – ${toBnDisplay(sw.end)}) মুছে যাবে।`,
      showCancelButton: true,
      confirmButtonText: 'মুছুন',
      cancelButtonText: 'বাতিল',
      confirmButtonColor: '#dc2626',
    });
    if (!confirmation.isConfirmed) return;
    try {
      await deleteSwitch(sw.ID).unwrap();
      toast.success('মুছে ফেলা হয়েছে');
    } catch (error) {
      toast.error(errorText(error, 'মুছে ফেলা যায়নি'));
    }
  };

  return (
    <section className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="flex items-center gap-2 text-[17px] font-bold text-slate-800">
          <SvgIcon name="SubCalendar" size={18} className="text-blue-600" />
          শিফট তালিকা
        </h4>
      </div>

      <div className="max-h-[420px] flex-1 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-[13px] text-slate-600 shadow-[0_1px_0_#e2e8f0]">
            <tr>
              <th className="w-16 px-4 py-3 font-bold">ক্রমিক</th>
              <th className="px-3 py-3 font-bold">সুইচ</th>
              <th className="px-3 py-3 font-bold">শুরু সময়</th>
              <th className="px-3 py-3 font-bold">লেট</th>
              <th className="px-3 py-3 font-bold">শেষ সময়</th>
              <th className="px-3 py-3 text-center font-bold">অ্যাকশন</th>
            </tr>
          </thead>

          {isLoading && (
            <tbody>
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">লোড হচ্ছে...</td></tr>
            </tbody>
          )}
          {!isLoading && groups.length === 0 && (
            <tbody>
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">কোনো শিফট নেই। বাম পাশের &quot;নতুন শিফট&quot; দিয়ে শুরু করুন।</td></tr>
            </tbody>
          )}

          {groups.map(({ shift, items }) => (
            <tbody key={shift.ID} className="border-b border-slate-100 last:border-b-0">
              <tr>
                <td colSpan={6} className="px-2 pb-1 pt-2">
                  <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-slate-500 to-slate-400 px-3.5 py-2.5 text-white">
                    <span className="font-SolaimanLipi text-[15px] font-bold">{shift.ShiftNameBangla}</span>
                    <span className="flex items-center gap-3 text-xs">
                      {toBnDigits(items.length)} টি সুইচ
                      {shift.ID !== 'orphan' && (
                        <button
                          type="button"
                          onClick={() => onAddSwitch(shift.ID)}
                          title="এই শিফটে সুইচ যোগ করুন"
                          aria-label={`${shift.ShiftNameBangla} শিফটে সুইচ যোগ করুন`}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 hover:bg-white/35"
                        >
                          <SvgIcon name="FaPlus" size={9} />
                        </button>
                      )}
                    </span>
                  </div>
                </td>
              </tr>
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-xs italic text-slate-400">এই শিফটে এখনো কোনো সুইচ নেই</td>
                </tr>
              )}
              {items.map((sw, index) => (
                <tr key={sw.ID} className={editingId === sw.ID ? 'bg-amber-50' : 'hover:bg-slate-50'}>
                  <td className="px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {toBnDigits(index + 1)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-SolaimanLipi font-semibold text-slate-800">{sw.TypeNameBangla}</span>
                    {sw.TypeNameEnglish && <span className="ml-1 text-xs text-slate-400">({sw.TypeNameEnglish})</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">{toBnDisplay(sw.start)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-amber-700">{toBnDisplay(sw.late)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-700">{toBnDisplay(sw.end)}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-center">
                    <button type="button" onClick={() => onEdit(sw)} title="এডিট" aria-label={`${sw.TypeNameBangla} এডিট`} className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50">
                      <SvgIcon name="FiEdit" size={14} />
                    </button>
                    <button type="button" onClick={() => remove(sw)} title="মুছুন" aria-label={`${sw.TypeNameBangla} মুছুন`} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                      <SvgIcon name="FaTrash" size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </section>
  );
};

ShiftScheduleTable.propTypes = {
  shifts: PropTypes.array.isRequired,
  switches: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  editingId: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onAddSwitch: PropTypes.func.isRequired,
};

export default ShiftScheduleTable;
