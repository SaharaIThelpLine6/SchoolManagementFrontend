import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { IoMdSettings } from "react-icons/io";
import { useCallback } from "react";
import { showModal } from "../utils/ModalControlar";
import SortableTable from "../components/Tables/SortableTable";
import { FiEdit } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import RadioOption from "../components/Radio/RadioOption";
import SingleAdmitCardPdf from "../view/exam/AdmitCardPdf/SingleAdmitCardPdf";
import ColoredSingleAdmitCardPdf from "../view/exam/AdmitCardPdf/ColoredSingleAdmitCardPdf";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import { useGetExamNamesQuery } from "../features/student/studentQuerySlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";

const ExamAdmitCard = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const { data: sessionData } = useGetSessionsQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassData } = useGetSubClassListQuery();

  const { handleSubmit } = methods;
  const classListData = null;
  const genderOptions = null;

  const onSubmit = (data) => {
    console.log(data);
  };
  const handleOpenModal = useCallback(() => {
    showModal("Exam Report Setting", "EXAM_REPORT_SETTING");
  }, []);
  // Constants for clean code
  const colorOptions = [
    { id: "poriyat", label: "সাদা-কালা" },
    { id: "hifz", label: "রঙিন" },
    { id: "printed", label: "প্রেসে ছাপানো কাগজে" },
  ];
  const selectOptions = [
    { id: "allStudents", label: "সকল শিক্ষার্থী" },
    { id: "aladaEntry", label: "আলাদা এন্ট্রি" },
  ];
  const reportOptions = [
    { id: "1", label: "1. A5 কাগজের ১টি বাংলা" },
    { id: "2", label: "2. A4 কাগজের ২টি বাংলা" },
    { id: "3", label: "3. A4 কাগজের ৪টি বাংলা" },
    { id: "4", label: "4. A4 কাগজের ৬টি বাংলা" },
    { id: "5", label: "5. A4 কাগজের ২টি বাংলা" },
    { id: "6", label: "6. A4 কাগজের ৪টি বাংলা" },
    { id: "7", label: "7. A4 কাগজের ৬টি বাংলা" },
    { id: "8", label: "8. A4 কাগজের ৪টি বাংলা" },
  ];

  const selectedClassID = watch("classType");

  const tableData = [
    {
      ExamID: 1,
      ExamName: "Half Yearly Exam",
      ExamAraName: "الامتحان نصف السنوي",
      ExamEngName: "Half Yearly Exam",
    },
    {
      ExamID: 2,
      ExamName: "Annual Exam",
      ExamAraName: "الامتحان السنوي",
      ExamEngName: "Annual Exam",
    },
    {
      ExamID: 3,
      ExamName: "Monthly Test",
      ExamAraName: "الاختبار الشهري",
      ExamEngName: "Monthly Test",
    },
    {
      ExamID: 4,
      ExamName: "Mid Term Exam",
      ExamAraName: "امتحان منتصف الفصل",
      ExamEngName: "Mid Term Exam",
    },
    {
      ExamID: 5,
      ExamName: "Final Exam",
      ExamAraName: "الامتحان النهائي",
      ExamEngName: "Final Exam",
    },
  ];
  const tableTitleHeaders = [
    {
      title: translate("Action"),
      field: "ID",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <button
            className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            title={translate("Delete")}
            onClick={() => handleExamNameDelete(row.ExamID)}
          >
            <MdDelete className="w-5 h-5" />
          </button>
        </div>
      ),
    },
    {
      title: translate("Sequential"),
      field: "row_num", // dummy field
      hozAlign: "left",
      formatter: "rownum",
      width: 100,
    },
    {
      title: translate("User Code"),
      field: "ExamAraName",
      hozAlign: "left",
      unicode: false,
    },
    {
      title: translate("Student Name"),
      field: "ExamAraName",
      hozAlign: "left",
      unicode: false,
    },
    {
      title: translate("Class/Jamaat"),
      field: "ExamAraName",
      hozAlign: "left",
      unicode: false,
    },
  ];
  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header flex items-center justify-between mb-6">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Exam List Made")}
        </h3>
        {/* <Button onClick={handleOpenModal}>
          {translate("Talent Condition")}
        </Button> */}
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 my-5">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {selectOptions.map((option) => (
            <RadioOption
              key={option.id}
              option={option}
              register={methods.register}
              name="classType"
              labelClassName="text-xl"
            />
          ))}
        </div>

        <div className="w-full sm:w-auto pt-2 sm:pt-0 flex justify-end">
          <button
            className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition"
            aria-label="Settings"
            onClick={handleOpenModal}
          >
            <IoMdSettings className="text-2xl text-gray-700" />
          </button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <DefaultSelect
              label={translate("Session") + " :"}
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
              unicode
            />
            <DefaultSelect
              label={translate("Exam Name") + " :"}
              options={examNameData ?? []}
              valueField="ExamID"
              nameField="ExamName"
              registerKey="ExamID"
              unicode
            />
            {selectedClassID !== "aladaEntry" && (
              <DefaultSelect
                label={translate("Class/Jamaat") + ":"}
                options={subClassData ?? []}
                valueField="SubClass"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode
              />
            )}
            <DefaultSelect
              label={translate("Residential") + " :"}
              nameField="ResidentialName"
              registerKey="RDID"
              valueField="RDID"
              options={residentialData ?? []}
              require={"This Field is required"}
              unicode={true}
            />
            <DefaultSelect
              label={translate("Report Type") + ":"}
              options={reportOptions}
              valueField="id"
              nameField="label"
              registerKey="ReportID"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {/* Left Section: Color Selection & Printer */}
            <div className="flex flex-row items-start gap-4">
              {/* Color Selection Fieldset */}
              <fieldset className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm w-full sm:max-w-[400px]">
                <legend className="text-gray-700 font-medium px-2 text-sm sm:text-base">
                  কালার নির্বাচন করুন:
                </legend>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-2">
                  {colorOptions.map((option) => (
                    <RadioOption
                      key={option.id}
                      option={option}
                      register={methods.register}
                      name="classType"
                    />
                  ))}
                </div>
              </fieldset>

              {/* Printer Icon */}
              <div className="p-2 self-start sm:self-center">
                <img
                  src="/printer.png"
                  alt="Printer Icon"
                  className="w-8 h-8 sm:w-10 sm:h-10"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-start items-start gap-4">
            {/* Student ID Input */}
            <div className="w-48">
              <DefaultInput
                valueField="id"
                nameField="value"
                registerKey="gender"
                label={translate("Student ID")}
              />
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <Button type="submit">{translate("Save")}</Button>
            </div>
          </div>
        </form>
      </FormProvider>

      <div className="my-5">
        <SortableTable
          columns={tableTitleHeaders}
          data={tableData}
          isFilterColumn={false}
        />
      </div>
    </div>
    // <ColoredSingleAdmitCardPdf />
    // <SingleAdmitCardPdf />
  );
};

export default ExamAdmitCard;
