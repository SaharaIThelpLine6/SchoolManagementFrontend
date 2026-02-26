import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import TimePicker from '../../../components/Forms/DatePicker/TimePicker';
import { useCreateTimeSlotMutation } from '../../../features/class/classQuerySlice';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';
import { convertToTimeLocal } from '../../../helper/formatTimeSlots';

const TimeSlotsCreateUpdate = () => {
  const methods = useForm();
  const { handleSubmit, reset, setValue, watch } = methods;
  const translate = useTranslate();

  /* =========================
     🔹 Mutations
  ========================= */
  const [createTimeSlot, { isError, isLoading }] = useCreateTimeSlotMutation();

  /* =========================
     🔹 Submit
  ========================= */

  const onSubmit = async (formData) => {
    try {
      if (!formData.StartTime || !formData.EndTime) {
        return res.status(400).json({
          error: 'StartTime এবং EndTime আবশ্যক',
        });
      }

      const formattedStart = convertToTimeLocal(formData.StartTime);
      const formattedEnd = convertToTimeLocal(formData.EndTime);
      console.log(formattedStart, 'formattedStart');
      console.log(formattedEnd, 'formattedEnd');

      await createTimeSlot({
        StartTime: formattedStart,
        EndTime: formattedEnd,
      }).unwrap();
      toast.success(translate('Class routine created successfully'));

      hideModal();
      reset();
    } catch (error) {
      toast.error(translate('Failed to save class routine'));
      console.error(error);
    }
  };

  /* =========================
     🔹 UI
  ========================= */

  return (
    <div className="w-full border rounded-lg p-5 bg-white">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TimePicker
              timeCalender="Start Time"
              placeholder={`${translate('Select Time')}...`}
              registerKey="StartTime"
              require={true}
            />
            <TimePicker
              timeCalender="End Time"
              placeholder={`${translate('Select Time')}...`}
              registerKey="EndTime"
              require={true}
            />
          </div>

          <div className="flex gap-3 mt-4 justify-end">
            <Button type="submit">{translate('Save')}</Button>

            <Button type="button" variant="secondary" onClick={hideModal}>
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default TimeSlotsCreateUpdate;
