import React, { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";

const CropImageUpload = ({
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

  const [fileSizeError, setFileSizeError] = useState("");
  const [removed, setRemoved] = useState(false);

  // Cropper state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const cropperRef = useRef(null);

  const translate = useTranslate();

  useEffect(() => {
    if (image) {
      setPreviewUrl(image);
      setValue(registerKey, image, { shouldValidate: true });
      setRemoved(false);
    }
  }, [image, registerKey, setValue, setPreviewUrl]);

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const maxSize = 5 * 1024 * 1024;
  //   if (file.size > maxSize) {
  //     setFileSizeError("ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না।");
  //     e.target.value = "";
  //     return;
  //   }

  //   setFileSizeError("");
  //   setRemoved(false);

  //   // Load raw image into cropper modal instead of directly setting preview
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     setRawImageSrc(reader.result);
  //     setCropModalOpen(true);
  //   };
  //   reader.readAsDataURL(file);

  //   // Clear the file input so the same file can be re-selected after cancel
  //   e.target.value = "";
  // };


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    // if (file.size > maxSize) {
    //   setFileSizeError("ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না।");
    //   e.target.value = "";
    //   return;
    // }

    setFileSizeError("");
    setRemoved(false);
    const imageUrl = URL.createObjectURL(file);
    setRawImageSrc(imageUrl);
    setCropModalOpen(true);
    // Reset input so same file can be selected again
    e.target.value = "";
  };
  const handleCropConfirm = () => {
    const cropperInstance = cropperRef.current?.cropper;
    if (!cropperInstance) return;

    // Get cropped canvas and convert to blob/file
    cropperInstance.getCroppedCanvas({ width: 500, height: 500 }).toBlob((blob) => {

        const maxSize = 5 * 1024 * 1024;
        if (blob.size > maxSize) {
          setFileSizeError("Cropped image must be less than 5 MB.");
          return;
        }

        const croppedFile = new File([blob], "cropped_image.png", {
          type: "image/png",
        });

        const previewSrc = URL.createObjectURL(blob);
        setPreviewUrl(previewSrc);
        setValue(registerKey, croppedFile, { shouldValidate: true });

        setCropModalOpen(false);
        setRawImageSrc(null);
      },
      "image/png",
      0.9
    );
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setRawImageSrc(null);
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setValue(registerKey, null, { shouldValidate: true });
    setRemoved(true);
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

  /*const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileSizeError("ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না।");
      return;
    }

    setFileSizeError("");
    setRemoved(false);

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageSrc(reader.result);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };*/
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // const maxSize = 5 * 1024 * 1024;
    // if (file.size > maxSize) {
    //   setFileSizeError("ফাইলের সাইজ ৫ MB এর বেশি হতে পারবে না।");
    //   return;
    // }

    setFileSizeError("");
    setRemoved(false);

    // ✅ Use object URL
    const imageUrl = URL.createObjectURL(file);

    setRawImageSrc(imageUrl);
    setCropModalOpen(true);
  };
  return (
    <div className={`mb-4 ${labelPosition === "left" ? "md:flex md:items-start md:gap-4" : ""}`}>
      {label && (
        <label
          htmlFor={registerKey}
          className={`text-gray-700 font-medium ${labelPosition === "left"
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
          {...register(registerKey, {
            required:
              require && !previewUrl && !image
                ? require || "This field is required"
                : false,
          })}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Drop zone */}
        <div
          onClick={() => document.getElementById(registerKey)?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative w-full rounded-lg overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer bg-gray-50 flex flex-col items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50"
        >
          {!removed && (previewUrl || image) ? (
            <>
              <div className="w-full h-full">
                <img
                  src={previewUrl || image}
                  alt="preview"
                  className="mx-auto w-auto h-[200px] object-cover"
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
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-xs font-medium">{translate("Upload image")}</p>
              <p className="text-gray-500 text-xs mt-1">{translate("Click or drag here")}</p>
              <p className="text-rose-500 text-xs mt-1">Maximum upload file size: 5 MB.</p>
            </div>
          )}
        </div>

        {fileSizeError ? (
          <p className="text-rose-500 text-xs mt-1">⚠ {fileSizeError}</p>
        ) : (
          <p className="text-gray-400 text-xs mt-1">Maximum upload file size: 5 MB.</p>
        )}

        {errors[registerKey] && (
          <div className="flex items-center mt-1 text-red-600 text-xs">
            <span>{errors[registerKey].message}</span>
          </div>
        )}
      </div>

      {/* ── Crop Modal ── */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {translate("Crop Image")}
              </h3>
              <button
                type="button"
                onClick={handleCropCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cropper */}
            <div className="p-4">
              <Cropper
                src={rawImageSrc}
                style={{ height: 320, width: "100%" }}
                aspectRatio={1 / 1}
                guides={true}
                viewMode={1}
                dragMode="move"
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                ref={cropperRef}
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                {translate("Drag to reposition • Scroll to zoom")}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleCropCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                {translate("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {translate("Crop & Use")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropImageUpload;