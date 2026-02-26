import { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import SortableTable from "../../../components/Tables/SortableTable";
import useTranslate from "../../../utils/Translate";
import Swal from "sweetalert2";
import Button from "../../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../../../components/Forms/DefaultInput";
import { useGetSMSTemplatesQuery } from "../../../features/sms/smsSlice";
import { setAddSMSTemplate } from "../../../features/sms/smsReducersSlice";
import { hideModal } from "../../../utils/ModalControlar";
import SvgIcon from "../../../components/icons/SvgIcon";

const PAGE_SIZE = 10;

const SMSTemplate = ({ pageTitle, checkedValue }) => {
  const translate = useTranslate();
  const methods = useForm();
  const dispatch = useDispatch();
  const { reset } = methods;

  const {
    data: smsTemplates = [],
    isLoading,
    isError,
  } = useGetSMSTemplatesQuery();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(smsTemplates.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return smsTemplates.slice(start, start + PAGE_SIZE);
  }, [smsTemplates, currentPage]);

  const handleDelete = useCallback((id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the designation.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // await deleteDesignation(id).unwrap();
          Swal.fire("Deleted!", "The designation has been removed.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete designation.", "error");
        }
      }
    });
  }, []);

  //   if (isLoading) return <Loading />;

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddSMSTemplate = (data) => {
    dispatch(setAddSMSTemplate(data));

    hideModal();
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          {/* <button
            className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md"
            title="Edit"
            onClick={() => handleEditOpenModal(row.UserID)}
          >
            <FiEdit className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title="Delete"
            onClick={() => handleDelete(row.DNID)}
          >
            <MdDelete className="w-5 h-5" />
          </button> */}
          <button
            className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-md"
            title="Delete"
            onClick={() => handleAddSMSTemplate(row.Message)}
          >
            <SvgIcon name={"IoIosAddCircle"} size={20} />
          </button>
        </div>
      ),
    },
    { title: translate("Name"), field: "Name", hozAlign: "center" },
    {
      title: translate("Message"),
      field: "Message",
      hozAlign: "center",
      render: (row) => (
        <div class="h-[50px] w-[200px] overflow-auto">${row.Message}</div>
      ),
    },
  ];

  const onSubmit = async (data) => {};
  return (
    <div className="font-SolaimanLipi grid grid-cols-1 sm:grid-cols-2">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="p-6">
          <div className="mb-4">
            <DefaultInput
              registerKey="MessageName"
              require={translate("Message name is required")}
              type="text"
              placeholder={translate("Enter new message name") + " ..."}
              label="Message Name"
            />
          </div>
          <div className="mb-4">
            {/* Textarea Field */}
            <label className="text-sm font-medium text-gray-700">
              {translate("Message") + " :"}
            </label>
            <textarea
              name="message"
              placeholder={translate("Enter your message")}
              rows={4}
              className="p-2 w-full rounded border-[1.5px] h-[100px] text-black outline-none text-[14px] transition border-stroke focus:border-custom-focus disabled:cursor-not-allowed disabled:bg-slate-200"
            />
          </div>
          <div className="mb-4">
            <Button type="submit">{translate("Save")}</Button>
          </div>
        </form>
      </FormProvider>
      <div className="">
        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />
        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            <SvgIcon name={"MdKeyboardArrowLeft"} size={18} />
            Prev
          </button>

          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded bg-gray-300 disabled:opacity-50"
          >
            Next
            <SvgIcon name={"MdKeyboardArrowRight"} size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SMSTemplate;
