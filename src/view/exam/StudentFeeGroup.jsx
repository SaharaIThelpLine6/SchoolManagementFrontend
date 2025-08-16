import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../../utils/Translate";
import { showModal } from "../../utils/ModalControlar";

import Button from "../../components/Button/Button";
import { FormProvider, useForm } from "react-hook-form";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import Swal from "sweetalert2";
import SortableTable from "../../components/Tables/SortableTable";
import {
  useDeleteStudentFeeGroupMutation,
  useGetFeeGroupNamesQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersQuery,
  useGetStudentFeeGroupsQuery,
  useGetSubLedgerQuery,
  usePostStudentFeeGroupMutation,
  useUpdateStudentFeeGroupMutation,
} from "../../features/feeCollection/feeCollectionSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import bnBijoy2Unicode from "../../utils/conveter";
import DefaultPagination from "../../components/Pagination/DefaultPagination";
import DeleteButton from "../../components/Button/DeleteButton";
import EditButton from "../../components/Button/EditButton";
import SvgIcon from "../../components/icons/SvgIcon";

const PAGE_SIZE = 10;

const StudentFeeGroup = ({ pageTitle, onBack }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const translate = useTranslate();
  const methods = useForm();
  const { watch, handleSubmit, setValue } = methods;
  const [currentPage, setCurrentPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState(null);

  const FundID = watch("FundID");
  const GLID = watch("GLID");

  const { data: fundNamesData } = useGetFundNamesQuery();

  const fundId = FundID ?? skipToken;
  const fundGLID = GLID ?? skipToken;

  const { data: generalLedgerData } = useGetGeneralLedgersQuery(fundId, {
    refetchOnMountOrArgChange: true,
  });
  const { data: viewSubLedgersData } = useGetSubLedgerQuery(fundGLID, {
    refetchOnMountOrArgChange: true,
  });
  const { data: feeGroupNamesData } = useGetFeeGroupNamesQuery();
  const {
    data: studentFeeGroupsData = [],
    isLoading,
    isError,
    refetch,
  } = useGetStudentFeeGroupsQuery();

  console.log(studentFeeGroupsData);

  const [postStudentFeeGroup] = usePostStudentFeeGroupMutation();
  const [deleteStudentFeeGroup] = useDeleteStudentFeeGroupMutation();
  const [updateStudentFeeGroup] = useUpdateStudentFeeGroupMutation();

  useEffect(() => {
    if (pageTitle) dispatch(setPageName(pageTitle));
  }, [dispatch, pageTitle]);

  const totalPages = Math.ceil(studentFeeGroupsData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return studentFeeGroupsData.slice(start, start + PAGE_SIZE);
  }, [studentFeeGroupsData, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    try {
      if (!data.FundID || !data.GLID || !data.SLID || !data.SFGNID) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব লেজার নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
        });
        return;
      }

      const payload = {
        SLID: data.SLID,
        SFGNID: data.SFGNID,
      };

      if (editingId) {
        const response = await updateStudentFeeGroup({
          ID: editingId,
          ...payload,
        }).unwrap();
        Swal.fire({
          icon: "success",
          title: "সফলভাবে আপডেট হয়েছে",
          text: response?.message || "গ্রুপ সফলভাবে আপডেট হয়েছে।",
        });
        console.log(payload);
      } else {
        // Create new record
        const response = await postStudentFeeGroup(payload).unwrap();
        Swal.fire({
          icon: "success",
          title: "সফলভাবে সংরক্ষণ হয়েছে",
          text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
        });
      }

      refetch(); // refetch the list
      methods.reset(); // reset the form
      setEditingId(null); // reset editing state
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি ঘটেছে!",
        text: error?.data?.error || "ডেটা সংরক্ষণ করতে ব্যর্থ হয়েছে।",
      });
    }
  };

  const handleEditStudentGroup = (id) => {
    const selectedGroup = studentFeeGroupsData.find(
      (item) => item.SFGID === id
    );
    if (selectedGroup) {
      setEditingId(id);
      setEditingData(selectedGroup);
      setValue("FundID", selectedGroup.AccSubsidiaryLedger.FundID);
    }
  };
  useEffect(() => {
    if (editingData && generalLedgerData?.length > 0) {
      setValue("GLID", editingData.AccSubsidiaryLedger.GLID);
    }
  }, [editingData, generalLedgerData]);

  useEffect(() => {
    if (editingData && viewSubLedgersData?.length > 0) {
      setValue("SLID", editingData.SLID);
      setValue("SFGNID", editingData.SFGNID);
      setEditingData(null); // done setting all
    }
  }, [editingData, viewSubLedgersData]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "আপনি কি নিশ্চিত?",
      text: "একবার ডিলিট করলে আর ফিরে পাওয়া যাবে না!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, ডিলিট করুন",
      cancelButtonText: "না, বাতিল",
    });

    if (result.isConfirmed) {
      try {
        await deleteStudentFeeGroup(id).unwrap();
        Swal.fire("ডিলিট সম্পন্ন!", "রেকর্ড সফলভাবে ডিলিট হয়েছে।", "success");
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire("ব্যর্থ হয়েছে!", "রেকর্ড ডিলিট করা যায়নি।", "error");
      }
    }
  };

  const handleCancelEdit = () => {
    methods.reset();
    setEditingId(null);
  };

  const columns = [
    {
      title: translate("Action"),
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <DeleteButton onClick={() => handleDelete(row.SFGID)} />
          <EditButton onClick={() => handleEditStudentGroup(row.SFGID)} />
        </div>
      ),
    },
    {
      title: translate("Fee Type"),
      field: "SFGName",
      hozAlign: "center",
      render: (row) => <>{row.AccStudentFeeGroupName?.SFGName}</>,
    },
    {
      title: translate("ID"),
      field: "SLID",
      hozAlign: "center",
    },
    {
      title: translate("Fee Name"),
      field: "Designation",
      hozAlign: "center",
      render: (row) => <>{bnBijoy2Unicode(row.AccSubsidiaryLedger?.SlName)}</>,
    },
  ];

  const handleSubsidiary = () => {
    showModal("Sub Sidiary Ledger", "SUB_SIDIARY");
  };

  return (
    <div className="font-SolaimanLipi bg-white p-6 md:p-4 rounded-xl shadow-lg">
      <div className="filter_header border-b border-[#e9edf4] flex items-center justify-between py-5">
        <h3 className="font-SolaimanLipi text-base sm:text-[20px] font-bold">
          {translate("Student Fee Group")}
        </h3>
        <Button onClick={() => onBack(false)}>{translate("Back")}</Button>
      </div>

      <FormProvider {...methods}>
        <form className="w-full space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
            {/* Left Column */}
            <div className="flex flex-col space-y-4">
              <DefaultSelect
                label={translate("Fund") + " :"}
                options={fundNamesData ?? []}
                valueField="FundID"
                nameField="FundName"
                registerKey="FundID"
                unicode={true}
              />
              <DefaultSelect
                label={translate("General Ledger") + " :"}
                options={generalLedgerData ?? []}
                valueField="GLID"
                nameField="GlName"
                registerKey="GLID"
                unicode={true}
              />
              <div className="flex flex-row items-center justify-center gap-2">
                <DefaultSelect
                  label={`${translate("Sub Ledger (Fee Name)")}:`}
                  nameField="SlName"
                  registerKey="SLID"
                  valueField="SLID"
                  options={viewSubLedgersData ?? []}
                  require="This Field is required"
                  unicode={true}
                />
                <Button
                  onClick={handleSubsidiary}
                  className="bg-[#EDEDED] mt-7 rounded-md py-3"
                >
                  <SvgIcon name={"FaPlus"} size={14} />
                </Button>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col space-y-4">
              <DefaultSelect
                label={translate("Type") + " :"}
                options={feeGroupNamesData ?? []}
                valueField="SFGNID"
                nameField="SFGName"
                registerKey="SFGNID"
              />
              <div className="w-full flex gap-2">
                <Button type="submit" className="w-full mt-7 md:w-auto">
                  {editingId ? translate("Update") : translate("Save")}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full mt-7 md:w-auto bg-gray-500 hover:bg-gray-600"
                  >
                    {translate("Cancel")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </form>
      </FormProvider>

      {isLoading ? (
        <div className="mt-5 text-center text-blue-500 font-medium">
          লোড হচ্ছে...
        </div>
      ) : paginatedData && paginatedData.length > 0 ? (
        <>
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
        </>
      ) : (
        <div className="mt-5 text-center text-gray-500">
          কোনো তথ্য পাওয়া যায়নি
        </div>
      )}
    </div>
  );
};

export default StudentFeeGroup;
