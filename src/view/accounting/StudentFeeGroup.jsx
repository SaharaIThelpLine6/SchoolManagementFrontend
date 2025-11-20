import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import useTranslate from "../../utils/Translate";

import Button from "../../components/Button/Button";
import DeleteButton from "../../components/Button/DeleteButton";
import EditButton from "../../components/Button/EditButton";
import DefaultSelect from "../../components/Forms/DefaultSelect";
import SortableTable from "../../components/Tables/SortableTable";
import {
  useDeleteStudentFeeGroupMutation,
  useGetFeeGroupNamesQuery,
  useGetFundNamesQuery,
  useGetGeneralLedgersQuery,
  useGetStudentFeeGroupsQuery,
  useGetSubGeneralLedgersByFundIdAndGlIdQuery,
  usePostStudentFeeGroupMutation,
  useUpdateStudentFeeGroupMutation,
} from "../../features/feeCollection/feeCollectionSlice";
import bnBijoy2Unicode from "../../utils/conveter";

const StudentFeeGroup = () => {
  const translate = useTranslate();
  const methods = useForm();
  const { reset, watch, setValue } = methods;

  // Watch Fund & Chart Account
  const [FundID, GLID] = watch(["FundID", "GLID"]);

  // Queries
  const { data: fundNamesData } = useGetFundNamesQuery();
  const { data: studentFeeGroupData, refetch } = useGetStudentFeeGroupsQuery();
  const { data: feeGroupNamesData } = useGetFeeGroupNamesQuery();
  const { data: generalLedgersData } = useGetGeneralLedgersQuery(FundID, {
    skip: !FundID,
  });
  const { data: subGeneralLedgersData } =
    useGetSubGeneralLedgersByFundIdAndGlIdQuery(
      { fundId: FundID, glid: GLID },
      { skip: !GLID }
    );
  // Mutations
  const [postStudentFeeGroup, { isLoading: isCreating }] =
    usePostStudentFeeGroupMutation();
  const [deleteStudentFeeGroup, { isLoading: isDeleting }] =
    useDeleteStudentFeeGroupMutation();
  const [updateStudentFeeGroup, { isLoading: isUpdating }] =
    useUpdateStudentFeeGroupMutation();

  const [editRow, setEditRow] = useState(null);

  // 🔹 Submit handler
  const onSubmit = async (data) => {
    try {
      const payload = {
        SLID: data.SLID,
        SFGNID: data.SFGNID,
      };

      if (editRow) {
        await updateStudentFeeGroup({
          ID: editRow.SFGID,
          ...payload,
        }).unwrap();
        toast.success(translate("Student Fee Group updated successfully!"));
      } else {

        await postStudentFeeGroup(payload).unwrap();
        toast.success(translate("Student Fee Group created successfully!"));
      }

      // reset(); // form reset
      setEditRow(null);
      refetch(); // refresh table
    } catch (error) {
      toast.error(error?.data?.error || translate("Something went wrong!"));
    }
  };

  // 🔹 Edit
  const handleEditOpen = (row) => {
    setEditRow(row);
    setValue("FundID", row?.AccSubsidiaryLedger?.FundID || "");
    setValue("SFGNID", row?.SFGNID || "");
    setTimeout(() => {
      setValue("GLID", row?.AccSubsidiaryLedger?.GLID || "");
    }, 0);
    setTimeout(() => {
      setValue("SLID", row?.SLID || "");
    }, 5);
  };

  // 🔹 Delete with optimistic update
  const handleDelete = async (SFGID) => {
    try {
      await deleteStudentFeeGroup(SFGID).unwrap();
      toast.success(translate("Student Fee Group deleted successfully!"));
      refetch();
    } catch (error) {
      refetch();
      toast.error(
        error?.data?.message || translate("Failed to delete Student Fee Group")
      );
    }
  };

  // Table columns
  const columns = [
    {
      title: translate("Action"),
      field: "action",
      hozAlign: "center",
      render: (row) => (
        <div className="flex justify-center items-center gap-2">
          <EditButton onClick={() => handleEditOpen(row)} />
          <DeleteButton
            onClick={() => handleDelete(row.SFGID)}
            loading={isDeleting}
          />
        </div>
      ),
    },
    {
      title: translate("Fee Type"),
      field: "FundName",
      hozAlign: "center",
      render: (row) => (
        <p>{bnBijoy2Unicode(row.AccStudentFeeGroupName?.SFGName || "")}</p>
      ),
    },
    {
      title: translate("ID"),
      field: "ChartOfAcName",
      hozAlign: "center",
      render: (row) => <p>{row.SLID}</p>,
    },
    {
      title: translate("Fee Name"),
      field: "GlName",
      hozAlign: "center",
      render: (row) => (
        <p>{bnBijoy2Unicode(row?.AccSubsidiaryLedger?.SlName)}</p>
      ),
    },
  ];

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <DefaultSelect
              label="Fund"
              options={fundNamesData ?? []}
              valueField="FundID"
              nameField="FundName"
              registerKey="FundID"
              unicode={true}
              require={translate("Fund is required!")}
            />
            <DefaultSelect
              label="General Ledger"
              options={generalLedgersData ?? []}
              valueField="GLID"
              nameField="GlName"
              registerKey="GLID"
              unicode={true}
              require={translate("Deposit/Cost is required!")}
            />
            <DefaultSelect
              label="Sub Ledger"
              options={subGeneralLedgersData ?? []}
              valueField="SLID"
              nameField="SlName"
              registerKey="SLID"
              unicode={true}
              require={translate("Deposit/Cost is required!")}
            />
            <DefaultSelect
              label="Type"
              options={feeGroupNamesData ?? []}
              valueField="SFGNID"
              nameField="SFGName"
              registerKey="SFGNID"
            />
            <Button
              loading={isCreating || isUpdating}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              type="submit"
            >
              {editRow ? translate("Update") : translate("Save")}
            </Button>
          </div>
        </form>
      </FormProvider>

      <SortableTable
        columns={columns}
        data={studentFeeGroupData ?? []}
        isFilterColumn={false}
      />
    </>
  );
};

export default StudentFeeGroup;
