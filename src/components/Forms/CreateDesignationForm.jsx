import { useForm, FormProvider, useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import DefaultGreen from "../Button/DefaultGreen";
import { hideModal } from "../../utils/ModalControlar";
import {
  useCreateDesignationMutation,
  useGetDesignationQuery,
} from "../../features/teachers/teachersSlice";

const CreateDesignationForm = () => {
  const translate = useTranslate();

  const methods = useForm();

  const [createDesignation, { isLoading }] = useCreateDesignationMutation();

  const { data: designationList = [], isError } = useGetDesignationQuery();
  console.log(designationList);
  const onSubmit = async (data) => {
    try {
      const maxSerial = designationList.reduce((max, designation) => {
        return designation.SL > max ? designation.SL : max;
      }, 0);
      console.log(maxSerial + 1);
      const finalData = {
        ...data,
        SL: maxSerial + 1,
      };

      await createDesignation(finalData).unwrap();

      methods.reset();
      hideModal();
      Swal.fire({
        title: translate("Designation created successfully!"),
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Failed to create designation"),
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="font-lato p-6">
        <div className="mb-4">
          <DefaultInput
            registerKey={"Designation"}
            require={translate("Designation is required")}
            type={"text"}
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

export default CreateDesignationForm;
