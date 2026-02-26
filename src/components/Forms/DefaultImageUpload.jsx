import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const DefaultImageUpload = ({
  label,
  registerKey,
  require = false,
  labelPosition = "top",
  image,
  previewUrl,
  setPreviewUrl,
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const translate = useTranslate();

  // পূর্বে থাকা image থাকলে form value এ সেট করো
  useEffect(() => {
    if (image) {
      setPreviewUrl(image);
      setValue(registerKey, image, { shouldValidate: true });
    }
  }, [image, registerKey, setValue, setPreviewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setValue(registerKey, file, { shouldValidate: true });
    } else {
      setPreviewUrl(null);
      setValue(registerKey, null, { shouldValidate: true });
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setValue(registerKey, null, { shouldValidate: true });
    const fileInput = document.getElementById(registerKey);
    if (fileInput) fileInput.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-blue-400", "bg-blue-50");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
      setValue(registerKey, file, { shouldValidate: true });
    }
  };

  return (
    <div
      className={`mb-4 ${
        labelPosition === "left" ? "md:flex md:items-start md:gap-4" : ""
      }`}
    >
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-gray-700 font-medium ${
            labelPosition === "left"
              ? "md:w-1/4 md:min-w-[120px] md:pt-2 md:text-end mb-2 block md:mb-0"
              : "mb-2 block"
          }`}
        >
          {translate(label)}
          {require && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={labelPosition === "left" ? "md:flex-1" : "w-full"}>
        <input
          id={registerKey}
          type="file"
          accept="image/*"
          {...register(registerKey, {
            required:
              require && !previewUrl && !image
                ? require || "This field is required"
                : false,
          })}
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={() => document.getElementById(registerKey)?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer bg-gray-50 flex flex-col items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
        >
          {previewUrl || image ? (
            <>
              <div className="w-full h-full">
                <img
                  src={previewUrl || image}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-sm shadow-sm hover:bg-red-500 hover:text-white transition-colors duration-200"
                title="Remove image"
              >
                ×
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <div className="bg-blue-100 p-2 rounded-full mb-1">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-xs font-medium">
                {translate("Upload image")}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {translate("Click or drag here")}
              </p>
            </div>
          )}
        </div>

        {errors[registerKey] && (
          <div className="flex items-center mt-1 text-red-600 text-xs">
            <span>{errors[registerKey].message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultImageUpload;
