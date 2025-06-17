import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ThemeInputBox1 from "../../../components/Forms/ThemeInputBox1";
import SelectBox1 from "../../../components/Forms/SelectBox1";
import useTranslate from "../../../utils/Translate";
import { 
  useGetSubClasssQuery,
  useCreateAcademicSubjectMutation,
  useUpdateAcademicSubjectMutation,
  useGetAcademicSubjectsQuery
} from "../../../features/class/classQuerySlice";
import Swal from "sweetalert2";

const AddEditBook = ({ id }) => {
  const methods = useForm();
  const translate = useTranslate();
  const [isEditing, setIsEditing] = useState(!!id);
  const { handleSubmit, reset, setValue } = methods;

  // RTK Query hooks
  const { data: subClassData, isLoading: isSubClassLoading } = useGetSubClasssQuery();
  const { data: academicSubjects = [] } = useGetAcademicSubjectsQuery();
  const [createSubject, { isLoading: isCreating }] = useCreateAcademicSubjectMutation();
  const [updateSubject, { isLoading: isUpdating }] = useUpdateAcademicSubjectMutation();

  // Find the subject to edit if id is provided
  const editData = id ? academicSubjects.find(subject => subject.SubjectID == id) : null;

  const resetForm = () => {
    reset();
    // if (onCancelEdit) onCancelEdit();
  };

  // Initialize form with edit data if available
  useEffect(() => {
    if (editData) {
      setIsEditing(true);
      setValue("SubjectID", editData.SubjectID);
      setValue("SubSerial", editData.SubSerial || "");
      setValue("SubClassID", editData.SubClassID || "");
      setValue("SubjectName", editData.SubjectName || "");
      setValue("ArabicSubject", editData.ArabicSubject || "");
      setValue("EngSubjectName", editData.EngSubjectName || "");
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [editData, setValue, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEditing && editData) {
        // Handle edit
        await updateSubject({
          id: editData.SubjectID,
          ...data
        }).unwrap();
        
        Swal.fire({
          title: translate("Success"),
          text: translate("Subject updated successfully"),
          icon: "success"
        });
      } else {
        // Handle create
        await createSubject(data).unwrap();
        
        Swal.fire({
          title: translate("Success"),
          text: translate("Subject created successfully"),
          icon: "success"
        });
      }
      
      resetForm();
      // if (refetchSubjects) refetchSubjects();
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: translate("Error"),
        text: error.data?.message || translate("Something went wrong"),
        icon: "error"
      });
    }
  };

  // if (isSubClassLoading) return <Loading />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Column */}
          <div className="space-y-4">
          

            <div >
              <ThemeInputBox1
                label={translate("Serial Number")}
                registerKey={"SubSerial"}
                require={translate("Serial is required")}
                type={"number"}
              />
            </div>

            <div >
              <SelectBox1
                label={translate("Class Group")}
                options={subClassData || []}
                valueField={"SubClassID"}
                nameField={"SubClass"}
                registerKey={"SubClassID"}
                require={translate("Class group is required")}
              />
            </div>
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            <div >
              <ThemeInputBox1
                label={translate("Subject Name")}
                registerKey={"SubjectName"}
                require={translate("Subject name is required")}
                type={"text"}
              />
            </div>

       

            <div >
              <ThemeInputBox1
                label={translate("Arabic Name")}
                registerKey={"ArabicSubject"}
                type={"text"}
              />
            </div>
          </div>
        </div>

        {/* Button Group */}
        <div className="flex flex-wrap gap-4 mt-8">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="bg-theme-color transition ease-linear font-bold duration-500 px-10 py-3 text-white rounded-md hover:bg-[#121212] font-SolaimanLipi disabled:opacity-50"
          >
            {(isCreating || isUpdating) ? (
              <span className="flex items-center justify-center">
                {isEditing ? translate("Updating...") : translate("Creating...")}
              </span>
            ) : (
              isEditing ? translate("Update") : translate("Save")
            )}
          </button>

        </div>
      </form>
    </FormProvider>
  );
};

export default AddEditBook;