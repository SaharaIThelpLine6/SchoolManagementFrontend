import { FormProvider, useForm } from "react-hook-form";
import DefaultMultiImageUpload from "../components/Forms/DefaultMultiImageUpload";
import Button from "../components/Button/Button";
import { usePostUserMultipleImagesUploadMutation } from "../features/dashboard/dashboardQuerySlice";
import Swal from "sweetalert2";
import { useState } from "react";
import useTranslate from "../utils/Translate";

const BulkImage = () => {
  const translate = useTranslate();
  const methods = useForm({
    defaultValues: {
      multiImages: [],
    },
  });

  const existingImages = [];
  const { watch } = methods;
  const selectedFiles = watch("multiImages");
  const [previewUrls, setPreviewUrls] = useState(
    existingImages.map((img) => img.url || img)
  );
  const [
    postUserInages,
    { isLoading: uploadLoading, isError: uploadError, error },
  ] = usePostUserMultipleImagesUploadMutation();

  const onSubmit = async (formData) => {
    const files = formData.multiImages;

    if (!files || files.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please select at least one image before submitting.",
      });
      return;
    }

    const formDataToSend = new FormData();
    files.forEach((file) => {
      formDataToSend.append("images", file);
    });

    try {
      const response = await postUserInages(formDataToSend).unwrap();

      const failedFiles = response.results.filter((r) => r.error);
      const successFiles = response.results.filter((r) => r.success);

      if (failedFiles.length > 0) {
        const errorMessages = failedFiles
          .map((f) => `- ${f.fileName} → ${f.error.split("!")[0]}`)
          .join("<br>");

        Swal.fire({
          icon: "error",
          title: "Some files failed",
          html: `
        ${successFiles.length} files uploaded successfully.<br>
        ${failedFiles.length} files failed:<br><br>
        ${errorMessages}
      `,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "All Uploaded Successfully",
          text: `${successFiles.length} files uploaded.`,
        });
      }

      setPreviewUrls([]);
      methods.reset({ multiImages: [] });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: err?.data?.error || "Something went wrong!",
      });
    }
  };

  return (
    <div className="font-lato bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="block w-full overflow-x-auto">
        <FormProvider {...methods}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {translate("Bulk Image")}
            </h2>
            <p className="text-gray-600 mb-4">
              {translate(
                `Upload multiple user profile images at once. File names must match UserCode (numeric only).`
              )}
            </p>

            {selectedFiles?.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <p className="text-blue-800">
                  <strong>Selected files:</strong> {selectedFiles.length}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
            <DefaultMultiImageUpload
              label="Upload Profile Images"
              registerKey="multiImages"
              maxFiles={50}
              existingImages={existingImages}
              setPreviewUrls={setPreviewUrls}
              previewUrls={previewUrls}
            />

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Button
                type="submit"
                disabled={uploadLoading || !selectedFiles?.length}
                className={`flex items-center bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors 
      ${uploadLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {!uploadLoading && (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                )}

                {uploadLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 
               0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 1.135 
               5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  `Upload ${selectedFiles?.length || 0} File(s)`
                )}
              </Button>
            </div>
          </form>

          {uploadError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">
                {error?.data?.error ||
                  error?.data?.message ||
                  "Something went wrong during upload!"}
              </p>
            </div>
          )}
        </FormProvider>
      </div>
    </div>
  );
};

export default BulkImage;
