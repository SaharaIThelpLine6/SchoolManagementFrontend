import { useEffect } from "react";
import { useDispatch } from "react-redux";
import SelectGroupOne from "../components/Forms/SelectGroup/SelectGroupOne";
import { useFormContext } from "react-hook-form";
import DefaultInput from "../components/Forms/DefaultInput";


const AddStudent = ({ pageTitle }) => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    dispatch({ type: "SET_PAGE_TITLE", payload: pageTitle });
  }, [pageTitle, dispatch]);
  const onSubmit = (data) => console.log(data)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="font-lato">
      <h1 className="mb-3">{pageTitle}</h1>
      <div className="p-6.5">
        <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
          <DefaultInput label={"First Name"} type={'text'} placeholder={"Enter Student First Name"} registerKey={"first_name"} require={"First Name Not Found"}  />

          <DefaultInput label={"Last Name"} type={'text'} placeholder={"Enter Student Last Name"} registerKey={"lastname_name"} />
        </div>

        <div className="mb-4.5">
          <DefaultInput label={"Email"} type={'email'} placeholder={"Enter Student Email"} registerKey={"student_email"} />
        </div>

        <button className="text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 mt-4" type="submit">
          Submit
        </button>
      </div>
    </form>
  )
}
export default AddStudent