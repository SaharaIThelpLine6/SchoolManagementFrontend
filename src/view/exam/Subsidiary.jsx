import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../../utils/Translate";
import { showModal } from "../../utils/ModalControlar";

import Button from "../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import DefaultInput from "../../components/Forms/DefaultInput";
import {
  useGetStudentBySearchQuery,
  usePostChnageStudentGroupMutation,
} from "../../features/student/studentQuerySlice";
import { useGetSessionsQuery } from "../../features/session/sessionSlice";
import { useGetClassListQuery } from "../../features/class/classQuerySlice";
import bnBijoy2Unicode from "../../utils/conveter";
import Swal from "sweetalert2";
import DatePickerOne from "../../components/Forms/DatePicker/DatePickerOne";
import SortableTable from "../../components/Tables/SortableTable";
import { useGetDesignationQuery } from "../../features/teachers/teachersSlice";
import DefaultPagination from "../../components/Pagination/DefaultPagination";
import EditButton from "../../components/Button/EditButton";
import DeleteButton from "../../components/Button/DeleteButton";

const PAGE_SIZE = 10;

const Subsidiary = ({ pageTitle }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const genderOptions = [
    { id: "1", value: "পুরুষ" },
    { id: "2", value: "মহিলা" },
    { id: "3", value: "উভয়" },
  ];

  const SessionID = watch("SessionID");
  const ClassID = watch("ClassID");
  const genderId = watch("gender");
  const {
    data: designation = [],
    isLoading: isdLoading,
    isError: isdError,
  } = useGetDesignationQuery();
  const { data: sessionData } = useGetSessionsQuery();
  const { data: classListData } = useGetClassListQuery();
  const [postChnageStudentGroup, { isLoading, isSuccess, isError }] =
    usePostChnageStudentGroupMutation();

  const selectedClass = classListData?.find((item) => item.ClassID == ClassID); // Use == to avoid type mismatch

  console.log("Selected class:", selectedClass);

  const { data: searchStudentInfo = [], refetch } = useGetStudentBySearchQuery(
    { search: null, ClassID, SessionID, GenderID: genderId },
    {
      skip: !ClassID || !SessionID || !genderId,
      refetchOnFocus: false,
    }
  );

  console.log(selectedRows);

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(designation.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return designation.slice(start, start + PAGE_SIZE);
  }, [designation, currentPage]);
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    try {
      if (!data.SubClassID || selectedRows.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব ক্লাস নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      const response = await postChnageStudentGroup({
        id: data.SubClassID,
        body: { admissionIds: selectedRows },
      }).unwrap();

      Swal.fire({
        icon: "success",
        title: "সফলভাবে সংরক্ষণ হয়েছে",
        text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
      }).then(() => {
        refetch();
        setSelectedRows([]);
        methods.reset();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
      console.error("Error updating student group:", error);
    }
  };
  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">

          <EditButton
           // onClick={() => handleEditOpenModal(row.DNID)}
           />
          <DeleteButton onClick={() => handleDelete(row.DNID)}/>
        </div>
      ),
    },
    {
      title: translate("Chart account"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("ID"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("Sub Ledger"),
      field: "Designation",
      hozAlign: "center",
    },
    {
      title: translate("G Ledger"),
      field: "Designation",
      hozAlign: "center",
    },
  ];

  const handleSubsidiary = () => {
    showModal("Sub Sidiary Ledger", "SUB_SIDIARY");
  };

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-3">
            <DefaultSelect
              label="Fund"
              options={sessionData ?? []}
              valueField="SessionID"
              nameField="SessionName"
              registerKey="SessionID"
            />
            <DefaultSelect
              label="Chart account"
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            <DefaultSelect
              label="Type"
              options={classListData ?? []}
              valueField="ClassID"
              nameField="ClassName"
              registerKey="ClassID"
            />
            <div className="w-full">
              <Button type="submit" className="w-full md:w-auto">
                {translate("Save")}
              </Button>
            </div>
          </div>
          {/* Button */}
        </form>
      </FormProvider>

      <div className="mt-5">
        <SortableTable
          columns={columns}
          data={paginatedData}
          isFilterColumn={false}
        />
      </div>

      <DefaultPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Subsidiary;
