import Button from '../../components/Button/Button';
import DeleteButton from '../../components/Button/DeleteButton';
import DefaultInput from '../../components/Forms/DefaultInput';
import DatePickerOne from '../../components/Forms/DatePicker/DatePickerOne';
import TimePicker from '../../components/Forms/DatePicker/TimePicker';
import { useGetExamNameQuery } from '../../features/exam/examQuerySlice';
import { useGetSessionQuery } from '../../features/session/sessionSlice';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useMultiStepForm } from '../../hooks/useMultiStepForm';
import { useGetExamShiftQuery, usePostExamShiftMutation } from '../../features/exam/examSitPlanQuerySlice';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

const PAGE_SIZE = 10;

const ExamShift = ({ examId, sessionId, setSharedStepData}) => {
  const { next } = useMultiStepForm('employeeForm');
  const methods = useForm({
    defaultValues: {
      shifts: [],
    },
  });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue
  } = methods;

  const { data: sessionData } = useGetSessionQuery(sessionId);
  const { data: examNameData } = useGetExamNameQuery(examId);

  const [addExamShift, { isLoading, isError, isSuccess, data: newApplicationResponse }] = usePostExamShiftMutation();

  const { data: examShift } = useGetExamShiftQuery({ sessionId, examId });


  const {
    fields,
    append,
    remove,
    replace,
  } = useFieldArray({
    control,
    name: "shifts",
  });
  const handleAddShift = () => {
    append({
      shiftName: '',
      startTime: '',
      endTime: '',
    });
  };



  useEffect(() => {
    if (examShift && examShift.length > 0) {
      setValue("StartDate", examShift[0]["SitPlan"]["StartDate"]);
      setValue("EndDate", examShift[0]["SitPlan"]["EndDate"]);
      setSharedStepData(examShift[0]['SitPlanID'])
      replace(
        examShift.map((shift) => ({
          ShiftID: shift?.ShiftID,
          shiftName: shift?.ShiftName,
          startTime: shift?.StartTime,
          endTime: shift?.EndTime,
        }))
      );

      // Explicitly set each field after replace
      examShift.forEach((shift, index) => {
        setValue(`shifts.${index}.ShiftID`, shift?.ShiftID);
        setValue(`shifts.${index}.shiftName`, shift?.ShiftName);
        setValue(`shifts.${index}.startTime`, shift?.StartTime);
        setValue(`shifts.${index}.endTime`, shift?.EndTime);
      });
    }
  }, [examShift]);
  const onSubmit = async (data) => {
    try {
      const response = await addExamShift(data).unwrap();
      // console.log(response);

      Swal.close();
      Swal.fire({
          icon: "success",
          title: "সাবমিশন সফল!",
          text: "শিক্ষাথীদের সিট প্লান সফল হয়েছে।",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "ঠিক আছে",
      }).then((result) => {
        if (result.isConfirmed) {
          next();
        }
      });      
    } catch (error) {
      console.error('Failed to save exam shift:', error);
    }
  };


  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">


        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              <input type="text" className='hidden' {...register('SessionID')} value={sessionId} />
              <input type="text" className='hidden' {...register('ExamID')} value={examId} />
              <DefaultInput
                registerKey={`SessionName`}
                type="text"
                readOnly
                defaultValue={sessionData?.SessionName || ''}
                label={'Session'}
              />
              <DefaultInput
                registerKey={`ExamName`}
                type="text"
                readOnly
                defaultValue={examNameData?.ExamName || ''}
                label={'Exam'}
              />
              <DatePickerOne dateCalender={'Exam Start Date'} require={true} registerKey={`StartDate`} placeholder={"Start Date"} timestamp={false} />
              <DatePickerOne dateCalender={'Exam End Date'} require={true} registerKey={`EndDate`} placeholder={"End Date"} timestamp={false} />
            </div>

            <div className='mt-4 mb-4'>
              <Button type="button" onClick={handleAddShift}> Add Shift </Button>
            </div>



            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border p-4 rounded"
              >

                <DefaultInput
                  registerKey={`shifts.${index}.shiftName`}
                  label="Shift Name"
                  type="text"
                  defaultValue={field.shiftName} 
                />
                <TimePicker
                  registerKey={`shifts.${index}.startTime`}
                  timeCalender="Start Time"
                  placeholder="Start Time"
                  defaultValue={field.startTime}  
                />
                <TimePicker
                  registerKey={`shifts.${index}.endTime`}
                  timeCalender="End Time"
                  placeholder="End Time"
                  defaultValue={field.endTime} 
                />
                {/* <DefaultInput
                  registerKey={`shifts.${index}.shiftName`}
                  label="Shift Name"
                  type="text"
                />

                <TimePicker
                  registerKey={`shifts.${index}.startTime`}
                  timeCalender="Start Time"
                  placeholder={"Start Time"}
                />

                <TimePicker
                  registerKey={`shifts.${index}.endTime`}
                  timeCalender="End Time"
                  placeholder={"End Time"}
                /> */}

                <div className="flex items-end">
                  <DeleteButton
                    type="button"
                    onClick={() => remove(index)}
                  />
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              {/* <Button type='button' className='bg-yellow-300 hover:bg-yellow-300 text-[#000]'>Save As Draft</Button> */}
              <Button type='submit'>Save & Continue</Button>
            </div>


          </form>
        </FormProvider>
      </div>


    </div>
  );
};

export default ExamShift;
