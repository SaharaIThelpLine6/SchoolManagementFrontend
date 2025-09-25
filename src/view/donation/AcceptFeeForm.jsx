import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormProvider, useForm } from "react-hook-form";
import Swal from "sweetalert2";
import DefaultInput from "../../components/Forms/DefaultInput";
import Button from "../../components/Button/Button";
import LoadingComponent from "../../components/LoadingComponent";
import {
  usePostStudentsTransferCertificateMutation,
  useGetStudentBySearchQuery,
  useGetExamNamesQuery,
} from "../../features/student/studentQuerySlice";
import { setFilteredStudent } from "../../features/student/studentSlice";
import bnBijoy2Unicode from "../../utils/conveter";
import { showModal } from "../../utils/ModalControlar";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../features/class/classQuerySlice";
import useTranslate from "../../utils/Translate";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";
import SvgIcon from "../../components/icons/SvgIcon";

const AcceptFeeForm = ({ onBack }) => {
  const dispatch = useDispatch();
  const methods = useForm();
  const translate = useTranslate();
  const { reset, watch } = methods;
  const { filteredStudent } = useSelector((state) => state.student);

  // State for student search
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const studentCodeOrName = watch("StudentCode");

  // API Hooks
  const [postCertificate, { isLoading: isPosting }] =
    usePostStudentsTransferCertificateMutation();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const { data: examNamesData } = useGetExamNamesQuery();
  const { data: searchStudentInfo, error: searchStudentError } =
    useGetStudentBySearchQuery(
      { search: studentCodeOrName, ClassID: null, SessionID: null },
      { skip: !userTyping, refetchOnFocus: false }
    );

  // Handle student search suggestions
  useEffect(() => {
    if (
      studentCodeOrName &&
      searchStudentInfo?.length > 0 &&
      !searchStudentError
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchStudentInfo, searchStudentError]);

  // Handle when student is selected from search
  useEffect(() => {
    if (filteredStudent) {
      setUserTyping(false);

      const fullAddress = `গ্রাম: ${bnBijoy2Unicode(
        filteredStudent.permanentVill || ""
      )}, ডাক: ${bnBijoy2Unicode(
        filteredStudent.permanentPost || ""
      )}, থানা: ${bnBijoy2Unicode(
        filteredStudent.PoliceStationName || ""
      )}, জেলা: ${bnBijoy2Unicode(
        filteredStudent.PermanentDistrictName || ""
      )}`;

      reset({
        UserID: filteredStudent.UserID,
        CreateAt: filteredStudent.CreateAt?.split("T")[0] || "",
        StudentCode: filteredStudent.StudentCode,
        name: bnBijoy2Unicode(filteredStudent.StudentName),
        fatherName: bnBijoy2Unicode(filteredStudent.FatherName),
        motherName: bnBijoy2Unicode(filteredStudent.MotherName),
        admissionNumber: filteredStudent.StudentCode,
        birthDate: filteredStudent.DateOfBirth?.split("T")[0] || "",
        description: fullAddress,
      });
    }
  }, [filteredStudent, reset]);

  const handleSuggestionClick = (item) => {
    setUserTyping(false);
    dispatch(setFilteredStudent(item));
    setShowSuggestions(false);
  };

  const handleOpenModal = useCallback(() => {
    dispatch(setFilteredStudent(null));
    setShowSuggestions(false);
    showModal("Filter Student", "STUDENT_FILTER");
  }, [dispatch]);

  // Submit handler
  const onSubmit = async (data) => {
    try {
      const certificateData = {
        UserID: data.UserID,
        SessionID: watch("SessionID"),
        ExamID: watch("ExamID"),
        ClassIDTo: watch("ClassID"),
        TotalMark: data.totalMarks,
        DivisionName: data.division,
      };

      await postCertificate(certificateData).unwrap();
      Swal.fire("সফল", "সার্টিফিকেট সফলভাবে তৈরি হয়েছে", "success");
      if (onBack) onBack();
      dispatch(setFilteredStudent(null));
      reset();
    } catch (error) {
      Swal.fire("ত্রুটি", "কোনো একটি সমস্যা হয়েছে", "error");
    }
  };

  const handleUserSearchOpenModal = useCallback(() => {
    showModal("User Search", "USER_SEARCH");
  }, []);

  if (isPosting) return <LoadingComponent />;
  const studentResult = "2011-10-28T00:00:00.000Z";

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="bg-white p-6 space-y-8 font-SolaimanLipi"
      >
        {/* Photo & Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Photo and Student Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-36 md:w-48 md:h-56 border-2 border-dashed border-gray-400 flex items-center justify-center text-sm text-gray-500 rounded-lg">
              Photo
            </div>
            <div className="w-full relative">
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {translate("Student Code")}:
              </label>
              <div className="flex gap-2">
                <input
                  {...methods.register("StudentCode", { required: true })}
                  className="w-full rounded-lg border border-gray-300 px-3 h-[38px] bg-gray-100 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  onInput={() => setUserTyping(true)}
                />
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                  title="Filter"
                >
                  <SvgIcon name={"TbFilterPlus"} size={20} />
                </button>
              </div>

              {/* Suggestion Box */}
              {showSuggestions && (
                <div className="absolute z-30 bg-white shadow-md border rounded-md w-full max-h-[220px] overflow-y-auto mt-1">
                  {searchStudentInfo.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                      onClick={() => handleSuggestionClick(item)}
                    >
                      {item.StudentCode} - {bnBijoy2Unicode(item.StudentName)} -{" "}
                      {bnBijoy2Unicode(item.ClassName)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Student Info Fields */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DatePickerOne
              dateCalender="Entry Date"
              placeholder="YYYY-MM-DD"
              registerKey="entryDate"
              require="তারিখ দিন"
              labelPosition="left"
            />
            <DefaultInput
              type="text"
              registerKey={`prescribedFee`}
              labelPosition="left"
              label="Prescribed Fee"
            />

            <DatePickerOne
              dateCalender="Renewal Date"
              placeholder="YYYY-MM-DD"
              registerKey="renewalDate"
              require="তারিখ দিন"
              labelPosition="left"
            />
            <DefaultInput
              type="text"
              registerKey={`total`}
              labelPosition="left"
              label="Total"
            />

            <div className="flex items-center gap-2">
              <DatePickerOne
                dateCalender="Sectors"
                placeholder="YYYY-MM-DD"
                registerKey="sectorDate"
                require="তারিখ দিন"
                labelPosition="left"
              />
              <Button
                type="button"
                //   onClick={handleUserSearchOpenModal}
              >
                <SvgIcon name={"GrDrag"} size={18} />
              </Button>
            </div>

            <DefaultInput
              type="text"
              registerKey="deduction"
              labelPosition="left"
              label="Deduction"
            />
            <DefaultInput
              type="text"
              registerKey="type"
              labelPosition="left"
              label="Type"
            />
            <DefaultInput
              type="text"
              registerKey="grandTotal"
              labelPosition="left"
              label="Grand Total"
            />
            <DefaultInput
              type="text"
              registerKey="subLedger"
              labelPosition="left"
              label="Sub Ledger"
            />
            <DefaultInput
              type="text"
              registerKey="previousBalance"
              labelPosition="left"
              label="Previous Balance"
            />
            <DefaultInput
              type="text"
              registerKey="totalPayable"
              labelPosition="left"
              label="Total Payable"
            />
            <DefaultInput
              type="text"
              registerKey="received"
              labelPosition="left"
              label="Received"
            />
            <DefaultInput
              type="text"
              registerKey="details"
              labelPosition="left"
              label="Details"
            />
            <DefaultInput
              type="text"
              registerKey="due"
              labelPosition="left"
              label="Due"
            />
            <DefaultInput
              type="text"
              registerKey="inWords"
              labelPosition="left"
              label="In Words"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="px-6 py-2 rounded-lg font-SolaimanLipi bg-blue-600 text-white hover:bg-blue-700 transition"
            disabled={isPosting}
          >
            {isPosting ? "লোড হচ্ছে..." : translate("Save")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default AcceptFeeForm;
