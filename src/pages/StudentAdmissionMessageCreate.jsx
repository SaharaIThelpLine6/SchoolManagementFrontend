import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import EditButton from '../components/Button/EditButton';
import Loading from '../components/Loading/Loading';
import SortableTable from '../components/Tables/SortableTable';
import { setPageName } from '../features/auth/authSlice';
import { useGetStudentAdmissionMessageQuery } from '../features/settings/settingsQuerySlice';
import { showModal } from '../utils/ModalControlar';
import useTranslate from '../utils/Translate';
import Countdown from './userpanel/Countdown';
import Button from '../components/Button/Button';
import DefaultSelect from '../components/Forms/DefaultSelect';
import { useGetSessionsQuery } from '../features/session/sessionSlice';
import { useGetClassListQuery, useGetSubClassListQuery } from '../features/class/classQuerySlice';
import { FormProvider, useForm } from 'react-hook-form';
import Textarea from '../components/Forms/Textarea';
import DatePickerOne from '../components/Forms/DatePicker/DatePickerOne';
import RadioOption from '../components/Radio/RadioOption';
import Swal from 'sweetalert2';
import { usePostAdmissionTimeMessageMutation } from '../features/student/studentQuerySlice';

const StudentAdmissionMessageCreate = ({ ClassType }) => {
  const methods = useForm();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const location = useLocation();
  const { handleSubmit, reset } = methods;

  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const [postAdmissionTimeMessage] = usePostAdmissionTimeMessageMutation();


  const onSubmit = async (data) => {

    if (!ClassType) {
      return Swal.fire({
        icon: "error",
        title: "ভুল হয়েছে",
        text: "অনুগ্রহ করে আগে একটি ক্লাস টাইপ নির্বাচন করুন।"
      });
    }

    const payload = {
      ...data,
      ClassType: Number(ClassType) // 🔥 ensure number
    };

    try {
      const res = await postAdmissionTimeMessage(payload).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফল হয়েছে",
        text: res?.message || "অ্যাডমিশন মেসেজ সফলভাবে সংরক্ষণ করা হয়েছে।",
        confirmButtonText: "ঠিক আছে"
      });

      console.log(data, "data");

      // 👉 optional
      // reset();

    } catch (error) {

      const errorMessage =
        error?.data?.error ||   // 🔥 backend error field
        error?.data?.message ||
        "কিছু একটা ভুল হয়েছে, আবার চেষ্টা করুন।";

      Swal.fire({
        icon: "error",
        title: "ত্রুটি",
        text: errorMessage,
        confirmButtonText: "ঠিক আছে"
      });

      console.error("Error:", error);
    }
  };

  const handleReset = () => {
    reset();
  }





  return (
    <FormProvider {...methods}>
      <div className="font-SolaimanLipi bg-white p-4 sm:p-6 rounded-xl shadow-xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Session */}
          <DefaultSelect
            options={sessionData ?? []}
            registerKey="SessionID"
            placeholder="বছর নির্বাচন করুন"
            nameField="SessionName"
            valueField="SessionID"
            label={translate("Session")}
            require={true}
          />

          {/* Class */}
          <DefaultSelect
            options={classListData ?? []}
            registerKey="ClassID"
            placeholder="শ্রেণি নির্বাচন করুন"
            nameField="ClassName"
            valueField="ClassID"
            label={translate("Class")}
            require={true}
          />

          {/* Date */}
          <div className="md:col-span-2 lg:col-span-2">
            <DatePickerOne
              dateCalender="Admission Deadline Date"
              placeholder="From Date"
              registerKey="CreatedAt"
            />
          </div>

          {/* Textareas */}
          <Textarea
            label="ভর্তি হওয়ার পর"
            registerKey="Message1stPart"
            placeholder="এসএমএস মেসেজ লিখুন..."
            require={true}
            rows={4}
          />

          <Textarea
            label="ভর্তি হওয়ার আগে"
            registerKey="Message2ndPart"
            placeholder="এসএমএস মেসেজ লিখুন..."
            require={true}
            rows={4}
          />

          <Textarea
            label="ভর্তির সময় শেষ হলে"
            registerKey="Message3rdPart"
            placeholder="এসএমএস মেসেজ লিখুন..."
            require={true}
            rows={4}
          />

          {/* Buttons */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="w-full sm:w-auto">
                Submit
              </Button>
              <Button
                type="button"
                className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                onClick={handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>

  );
};

export default StudentAdmissionMessageCreate;
