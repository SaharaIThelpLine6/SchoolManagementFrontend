import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const DefaultImageUpload = ({
  label,
  registerKey,
  require = false,
  labelPosition = "top", 
  image,
  previewUrl, setPreviewUrl
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();


  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  return (
<div
  className={`w-full mb-4 ${
    labelPosition === "left" ? "flex items-start gap-4" : ""
  }`}
>
  {/* Image Preview / Empty Placeholder */}
  <div className="flex justify-center items-center mb-3">
    <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200 shadow-md group transition-transform duration-300 hover:scale-105 bg-gray-50">
      {image || previewUrl ? (
        <>
          <img
            src={previewUrl ? previewUrl : image}
            alt="preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="text-white text-sm font-medium">Preview</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
          No Image
        </div>
      )}
    </div>
  </div>

  {label && (
    <label
      htmlFor={registerKey}
      className={`text-gray-700 font-medium ${
        labelPosition === "left"
          ? "w-1/4 min-w-[120px] pt-2 text-end"
          : "mb-2 block"
      }`}
    >
      {translate(label)}
    </label>
  )}

  <div className={labelPosition === "left" ? "flex-1" : "w-full"}>
    {/* File Input */}
    <input
      type="file"
      accept="image/*"
      {...register(registerKey, {
        required: require && !image ? "This field is required" : false,
      })}
      onChange={handleFileChange}
      className={`block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 
        focus:outline-none file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0
        file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100
        ${errors[registerKey] ? "border-red-400" : ""}`}
    />

    {errors[registerKey] && (
      <p className="text-red-500 text-sm mt-1">
        {errors[registerKey].message}
      </p>
    )}
  </div>
</div>

  );
};

export default DefaultImageUpload;
