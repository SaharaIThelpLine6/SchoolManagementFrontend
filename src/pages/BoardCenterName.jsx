import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Swal from "sweetalert2";
import useTranslate from "../utils/Translate";
import DefaultInput from "../components/Forms/DefaultInput";
import Button from "../components/Button/Button";
import SortableTable from "../components/Tables/SortableTable";
import DefaultPagination from "../components/Pagination/DefaultPagination";
import EditButton from "../components/Button/EditButton";
import DeleteButton from "../components/Button/DeleteButton";

const PAGE_SIZE = 5;

const BoardCenterName = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset } = methods;

  // Static data (can later replace with API)
  const [examNames, setExamNames] = useState([
    { ID: 1, VacationList: "SSC" },
    { ID: 2, VacationList: "HSC" },
    { ID: 3, VacationList: "Dakhil" },
    { ID: 4, VacationList: "Alim" },
    { ID: 5, VacationList: "Degree" },
    { ID: 6, VacationList: "Masters" },
  ]);

  const [editId, setEditId] = useState(null);

  // Reset form when edit mode changes
  useEffect(() => {
    if (editId) {
      const selected = examNames.find((item) => item.ID === editId);
      if (selected) reset({ Vacation: selected.VacationList });
    } else {
      reset({ Vacation: "" });
    }
  }, [editId, examNames, reset]);

  // Handle form submit
  const onSubmit = (data) => {
    if (editId) {
      // Update existing
      setExamNames((prev) =>
        prev.map((item) =>
          item.ID === editId ? { ...item, VacationList: data.Vacation } : item
        )
      );
      Swal.fire({
        title: translate("Board Exam updated successfully!"),
        icon: "success",
      });
    } else {
      // Create new
      const newItem = { ID: examNames.length + 1, VacationList: data.Vacation };
      setExamNames((prev) => [...prev, newItem]);
      Swal.fire({
        title: translate("Board Exam created successfully!"),
        icon: "success",
      });
    }
    setEditId(null);
    reset({ Vacation: "" });
  };

  // Delete
  const handleDeleteButton = (id) => {
    setExamNames((prev) => prev.filter((item) => item.ID !== id));
    Swal.fire({
      title: translate("Board Exam deleted successfully!"),
      icon: "success",
    });
  };

  // Edit
  const handleEditOpenModal = (id) => setEditId(id);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(examNames.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return examNames.slice(start, start + PAGE_SIZE);
  }, [examNames, currentPage]);

  // Table columns
  const columns = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <DeleteButton onClick={() => handleDeleteButton(row.ID)} />
          <EditButton onClick={() => handleEditOpenModal(row.ID)} />
        </div>
      ),
    },
    {
      title: translate("ID"),
      field: "ID",
      hozAlign: "center",
      render: (row) => <p>{row.ID}</p>,
    },
    {
      title: translate("Board Exam Name"),
      field: "VacationList",
      hozAlign: "center",
      render: (row) => <p>{row.VacationList}</p>,
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 rounded-xl shadow-md">
      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold mb-6 text-center md:text-left">
        {translate("Board Center Names")}
      </h3>

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Input Section */}
          <div className="flex flex-col gap-4 p-5 rounded-lg shadow bg-gray-50">
            <DefaultInput
              registerKey="Vacation"
              require={translate("Board exam name is required")}
              type="text"
              placeholder={translate("Enter board exam name") + " ..."}
              label={translate("Center Ilhak Name")}
            />{" "}
            <DefaultInput
              registerKey="Vacation"
              require={translate("Board exam name is required")}
              type="text"
              placeholder={translate("Enter board exam name") + " ..."}
              label={translate("Center Name")}
            />
            {/* Submit Button */}
            <div className="w-full flex justify-center md:justify-start">
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-lg shadow"
                type="submit"
              >
                {editId ? translate("Update") : translate("Create")}
              </Button>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex flex-col gap-4 p-5 rounded-lg shadow bg-gray-50">
            <SortableTable
              columns={columns}
              data={paginatedData}
              isFilterColumn={false}
            />

            {/* Pagination */}
            <DefaultPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default BoardCenterName;
