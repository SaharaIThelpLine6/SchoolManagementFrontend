import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Button from '../../../components/Button/Button';
import DefaultSelect from '../../../components/Forms/DefaultSelect';
import SwitcherFour from '../../../components/Switchers/SwitcherFour';
import { hideModal } from '../../../utils/ModalControlar';
import useTranslate from '../../../utils/Translate';

import {
  useCreateClassRoutineMutation,
  useGetAcademicSubjectsBySubClassQuery,
  useGetClassRoutineDaysQuery,
  useGetSingleClassRoutineQuery,
  useGetSubClassListQuery,
  useGetTimeSlotsQuery,
  useUpdateClassRoutineMutation,
} from '../../../features/class/classQuerySlice';

import Loading from '../../../components/Loading/Loading';
import {
  useGetLoginTeacherInfoQuery,
  useGetTeacherInfoWhitUserQuery,
} from '../../../features/teachers/teachersSlice';
import SearchableMultiDaySelect from '../../../components/Forms/SearchableMultiDaySelect';
import Textarea from '../../../components/Forms/Textarea';
import { useGetSessionsQuery } from '../../../features/session/sessionSlice';

const ClassRoutineCreateUpdate = ({ id }) => {
  const methods = useForm();
  const { handleSubmit, reset, setValue, watch } = methods;
  const translate = useTranslate();

  const isEditMode = Boolean(id);
  const [selected, setSelected] = useState([]);

  /* =========================
     🔹 Queries
  ========================= */
  const { data: sessionData } = useGetSessionsQuery();
  const activeSession = sessionData?.find((item) => item.SessionStatus === 1);
  const {
    data: daysData = [],
    isLoading: daysLoading,
    isError: daysError,
  } = useGetClassRoutineDaysQuery();

  const {
    data: timeSlotsDatas = [],
    isLoading: timeSlotsLoading,
    isError: timeSlotsError,
  } = useGetTimeSlotsQuery();

  const {
    data: loginTeacherData = [],
    isLoading: loginTeacherLoading,
    isError: loginTeacherError,
  } = useGetLoginTeacherInfoQuery();

  const {
    data: teachers = [],
    isLoading: teachersLoading,
    isError: teachersError,
  } = useGetTeacherInfoWhitUserQuery();

  const {
    data: classListResponse = [],
    isLoading: classLoading,
    isError: classError,
  } = useGetSubClassListQuery();

  const {
    data: routineResponse,
    isLoading: routineLoading,
    isError: routineError,
  } = useGetSingleClassRoutineQuery(id, {
    skip: !isEditMode,
  });
  const isLoading =
    daysLoading ||
    timeSlotsLoading ||
    loginTeacherLoading ||
    teachersLoading ||
    classLoading ||
    routineLoading;

  const isError =
    daysError ||
    timeSlotsError ||
    loginTeacherError ||
    teachersError ||
    classError ||
    routineError;
  const routineData = routineResponse?.data;
  console.log(routineData, 'routineData');

  const subClassId = Number(watch('SubClassID'));

  const { data: subjectsResponse } = useGetAcademicSubjectsBySubClassQuery(
    subClassId,
    {
      skip: !subClassId,
    }
  );

  /* =========================
     🔹 Memo Data
  ========================= */

  const timeSlotOptions = useMemo(() => {
    return (timeSlotsDatas ?? []).map((item) => ({
      TimeSlotID: item.TimeSlotID,
      Label: `${item.StartTime} - ${item.EndTime}`, // use template literal
    }));
  }, [timeSlotsDatas]);

  const filteredSubjects = subjectsResponse?.data ?? [];

  console.log(filteredSubjects, 'filteredSubjects');

  /* =========================
     🔹 Prefill (Edit Mode)
  ========================= */

  useEffect(() => {
    if (isEditMode && routineData) {
      reset({
        DayID: routineData.DayID,
        TimeSlotID: routineData.TimeSlotID,
        TeacherID: routineData.TeacherID,
        SubClassID: routineData.SubClassID,
        ISPrayerBreak: routineData.IsBreak,
        Comment: routineData.Comment,
      });
    } else if (!isEditMode && loginTeacherData?.[0]?.UserID) {
      setValue('TeacherID', loginTeacherData[0].UserID);
    }
  }, [isEditMode, routineData, loginTeacherData, reset, setValue]);

  useEffect(() => {
    if (isEditMode && routineData) {
      if (subClassId && filteredSubjects?.length > 0) {
        setValue('SubjectID', routineData.SubjectID);
      }
    }
  }, [subClassId, filteredSubjects, setValue]);

  // Default Session
  useEffect(() => {
    reset({
      SessionID: activeSession?.SessionID || "",
    });
  }, [activeSession, reset]);

  /* =========================
     🔹 Mutations
  ========================= */

  const [createRoutine, { isLoading: isCreating }] =
    useCreateClassRoutineMutation();

  const [updateRoutine, { isLoading: isUpdating }] =
    useUpdateClassRoutineMutation();

  /* =========================
     🔹 Submit
  ========================= */

  const onSubmit = async (formData) => {
    const payload = {
      DayIDs: formData.DayIDs,
      SessionID: formData.SessionID,
      TimeSlotID: Number(formData.TimeSlotID),
      TeacherID: Number(formData.TeacherID),
      SubjectID: Number(formData.SubjectID),
      SubClassID: Number(formData.SubClassID),
      ISPrayerBreak: Boolean(formData.ISPrayerBreak),
      Comment: formData.Comment,
    };

    try {
      if (isEditMode) {
        await updateRoutine({ id, data: payload }).unwrap();
        toast.success(translate('Class routine updated successfully'));
      } else {
        console.log(payload, 'payload');
        await createRoutine(payload).unwrap();
        toast.success(translate('Class routine created successfully'));
      }

      // hideModal();
      setSelected([])
      // 🔥 SubClassID থাকবে, বাকিগুলো reset
      reset({
        SubClassID: formData.SubClassID,
      });
    } catch (error) {
      toast.error(translate('Failed to save class routine'));
      console.error(error);
    }
  };

  /* =========================
     🔹 UI
  ========================= */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load data. Please try again.
      </div>
    );
  }

  return (
    <div className="w-full border rounded-lg p-5 bg-white">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {
              isEditMode &&
              <DefaultSelect
                label={translate('Day')}
                registerKey="DayID"
                options={daysData}
                valueField="DayID"
                nameField="DayName"
                require={translate('Day is required')}
              />
            }

            <DefaultSelect
              label={translate('Session')}
              registerKey="SessionID"
              options={sessionData || []}
              valueField="SessionID"
              nameField="SessionName"
              require={translate('Session is required')}
            />
            <DefaultSelect
              label={translate('Time')}
              registerKey="TimeSlotID"
              options={timeSlotOptions || []}
              valueField="TimeSlotID"
              nameField="Label"
              require={translate('Time slot is required')}
            />

            <DefaultSelect
              label={translate('Sub Class')}
              registerKey="SubClassID"
              options={classListResponse}
              valueField="SubClassID"
              nameField="SubClass"
              require={translate('Class is required')}
            />

            <DefaultSelect
              label={translate('Subject')}
              registerKey="SubjectID"
              options={filteredSubjects}
              valueField="SubjectID"
              nameField="SubjectName"
              require={translate('Subject is required')}
            />

            <DefaultSelect
              label={translate('Teacher')}
              registerKey="TeacherID"
              options={teachers?.data || []}
              valueField="UserID"
              nameField="UserName"
              require={translate('Teacher is required')}
            />
            <Textarea registerKey="Comment" label="Comment" />

            {
              !isEditMode &&
              <SearchableMultiDaySelect
                label="Day"
                registerKey="DayIDs"
                setSelected={setSelected}
                selected={selected}
                options={daysData}
                require={true}
              />
            }

            {/* <SwitcherFour
              name="ISPrayerBreak"
              label={translate('Prayer Break')}
              defaultValue={isEditMode ? routineData.ISPrayerBreak : ''}
            /> */}
          </div>

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
