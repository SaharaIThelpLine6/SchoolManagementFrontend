import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import bnBijoy2Unicode from "../../utils/conveter";
import useTranslate from "../../utils/Translate";
import { hideModal } from "../../utils/ModalControlar";
import {
  useGetStudentReportCetsQuery,
  useGetStudentReportTypeQuery,
  useUpdateStudentReportMutation,
} from "../../features/student/studentQuerySlice";

const EditStudentReportForm = ({ reportData, onSuccess }) => {
  const translate = useTranslate();
  
  // Initialize form with default values and direct destructuring
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      StudentCode: '',
      StudentName: '',
      ReportCetID: '',
      ReportTypID: '',
      Remark: '',
      CreateDate: ''
    }
  });

  // Fetch dropdown data from API
  const { data: studentReportCet, isLoading: cetLoading, error: cetError } = useGetStudentReportCetsQuery();
  const { data: studentReportType, isLoading: typeLoading, error: typeError } = useGetStudentReportTypeQuery();

  // Update mutation
  const [updateStudentReport, { isLoading: updateLoading }] = useUpdateStudentReportMutation();

  // Prepare dropdown options from API data
  const reportCetOptions = studentReportCet?.map((item) => ({
    id: item.ReportCetID,
    value: item.ReportCetID,
    label: bnBijoy2Unicode(item.ReportCetName || item.ReportCet)
  })) || [];

  const reportTypeOptions = studentReportType?.map((item) => ({
    id: item.ReportTypID,
    value: item.ReportTypID,
    label: bnBijoy2Unicode(item.ReportTypeName || item.ReportType)
  })) || [];

  // Pre-populate form with existing data
  useEffect(() => {
    if (reportData) {
      reset({
        StudentCode: reportData.StudentCode || '',
        StudentName: bnBijoy2Unicode(reportData.StudentName) || '',
        ReportCetID: reportData.ReportCetID || '',
        ReportTypID: reportData.ReportTypID || '',
        Remark: bnBijoy2Unicode(reportData.Remark) || '',
        CreateDate: reportData.CreateDate ? reportData.CreateDate.split('T')[0] : '' // Format date for input
      });
    }
  }, [reportData, reset]);

  const onSubmit = async (data) => {
    const toastId = toast.loading("Updating report...");
    
    try {
      // Prepare update data
      const updateData = {
        ReportCetID: parseInt(data.ReportCetID),
        ReportTypID: parseInt(data.ReportTypID),
        Remark: data.Remark,
        CreateDate: data.CreateDate
      };

      // Call API to update report - Use SRID as the primary key
      const reportId = reportData.SRID;
      
      console.log('Report ID (SRID):', reportId); // Debug log
      console.log('Report Data:', reportData); // Debug log
      
      if (!reportId) {
        throw new Error('Report ID is missing');
      }

      await updateStudentReport({
        id: reportId,
        ...updateData
      }).unwrap();

      toast.update(toastId, {
        render: "Report updated successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });

      // Close modal and refresh data
      hideModal();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.update(toastId, {
        render: err?.data?.error || err?.message || "Update failed!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true,
      });
      console.error("Error updating report:", err);
    }
  };

  const handleCancel = () => {
    hideModal();
  };

  // Show loading state while fetching dropdown data
  if (cetLoading || typeLoading) {
    return (
      <div className="p-4 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 font-SolaimanLipi">{translate("Loading...")}</p>
        </div>
      </div>
    );
  }

  // Show error state if dropdown data fails to load
  if (cetError || typeError) {
    return (
      <div className="p-4">
        <div className="text-center text-red-500">
          <p className="font-SolaimanLipi">{translate("Error loading form data")}</p>
          <button 
            onClick={handleCancel}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 font-SolaimanLipi"
          >
            {translate("Close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Student Code and Name - Read only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-black font-SolaimanLipi">
              {translate("Student Code")}:
            </label>
            <input
              {...register("StudentCode")}
              type="text"
              readOnly
              className="w-full rounded border-[1.5px] border-stroke bg-gray-100 px-2 h-[38px] text-black outline-none text-[14px] cursor-not-allowed font-SolaimanLipi"
              placeholder={translate("Student Code")}
            />
          </div>

          <div>
            <label className="mb-1 block text-black font-SolaimanLipi">
              {translate("Student Name")}:
            </label>
            <input
              {...register("StudentName")}
              type="text"
              readOnly
              className="w-full rounded border-[1.5px] border-stroke bg-gray-100 px-2 h-[38px] text-black outline-none text-[14px] cursor-not-allowed font-SolaimanLipi"
              placeholder={translate("Student Name")}
            />
          </div>
        </div>

        {/* Report Category and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-black font-SolaimanLipi">
              <span className="text-red-500">
                {translate("Report Category")} * :
              </span>
            </label>
            <select
              {...register("ReportCetID", { required: "Report category is required" })}
              disabled={cetLoading}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary font-SolaimanLipi disabled:bg-gray-100"
            >
              <option value="">{translate("Select Report Category")}</option>
              {reportCetOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.ReportCetID && (
              <span className="text-red-500 text-sm font-SolaimanLipi">
                {errors.ReportCetID.message}
              </span>
            )}
          </div>

          <div>
            <label className="mb-1 block text-black font-SolaimanLipi">
              <span className="text-red-500">
                {translate("Report Type")} * :
              </span>
            </label>
            <select
              {...register("ReportTypID", { required: "Report type is required" })}
              disabled={typeLoading}
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary font-SolaimanLipi disabled:bg-gray-100"
            >
              <option value="">{translate("Select Report Type")}</option>
              {reportTypeOptions.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.ReportTypID && (
              <span className="text-red-500 text-sm font-SolaimanLipi">
                {errors.ReportTypID.message}
              </span>
            )}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="mb-1 block text-black font-SolaimanLipi">
            <span className="text-red-500">
              {translate("Date")} * :
            </span>
          </label>
          <input
            {...register("CreateDate", { required: "Date is required" })}
            type="date"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-primary active:border-primary"
          />
          {errors.CreateDate && (
            <span className="text-red-500 text-sm font-SolaimanLipi">
              {errors.CreateDate.message}
            </span>
          )}
        </div>

        {/* Remark */}
        <div>
          <label className="mb-1 block text-black font-SolaimanLipi">
            <span className="text-red-500">
              {translate("Remark")} * :
            </span>
          </label>
          <textarea
            {...register("Remark", { required: "Remark is required" })}
            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-2 py-2 text-black outline-none transition focus:border-primary active:border-primary font-SolaimanLipi"
            rows={4}
            placeholder={translate("Enter remark")}
            style={{ resize: 'vertical' }}
          />
          {errors.Remark && (
            <span className="text-red-500 text-sm font-SolaimanLipi">
              {errors.Remark.message}
            </span>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-SolaimanLipi"
            disabled={updateLoading}
          >
            {translate("Cancel")}
          </button>
          <button
            type="submit"
            disabled={updateLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-SolaimanLipi disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {updateLoading ? translate("Updating...") : translate("Update Report")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditStudentReportForm;