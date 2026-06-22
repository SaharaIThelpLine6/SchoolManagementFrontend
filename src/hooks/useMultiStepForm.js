import { useDispatch, useSelector } from 'react-redux';
import {
  nextStep,
  prevStep,
  goToStep,
  updateFormData,
} from '../features/multistep/multiStepFormSlice';

export const useMultiStepForm = (formId) => {
  const dispatch = useDispatch();

  const form = useSelector(
    (state) => state.multiPartForm.forms[formId]
  );

  return {
    currentStep: form?.currentStep ?? 0,

    next: () =>
      dispatch(nextStep({ formId })),

    previous: () =>
      dispatch(prevStep({ formId })),

    goTo: (step) =>
      dispatch(goToStep({ formId, step })),

    saveData: (data) =>
      dispatch(
        updateFormData({
          formId,
          data,
        })
      ),
  };
};