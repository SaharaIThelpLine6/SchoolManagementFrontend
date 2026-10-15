import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css'; // 🔹 Swal CSS fix
import Button from '../../components/Button/Button';
import DefaultInput from '../../components/Forms/DefaultInput';
import {
  useCreateClassMutation,
  useGetSingleClassQuery,
  useUpdateClassMutation,
} from '../../features/class/classQuerySlice';
import { hideModal } from '../../utils/ModalControlar';
import useTranslate from '../../utils/Translate';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import { useGetExamFilterExamsQuery, useGetExamNamesQuery, useGetExamSessionQuery } from '../../features/exam/examQuerySlice';
import DefaultSelect from '../../components/Forms/DefaultSelect';
import { useGetSessionsQuery } from '../../features/session/sessionSlice';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

const ExamRouteSettingCreateModal = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, reset, setValue } = methods;
  const { watch } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: examNameData } = useGetExamNamesQuery();

  const onSubmit = async (formData) => {
    try {

      console.log(formData, "formData")
      // Toast.fire({
      //   icon: 'success',
      //   title: translate('Class created successfully')
      // });
      // hideModal();
      // reset();
    } catch (err) {
      Toast.fire({
        icon: 'error',
        title: translate('Failed to save class')
      });
      console.error(err);
    }
  };

  return (
    <div className="w-full bg-white">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">

            <DefaultSelect
              label={translate('Session')}
              nameField="SessionName"
              registerKey="SessionID"
              valueField="SessionID"
              options={sessionData ?? []}
              require="This Field is required"
              defaultSelect={false}
              unicode={true}
            />
            <DefaultSelect
              label={translate('Exam Names')}
              nameField="ExamName"
              registerKey="ExamID"
              valueField="ExamID"
              options={examNameData ?? []}
              require={'This Field is required'}
              unicode={true}
            />

            <DatePickerOne
              dateCalender="Exam Start Date"
              placeholder="Enter date"
              registerKey="SatrtDate"
              require="Date Required"
            />
            <DatePickerOne
              dateCalender="Exam End Date"
              placeholder="Enter date"
              registerKey="EndDate"
              require="Date Required"
            />

            <DefaultSelect
              label={translate('Exam Start Day')}
              nameField="DayName"
              registerKey="StartDayID"
              valueField="DayID"
              options={[
                { DayID: 1, DayName: 'শনিবার' },
                { DayID: 2, DayName: 'রবিবার' },
                { DayID: 3, DayName: 'সোমবার' },
                { DayID: 4, DayName: 'মঙ্গলবার' },
                { DayID: 5, DayName: 'বুধবার' },
                { DayID: 6, DayName: 'বৃহস্পতিবার' },
                { DayID: 7, DayName: 'শুক্রবার' },
              ]}
              require={'This Field is required'}
              unicode={true}
            />
            <DefaultSelect
              label={translate('Exam End Day')}
              nameField="DayName"
              registerKey="EndDayID"
              valueField="DayID"
              options={[
                { DayID: 1, DayName: 'শনিবার' },
                { DayID: 2, DayName: 'রবিবার' },
                { DayID: 3, DayName: 'সোমবার' },
                { DayID: 4, DayName: 'মঙ্গলবার' },
                { DayID: 5, DayName: 'বুধবার' },
                { DayID: 6, DayName: 'বৃহস্পতিবার' },
                { DayID: 7, DayName: 'শুক্রবার' },
              ]}
              require={'This Field is required'}
              unicode={true}
            />
          </div>
          <div className="flex gap-3 mt-4 justify-end">
            <Button
              type="submit"
            // disabled={isAdding || isUpdating}
            // loading={isAdding || isUpdating}
            >
              {translate('Save')}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ExamRouteSettingCreateModal;
