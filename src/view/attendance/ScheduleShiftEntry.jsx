import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';

import {
  useCreateTimeShiftingMutation,
  useGetTimeShiftingsQuery,
  useUpdateTimeShiftingMutation,
  useGetTimeShiftingByIdQuery,
  useDeleteTimeShiftingMutation,
  useGetTimeCheckTypesQuery,
  useCreateTimeSwitchMutation,
  useUpdateTimeSwitchMutation,
  useDeleteTimeSwitchMutation,
  useGetTimeSwitchesQuery
} from '../../features/attendance/attendanceSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SvgIcon from '../../components/icons/SvgIcon';
import TimePicker from '../../components/Forms/DatePicker/TimePicker';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { attendanceFormatTime, formatTime } from '../../helper/formatTime';
import { convertToTimeLocal } from '../../helper/formatTimeSlots';

const ScheduleShiftEntry = () => {
  const methods = useForm();
  const translate = useTranslate();

  const [editID, setEditID] = useState(null);
  const { handleSubmit, reset, setValue, watch } = methods;

  const [ShiftID] = watch(["ShiftID"])


  const { data: shiftLists = [] } = useGetTimeShiftingsQuery();
  const { data: checkTypes = [] } = useGetTimeCheckTypesQuery();
  const {
    data: switchLists = [],
    isLoading,
    isFetching,
  } = useGetTimeSwitchesQuery(ShiftID, {
    skip: !ShiftID,
  });
  console.log(switchLists, "switchLists")


  const [createSwitch, { isLoading: isCreating }] =
    useCreateTimeSwitchMutation();

  const [updateSwitch, { isLoading: isUpdating }] =
    useUpdateTimeSwitchMutation();

  const [deleteSwitch, { isLoading: isDeleting }] =
    useDeleteTimeSwitchMutation();



  const onSubmit = async (data) => {
    try {
      if (editID) {

        await updateSwitch({
          editID,
          ...data,
        }).unwrap();
        setEditID(null)
        toast.success(translate('Switch updated successfully'));
      } else {
        // await createSwitch(data).unwrap();
        console.log(data, "data")
        // toast.success(translate('Switch created successfully'));
      }

      // hideModal();
      reset();
    } catch (err) {
      console.error(err);

      toast.error(
        err?.data?.error ||
        err?.data?.message ||
        translate('Something went wrong')
      );
    }
  };

  const handleUpdate = (item) => {
    try {
      setEditID(item.ID);
      setValue('ShiftNameEnglish', item.ShiftNameEnglish || '');
      setValue('ShiftNameBangla', item.ShiftNameBangla || '');
    } catch (error) {
      console.error(error);
      toast.error(translate('Something went wrong'));
    }
  };

  const handleDelete = async (ID) => {
    try {
      await deleteSwitch(ID).unwrap();

      toast.success(translate('Switch deleted successfully'));
    } catch (error) {
      console.error(error);

      toast.error(
        error?.data?.error ||
        error?.data?.message ||
        translate('Something went wrong')
      );
    }
  };
  const handleReset = () => {
    reset();
    setEditID(null);
  }

  return (
    <div className="bg-white rounded-lg border p-5">
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            <DefaultSelect
              label={translate("শিফট  নাম")}
              options={shiftLists?.data ?? []}
              valueField="ID"
              nameField="ShiftNameBangla"
              registerKey="ShiftID"
            />
            <DefaultSelect
              label={translate("সুইচ নাম")}
              options={checkTypes?.data ?? []}
              valueField="ID"
              nameField="TypeNameBangla"
              registerKey="ShiftCheckTypeID"
            />

            <TimePicker
              timeCalender="শুরুর সময়"
              placeholder={`${translate("Select Time")}...`}
              registerKey="StartTime"
              require={true}
            />
            <TimePicker
              timeCalender="শুরুর দেরি সময়"
              placeholder={`${translate("Select Time")}...`}
              registerKey="StartLateTime"
              require={true}
            />
            <TimePicker
              timeCalender="শেষ সময়"
              placeholder={`${translate("Select Time")}...`}
              registerKey="EndTime"
              require={true}
            />
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <Button
              type="submit"
              loading={isCreating || isUpdating}
              disabled={isCreating || isUpdating}
            >
              {editID ? translate('Update') : translate('Save')}
            </Button>

            <Button
              type="button"
              className="bg-gray-400  hover:bg-gray-500"
              onClick={handleReset}
            >
              {translate('Reset')}
            </Button>
          </div>
        </form>
        {/* ==================== Shift List ==================== */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b bg-slate-50 px-5 py-3">
            <h3 className="text-lg font-semibold text-slate-700">
              {translate('Shift List')}
            </h3>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
              {switchLists?.data?.length || 0} {translate('Items')}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    অ্যাকশন
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('সময়ের নাম')}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শুরুর সময়')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শুরুর দেরি সময়')}
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('শেষ সময়')}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {switchLists?.data?.length > 0 ? (
                  switchLists?.data.map((item, index) => (
                    <tr
                      key={item.ID}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdate(item)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
                          >
                            <SvgIcon name="FiEdit" className="h-4 w-4 text-blue-100" />

                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.ID)}
                            className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
                          >
                            <SvgIcon name="FaTrash" className="h-4 w-4 text-blue-100" />

                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-600">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.TypeNameBangla}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {attendanceFormatTime(item.StartTime)}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {attendanceFormatTime(item.StartLate)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {attendanceFormatTime(item.EndTime)}
                      </td>



                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-slate-400"
                    >
                      {translate('No shift found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </FormProvider>
    </div>
  );
};

export default ScheduleShiftEntry;