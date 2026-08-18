import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../../features/auth/authSlice";
import AverageDetermination from "../average-condition/AverageDetermination";
import SubjectPassNumber from "../average-condition/SubjectPassNumber";
import Button from "../../../components/Button/Button";
import ResultsCondition from "../average-condition/ResultsCondition";
import useTranslate from "../../../utils/Translate";
import { FiCheck, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ExamSubjectPassNumber from "../average-condition/ExamSubjectPassNumber";
import MultiStepForm from "../../../components/MultiStepForm";
import ExamAverageDetermination from "../average-condition/ExamAverageDetermination";
import ExamResultsCondition from "../average-condition/ExamResultsCondition";
import TalentCondition from "../average-condition/TalentCondition";
// import TalentCondition from "../../../pages/TalentCondition";

const ExamConditionModal = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  // const steps = [
  //   {
  //     id: "average",
  //     label: "Average Determination",
  //     description: "",
  //     component: <AverageDetermination title="Average Determination" />
  //   },
  //   {
  //     id: "subject",
  //     label: "Subject Pass Number",
  //     description: "",
  //     component: <ExamSubjectPassNumber title="Subject Pass Number" />
  //   },
  //   {
  //     id: "results",
  //     label: "Results Condition",
  //     description: "",
  //     component: <ResultsCondition title="Results Condition" colorOption={true} />
  //   }
  // ];

  // const isLast = activeStep === steps.length - 1;
  // const isFirst = activeStep === 0;

  return (
    <div className="font-default bg-white overflow-hidden">
      <MultiStepForm
        formId="examCondition"
        showStepper
        steps={[
          {
            label: "Average Determination",
            component: ExamAverageDetermination,
          },
          {
            label: "Subject Pass",
            component: ExamSubjectPassNumber,
          },
          {
            label: "Result Condition",
            component: ExamResultsCondition,
          },
          {
            label: "Result Talent Condition",
            component: TalentCondition,
          },
        ]}
      />
      {/* Stepper Header */}
      {/* Stepper Header bg-gradient-to-r from-slate-50 to-blue-50/40 */}
      {/* <div className="border-b border-gray-100 pt-4">
        <div className="mx-auto">
          <div className="relative flex items-start justify-between">
            <div
              className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200"
              style={{
                marginLeft: `${100 / steps.length / 2}%`,
                marginRight: `${100 / steps.length / 2}%`
              }}
            />
            <div
              className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-500 ease-out"
              style={{
                marginLeft: `${100 / steps.length / 2}%`,
                width:
                  activeStep === 0
                    ? "0%"
                    : `calc(${(activeStep / (steps.length - 1)) * (100 - 100 / steps.length)}%)`
              }}
            />

            {steps.map((step, index) => {
              const isCompleted = index < activeStep;
              const isActive = index === activeStep;

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative z-10">

                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all duration-300 ring-4 ${isCompleted ? "bg-blue-600 text-white ring-blue-100" : isActive ? "bg-blue-600 text-white ring-blue-100 scale-110" : "bg-white text-gray-400 ring-gray-100 border border-gray-200"}`}
                  >
                    {isCompleted ? <FiCheck size={18} /> : index + 1}
                  </button>

                  <div className="mt-3 text-center px-1">
                    <p
                      className={`text-sm font-semibold transition-colors ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                    >
                      {translate(step.label)}
                    </p>
                    <p className="hidden md:block text-xs text-gray-400 mt-0.5">
                      {translate(step.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div> */}

      {/* Step Content */}
      {/* <div className="min-h-[240px]">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={activeStep === index ? "block animate-[fadeIn_0.25s_ease]" : "hidden"}
          >
            {step.component}
          </div>
        ))}
      </div> */}

      {/* Navigation Footer */}
      {/* <div className="flex items-center justify-between px-6 md:px-8 py-4 border-t border-gray-100 bg-gray-50/50">
        <Button
          type="button"
          disabled={isFirst}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${isFirst
            ? "opacity-40 cursor-not-allowed bg-gray-100 !text-gray-400"
            : "bg-white border border-gray-200 !text-gray-700 hover:bg-gray-100"
            }`}
        >
          <FiChevronLeft size={16} />
          {translate("Previous")}
        </Button>

        <span className="text-xs text-gray-400 font-medium">
          {translate("Step")} {activeStep + 1} {translate("of")} {steps.length}
        </span>

        <Button
          type="button"
          onClick={() =>
            isLast ? null : setActiveStep((s) => Math.min(steps.length - 1, s + 1))
          }
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
        >
          {isLast ? translate("Finish") : translate("Next")}
          {!isLast && <FiChevronRight size={16} />}
        </Button>
      </div> */}
    </div>
  );
};

export default ExamConditionModal;