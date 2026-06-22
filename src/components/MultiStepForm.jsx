import { useMultiStepForm } from "../hooks/useMultiStepForm";

// MultiStepForm.jsx
export default function MultiStepForm({
  formId,
  steps,
}) {
  const { currentStep } = useMultiStepForm(formId);

  const CurrentStep = steps[currentStep];

  return <CurrentStep />;
}