import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  registerForm,
  nextStep,
  prevStep,
  goToStep,
  updateFormData,
} from '../features/multistep/multiStepFormSlice';

export const useMultiStepForm = (formId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!formId) return;
    dispatch(registerForm({ formId }));
  }, [dispatch, formId]);

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