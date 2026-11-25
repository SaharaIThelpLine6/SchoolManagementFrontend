import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import SvgIcon from '../components/icons/SvgIcon';
import { useGetTimeShiftingsQuery, useGetTimeSwitchesQuery } from '../features/attendance/attendanceSlice';
import SwitchForm from '../view/deviceTimeSettings/SwitchForm';
import ShiftScheduleTable from '../view/deviceTimeSettings/ShiftScheduleTable';
import AssignUsersPanel from '../view/deviceTimeSettings/AssignUsersPanel';
import { toHHMM } from '../view/deviceTimeSettings/timeUtils';

const DeviceTimeSettings = ({ pageTitle }) => {
  const { data: shiftData, isLoading: shiftsLoading } = useGetTimeShiftingsQuery();
  const { data: switchData, isLoading: switchesLoading } = useGetTimeSwitchesQuery();
  const shifts = useMemo(() => shiftData?.data || [], [shiftData]);
  const switches = useMemo(
    () =>
      (switchData?.data || []).map((sw) => ({
        ...sw,
        start: toHHMM(sw.StartTime),
        late: toHHMM(sw.StartLate),
        end: toHHMM(sw.EndTime),
      })),
    [switchData]
  );

  // ফর্মে কী দেখাবে: null = খালি নতুন ফর্ম; ID থাকলে এডিট
  const [seed, setSeed] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const loadForm = (next) => {
    setSeed(next);
    setFormKey((k) => k + 1);
  };

  return (
    <div className="font-default space-y-5">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
          <SvgIcon name="IoMdSettings" size={22} />
        </span>
        <div>
          <h3 className="font-SolaimanLipi text-[20px] font-bold text-slate-800 sm:text-[22px]">{pageTitle}</h3>
          <p className="text-sm text-slate-500">শিফটের সময়সূচি, সুইচ এবং ইউজারদের শিফট সেটিংস এখানে পরিচালনা করুন।</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <SwitchForm key={formKey} seed={seed} shifts={shifts} switches={switches} onDone={() => loadForm(null)} />
        <ShiftScheduleTable
          shifts={shifts}
          switches={switches}
          isLoading={shiftsLoading || switchesLoading}
          editingId={seed?.ID ?? null}
          onEdit={(sw) => loadForm(sw)}
          onAddSwitch={(shiftId) => loadForm({ ShiftID: shiftId })}
        />
      </div>

      <AssignUsersPanel shifts={shifts} />
    </div>
  );
};

DeviceTimeSettings.propTypes = {
  pageTitle: PropTypes.string,
};

export default DeviceTimeSettings;
