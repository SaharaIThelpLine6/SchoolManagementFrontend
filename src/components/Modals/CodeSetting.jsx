import DefaultInput from "../Forms/DefaultInput";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../Forms/DefaultSelect";
import DefaultRadio from "../Radio/DefaultRadio";
import Button from "../Button/Button";
import useTranslate from "../../utils/Translate";
import { useGetUserTypesQuery } from "../../features/userType/userTypeSlice";
import {
  useGetCodeSettingsQuery,
  useGetSettingsQuery,
  useUpdateCodeSettingMutation,
  useUpdateSettingsMutation,
} from "../../features/settings/settingsQuerySlice";
import { toast } from "react-toastify";
import { useEffect, useRef } from "react";

const CodeSetting = () => {
  const methods = useForm();
  const translate = useTranslate();
  const { handleSubmit, watch, reset } = methods;

  const [UserTypeID, IDType, GenderID] = watch([
    "UserTypeID",
    "IDType",
    "GenderID",
  ]);
  const isFirstRender = useRef(true);
  const { data: userTypes = [] } = useGetUserTypesQuery(
    (undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    })
  );
  const { data: codeSettings = [] } = useGetCodeSettingsQuery(
    (undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    })
  );
  const { data: infoSettings = [] } = useGetSettingsQuery(
    (undefined,
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    })
  );
  const [CodeSetting] = useUpdateCodeSettingMutation();
  const [settingUpdate] = useUpdateSettingsMutation();

const settingsArray = infoSettings?.data || [];

// Find the setting with ID === 28
const dataGender = settingsArray.find((c) => c.ID === 28);

  const types = [
    { id: 1, name: "নির্দিষ্ট কোড হতে অটো" },
    { id: 2, name: "ম্যানুয়াল" },
  ];

  const genders = [
    { id: 1, name: "পুরুষ" },
    { id: 2, name: "মহিলা" },
    { id: 0, name: "এন্ট্রির মাধ্যমে" },
  ];

  // ----------------- Set default values if UserTypeID selected -----------------

  let existing = null;
  if (UserTypeID && codeSettings.length) {
    existing = codeSettings.find(
      (c) => Number(c.UserTypeID) === Number(UserTypeID)
    );
  }

  useEffect(() => {
    if (GenderID === undefined) return;

    // প্রথমবার render এ কিছু করবে না
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const updateGender = async () => {
      try {
        const payload = {
          ID: 28,
          Action: GenderID || null,
        };

        const response = await settingUpdate(payload).unwrap();

        toast.success(response.message || "Gender updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        console.error(err);

        let errorMessage = "Something went wrong!";
        if (err?.data?.error) {
          errorMessage = err.data.error;
        }

        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    };

    updateGender();
  }, [GenderID]);

  const onSubmit = async (data) => {
    // 🔹 Condition check: IDType যদি 2 হয় → Value null করে পাঠানো হবে
    const payload = {
      ...data,
      Value: data.IDType === 2 ? null : data.Value,
    };

    try {
      const response = await CodeSetting(payload).unwrap();

      // ✅ Success message
      toast.success(response.message || "Code setting saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);

      // ✅ Error message
      let errorMessage = "Something went wrong!";
      if (err?.data?.error) {
        errorMessage = err.data.error;
      }

      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-5 font-SolaimanLipi
               max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-center text-xl font-semibold text-gray-700">
          {translate("User Code Setting")}
        </h2>

        {/* User Type */}
        <DefaultSelect
          label="User Type"
          options={userTypes ?? []}
          registerKey="UserTypeID"
          nameField="TypeName"
          valueField="ID"
        />
        {/* Types */}
        {UserTypeID && (
          <DefaultRadio
            label={"Type"}
            options={types}
            registerKey="IDType"
            defaultValue={existing?.IDType ? existing?.IDType : ""}
          />
        )}
        {/* User Code */}
        {IDType === 1 && (
          <DefaultInput
            label="User Code"
            type="text"
            registerKey="Value"
            placeholder={"Enter user code ..."}
            defaultValue={existing?.Value ? existing?.Value : ""}
          />
        )}

        {/* Gender */}
        <DefaultRadio
          label={"Gender"}
          options={genders}
          registerKey="GenderID"
          defaultValue={dataGender?.Action || ""}
        />

        {UserTypeID && (
          <div className="pt-4">
            <Button type="submit" className="w-full">
              {translate("Save")}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  );
};

export default CodeSetting;
