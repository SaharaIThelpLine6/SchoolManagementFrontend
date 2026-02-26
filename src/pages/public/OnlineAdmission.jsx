import React from "react";
import AddOnlineStudentForm from "../../components/Forms/AddOnlineStudentForm";
import { useParams } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";

const OnlineAdmission = () => {
  const { schoolid } = useParams();
  const methods = useForm();

  return (
    <div>
      <FormProvider {...methods}>
        <AddOnlineStudentForm schoolid={schoolid} />
      </FormProvider>
    </div>
  );
};

export default OnlineAdmission;
