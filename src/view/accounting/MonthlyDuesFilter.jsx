import React, { useEffect } from "react";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import { FormProvider, useForm } from "react-hook-form";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetSubClassListQuery } from "../../features/class/classQuerySlice";
import { useGetExamNamesQuery } from "../../features/student/studentQuerySlice";
import useTranslate from "../../utils/Translate";

const MonthlyDuesFilter = ({ onFilter }) => {
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

  useEffect(() => {
    onFilter({
      SessionId,
      ExamId,
      SubClassId,
    });
  }, [SessionId, ExamId, SubClassId, onFilter]);

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <DefaultSelect
            options={sessionData ?? []}
            registerKey="SessionID"
            placeholder="বছর নির্বাচন করুন"
            nameField="SessionName"
            valueField={"SessionID"}
            label="Session"
            unicode={true}
          />
        </div>
        <div>
          <DefaultSelect
            options={examNameData ?? []}
            registerKey="ExamID"
            placeholder="পরীক্ষা নির্বাচন করুন"
            nameField="ExamName"
            valueField={"ExamID"}
            unicode={true}
            label="Exam"
          />
        </div>
        <div>
          <DefaultSelect
            options={subClassListData ?? []}
            registerKey="SubClassID"
            placeholder="শ্রেণি নির্বাচন করুন"
            nameField="SubClass"
            valueField={"SubClassID"}
            label="SubClass"
            unicode={true}
          />
        </div>{" "}
        <div>
          <DefaultSelect
            options={subClassListData ?? []}
            registerKey="SubClassID"
            placeholder="শ্রেণি নির্বাচন করুন"
            nameField="SubClass"
            valueField={"SubClassID"}
            label="SubClass"
            unicode={true}
          />
        </div>{" "}
        <div>
          <DefaultSelect
            options={subClassListData ?? []}
            registerKey="SubClassID"
            placeholder="শ্রেণি নির্বাচন করুন"
            nameField="SubClass"
            valueField={"SubClassID"}
            label="SubClass"
            unicode={true}
          />
        </div>
      </div>
    </FormProvider>
  );
};

export default MonthlyDuesFilter;
