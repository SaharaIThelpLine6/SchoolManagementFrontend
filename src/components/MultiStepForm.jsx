import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { registerForm } from "../features/multistep/multiStepFormSlice";
import { useMultiStepForm } from "../hooks/useMultiStepForm";

// MultiStepForm.jsx
export default function MultiStepForm({
  formId,
  steps,
}) {
  const dispatch = useDispatch();

  const [sharedStepData, setSharedStepData] = useState(null);

  useEffect(() => {
    dispatch(registerForm({ formId }));
  }, [dispatch, formId]);

  const { currentStep } = useMultiStepForm(formId);

  const step = steps[currentStep];
  console.log('MultiStepForm step:', currentStep);
  if (!step) return null;

  const Component = step.component;
  const props = step.props || {};


  return <Component {...props} sharedStepData={sharedStepData}
      setSharedStepData={setSharedStepData} />;
}

// MultiStepForm.propTypes = {
//   formId: PropTypes.string.isRequired,
//   steps: PropTypes.arrayOf(
//     PropTypes.shape({
//       component: PropTypes.elementType.isRequired,
//       props: PropTypes.object,
//     })
//   ).isRequired,
// };