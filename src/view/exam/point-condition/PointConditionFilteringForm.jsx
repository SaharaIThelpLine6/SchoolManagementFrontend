import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { useGetSubClassListQuery } from "../../../features/class/classQuerySlice";
import { useGetSessionsQuery } from "../../../features/session/sessionSlice";
import { useGetExamNamesQuery } from "../../../features/student/studentQuerySlice";
import useTranslate from "../../../utils/Translate";

const PointConditionFilteringForm = ({ onFilter }) => {
  const methods = useForm();
  const translate = useTranslate();
  const { watch } = methods;
  // Inside your component
  const { data: sessionData } = useGetSessionsQuery();
  const { data: subClassListData } = useGetSubClassListQuery();
  const { data: examNameData } = useGetExamNamesQuery();



  const SessionId = watch("SessionID");
  const ExamId = watch("ExamID");
  const SubClassId = watch("SubClassID");
  const SubjectId = watch("SubjectID");

  useEffect(() => {
    onFilter({
      SessionID: SessionId,
      ExamID: ExamId,
      SubClassID: SubClassId,
      BookID: SubjectId,
    });
  }, [SessionId, ExamId, SubClassId, SubjectId, onFilter]);

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <DefaultSelect
            options={sessionData ?? []}
            registerKey="SessionID"
            placeholder="বছর নির্বাচন করুন"
            nameField="SessionName"
            valueField={"SessionID"}
            unicode={true}
            label={translate("Session")}
          />
        </div>
        <div>
          <DefaultSelect
            options={examNameData ?? []}
            registerKey="ExamID"
            placeholder="পরীক্ষা নির্বাচন করুন"
            nameField="ExamName"
            valueField={"ExamID"}
            label={translate("Exam")}
            unicode={true}
          />
        </div>
        <div>
          <DefaultSelect
            options={subClassListData ?? []}
            registerKey="SubClassID"
            placeholder="শ্রেণি নির্বাচন করুন"
            nameField="SubClass"
            valueField={"SubClassID"}
            label={translate("SubClass")}
            unicode={true}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default PointConditionFilteringForm;
