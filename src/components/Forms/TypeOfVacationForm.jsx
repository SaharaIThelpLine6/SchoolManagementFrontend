import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";
import DefaultInput from "./DefaultInput";
import { hideModal } from "../../utils/ModalControlar";
import Button from "../Button/Button";

import {
  useGetStudentsVacationTypeListQuery,
  usePostStudentsVacationTypeMutation,
  useUpdateStudentsVacationTypeMutation,
} from "../../features/student/studentQuerySlice";

const TypeOfVacationForm = ({ userId }) => {
  const translate = useTranslate();

  const methods = useForm();
  const { reset } = methods;

  const [postVacationType, { isLoading: isCreating }] =
    usePostStudentsVacationTypeMutation();
  const [updateVacationType, { isLoading: isUpdating }] =
    useUpdateStudentsVacationTypeMutation();

  const { data: studentVacationTypeData = [], isLoading: isVacationLoading } =
    useGetStudentsVacationTypeListQuery();

  const selectedVacationType = studentVacationTypeData.find(
    (item) => item.ID === userId
  );

  useEffect(() => {
    if (userId && selectedVacationType) {
      reset({
        Vacation: selectedVacationType.VacationList || "",
      });
    } else {
      reset({ Vacation: "" });
    }
  }, [userId, selectedVacationType, reset]);

  const onSubmit = async (data) => {
    const finalData = {
      VacationList: data.Vacation,
    };

    try {
      if (userId) {
        // EDIT
        await updateVacationType({
          id: userId,
          VacationList: data.Vacation,
        }).unwrap();
        Swal.fire({
          title: translate("Vacation updated successfully!"),
          icon: "success",
        });
      } else {
        // CREATE
        await postVacationType(finalData).unwrap();
        Swal.fire({
          title: translate("Vacation created successfully!"),
          icon: "success",
        });
      }

      hideModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: translate("Failed to submit vacation"),
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="font-lato p-6">
        <div className="mb-4">
          <DefaultInput
            registerKey="Vacation"
            require={translate("Vacation is required")}
            type="text"
            placeholder={translate("Enter type of vacation") + " ..."}
            label={translate("Type of vacation") + " :"}
          />
        </div>
        <Button
          loading={isCreating || isUpdating}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          type="submit"
        >
          {userId ? translate("Update") : translate("Create")}
        </Button>
      </form>
    </FormProvider>
  );
};

export default TypeOfVacationForm;

// import { useEffect } from "react";
// import { useForm, FormProvider } from "react-hook-form";
// import useTranslate from "../../utils/Translate";
// import Swal from "sweetalert2";
// import DefaultInput from "./DefaultInput";
// import { hideModal } from "../../utils/ModalControlar";
// import {
//   useGetDesignationQuery,
//   useUpdateDesignationMutation,
//   useCreateDesignationMutation, // Add create mutation
// } from "../../features/teachers/teachersSlice";
// import Button from "../Button/Button";
// import {
//   useGetStudentsVacationTypeListQuery,
//   usePostStudentsVacationTypeMutation,
// } from "../../features/student/studentQuerySlice";

// const TypeOfVacationForm = ({ userId }) => {
//   const translate = useTranslate();
//   const [postVacationType] = usePostStudentsVacationTypeMutation();
//   const {
//     data: studentVacationTypeData = [],
//     isSVTError,
//     isSVTLoading,
//   } = useGetStudentsVacationTypeListQuery();
//   console.log(studentVacationTypeData);

//   const methods = useForm();
//   const { reset } = methods;

//   const [updateDesignation, { isLoading: isUpdating }] =
//     useUpdateDesignationMutation();
//   const [createDesignation, { isLoading: isCreating }] =
//     useCreateDesignationMutation();

//   const { data: designationList = [], isLoading: isDesignationLoading } =
//     useGetDesignationQuery();

//   const selectedDesignation = designationList.find(
//     (item) => item.DNID === userId
//   );

//   console.log(userId);

//   useEffect(() => {
//     if (userId && selectedDesignation) {
//       reset({
//         Designation: selectedDesignation.Designation || "",
//       });
//     } else {
//       reset({ Designation: "" });
//     }
//   }, [userId, selectedDesignation, reset]);

//   const onSubmit = async (data) => {
//     const finalData = {
//       VacationList: data.Vacation,
//     };

//     try {
//       if (userId) {
//         // EDIT
//         await updateDesignation({ ...finalData, DNID: userId }).unwrap();
//         Swal.fire({
//           title: translate("Vacation updated successfully!"),
//           icon: "success",
//         });
//       } else {
//         // CREATE
//         await postVacationType(finalData).unwrap();
//         Swal.fire({
//           title: translate("Vacation created successfully!"),
//           icon: "success",
//         });
//       }

//       hideModal();
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: translate("Failed to submit vacation"),
//         confirmButtonColor: "#3B82F6",
//       });
//     }
//   };

//   return (
//     <FormProvider {...methods}>
//       <form onSubmit={methods.handleSubmit(onSubmit)} className="font-lato p-6">
//         <div className="mb-4">
//           <DefaultInput
//             registerKey="Vacation"
//             require={translate("Vacation is required")}
//             type="text"
//             placeholder={translate("Enter type of vacation") + " ..."}
//             label={translate("Type of vacation") + " :"}
//           />
//         </div>
//         <Button
//           loading={isCreating || isUpdating}
//           className="bg-blue-500 hover:bg-blue-600 text-white"
//           type="submit"
//         >
//           {userId ? translate("Update") : translate("Create")}
//         </Button>
//       </form>
//     </FormProvider>
//   );
// };

// export default TypeOfVacationForm;
