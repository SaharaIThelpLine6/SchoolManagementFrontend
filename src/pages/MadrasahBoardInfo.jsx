import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import { hideModal } from "../utils/ModalControlar";

import {
  useGetStudentsVacationTypeListQuery,
  usePostStudentsVacationTypeMutation,
  useUpdateStudentsVacationTypeMutation,
} from "../features/student/studentQuerySlice";
import useTranslate from "../utils/Translate";
import DefaultInput from "../components/Forms/DefaultInput";
import Button from "../components/Button/Button";

const MadrasahBoardInfo = ({ userId }) => {
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
    <div className="font-SolaimanLipi bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <h3 className="font-SolaimanLipi text-[18px] md:text-[20px] font-bold mb-4 md:mb-5 text-center md:text-left">
        {translate("Madrasah Information")}
      </h3>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Bangla Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-center items-center md:justify-center">
                <h3 className="font-SolaimanLipi text-base font-semibold">
                  {translate("Bangla")}
                </h3>
              </div>
              <DefaultInput
                registerKey="VillageBn"
                require={translate("Village is required")}
                type="text"
                placeholder={translate("Enter your village") + " ..."}
                label={translate("Village")}
              />
              <DefaultInput
                registerKey="PostOfficeBn"
                require={translate("Post office required!")}
                type="text"
                placeholder={translate("Enter your post office") + " ..."}
                label={translate("Post Office")}
              />
              <DefaultInput
                registerKey="ThanaBn"
                require={translate("Thana is required")}
                type="text"
                placeholder={translate("Enter your thana") + " ..."}
                label={translate("Thana")}
              />
              <DefaultInput
                registerKey="DistrictBn"
                require={translate("District is required")}
                type="text"
                placeholder={translate("Enter your district") + " ..."}
                label={translate("District")}
              />
              <DefaultInput
                registerKey="IlhakBn"
                require={translate("Ilhak is required")}
                type="text"
                placeholder={translate("Enter ilhak") + " ..."}
                label={translate("Ilhak")}
              />
            </div>

            {/* Arabic Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-center items-center md:justify-center">
                <h3 className="font-SolaimanLipi text-base font-semibold">
                  {translate("Arabic")}
                </h3>
              </div>
              <DefaultInput
                registerKey="VillageAr"
                require={translate("Village is required")}
                type="text"
                placeholder={translate("Enter village in Arabic") + " ..."}
                label={translate("Village (Arabic)")}
              />
              <DefaultInput
                registerKey="PostOfficeAr"
                require={translate("Post office required!")}
                type="text"
                placeholder={translate("Enter post office in Arabic") + " ..."}
                label={translate("Post Office (Arabic)")}
              />
              <DefaultInput
                registerKey="ThanaAr"
                require={translate("Thana is required")}
                type="text"
                placeholder={translate("Enter thana in Arabic") + " ..."}
                label={translate("Thana (Arabic)")}
              />
              <DefaultInput
                registerKey="DistrictAr"
                require={translate("District is required")}
                type="text"
                placeholder={translate("Enter district in Arabic") + " ..."}
                label={translate("District (Arabic)")}
              />
              <DefaultInput
                registerKey="IlhakAr"
                require={translate("Ilhak is required")}
                type="text"
                placeholder={translate("Enter ilhak in Arabic") + " ..."}
                label={translate("Ilhak (Arabic)")}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="w-full flex justify-start my-5">
            <Button
              loading={isCreating || isUpdating}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg"
              type="submit"
            >
              {userId ? translate("Update") : translate("Create")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default MadrasahBoardInfo;
