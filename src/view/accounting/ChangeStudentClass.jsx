import { FormProvider, useForm } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useGetIncomeExpenseTodaysBalanceByCaidQuery, useGetIncomeExpenseTodaysBalanceQuery } from "../../features/feeCollection/feeCollectionSlice";
import { useEffect, useState } from "react";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import { useGetClassListQuery, useGetSubClassLisByClassIDQuery, useGetSubClassListQuery } from "../../features/class/classQuerySlice";
import { fetchSettingsData } from "../../features/settings/settingsSlice";
import { fetchSingleStudentData } from "../../features/student/studentSlice";
import UserOne from "../../images/user/checking.jpeg";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import DefaultGreen from "../../components/Button/DefaultGreen";
import { useChangeStudentClassMutation } from "../../features/student/studentQuerySlice";

const ChangeStudentClass = ({ userId }) => {
  const methods = useForm({
    defaultValues: {
      UserID: "",
      SessionID: "",
      ClassID: "",
      SubClassID: "",
    },
  });
  const translate = useTranslate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { data: classListData } = useGetClassListQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { singleStudent } = useSelector((state) => state.student);
  const { studentFinancialStatus, academicSession } = useSelector((state) => state.settings);
  const permissionType = user?.permissionType;
  const [CAID, SetCAID] = useState(null)
  const { handleSubmit, reset, watch, setValue } = methods;
  const { ClassID } = watch()
  useEffect(() => {
    if (!studentFinancialStatus.length || !academicSession.length) {
      dispatch(fetchSettingsData());
    }
    if (singleStudent?.UserID != userId) {
      dispatch(fetchSingleStudentData(userId));
    }
  }, [dispatch]);


  useEffect(() => {
    reset({
      UserID: singleStudent?.UserID,
      SessionID: singleStudent?.SessionID,
      ClassID: singleStudent?.ClassID
    });
  }, [singleStudent])

  const { data: subclassListByUser } = useGetSubClassLisByClassIDQuery(ClassID, { skip: !ClassID })
  const [chnageStudentClass, { isLoading: isCreating }] = useChangeStudentClassMutation();



  const onSubmit = async (data) => {
    try {
      await chnageStudentClass(data).unwrap();
      Swal.fire({
        title: translate("Success"),
        text: translate("Subject created successfully"),
        icon: "success"
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: translate("Error"),
        text: error.data?.message || translate("Something went wrong"),
        icon: "error"
      });
    }


  }


  useEffect(() => {
    if (subclassListByUser?.length > 0 && singleStudent?.SubClassID) {
      setValue("SubClassID", singleStudent?.SubClassID)
    }
  }, [subclassListByUser]);



  return (
    <div className="bg-white gap-6 rounded-2xl shadow-md w-full">

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="font-SolaimanLipi">
          <input className="hidden" {...methods.register("UserID")} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 bg-[#f8fafc] p-3 rounded-[5px] font-SolaimanLipi">
            <DefaultSelect
              label="Session"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode={true}
            />
            <DefaultSelect
              options={classListData}
              require={"Class is require"}
              nameField={"ClassName"}
              valueField={"ClassID"}
              registerKey={"ClassID"}
              type={"number"}
              label="Admission Class"
            />

            <DefaultSelect
              label="SubClass"
              options={subclassListByUser ?? []}
              valueField="SubClassID"
              nameField="SubClass"
              registerKey="SubClassID"
              unicode={true}
            />
            <div className="flex mt-[10px] pl-[4px] font-bold relative">
              <div className="flex gap-3">
                <DefaultGreen submitButtonGreen={"Update"} />
              </div>
            </div>

            {/* subClassListData */}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default ChangeStudentClass;
