import { FormProvider, useForm } from "react-hook-form";
import DefaultInput from "../../components/Forms/DefaultInput";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";
import useTranslate from "../../utils/Translate";

const EditStudentReport = ({ id }) => {
  const translate = useTranslate();
  const methods = useForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data) => {};

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="mx-auto max-w-4xl print:hidden p-4"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-blue-600 uppercase font-SolaimanLipi">
          {translate("Character Report")}
        </h1>
        <div className="grid xl:grid-cols-4 gap-4 md:gap-6 mb-6">
          <input
            {...methods.register("SubClassID", {
              required: "Class ID is required",
            })}
            className="hidden"
            aria-hidden="true"
          />

          <div className="relative">
            <label
              htmlFor="StudentCode"
              className="mb-1 block text-black font-SolaimanLipi"
            >
              <span className="text-red-500">{translate("User Code")} * :</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...methods.register("StudentCode", {
                  required: "User Code is required",
                })}
                className="w-full rounded border-[1.5px] border-gray-300 bg-gray-100 px-2 h-[38px] text-black outline-none text-[14px] transition focus:border-blue-500 active:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-200"
                autoComplete="off"
                aria-required="true"
                aria-label={translate("User Code")}
              />
            </div>
          </div>
          <DefaultInput
            registerKey={"StudentName"}
            label="Student Name"
            disable={true}
            aria-label={translate("Student Name")}
          />
          <DefaultInput
            registerKey={"FatherName"}
            label="Father Name"
            disable={true}
            aria-label={translate("Father Name")}
          />
          <DefaultInput
            registerKey={"ClassName"}
            label="Class"
            disable={true}
            aria-label={translate("Class")}
          />
          <DatePickerOne
            dateCalender="Date"
            placeholder={""}
            registerKey={"Date"}
            require={"Date is required"}
            aria-label={translate("Date")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-6 mb-6">
          <div>
            <label className="block text-[16px] font-normal text-gray-700 mb-1 md:mb-2 font-SolaimanLipi">
              {translate("Remark")}:
            </label>
            <textarea
              {...methods.register("Remark", {
                required: "Remark is required",
              })}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              aria-label={translate("Remark")}
            />
            {errors.Remark && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.Remark.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="inline-block text-center bg-blue-500 text-white py-2 md:py-3 px-6 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm md:text-base"
          >
            View Report
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default EditStudentReport;
