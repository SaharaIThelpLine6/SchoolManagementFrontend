import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { FiCheck } from "react-icons/fi";
import { registerForm, goToStep } from "../features/multistep/multiStepFormSlice";
import { useMultiStepForm } from "../hooks/useMultiStepForm";
import useTranslate from "../utils/Translate";

export default function MultiStepForm({
  formId,
  steps,
  showStepper = false,
  defaultData = null
}) {
  const dispatch = useDispatch();
  const translate = useTranslate();

  const [sharedStepData, setSharedStepData] = useState(defaultData);

  useEffect(() => {
    dispatch(registerForm({ formId }));
  }, [dispatch, formId]);

  const { currentStep } = useMultiStepForm(formId);

  const step = steps[currentStep];
  if (!step) return null;

  const Component = step.component;
  const props = step.props || {};

  return (
    <>
      {showStepper && (
        <div className="border-b border-gray-100 pt-4">
          <div className="mx-auto">
            <div className="relative flex items-start justify-between">

              {/* Background line */}
              <div
                className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200"
                style={{
                  marginLeft: `${100 / steps.length / 2}%`,
                  marginRight: `${100 / steps.length / 2}%`,
                }}
              />

              {/* Progress line */}
              <div
                className="absolute top-5 left-0 h-[2px] bg-blue-600 transition-all duration-500"
                style={{
                  marginLeft: `${100 / steps.length / 2}%`,
                  width:
                    currentStep === 0
                      ? "0%"
                      : `calc(${(currentStep / (steps.length - 1)) *
                          (100 - 100 / steps.length)}%)`,
                }}
              />

              {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                // Allow going only to current or previous steps
                const canGo = index <= currentStep;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center relative z-10"
                  >
                    <button
                      type="button"
                      disabled={!canGo}
                      onClick={() =>
                        canGo &&
                        dispatch(
                          goToStep({
                            formId,
                            step: index,
                          })
                        )
                      }
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 transition-all duration-300 ring-4
                        ${
                          isCompleted
                            ? "bg-blue-600 text-white ring-blue-100 cursor-pointer"
                            : isActive
                            ? "bg-blue-600 text-white ring-blue-100 scale-110 cursor-pointer"
                            : "bg-white text-gray-400 ring-gray-100 border border-gray-200 cursor-not-allowed"
                        }`}
                    >
                      {isCompleted ? <FiCheck size={18} /> : index + 1}
                    </button>

                    <div className="mt-3 text-center px-1">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted || isActive
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {translate(step.label || "")}
                      </p>

                      {step.description && (
                        <p className="hidden md:block text-xs text-gray-400 mt-0.5">
                          {translate(step.description)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <Component
        {...props}
        sharedStepData={sharedStepData}
        setSharedStepData={setSharedStepData}
      />
    </>
  );
}