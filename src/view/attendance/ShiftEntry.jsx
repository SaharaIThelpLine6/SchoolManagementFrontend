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
  useDeleteTimeShiftingMutation
} from '../../features/attendance/attendanceSlice';

import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import SvgIcon from '../../components/icons/SvgIcon';

const ShiftEntry = () => {
  const methods = useForm();
  const translate = useTranslate();

  const [editID, setEditID] = useState(null);
  const { handleSubmit, reset, setValue } = methods;


  const { data: shiftLists = [] } = useGetTimeShiftingsQuery();


  const [createShift, { isLoading: isCreating }] =
    useCreateTimeShiftingMutation();

  const [updateShift, { isLoading: isUpdating }] =
    useUpdateTimeShiftingMutation();

  const [deleteShift, { isLoading: isDeleting }] =
    useDeleteTimeShiftingMutation();



  const onSubmit = async (data) => {
    try {
      if (editID) {

        await updateShift({
          editID,
          ...data,
        }).unwrap();
        setEditID(null)
        toast.success(translate('Shift updated successfully'));
      } else {
        await createShift(data).unwrap();

        toast.success(translate('Shift created successfully'));
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
      await deleteShift(ID).unwrap();

      toast.success(translate('Shift deleted successfully'));
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
          className="grid grid-cols-1 gap-4"
        >
          <DefaultInput
            label={translate('শিফট  নাম (ইংরেজি)')}
            registerKey="ShiftNameEnglish"
            require={translate('English name is required')}
          />

          <DefaultInput
            label={translate('শিফট  নাম (বাংলা)')}
            registerKey="ShiftNameBangla"
            require={translate('Bangla name is required')}
          />

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
              {shiftLists?.data?.length || 0} {translate('Items')}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('Action')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    #
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('English Name')}
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {translate('Bangla Name')}
                  </th>


                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {shiftLists?.data?.length > 0 ? (
                  shiftLists?.data.map((item, index) => (
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

                      <td className="px-4 py-3 font-medium text-slate-700">
                        {item.ShiftNameEnglish}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {item.ShiftNameBangla}
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

export default ShiftEntry;