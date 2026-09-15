import React, { useEffect, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { useFormContext } from "react-hook-form";
import { toast } from "react-toastify";
import useTranslate from "../../utils/Translate";
import { usePostUserSingleImageUploadMutation } from "../../features/dashboard/dashboardQuerySlice";

const RoundedCropImageUpload = ({
  label,
  registerKey,
  require = false,
  labelPosition = "top",
  image,              // real DB image (data URL) অথবা null
  fallbackImage,      // default avatar (শুধু display এর জন্য, form এ যাবে না)
  previewUrl,         // parent-এর local preview
  setPreviewUrl,
  size = "w-32 h-32",
  userId,             // ✅ dynamic upload এর জন্য
  onUploadSuccess,    // ✅ upload success callback (refetch etc.)
}) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext();

  const [postUserInage] = usePostUserSingleImageUploadMutation();

  const [fileSizeError, setFileSizeError] = useState("");
  const [removed, setRemoved] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // ✅ per-instance loading
  const cropperRef = useRef(null);

  const translate = useTranslate();

  /** Real DB image থাকলে form এ set হবে */
  useEffect(() => {
    if (image && image !== fallbackImage) {
      setValue(registerKey, image, { shouldValidate: true });
      setRemoved(false);
    }
  }, [image, fallbackImage, registerKey, setValue]);

  /** registerKey বদলালে state reset */
  useEffect(() => {
    setRemoved(false);
    setFileSizeError("");
    setIsUploading(false);
  }, [registerKey]);

  /** File select */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileSizeError(translate("File size must be less than 5 MB."));
      e.target.value = "";
      return;
    }

    setFileSizeError("");
    setRemoved(false);
    const imageUrl = URL.createObjectURL(file);
    setRawImageSrc(imageUrl);
    setCropModalOpen(true);
    e.target.value = "";
  };

  /** ✅ Crop confirm → সাথে সাথে upload */
  const handleCropConfirm = () => {
    const cropperInstance = cropperRef.current?.cropper;
    if (!cropperInstance) return;

    cropperInstance
      .getCroppedCanvas({ width: 500, height: 500 })
      .toBlob(
        async (blob) => {
          if (!blob) return;

          const maxSize = 5 * 1024 * 1024;
          if (blob.size > maxSize) {
            setFileSizeError(
              translate("Cropped image must be less than 5 MB.")
            );
            return;
          }

          const croppedFile = new File(
            [blob],
            `avatar-${Date.now()}.png`,
            { type: "image/png" }
          );

          // Optimistic preview
          const previewSrc = URL.createObjectURL(blob);
          setPreviewUrl(previewSrc);
          setRemoved(false);

          // Cleanup raw image
          if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
          setRawImageSrc(null);

          // ✅ userId না থাকলে form এ File রেখে দিই (fallback)
          if (!userId) {
            setValue(registerKey, croppedFile, { shouldValidate: true });
            setCropModalOpen(false);
            return;
          }

          // ✅ Dynamic upload
          setIsUploading(true);
          try {
            const formData = new FormData();
            formData.append("image", croppedFile);
            formData.append("UserID", userId);

            await postUserInage(formData).unwrap();

            setValue(registerKey, croppedFile, { shouldValidate: true });
            setCropModalOpen(false);

            toast.success(translate("Image uploaded successfully."));

            if (typeof onUploadSuccess === "function") {
              onUploadSuccess(previewSrc);
            }
          } catch (err) {
            // Fail হলে preview revert
            setPreviewUrl(null);
            toast.error(
              err?.data?.error || translate("Image upload failed.")
            );
          } finally {
            setIsUploading(false);
          }
        },
        "image/png",
        0.9
      );
  };

  /** Crop cancel */
  const handleCropCancel = () => {
    if (isUploading) return; // upload চলাকালীন cancel block
    setCropModalOpen(false);
    if (rawImageSrc) URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc(null);
  };

  /** Remove */
  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setValue(registerKey, null, { shouldValidate: true });
    setRemoved(true);

    const fileInput = document.getElementById(registerKey);
    if (fileInput) fileInput.value = "";
  };

  /** Drag over */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("ring-2", "ring-blue-400", "bg-blue-50");
  };

  /** Drag leave */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
  };

  /** Drop */
  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileSizeError(translate("File size must be less than 5 MB."));
      return;
    }

    setFileSizeError("");
    setRemoved(false);
    const imageUrl = URL.createObjectURL(file);
    setRawImageSrc(imageUrl);
    setCropModalOpen(true);
  };

  /** Display states */
  const realImage = !removed ? previewUrl || image : null;
  const showFallback = !removed && !realImage && fallbackImage;
  const displaySrc = realImage || showFallback;

  return (
    <div
      className={`${labelPosition === "left" ? "md:flex md:items-start md:gap-4" : ""
        }`}
    >
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

      <div
        className={
          labelPosition === "left"
            ? "md:flex-1"
            : "w-full flex flex-col justify-center items-center"
        }
      >
        <input
          id={registerKey}
          type="file"
          accept="image/*"
          {...register(registerKey, {
            required:
              require && !realImage
                ? require || "This field is required"
                : false,
          })}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Circular drop zone */}
        <div
          onClick={() =>
            !isUploading && document.getElementById(registerKey)?.click()
          }
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative ${size} rounded-full overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer bg-gray-50 flex flex-col items-center justify-center transition-all duration-200 hover:border-blue-400 hover:bg-blue-50 group`}
        >
          {displaySrc ? (
            <>
              <img
                src={displaySrc}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Upload loading overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                  <svg
                    className="w-6 h-6 text-white animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                </div>
              )}

              {/* Hover overlay */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
                  <svg
                    className="w-6 h-6 mb-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-xs font-medium">
                    {translate(realImage ? "Change" : "Upload")}
                  </span>
                </div>
              )}

              {/* Remove button */}
              {realImage && !isUploading && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center text-sm shadow-sm hover:bg-red-500 hover:text-white transition-colors duration-200 z-10"
                  title="Remove image"
                >
                  ×
                </button>
              )}
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 text-xs font-medium">
                {translate("Upload")}
              </p>
            </div>
          )}
        </div>

        {fileSizeError && (
          <p className="text-rose-500 text-xs mt-1 text-center">
            ⚠ {fileSizeError}
          </p>
        )}

        {errors[registerKey] && (
          <div className="flex items-center mt-1 text-red-600 text-xs justify-center">
            <span>{errors[registerKey].message}</span>
          </div>
        )}
      </div>

      {/* Crop Modal */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-blue-600"
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
                {translate("Crop Image")}
              </h3>
              <button
                type="button"
                onClick={handleCropCancel}
                disabled={isUploading}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
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
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              >
                {translate("Cancel")}
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={isUploading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60"
              >
                {isUploading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    {translate("Uploading...")}
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {translate("Crop & Use")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundedCropImageUpload;