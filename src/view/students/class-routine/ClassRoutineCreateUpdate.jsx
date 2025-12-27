import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DefaultInput from '../../../components/Forms/DefaultInput';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

import SwitcherFour from '../../../components/Switchers/SwitcherFour';
import {
  useCreateClassRoutineMutation,
  useGetAcademicSubjectsQuery,
  useGetSingleClassRoutineQuery,
  useGetSubClassListQuery,
  useUpdateClassRoutineMutation,
} from '../../../features/class/classQuerySlice';
import { useGetTeacherInfoQuery } from '../../../features/teachers/teachersSlice';

const ClassRoutineCreateUpdate = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;

  const isEditMode = !!id;
  console.log(id, 'id');

  // 🔹 Fetch routine only in edit mode
  const { data: routineData, isLoading } = useGetSingleClassRoutineQuery(id, {
    skip: !isEditMode,
  });

  console.log(routineData, 'routineData');

  const { data: subjects } = useGetAcademicSubjectsQuery();
  const { data: teachers } = useGetTeacherInfoQuery();
  const { data: classList } = useGetSubClassListQuery();

  // 🔹 Mutations
  const [createRoutine, { isLoading: isCreating }] =
    useCreateClassRoutineMutation();
  const [updateRoutine, { isLoading: isUpdating }] =
    useUpdateClassRoutineMutation();
  // 🔹 Pre-fill form (Edit mode)
  useEffect(() => {
    if (routineData?.data) {
      const routine = routineData.data;
      setValue('ISPrayerBreak', routine.ISPrayerBreak);
      setValue('DayName', routine.DayName);
      setValue('TimeSlot', routine.TimeSlot);
    }
  }, [routineData, setValue]);
  useEffect(() => {
    if (routineData?.data) {
      const routine = routineData.data;
      const timer = setTimeout(() => {
        setValue('TIID', routine.TeacherID);
        setValue('SubClassID', routine.SubClassID);
        setValue('SubjectID', routine.SubjectID);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [routineData, setValue]);

  // 🔹 Submit handler
  const onSubmit = async (formData) => {
    try {
      if (isEditMode) {
        const payload = {
          DayName: formData.DayName,
          TimeSlot: formData.TimeSlot,
          TeacherID: formData.TIID,
          SubjectID: formData.SubjectID,
          SubClassID: formData.SubClassID,
          ISPrayerBreak: formData.ISPrayerBreak,
        };
        await updateRoutine({
          id: id,
          data: payload,
        }).unwrap();
        toast.success(translate('Class routine updated successfully'));
      } else {
        console.log(formData, 'formData');
        await createRoutine(formData).unwrap();
        toast.success(translate('Class routine created successfully'));
      }
      hideModal();
      reset();
    } catch (error) {
      toast.error(translate('Failed to save class routine'));
      console.error(error);
    }
  };
  const teacherOptions = (teachers ?? []).map((item) => ({
    TIID: item.TIID,
    UserName: item.User?.UserName ?? '',
  }));

  return (
    <div className="w-full border rounded-lg p-5 bg-white">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Day */}
            <DefaultSelect
              label={translate('Day')}
              registerKey="DayName"
              options={[
                { ID: '1', value: 'Sunday' },
                { ID: '2', value: 'Monday' },
                { ID: '3', value: 'Tuesday' },
                { ID: '4', value: 'Wednesday' },
                { ID: '5', value: 'Thursday' },
                { ID: '6', value: 'Friday' },
                { ID: '7', value: 'Saturday' },
              ]}
              valueField="value"
              nameField="value"
              require={translate('Day is required')}
            />

            {/* Time Slot */}
            <DefaultInput
              label={translate('Time Slot')}
              registerKey="TimeSlot"
              placeholder="8:00 - 9:30 AM"
              require={translate('Time slot is required')}
            />

            {/* Subject */}
            <DefaultSelect
              label={translate('Subject')}
              registerKey="SubjectID"
              options={subjects ?? []}
              valueField="SubjectID"
              nameField="SubjectName"
              require={translate('Subject is required')}
            />

            {/* Teacher */}
            <DefaultSelect
              label={translate('Teacher')}
              registerKey="TIID"
              options={teacherOptions}
              valueField="TIID"
              nameField="UserName"
              require={translate('Teacher is required')}
            />

            {/* Class */}
            <DefaultSelect
              label={translate('Sub Class')}
              registerKey="SubClassID"
              options={classList ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              require={translate('Class is required')}
            />

            {/* Prayer Break */}
            {/* Prayer Break */}
            <SwitcherFour
              name="ISPrayerBreak"
              label={translate('Prayer Break')}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="submit"
              disabled={isCreating || isUpdating}
              loading={isCreating || isUpdating}
            >
              {isEditMode ? translate('Update') : translate('Save')}
            </Button>

            <Button type="button" variant="secondary" onClick={hideModal}>
              {translate('Cancel')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ClassRoutineCreateUpdate;
