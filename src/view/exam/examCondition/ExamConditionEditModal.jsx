import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import MultiStepForm from "../../../components/MultiStepForm";
import ExamAverageDetermination from "../average-condition/ExamAverageDetermination";
import ExamSubjectPassNumber from "../average-condition/ExamSubjectPassNumber";
import ExamResultsCondition from "../average-condition/ExamResultsCondition";
import ExamAverageDeterminationEdit from "../average-condition/ExamAverageDeterminationEdit";
import TalentCondition from "../average-condition/TalentCondition";
import useTranslate from "../../../utils/Translate";

const ExamConditionEditModal = ({data}) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
     const translate = useTranslate()
  return (
    <div className="font-default bg-white overflow-hidden">
      <MultiStepForm
        formId="examConditionEdit"
        showStepper
        steps={[
          {
            label: translate("Average Determination"),
            component: ExamAverageDeterminationEdit,
          },
          {
            label: translate("Subject Pass"),
            component: ExamSubjectPassNumber,
          },
          {
            label: translate("Result Condition"),
            component: ExamResultsCondition,
          },
           {
            label: translate("Talent Condition"),
            component: TalentCondition,
          },
        ]}
        defaultData={data}
      />
    </div>
  );
};

export default ExamConditionEditModal;