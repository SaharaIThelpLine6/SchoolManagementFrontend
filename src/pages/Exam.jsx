import { useDispatch } from "react-redux";
import { useGetExamNamesQuery } from "/src/features/exam/examQuerySlice";
import { useEffect, useState } from "react";
import { setPageName } from "../features/auth/authSlice";
import SortableTable from "../components/Tables/SortableTable";
import { FormProvider, useForm } from "react-hook-form";
import ThemeInputBox1 from "../components/Forms/ThemeInputBox1";
import useTranslate from "../utils/Translate";
import {
  useDeleteExamNameMutation,
  usePostNewExamMutation,
  useUpdateExamnameMutation,
} from "../features/exam/examQuerySlice";
import { toast } from "react-toastify";
import DeleteButton from "../components/Button/DeleteButton";
import EditButton from "../components/Button/EditButton";
import Swal from "sweetalert2";

const Exam = ({ pageTitle }) => {
  const title = "Add Exam";
  const field = "Exam Name";
  const methods = useForm();
  const [filteredClassList, setFilteredClassList] = useState([]);
  const [editMode, setEditMode] = useState(0);
  const {
    data: examNames,
    error: examNameError,
    isLoading,
  } = useGetExamNamesQuery();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const [addExam, { isLoading: examNameInsertLoding, isError, isSuccess }] =
    usePostNewExamMutation();
  const [
    updateExam,
    {
      isLoading: examNameUpdateLoading,
      isError: examNameUpdateError,
      isSuccess: examnameUpdateSuccessful,
    },
  ] = useUpdateExamnameMutation();
  const [
    deleteExam,
    {
      isLoading: examNameDeleteLoading,
      isError: examNameDeleteError,
      isSuccess: examnameDeleteSuccessful,
    },
  ] = useDeleteExamNameMutation();
  useEffect(() => {
    dispatch(setPageName(pageTitle));
    if (examNames && examNames.length > 0) {
      const transformedData = examNames.map((item) => ({
        id: item.ExamID.toString(),
        "Exam Name": item.ExamName,
        "Exam Arabic": item.ExamAraName,
        "Exam English": item.ExamEngName,
      }));
      setFilteredClassList(transformedData);
    }
  }, [examNames]);
  const onSubmit = async (data) => {
    if (!data.ExamName) {
      console.error("All fields are required");
      return;
    }
    try {
      if (editMode === 0) {
        const response = await addExam(data).unwrap();
        console.log("Response:", response);
        if (response) {
          setEditMode(0);
          methods.reset({
            ExamName: "",
            ExamEngName: "",
            ExamAraName: "",
          });
        }
      } else {
        console.log(
          "Edit mode is active, but no update logic implemented yet."
        );
        const body = {
          ID: editMode,
          ...data,
        };
        const response = await updateExam(body).unwrap();
        console.log("Response:", response);
        if (response) {
          methods.reset({
            ExamName: "",
            ExamEngName: "",
            ExamAraName: "",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleExamNameEdit = (id) => {
    console.log(id);

    const examToEdit = examNames.find((exam) => exam.ExamID === id);
    if (examToEdit) {
      setEditMode(id);
      methods.reset({
        ExamName: examToEdit.ExamName,
        ExamEngName: examToEdit.ExamEngName,
        ExamAraName: examToEdit.ExamAraName,
      });
    }
  };

  const handleExamNameDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteExam({ ID: id }).unwrap();
        console.log("Response:", response);

        if (response) {
          // Optionally reset the form or update state
          methods.reset({
            ExamName: "",
            ExamEngName: "",
            ExamAraName: "",
          });

          Swal.fire("Deleted!", "Exam has been deleted.", "success");
        }
      } catch (error) {
        toast.error(error?.data?.error || "Failed to delete exam name");
        console.error("Error deleting exam name:", error);
      }
    }
  };

  const tableTitleHeaders = [
    {
      title: "Exam Name",
      field: "ExamName",
      hozAlign: "left",
      unicode: false,
    },
    {
      title: "Exam Arabic",
      field: "ExamAraName",
      hozAlign: "left",
      unicode: false,
    },
    {
      title: "Exam English",
      field: "ExamEngName",
      hozAlign: "left",
      unicode: false,
    },
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleExamNameEdit(row.ExamID)} />
          <DeleteButton onClick={() => handleExamNameDelete(row.ExamID)} />
        </div>
      ),
    },
  ];

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="w-full flex flex-col lg:flex-row justify-space-between items-start mb-4 gap-6 pt-4">
        <div className="w-full lg:w-2/5">
          <FormProvider {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="font-SolaimanLipi"
            >
              <div className="mb-3">
                <ThemeInputBox1
                  label={field}
                  registerKey={"ExamName"}
                  require={"Exam Name is require"}
                  type={"text"}
                />
              </div>
              <div className="mb-3">
                <ThemeInputBox1
                  label={"English"}
                  registerKey={"ExamEngName"}
                  type={"text"}
                />
              </div>
              <div className="mb-3">
                <ThemeInputBox1
                  label={"عربي"}
                  registerKey={"ExamAraName"}
                  type={"text"}
                />
              </div>
              <button
                type="submit"
                className="bg-theme-color transation ease-linear font-bold font-SolaimanLipi duration-500 inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-[#121212]"
              >
                {translate("Save")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMode(0);
                  methods.reset({
                    ExamName: "",
                    ExamEngName: "",
                    ExamAraName: "",
                  });
                }}
                className="bg-[#121212] transation ease-linear duration-500 font-bold font-SolaimanLipi inline-block px-[40px] py-2  text-white rounded-md mt-4  hover:bg-slate-700 ms-[20px]"
              >
                {translate("Add New")}
              </button>
            </form>
          </FormProvider>
        </div>
        <div className="w-full lg:w-3/5">
          {isLoading ? (
            <div>Loading...</div>
          ) : examNameError ? (
            <div>Error: {examNameError.message}</div>
          ) : (
            <SortableTable columns={tableTitleHeaders} data={examNames} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Exam;
