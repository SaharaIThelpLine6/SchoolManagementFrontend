import useTranslate from "../utils/Translate";
import Button from "../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../components/Forms/DefaultSelect";
import DefaultInput from "../components/Forms/DefaultInput";
import { useGetSessionsQuery } from "../features/session/sessionSlice";
import { useCallback } from "react";
import { showModal } from "../utils/ModalControlar";
import RadioOption from "../components/Radio/RadioOption";
import { useGetResidentialQuery } from "../features/settings/settingsQuerySlice";
import { useGetExamNamesQuery } from "../features/student/studentQuerySlice";
import { useGetSubClassListQuery } from "../features/class/classQuerySlice";
import { useGetStudentAdmitCardsQuery } from "../features/exam/examQuerySlice";
import { skipToken } from "@reduxjs/toolkit/query";
import AdmitCardRenderer from "../components/AdmitCardRenderer";
import AdmitCardRendererColor from "../components/AdmitCardRendererColor";
import Swal from "sweetalert2";
import SvgIcon from "../components/icons/SvgIcon";

const ExamAdmitCard = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { watch } = methods;
  const { data: sessionData } = useGetSessionsQuery();
  const { data: residentialData } = useGetResidentialQuery();
  const { data: examNameData } = useGetExamNamesQuery();
  const { data: subClassData } = useGetSubClassListQuery();

  const SessionID = watch("SessionID");
  const ExamID = watch("ExamID");
  const SubClassID = watch("SubClassID");
  const RDID = watch("RDID");
  const UserCode = watch("UserCode");

  console.log(
    `SessionId:${SessionID}, ExamId: ${ExamID}, SubClassId:${SubClassID}, RDID: ${RDID}, UserCode:${UserCode}`
  );
  const {
    data: studentAdmitCards = [],
    isLoading,
    isFetching,
    error,
  } = useGetStudentAdmitCardsQuery(
    SessionID && ExamID && SubClassID && RDID
      ? UserCode?.trim()
        ? { SessionID, ExamID, SubClassID, RDID, UserCode }
        : { SessionID, ExamID, SubClassID, RDID }
      : skipToken
  );

  console.log(studentAdmitCards.data, "studentAdmitCards");

  const { handleSubmit } = methods;

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
    // { id: "printed", label: "প্রেসে ছাপানো কাগজে" },
  ];

  const reportOptions = [
    { id: "1", label: "1. A5 কাগজের ১টি বাংলা" },
    { id: "2", label: "2. A4 কাগজের ২টি বাংলা" },
    { id: "3", label: "3. A4 কাগজের ৪টি বাংলা" },
    // { id: "4", label: "4. A5 কাগজের ১টি আরবী" },
    // { id: "5", label: "5. A4 কাগজের ২টি আরবী" },
    // { id: "6", label: "6. A4 কাগজের ৪টি আরবী" },
  ];

  const color = watch("classType");
  const reportType = watch("ReportID");

  const handlePrint = () => {
    const hasData = studentAdmitCards?.data?.length > 0;
    const hasColor = Boolean(color);
    const hasReportType = Boolean(reportType);

    if (hasData && hasColor && hasReportType) {
      window.print();
    } else {
      Swal.fire({
        icon: "warning",
        title: "প্রিন্ট সম্ভব নয়",
        text: "প্রিন্ট করার মতো কোনো তথ্য পাওয়া যায়নি।",
        confirmButtonText: "ঠিক আছে",
      });
    }
  };
  return (
    <>
      <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg hidden_in_print">
        <div className="filter_header flex items-center justify-between mb-6">
          <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
            {translate("Exam List Made")}
          </h3>
          <button
            className="rounded-full p-2 bg-gray-200 hover:bg-gray-300 transition"
            aria-label="Settings"
            onClick={handleOpenModal}
          >
              <SvgIcon
              name={"IoMdSettings"}
              size={20}
              className="text-2xl text-gray-700"
            />

          </button>
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
              <DefaultSelect
                label={translate("Class/Jamaat") + ":"}
                options={subClassData ?? []}
                valueField="SubClassID"
                nameField="SubClass"
                registerKey="SubClassID"
                unicode
              />
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
              {/* Student ID Input */}
              <DefaultInput
                valueField="UserCode"
                nameField="UserCode"
                registerKey="UserCode"
                label={translate("Student ID")}
              />
              <div className="col-span-2">
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
                  <div className="p-2 self-start sm:self-center cursor-pointer">
                    <img
                      src="/printer.png"
                      alt="Printer Icon"
                      className="w-8 h-8 sm:w-10 sm:h-10"
                      onClick={handlePrint}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Left Section: Color Selection & Printer */}
            </div>
            <div className="flex justify-start items-start gap-4">
              {/* Save Button */}
              {/* <div className="pt-6">
                <Button type="submit">{translate("Save")}</Button>
              </div> */}
            </div>
          </form>
        </FormProvider>
      </div>
      <div className="print_canvas">
        {color === "poriyat" && (
          <AdmitCardRenderer type={reportType} data={studentAdmitCards.data} />
        )}
        {color === "hifz" && (
          <AdmitCardRendererColor
            type={reportType}
            data={studentAdmitCards.data}
          />
        )}
        {/* {color === "printed" && (
          <PrePrintedAdmitCardPdf data={studentAdmitCardData} />
        )}  */}
      </div>
    </>
  );
};

export default ExamAdmitCard;
