import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import DefaultGreen from "../Button/DefaultGreen";
import { hideModal } from "../../utils/ModalControlar";
import {
  useGetDesignationQuery,
  useUpdateDesignationMutation,
} from "../../features/teachers/teachersSlice";

const EditDesignationForm = ({ userId }) => {
  const translate = useTranslate();

  const methods = useForm();
  const { setValue, reset } = methods;

  const [updateDesignation, { isLoading }] = useUpdateDesignationMutation();
  const { data: designationList = [], isLoading: isDesignationLoading } =
    useGetDesignationQuery();

  // Find the selected designation
  const selectedDesignation = designationList.find(
    (item) => item.DNID === userId
  );

  // Set form default values once data is available
  useEffect(() => {
    if (selectedDesignation) {
      reset({
        Designation: selectedDesignation.Designation || "",
      });
    }
  }, [selectedDesignation, reset]);

  const onSubmit = async (data) => {
    try {
      const finalData = {
        DNID: userId,
        Designation: data.Designation,
      };

      await updateDesignation(finalData).unwrap();
      hideModal();
      Swal.fire({
        title: translate("Designation updated successfully!"),
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Failed to update designation"),
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  if (isDesignationLoading || !selectedDesignation) {
    return <div className="p-4">{translate("Loading...")}</div>;
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="font-lato p-6">
        <div className="mb-4">
          <DefaultInput
            registerKey="Designation"
            require={translate("Designation is required")}
            type="text"
            placeholder={translate("Enter new designation") + " ..."}
            label={translate("Designation") + " :"}
          />
        </div>
        <DefaultGreen
          submitButtonGreen={translate("Save")}
          disabled={isLoading}
        />
      </form>
    </FormProvider>
  );
};

export default EditDesignationForm;
