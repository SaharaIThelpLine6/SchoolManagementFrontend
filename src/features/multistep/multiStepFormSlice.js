import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  forms: {},
};

const multiPartFormSlice = createSlice({
  name: 'multiPartForm',

  initialState,

  reducers: {
    registerForm: (state, action) => {
      const { formId } = action.payload;

      if (!state.forms[formId]) {
        state.forms[formId] = {
          currentStep: 0,
          completedSteps: [],
          formData: {},
        };
      }
    },

    nextStep: (state, action) => {
      const { formId } = action.payload;

      if (state.forms[formId]) {
        state.forms[formId].currentStep += 1;
      }
    },

    prevStep: (state, action) => {
      const { formId } = action.payload;

      if (
        state.forms[formId] &&
        state.forms[formId].currentStep > 0
      ) {
        state.forms[formId].currentStep -= 1;
      }
    },

    goToStep: (state, action) => {
      const { formId, step } = action.payload;

      if (state.forms[formId]) {
        state.forms[formId].currentStep = step;
      }
    },

    markStepCompleted: (state, action) => {
      const { formId, step } = action.payload;

      const form = state.forms[formId];

      if (
        form &&
        !form.completedSteps.includes(step)
      ) {
        form.completedSteps.push(step);
      }
    },

    updateFormData: (state, action) => {
      const { formId, data } = action.payload;

      if (state.forms[formId]) {
        state.forms[formId].formData = {
          ...state.forms[formId].formData,
          ...data,
        };
      }
    },

    resetForm: (state, action) => {
      const { formId } = action.payload;

      if (state.forms[formId]) {
        state.forms[formId] = {
          currentStep: 0,
          completedSteps: [],
          formData: {},
        };
      }
    },

    removeForm: (state, action) => {
      const { formId } = action.payload;

      delete state.forms[formId];
    },
  },
});

export const {
  registerForm,
  nextStep,
  prevStep,
  goToStep,
  markStepCompleted,
  updateFormData,
  resetForm,
  removeForm,
} = multiPartFormSlice.actions;

export default multiPartFormSlice.reducer;