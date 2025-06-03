import { FormProvider, useForm } from 'react-hook-form';

const ParentComponent = ({ children }) => {
  const methods = useForm();
  
  return (
    <FormProvider {...methods}>
      {children}
    </FormProvider>
  );
};

export default ParentComponent;