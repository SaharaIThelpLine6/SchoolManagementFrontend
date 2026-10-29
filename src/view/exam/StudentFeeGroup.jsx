import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageName } from "../../features/auth/authSlice";
import { useLocation } from "react-router-dom";
import useTranslate from "../../utils/Translate";
import { showModal } from "../../utils/ModalControlar";

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

/* ---------------- পরীক্ষার রিপোর্ট পেজের কালার প্যালেট ---------------- */
const C = {
  gradient: "bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#06B6D4]",
  panel: "bg-[#FAF5FF]",
  panelBorder: "border-[#E9D5FF]",
  primary: "bg-[#7C3AED] hover:bg-[#6D28D9] text-white",
};

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

  const onSubmit = async (data) => {
    try {
      if (!data.FundID || !data.GLID || !data.SLID || !data.SFGNID) {
        Swal.fire({
          icon: "warning",
          title: "ফর্ম অসম্পূর্ণ",
          text: "অনুগ্রহ করে সাব লেজার নির্বাচন করুন এবং অন্তত একজন শিক্ষার্থী সিলেক্ট করুন।",
          confirmButtonColor: "#7C3AED",
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
          confirmButtonColor: "#7C3AED",
        });
      } else {
        // Create new record
        const response = await postStudentFeeGroup(payload).unwrap();
        Swal.fire({
          icon: "success",
          title: "সফলভাবে সংরক্ষণ হয়েছে",
          text: response?.message || "গ্রুপ পরিবর্তন সফল হয়েছে।",
          confirmButtonColor: "#7C3AED",
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
        confirmButtonColor: "#7C3AED",
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
      confirmButtonColor: "#7C3AED",
      confirmButtonText: "হ্যাঁ, ডিলিট করুন",
      cancelButtonText: "না, বাতিল",
    });

    if (result.isConfirmed) {
      try {
        await deleteStudentFeeGroup(id).unwrap();
        Swal.fire({
          icon: "success",
          title: "ডিলিট সম্পন্ন!",
          text: "রেকর্ড সফলভাবে ডিলিট হয়েছে।",
          confirmButtonColor: "#7C3AED",
        });
        refetch();
      } catch (error) {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "ব্যর্থ হয়েছে!",
          text: "রেকর্ড ডিলিট করা যায়নি।",
          confirmButtonColor: "#7C3AED",
        });
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
      render: (row) => (
        <span className="font-bold text-[#6D28D9]">{row?.SLID}</span>
      ),
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
    <div className="font-SolaimanLipi bg-white rounded-xl shadow-lg overflow-hidden">
      {/* ---------------- গ্রেডিয়েন্ট হেডার ---------------- */}
      <div className={`${C.gradient} px-5 py-4 text-white`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
              <SvgIcon name="FaPlus" size={18} />
            </div>
            <div>
              <h3 className="text-base sm:text-[20px] font-bold leading-tight">
                {translate("Student Fee Group")}
              </h3>
              <p className="text-xs sm:text-sm text-white/80">
                ফান্ড ও লেজার বেছে নিয়ে ফি-র নাম (সাব লেজার) গ্রুপে যুক্ত করুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editingId && (
              <span className="px-3 py-1.5 rounded-md text-xs font-bold bg-white/20 border border-white/30">
                সম্পাদনা করছেন
              </span>
            )}
            <button
              type="button"
              onClick={() => onBack(false)}
              className="bg-white text-[#6D28D9] font-bold text-sm px-4 py-2 rounded-lg shadow hover:bg-[#F5F3FF] transition"
            >
              {translate("Back")}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-4">
        {/* ---------------- ফর্ম প্যানেল ---------------- */}
        <FormProvider {...methods}>
          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <div className={`${C.panel} border ${C.panelBorder} rounded-xl p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {/* Right Column */}
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-row items-center gap-2">
                    <div className="flex-1">
                      <DefaultSelect
                        label={`${translate("Sub Ledger (Fee Name)")}:`}
                        nameField="SlName"
                        registerKey="SLID"
                        valueField="SLID"
                        options={viewSubLedgersData ?? []}
                        require="This Field is required"
                        unicode={true}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubsidiary}
                      title={translate("Sub Ledger (Fee Name)")}
                      className="mt-7 h-[42px] w-[42px] shrink-0 flex items-center justify-center rounded-md bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#EDE9FE] transition"
                    >
                      <SvgIcon name={"FaPlus"} size={14} />
                    </button>
                  </div>

                  <DefaultSelect
                    label={translate("Type") + " :"}
                    options={feeGroupNamesData ?? []}
                    valueField="SFGNID"
                    nameField="SFGName"
                    registerKey="SFGNID"
                  />
                </div>
              </div>

              {/* অ্যাকশন বাটন */}
              <div className="mt-4 pt-3 border-t border-[#E9D5FF] flex items-center justify-end gap-2 flex-wrap">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-[38px] px-4 rounded-md text-sm font-bold bg-white text-[#6D28D9] border border-[#DDD6FE] hover:bg-[#F5F3FF] transition"
                  >
                    {translate("Cancel")}
                  </button>
                )}
                <button
                  type="submit"
                  className={`h-[38px] px-5 rounded-md text-sm font-bold ${C.primary} transition`}
                >
                  {editingId ? translate("Update") : translate("Save")}
                </button>
              </div>
            </div>
          </form>
        </FormProvider>

        {/* ---------------- তালিকা ---------------- */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
            <h4 className="text-sm font-bold text-[#5B21B6]">
              {translate("Student Fee Group")} — তালিকা
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#7C3AED] text-white">
              {studentFeeGroupsData.length}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-sm font-medium text-[#6D28D9]">
              লোড হচ্ছে...
            </div>
          ) : isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
              তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              <SortableTable
                columns={columns}
                data={paginatedData}
                isFilterColumn={false}
              />

              <DefaultPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="rounded-xl bg-[#F5F3FF] text-[#6D28D9] border border-[#DDD6FE] px-4 py-8 text-center text-sm font-medium">
              কোনো তথ্য পাওয়া যায়নি
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentFeeGroup;
