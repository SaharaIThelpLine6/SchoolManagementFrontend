import { useState, useMemo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";
import Button from "../../../components/Button/Button";
import EditButton from "../../../components/Button/EditButton";
import DeleteButton from "../../../components/Button/DeleteButton";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../../../components/Forms/DefaultInput";
import {
  useGetSMSTemplatesQuery,
  usePostSMSTemplateMutation,
  useUpdateSMSTemplateMutation,
  useDeleteSMSTemplateMutation,
} from "../../../features/sms/smsSlice";
import { setAddSMSTemplate } from "../../../features/sms/smsReducersSlice";
import { hideModal } from "../../../utils/ModalControlar";
import SvgIcon from "../../../components/icons/SvgIcon";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

// ✅ Safe extraction of row data
const getRowData = (row) => {
  if (!row) return {};
  if (row.data) return row.data;
  if (row._data) return row._data;
  if (row.row) return row.row;
  return row;
};

const SMSTemplate = () => {
  const translate = useTranslate();
  const methods = useForm();
  const dispatch = useDispatch();
  const { reset, setValue, handleSubmit, register, watch } = methods;

  // UI State
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // ✅ Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    tempId: null,
    templateName: "",
  });

  // API
  const {
    data: smsTemplatesResponse,
    isLoading,
    isError,
    refetch,
  } = useGetSMSTemplatesQuery();

  const [postTemplate, { isLoading: isPosting }] = usePostSMSTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateSMSTemplateMutation();
  const [deleteTemplate] = useDeleteSMSTemplateMutation();

  // Local state for delete loading (আলাদা state — কারণ toast-এর উপর নির্ভর করব না)
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract array safely
  const smsTemplates = useMemo(() => {
    if (Array.isArray(smsTemplatesResponse)) return smsTemplatesResponse;
    if (smsTemplatesResponse && Array.isArray(smsTemplatesResponse.data))
      return smsTemplatesResponse.data;
    return [];
  }, [smsTemplatesResponse]);

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(smsTemplates.length / PAGE_SIZE) || 1;

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return smsTemplates.slice(start, start + PAGE_SIZE);
  }, [smsTemplates, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  useEffect(() => {
    if (!showForm) {
      reset();
      setEditingTemplate(null);
    }
  }, [showForm, reset]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  // ✅ Logic unchanged
  const handleAddSMSTemplate = (data) => {
    dispatch(setAddSMSTemplate(data));
    hideModal();
  };

  // ✅ Handle Edit
  const handleEdit = (row) => {
    const template = getRowData(row);
    const tempId = template?.TempID ?? template?.TempId ?? template?.id;

    if (!tempId && tempId !== 0) {
      toast.error("Template ID not found. Please refresh the page.");
      return;
    }

    setEditingTemplate({ ...template, TempID: tempId });
    setValue("MessageName", template.Name || "");
    setValue("message", template.Message || "");
    setValue("SMSType", template.SMSType || 1);
    setShowForm(true);

    toast.success("Template loaded for editing", {
      icon: "✏️",
      autoClose: 1500,
    });
  };

  // ✅ Open Delete Confirmation Modal
  const openDeleteModal = (row) => {
    const template = getRowData(row);
    const tempId = template?.TempID ?? template?.TempId ?? template?.id;

    if (!tempId && tempId !== 0) {
      toast.error("Template ID not found. Please refresh the page.");
      return;
    }

    setDeleteModal({
      isOpen: true,
      tempId,
      templateName: template?.Name || "this template",
    });
  };

  // ✅ Close Delete Modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, tempId: null, templateName: "" });
  };

  // ✅ Confirm Delete Handler (loading toast removed)
  const confirmDelete = async () => {
    const { tempId } = deleteModal;
    if (!tempId && tempId !== 0) return;

    setIsDeleting(true);

    try {
      await deleteTemplate(tempId).unwrap();
      toast.success("Template deleted successfully!");
      closeDeleteModal();
      refetch();
    } catch (error) {
      console.error("❌ Delete Error:", error);
      toast.error(error?.data?.message || "Failed to delete template.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ✅ Dynamic Submit Handler (Create & Update)
  const onSubmit = async (data) => {
    try {
      const payload = {
        Name: data.MessageName,
        Message: data.message,
        SMSType: Number(data.SMSType) || 1,
      };

      if (editingTemplate && editingTemplate.TempID) {
        await updateTemplate({
          id: editingTemplate.TempID,
          ...payload,
        }).unwrap();
        toast.success("Template updated successfully!");
      } else {
        await postTemplate(payload).unwrap();
        toast.success("Template created successfully!");
      }

      reset();
      setEditingTemplate(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error(
        error?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const isSubmitting = isPosting || isUpdating;

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      width: 130,
      minWidth: 120,
      render: (row) => {
        const template = getRowData(row);
        return (
          <div className="flex justify-center items-center gap-1.5">
            <button
              className="p-2 text-white bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              title="Add Template"
              onClick={() => handleAddSMSTemplate(template.Message)}
            >
              <SvgIcon name={"IoIosAddCircle"} size={18} />
            </button>
            <EditButton onClick={() => handleEdit(row)} />
            <DeleteButton onClick={() => openDeleteModal(row)} />
          </div>
        );
      },
    },
    {
      title: translate("Name"),
      field: "Name",
      hozAlign: "left",
      width: 180,
      minWidth: 120,
      render: (row) => {
        const template = getRowData(row);
        return (
          <span className="font-medium text-gray-800 text-sm">
            {template.Name}
          </span>
        );
      },
    },
    {
      title: translate("Message"),
      field: "Message",
      hozAlign: "left",
      minWidth: 200,
      render: (row) => {
        const template = getRowData(row);
        return (
          <div className="max-h-[70px] w-full overflow-y-auto p-1 text-sm text-gray-700 whitespace-pre-wrap break-words">
            {template.Message}
          </div>
        );
      },
    },

  ];

  return (
    <div className="font-SolaimanLipi p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              reset();
              setEditingTemplate(null);
            }
          }}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg ${showForm
            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            }`}
        >
          {showForm ? (
            <>
              <SvgIcon name="MdClose" size={18} />
              {translate("Close Form")}
            </>
          ) : (
            <>
              <SvgIcon name="IoIosAddCircle" size={18} />
              {translate("Create Template")}
            </>
          )}
        </button>
      </div>

      {/* ✅ Collapsible Form Section */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm
          ? "max-h-[1200px] opacity-100 mb-4 sm:mb-6"
          : "max-h-0 opacity-0 mb-0"
          }`}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
              <SvgIcon
                name={editingTemplate ? "MdEdit" : "IoIosAddCircle"}
                size={20}
              />
              {editingTemplate
                ? translate("Edit SMS Template")
                : translate("Create SMS Template")}
            </h2>
            <p className="text-blue-100 text-xs mt-1">
              {translate("Fill in the details below to create a new template.")}
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div className="md:col-span-2">
                    <DefaultInput
                      registerKey="MessageName"
                      require={translate("Message name is required")}
                      type="text"
                      placeholder={translate("Enter new message name") + " ..."}
                      label="Message Name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {translate("Message")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register("message", {
                        required: "Message is required",
                      })}
                      placeholder={translate("Enter your message")}
                      rows={5}
                      className="p-3 sm:p-4 w-full rounded-xl border border-gray-200 h-[120px] sm:h-[140px] text-black outline-none text-sm transition-all duration-300 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-200 resize-y shadow-sm"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">
                        {translate("Write your SMS content here.")}
                      </span>
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {watch("message")?.length || 0} characters
                      </span>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-3 sm:pt-4 border-t border-gray-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {translate("Saving...")}
                      </>
                    ) : (
                      <>
                        <SvgIcon name="MdSave" size={20} />
                        {editingTemplate
                          ? translate("Update")
                          : translate("Save")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>

      {/* ✅ Table Section */}
      <div
        className={`transition-all duration-500 ease-in-out ${showForm
          ? "max-h-0 opacity-0 overflow-hidden"
          : "max-h-[3000px] opacity-100"
          }`}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <SvgIcon name="MdList" size={20} className="text-blue-500" />
              {translate("Available Templates")}
            </h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full self-start sm:self-auto">
              {smsTemplates.length} {translate("Templates")}
            </span>
          </div>

          <div className="flex-1 p-2 sm:p-4 overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : isError ? (
              <div className="text-red-500 text-center py-16 bg-red-50 rounded-xl border border-red-100 mx-2">
                <SvgIcon
                  name="MdError"
                  size={40}
                  className="mx-auto mb-2 opacity-50"
                />
                <p className="font-medium text-sm">Error loading templates.</p>
              </div>
            ) : smsTemplates.length === 0 ? (
              <div className="text-gray-500 text-center py-16 bg-gray-50 rounded-xl border border-gray-100 mx-2">
                <SvgIcon
                  name="MdList"
                  size={40}
                  className="mx-auto mb-2 opacity-30"
                />
                <p className="font-medium text-sm">No templates found.</p>
              </div>
            ) : (
              <div className="min-w-full">
                <SortableTable
                  columns={columns}
                  data={paginatedData}
                  isFilterColumn={false}
                />
              </div>
            )}
          </div>

          {!isLoading && smsTemplates.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-100">
              <span className="text-xs text-gray-500 order-2 sm:order-1">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {paginatedData.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {smsTemplates.length}
                </span>{" "}
                templates
              </span>

              <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium shadow-sm"
                >
                  <SvgIcon name={"MdKeyboardArrowLeft"} size={16} />
                  Prev
                </button>

                <span className="text-xs font-semibold text-gray-700 bg-white px-3 sm:px-4 py-2 rounded-xl border border-gray-200 shadow-sm whitespace-nowrap">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs sm:text-sm font-medium shadow-sm"
                >
                  Next
                  <SvgIcon name={"MdKeyboardArrowRight"} size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Custom Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fadeIn"
          onClick={!isDeleting ? closeDeleteModal : undefined}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-5">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <SvgIcon name="MdDelete" size={22} />
                Confirm Delete
              </h3>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 text-sm leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  "{deleteModal.templateName}"
                </span>
                ?
              </p>
              <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <SvgIcon name="MdDelete" size={16} />
                    Yes, Delete
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

export default SMSTemplate;