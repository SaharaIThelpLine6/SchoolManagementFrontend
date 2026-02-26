import React, { useState, useEffect, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import useTranslate from "../../utils/Translate";
import Swal from "sweetalert2";

const DefaultMultiImageUpload = ({
  label,
  registerKey,
  require = false,
  labelPosition = "top",
  maxFiles = 20,
  existingImages,
  maxFileSize = 5, // in MB
  previewUrls, setPreviewUrls
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const translate = useTranslate();

  const files = watch(registerKey) || [];

  const [existingImageIds] = useState(
    existingImages.map((img) => img.id || null)
  );

  // Memory cleanup
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewUrls]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // Clear the input value to allow selecting same files again
    e.target.value = '';

    // Check maximum file limit
    const totalFilesAfterAdd = files.length + selectedFiles.length;
    if (totalFilesAfterAdd > maxFiles) {
      Swal.fire({
        icon: "warning",
        title: "Too Many Files",
        text: `You can only upload maximum ${maxFiles} files. You currently have ${files.length} files.`,
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }

    // Filter duplicates (name + size + lastModified)
    const newFiles = selectedFiles.filter(
      (file) => !files.some(
        (f) => f.name === file.name && 
               f.size === file.size && 
               f.lastModified === file.lastModified
      )
    );

    if (newFiles.length === 0) {
      if (selectedFiles.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Files",
          text: "Some files were already selected.",
          timer: 2000,
          showConfirmButton: false
        });
      }
      return;
    }

    // File validation
    const MAX_FILE_SIZE = maxFileSize * 1024 * 1024;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    const validFiles = [];
    const invalidFiles = [];
    
    newFiles.forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push({ 
          file, 
          reason: `File too large (${(file.size / 1024 / 1024).toFixed(2)}MB)` 
        });
      } else if (!allowedTypes.includes(file.type)) {
        invalidFiles.push({ 
          file, 
          reason: `Invalid file type (${file.type.split('/')[1]})` 
        });
      } else {
        validFiles.push(file);
      }
    });

    // Show validation errors
    if (invalidFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Files",
        html: `
          <div class="text-left">
            <p><strong>${invalidFiles.length} file(s) were skipped:</strong></p>
            <ul class="list-disc pl-5 mt-2 text-sm">
              ${invalidFiles.slice(0, 3).map(invalid => 
                `<li class="truncate">${invalid.file.name} - ${invalid.reason}</li>`
              ).join('')}
              ${invalidFiles.length > 3 ? 
                `<li>...and ${invalidFiles.length - 3} more files</li>` : ''}
            </ul>
          </div>
        `,
        timer: 4000,
        showConfirmButton: true
      });
    }

    if (validFiles.length === 0) return;

    // Update files and preview URLs
    const updatedFiles = [...files, ...validFiles];
    setValue(registerKey, updatedFiles, { shouldValidate: true });

    const newUrls = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newUrls]);

    // Success notification
    Swal.fire({
      icon: "success",
      title: "Files Added",
      text: `${validFiles.length} file(s) added successfully.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleRemoveImage = useCallback((index) => {
    // Check if it's an existing image from DB
    const isExistingImage = index < existingImageIds.length;
    const imageId = isExistingImage ? existingImageIds[index] : null;

    if (isExistingImage && imageId) {
      // For existing images, we might want to mark for deletion
      // or show a confirmation before removing
      Swal.fire({
        title: 'Remove Image?',
        text: "This image is already uploaded. Are you sure you want to remove it?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, remove it!'
      }).then((result) => {
        if (result.isConfirmed) {
          // Remove from preview and mark for deletion if needed
          const newUrls = [...previewUrls];
          newUrls.splice(index, 1);
          setPreviewUrls(newUrls);

          // If you need to track deleted existing images
          // setDeletedExistingImages([...deletedExistingImages, imageId]);
        }
      });
    } else {
      // For new files, just remove them
      const newFiles = [...files];
      newFiles.splice(index - existingImageIds.length, 1);
      setValue(registerKey, newFiles);

      const newUrls = [...previewUrls];
      URL.revokeObjectURL(newUrls[index]); // Clean up memory
      newUrls.splice(index, 1);
      setPreviewUrls(newUrls);
    }
  }, [files, previewUrls, existingImageIds, setValue, registerKey]);

  const handleRemoveAll = () => {
    Swal.fire({
      title: 'Remove All Files?',
      text: "Are you sure you want to remove all selected files?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove all!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Clean up all blob URLs
        previewUrls.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
        
        setPreviewUrls([]);
        setValue(registerKey, []);
        
        Swal.fire({
          icon: "success",
          title: "All Files Removed",
          text: "All selected files have been removed.",
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const totalFiles = previewUrls.length;

  return (
<div className={`w-full mb-4 ${labelPosition === "left" ? "md:flex md:items-start md:gap-4" : ""}`}>
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
      <input
        id={registerKey}
        type="file"
        accept="image/*"
        multiple
        {...register(registerKey, {
          required: require && totalFiles === 0
            ? translate("This field is required")
            : false,
          validate: {
            maxFiles: (value) => {
              if (value && value.length > maxFiles) {
                return `Maximum ${maxFiles} files allowed`;
              }
              return true;
            }
          }
        })}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <label
        htmlFor={registerKey}
        className="inline-flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors text-sm sm:text-base"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {translate("Select Files")}
      </label>

      {totalFiles > 0 && (
        <button
          type="button"
          onClick={handleRemoveAll}
          className="inline-flex items-center justify-center px-3 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm sm:text-base mt-2 sm:mt-0"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          {translate("Clear All")}
        </button>
      )}

      {totalFiles > 0 && (
        <span className="text-sm text-gray-600 mt-2 sm:mt-0 text-center sm:text-left">
          {totalFiles} file(s) selected • Max {maxFiles} files • Max {maxFileSize}MB each
        </span>
      )}
    </div>

    {errors[registerKey] && (
      <p className="text-red-500 text-sm mt-1">
        {errors[registerKey].message}
      </p>
    )}

    {/* Preview Grid */}
    {totalFiles > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          {translate("Selected Files")}:
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {previewUrls.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm"
            >
              <img
                src={url}
                alt={`preview-${index}`}
                className="w-full h-20 sm:h-24 object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMCAxMUg4VjEzSDEwVjExWk0xNiAxMUgxNFYxM0gxNlYxMVpNMTggN0g2VjE3SDE4VjdaTTE4IDVINkMyNC41IDUgMjQgNSAyNCA1VjE5QzI0IDE5LjU1IDIzLjU1IDIwIDIzIDIwSDZDNS40NSAyMCA1IDE5LjU1IDUgMTlWNUM1IDQuNDUgNS40NSA0IDYgNEgxOEMxOC41NSA0IDE5IDQuNDUgMTkgNVYxNUMxOSAxNS41NSAxOC41NSAxNiAxOCAxNloiIGZpbGw9IiM5QzlEOUYiLz4KPC9zdmc+";
                }}
              />
              
              {/* File info overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <p className="text-white text-xs truncate">
                  {index < existingImageIds.length 
                    ? "Existing Image" 
                    : files[index - existingImageIds.length]?.name || `File ${index + 1}`
                  }
                </p>
                {index >= existingImageIds.length && files[index - existingImageIds.length] && (
                  <p className="text-gray-300 text-xs">
                    {(files[index - existingImageIds.length].size / 1024 / 1024).toFixed(2)}MB
                  </p>
                )}
              </div>

              {/* Remove button - larger on mobile for touch */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors sm:w-5 sm:h-5 sm:text-xs"
                title="Remove image"
              >
                ×
              </button>

              {/* Existing image badge */}
              {index < existingImageIds.length && (
                <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Existing
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {totalFiles === 0 && (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-8 text-center mt-3">
        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-sm">
          {translate("Click to select images or drag and drop here")}
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {translate("Maximum")} {maxFiles} {translate("files")} • {maxFileSize}MB {translate("per file")}
        </p>
      </div>
    )}
  </div>
</div>
  );
};

export default DefaultMultiImageUpload;