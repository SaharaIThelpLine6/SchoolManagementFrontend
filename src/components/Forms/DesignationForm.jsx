import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import DefaultGreen from "../Button/DefaultGreen";
import { hideModal } from "../../utils/ModalControlar";
import {
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useGetDesignationQuery,
} from "../../features/teachers/teachersSlice";

const DesignationForm = ({ userId = null }) => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset } = methods;

  const [createDesignation, { isLoading: isCreating }] = useCreateDesignationMutation();
  const [updateDesignation, { isLoading: isUpdating }] = useUpdateDesignationMutation();
  const { data: designationList = [], isLoading: isDesignationLoading } = useGetDesignationQuery();

  const selectedDesignation = designationList.find((item) => item.DNID === userId);

  // If editing, set default values
  useEffect(() => {
    if (userId && selectedDesignation) {
      reset({
        Designation: selectedDesignation.Designation || "",
      });
    }
  }, [userId, selectedDesignation, reset]);

  const onSubmit = async (data) => {
    try {
      if (userId) {
        // Edit existing designation
        const finalData = {
          DNID: userId,
          Designation: data.Designation,
        };
        await updateDesignation(finalData).unwrap();
        Swal.fire({
          title: translate("Designation updated successfully!"),
          icon: "success",
        });
      } else {
        // Create new designation
        const maxSerial = designationList.reduce((max, designation) => {
          return designation.SL > max ? designation.SL : max;
        }, 0);
        const finalData = {
          ...data,
          SL: maxSerial + 1,
        };
        await createDesignation(finalData).unwrap();
        methods.reset();
        Swal.fire({
          title: translate("Designation created successfully!"),
          icon: "success",
        });
      }

      hideModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Failed to save designation"),
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  if (userId && (isDesignationLoading || !selectedDesignation)) {
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
            label="Designation"
          />
        </div>
        <DefaultGreen
          submitButtonGreen={translate("Save")}
          disabled={isCreating || isUpdating}
        />
      </form>
    </FormProvider>
  );
};

export default DesignationForm;
