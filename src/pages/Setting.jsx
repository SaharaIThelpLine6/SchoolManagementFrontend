import React, { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import Swal from "sweetalert2";
import "flatpickr/dist/flatpickr.css";
import { Buffer } from "buffer";
import useTranslate from "../utils/Translate";
import DefaultInput from "../components/Forms/DefaultInput";
import { formFieldsSettings } from "../components/Forms/FormData/SettingFormData";
import {
  useGetInstitutionInfoQuery,
  useUpdateInstitutionInfoMutation,
} from "../features/settings/settingsQuerySlice";
import Button from "../components/Button/Button";
import Loading from "../components/Loading/Loading";

const Setting = () => {
  const translate = useTranslate();

  const {
    data: institutionInfo,
    isLoading,
    isError,
  } = useGetInstitutionInfoQuery();
  const [updateInstitutionInfo] = useUpdateInstitutionInfoMutation();

  const [images, setImages] = useState({
    Logo: null,
    SignaturePrincipal: null,
    SignatureNajem: null,
    SignatureAccountant: null,
  });

  useEffect(() => {
    if (institutionInfo) {
      const loadedImages = {};
      ["Logo", "SignaturePrincipal", "SignatureNajem", "SignatureAccountant"].forEach((key) => {
        const bufferData = institutionInfo[key]?.data;
        if (bufferData) {
          const base64 = Buffer.from(bufferData).toString("base64");
          loadedImages[key] = `data:image/png;base64,${base64}`;
        }
      });
      setImages(loadedImages);
    }
  }, [institutionInfo]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    if (institutionInfo) {
      reset({
        AccountantName: institutionInfo.AccountantName || "",
        Address: institutionInfo.Address || "",
        AdmissionType: institutionInfo.AdmissionType || false,
        AraAddress: institutionInfo.AraAddress || "",
        AraContactNumber: institutionInfo.AraContactNumber || "",
        AraDistrict: institutionInfo.AraDistrict || "",
        AraInstitutionName: institutionInfo.AraInstitutionName?.trim() || "",
        AraPoliceStation: institutionInfo.AraPoliceStation || "",
        AraPostOffice: institutionInfo.AraPostOffice || "",
        AraVillage: institutionInfo.AraVillage || "",
        ContactNumber: institutionInfo.ContactNumber || "",
        District: institutionInfo.District || "",
        Elhaq: institutionInfo.Elhaq || "",
        Email: institutionInfo.Email || "",
        EngAddress: institutionInfo.EngAddress || "",
        EngInstitutionName: institutionInfo.EngInstitutionName || "",
        InstitutionName: institutionInfo.InstitutionName || "",
        InstitutionCode: institutionInfo.InstitutionCode || "",
        NajemName: institutionInfo.NajemName || "",
        PoliceStation: institutionInfo.PoliceStation || "",
        PostOffice: institutionInfo.PostOffice || "",
        PrincipalName: institutionInfo.PrincipalName || "",
        SMSMobile: institutionInfo.SMSMobile || "",
        Village: institutionInfo.Village || "",
      });
    }
  }, [institutionInfo, reset]);

  // Image preview state & refs
  const [imagePreviews, setImagePreviews] = useState(Array(4).fill(null));
  const fileInputs = useRef([]);

  const handleImageClick = (index) => {
    fileInputs.current[index]?.click();
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedPreviews = [...imagePreviews];
        updatedPreviews[index] = reader.result;
        setImagePreviews(updatedPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const updatedData = {
        ...data,
        // Logo: imagePreviews[0] || images.Logo,
        // SignaturePrincipal: imagePreviews[1] || images.SignaturePrincipal,
        // SignatureNajem: imagePreviews[2] || images.SignatureNajem,
        // SignatureAccountant: imagePreviews[3] || images.SignatureAccountant,
      };

      await updateInstitutionInfo(updatedData).unwrap();
      Swal.fire({
        title: "Institution info updated successfully!",
        icon: "success",
        draggable: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Institution update failed",
        confirmButtonColor: "#3B82F6",
      });
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <p className="text-lg font-semibold">Page Data Not Found</p>
        </div>
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 md:p-4 rounded-xl shadow-lg"
    >
      <div className="px-[24px] text-[14px]">
        <div className="flex flex-col gap-5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {formFieldsSettings.map((section, idx) => (
              <React.Fragment key={idx}>
                <div className="col-span-full">
                  <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">
                    {translate(section.title)}
                  </h2>
                </div>
                {section.fields.map((field) => (
                  <DefaultInput
                    key={field.key}
                    registerKey={field.key}
                    type={field.type || "text"}
                    placeholder={translate(`Enter ${field.label}`) + " ..."}
                    label={translate(field.label) + " :"}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Signatories Section */}
          <div className="col-span-3 w-full">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-1">
              {translate("Signatories")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {["Logo", "Principal", "Najem", "Accountant"].map((role, index) => (
              <div
                key={index}
                className="flex flex-col items-center bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
              >
                {role === "Logo" ? (
                  <p className="mb-5 text-sm font-semibold text-gray-700 mt-9">
                    {translate("Institution Logo Upload")}
                  </p>
                ) : (
                  <div className="mb-3 w-full">
                    <DefaultInput
                      registerKey={`${role}Name`}
                      type="text"
                      label={translate(`${role} Name`) + " :"}
                      placeholder={translate(`Enter ${role} Name`) + " ..."}
                    />
                  </div>
                )}

                {/* Image Preview/Upload */}
                <div
                  className="w-[150px] h-[150px] overflow-hidden rounded-lg shadow-inner mb-3 cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <img
                    src={
                      imagePreviews[index] ||
                      images[
                        role === "Logo"
                          ? "Logo"
                          : `Signature${role}`
                      ] ||
                      "https://live.staticflickr.com/7262/26793943536_523d3176a2_z.jpg"
                    }
                    alt={`${role} image`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => (fileInputs.current[index] = el)}
                  onChange={(e) => handleImageChange(e, index)}
                  className="hidden"
                  disabled
                />

                <p className="text-sm font-medium text-gray-700">
                  Size: 144 x 144
                </p>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex pl-[4px] font-bold">
            <Button type="submit">{translate("Save")}</Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Setting;
