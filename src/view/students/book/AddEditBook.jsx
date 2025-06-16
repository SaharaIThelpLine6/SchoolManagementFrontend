import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ThemeInputBox1 from "../../../components/Forms/ThemeInputBox1";
import SelectBox1 from "../../../components/Forms/SelectBox1";
import useTranslate from "../../../utils/Translate";

const AddEditBook = ({ editData, onCancelEdit }) => {
  const methods = useForm();
  const translate = useTranslate();
  const [isEditing, setIsEditing] = useState(false);

  const { handleSubmit, reset, setValue } = methods;

  // Initialize form with edit data if available
  useEffect(() => {
    if (editData) {
      setIsEditing(true);
      setValue("SubClassEng", editData.SubClassEng || "");
      setValue("SubClass", editData.SubClass || "");
      setValue("SubClassAra", editData.SubClassAra || "");
      setValue("ClassID", editData.ClassID || "");
    } else {
      setIsEditing(false);
    }
  }, [editData, setValue, reset]);

  const onSubmit = (data) => {
    if (isEditing) {
      // Handle edit logic
      console.log("Editing book:", data);
      // Call your edit API here
    } else {
      // Handle add logic
      console.log("Adding new book:", data);
      // Call your add API here
    }
    resetForm();
  };



  const classList = []; // Your class list data

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* First Column */}
          <div className="space-y-4">
            <div>
              <ThemeInputBox1
                label={"User ID"}
                registerKey={"SubClassEng"}
                type={"text"}
                require={"User ID is required"}
              />
            </div>
            
            <div>
              <ThemeInputBox1
                label={"Book Name"}
                registerKey={"SubClass"}
                require={"Book Name is required"}
                type={"text"}
              />
            </div>
          </div>

          {/* Second Column */}
          <div className="space-y-4">
            <div>
              <SelectBox1
                label={"মারহালা/ক্লাশ:"}
                options={classList}
                valueField={"ClassID"}
                nameField={"ClassName"}
                registerKey={"ClassID"}
                require={"Class is required"}
                type={"number"}
              />
            </div>
            
            <div>
              <ThemeInputBox1
                label={"عربي"}
                registerKey={"SubClassAra"}
                type={"text"}
              />
            </div>
          </div>
        </div>

        {/* Button Group */}
        <div className="flex flex-wrap gap-4 mt-8">
          <button
            type="submit"
            className="bg-theme-color transition ease-linear font-bold duration-500 px-10 py-3 text-white rounded-md hover:bg-[#121212] font-SolaimanLipi"
          >
            {isEditing ? translate("Update") : translate("Save")}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 transition ease-linear duration-500 font-bold px-10 py-3 text-white rounded-md hover:bg-gray-700 font-SolaimanLipi"
            >
              {translate("Cancel")}
            </button>
          )}
        
        </div>
      </form>
    </FormProvider>
  );
};

export default AddEditBook;