import { useLocation, useNavigate } from "react-router-dom";
import { closeModal } from "../../../features/modal/modalSlice";
import { useDispatch } from "react-redux";
import DefaultSelect from "../../../components/Forms/DefaultSelect";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { useState } from "react";
import useTranslate from "../../../utils/Translate";

const StudentCardModel = () => {

  const navigate = useNavigate();
  const translate = useTranslate();
  const dispatch = useDispatch();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues,
  } = methods;
  const [selectedLayout, setSelectedLayout] = useState(null);

  const handleButtonClick = () => {
    dispatch(closeModal())
    navigate("/students/student-id-card-print?id=1")
  }

  const layouts = [
    { id: "1", image: "/student_id_image.png" },
  ];
  const handleLayoutSelect = (layoutId) => {
    setSelectedLayout(layoutId);
  };
  const onSubmit = (data) => {
    console.log(data);
    dispatch(closeModal());
    navigate("/students/student-id-card-print", {
      state: {
        layoutId: selectedLayout,
        fields: data,
      },
    });
  };


  return (
    <div className="bg-white gap-6 rounded-2xl shadow-md w-full">
      <div className="grid grid-cols-4 gap-4">

        {/* Layout selection */}
        {layouts.map((layout) => (
          <button
            key={layout.id}
            onClick={() => handleLayoutSelect(layout.id)}
            className={`border rounded-xl p-2 ${selectedLayout === layout.id ? "border-blue-500" : ""
              }`}
          >
            <img src={layout.image} alt="layout" />
          </button>
        ))}

      </div>

      {selectedLayout && (
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-2 font-lato mt-5 w-full"
          >
            <div className="grid grid-cols-2 gap-[20px]">


              {[1, 2, 3, 4, 5].map((i) => (
                <DefaultSelect
                  key={i}
                  label={translate(`Field ${i}`)}
                  options={[
                    { ID: "StudentName", Name: "User Name" },
                    { ID: "FatherName", Name: "Father Name" },
                    { ID: "MotherName", Name: "Mother Name" },
                    { ID: "ClassName", Name: "Class Name" },
                    { ID: "Mobile1", Name: "Mobile" },
                    { ID: "SessionName", Name: "Session" },
                    { ID: "BloodGroup", Name: "Blood Group" },
                  ]}
                  registerKey={`Field${i}`}
                  nameField="Name"
                  valueField="ID"
                />
              ))}
            </div>

            <button
              type="submit"
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Preview
            </button>
          </form>
        </FormProvider>
      )}


    </div>
  );


};

export default StudentCardModel;
